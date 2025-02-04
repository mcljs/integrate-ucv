import axios from 'axios';

const apiService = axios.create({
    baseURL: `https://beast-miner-api.magic-api.xyz/v1`,
});

apiService.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiService.interceptors.response.use((res) => res.data);

export default apiService;