export const getAlumniDirectory = async (filters) => {
    const token = localStorage.getItem('api_token');
    if (!token) throw new Error('No API token found');

    const params = new URLSearchParams();
    if (filters.programme) params.append('programme', filters.programme);
    if (filters.graduation_year) params.append('graduation_year', filters.graduation_year);
    if (filters.industry) params.append('industry', filters.industry);

    const response = await fetch(`/api/alumni/directory?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (data?.status === 'success') {
        return data.data;
    }
    throw new Error(data?.message || 'Failed to fetch directory');
};
