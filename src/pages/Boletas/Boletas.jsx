import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEnvelope, FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";
import Modal from "../../components/Modal/Modal";
import { boletasService } from "../../lib/pagos.api";
import s from "../../styles/shared.module.css";
import styles from "./Boletas.module.css";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const CONCEPTOS_BONO = [
  "Bono de puntualidad",
  "Bono de productividad",
  "Bono de transporte",
  "Bono extraordinario",
  "Otro"
];

const CONCEPTOS_DESCUENTO = [
  "Aporte laboral",
  "Descuento por atraso",
  "Descuento por falta",
  "Anticipo de sueldo",
  "Otro"
];

const EMPTY_BOLETA = {
  id_funcionario: "",
  mes: new Date().getMonth() + 1,
  gestion: new Date().getFullYear(),
  sueldo_basico: "",
  enviarCorreo: true,
};

const EMPTY_DETALLE = {
  tipo: "bono",
  concepto: "Bono de puntualidad",
  conceptoOtro: "",
  monto: "",
};

const formatoBs = (valor) => `Bs. ${Number(valor || 0).toFixed(2)}`;

function BoletaForm({ funcionarios, onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_BOLETA);
  const [detalles, setDetalles] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState(EMPTY_DETALLE);

  const funcionarioSeleccionado = funcionarios.find(
    (f) => Number(f.id_funcionario) === Number(form.id_funcionario)
  );

  useEffect(() => {
    if (funcionarioSeleccionado) {
      setForm((prev) => ({
        ...prev,
        sueldo_basico: funcionarioSeleccionado.remuneracion || "",
      }));
    }
  }, [form.id_funcionario, funcionarioSeleccionado]);

  const bonos = detalles.filter((d) => d.tipo === "bono");
  const descuentos = detalles.filter((d) => d.tipo === "descuento");

  const totalBonos = bonos.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const totalDescuentos = descuentos.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const totalPagado = Number(form.sueldo_basico || 0) + totalBonos - totalDescuentos;

  const conceptosActuales =
    nuevoDetalle.tipo === "bono" ? CONCEPTOS_BONO : CONCEPTOS_DESCUENTO;

  const cambiarTipoDetalle = (tipo) => {
    setNuevoDetalle({
      tipo,
      concepto: tipo === "bono" ? CONCEPTOS_BONO[0] : CONCEPTOS_DESCUENTO[0],
      conceptoOtro: "",
      monto: "",
    });
  };

  const agregarDetalle = () => {
    const conceptoFinal =
      nuevoDetalle.concepto === "Otro"
        ? nuevoDetalle.conceptoOtro.trim()
        : nuevoDetalle.concepto;

    if (!conceptoFinal || !nuevoDetalle.monto) {
      Swal.fire({
        icon: "warning",
        title: "Completa el detalle",
        text: "Debes ingresar concepto y monto.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setDetalles((prev) => [
      ...prev,
      {
        tipo: nuevoDetalle.tipo,
        concepto: conceptoFinal,
        monto: Number(nuevoDetalle.monto),
      },
    ]);

    setNuevoDetalle({
      ...EMPTY_DETALLE,
      tipo: nuevoDetalle.tipo,
      concepto: nuevoDetalle.tipo === "bono" ? CONCEPTOS_BONO[0] : CONCEPTOS_DESCUENTO[0],
    });
  };

  const quitarDetalle = (index) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const guardar = async () => {
    if (!funcionarioSeleccionado?.correo && form.enviarCorreo) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Funcionario sin correo",
        text: "La boleta se generará, pero no podrá enviarse por correo. ¿Deseas continuar?",
        showCancelButton: true,
        confirmButtonText: "Sí, generar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2563eb",
      });

      if (!result.isConfirmed) return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Confirmar boleta",
      html: `
        <p>Se generará la boleta para <b>${funcionarioSeleccionado?.nombres} ${funcionarioSeleccionado?.apellidos}</b>.</p>
        <p>Total a pagar: <b>${formatoBs(totalPagado)}</b></p>
        ${form.enviarCorreo ? "<p>También se enviará al correo del funcionario.</p>" : ""}
      `,
      showCancelButton: true,
      confirmButtonText: "Generar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    const bonosPayload = detalles
      .filter((d) => d.tipo === "bono")
      .map((d) => ({ concepto: d.concepto, monto: Number(d.monto) }));

    const descuentosPayload = detalles
      .filter((d) => d.tipo === "descuento")
      .map((d) => ({ concepto: d.concepto, monto: Number(d.monto) }));

    onSave({
      id_funcionario: Number(form.id_funcionario),
      mes: Number(form.mes),
      gestion: Number(form.gestion),
      sueldo_basico: Number(form.sueldo_basico),
      bonos: bonosPayload,
      descuentos: descuentosPayload,
      enviarCorreo: form.enviarCorreo,
    });
  };

  const valido = form.id_funcionario && form.mes && form.gestion && form.sueldo_basico;

  return (
    <div className={styles.formContent}>
      <div className={s.formGrid}>
        <div className={`${s.field} ${s.formGridFull}`}>
          <label className={`${s.label} ${s.required}`}>Funcionario</label>
          <select
            className={s.select}
            value={form.id_funcionario}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, id_funcionario: e.target.value }))
            }
          >
            <option value="">Seleccionar funcionario...</option>
            {funcionarios.map((f) => (
              <option key={f.id_funcionario} value={f.id_funcionario}>
                {f.nombres} {f.apellidos} - {f.ci}
              </option>
            ))}
          </select>
        </div>

        {funcionarioSeleccionado && (
          <div className={`${s.field} ${s.formGridFull}`}>
            <div className={styles.funcionarioCard}>
              <div>
                <strong>{funcionarioSeleccionado.nombres} {funcionarioSeleccionado.apellidos}</strong>
                <span>CI: {funcionarioSeleccionado.ci}</span>
              </div>
              <div>
                <span>Área: {funcionarioSeleccionado.area || "No asignada"}</span>
                <span>Cargo: {funcionarioSeleccionado.cargo || "No asignado"}</span>
              </div>
              <div>
                <span>Correo: {funcionarioSeleccionado.correo || "Sin correo"}</span>
                <span>Remuneración: {formatoBs(funcionarioSeleccionado.remuneracion)}</span>
              </div>
            </div>
          </div>
        )}

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Mes</label>
          <select
            className={s.select}
            value={form.mes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, mes: Number(e.target.value) }))
            }
          >
            {MESES.map((mes, index) => (
              <option key={index + 1} value={index + 1}>{mes}</option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Gestión</label>
          <input
            className={s.input}
            type="number"
            value={form.gestion}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, gestion: e.target.value }))
            }
          />
        </div>

        <div className={s.field}>
          <label className={`${s.label} ${s.required}`}>Sueldo básico</label>
          <input
            className={s.input}
            type="number"
            step="0.01"
            value={form.sueldo_basico}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sueldo_basico: e.target.value }))
            }
          />
        </div>
      </div>

      <div className={styles.emailBox}>
        <label>
          <input
            type="checkbox"
            checked={form.enviarCorreo}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, enviarCorreo: e.target.checked }))
            }
          />
          Enviar automáticamente al correo del funcionario al generar la boleta
        </label>
      </div>

      <div className={styles.detalleSection}>
        <div className={styles.detalleSectionTitle}>Bonos y descuentos</div>

        <div className={styles.detalleFormImproved}>
          <select
            className={s.select}
            value={nuevoDetalle.tipo}
            onChange={(e) => cambiarTipoDetalle(e.target.value)}
          >
            <option value="bono">Bono</option>
            <option value="descuento">Descuento</option>
          </select>

          <select
            className={s.select}
            value={nuevoDetalle.concepto}
            onChange={(e) =>
              setNuevoDetalle((prev) => ({
                ...prev,
                concepto: e.target.value,
                conceptoOtro: "",
              }))
            }
          >
            {conceptosActuales.map((concepto) => (
              <option key={concepto} value={concepto}>{concepto}</option>
            ))}
          </select>

          {nuevoDetalle.concepto === "Otro" && (
            <input
              className={s.input}
              placeholder="Especificar concepto"
              value={nuevoDetalle.conceptoOtro}
              onChange={(e) =>
                setNuevoDetalle((prev) => ({ ...prev, conceptoOtro: e.target.value }))
              }
            />
          )}

          <input
            className={s.input}
            type="number"
            step="0.01"
            placeholder="Monto"
            value={nuevoDetalle.monto}
            onChange={(e) =>
              setNuevoDetalle((prev) => ({ ...prev, monto: e.target.value }))
            }
          />

          <button
            type="button"
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={agregarDetalle}
          >
            <FaPlus /> Añadir
          </button>
        </div>

        {detalles.length > 0 && (
          <div className={styles.detalleList}>
            {detalles.map((detalle, index) => (
              <div key={index} className={styles.detalleItem}>
                <span
                  className={`${styles.tipoChip} ${
                    detalle.tipo === "bono" ? styles.chipBono : styles.chipDescuento
                  }`}
                >
                  {detalle.tipo}
                </span>
                <span className={styles.detalleConcepto}>{detalle.concepto}</span>
                <strong>{formatoBs(detalle.monto)}</strong>
                <button onClick={() => quitarDetalle(index)} type="button">
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.totales}>
        <div className={styles.totalesRow}>
          <span>Sueldo básico</span>
          <span>{formatoBs(form.sueldo_basico)}</span>
        </div>
        <div className={styles.totalesRow}>
          <span>Total bonos</span>
          <span className={styles.montoPositivo}>{formatoBs(totalBonos)}</span>
        </div>
        <div className={styles.totalesRow}>
          <span>Total descuentos</span>
          <span className={styles.montoNegativo}>{formatoBs(totalDescuentos)}</span>
        </div>
        <div className={`${styles.totalesRow} ${styles.totalesTotal}`}>
          <span>Total pagado</span>
          <span>{formatoBs(totalPagado)}</span>
        </div>
      </div>

      <div className={styles.modalActions}>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={onCancel}>
          Cancelar
        </button>
        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={guardar}
          disabled={!valido}
        >
          <FaCheckCircle /> Generar boleta
        </button>
      </div>
    </div>
  );
}

function DetalleModal({ boletaId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [boleta, setBoleta] = useState(null);
  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    if (!boletaId) return;

    const cargar = async () => {
      setLoading(true);
      try {
        const data = await boletasService.obtenerBoletaPorId(boletaId);
        setBoleta(data.boleta);
        setDetalle(data.detalle || []);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [boletaId]);

  return (
    <Modal open={!!boletaId} onClose={onClose} title="Detalle de boleta" large>
      {loading || !boleta ? (
        <div className={s.loading}>Cargando...</div>
      ) : (
        <div className={styles.detalleModalContent}>
          <div className={styles.funcionarioCard}>
            <div>
              <strong>{boleta.nombres} {boleta.apellidos}</strong>
              <span>CI: {boleta.ci}</span>
            </div>
            <div>
              <span>Área: {boleta.area || "No asignada"}</span>
              <span>Cargo: {boleta.cargo || "No asignado"}</span>
            </div>
            <div>
              <span>Correo: {boleta.correo || "Sin correo"}</span>
              <span>Periodo: {MESES[boleta.mes - 1]} {boleta.gestion}</span>
            </div>
          </div>

          <div className={styles.totales}>
            <div className={styles.totalesRow}>
              <span>Sueldo básico</span>
              <span>{formatoBs(boleta.sueldo_basico)}</span>
            </div>
            <div className={styles.totalesRow}>
              <span>Total bonos</span>
              <span className={styles.montoPositivo}>{formatoBs(boleta.total_bonos)}</span>
            </div>
            <div className={styles.totalesRow}>
              <span>Total descuentos</span>
              <span className={styles.montoNegativo}>{formatoBs(boleta.total_descuentos)}</span>
            </div>
            <div className={`${styles.totalesRow} ${styles.totalesTotal}`}>
              <span>Total pagado</span>
              <span>{formatoBs(boleta.total_pagado)}</span>
            </div>
          </div>

          {detalle.length > 0 ? (
            <div className={styles.detalleList}>
              {detalle.map((d) => (
                <div key={d.id_detalle} className={styles.detalleItem}>
                  <span
                    className={`${styles.tipoChip} ${
                      d.tipo === "bono" ? styles.chipBono : styles.chipDescuento
                    }`}
                  >
                    {d.tipo}
                  </span>
                  <span className={styles.detalleConcepto}>{d.concepto}</span>
                  <strong>{formatoBs(d.monto)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className={s.empty}>
              <div className={s.emptyText}>Sin detalles registrados</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function Boletas() {
  const [boletas, setBoletas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [detalleId, setDetalleId] = useState(null);
  const [search, setSearch] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resBoletas, resFuncionarios] = await Promise.all([
        boletasService.listarBoletas(),
        boletasService.listarFuncionarios(),
      ]);

      setBoletas(resBoletas.boletas || []);
      setFuncionarios(resFuncionarios.funcionarios || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la información del módulo de boletas.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const crearBoleta = async (payload) => {
    try {
      const creada = await boletasService.crearBoleta(payload);
      const idBoleta = creada.boleta?.id_boleta;

      if (payload.enviarCorreo && idBoleta) {
        await boletasService.enviarBoletaCorreo(idBoleta);

        Swal.fire({
          icon: "success",
          title: "Boleta generada y enviada",
          text: "La boleta fue generada correctamente y enviada al correo del funcionario.",
          confirmButtonColor: "#2563eb",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Boleta generada",
          text: "La boleta fue generada correctamente.",
          confirmButtonColor: "#2563eb",
        });
      }

      setModalCrear(false);
      cargarDatos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo generar la boleta",
        text: error.response?.data?.msg || error.message || "Ocurrió un error.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const enviarCorreo = async (idBoleta) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Enviar boleta",
      text: "Se enviará la boleta al correo registrado del funcionario.",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    try {
      await boletasService.enviarBoletaCorreo(idBoleta);

      Swal.fire({
        icon: "success",
        title: "Boleta enviada",
        text: "El correo fue enviado correctamente.",
        confirmButtonColor: "#2563eb",
      });

      cargarDatos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: error.response?.data?.msg || error.message || "Ocurrió un error.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const filtradas = boletas.filter((b) => {
    const texto = `${b.funcionario || ""} ${b.ci || ""} ${b.correo || ""}`.toLowerCase();
    return texto.includes(search.toLowerCase());
  });

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <div className={s.pageHeading}>Boletas de Pago</div>
          <div className={s.pageSubheading}>
            Gestión de pagos, bonos, descuentos y envío de comprobantes
          </div>
        </div>

        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => setModalCrear(true)}
        >
          <FaPlus /> Nueva boleta
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>Boletas generadas</span>
          <strong>{boletas.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Funcionarios activos</span>
          <strong>{funcionarios.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Total pagado</span>
          <strong>
            {formatoBs(boletas.reduce((acc, b) => acc + Number(b.total_pagado || 0), 0))}
          </strong>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <div className={s.tableToolbar}>
          <input
            className={s.searchInput}
            placeholder="Buscar por funcionario, CI o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={s.loading}>Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyText}>No hay boletas registradas</div>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Funcionario</th>
                <th>Periodo</th>
                <th>Área / Cargo</th>
                <th>Sueldo</th>
                <th>Bonos</th>
                <th>Descuentos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((b) => (
                <tr key={b.id_boleta}>
                  <td>
                    <strong>{b.funcionario}</strong>
                    <br />
                    <small>{b.correo || "Sin correo"}</small>
                  </td>
                  <td>{MESES[b.mes - 1]} {b.gestion}</td>
                  <td>
                    <span>{b.area || "Sin área"}</span>
                    <br />
                    <small>{b.cargo || "Sin cargo"}</small>
                  </td>
                  <td>{formatoBs(b.sueldo_basico)}</td>
                  <td className={styles.montoPositivo}>{formatoBs(b.total_bonos)}</td>
                  <td className={styles.montoNegativo}>{formatoBs(b.total_descuentos)}</td>
                  <td>
                    <strong>{formatoBs(b.total_pagado)}</strong>
                  </td>
                  <td>
                    <span
                      className={`${styles.estadoChip} ${
                        b.estado === "enviada" ? styles.estadoEnviada : styles.estadoGenerada
                      }`}
                    >
                      {b.estado}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button
                        className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`}
                        onClick={() => setDetalleId(b.id_boleta)}
                        title="Ver detalle"
                      >
                        <FaEye />
                      </button>

                      <button
                        className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`}
                        onClick={() => enviarCorreo(b.id_boleta)}
                        title="Enviar correo"
                      >
                        <FaEnvelope />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nueva boleta de pago"
        large
      >
        <BoletaForm
          funcionarios={funcionarios}
          onSave={crearBoleta}
          onCancel={() => setModalCrear(false)}
        />
      </Modal>

      <DetalleModal boletaId={detalleId} onClose={() => setDetalleId(null)} />
    </div>
  );
}