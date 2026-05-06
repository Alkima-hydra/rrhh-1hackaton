import axios from "axios";

const API = "http://localhost:3002";

// GET contratos
export const getContratos = async () => {
  const res = await axios.get(`${API}/contratos`);
  return res.data;
};

// CREATE
export const createContrato = async (data) => {
  const res = await axios.post(`${API}/contratos`, data);
  return res.data;
};

// UPDATE
export const updateContrato = async (id, data) => {
  const res = await axios.put(`${API}/contratos/${id}`, data);
  return res.data;
};

// DELETE
export const deleteContrato = async (id) => {
  const res = await axios.delete(`${API}/contratos/${id}`);
  return res.data;
};

// MOSTRAR CERTIFICADO (PDF inline)
export const mostrarCertificado = async (data, filename) => {
  const res = await axios.post(
    `${API}/mostrar-certificado?filename=${filename}`,
    data,
    { responseType: "blob" } 
  );
  return res.data;
};