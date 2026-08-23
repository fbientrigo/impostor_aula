-- TEM1623 Unit 1 concept pack.
-- Replaces the original generic health/medical-technology seed with the
-- reviewed concept bank for "Razonamiento Diagnóstico en Tecnología Médica".
--
-- Canonical pedagogical source:
--   content/tem1623/unidad1.v1.json
--
-- IMPORTANT:
-- The canonical JSON also contains structured `debrief` content. The current
-- database schema does not have debrief fields yet, so this migration inserts
-- only the existing Concept fields. Do not duplicate or invent debrief copy
-- here; the JSON remains the source of truth for the future results UI.
--
-- Existing rooms may reference concepts via rooms.concept_id. Clear those
-- references before deleting the obsolete bank so the FK remains valid.
-- Apply this migration only when no live classroom round is in progress.

begin;

update rooms
set concept_id = null
where concept_id is not null;

delete from concepts;

insert into concepts (
  category,
  title,
  explanation,
  impostor_hint,
  teacher_notes,
  difficulty,
  tags
) values
  (
    'Metabolismo y laboratorio',
    'Hemoglobina glicosilada (HbA1c)',
    'Integra la exposición glicémica de un periodo prolongado y aporta información distinta de una glicemia puntual. Su interpretación exige reconocer que determinadas condiciones del paciente pueden alterar la relación entre HbA1c y glicemia real.',
    'Marcador de laboratorio que resume un proceso metabólico durante un periodo prolongado.',
    'Provocar la comparación con una glicemia puntual. Preguntar qué significa realmente el resultado, cuándo puede ser engañoso y qué harían si no concuerda con otras mediciones.',
    'intermediate',
    array['u1', 'dm', 'laboratorio', 'interpretacion', 'interferencia', 'validez', 'ra1', 'ra2', 'ra3']::text[]
  ),
  (
    'Metabolismo y laboratorio',
    'Discordancia HbA1c–glicemia',
    'Dos mediciones relacionadas cuentan historias que no parecen compatibles. El problema no se resuelve escogiendo arbitrariamente una de ellas, sino revisando temporalidad, muestra, método, condiciones del paciente e interferencias antes de decidir qué evidencia adicional se necesita.',
    'Situación en que dos datos que deberían ser compatibles no lo son.',
    'Esta es una tarjeta central de razonamiento. Exigir una secuencia: detectar la discordancia → identificar explicaciones posibles → verificar calidad y contexto → decidir cómo resolverla.',
    'advanced',
    array['u1', 'dm', 'laboratorio', 'discordancia', 'interferencia', 'calidad', 'decision', 'ra1', 'ra2', 'ra3', 'ra4']::text[]
  ),
  (
    'Metabolismo y laboratorio',
    'Glucólisis preanalítica en muestra para glicemia',
    'El resultado de glicemia puede perder representatividad antes del análisis si la muestra no se maneja adecuadamente. Esto ejemplifica que un instrumento puede medir correctamente una muestra cuyo valor ya fue alterado por un problema preanalítico.',
    'Problema que ocurre antes de que la muestra sea analizada y puede modificar el resultado.',
    'Llevar la discusión a tiempo y manejo de la muestra, consumo celular de glucosa, confiabilidad del resultado y decisión de repetir cuando la muestra ya no permite responder adecuadamente la pregunta clínica.',
    'intermediate',
    array['u1', 'dm', 'laboratorio', 'preanalitica', 'muestra', 'glicemia', 'calidad', 'validez', 'ra2', 'ra3']::text[]
  ),
  (
    'Presión arterial',
    'Medición estandarizada de presión arterial',
    'La interpretación de una presión arterial depende de cómo fue obtenida. Preparación del paciente, posición, selección del manguito, procedimiento de medición y confiabilidad del equipo forman parte del resultado y pueden modificar su validez.',
    'Procedimiento frecuente cuyo resultado depende mucho de cómo se realiza.',
    'La meta es romper la idea ''si el equipo entregó un número, el número es válido''. Pedir qué revisarían antes de concluir que una presión está realmente elevada o normal.',
    'basic',
    array['u1', 'hta', 'medicion', 'tecnica', 'calidad', 'validez', 'equipo', 'ra1', 'ra2']::text[]
  ),
  (
    'Presión arterial',
    'Monitoreo ambulatorio de presión arterial (MAPA 24 h)',
    'Permite observar el comportamiento de la presión arterial fuera de una medición clínica aislada y responder si el patrón habitual del paciente coincide con lo observado en consulta.',
    'Evaluación repetida que sigue al paciente durante su vida cotidiana.',
    'No aceptar ''toma muchas presiones'' como explicación suficiente. Preguntar qué incertidumbre resuelve frente a una medición aislada y qué cambia al conocer el comportamiento fuera de consulta.',
    'intermediate',
    array['u1', 'hta', 'mapa', 'medicion', 'contexto', 'confirmacion', 'seguimiento', 'ra1', 'ra2', 'ra3']::text[]
  ),
  (
    'Evaluación retinal',
    'Retinografía no evaluable',
    'Una imagen que no permite visualizar con calidad suficiente las estructuras necesarias no puede utilizarse para concluir ausencia de lesión. La limitación de adquisición debe reconocerse y conducir a repetir o complementar la evaluación.',
    'El problema no necesariamente está en el paciente, sino en si la información obtenida permite responder la pregunta.',
    'Hacer explícita la diferencia entre ''no observo una lesión'' y ''la imagen no permite evaluarla''. Discutir foco, calidad, campo visible y necesidad de repetir o complementar.',
    'intermediate',
    array['u1', 'dm', 'retina', 'retinografia', 'calidad', 'limitacion', 'imagen', 'decision', 'ra1', 'ra2', 'ra3']::text[]
  ),
  (
    'Evaluación retinal',
    'Edema macular diabético',
    'Compromiso macular asociado a diabetes que obliga a integrar localización anatómica, repercusión visual y hallazgos de evaluación retinal. Su importancia no depende solamente de clasificar la retinopatía como proliferativa o no proliferativa.',
    'Complicación ocular donde importa especialmente la zona responsable de la visión central.',
    'Provocar la distinción entre edema macular y retinopatía proliferativa. Preguntar qué información clínica y estructural ayudaría a caracterizarlo y por qué su localización cambia la relevancia funcional.',
    'intermediate',
    array['u1', 'dm', 'retina', 'macula', 'hallazgo', 'integracion', 'seguimiento', 'ra1', 'ra2', 'ra3']::text[]
  ),
  (
    'Integración diagnóstica',
    'Daño de órgano blanco',
    'Diabetes e hipertensión pueden manifestarse mediante repercusiones en distintos órganos. Hallazgos retinales, renales u otros no deben interpretarse como datos independientes cuando forman parte de un mismo problema metabólico y vascular.',
    'Concepto que conecta una enfermedad sistémica con consecuencias observables en distintos órganos.',
    'Usar esta tarjeta para obligar a conectar áreas. Pedir cómo cambiaría el razonamiento al encontrar, en un mismo paciente, evidencia de repercusión en más de un órgano y qué información adicional sería relevante.',
    'advanced',
    array['u1', 'dm', 'hta', 'integracion', 'dano_organo', 'retina', 'renal', 'riesgo', 'ra1', 'ra3', 'ra4']::text[]
  ),
  (
    'Integración diagnóstica',
    'Confirmación diagnóstica',
    'Un hallazgo anormal no siempre equivale por sí solo a un diagnóstico definitivo. La fuerza del dato depende del contexto, de su calidad y del procedimiento utilizado; el siguiente paso puede ser repetir, confirmar con otra evidencia, complementar o actuar.',
    'Paso que separa un hallazgo inicial de una conclusión suficientemente sustentada.',
    'No enseñar una regla mecánica de ''siempre repetir''. Presentar distintos escenarios y preguntar qué evidencia falta, si el dato es suficientemente válido y qué acción está justificada.',
    'advanced',
    array['u1', 'integracion', 'confirmacion', 'decision', 'calidad', 'seguimiento', 'ra1', 'ra2', 'ra3', 'ra4']::text[]
  );

commit;
