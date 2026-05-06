import { createAsyncThunk } from "@reduxjs/toolkit";
import { vacacionesApi } from "../../../lib/api";

export const fetchVacaciones = createAsyncThunk(
  "vacaciones/fetchVacaciones",
  async (_, { rejectWithValue }) => {
    try {
      const data = await vacacionesApi.listarVacaciones();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg ||
          error?.message ||
          "No se pudieron cargar las vacaciones"
      );
    }
  }
);

export const fetchDisponibilidadVacaciones = createAsyncThunk(
  "vacaciones/fetchDisponibilidadVacaciones",
  async (idFuncionario, { rejectWithValue }) => {
    try {
      const data = await vacacionesApi.obtenerDisponibilidad(idFuncionario);
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg ||
          error?.message ||
          "No se pudo obtener la disponibilidad de vacaciones"
      );
    }
  }
);

export const solicitarVacaciones = createAsyncThunk(
  "vacaciones/solicitarVacaciones",
  async (
    {
      id_funcionario,
      dias_solicitados,
      fecha_inicio,
      fecha_fin,
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await vacacionesApi.solicitarVacaciones({
        id_funcionario,
        dias_solicitados,
        fecha_inicio,
        fecha_fin,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg ||
          error?.message ||
          "No se pudo registrar la solicitud de vacaciones"
      );
    }
  }
);

export const cambiarEstadoVacacion = createAsyncThunk(
  "vacaciones/cambiarEstadoVacacion",
  async (
    {
      id_vacacion,
      estado,
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await vacacionesApi.cambiarEstadoVacacion(id_vacacion, {
        estado,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.msg ||
          error?.message ||
          "No se pudo cambiar el estado de la solicitud"
      );
    }
  }
);