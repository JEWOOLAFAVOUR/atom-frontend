import axios from "axios";
import useAuthStore from "../store/useAuthStore";


// const BASE_URL = 'http://localhost:8000/api/v1';
const BASE_URL = 'https://atom-backend-07sh.onrender.com/api/v1';

const client = axios.create({ baseURL: BASE_URL });

// Add a request interceptor to add the authentication token to every request
client.interceptors.request.use(
    function (config) {
        // Access Zustand's state using getState()
        // const { token } = useAuthStore.getState();
        const token = useAuthStore.getState().token

        // console.log('..........', token)

        // Add the token to the request headers if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    function (error) {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default client;