// =========================
// VACACIONES SLICE
// =========================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vacacionesService } from '../../lib/vacaciones.api';

// =========================
// THUNKS
// =========================

export const fetchVacaciones = createAsyncThunk(
  'vacaciones/fetchVacaciones',
  async (_, { rejectWithValue }) => {
    try {
      const data = await vacacionesService.listarVacaciones();

      return data.vacaciones || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const createVacacion = createAsyncThunk(
  'vacaciones/createVacacion',
  async (form, { rejectWithValue }) => {
    try {
      const data = await vacacionesService.solicitarVacaciones(form);

      return data.vacacion;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const updateEstadoVacacion = createAsyncThunk(
  'vacaciones/updateEstadoVacacion',
  async ({ id, estado }, { rejectWithValue }) => {
    try {
      const data = await vacacionesService.cambiarEstadoVacacion(
        id,
        estado
      );

      return data.vacacion;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);
export const fetchDisponibilidadVacaciones = createAsyncThunk(
  'vacaciones/fetchDisponibilidadVacaciones',
  async (idFuncionario, { rejectWithValue }) => {
    try {
      const data =
        await vacacionesService.obtenerDisponibilidad(idFuncionario);

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg ||
        error?.message ||
        'Error al obtener disponibilidad'
      );
    }
  }
);

// =========================
// SLICE
// =========================

const vacacionesSlice = createSlice({
  name: 'vacaciones',
  initialState: {
    items: [],
    loading: false,
    error: null,
    errorDisponibilidad: null,
    disponibilidad: null,
    loadingDisponibilidad: false,
  },
  reducers: {
    clearVacacionesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchVacaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacaciones.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchVacaciones.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // CREATE
      .addCase(createVacacion.fulfilled, (state, { payload }) => {
        if (payload) {
          state.items.unshift(payload);
        }
      })

      // UPDATE ESTADO
      .addCase(updateEstadoVacacion.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(
          (v) => v.id_vacacion === payload.id_vacacion
        );

        if (idx !== -1) {
          state.items[idx] = payload;
        }
      })
      // FETCH DISPONIBILIDAD
        .addCase(fetchDisponibilidadVacaciones.pending, (state) => {
            state.loadingDisponibilidad = true;
            state.disponibilidad = null;
            state.errorDisponibilidad = null;
        })
        .addCase(fetchDisponibilidadVacaciones.fulfilled, (state, { payload }) => {
            state.loadingDisponibilidad = false;
            state.disponibilidad = payload;
        })
        .addCase(fetchDisponibilidadVacaciones.rejected, (state, { payload }) => {
        state.loadingDisponibilidad = false;
        state.disponibilidad = null;
        state.errorDisponibilidad = payload;
        });
  },
});

// =========================
// SELECTORS
// =========================

export const selectVacaciones = (state) =>
  state.vacaciones.items;

export const selectVacacionesLoading = (state) =>
  state.vacaciones.loading;

export const selectVacacionesError = (state) =>
  state.vacaciones.error;
export const selectDisponibilidadVacaciones = (state) =>
  state.vacaciones.disponibilidad;

export const selectDisponibilidadVacacionesLoading = (state) =>
  state.vacaciones.loadingDisponibilidad;

export const selectDisponibilidadVacacionesError = (state) =>
  state.vacaciones.errorDisponibilidad;

export const { clearVacacionesError } =
  vacacionesSlice.actions;

export default vacacionesSlice.reducer;