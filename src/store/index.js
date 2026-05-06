import { configureStore } from '@reduxjs/toolkit';
import areasReducer from './slice/areasSlice';
import vacacionesReducer from './slice/vacacionesSlice';
import funcionariosReducer from './slice/funcionariosSlices';

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    vacaciones: vacacionesReducer,
    funcionarios: funcionariosReducer,
    // cargos: cargosReducer,
  },
});