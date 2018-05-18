/* eslint-disable max-len */
/*
 * This file does not allow exports or globals.
 */
/* eslint-disable no-unused-vars */
const fieldsToTranslate = [
  "actor",
  "authentication",
  "categoria",
  "accessComplexity",
  "escenario",
  "estado",
  "exploitability",
  "explotable",
  "confidentialityImpact",
  "availabilityImpact",
  "integrityImpact",
  "confidenceLevel",
  "resolutionLevel",
  "probabilidad",
  "tipoHallazgoCliente",
  "tipoPrueba",
  "accessVector",
  "treatment"
];
const eventsTranslations = [
  "tipo",
  "estado"
];
const keysToTranslate = {
  "0 | Ninguno: No se presenta ningún impacto": "finding_formstack.confidenciality.none",
  "0.275 | Parcial: Es posible modificar cierta información del objetivo": "finding_formstack.integrity.partial",
  "0.275 | Parcial: Se obtiene acceso a la información pero no control sobre ella": "finding_formstack.confidenciality.partial",
  "0.275 | Parcial: Se presenta intermitencia en el acceso al objetivo": "finding_formstack.availability.partial",
  "0.350 | Alto: Se requieren condiciones especiales como acceso administrativo": "finding_formstack.complexity.high_complex",
  "0.395 | Local: Explotable con acceso local al objetivo": "finding_formstack.access_vector.local",
  "0.450 | Multiple: Multiples puntos de autenticación": "finding_formstack.authentication.multiple_authen",
  "0.560 | Única: Único punto de autenticación": "finding_formstack.authentication.single_authen",
  "0.610 | Medio: Se requieren algunas condiciones como acceso al sistema": "finding_formstack.complexity.medium_complex",
  "0.646 | Red adyacente: Explotable desde el mismo segmento de red": "finding_formstack.access_vector.adjacent",
  "0.660 | Completo: Es posible modificar toda la información del objetivo": "finding_formstack.integrity.complete",
  "0.660 | Completo: Hay una caída total del objetivo": "finding_formstack.availability.complete",
  "0.660 | Completo: Se controla toda la información relacionada con el objetivo": "finding_formstack.confidenciality.complete",
  "0.704 | Ninguna: No se requiere autenticación": "finding_formstack.authentication.any_authen",
  "0.710 | Bajo: No se requiere ninguna condición especial": "finding_formstack.complexity.low_complex",
  "0.850 | Improbable: No existe un exploit": "finding_formstack.exploitability.improbable",
  "0.870 | Oficial: Existe un parche disponible por el fabricante": "finding_formstack.resolution.official",
  "0.900 | Conceptual: Existen pruebas de laboratorio": "finding_formstack.exploitability.conceptual",
  "0.900 | No confirmado: Existen pocas fuentes que reconocen la vulnerabilidad": "finding_formstack.confidence.not_confirm",
  "0.900 | Temporal: Existen soluciones temporales": "finding_formstack.resolution.temporal",
  "0.950 | Funcional: Existe exploit": "finding_formstack.exploitability.functional",
  "0.950 | No corroborado: La vulnerabilidad es reconocida por fuentes no oficiales": "finding_formstack.confidence.not_corrob",
  "0.950 | Paliativa: Existe un parche que no fue publicado por el fabricante": "finding_formstack.resolution.palliative",
  "1.000 | Alta: No se requiere exploit o se puede automatizar": "finding_formstack.exploitability.high",
  "1.000 | Confirmado: La vulnerabilidad es reconocida por el fabricante": "finding_formstack.confidence.confirmed",
  "1.000 | Inexistente: No existe solución": "finding_formstack.resolution.non_existent",
  "1.000 | Red: Explotable desde Internet": "finding_formstack.access_vector.network",
  "100% Vulnerado Anteriormente": "finding_formstack.probability.prev_vuln",
  "25% Difícil de vulnerar": "finding_formstack.probability.diffic_vuln",
  "50% Posible de vulnerar": "finding_formstack.probability.possible_vuln",
  "75% Fácil de vulnerar": "finding_formstack.probability.easy_vuln",
  "Abierto": "finding_formstack.status.open",
  "Actualizar y configurar las líneas base de seguridad de los componentes": "finding_formstack.category.update_base",
  "Alcance difiere a lo aprobado": "eventFormstack.type.toe_differs",
  "Ambiente inestable": "eventFormstack.type.uns_ambient",
  "Ambiente no accesible": "eventFormstack.type.inacc_ambient",
  "Análisis": "finding_formstack.test_method.analysis",
  "Anónimo desde Internet": "finding_formstack.scenario.anon_inter",
  "Anónimo desde Intranet": "finding_formstack.scenario.anon_intra",
  "Aplicación": "finding_formstack.test_method.app",
  "Aprobación de alta disponibilidad": "eventFormstack.type.high_approval",
  "Asumido": "finding_formstack.treatment_header.asummed",
  "Autorización para ataque especial": "eventFormstack.type.auth_attack",
  "Binario": "finding_formstack.test_method.binary",
  "Cerrado": "finding_formstack.status.close",
  "Cliente aprueba cambio de alcance": "eventFormstack.type.approv_change",
  "Cliente cancela el proyecto/hito": "eventFormstack.type.cancel_proj",
  "Cliente detecta ataque": "eventFormstack.type.det_attack",
  "Cliente suspende explicitamente": "eventFormstack.type.explic_suspend",
  "Cualquier cliente de la organización": "finding_formstack.actor.any_costumer",
  "Cualquier empleado de la organización": "finding_formstack.actor.any_employee",
  "Cualquier persona con acceso a la estación": "finding_formstack.actor.any_access",
  "Código": "finding_formstack.test_method.code",
  "Definir el modelo de autorización considerando el principio de mínimo privilegio": "finding_formstack.category.define_model",
  "Desempeño": "finding_formstack.category.performance",
  "Escaneo de Infraestructura": "finding_formstack.scenario.infra_scan",
  "Eventualidad": "finding_formstack.category.event",
  "Evitar exponer la información técnica de la aplicación, servidores y plataformas": "finding_formstack.category.avoid_technical",
  "Excluir datos sensibles del código fuente y del registro de eventos": "finding_formstack.category.exclude_finding",
  "Extranet usuario no autorizado": "finding_formstack.scenario.unauth_extra",
  "Fortalecer controles en autenticación y manejo de sesión": "finding_formstack.category.strengt_authen",
  "Fortalecer controles en el procesamiento de archivos": "finding_formstack.category.strengt_process",
  "Fortalecer la protección de datos almacenados relacionados con contraseñas o llaves criptográficas": "finding_formstack.category.strengt_protect",
  "Higiene": "finding_formstack.findingType.hygiene",
  "Implementar controles para validar datos de entrada": "finding_formstack.category.validate_input",
  "Infraestructura": "finding_formstack.test_method.infras",
  "Insumos incorrectos o faltantes": "eventFormstack.type.incor_supplies",
  "Internet usuario autorizado": "finding_formstack.scenario.auth_inter",
  "Internet usuario no autorizado": "finding_formstack.scenario.unauth_inter",
  "Intranet usuario autorizado": "finding_formstack.scenario.auth_intra",
  "Intranet usuario no autorizado": "finding_formstack.scenario.unauth_inter",
  "Mantenibilidad": "finding_formstack.category.maintain",
  "No": "finding_formstack.exploitable.no",
  "Nuevo": "finding_formstack.treatment_header.working",
  "Otro": "eventFormstack.type.other",
  "Parcialmente cerrado": "finding_formstack.status.part_close",
  "Pendiente": "eventFormstack.status.unsolve",
  "Registrar eventos para trazabilidad y auditoría": "finding_formstack.category.record_event",
  "Remediar": "finding_formstack.treatment_header.remediated",
  "Resuelto": "finding_formstack.treatment_header.resolved",
  "Si": "finding_formstack.exploitable.yes",
  "Solo algunos clientes de la organización": "finding_formstack.actor.some_costumer",
  "Solo algunos empleados": "finding_formstack.actor.some_employee",
  "Solo un empleado": "finding_formstack.actor.one_employee",
  "Tratada": "eventFormstack.status.solve",
  "Utilizar protocolos de comunicación seguros": "finding_formstack.category.secure_protoc",
  "Validar la integridad de las transacciones en peticiones HTTP": "finding_formstack.category.validate_http",
  "Vulnerabilidad": "finding_formstack.findingType.vuln",
  "​Cualquier persona en Internet": "finding_formstack.actor.any_internet"
};
