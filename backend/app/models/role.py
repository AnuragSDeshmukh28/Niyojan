import enum
from sqlalchemy import String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class RoleName(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"
    FACULTY = "faculty"
    MEDIATOR = "mediator"
    PRINCIPAL = "principal"
    ADMIN = "admin"

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[RoleName] = mapped_column(SQLEnum(RoleName, native_enum=False), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    users = relationship("User", back_populates="role")
