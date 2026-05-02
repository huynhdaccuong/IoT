import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const changePassword = async (passwordData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/change-password`, passwordData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const authService = {
    changePassword
};

export default authService;
