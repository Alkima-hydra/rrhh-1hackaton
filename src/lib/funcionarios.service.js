import apiPersonal from "./personal.api";

const EP = "/funcionarios";

export const funcionariosService = {
  getAll:    ()         => apiPersonal.get(EP),
  getById:   (id)       => apiPersonal.get(`${EP}/${id}`),
  create:    (data)     => apiPersonal.post(EP, data),
  update:    (id, data) => apiPersonal.put(`${EP}/${id}`, data),
  darDeBaja: (id)       => apiPersonal.patch(`${EP}/${id}`),
};