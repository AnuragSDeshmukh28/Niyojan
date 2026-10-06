from typing import Dict, Any, List
from pydantic import BaseModel

class StudentDashboardData(BaseModel):
    totalAppointments: int
    pendingMediatorCount: int
    approvedCount: int
    upcomingCount: int

class MediatorDashboardData(BaseModel):
    pendingReviewCount: int
    forwardedCount: int
    rejectedCount: int
    documentsPendingCount: int

class PrincipalDashboardData(BaseModel):
    pendingApprovalCount: int
    approvedTodayCount: int
    totalSignedDocuments: int
    rescheduledCount: int

class AdminDashboardData(BaseModel):
    totalUsers: int
    activeUsers: int
    totalAppointments: int
    totalDocuments: int
    systemHealth: str
