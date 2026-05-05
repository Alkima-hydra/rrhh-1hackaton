import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Layout from './components/Layout/Layout';
import Areas from './pages/Areas/Areas';
import Cargos from './pages/Cargos/Cargos';
import Funcionarios from './pages/Funcionarios/Funcionarios';
import Vacaciones from './pages/Vacaciones/Vacaciones';
import PlantillasContrato from './pages/PlantillasContrato/PlantillasContrato';
import Contratos from './pages/Contratos/Contratos';
import Boletas from './pages/Boletas/Boletas';
import { Provider } from 'react-redux';
import { store } from './store';

export default function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/funcionarios" replace />} />
          <Route path="areas" element={<Areas />} />
          <Route path="cargos" element={<Cargos />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="vacaciones" element={<Vacaciones />} />
          <Route path="plantillas" element={<PlantillasContrato />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="boletas" element={<Boletas />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  );
}
