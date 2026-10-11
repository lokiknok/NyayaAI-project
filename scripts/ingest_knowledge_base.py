import sys
import os
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.session import init_db, SessionLocal
from app.legal_sources.seed_data import seed_knowledge_base
from app.ai.adapter import get_ai_provider

async def main():
    print("=" * 60)
    print("NyayaAI: Indian Legal Knowledge Base Ingestion Pipeline")
    print("=" * 60)

    print("[*] Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        provider = get_ai_provider()
        print(f"[*] Ingesting statutory texts using AI Provider: {type(provider).__name__}...")
        total_seeded = await seed_knowledge_base(db, provider)
        print(f"[OK] Successfully verified and indexed {total_seeded} core legal sources!")
        print("    - Constitution of India")
        print("    - Bharatiya Nyaya Sanhita (BNS, 2023)")
        print("    - Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023)")
        print("    - Bharatiya Sakshya Adhiniyam (BSA, 2023)")
        print("    - Indian Contract Act, 1872")
        print("    - Consumer Protection Act, 2019")
        print("    - Information Technology Act, 2000")
        print("    - Supreme Court Landmark Judgments (Puttaswamy, D.K. Basu)")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())

