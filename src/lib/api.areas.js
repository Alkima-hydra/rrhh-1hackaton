import axios from 'axios';

const areasApi = axios.create({
  baseURL: 'http://localhost:4005/api/areas',
  headers: { 'Content-Type': 'application/json' },
});

const handleError = (error) => {
  const msg = error?.response?.data?.msg || 'Error inesperado';
  throw new Error(msg);
};

export const areasApiService = {
  fetchAreas: () =>
    areasApi.get('/').then((res) => res.data).catch(handleError),

  fetchAreaById: (id) =>
    areasApi.get(`/${id}`).then((res) => res.data).catch(handleError),

  createArea: (data) =>
    areasApi.post('/', data).then((res) => res.data).catch(handleError),

  updateArea: (id, data) =>
    areasApi.put(`/${id}`, data).then((res) => res.data).catch(handleError),

  deleteArea: (id) =>
    areasApi.patch(`/${id}`).then((res) => res.data).catch(handleError),
};