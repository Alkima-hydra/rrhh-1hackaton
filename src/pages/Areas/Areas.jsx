import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import * as store from '../../data/store';
import s from '../../styles/shared.module.css';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  AlertTriangle, 
  Search 
} from 'lucide-react';

function AreaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', activo: true, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Nombre</label>
          <input className={s.input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del área" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Descripción</label>
          <textarea className={s.textarea} value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción opcional..." />
        </div>
        <div className={s.field}>
          <label className={s.checkRow}>
            <input type="checkbox" className={s.checkbox} checked={form.activo} onChange={e => set('activo', e.target.checked)} />
            <span className={s.label}>Activo</span>
          </label>
        </div>
      </div>
      <div className={s.formGridFull} style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>Cancelar</button>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => onSave(form)} disabled={!form.nombre.trim()}>
          {initial?.id_area ? 'Guardar cambios' : 'Crear área'}
        </button>
      </div>
    </>
  );
}

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | {mode:'create'|'edit'|'delete', data?}

  const load = async () => { setLoading(true); setAreas(await store.getAreas()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = areas.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (a.descripcion || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    if (modal.data?.id_area) {
      await store.updateArea(modal.data.id_area, form);
    } else {
      await store.createArea(form);
    }
    setModal(null);
    load();
  };

  const handleDelete = async () => {
    await store.deleteArea(modal.data.id_area);
    setModal(null);
    load();
  };

  const activas = areas.filter(a => a.activo).length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Áreas</div>
          <div className={s.pageSubheading}>Gestiona las áreas organizacionales de la empresa</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nueva área
        </button>
      </div>


      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <Search size={18} className={s.searchIcon} />
            <input 
              className={s.searchInput} 
              placeholder="Buscar área..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
        </div>
        {loading ? (
          <div className={s.loading}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>
              <Building2 size={48} />
            </div>
            <div className={s.emptyText}>No hay áreas para mostrar</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(area => (
                <tr key={area.id_area}>
                  <td><strong>{area.nombre}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{area.descripcion || '—'}</td>
                  <td>
                    <span className={`${s.badge} ${area.activo ? s.badgeSuccess : s.badgeDanger}`}>
                      {area.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button 
                        className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} 
                        onClick={() => setModal({ mode: 'edit', data: area })}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button 
                        className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} 
                        onClick={() => setModal({ mode: 'delete', data: area })}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar área' : 'Nueva área'}
        subtitle={modal?.mode === 'edit' ? `Modificando: ${modal.data?.nombre}` : 'Registra una nueva área organizacional'}
      >
        <AreaForm
          initial={modal?.data}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar área"
        footer={
          <>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
            <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
          </>
        }
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <strong>{modal?.data?.nombre}</strong>
          <div className={s.confirmText}>
            Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta área?
          </div>
        </div>
      </Modal>
    </div>
  );
}
