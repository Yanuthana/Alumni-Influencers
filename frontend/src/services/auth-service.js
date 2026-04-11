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

            
