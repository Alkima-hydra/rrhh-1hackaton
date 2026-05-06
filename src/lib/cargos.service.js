import apiPersonal from "./personal.api";

const EP = "/cargos";

export const cargosService = {
  getAll:     ()         => apiPersonal.get(EP),
  getById:    (id)       => apiPersonal.get(`${EP}/${id}`),
  getByArea:  (idArea)   => apiPersonal.get(`${EP}/area/${idArea}`),
  create:     (data)     => apiPersonal.post(EP, data),
  update:     (id, data) => apiPersonal.put(`${EP}/${id}`, data),
  desactivar: (id)       => apiPersonal.patch(`${EP}/${id}`),
};