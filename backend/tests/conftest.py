import sys
import os
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.config import settings
from app.database.session import Base
from app.core.dependencies import get_db
import app.database.session as session_module

TEST_DB_PATH = Path(__file__).parent / "test_suite.sqlite3"
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH.as_posix()}"

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except Exception:
            pass

    test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    orig_engine = session_module.engine
    orig_session_local = session_module.SessionLocal
    session_module.engine = test_engine
    session_module.SessionLocal = TestingSessionLocal

    Base.metadata.create_all(bind=test_engine)

    from seed import seed_database
    seed_database()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield

    app.dependency_overrides.clear()
    session_module.engine = orig_engine
    session_module.SessionLocal = orig_session_local

    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except Exception:
            pass

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
