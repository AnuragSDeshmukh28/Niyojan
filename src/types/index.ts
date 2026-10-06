export type UserRole = 'student' | 'parent' | 'faculty' | 'mediator' | 'principal' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  identifier?: string; // Student Roll No / Employee ID / Registration ID
  phone?: string;
  childName?: string; // For parents
  childRollNo?: string;
  status: 'active' | 'suspended' | 'pending';
}

export type AppointmentStatus =
  | 'PENDING_MEDIATOR'
  | 'FORWARDED_TO_PRINCIPAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'COMPLETED';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface AppointmentHistoryStep {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  timestamp: string;
  comment?: string;
}

export interface AppointmentRequest {
  id: string;
  subject: string;
  category: string;
  description: string;
  requestedBy: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    identifier?: string;
    avatar: string;
  };
  targetPersona: 'Principal' | 'Faculty Head' | 'Administrative Director';
  preferredDate: string;
  preferredTime: string;
  priority: PriorityLevel;
  status: AppointmentStatus;
  mediatorRemarks?: string;
  principalRemarks?: string;
  scheduledSlot?: string;
  attachmentName?: string;
  attachmentSize?: string;
  createdAt: string;
  updatedAt: string;
  history: AppointmentHistoryStep[];
}

export type DocumentStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED_BY_MEDIATOR'
  | 'APPROVED_BY_PRINCIPAL'
  | 'REJECTED';

export interface DocumentApproval {
  id: string;
  docTitle: string;
  docCategory: string; // 'Bonafide Certificate', 'Fee Waiver Application', 'Medical Leave', 'NOC', 'Transcript Request'
  submittedBy: {
    id: string;
    name: string;
    role: UserRole;
    identifier: string;
    avatar: string;
  };
  submittedDate: string;
  fileSize: string;
  fileType: string;
  status: DocumentStatus;
  mediatorNote?: string;
  principalNote?: string;
  digitalStampVerified: boolean;
  approvalReferenceNo?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: 'CREATE_APPOINTMENT' | 'MEDIATOR_FORWARD' | 'PRINCIPAL_APPROVE' | 'REJECT_REQUEST' | 'VERIFY_DOCUMENT' | 'USER_ROLE_CHANGE' | 'SYSTEM_CONFIG';
  details: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'appointment' | 'document' | 'system';
}

export interface DepartmentMetric {
  name: string;
  totalRequests: number;
  approvedCount: number;
  avgResponseHours: number;
}
