import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { cargosService } from '../../lib/cargos.service';
import s from '../../styles/shared.module.css';

function CargoForm({ initial, areas, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', id_area: '', activo: true, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.nombre.trim() && form.id_area;

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Área</label>
          <select className={s.select} value={form.id_area} onChange={e => set('id_area', Number(e.target.value))}>
            <option value="">Seleccionar área...</option>
            {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
          </select>
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Nombre del cargo</label>
          <input className={s.input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Desarrollador Senior" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Descripción</label>
          <textarea className={s.textarea} value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción del cargo..." />
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
          {initial?.id_cargo ? 'Guardar cambios' : 'Crear cargo'}
        </button>
      </div>
    </>
  );
}

export default function Cargos() {
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const c = await cargosService.getAll();
    setCargos(c.data.cargos ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = cargos.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(search.toLowerCase())
  );

  const getArea = (id) => areas.find(a => a.id_area === id);

  const handleSave = async (form) => {
    if (modal.data?.id_cargo) {
      await cargosService.update(modal.data.id_cargo, form);
    } else {
      await cargosService.create(form);
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    await cargosService.desactivar(modal.data.id_cargo);
    setModal(null);
    load();
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Cargos</div>
          <div className={s.pageSubheading}>Administra los cargos disponibles por área</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nuevo cargo
        </button>
      </div>


      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input className={s.searchInput} placeholder="🔍 Buscar cargo..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className={s.loading}>Cargando...</div> :
          filtered.length === 0 ? <div className={s.empty}><div className={s.emptyIcon}>🎯</div><div className={s.emptyText}>No hay cargos</div></div> :
          <table className={s.table}>
            <thead><tr><th>Cargo</th><th>Área</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id_cargo}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>
                    <span className={`${s.badge} ${s.badgeAccent}`}>
                      {getArea(c.id_area)?.nombre || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.descripcion || '—'}</td>
                  <td><span className={`${s.badge} ${c.activo ? s.badgeSuccess : s.badgeDanger}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className={s.actions}>
                      <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: c })}>✏️ Editar</button>
                      <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: c })}>🗑️</button>
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
        title={modal?.mode === 'edit' ? 'Editar cargo' : 'Nuevo cargo'}
      >
        <CargoForm areas={areas} initial={modal?.data} onSave={handleSave} onCancel={() => setModal(null)} />
      </Modal>

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar cargo"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <strong>{modal?.data?.nombre}</strong>
          <div className={s.confirmText}>¿Eliminar este cargo? Esta acción no se puede deshacer.</div>
        </div>
      </Modal>
    </div>
  );
}
