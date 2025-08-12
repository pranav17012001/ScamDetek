from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import os.path
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# Get database credentials from environment variables
DB_HOST="mysql-2d8a3e22-fit5120-main-project.f.aivencloud.com"
DB_USER="avnadmin"
DB_PASSWORD="AVNS_8cQjqg3qifwF01g7Ra5"
DB_NAME="defaultdb"
DB_PORT=25968

# Construct database URL without the ssl-mode parameter
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Path to the certificate file
# Assuming the certificate is stored in a 'certs' directory at the same level as this file
cert_path = os.path.join(os.path.dirname(__file__), "certificates", "ca.pem")

# Create SQLAlchemy engine with proper Aiven MySQL SSL settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=15,
    pool_recycle=1200,
    pool_pre_ping=True,
    pool_timeout=30,
    connect_args={
        "ssl": {
            "ca": cert_path,  # Use the PEM certificate
            "check_hostname": True,  # Enable hostname verification
            "ssl_mode": "REQUIRED",
        }
    },
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
