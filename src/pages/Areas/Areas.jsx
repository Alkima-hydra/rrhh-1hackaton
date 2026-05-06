import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../components/Modal/Modal';
import {
  fetchAreas,
  createArea,
  updateArea,
  deleteArea,
  selectAreas,
  selectAreasLoading,
} from '../../store/slice/areasSlice';
import s from '../../styles/shared.module.css';
import { Plus, Pencil, Trash2, Building2, AlertTriangle, Search } from 'lucide-react';

function AreaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Nombre</label>
          <input
            className={s.input}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre del área"
          />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Descripción</label>
          <textarea
            className={s.textarea}
            value={form.descripcion || ''}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Descripción opcional..."
          />
        </div>
      </div>
      <div
        className={s.formGridFull}
        style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}
      >
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>
          Cancelar
        </button>
        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => onSave(form)}
          disabled={!form.nombre.trim()}
        >
          {initial?.id_area ? 'Guardar cambios' : 'Crear área'}
        </button>
      </div>
    </>
  );
}

export default function Areas() {
  const dispatch = useDispatch();
  const areas = useSelector(selectAreas);
  const loading = useSelector(selectAreasLoading);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit'|'delete', data? }

  useEffect(() => {
    dispatch(fetchAreas());
  }, [dispatch]);

  const filtered = areas.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (a.descripcion || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    if (modal.data?.id_area) {
      await dispatch(updateArea({ id: modal.data.id_area, form }));
    } else {
      await dispatch(createArea(form));
    }
    setModal(null);
  };

  const handleDelete = async () => {
    await dispatch(deleteArea(modal.data.id_area));
    setModal(null);
  };

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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={s.loading}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}><Building2 size={48} /></div>
            <div className={s.emptyText}>No hay áreas para mostrar</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((area) => (
                <tr key={area.id_area}>
                  <td><strong>{area.nombre}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{area.descripcion || '—'}</td>
                  <td>
                    <div className={s.actions}>
                      <button
                        className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`}
                        onClick={() => setModal({ mode: 'edit', data: area })}
                      >
                        <Pencil size={16} /> Editar
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

      {/* Create / Edit */}
      <Modal
        open={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar área' : 'Nueva área'}
        subtitle={
          modal?.mode === 'edit'
            ? `Modificando: ${modal.data?.nombre}`
            : 'Registra una nueva área organizacional'
        }
      >
        <AreaForm
          initial={modal?.data}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete */}
      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar área"
        footer={
          <>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>
              Sí, eliminar
            </button>
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
