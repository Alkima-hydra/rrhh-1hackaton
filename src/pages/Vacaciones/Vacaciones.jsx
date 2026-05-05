import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import * as store from '../../data/store';
import s from '../../styles/shared.module.css';

const ESTADOS = ['pendiente', 'aprobada', 'rechazada', 'tomada'];

const EMPTY = {
  id_funcionario: '', gestion: new Date().getFullYear(),
  dias_disponibles: '', dias_solicitados: '',
  dias_restantes: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente',
};

function VacacionForm({ initial, funcionarios, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDias = (k, v) => {
    const val = parseInt(v) || 0;
    const updated = { ...form, [k]: val };
    if (k === 'dias_disponibles' || k === 'dias_solicitados') {
      const disp = k === 'dias_disponibles' ? val : (parseInt(form.dias_disponibles) || 0);
      const sol = k === 'dias_solicitados' ? val : (parseInt(form.dias_solicitados) || 0);
      updated.dias_restantes = Math.max(0, disp - sol);
    }
    setForm(updated);
  };

  const valid = form.id_funcionario && form.gestion && form.dias_disponibles && form.dias_solicitados;

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Funcionario</label>
          <select className={s.select} value={form.id_funcionario} onChange={e => set('id_funcionario', Number(e.target.value))}>
            <option value="">Seleccionar funcionario...</option>
            {funcionarios.map(f => <option key={f.id_funcionario} value={f.id_funcionario}>{f.nombres} {f.apellidos}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Gestión (año)</label>
          <input className={s.input} type="number" min="2000" max="2100" value={form.gestion} onChange={e => set('gestion', parseInt(e.target.value))} />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Estado</label>
          <select className={s.select} value={form.estado} onChange={e => set('estado', e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Días disponibles</label>
          <input className={s.input} type="number" min="0" value={form.dias_disponibles} onChange={e => handleDias('dias_disponibles', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Días solicitados</label>
          <input className={s.input} type="number" min="0" value={form.dias_solicitados} onChange={e => handleDias('dias_solicitados', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Días restantes</label>
          <input className={s.input} type="number" value={form.dias_restantes} readOnly style={{ opacity: 0.6 }} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Fecha inicio</label>
          <input className={s.input} type="date" value={form.fecha_inicio || ''} onChange={e => set('fecha_inicio', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Fecha fin</label>
          <input className={s.input} type="date" value={form.fecha_fin || ''} onChange={e => set('fecha_fin', e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>Cancelar</button>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => onSave(form)} disabled={!valid}>
          {initial?.id_vacacion ? 'Guardar cambios' : 'Registrar vacación'}
        </button>
      </div>
    </>
  );
}

const estadoBadge = (estado) => {
  const map = { pendiente: s.badgeWarning, aprobada: s.badgeSuccess, rechazada: s.badgeDanger, tomada: s.badgeAccent };
  return map[estado] || s.badgeAccent;
};

export default function Vacaciones() {
  const [vacaciones, setVacaciones] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const [v, f] = await Promise.all([store.getVacaciones(), store.getFuncionarios()]);
    setVacaciones(v); setFuncionarios(f); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getFuncionario = (id) => funcionarios.find(f => f.id_funcionario === id);

  const filtered = vacaciones.filter(v => {
    const f = getFuncionario(v.id_funcionario);
    return !search || `${f?.nombres} ${f?.apellidos}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleSave = async (form) => {
    const data = { ...form, dias_disponibles: parseInt(form.dias_disponibles), dias_solicitados: parseInt(form.dias_solicitados), dias_restantes: parseInt(form.dias_restantes) };
    if (modal.data?.id_vacacion) await store.updateVacacion(modal.data.id_vacacion, data);
    else await store.createVacacion(data);
    setModal(null); load();
  };

  const handleDelete = async () => { await store.deleteVacacion(modal.data.id_vacacion); setModal(null); load(); };

  const pendientes = vacaciones.filter(v => v.estado === 'pendiente').length;
  const aprobadas = vacaciones.filter(v => v.estado === 'aprobada').length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Vacaciones</div>
          <div className={s.pageSubheading}>Gestión de solicitudes y registro de vacaciones</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nueva solicitud
        </button>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}><div className={s.statValue}>{vacaciones.length}</div><div className={s.statLabel}>Total registros</div></div>
        <div className={s.statCard}><div className={s.statValue}>{pendientes}</div><div className={s.statLabel}>Pendientes</div></div>
        <div className={s.statCard}><div className={s.statValue}>{aprobadas}</div><div className={s.statLabel}>Aprobadas</div></div>
      </div>

      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input className={s.searchInput} placeholder="🔍 Buscar funcionario..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className={s.loading}>Cargando...</div> :
          filtered.length === 0 ? <div className={s.empty}><div className={s.emptyIcon}>🌴</div><div className={s.emptyText}>No hay registros de vacaciones</div></div> :
          <table className={s.table}>
            <thead><tr><th>Funcionario</th><th>Gestión</th><th>Disponibles</th><th>Solicitados</th><th>Restantes</th><th>Período</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(v => {
                const f = getFuncionario(v.id_funcionario);
                return (
                  <tr key={v.id_vacacion}>
                    <td><strong>{f?.nombres} {f?.apellidos}</strong></td>
                    <td>{v.gestion}</td>
                    <td>{v.dias_disponibles}</td>
                    <td>{v.dias_solicitados}</td>
                    <td style={{ fontWeight: 600 }}>{v.dias_restantes}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                      {v.fecha_inicio ? `${v.fecha_inicio} → ${v.fecha_fin || '?'}` : '—'}
                    </td>
                    <td><span className={`${s.badge} ${estadoBadge(v.estado)}`}>{v.estado}</span></td>
                    <td>
                      <div className={s.actions}>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: v })}>✏️</button>
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: v })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      </div>

      <Modal
        open={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar solicitud' : 'Nueva solicitud de vacación'}
        large
      >
        <VacacionForm funcionarios={funcionarios} initial={modal?.data} onSave={handleSave} onCancel={() => setModal(null)} />
      </Modal>

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar registro"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <div className={s.confirmText}>¿Eliminar este registro de vacación?</div>
        </div>
      </Modal>
    </div>
  );
}
