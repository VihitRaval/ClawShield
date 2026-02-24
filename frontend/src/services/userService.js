import api from './api';

export const userService = {
    getProfile: async () => {
        try {
            // const response = await api.get('/user/profile');
            // return response.data;

            const storedUser = localStorage.getItem('user');
            const storedPrefs = localStorage.getItem('user_prefs');

            const user = storedUser ? JSON.parse(storedUser) : { name: 'Admin User', email: 'admin@openclaw.ai', role: 'System Administrator' };
            const prefs = storedPrefs ? JSON.parse(storedPrefs) : { twoFactor: true, notifications: true, language: 'English' };

            return { ...user, ...prefs };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    updateProfile: async (userData) => {
        try {
            // const response = await api.put('/user/profile', userData);
            // return response.data;

            localStorage.setItem('user', JSON.stringify({
                name: userData.name,
                email: userData.email,
                role: userData.role
            }));

            localStorage.setItem('user_prefs', JSON.stringify({
                twoFactor: userData.twoFactor,
                notifications: userData.notifications,
                language: userData.language
            }));

            return userData;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
};
