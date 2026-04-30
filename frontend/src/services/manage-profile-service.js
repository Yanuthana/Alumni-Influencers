export const addDegree = async (userId, degree) => {
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

export const addCertification = async (userId, certification) => {
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

export const addLicense = async (userId, licenses) => {
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

export const addCourse = async (userId, course) => {
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

export const addEmployment = async (userId, employmentData) => {
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

export const updateProfileImage = async (userId, image) => {
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

export const updateDegrees = async (userId, degrees) => {
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

export const updateCertifications = async (userId, certifications) => {
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

export const updateLicenses = async (userId, licenses) => {
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

export const updateCourses = async (userId, courses) => {
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

export const updateEmployment = async (userId, employmentHistory) => {
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

export const updateLinkedin = async (userId, linkedin) => {
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

const deleteRecord = async (endpoint, userId, index) => {
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

export const deleteEducation = (userId, index) => 
    deleteRecord('/api/alumni/degrees', userId, index);

export const deleteCertification = (userId, index) => 
    deleteRecord('/api/alumni/certifications', userId, index);

export const deleteLicense = (userId, index) => 
    deleteRecord('/api/alumni/licenses', userId, index);

export const deleteCourse = (userId, index) => 
    deleteRecord('/api/alumni/professional_courses', userId, index);

export const deleteEmployment = (userId, index) => 
    deleteRecord('/api/alumni/employment_history', userId, index);
