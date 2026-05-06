import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import s from '../../styles/shared.module.css';
import { funcionariosService } from '../../lib/funcionarios.service';
import { cargosService } from '../../lib/cargos.service';

const EMPTY = {
  nombres: '', apellidos: '', ci: '', correo: '', telefono: '',
  direccion: '', id_area: '', id_cargo: '', remuneracion: '',
  fecha_ingreso: '', ratificado: false, activo: true,
};

function FuncionarioForm({ initial, areas, allCargos, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const cargos = allCargos.filter(c => !form.id_area || c.id_area === Number(form.id_area));

  const valid = form.nombres.trim() && form.apellidos.trim() && form.ci.trim() && form.remuneracion && form.fecha_ingreso;

  return (
    <>
      <div className={s.formGrid}>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Nombres</label>
          <input className={s.input} value={form.nombres} onChange={e => set('nombres', e.target.value)} placeholder="Nombres" />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Apellidos</label>
          <input className={s.input} value={form.apellidos} onChange={e => set('apellidos', e.target.value)} placeholder="Apellidos" />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>CI</label>
          <input className={s.input} value={form.ci} onChange={e => set('ci', e.target.value)} placeholder="Cédula de identidad" />
        </div>
        <div className={s.field}>
          <label className={s.label}>Correo electrónico</label>
          <input className={s.input} type="email" value={form.correo || ''} onChange={e => set('correo', e.target.value)} placeholder="correo@empresa.com" />
        </div>
        <div className={s.field}>
          <label className={s.label}>Teléfono</label>
          <input className={s.input} value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="77xxxxxx" />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Fecha de ingreso</label>
          <input className={s.input} type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Área</label>
          <select className={s.select} value={form.id_area || ''} onChange={e => { set('id_area', Number(e.target.value) || ''); set('id_cargo', ''); }}>
            <option value="">Sin área</option>
            {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>Cargo</label>
          <select className={s.select} value={form.id_cargo || ''} onChange={e => set('id_cargo', Number(e.target.value) || '')}>
            <option value="">Sin cargo</option>
            {cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Remuneración (Bs.)</label>
          <input className={s.input} type="number" min="0" step="0.01" value={form.remuneracion} onChange={e => set('remuneracion', e.target.value)} placeholder="0.00" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Dirección</label>
          <input className={s.input} value={form.direccion || ''} onChange={e => set('direccion', e.target.value)} placeholder="Dirección" />
        </div>
        <div className={s.field}>
          <label className={s.checkRow}>
            <input type="checkbox" className={s.checkbox} checked={form.ratificado} onChange={e => set('ratificado', e.target.checked)} />
            <span className={s.label}>Ratificado</span>
          </label>
        </div>
        <div className={s.field}>
          <label className={s.checkRow}>
            <input type="checkbox" className={s.checkbox} checked={form.activo} onChange={e => set('activo', e.target.checked)} />
            <span className={s.label}>Activo</span>
          </label>
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>Cancelar</button>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => onSave(form)} disabled={!valid}>
          {initial?.id_funcionario ? 'Guardar cambios' : 'Registrar funcionario'}
        </button>
      </div>
    </>
  );
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const [f, c] = await Promise.all([
      funcionariosService.getAll(),
      cargosService.getAll(),
    ]);
    setFuncionarios(f.data.funcionarios ?? []);
    setCargos(c.data.cargos ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = funcionarios.filter(f =>
    `${f.nombres} ${f.apellidos} ${f.ci}`.toLowerCase().includes(search.toLowerCase())
  );

  const getArea = (id) => areas.find(a => a.id_area === id);
  const getCargo = (id) => cargos.find(c => c.id_cargo === id);

  const handleSave = async (form) => {
    const data = {
      ...form,
      id_area: form.id_area || null,
      id_cargo: form.id_cargo || null,
      remuneracion: parseFloat(form.remuneracion),
    };
    if (modal.data?.id_funcionario) {
      await funcionariosService.update(modal.data.id_funcionario, data);
    } else {
      await funcionariosService.create(data);
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    await funcionariosService.darDeBaja(modal.data.id_funcionario);
    setModal(null);
    load();
  };

  const activos = funcionarios.filter(f => f.activo).length;
  const ratificados = funcionarios.filter(f => f.ratificado).length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Funcionarios</div>
          <div className={s.pageSubheading}>Registro y gestión del personal de la empresa</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nuevo funcionario
        </button>
      </div>

      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input className={s.searchInput} placeholder="🔍 Buscar por nombre o CI..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className={s.loading}>Cargando...</div> :
          filtered.length === 0 ? <div className={s.empty}><div className={s.emptyIcon}>👥</div><div className={s.emptyText}>No hay funcionarios</div></div> :
          <table className={s.table}>
            <thead>
              <tr><th>Funcionario</th><th>CI</th><th>Área / Cargo</th><th>Remuneración</th><th>Ingreso</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id_funcionario}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{f.nombres} {f.apellidos}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.correo || '—'}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{f.ci}</td>
                  <td>
                    <div>{getArea(f.id_area)?.nombre || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{getCargo(f.id_cargo)?.nombre || ''}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>Bs. {Number(f.remuneracion).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{f.fecha_ingreso}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className={`${s.badge} ${f.activo ? s.badgeSuccess : s.badgeDanger}`}>{f.activo ? 'Activo' : 'Inactivo'}</span>
                      {f.ratificado && <span className={`${s.badge} ${s.badgeAccent}`}>Ratificado</span>}
                    </div>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: f })}>✏️ Editar</button>
                      <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: f })}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      <Modal
        open={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar funcionario' : 'Nuevo funcionario'}
        large
      >
        <FuncionarioForm
          areas={areas} allCargos={cargos}
          initial={modal?.data}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar funcionario"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <strong>{modal?.data?.nombres} {modal?.data?.apellidos}</strong>
          <div className={s.confirmText}>¿Eliminar este funcionario? Esta acción no se puede deshacer.</div>
        </div>
      </Modal>
    </div>
  );
}
