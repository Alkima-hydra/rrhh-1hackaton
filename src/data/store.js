// Mock in-memory data store

let areas = [
  { id_area: 1, nombre: 'Tecnología', descripcion: 'Área de desarrollo de software', activo: true },
  { id_area: 2, nombre: 'Recursos Humanos', descripcion: 'Gestión del personal', activo: true },
  { id_area: 3, nombre: 'Finanzas', descripcion: 'Área financiera y contable', activo: true },
];

let cargos = [
  { id_cargo: 1, id_area: 1, nombre: 'Desarrollador Senior', descripcion: 'Desarrollo de software avanzado', activo: true },
  { id_cargo: 2, id_area: 1, nombre: 'Desarrollador Junior', descripcion: 'Desarrollo de software básico', activo: true },
  { id_cargo: 3, id_area: 2, nombre: 'Analista de RRHH', descripcion: 'Análisis y gestión de personal', activo: true },
  { id_cargo: 4, id_area: 3, nombre: 'Contador', descripcion: 'Gestión contable', activo: true },
];

let funcionarios = [
  { id_funcionario: 1, nombres: 'Carlos Alberto', apellidos: 'Mendoza Ríos', ci: '7654321', correo: 'carlos.mendoza@empresa.com', telefono: '77123456', direccion: 'Av. Arce 1234', id_area: 1, id_cargo: 1, remuneracion: 8500, fecha_ingreso: '2022-03-15', ratificado: true, activo: true, fecha_registro: '2022-03-15T08:00:00' },
  { id_funcionario: 2, nombres: 'María Elena', apellidos: 'Quiroga Salinas', ci: '8912345', correo: 'maria.quiroga@empresa.com', telefono: '70987654', direccion: 'Calle 21 de Enero 567', id_area: 2, id_cargo: 3, remuneracion: 6200, fecha_ingreso: '2021-07-01', ratificado: true, activo: true, fecha_registro: '2021-07-01T08:00:00' },
];

let vacaciones = [
  { id_vacacion: 1, id_funcionario: 1, gestion: 2024, dias_disponibles: 15, dias_solicitados: 7, dias_restantes: 8, fecha_inicio: '2024-07-01', fecha_fin: '2024-07-07', estado: 'aprobada', fecha_solicitud: '2024-06-15T10:00:00' },
];

let plantillas = [
  { id_plantilla: 1, nombre: 'Contrato Indefinido', contenido: 'En la ciudad de {ciudad}, a {fecha}, entre la empresa {empresa} y el trabajador {nombres} {apellidos} con CI {ci}, se celebra el presente contrato de trabajo por tiempo indefinido bajo las siguientes condiciones: Cargo: {cargo}. Salario: Bs. {salario}. Fecha de inicio: {fecha_ingreso}.', activo: true, fecha_creacion: '2023-01-01T00:00:00' },
  { id_plantilla: 2, nombre: 'Contrato a Plazo Fijo', contenido: 'En la ciudad de {ciudad}, a {fecha}, entre la empresa {empresa} y el trabajador {nombres} {apellidos} con CI {ci}, se celebra el presente contrato de trabajo a plazo fijo. Cargo: {cargo}. Salario: Bs. {salario}. Período de prueba: {tiempo_prueba}.', activo: true, fecha_creacion: '2023-01-01T00:00:00' },
];

let contratos = [
  { id_contrato: 1, id_funcionario: 1, id_plantilla: 1, fecha_ingreso: '2022-03-15', salario: 8500, tiempo_prueba: '3 meses', contenido_generado: 'Contrato generado para Carlos Mendoza...', fecha_generacion: '2022-03-15T08:00:00', activo: true },
];

let boletas = [
  { id_boleta: 1, id_funcionario: 1, mes: 4, gestion: 2025, sueldo_basico: 8500, total_bonos: 500, total_descuentos: 850, total_pagado: 8150, fecha_pago: '2025-04-30', estado: 'pagada' },
];

let detallesBoleta = [
  { id_detalle: 1, id_boleta: 1, tipo: 'bono', concepto: 'Bono de producción', monto: 500 },
  { id_detalle: 2, id_boleta: 1, tipo: 'descuento', concepto: 'AFP', monto: 595 },
  { id_detalle: 3, id_boleta: 1, tipo: 'descuento', concepto: 'Caja de salud', monto: 255 },
];

let nextIds = { area: 4, cargo: 5, funcionario: 3, vacacion: 2, plantilla: 3, contrato: 2, boleta: 2, detalle: 4 };

const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

// ─── AREAS ───────────────────────────────────────────────────────────────────
export const getAreas = async () => { await delay(); return [...areas]; };
export const createArea = async (data) => { await delay(); const item = { ...data, id_area: nextIds.area++, activo: data.activo ?? true }; areas.push(item); return item; };
export const updateArea = async (id, data) => { await delay(); const i = areas.findIndex(a => a.id_area === id); if (i >= 0) areas[i] = { ...areas[i], ...data }; return areas[i]; };
export const deleteArea = async (id) => { await delay(); areas = areas.filter(a => a.id_area !== id); };

// ─── CARGOS ──────────────────────────────────────────────────────────────────
export const getCargos = async () => { await delay(); return [...cargos]; };
export const createCargo = async (data) => { await delay(); const item = { ...data, id_cargo: nextIds.cargo++, activo: data.activo ?? true }; cargos.push(item); return item; };
export const updateCargo = async (id, data) => { await delay(); const i = cargos.findIndex(c => c.id_cargo === id); if (i >= 0) cargos[i] = { ...cargos[i], ...data }; return cargos[i]; };
export const deleteCargo = async (id) => { await delay(); cargos = cargos.filter(c => c.id_cargo !== id); };

// ─── FUNCIONARIOS ─────────────────────────────────────────────────────────────
export const getFuncionarios = async () => { await delay(); return [...funcionarios]; };
export const createFuncionario = async (data) => { await delay(); const item = { ...data, id_funcionario: nextIds.funcionario++, activo: data.activo ?? true, ratificado: data.ratificado ?? false, fecha_registro: new Date().toISOString() }; funcionarios.push(item); return item; };
export const updateFuncionario = async (id, data) => { await delay(); const i = funcionarios.findIndex(f => f.id_funcionario === id); if (i >= 0) funcionarios[i] = { ...funcionarios[i], ...data }; return funcionarios[i]; };
export const deleteFuncionario = async (id) => { await delay(); funcionarios = funcionarios.filter(f => f.id_funcionario !== id); };

// ─── VACACIONES ───────────────────────────────────────────────────────────────
export const getVacaciones = async () => { await delay(); return [...vacaciones]; };
export const createVacacion = async (data) => { await delay(); const item = { ...data, id_vacacion: nextIds.vacacion++, estado: data.estado ?? 'pendiente', fecha_solicitud: new Date().toISOString() }; vacaciones.push(item); return item; };
export const updateVacacion = async (id, data) => { await delay(); const i = vacaciones.findIndex(v => v.id_vacacion === id); if (i >= 0) vacaciones[i] = { ...vacaciones[i], ...data }; return vacaciones[i]; };
export const deleteVacacion = async (id) => { await delay(); vacaciones = vacaciones.filter(v => v.id_vacacion !== id); };

// ─── PLANTILLAS ───────────────────────────────────────────────────────────────
export const getPlantillas = async () => { await delay(); return [...plantillas]; };
export const createPlantilla = async (data) => { await delay(); const item = { ...data, id_plantilla: nextIds.plantilla++, activo: data.activo ?? true, fecha_creacion: new Date().toISOString() }; plantillas.push(item); return item; };
export const updatePlantilla = async (id, data) => { await delay(); const i = plantillas.findIndex(p => p.id_plantilla === id); if (i >= 0) plantillas[i] = { ...plantillas[i], ...data }; return plantillas[i]; };
export const deletePlantilla = async (id) => { await delay(); plantillas = plantillas.filter(p => p.id_plantilla !== id); };

// ─── CONTRATOS ────────────────────────────────────────────────────────────────
export const getContratos = async () => { await delay(); return [...contratos]; };
export const createContrato = async (data) => { await delay(); const item = { ...data, id_contrato: nextIds.contrato++, activo: true, fecha_generacion: new Date().toISOString() }; contratos.push(item); return item; };
export const updateContrato = async (id, data) => { await delay(); const i = contratos.findIndex(c => c.id_contrato === id); if (i >= 0) contratos[i] = { ...contratos[i], ...data }; return contratos[i]; };
export const deleteContrato = async (id) => { await delay(); contratos = contratos.filter(c => c.id_contrato !== id); };

// ─── BOLETAS ──────────────────────────────────────────────────────────────────
export const getBoletas = async () => { await delay(); return [...boletas]; };
export const createBoleta = async (data, detalles = []) => {
  await delay();
  const item = { ...data, id_boleta: nextIds.boleta++, fecha_pago: data.fecha_pago ?? new Date().toISOString().slice(0,10), estado: data.estado ?? 'generada' };
  boletas.push(item);
  detalles.forEach(d => { detallesBoleta.push({ ...d, id_detalle: nextIds.detalle++, id_boleta: item.id_boleta }); });
  return item;
};
export const updateBoleta = async (id, data) => { await delay(); const i = boletas.findIndex(b => b.id_boleta === id); if (i >= 0) boletas[i] = { ...boletas[i], ...data }; return boletas[i]; };
export const deleteBoleta = async (id) => { await delay(); boletas = boletas.filter(b => b.id_boleta !== id); detallesBoleta = detallesBoleta.filter(d => d.id_boleta !== id); };
export const getDetallesBoleta = async (id_boleta) => { await delay(); return detallesBoleta.filter(d => d.id_boleta === id_boleta); };
export const addDetalleBoleta = async (data) => { await delay(); const item = { ...data, id_detalle: nextIds.detalle++ }; detallesBoleta.push(item); return item; };
export const deleteDetalle = async (id) => { await delay(); detallesBoleta = detallesBoleta.filter(d => d.id_detalle !== id); };

// Helpers
export const getAreaById = (id) => areas.find(a => a.id_area === id);
export const getCargoById = (id) => cargos.find(c => c.id_cargo === id);
export const getFuncionarioById = (id) => funcionarios.find(f => f.id_funcionario === id);
export const getPlantillaById = (id) => plantillas.find(p => p.id_plantilla === id);
