export const getFeaturedAlumni = async (slotId) => {
    const response = await fetch(`/api/featured-alumni?slot_id=${slotId}`);
    return response.json();
}