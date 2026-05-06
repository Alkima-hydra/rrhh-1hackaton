import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import * as api from '../../lib/api.contratos';
import s from '../../styles/shared.module.css';
import styles from './Contratos.module.css';

const EMPTY = { id_funcionario: '', id_plantilla: '', fecha_ingreso: '', salario: '', tiempo_prueba: '', contenido_generado: '', activo: true };

function generarContenido(plantilla, funcionario, cargo, form) {
  if (!plantilla || !funcionario) return '';
  const hoy = new Date().toLocaleDateString('es-BO');
  return plantilla.contenido
    .replace(/{nombres}/g, funcionario.nombres)
    .replace(/{apellidos}/g, funcionario.apellidos)
    .replace(/{ci}/g, funcionario.ci)
    .replace(/{cargo}/g, cargo?.nombre || 'Sin cargo')
    .replace(/{salario}/g, `Bs. ${form.salario}`)
    .replace(/{fecha_ingreso}/g, form.fecha_ingreso)
    .replace(/{tiempo_prueba}/g, form.tiempo_prueba)
    .replace(/{ciudad}/g, 'La Paz')
    .replace(/{fecha}/g, hoy)
    .replace(/{empresa}/g, 'Empresa S.A.');
}

function ContratoForm({ initial, funcionarios, plantillas, allCargos, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm(f => {
    const updated = { ...f, [k]: v };
    // Auto-generate content when deps change
    if (['id_funcionario', 'id_plantilla', 'salario', 'fecha_ingreso', 'tiempo_prueba'].includes(k)) {
      const func = funcionarios.find(fn => fn.id_funcionario === Number(updated.id_funcionario));
      const plant = plantillas.find(p => p.id_plantilla === Number(updated.id_plantilla));
      const cargo = allCargos.find(c => c.id_cargo === func?.id_cargo);
      if (func && plant) updated.contenido_generado = generarContenido(plant, func, cargo, updated);
    }
    return updated;
  });

  const valid = form.id_funcionario && form.fecha_ingreso && form.salario && form.tiempo_prueba && form.contenido_generado;

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Funcionario</label>
          <select className={s.select} value={form.id_funcionario} onChange={e => set('id_funcionario', Number(e.target.value))}>
            <option value="">Seleccionar...</option>
            {funcionarios.map(f => <option key={f.id_funcionario} value={f.id_funcionario}>{f.nombres} {f.apellidos}</option>)}
          </select>
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={s.label}>Plantilla base</label>
          <select className={s.select} value={form.id_plantilla || ''} onChange={e => set('id_plantilla', Number(e.target.value) || '')}>
            <option value="">Sin plantilla (manual)</option>
            {plantillas.map(p => <option key={p.id_plantilla} value={p.id_plantilla}>{p.nombre}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Fecha de ingreso</label>
          <input className={s.input} type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Salario (Bs.)</label>
          <input className={s.input} type="number" min="0" step="0.01" value={form.salario} onChange={e => set('salario', e.target.value)} placeholder="0.00" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Tiempo de prueba</label>
          <input className={s.input} value={form.tiempo_prueba} onChange={e => set('tiempo_prueba', e.target.value)} placeholder="Ej: 3 meses" />
        </div>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Contenido generado</label>
          <textarea
            className={s.textarea}
            style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 12 }}
            value={form.contenido_generado}
            onChange={e => set('contenido_generado', e.target.value)}
            placeholder="El contenido se genera automáticamente al seleccionar plantilla y funcionario..."
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
          {initial?.id_contrato ? 'Guardar cambios' : 'Generar contrato'}
        </button>
      </div>
    </>
  );
}

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [viewContrato, setViewContrato] = useState(null);
  useEffect(() => { 
    load(); 
  }, []);
  const load = async () => {
    try {
      setLoading(true);

      const [c] = await Promise.all([
        api.getContratos(),
      ]);

      console.log("CONTRATOS:", c);
      setContratos(c);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false); 
    }
  };

  const getFunc = (id) => funcionarios.find(f => f.id_funcionario === id);
  const getPlantilla = (id) => plantillas.find(p => p.id_plantilla === id);

  const handleSave = async (form) => {
    const data = { ...form, salario: parseFloat(form.salario), id_plantilla: form.id_plantilla || null };
    if (modal.data?.id_contrato) await store.updateContrato(modal.data.id_contrato, data);
    else await store.createContrato(data);
    setModal(null); load();
  };

  const handleDelete = async () => { await store.deleteContrato(modal.data.id_contrato); setModal(null); load(); };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Contratos</div>
          <div className={s.pageSubheading}>Generación y gestión de contratos laborales</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nuevo contrato
        </button>
      </div>


      <div className={s.tableWrapper}>
        {loading ? <div className={s.loading}>Cargando...</div> :
          contratos.length === 0 ? <div className={s.empty}><div className={s.emptyIcon}>📝</div><div className={s.emptyText}>No hay contratos</div></div> :
          <table className={s.table}>
            <thead><tr><th>Funcionario</th><th>Plantilla</th><th>Fecha ingreso</th><th>Salario</th><th>Prueba</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {contratos.map(c => {
                const f = getFunc(c.id_funcionario);
                const p = getPlantilla(c.id_plantilla);
                return (
                  <tr key={c.id_contrato}>
                    <td><strong>{f?.nombres} {f?.apellidos}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p?.nombre || '—'}</td>
                    <td>{c.fecha_ingreso}</td>
                    <td style={{ fontWeight: 600 }}>Bs. {Number(c.salario).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                    <td>{c.tiempo_prueba}</td>
                    <td><span className={`${s.badge} ${c.activo ? s.badgeSuccess : s.badgeDanger}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className={s.actions}>
                      <button
                          onClick={async () => {
                            try {
                                      const datos = {
          nombres: "Carlos Mendoza",
          fecha_ingreso: "2024-01-15",
          salario: "3500.50",
          tiempo_prueba: "3 meses",
          activo: true,
          ciudad: "La Paz",
          empresa: "Empresa S.A."
        };
                              const blob = await api.mostrarCertificado(datos, "contrato-rellenable"); 
                              const url = window.URL.createObjectURL(blob);
                              window.open(url); // abre el PDF en nueva pestaña
                            } catch (err) {
                              console.error("Error al mostrar PDF", err);
                            }
                          }}
                        >
                          👁 Ver PDF
                        </button>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: c })}>✏️</button>
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: c })}>🗑️</button>
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
        title={modal?.mode === 'edit' ? 'Editar contrato' : 'Generar nuevo contrato'}
        large
      >
        <ContratoForm
          funcionarios={funcionarios} plantillas={plantillas} allCargos={cargos}
          initial={modal?.data} onSave={handleSave} onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={!!viewContrato}
        onClose={() => setViewContrato(null)}
        title={`Contrato — ${getFunc(viewContrato?.id_funcionario)?.nombres || ''} ${getFunc(viewContrato?.id_funcionario)?.apellidos || ''}`}
        large
      >
        <div className={styles.contratoPreview}>
          <pre>{viewContrato?.contenido_generado}</pre>
        </div>
      </Modal>

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar contrato"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <div className={s.confirmText}>¿Eliminar este contrato?</div>
        </div>
      </Modal>
    </div>
  );
}
