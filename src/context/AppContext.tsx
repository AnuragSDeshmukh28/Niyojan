import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  User,
  AppointmentRequest,
  DocumentApproval,
  AuditLog,
  NotificationItem,
} from '../types';
import { apiClient, SEED_CREDENTIALS } from '../services/api';

interface AppContextType {
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole) => Promise<void>;
  currentUser: User | null;
  appointments: AppointmentRequest[];
  documents: DocumentApproval[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  
  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<boolean>;
  refreshAllData: () => Promise<void>;

  createAppointment: (data: Omit<AppointmentRequest, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>) => Promise<void>;
  forwardAppointmentByMediator: (id: string, remarks: string) => Promise<void>;
  approveAppointmentByPrincipal: (id: string, slotTime: string, remarks: string) => Promise<void>;
  rejectAppointment: (id: string, remarks: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newTime: string, remarks: string) => Promise<void>;
  
  uploadDocument: (data: { docTitle: string; docCategory: string; file?: File }) => Promise<void>;
  verifyDocumentByMediator: (id: string, note: string) => Promise<void>;
  approveDocumentByPrincipal: (id: string, note: string) => Promise<void>;
  
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Search & Navigation modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentApproval[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Auth Check & Data Load
  useEffect(() => {
    const initSession = async () => {
      const storedUserStr = localStorage.getItem('niyojan_user');
      const token = localStorage.getItem('niyojan_access_token');

      if (storedUserStr && token) {
        try {
          const userObj = JSON.parse(storedUserStr);
          setCurrentUser(userObj);
          setCurrentRoleState(userObj.role);
          await loadDataForUser(userObj.role);
          return;
        } catch (e) {
          console.error("Session restore error:", e);
        }
      }

      // Default: Stay unauthenticated when no session exists in localStorage
      setCurrentUser(null);
      setCurrentRoleState(null);
    };

    initSession();
  }, []);

  const loadDataForUser = async (role: UserRole) => {
    setIsLoading(true);
    try {
      // 1. Load Appointments
      let aptEndpoint = '/appointments';
      if (role === 'mediator') aptEndpoint = '/mediator/appointments';
      else if (role === 'principal') aptEndpoint = '/principal/appointments';
      
      const aptRes = await apiClient.get(aptEndpoint);
      setAppointments(aptRes.data);

      // 2. Load Documents
      let docEndpoint = '/documents';
      if (role === 'mediator') docEndpoint = '/mediator/documents';
      else if (role === 'principal') docEndpoint = '/principal/documents';

      const docRes = await apiClient.get(docEndpoint);
      setDocuments(docRes.data);

      // 3. Load Notifications
      const notifRes = await apiClient.get('/notifications');
      setNotifications(notifRes.data);

      // 4. Load Audit Logs (for admin/principal)
      if (role === 'admin') {
        const auditRes = await apiClient.get('/admin/audit-logs');
        setAuditLogs(auditRes.data);
      } else {
        const actRes = await apiClient.get('/users/me/activity');
        setAuditLogs(actRes.data.map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          actorName: currentUser?.name || 'User',
          actorRole: role,
          actionType: l.actionType,
          details: l.details,
          ipAddress: l.ipAddress
        })));
      }
    } catch (err: any) {
      console.error("Data loading error:", err);
      setError(err.response?.data?.message || "Failed to sync PostgreSQL data.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('niyojan_access_token');
      localStorage.removeItem('niyojan_refresh_token');
      localStorage.removeItem('niyojan_user');

      const res = await apiClient.post('/auth/login', { email, password: pass });
      const { access_token, refresh_token, user } = res.data;

      localStorage.setItem('niyojan_access_token', access_token);
      localStorage.setItem('niyojan_refresh_token', refresh_token);
      localStorage.setItem('niyojan_user', JSON.stringify(user));

      setCurrentUser(user);
      setCurrentRoleState(user.role as UserRole);

      await loadDataForUser(user.role as UserRole);
      return true;
    } catch (err: any) {
      let msg = "Login failed. Invalid credentials.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          msg = JSON.stringify(err.response.data.detail);
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const rfToken = localStorage.getItem('niyojan_refresh_token');
    if (rfToken) {
      try {
        await apiClient.post('/auth/logout', { refresh_token: rfToken });
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
    localStorage.removeItem('niyojan_access_token');
    localStorage.removeItem('niyojan_refresh_token');
    localStorage.removeItem('niyojan_user');
    setCurrentUser(null);
    setCurrentRoleState(null);
    setAppointments([]);
    setDocuments([]);
    setNotifications([]);
    setAuditLogs([]);
  };

  const register = async (regData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('niyojan_access_token');
      localStorage.removeItem('niyojan_refresh_token');
      localStorage.removeItem('niyojan_user');

      await apiClient.post('/auth/register', regData);
      return true;
    } catch (err: any) {
      let msg = "Registration failed.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          msg = JSON.stringify(err.response.data.detail);
        }
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.map((e: any) => `${e.loc?.slice(-1)[0] || 'Field'}: ${e.msg}`).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentRole = async (role: UserRole) => {
    const creds = SEED_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    } else {
      setCurrentRoleState(role);
    }
  };

  const refreshAllData = async () => {
    await loadDataForUser(currentRole);
  };

  const createAppointment: AppContextType['createAppointment'] = async (data) => {
    setIsLoading(true);
    try {
      await apiClient.post('/appointments', data);
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const forwardAppointmentByMediator = async (id: string, remarks: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/mediator/appointments/${id}/forward`, { remarks });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to forward appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const approveAppointmentByPrincipal = async (id: string, slotTime: string, remarks: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/principal/appointments/${id}/approve`, { slotTime, remarks });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to approve appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectAppointment = async (id: string, remarks: string) => {
    setIsLoading(true);
    try {
      const endpoint = currentRole === 'mediator' ? `/mediator/appointments/${id}/reject` : `/principal/appointments/${id}/reject`;
      await apiClient.post(endpoint, { remarks });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reject appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleAppointment = async (id: string, newDate: string, newTime: string, remarks: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/principal/appointments/${id}/reschedule`, { newDate, newTime, remarks });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reschedule appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (data: { docTitle: string; docCategory: string; file?: File }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('docTitle', data.docTitle);
      formData.append('docCategory', data.docCategory);
      if (data.file) {
        formData.append('file', data.file);
      } else {
        // Create default dummy PDF blob if no file chosen
        const dummyPdfContent = "%PDF-1.4 sample document content uploaded via Niyojan UI";
        const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
        formData.append('file', blob, `${data.docTitle.replace(/\s+/g, '_')}.pdf`);
      }

      await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload document");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocumentByMediator = async (id: string, note: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/mediator/documents/${id}/verify`, { note });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to verify document");
    } finally {
      setIsLoading(false);
    }
  };

  const approveDocumentByPrincipal = async (id: string, note: string) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/principal/documents/${id}/approve`, { note });
      await loadDataForUser(currentRole);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to approve document");
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        appointments,
        documents,
        auditLogs,
        notifications,
        isLoading,
        error,
        setError,
        login,
        logout,
        register,
        refreshAllData,
        createAppointment,
        forwardAppointmentByMediator,
        approveAppointmentByPrincipal,
        rejectAppointment,
        rescheduleAppointment,
        uploadDocument,
        verifyDocumentByMediator,
        approveDocumentByPrincipal,
        markNotificationRead,
        markAllNotificationsRead,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
