import axios from 'axios';
import { baseURL } from './helpers/baseURL';
import { AxiosTimeout } from './helpers/constants';

export const publicAxios = axios.create({
	baseURL,
	timeout:AxiosTimeout,
	headers: { 'content-type': 'application/json', accept: 'application/json' },
	withCredentials: true,
});

export const publicAxiosFileUpload = axios.create({
	baseURL,
	timeout:AxiosTimeout,
	headers: {
		'content-type': 'multipart/form-data',
		accept: 'application/json',
	},
	withCredentials: true,
});

const authAxios = axios.create({
	baseURL,
	timeout:AxiosTimeout,
	// headers: {
	// 	'content-type': 'application/json',
	// 	accept: 'application/json',
	// },
	withCredentials: true,
});


const authAxiosForCSV = axios.create({
	baseURL,
	timeout:AxiosTimeout,
	responseType: 'blob',
	// headers: {
	// 	'content-type': 'application/json',
	// 	accept: 'application/json',
	// },
	withCredentials: true,
});



const authAxiosFileUpload = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'multipart/form-data',
		accept: 'application/json',
	},
	withCredentials: true,
});

export const updateToken = (newToken) => {
	// token = newToken;
	// tenant = newTenant;
	authAxios.defaults.headers.Authorization = `Bearer ${newToken}`;
	authAxiosFileUpload.defaults.headers.Authorization = `Bearer ${newToken}`;
	authAxios.defaults.baseURL = baseURL;
	authAxiosFileUpload.defaults.baseURL = baseURL;
	
};

export const setInitialToken = () => {
	// authAxios.defaults.headers.Authorization = `Bearer ${token}`;
	authAxiosFileUpload.defaults.headers.Authorization = baseURL;
	authAxios.defaults.baseURL = baseURL;
	authAxiosFileUpload.defaults.baseURL = baseURL;
};

setInitialToken();

export { authAxios, authAxiosFileUpload,authAxiosForCSV };
