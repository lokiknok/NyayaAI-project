import os
import sys
import time
import logging
from typing import Dict, List, Set
from collections import defaultdict

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)

from app.config import settings
from app.database.session import SessionLocal, init_db
from app.rag.retriever import LegalRetriever, INDIAN_LEGAL_SYSTEM_PROMPT
from app.ai.adapter import get_ai_provider
from app.security.validators import sanitize_and_check_prompt_injection

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("nyaya_telegram_bot")

# Track user language preference (default 'en')
USER_LANGUAGES: Dict[int, str] = {}

# Rate limiting: max requests per minute per user
USER_REQUEST_TIMESTAMPS: Dict[int, List[float]] = defaultdict(list)

# Track processed update IDs to guard against duplicate deliveries
PROCESSED_UPDATE_IDS: Set[int] = set()

def check_rate_limit(user_id: int) -> bool:
    """Returns True if within rate limit, False if rate exceeded."""
    now = time.time()
    timestamps = USER_REQUEST_TIMESTAMPS[user_id]
    # Prune timestamps older than 60 seconds
    timestamps = [t for t in timestamps if now - t < 60]
    USER_REQUEST_TIMESTAMPS[user_id] = timestamps

    if len(timestamps) >= settings.TELEGRAM_RATE_LIMIT_PER_MINUTE:
        return False
    timestamps.append(now)
    return True

def split_telegram_message(text: str, max_length: int = 4000) -> List[str]:
    """
    Splits long answers into chunks of <= 4000 characters (Telegram limit is 4096)
    without truncating citations in the middle of a paragraph.
    """
    if len(text) <= max_length:
        return [text]

    chunks = []
    lines = text.split("\n")
    current_chunk = []
    current_length = 0

    for line in lines:
        line_len = len(line) + 1
        if current_length + line_len > max_length:
            if current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = [line]
                current_length = line_len
            else:
                # A single huge line exceeding max_length
                for i in range(0, len(line), max_length):
                    chunks.append(line[i:i + max_length])
                current_length = 0
        else:
            current_chunk.append(line)
            current_length += line_len

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks

# Command Handlers
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles /start command."""
    user = update.effective_user
    name = user.first_name if user else "Friend"
    lang = USER_LANGUAGES.get(user.id, "en") if user else "en"

    if lang == "ta":
        text = (
            f"வணக்கம் {name}! 🙏\n\n"
            "நான் **நியாயாAI (NyayaAI)** — இந்திய சட்டங்களுக்கான உங்கள் AI உதவியாளர்.\n\n"
            "பாரதிய நியாய சன்ஹிதா (BNS), அரசியலமைப்பு, ஒப்பந்த சட்டம் மற்றும் உச்ச நீதிமன்ற தீர்ப்புகள் "
            "குறித்து எந்த சட்ட வினாவையும் என்னிடம் தமிழில் அல்லது ஆங்கிலத்தில் கேட்கலாம்.\n\n"
            "📌 பயனுள்ள கட்டளைகள்:\n"
            "/help - உதவி & பயன்பாட்டு வழிகாட்டி\n"
            "/language - மொழி தேர்வு (English / தமிழ்)\n"
            "/about - நியாயாAI பற்றி\n"
            "/privacy - தனியுரிமை கொள்கை\n"
            "/new - புதிய உரையாடலை தொடங்கவும்"
        )
    else:
        text = (
            f"Namaste {name}! 🙏\n\n"
            "Welcome to **NyayaAI** — Your Indian Legal AI Research Assistant.\n\n"
            "I provide grounded answers on Indian statutes (BNS 2023, BNSS, BSA, Contract Act, IT Act) "
            "and landmark Supreme Court judgments with authoritative citations.\n\n"
            "📌 Available Commands:\n"
            "/help - Usage guidance\n"
            "/language - Switch between English and தமிழ்\n"
            "/about - About NyayaAI knowledge base\n"
            "/privacy - Data privacy & safety\n"
            "/new - Start a fresh conversation"
        )
    await update.message.reply_text(text, parse_mode="Markdown")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles /help command."""
    lang = USER_LANGUAGES.get(update.effective_user.id, "en")
    if lang == "ta":
        text = (
            "📖 **நியாயாAI பயன்பாட்டு வழிகாட்டி**\n\n"
            "1. உங்கள் சட்டக் கேள்வியை நேரடியாக செய்தி வடிவில் அனுப்பவும்.\n"
            "எடுத்துக்காட்டு:\n"
            "• 'BNS மற்றும் IPC வேறுபாடுகள் என்ன?'\n"
            "• 'ஒப்பந்தம் செல்லுபடியாக என்ன தேவை?'\n"
            "• 'முன்ஜாமீன் பெறுவதற்கான நடைமுறை என்ன?'\n\n"
            "2. பதிலை நகலெடுக்கலாம் அல்லது மேற்கோள்களை சரிபார்க்கலாம்.\n"
            "3. மொழியை மாற்ற `/language` கட்டளையைப் பயன்படுத்தவும்."
        )
    else:
        text = (
            "📖 **NyayaAI Legal Help Guide**\n\n"
            "Simply send your legal question directly as a text message.\n\n"
            "Example queries:\n"
            "• 'What are the main differences between BNS 2023 and IPC 1860?'\n"
            "• 'What makes a commercial contract legally binding under the 1872 Act?'\n"
            "• 'What is the procedure for anticipatory bail under BNSS Section 482?'\n"
            "• 'What are the key privacy principles from the Puttaswamy judgment?'\n\n"
            "Commands:\n"
            "/language - Change language\n"
            "/new - Reset session\n"
            "/privacy - Privacy notice"
        )
    await update.message.reply_text(text, parse_mode="Markdown")

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles /about command."""
    text = (
        "⚖️ **About NyayaAI**\n\n"
        "NyayaAI is an AI-powered legal research platform built for India.\n\n"
        "🏛️ **Knowledge Base Coverage:**\n"
        "• Constitution of India (Fundamental Rights & Writs)\n"
        "• Bharatiya Nyaya Sanhita, 2023 (New Penal Law)\n"
        "• Bharatiya Nagarik Suraksha Sanhita, 2023 (Criminal Procedure)\n"
        "• Bharatiya Sakshya Adhiniyam, 2023 (Evidence)\n"
        "• Indian Contract Act, 1872\n"
        "• Consumer Protection Act, 2019\n"
        "• Information Technology Act, 2000\n"
        "• Landmark Supreme Court of India precedents\n\n"
        "⚠️ *Disclaimer: NyayaAI provides educational and legal research information only. "
        "It does not constitute formal legal advice.*"
    )
    await update.message.reply_text(text, parse_mode="Markdown")

async def language_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Toggles or sets language."""
    user_id = update.effective_user.id
    current = USER_LANGUAGES.get(user_id, "en")
    new_lang = "ta" if current == "en" else "en"
    USER_LANGUAGES[user_id] = new_lang

    if new_lang == "ta":
        await update.message.reply_text(
            "✅ மொழி **தமிழுக்கு** மாற்றப்பட்டது! உங்கள் சட்டக் கேள்விகளை தமிழில் கேட்கலாம்.",
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            "✅ Language switched to **English**! You can now send legal inquiries in English.",
            parse_mode="Markdown"
        )

async def new_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Clears context for a new inquiry."""
    lang = USER_LANGUAGES.get(update.effective_user.id, "en")
    msg = "🔄 புதிய உரையாடல் தொடங்கப்பட்டது. உங்கள் கேள்வியை அனுப்பவும்." if lang == "ta" else "🔄 Conversation reset. Send your next legal inquiry."
    await update.message.reply_text(msg)

async def privacy_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Displays privacy notice."""
    text = (
        "🔒 **Privacy & Data Ethics**\n\n"
        "• Your inquiries are strictly processed in-memory for retrieving statutory references.\n"
        "• We do NOT sell or train public AI models on confidential communications.\n"
        "• In accordance with the Advocates Act 1961, NyayaAI operates purely as a research tool."
    )
    await update.message.reply_text(text, parse_mode="Markdown")

# Message Handler
async def text_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Processes incoming legal queries via the RAG pipeline."""
    if not update.message or not update.message.text:
        return

    update_id = update.update_id
    if update_id in PROCESSED_UPDATE_IDS:
        logger.info(f"Skipping duplicate update #{update_id}")
        return
    PROCESSED_UPDATE_IDS.add(update_id)

    user_id = update.effective_user.id
    user_query = update.message.text.strip()
    lang = USER_LANGUAGES.get(user_id, "en")

    # 1. Rate Limiting Check
    if not check_rate_limit(user_id):
        limit_msg = (
            "⚠️ மிக அதிகமான வினாக்கள் அனுப்பப்பட்டுள்ளன. தயவுசெய்து ஒரு நிமிடம் கழித்து முயற்சிக்கவும்."
            if lang == "ta" else
            "⚠️ Rate limit reached. You can send up to 20 queries per minute. Please wait a moment."
        )
        await update.message.reply_text(limit_msg)
        return

    # 2. Security Check (Prompt Injection)
    is_safe, reason = sanitize_and_check_prompt_injection(user_query)
    if not is_safe:
        await update.message.reply_text(
            "⚠️ [Security Notice] Your query contains adversarial instructions. Please submit standard legal questions."
        )
        return

    # Send typing action
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    db = SessionLocal()
    try:
        # Retrieve statutory provisions
        retriever = LegalRetriever(db)
        passages = await retriever.retrieve_relevant_passages(user_query, limit=3)

        # Generate response
        provider = get_ai_provider()
        answer, citations, is_mock = await provider.generate_response(
            prompt=user_query,
            system_prompt=INDIAN_LEGAL_SYSTEM_PROMPT,
            retrieved_passages=passages,
            language=lang
        )

        # Format citations
        if citations:
            citations_header = "\n\n📚 **சரிபார்க்கப்பட்ட மேற்கோள்கள்:**\n" if lang == "ta" else "\n\n📚 **Statutory Citations:**\n"
            citations_text = citations_header + "\n".join([
                f"• **{c['title']}**\n  _{c['quotation'][:150]}..._"
                for c in citations[:3]
            ])
            full_response = answer + citations_text
        else:
            full_response = answer

        # Split into Telegram-safe chunks (<= 4000 chars)
        chunks = split_telegram_message(full_response, max_length=4000)
        for chunk in chunks:
            try:
                await update.message.reply_text(chunk, parse_mode="Markdown")
            except Exception:
                # If markdown parsing fails on special characters, fallback to plain text
                await update.message.reply_text(chunk)

    except Exception as e:
        logger.error(f"Error handling Telegram message: {str(e)}", exc_info=True)
        friendly_err = (
            "மன்னிக்கவும், சட்ட தகவலை மீட்டெடுப்பதில் ஒரு தொழில்நுட்ப சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
            if lang == "ta" else
            "We encountered a temporary error while retrieving legal provisions. Please try again shortly."
        )
        await update.message.reply_text(friendly_err)
    finally:
        db.close()

async def unsupported_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles stickers, voice notes, photos with a friendly explanation."""
    lang = USER_LANGUAGES.get(update.effective_user.id, "en")
    msg = (
        "📌 NyayaAI தற்போது உரைச் செய்திகளை (Text Messages) மட்டுமே ஆதரிக்கிறது. உங்கள் சட்டக் கேள்வியை தட்டச்சு செய்து அனுப்பவும்."
        if lang == "ta" else
        "📌 NyayaAI currently supports text-based legal questions. Please send your query as a text message."
    )
    await update.message.reply_text(msg)

def create_telegram_application() -> Application:
    """Builds the Telegram Application instance."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or token == "your_telegram_bot_token_here":
        raise ValueError("TELEGRAM_BOT_TOKEN is not configured in .env file.")

    app = Application.builder().token(token).build()

    # Commands
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("about", about_command))
    app.add_handler(CommandHandler("language", language_command))
    app.add_handler(CommandHandler("new", new_command))
    app.add_handler(CommandHandler("privacy", privacy_command))

    # Messages
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_message_handler))
    app.add_handler(MessageHandler(~filters.TEXT & ~filters.COMMAND, unsupported_message_handler))

    return app

def main():
    """Main CLI entrypoint for running the bot."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or "your_telegram_bot_token" in token:
        print("\n" + "="*70)
        print("TELEGRAM BOT CONFIGURATION NOTICE:")
        print("TELEGRAM_BOT_TOKEN is not set in your .env file.")
        print("1. Message @BotFather on Telegram to obtain a bot token.")
        print("2. Add TELEGRAM_BOT_TOKEN=<your_token> to .env")
        print("3. Re-run: python -m app.telegram.bot")
        print("="*70 + "\n")
        return

    # Ensure tables are created
    init_db()

    print(f"[*] Starting NyayaAI Telegram Bot with long polling (timeout={settings.TELEGRAM_POLLING_TIMEOUT}s)...")
    app = create_telegram_application()
    app.run_polling(poll_interval=1.0, timeout=settings.TELEGRAM_POLLING_TIMEOUT)

if __name__ == "__main__":
    main()

