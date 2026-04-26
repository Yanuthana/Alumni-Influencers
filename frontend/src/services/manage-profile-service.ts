
export const addDegree = async (userId: string | number, degree: any) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/degrees?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ degree }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to add degree');
    }
    return payload;
}

export const addCertification = async (userId: string | number, certification: any) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/certifications?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ certification }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to add certification');
    }
    return payload;
}

export const addLicense = async (userId: string | number, licenses: any) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/licenses?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenses }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to add license');
    }
    return payload;
}

export const addCourse = async (userId: string | number, course: any) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/professional_courses?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to add professional course');
    }
    return payload;
}

export const addEmployment = async (userId: string | number, employmentData: any) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/employment_history?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ employment_data: employmentData }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to add employment history');
    }
    return payload;
}

export const updateProfileImage = async (userId: string | number, image: string) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/profile/image?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_image_url: image }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update profile image');
    }
    return payload;
}

export const updateDegrees = async (userId: string | number, degrees: any[]) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/degrees?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ degrees }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update degrees');
    }
    return payload;
}

export const updateCertifications = async (userId: string | number, certifications: any[]) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/certifications?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ certifications }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update certifications');
    }
    return payload;
}

export const updateLicenses = async (userId: string | number, licenses: any[]) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/licenses?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenses }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update licenses');
    }
    return payload;
}

export const updateCourses = async (userId: string | number, courses: any[]) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/professional_courses?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ professional_courses: courses }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update professional courses');
    }
    return payload;
}

export const updateEmployment = async (userId: string | number, employmentHistory: any[]) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/employment_history?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ employment_history: employmentHistory }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update employment history');
    }
    return payload;
}

export const updateLinkedin = async (userId: string | number, linkedin: string) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`/api/alumni/profile/linkedin?user_id=${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ linkedin_url: linkedin }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to update linkedin');
    }
    return payload;
}

const deleteRecord = async (endpoint: string, userId: string | number, index: number) => {
    const token = localStorage.getItem('api_token');
    const response = await fetch(`${endpoint}?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ index }),
    });

    const payload = await response.json();
    if (!response.ok || (payload.status && payload.status !== 'success')) {
        throw new Error(payload.message || 'Failed to delete record');
    }
    return payload;
};

export const deleteEducation = (userId: string | number, index: number) => 
    deleteRecord('/api/alumni/degrees', userId, index);

export const deleteCertification = (userId: string | number, index: number) => 
    deleteRecord('/api/alumni/certifications', userId, index);

export const deleteLicense = (userId: string | number, index: number) => 
    deleteRecord('/api/alumni/licenses', userId, index);

export const deleteCourse = (userId: string | number, index: number) => 
    deleteRecord('/api/alumni/professional_courses', userId, index);

export const deleteEmployment = (userId: string | number, index: number) => 
    deleteRecord('/api/alumni/employment_history', userId, index);