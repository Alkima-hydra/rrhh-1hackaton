import { createSlice } from "@reduxjs/toolkit";

import {
  fetchVacaciones,
  fetchDisponibilidadVacaciones,
  solicitarVacaciones,
  cambiarEstadoVacacion,
} from "./vacacionesThunk";

const initialState = {
  vacaciones: [],
  disponibilidad: null,
  loading: false,
  loadingDisponibilidad: false,
  loadingSolicitud: false,
  loadingEstado: false,
  error: null,
  successMessage: null,
};

const vacacionesSlice = createSlice({
  name: "vacaciones",
  initialState,
  reducers: {
    clearVacacionesError: (state) => {
      state.error = null;
    },
    clearVacacionesSuccess: (state) => {
      state.successMessage = null;
    },
    clearDisponibilidad: (state) => {
      state.disponibilidad = null;
    },
    resetVacacionesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      // LISTAR VACACIONES
      .addCase(fetchVacaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.vacaciones = action.payload?.vacaciones ?? [];
      })
      .addCase(fetchVacaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar vacaciones";
      })

      // DISPONIBILIDAD
      .addCase(fetchDisponibilidadVacaciones.pending, (state) => {
        state.loadingDisponibilidad = true;
        state.error = null;
        state.disponibilidad = null;
      })
      .addCase(fetchDisponibilidadVacaciones.fulfilled, (state, action) => {
        state.loadingDisponibilidad = false;
        state.disponibilidad = action.payload;
      })
      .addCase(fetchDisponibilidadVacaciones.rejected, (state, action) => {
        state.loadingDisponibilidad = false;
        state.error = action.payload || "Error al obtener disponibilidad";
      })

      // SOLICITAR VACACIONES
      .addCase(solicitarVacaciones.pending, (state) => {
        state.loadingSolicitud = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(solicitarVacaciones.fulfilled, (state, action) => {
        state.loadingSolicitud = false;
        state.successMessage =
          action.payload?.msg || "Solicitud registrada correctamente";

        if (action.payload?.vacacion) {
          state.vacaciones.unshift(action.payload.vacacion);
        }
      })
      .addCase(solicitarVacaciones.rejected, (state, action) => {
        state.loadingSolicitud = false;
        state.error =
          action.payload || "Error al registrar solicitud de vacaciones";
      })

      // CAMBIAR ESTADO
      .addCase(cambiarEstadoVacacion.pending, (state) => {
        state.loadingEstado = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cambiarEstadoVacacion.fulfilled, (state, action) => {
        state.loadingEstado = false;
        state.successMessage =
          action.payload?.msg || "Estado actualizado correctamente";

        const vacacionActualizada = action.payload?.vacacion;

        if (vacacionActualizada) {
          state.vacaciones = state.vacaciones.map((vacacion) =>
            vacacion.id_vacacion === vacacionActualizada.id_vacacion
              ? vacacionActualizada
              : vacacion
          );
        }
      })
      .addCase(cambiarEstadoVacacion.rejected, (state, action) => {
        state.loadingEstado = false;
        state.error =
          action.payload || "Error al cambiar estado de vacaciones";
      });
  },
});

export const {
  clearVacacionesError,
  clearVacacionesSuccess,
  clearDisponibilidad,
  resetVacacionesState,
} = vacacionesSlice.actions;

export const selectVacaciones = (state) =>
  state.vacaciones?.vacaciones ?? [];

export const selectDisponibilidadVacaciones = (state) =>
  state.vacaciones?.disponibilidad ?? null;

export const selectVacacionesLoading = (state) =>
  state.vacaciones?.loading ?? false;

export const selectDisponibilidadLoading = (state) =>
  state.vacaciones?.loadingDisponibilidad ?? false;

export const selectSolicitudLoading = (state) =>
  state.vacaciones?.loadingSolicitud ?? false;

export const selectEstadoVacacionLoading = (state) =>
  state.vacaciones?.loadingEstado ?? false;

export const selectVacacionesError = (state) =>
  state.vacaciones?.error ?? null;

export const selectVacacionesSuccess = (state) =>
  state.vacaciones?.successMessage ?? null;

export default vacacionesSlice.reducer;