"""Database connection and session management."""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from config import settings

Base = declarative_base()

# Only create engine if not in mock mode
if not settings.USE_MOCK_DATA:
    try:
        import aiomysql
        # Create async engine
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            future=True,
        )
        
        # Create async session factory
        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    except ImportError:
        # aiomysql not installed, but we're in mock mode so it's OK
        engine = None
        AsyncSessionLocal = None
else:
    engine = None
    AsyncSessionLocal = None


async def get_db() -> AsyncSession:
    """Dependency for getting database session."""
    from config import settings
    if settings.USE_MOCK_DATA:
        # Return a mock session object in mock mode
        class MockSession:
            async def execute(self, *args, **kwargs):
                return None
            async def commit(self):
                pass
            async def refresh(self, *args):
                pass
            def add(self, *args):
                pass
        yield MockSession()
    else:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()


async def init_db():
    """Initialize database - create tables."""
    if settings.USE_MOCK_DATA:
        return

    print(f"Initializing database: {settings.DATABASE_URL}")
    try:
        async with engine.begin() as conn:
            # Create all tables - SQLAlchemy handles checking if they exist
            # but we wrap in try/except just in case of driver-specific issues
            await conn.run_sync(Base.metadata.create_all)
        print("Database initialization complete (tables created or already exist).")
    except Exception as e:
        print(f"Note: Database initialization encountered an issue: {e}")
        print("Continuing startup anyway...")
