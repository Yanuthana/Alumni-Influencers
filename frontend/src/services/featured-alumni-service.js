export const getFeaturedAlumni = async (slotId) => {
    const response = await fetch(`/api/featured-alumni?slot_id=${slotId}`, {
        headers: {
            'apikey': import.meta.env.VITE_GATEWAY_API_KEY,
            'X-Consumer-Username': 'dev_user'
        }
    });
    return response.json();
}