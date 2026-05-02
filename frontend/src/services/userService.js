import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users'; // Adjust if needed

const updateMe = async (userData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/me`, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const userService = {
    updateMe
};

export default userService;
