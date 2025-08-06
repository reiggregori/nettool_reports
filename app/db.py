import os
import urllib.parse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # carrega variáveis do .env

# --- Lê configuração do .env ---
PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")
PG_HOST = os.getenv("PG_HOST")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB")

# monta e escapa a URL de conexão
user_enc = urllib.parse.quote_plus(PG_USER)
pwd_enc  = urllib.parse.quote_plus(PG_PASSWORD)
DATABASE_URL = f"postgresql+asyncpg://{user_enc}:{pwd_enc}@{PG_HOST}:{PG_PORT}/{PG_DB}"

# cria engine assíncrona, já apontando o search_path para o schema `default`
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"server_settings": {"search_path": "default,public"}}
)

# factory de sessão
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_session() -> AsyncSession: # type: ignore
    """
    Dependência FastAPI: gera e finaliza uma sessão async com o banco.
    Use em `Depends(get_session)` nos seus endpoints.
    """
    async with AsyncSessionLocal() as session:
        yield session