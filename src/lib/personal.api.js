import axios from "axios";

const apiPersonal = axios.create({
  baseURL: "http://localhost:4005/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiPersonal.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje = error.response?.data?.message || "Error inesperado";
    const status = error.response?.status;
    console.error(`[API Error ${status}]`, mensaje);
    return Promise.reject(error);
  }
);

export default apiPersonal;