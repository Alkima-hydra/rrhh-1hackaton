import axios from "axios";

const API_VACACIONES = "http://localhost:4002/api";

const vacacionesApi = axios.create({
  baseURL: API_VACACIONES,
});

export const vacacionesService = {
  listarVacaciones: async () => {
    const { data } = await vacacionesApi.get("/vacaciones");
    return data;
  },

  obtenerDisponibilidad: async (idFuncionario) => {
    const { data } = await vacacionesApi.get(
      `/vacaciones/disponibilidad/${idFuncionario}`
    );
    return data;
  },

  solicitarVacaciones: async (vacacionData) => {
    const { data } = await vacacionesApi.post(
      "/vacaciones/solicitar",
      vacacionData
    );
    return data;
  },

  cambiarEstadoVacacion: async (idVacacion, estado) => {
    const { data } = await vacacionesApi.patch(
      `/vacaciones/${idVacacion}/estado`,
      { estado }
    );
    return data;
  },
};