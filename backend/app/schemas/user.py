from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRead(BaseModel):
    id: str
    name: str # maps to full_name for frontend consistency
    email: EmailStr
    role: str
    avatar: Optional[str] = None
    department: Optional[str] = None
    identifier: Optional[str] = None
    phone: Optional[str] = None
    childName: Optional[str] = None # maps to child_name
    childRollNo: Optional[str] = None # maps to child_roll_no
    status: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None
    department: Optional[str] = None
    identifier: Optional[str] = None
    child_name: Optional[str] = None
    child_roll_no: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    identifier: Optional[str] = None
    child_name: Optional[str] = None
    child_roll_no: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserStatusUpdate(BaseModel):
    status: str # active, suspended
