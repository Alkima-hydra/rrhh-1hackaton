import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import * as store from '../../data/store';
import s from '../../styles/shared.module.css';
import styles from './Boletas.module.css';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TIPOS = ['bono', 'descuento'];
const ESTADOS_BOLETA = ['generada', 'pagada', 'anulada'];

const EMPTY_BOLETA = { id_funcionario: '', mes: new Date().getMonth() + 1, gestion: new Date().getFullYear(), sueldo_basico: '', total_bonos: 0, total_descuentos: 0, total_pagado: '', fecha_pago: '', estado: 'generada' };
const EMPTY_DETALLE = { tipo: 'bono', concepto: '', monto: '' };

function BoletaForm({ initial, funcionarios, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_BOLETA, ...initial });
  const [detalles, setDetalles] = useState([]);
  const [newDet, setNewDet] = useState({ ...EMPTY_DETALLE });
  const setF = (k, v) => setForm(f => {
    const u = { ...f, [k]: v };
    const bonos = detalles.filter(d => d.tipo === 'bono').reduce((a, d) => a + Number(d.monto), 0);
    const desc = detalles.filter(d => d.tipo === 'descuento').reduce((a, d) => a + Number(d.monto), 0);
    u.total_bonos = bonos;
    u.total_descuentos = desc;
    u.total_pagado = (Number(u.sueldo_basico) + bonos - desc).toFixed(2);
    return u;
  });

  // recalculate when detalles change
  useEffect(() => {
    const bonos = detalles.filter(d => d.tipo === 'bono').reduce((a, d) => a + Number(d.monto), 0);
    const desc = detalles.filter(d => d.tipo === 'descuento').reduce((a, d) => a + Number(d.monto), 0);
    setForm(f => ({ ...f, total_bonos: bonos, total_descuentos: desc, total_pagado: (Number(f.sueldo_basico) + bonos - desc).toFixed(2) }));
  }, [detalles]);

  const addDetalle = () => {
    if (!newDet.concepto || !newDet.monto) return;
    setDetalles(d => [...d, { ...newDet, monto: parseFloat(newDet.monto) }]);
    setNewDet({ ...EMPTY_DETALLE });
  };

  const removeDetalle = (i) => setDetalles(d => d.filter((_, idx) => idx !== i));

  const valid = form.id_funcionario && form.mes && form.gestion && form.sueldo_basico;

  return (
    <>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Funcionario</label>
          <select className={s.select} value={form.id_funcionario} onChange={e => setF('id_funcionario', Number(e.target.value))}>
            <option value="">Seleccionar...</option>
            {funcionarios.map(f => <option key={f.id_funcionario} value={f.id_funcionario}>{f.nombres} {f.apellidos}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Mes</label>
          <select className={s.select} value={form.mes} onChange={e => setF('mes', Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Gestión</label>
          <input className={s.input} type="number" min="2000" value={form.gestion} onChange={e => setF('gestion', parseInt(e.target.value))} />
        </div>
        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Sueldo básico (Bs.)</label>
          <input className={s.input} type="number" step="0.01" value={form.sueldo_basico} onChange={e => setF('sueldo_basico', e.target.value)} placeholder="0.00" />
        </div>
        <div className={s.field}>
          <label className={s.label}>Fecha de pago</label>
          <input className={s.input} type="date" value={form.fecha_pago || ''} onChange={e => setF('fecha_pago', e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Estado</label>
          <select className={s.select} value={form.estado} onChange={e => setF('estado', e.target.value)}>
            {ESTADOS_BOLETA.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Detalle */}
      <div className={styles.detalleSection}>
        <div className={styles.detalleSectionTitle}>Bonos y Descuentos</div>
        <div className={styles.detalleForm}>
          <select className={s.select} style={{ width: 120 }} value={newDet.tipo} onChange={e => setNewDet(d => ({ ...d, tipo: e.target.value }))}>
            {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <input className={s.input} placeholder="Concepto" value={newDet.concepto} onChange={e => setNewDet(d => ({ ...d, concepto: e.target.value }))} style={{ flex: 1 }} />
          <input className={s.input} type="number" placeholder="Monto" value={newDet.monto} onChange={e => setNewDet(d => ({ ...d, monto: e.target.value }))} style={{ width: 120 }} />
          <button className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`} onClick={addDetalle}>+ Añadir</button>
        </div>
        {detalles.length > 0 && (
          <table className={s.table} style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>
            <thead><tr><th>Tipo</th><th>Concepto</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {detalles.map((d, i) => (
                <tr key={i}>
                  <td><span className={`${s.badge} ${d.tipo === 'bono' ? s.badgeSuccess : s.badgeDanger}`}>{d.tipo}</span></td>
                  <td>{d.concepto}</td>
                  <td>Bs. {Number(d.monto).toFixed(2)}</td>
                  <td><button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => removeDetalle(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totales */}
      <div className={styles.totales}>
        <div className={styles.totalesRow}><span>Sueldo básico</span><span>Bs. {Number(form.sueldo_basico || 0).toFixed(2)}</span></div>
        <div className={styles.totalesRow}><span>+ Total bonos</span><span style={{ color: 'var(--success)' }}>Bs. {Number(form.total_bonos).toFixed(2)}</span></div>
        <div className={styles.totalesRow}><span>− Total descuentos</span><span style={{ color: 'var(--danger)' }}>Bs. {Number(form.total_descuentos).toFixed(2)}</span></div>
        <div className={`${styles.totalesRow} ${styles.totalesTotal}`}><span>Total a pagar</span><span>Bs. {Number(form.total_pagado || 0).toFixed(2)}</span></div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>Cancelar</button>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => onSave(form, detalles)} disabled={!valid}>
          {initial?.id_boleta ? 'Guardar cambios' : 'Generar boleta'}
        </button>
      </div>
    </>
  );
}

function DetalleModal({ boleta, onClose }) {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boleta) return;
    store.getDetallesBoleta(boleta.id_boleta).then(d => { setDetalles(d); setLoading(false); });
  }, [boleta]);

  return (
    <Modal open={!!boleta} onClose={onClose} title="Detalle de boleta" large>
      {loading ? <div className={s.loading}>Cargando...</div> : (
        <div>
          <div className={styles.totales}>
            <div className={styles.totalesRow}><span>Sueldo básico</span><span>Bs. {Number(boleta?.sueldo_basico).toFixed(2)}</span></div>
            <div className={styles.totalesRow}><span>Total bonos</span><span style={{ color: 'var(--success)' }}>Bs. {Number(boleta?.total_bonos).toFixed(2)}</span></div>
            <div className={styles.totalesRow}><span>Total descuentos</span><span style={{ color: 'var(--danger)' }}>Bs. {Number(boleta?.total_descuentos).toFixed(2)}</span></div>
            <div className={`${styles.totalesRow} ${styles.totalesTotal}`}><span>Total pagado</span><span>Bs. {Number(boleta?.total_pagado).toFixed(2)}</span></div>
          </div>
          {detalles.length > 0 ? (
            <table className={s.table} style={{ marginTop: 16 }}>
              <thead><tr><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead>
              <tbody>
                {detalles.map(d => (
                  <tr key={d.id_detalle}>
                    <td><span className={`${s.badge} ${d.tipo === 'bono' ? s.badgeSuccess : s.badgeDanger}`}>{d.tipo}</span></td>
                    <td>{d.concepto}</td>
                    <td>Bs. {Number(d.monto).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className={s.empty}><div className={s.emptyText}>Sin detalles registrados</div></div>}
        </div>
      )}
    </Modal>
  );
}

const estadoBadge = (e) => ({ generada: s.badgeAccent, pagada: s.badgeSuccess, anulada: s.badgeDanger }[e] || s.badgeAccent);

export default function Boletas() {
  const [boletas, setBoletas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailBoleta, setDetailBoleta] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [b, f] = await Promise.all([store.getBoletas(), store.getFuncionarios()]);
    setBoletas(b); setFuncionarios(f); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getFunc = (id) => funcionarios.find(f => f.id_funcionario === id);

  const filtered = boletas.filter(b => {
    const f = getFunc(b.id_funcionario);
    return !search || `${f?.nombres} ${f?.apellidos}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleSave = async (form, detalles) => {
    const data = { ...form, sueldo_basico: parseFloat(form.sueldo_basico), total_pagado: parseFloat(form.total_pagado) };
    if (modal.data?.id_boleta) await store.updateBoleta(modal.data.id_boleta, data);
    else await store.createBoleta(data, detalles);
    setModal(null); load();
  };

  const handleDelete = async () => { await store.deleteBoleta(modal.data.id_boleta); setModal(null); load(); };

  const totalPagado = boletas.reduce((a, b) => a + Number(b.total_pagado), 0);
  const pagadas = boletas.filter(b => b.estado === 'pagada').length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Boletas de Pago</div>
          <div className={s.pageSubheading}>Gestión de nómina y comprobantes de pago</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setModal({ mode: 'create' })}>
          + Nueva boleta
        </button>
      </div>


      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input className={s.searchInput} placeholder="🔍 Buscar funcionario..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className={s.loading}>Cargando...</div> :
          filtered.length === 0 ? <div className={s.empty}><div className={s.emptyIcon}>💰</div><div className={s.emptyText}>No hay boletas</div></div> :
          <table className={s.table}>
            <thead><tr><th>Funcionario</th><th>Período</th><th>Sueldo básico</th><th>Bonos</th><th>Descuentos</th><th>Total pagado</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(b => {
                const f = getFunc(b.id_funcionario);
                return (
                  <tr key={b.id_boleta}>
                    <td><strong>{f?.nombres} {f?.apellidos}</strong></td>
                    <td>{MESES[b.mes - 1]} {b.gestion}</td>
                    <td>Bs. {Number(b.sueldo_basico).toFixed(2)}</td>
                    <td style={{ color: 'var(--success)' }}>+ Bs. {Number(b.total_bonos).toFixed(2)}</td>
                    <td style={{ color: 'var(--danger)' }}>− Bs. {Number(b.total_descuentos).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>Bs. {Number(b.total_pagado).toFixed(2)}</td>
                    <td><span className={`${s.badge} ${estadoBadge(b.estado)}`}>{b.estado}</span></td>
                    <td>
                      <div className={s.actions}>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setDetailBoleta(b)}>👁 Detalle</button>
                        <button className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`} onClick={() => setModal({ mode: 'edit', data: b })}>✏️</button>
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setModal({ mode: 'delete', data: b })}>🗑️</button>
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
        title={modal?.mode === 'edit' ? 'Editar boleta' : 'Nueva boleta de pago'}
        large
      >
        <BoletaForm funcionarios={funcionarios} initial={modal?.data} onSave={handleSave} onCancel={() => setModal(null)} />
      </Modal>

      <DetalleModal boleta={detailBoleta} onClose={() => setDetailBoleta(null)} />

      <Modal
        open={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Eliminar boleta"
        footer={<>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setModal(null)}>Cancelar</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={handleDelete}>Sí, eliminar</button>
        </>}
      >
        <div className={s.confirmBody}>
          <div className={s.confirmIcon}>⚠️</div>
          <div className={s.confirmText}>¿Eliminar esta boleta de pago?</div>
        </div>
      </Modal>
    </div>
  );
}
