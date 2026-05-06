import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { areasApiService } from '../../lib/api.areas';

// Thunks

export const fetchAreas = createAsyncThunk(
  'areas/fetchAreas',
  async (_, { rejectWithValue }) => {
    try {
      const data = await areasApiService.fetchAreas();
      return data.areas;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createArea = createAsyncThunk(
  'areas/createArea',
  async (form, { rejectWithValue }) => {
    try {
      const data = await areasApiService.createArea(form);
      return data.area;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateArea = createAsyncThunk(
  'areas/updateArea',
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const data = await areasApiService.updateArea(id, form);
      return data.area;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteArea = createAsyncThunk(
  'areas/deleteArea',
  async (id, { rejectWithValue }) => {
    try {
      await areasApiService.deleteArea(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice

const areasSlice = createSlice({
  name: 'areas',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchAreas.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // create
    builder
      .addCase(createArea.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(createArea.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // update
    builder
      .addCase(updateArea.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((a) => a.id_area === payload.id_area);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(updateArea.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // delete (logical — backend sets activo: false, remove from list)
    builder
      .addCase(deleteArea.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((a) => a.id_area !== payload);
      })
      .addCase(deleteArea.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

// Selectors 

export const selectAreas = (state) => state.areas.items;
export const selectAreasLoading = (state) => state.areas.loading;
export const selectAreasError = (state) => state.areas.error;

export default areasSlice.reducer;