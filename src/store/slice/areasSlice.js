import { createSlice } from '@reduxjs/toolkit';
import { MOCK_AREAS } from '../mocks';

const areasSlice = createSlice({
  name: 'areas',
  initialState: {
    items: MOCK_AREAS, // DATOS FALSOS, CAMBIAR COMO LOS OTROS
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer para agregar un área localmente
    addArea: (state, action) => {
      const newArea = {
        ...action.payload,
        id_area: state.items.length + 1 // ID incremental falso
      };
      state.items.push(newArea);
    },
    // Reducer para eliminar localmente
    removeArea: (state, action) => {
      state.items = state.items.filter(a => a.id_area !== action.payload);
    }
  }
});

export const { addArea, removeArea } = areasSlice.actions;
export default areasSlice.reducer;