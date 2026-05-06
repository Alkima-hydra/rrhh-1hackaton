import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '../../components/Modal/Modal';
import s from '../../styles/shared.module.css';

import {
  fetchVacaciones,
  solicitarVacaciones,
  cambiarEstadoVacacion,
} from './slices/vacacionesThunk';

import {
  selectVacaciones,
  selectVacacionesLoading,
  selectVacacionesError,
} from './slices/vacacionesSlices';

// Estos vendrían de tu otro slice de funcionarios
import {
  fetchFuncionarios,
  selectFuncionarios,
  selectFuncionariosLoading,
} from '../slicesFuncionarios/funcionariosSlices';

const EMPTY = {
  id_funcionario: '',
  dias_solicitados: '',
  fecha_inicio: '',
  fecha_fin: '',
};

function VacacionForm({ funcionarios, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const valid =
    form.id_funcionario &&
    form.dias_solicitados &&
    Number(form.dias_solicitados) > 0 &&
    form.fecha_inicio &&
    form.fecha_fin;

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Funcionario</label>
          <select
            className={s.select}
            value={form.id_funcionario}
            onChange={(e) => set('id_funcionario', e.target.value)}
          >
            <option value="">Seleccionar funcionario...</option>
            {funcionarios.map((f) => (
              <option key={f.id_funcionario} value={f.id_funcionario}>
                {f.nombres} {f.apellidos}
              </option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Días solicitados</label>
          <input
            className={s.input}
            type="number"
            min="1"
            value={form.dias_solicitados}
            onChange={(e) => set('dias_solicitados', e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Fecha inicio</label>
          <input
            className={s.input}
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => set('fecha_inicio', e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Fecha fin</label>
          <input
            className={s.input}
            type="date"
            value={form.fecha_fin}
            onChange={(e) => set('fecha_fin', e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>
          Cancelar
        </button>

        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => onSave(form)}
          disabled={!valid}
        >
          Registrar solicitud
        </button>
      </div>
    </>
  );
}

const estadoBadge = (estado) => {
  const map = {
    pendiente: s.badgeWarning,
    aprobada: s.badgeSuccess,
    rechazada: s.badgeDanger,
  };

  return map[estado] || s.badgeAccent;
};

export default function Vacaciones() {
  const dispatch = useDispatch();

  const vacaciones = useSelector(selectVacaciones);
  const funcionarios = useSelector(selectFuncionarios);

  const loadingVacaciones = useSelector(selectVacacionesLoading);
  const loadingFuncionarios = useSelector(selectFuncionariosLoading);
  const error = useSelector(selectVacacionesError);

  const loading = loadingVacaciones || loadingFuncionarios;

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchVacaciones());
    dispatch(fetchFuncionarios());
  }, [dispatch]);

  const getFuncionario = (idFuncionario, vacacion) => {
    if (vacacion?.funcionario) return vacacion.funcionario;

    return funcionarios.find(
      (f) => Number(f.id_funcionario) === Number(idFuncionario)
    );
  };

  const filtered = vacaciones.filter((v) => {
    const f = getFuncionario(v.id_funcionario, v);
    const nombreCompleto = `${f?.nombres || ''} ${f?.apellidos || ''}`.toLowerCase();

    return !search || nombreCompleto.includes(search.toLowerCase());
  });

  const handleSave = async (form) => {
    const payload = {
      id_funcionario: Number(form.id_funcionario),
      dias_solicitados: Number(form.dias_solicitados),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
    };

    await dispatch(solicitarVacaciones(payload)).unwrap();

    setModal(null);
    dispatch(fetchVacaciones());
  };

  const handleCambiarEstado = async (idVacacion, estado) => {
    await dispatch(
      cambiarEstadoVacacion({
        idVacacion,
        estado,
      })
    ).unwrap();

    dispatch(fetchVacaciones());
  };

  const pendientes = vacaciones.filter((v) => v.estado === 'pendiente').length;
  const aprobadas = vacaciones.filter((v) => v.estado === 'aprobada').length;
  const rechazadas = vacaciones.filter((v) => v.estado === 'rechazada').length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Vacaciones</div>
          <div className={s.pageSubheading}>
            Gestión de solicitudes de vacaciones
          </div>
        </div>

        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => setModal({ mode: 'create' })}
        >
          + Nueva solicitud
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className={s.card}>
          <strong>Pendientes</strong>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{pendientes}</div>
        </div>

        <div className={s.card}>
          <strong>Aprobadas</strong>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{aprobadas}</div>
        </div>

        <div className={s.card}>
          <strong>Rechazadas</strong>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{rechazadas}</div>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input
            className={s.searchInput}
            placeholder="Buscar funcionario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ padding: 12, color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={s.loading}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyText}>No hay registros de vacaciones</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Funcionario</th>
                <th>Gestión</th>
                <th>Disponibles</th>
                <th>Solicitados</th>
                <th>Restantes</th>
                <th>Período</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => {
                const f = getFuncionario(v.id_funcionario, v);

                return (
                  <tr key={v.id_vacacion}>
                    <td>
                      <strong>
                        {f?.nombres} {f?.apellidos}
                      </strong>
                    </td>

                    <td>{v.gestion}</td>
                    <td>{v.dias_disponibles}</td>
                    <td>{v.dias_solicitados}</td>

                    <td style={{ fontWeight: 600 }}>
                      {v.dias_restantes}
                    </td>

                    <td
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: 12,
                      }}
                    >
                      {v.fecha_inicio
                        ? `${v.fecha_inicio} → ${v.fecha_fin || '?'}`
                        : '—'}
                    </td>

                    <td>
                      <span className={`${s.badge} ${estadoBadge(v.estado)}`}>
                        {v.estado}
                      </span>
                    </td>

                    <td>
                      <div className={s.actions}>
                        {v.estado === 'pendiente' ? (
                          <>
                            <button
                              className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`}
                              onClick={() =>
                                handleCambiarEstado(
                                  v.id_vacacion,
                                  'aprobada'
                                )
                              }
                            >
                              Aprobar
                            </button>

                            <button
                              className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                              onClick={() =>
                                handleCambiarEstado(
                                  v.id_vacacion,
                                  'rechazada'
                                )
                              }
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span
                            style={{
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                            }}
                          >
                            Sin acciones
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modal?.mode === 'create'}
        onClose={() => setModal(null)}
        title="Nueva solicitud de vacaciones"
        large
      >
        <VacacionForm
          funcionarios={funcionarios}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}