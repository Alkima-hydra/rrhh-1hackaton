import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import Modal from '../../components/Modal/Modal';
import s from '../../styles/shared.module.css';

import {
  fetchVacaciones,
  createVacacion,
  updateEstadoVacacion,
  selectVacaciones,
  selectVacacionesLoading,
  selectVacacionesError,
} from '../../store/slice/vacacionesSlice';

import {
  fetchFuncionarios,
  selectFuncionarios,
  selectFuncionariosLoading,
} from '../../store/slice/funcionariosSlices';

const EMPTY = {
  id_funcionario: '',
  dias_solicitados: '',
  fecha_inicio: '',
  fecha_fin: '',
};

const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return '';

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;

  return dias > 0 ? dias : '';
};

function VacacionForm({ funcionarios, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFechaInicio = (value) => {
    const dias = calcularDiasEntreFechas(value, form.fecha_fin);

    setForm((prev) => ({
      ...prev,
      fecha_inicio: value,
      dias_solicitados: dias,
    }));
  };

  const handleFechaFin = (value) => {
    const dias = calcularDiasEntreFechas(form.fecha_inicio, value);

    setForm((prev) => ({
      ...prev,
      fecha_fin: value,
      dias_solicitados: dias,
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
          <label className={`${s.label} ${s.required}`}>Fecha inicio</label>
          <input
            className={s.input}
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => handleFechaInicio(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Fecha fin</label>
          <input
            className={s.input}
            type="date"
            value={form.fecha_fin}
            min={form.fecha_inicio || undefined}
            onChange={(e) => handleFechaFin(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Días solicitados</label>
          <input
            className={s.input}
            type="number"
            value={form.dias_solicitados}
            readOnly
            style={{ opacity: 0.7 }}
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
    try {
      const diasCalculados = calcularDiasEntreFechas(
        form.fecha_inicio,
        form.fecha_fin
      );

      if (!diasCalculados || diasCalculados <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Fechas inválidas',
          text: 'La fecha fin no puede ser menor que la fecha inicio.',
        });
        return;
      }

      const payload = {
        id_funcionario: Number(form.id_funcionario),
        dias_solicitados: Number(diasCalculados),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      };

      await dispatch(createVacacion(payload)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Solicitud registrada',
        text: 'La solicitud de vacaciones fue registrada correctamente.',
        timer: 1800,
        showConfirmButton: false,
      });

      setModal(null);
      dispatch(fetchVacaciones());
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo registrar',
        text: error || 'Ocurrió un error al registrar la solicitud.',
      });
    }
  };

  const handleCambiarEstado = async (idVacacion, estado) => {
    try {
      await dispatch(
        updateEstadoVacacion({
          id: idVacacion,
          estado,
        })
      ).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La solicitud fue ${estado} correctamente.`,
        timer: 1600,
        showConfirmButton: false,
      });

      dispatch(fetchVacaciones());
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error || 'Ocurrió un error al cambiar el estado.',
      });
    }
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
                    <td style={{ fontWeight: 600 }}>{v.dias_restantes}</td>

                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
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
                                handleCambiarEstado(v.id_vacacion, 'aprobada')
                              }
                            >
                              Aprobar
                            </button>

                            <button
                              className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                              onClick={() =>
                                handleCambiarEstado(v.id_vacacion, 'rechazada')
                              }
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
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