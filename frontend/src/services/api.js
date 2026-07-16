const API_BASE = '/api';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Bir hata oluştu.' } }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Customers
export const getCustomers = (params) => {
  const query = new URLSearchParams(params).toString();
  return request(`/customers${query ? `?${query}` : ''}`);
};
export const getCustomer = (id) => request(`/customers/${id}`);
export const createCustomer = (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: 'DELETE' });

// Accounts
export const getAccountsByCustomer = (customerId) => request(`/accounts/customers/${customerId}/accounts`);
export const getAccounts = () => request('/accounts');
export const getAccount = (id) => request(`/accounts/${id}`);
export const createAccount = (customerId, data) => request(`/accounts/customers/${customerId}/accounts`, { method: 'POST', body: JSON.stringify(data) });
export const updateAccount = (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAccount = (id) => request(`/accounts/${id}`, { method: 'DELETE' });

// Workplaces
export const getWorkplacesByCustomer = (customerId) => request(`/workplaces/customers/${customerId}/workplaces`);
export const getWorkplaces = () => request('/workplaces');
export const getWorkplace = (id) => request(`/workplaces/${id}`);
export const createWorkplace = (customerId, data) => request(`/workplaces/customers/${customerId}/workplaces`, { method: 'POST', body: JSON.stringify(data) });
export const updateWorkplace = (id, data) => request(`/workplaces/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWorkplace = (id) => request(`/workplaces/${id}`, { method: 'DELETE' });

// Terminals
export const getTerminalsByWorkplace = (workplaceId) => request(`/terminals/workplaces/${workplaceId}/terminals`);
export const getTerminals = () => request('/terminals');
export const getTerminal = (id) => request(`/terminals/${id}`);
export const createTerminal = (workplaceId, data) => request(`/terminals/workplaces/${workplaceId}/terminals`, { method: 'POST', body: JSON.stringify(data) });
export const updateTerminal = (id, data) => request(`/terminals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTerminal = (id) => request(`/terminals/${id}`, { method: 'DELETE' });

// Search
export const globalSearch = (q) => request(`/search?q=${encodeURIComponent(q)}`);

// Logs
export const getLogs = (params) => {
  const query = new URLSearchParams(params).toString();
  return request(`/logs${query ? `?${query}` : ''}`);
};

// Dashboard
export const getDashboardStats = () => request('/dashboard/stats');

// Export
export const exportCustomersUrl = `${API_BASE}/export/customers`;
export const exportTerminalsUrl = `${API_BASE}/export/terminals`;
