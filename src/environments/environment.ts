const API_BASE_URL = 'http://localhost:8080';

export const environment = {
  production: false,
  apiBaseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      resetPassword: `${API_BASE_URL}/auth/reset-password`,
      logout: `${API_BASE_URL}/auth/logout`
    },
    systemAdmin: {
      rules: {
        getAll: `${API_BASE_URL}/api/v1/system/admin/rules/all`,
        create: `${API_BASE_URL}/api/v1/system/admin/rules`,
        update: (ruleId: string) => `${API_BASE_URL}/api/v1/system/admin/rules/update/${ruleId}`,
        assign: (ruleId: string) => `${API_BASE_URL}/api/v1/system/admin/rules/${ruleId}/assign`,
        getAssignedRules: (tenantId: string) => `${API_BASE_URL}/api/v1/system/admin/rules/tenants/${tenantId}`,
        unassign: (ruleId: string, tenantId: string) => `${API_BASE_URL}/api/v1/system/admin/rules/${ruleId}/unassign/${tenantId}`
      },
      tenants: {
        getAll: `${API_BASE_URL}/api/v1/admin/tenants`,
        onboard: `${API_BASE_URL}/api/v1/admin/tenants`,
        createBankAdmin: (tenantId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users`,
        getBankAdmins: (tenantId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users`,
        getBankAdminById: (tenantId: string, userId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users/${userId}`,
        resetBankAdminPassword: (tenantId: string, userId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users/${userId}/reset-password`,
        activateBankAdmin: (tenantId: string, userId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users/${userId}/activate`,
        deactivateBankAdmin: (tenantId: string, userId: string) => `${API_BASE_URL}/api/v1/admin/tenants/${tenantId}/users/${userId}/deactivate`,
        updateStatus: (tenantId: string) => `${API_BASE_URL}/api/v1/system/admin/tenants/${tenantId}/status`
      }
    },
    bankAdmin: {
      addOfficer: `${API_BASE_URL}/api/v1/bank/admin/add-compliance-officer`,
      getOfficer: (officerId: string) => `${API_BASE_URL}/api/v1/bank/admin/get-officer/${officerId}`,
      officers: `${API_BASE_URL}/api/v1/bank/admin/compliance-officers`,
      activateOfficer: (officerId: string) => `${API_BASE_URL}/api/v1/bank/admin/compliance-officers/${officerId}/activate`,
      deactivateOfficer: (officerId: string) => `${API_BASE_URL}/api/v1/bank/admin/compliance-officers/${officerId}/deactivate`,
      resetOfficerPassword: (officerId: string) => `${API_BASE_URL}/api/v1/bank/admin/compliance-officers/${officerId}/reset-password`,
      workload: `${API_BASE_URL}/api/v1/bank/admin/compliance-officers/workload`,
      alerts: `${API_BASE_URL}/api/v1/bank/admin/alerts`,
      alertStats: `${API_BASE_URL}/api/v1/bank/admin/alerts/stats`,
      alertDetail: (alertId: string) => `${API_BASE_URL}/api/v1/bank/admin/alerts/${alertId}`,
      assignCase: `${API_BASE_URL}/api/v1/bank/admin/cases/assign`,
      reassignCase: (caseId: string) => `${API_BASE_URL}/api/v1/bank/admin/cases/${caseId}/reassign`,
      cases: `${API_BASE_URL}/api/v1/bank/admin/cases`,
      caseDetail: (caseId: string) => `${API_BASE_URL}/api/v1/bank/admin/cases/${caseId}`,
      caseHistory: (caseId: string) => `${API_BASE_URL}/api/v1/bank/admin/cases/${caseId}/history`,
      sarStr: `${API_BASE_URL}/api/v1/bank/admin/sar-str`,
      sarStrPdf: (sarStrId: string) => `${API_BASE_URL}/api/v1/bank/admin/sar-str/${sarStrId}/pdf`
    },
    batches: {
      upload: `${API_BASE_URL}/api/v1/bank/batches/upload`,
      getAll: `${API_BASE_URL}/api/v1/bank/batches`,
      getDetail: (batchId: string) => `${API_BASE_URL}/api/v1/bank/batches/${batchId}`
    },
    compliance: {
      dashboard: `${API_BASE_URL}/api/v1/compliance/dashboard`,
      cases: `${API_BASE_URL}/api/v1/compliance/cases`,
      alerts: `${API_BASE_URL}/api/v1/compliance/alerts`
    },
    notifications: {
      getAll: `${API_BASE_URL}/api/v1/notifications`,
      getUnread: `${API_BASE_URL}/api/v1/notifications/unread`,
      getUnreadCount: `${API_BASE_URL}/api/v1/notifications/unread/count`,
      markAsRead: (id: string) => `${API_BASE_URL}/api/v1/notifications/${id}/read`
    }
  }
};
