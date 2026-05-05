import { configureStore } from '@reduxjs/toolkit';
import areasReducer from './slice/areasSlice';

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    // cargos: cargosReducer,
  },
});