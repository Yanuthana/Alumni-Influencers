const getAuthHeaders = () => {
  const token = localStorage.getItem('api_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const baseHeaders = () => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
});

const parseResponse = async (response) => {
  const payload = await response.json();
  if (!response.ok || (payload.status && payload.status !== 'success')) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload;
};

/**
 * GET /api/slots?user_id=<id>
 * Returns the tomorrow's bidding slot (single object or array).
 */
export const getSlots = async (userId) => {
  const response = await fetch(`/api/slots?user_id=${userId}`, {
    headers: baseHeaders(),
  });
  return parseResponse(response);
};

/**
 * POST /api/bids?user_id=<id>
 * Body: { slot_id, bid_amount }
 */
export const placeBid = async (userId, slotId, bidAmount) => {
  const response = await fetch(`/api/bids?user_id=${userId}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ slot_id: slotId, bid_amount: bidAmount }),
  });
  return parseResponse(response);
};

/**
 * PUT /api/bids?user_id=<id>
 * Body: { bid_id, bid_amount }
 */
export const updateBid = async (userId, bidId, bidAmount) => {
  const response = await fetch(`/api/bids?user_id=${userId}`, {
    method: 'PUT',
    headers: baseHeaders(),
    body: JSON.stringify({ bid_id: bidId, bid_amount: bidAmount }),
  });
  return parseResponse(response);
};

/**
 * DELETE /api/bids?user_id=<id>
 * Body: { bid_id }
 */
export const cancelBid = async (userId, bidId) => {
  const response = await fetch(`/api/bids?user_id=${userId}`, {
    method: 'DELETE',
    headers: baseHeaders(),
    body: JSON.stringify({ bid_id: bidId }),
  });
  return parseResponse(response);
};

/**
 * GET /api/bids/history?user_id=<id>
 */
export const getBidHistory = async (userId) => {
  const response = await fetch(`/api/bids/history?user_id=${userId}`, {
    headers: baseHeaders(),
  });
  return parseResponse(response);
};

/**
 * POST /api/bidsstatus?user_id=<id>
 * Body: { bid_id }
 */
export const getBidStatus = async (userId, bidId) => {
  const response = await fetch(`/api/bidsstatus?user_id=${userId}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ bid_id: bidId }),
  });
  return parseResponse(response);
};
/**
 * GET /api/alumni/monthly-limit-status?user_id=<id>
 */
export const getMonthlyLimitStatus = async (userId) => {
  const response = await fetch(`/api/alumni/monthly-limit-status?user_id=${userId}`, {
    headers: baseHeaders(),
  });
  return parseResponse(response);
};
