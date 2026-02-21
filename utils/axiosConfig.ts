// import axios from "axios";

// export const axiosWithCredentials = axios.defaults.withCredentials = true;

// export const axiosDefaultConfig = axios.interceptors.request.use((config) => {
//     const token = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))
//         ?.split('=')[1];

//     if (token) {
//         config.headers['X-XSRF-TOKEN'] = token;
//     }
//     return config;
// });