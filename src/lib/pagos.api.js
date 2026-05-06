import axios from "axios";

const pagosApi = axios.create({
  baseURL: "http://localhost:4004/api",
});

export const boletasService = {
  listarFuncionarios: async () => {
    const { data } = await pagosApi.get("/pagos/funcionarios");
    return data;
  },

  listarBoletas: async () => {
    const { data } = await pagosApi.get("/pagos");
    return data;
  },

  obtenerBoletaPorId: async (idBoleta) => {
    const { data } = await pagosApi.get(`/pagos/${idBoleta}`);
    return data;
  },

  crearBoleta: async (payload) => {
    const { data } = await pagosApi.post("/pagos", payload);
    return data;
  },

  enviarBoletaCorreo: async (idBoleta) => {
    const { data } = await pagosApi.post(`/pagos/${idBoleta}/enviar-correo`);
    return data;
  },

  eliminarBoleta: async (idBoleta) => {
    const { data } = await pagosApi.delete(`/pagos/${idBoleta}`);
    return data;
  },
};