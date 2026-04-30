const getAuthHeaders = () => {
  const token = localStorage.getItem('api_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok || payload.status !== 'success') {
    throw new Error(payload.message || 'Failed to load dashboard data');
  }

  return payload.data;
};

export const getPersonalDashboardInsights = async () => {
  const response = await fetch('/api/dashboard/personal', {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  return parseResponse(response);
};

export const getGlobalDashboardInsights = async () => {
  const response = await fetch('/api/dashboard/global', {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  return parseResponse(response);
};
