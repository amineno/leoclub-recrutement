import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const applyCandidate = (data) => API.post('/candidates/apply', data);
export const loginAdmin = (data) => API.post('/auth/login', data);
export const getAdminProfile = () => API.get('/auth/me');
export const updateAdminProfile = (data) => API.put('/auth/profile', data);
export const getCandidates = (params) => API.get('/candidates', { params });
export const getCandidateById = (id) => API.get(`/candidates/${id}`);
export const updateCandidate = (id, data) => API.patch(`/candidates/${id}`, data);
export const updateCandidateStatus = (id, data) => API.put(`/candidates/${id}/status`, data);
export const deleteCandidate = (id) => API.delete(`/candidates/${id}`);
export const exportCandidatesCSV = () => API.get('/candidates/export', { responseType: 'blob' });
export const exportCandidatesExcel = () => API.get('/candidates/export-excel', { responseType: 'blob' });

export default API;
