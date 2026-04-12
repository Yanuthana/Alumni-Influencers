export const signup = async (userInformation) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInformation),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: 'An error occurred' };
    }
};

export const login = async (credentials) => {
    try {
        const response = await fetch('/api/auth/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: 'Login failed' };
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await fetch('/api/auth/email/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: 'Verification failed' };
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('api_token');
        const response = await fetch('/api/auth/sessions', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { status: 'error', message: 'Logout failed' };
    }
};            
