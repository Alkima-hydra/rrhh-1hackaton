// =========================
// FUNCIONARIOS SLICE
// =========================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { funcionariosService } from '../../lib/funcionarios.service';

// =========================
// THUNKS
// =========================

export const fetchFuncionarios = createAsyncThunk(
  'funcionarios/fetchFuncionarios',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await funcionariosService.getAll();

      return data.funcionarios || data.data || data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const fetchFuncionarioById = createAsyncThunk(
  'funcionarios/fetchFuncionarioById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await funcionariosService.getById(id);

      return data.funcionario || data.data || data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const createFuncionario = createAsyncThunk(
  'funcionarios/createFuncionario',
  async (form, { rejectWithValue }) => {
    try {
      const { data } = await funcionariosService.create(form);

      return data.funcionario || data.data || data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const updateFuncionario = createAsyncThunk(
  'funcionarios/updateFuncionario',
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const { data } = await funcionariosService.update(id, form);

      return data.funcionario || data.data || data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

export const darDeBajaFuncionario = createAsyncThunk(
  'funcionarios/darDeBajaFuncionario',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await funcionariosService.darDeBaja(id);

      return {
        id_funcionario: id,
        funcionario: data.funcionario || data.data || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg || error.message
      );
    }
  }
);

// =========================
// SLICE
// =========================

const funcionariosSlice = createSlice({
  name: 'funcionarios',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearFuncionariosError: (state) => {
      state.error = null;
    },
    clearSelectedFuncionario: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchFuncionarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFuncionarios.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchFuncionarios.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // FETCH BY ID
      .addCase(fetchFuncionarioById.fulfilled, (state, { payload }) => {
        state.selected = payload;
      })

      // CREATE
      .addCase(createFuncionario.fulfilled, (state, { payload }) => {
        if (payload) {
          state.items.push(payload);
        }
      })

      // UPDATE
      .addCase(updateFuncionario.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(
          (f) => f.id_funcionario === payload.id_funcionario
        );

        if (idx !== -1) {
          state.items[idx] = payload;
        }
      })

      // BAJA
      .addCase(darDeBajaFuncionario.fulfilled, (state, { payload }) => {
        const id = Number(payload.id_funcionario);

        state.items = state.items.map((f) =>
          Number(f.id_funcionario) === id
            ? { ...f, activo: false }
            : f
        );
      });
  },
});

// =========================
// SELECTORS
// =========================

export const selectFuncionarios = (state) =>
  state.funcionarios.items;

export const selectFuncionariosLoading = (state) =>
  state.funcionarios.loading;

export const selectFuncionariosError = (state) =>
  state.funcionarios.error;

export const selectFuncionarioSelected = (state) =>
  state.funcionarios.selected;

export const {
  clearFuncionariosError,
  clearSelectedFuncionario,
} = funcionariosSlice.actions;

export default funcionariosSlice.reducer;