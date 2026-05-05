import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import * as store from '../../data/store';
import s from '../../styles/shared.module.css';
import styles from './PlantillasContrato.module.css';

const VARIABLES = ['{nombres}', '{apellidos}', '{ci}', '{cargo}', '{salario}', '{fecha_ingreso}', '{tiempo_prueba}', '{ciudad}', '{fecha}', '{empresa}'];

function PlantillaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: '', contenido: '', activo: true, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const insertVar = (v) => set('contenido', form.contenido + v);

  const valid = form.nombre.trim() && form.contenido.trim();

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Nombre de la plantilla</label>
          <input className={s.input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Contrato Indefinido" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Variables disponibles</label>
          <div className={styles.variables}>
            {VARIABLES.map(v => (
              <button key={v} type="button" className={styles.varChip} onClick={() => insertVar(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Contenido del contrato</label>
          <textarea
            className={s.textarea}
            style={{ minHeight: 240, fontFamily: 'monospace', fontSize: 13 }}
            value={form.contenido}
            onChange={e => set('contenido', e.target.value)}
            placeholder="Escribe el contenido del contrato. Usa las variables arriba para campos dinámicos..."
          />
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
          {initial?.id_plantilla ? 'Guardar cambios' : 'Crear plantilla'}
        </button>
      </div>
    </>
  );
}

function PreviewModal({ plantilla, onClose }) {
  return (
    <Modal open={!!plantilla} onClose={onClose} title={`Vista previa: ${plantilla?.nombre}`} large>
      <div className={styles.preview}>
        <pre>{plantilla?.contenido}</pre>
      </div>
    </Modal>
  );
}

export default function PlantillasContrato() {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);

  const load = async () => { setLoading(true); setPlantillas(await store.getPlantillas()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (modal.data?.id_plantilla) await store.updatePlantilla(modal.data.id_plantilla, form);
    else await store.createPlantilla(form);
    setModal(null); load();
  };

  const handleDelete = async () => { await store.deletePlantilla(modal.data.id_plantilla); setModal(null); load(); };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Plantillas de Contrato</div>
          <div className={s.pageSubheading}>Define las plantillas reutilizables para generación de contratos</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nueva plantilla
        </button>
      </div>
      
      {loading ? <div className={s.loading}>Cargando...</div> : plantillas.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>📋</div><div className={s.emptyText}>No hay plantillas</div></div>
      ) : (
        <div className={styles.grid}>
          {plantillas.map(p => (
            <div key={p.id_plantilla} className={styles.plantillaCard}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>📋</div>
                <span className={`${s.badge} ${p.activo ? s.badgeSuccess : s.badgeDanger}`}>{p.activo ? 'Activa' : 'Inactiva'}</span>
              </div>
              <div className={styles.cardName}>{p.nombre}</div>
              <div className={styles.cardPreview}>{p.contenido.slice(0, 120)}...</div>
              <div className={styles.cardDate}>Creada: {new Date(p.fecha_creacion).toLocaleDateString('es-BO')}</div>
              <div className={styles.cardActions}>
                <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setPreview(p)}>👁 Ver</button>
                <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: p })}>✏️ Editar</button>
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: p })}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal?.mode === 'create' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar plantilla' : 'Nueva plantilla de contrato'}
        large
      >
        <PlantillaForm initial={modal?.data} onSave={handleSave} onCancel={() => setModal(null)} />
      </Modal>

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar plantilla"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <strong>{modal?.data?.nombre}</strong>
          <div className={s.confirmText}>¿Eliminar esta plantilla?</div>
        </div>
      </Modal>

      <PreviewModal plantilla={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
