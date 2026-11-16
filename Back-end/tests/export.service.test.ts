import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCsv,
  buildExportColumns,
  generateGradesCsv,
  generateGradesExcel,
  type GradesReportRow,
} from '../src/services/export.service.js';

test('buildCsv escapa comas, comillas dobles y saltos de línea', () => {
  const csv = buildCsv(
    [{ a: 'a,b', b: 'dijo "hola"', c: 'linea1\nlinea2' }],
    ['a', 'b', 'c'],
  );

  assert.equal(csv, 'a,b,c\r\n"a,b","dijo ""hola""","linea1\nlinea2"\r\n');
});

test('buildCsv devuelve solo el encabezado cuando no hay filas', () => {
  const csv = buildCsv([], ['id_estudiante', 'P1.1', 'primera_opcion']);
  assert.equal(csv, 'id_estudiante,P1.1,primera_opcion\r\n');
});

test('buildCsv conserva las respuestas múltiples separadas por comas dentro de una celda', () => {
  const csv = buildCsv([{ 'P1.1': 'a,b,k' }], ['P1.1']);
  assert.equal(csv, 'P1.1\r\n"a,b,k"\r\n');
});

test('buildCsv conserva las respuestas múltiples de P5.1 y P5.2 separadas por comas dentro de la celda', () => {
  const csv = buildCsv([{ 'P5.1': 'a,b', 'P5.2': 'c,e' }], ['P5.1', 'P5.2']);
  assert.equal(csv, 'P5.1,P5.2\r\n"a,b","c,e"\r\n');
});

test('buildExportColumns incluye las 10 notas oficiales después de los datos generales', () => {
  const columns = buildExportColumns(['P1.1']);
  const gradeColumns = [
    'nota_dpcc',
    'nota_ciencias_sociales',
    'nota_educacion_religiosa',
    'nota_educacion_trabajo',
    'nota_educacion_fisica',
    'nota_comunicacion',
    'nota_arte_cultura',
    'nota_ingles',
    'nota_matematica',
    'nota_ciencia_tecnologia',
  ];

  assert.deepEqual(columns.slice(4, 14), gradeColumns);
  assert.equal(columns.length, 4 + 10 + 1 + 7 + 10 + 2);
});

test('generateGradesExcel produce un buffer XLSX válido con cabeceras y datos', async () => {
  const sampleRows: GradesReportRow[] = [
    {
      estudiante_id: 1,
      nombres_apellidos: 'Juan Pérez',
      grado: '5.° de secundaria',
      seccion: 'A',
      edad_opcion: '16 años',
      edad_exacta: 16,
      sexo: 'Masculino',
      institucion_educativa: 'IE Francisco Lizarzaburu',
      nota_matematica: 18,
      nota_comunicacion: 16,
      nota_ciencia_tecnologia: 17,
      nota_ciencias_sociales: 15,
      nota_dpcc: 16,
      nota_educacion_fisica: 19,
      nota_arte_cultura: 14,
      nota_ingles: 15,
      nota_educacion_trabajo: 18,
      nota_educacion_religiosa: 16,
      promedio_general: 16.4,
      primera_opcion_codigo: '02',
      primera_opcion_nombre: 'Ingenierías y Tecnología',
      primera_opcion_puntaje: 66,
      segunda_opcion_codigo: '03',
      segunda_opcion_nombre: 'Ciencias Básicas y Naturales',
      segunda_opcion_puntaje: 44,
      total_s2: 33,
      nivel_psicometrico: 'MEDIO',
      observaciones_psicopedagogicas: 'Buen rendimiento general.',
      fecha_aplicacion: '2026-11-15',
    },
  ];

  const buffer = await generateGradesExcel(sampleRows, 'A');
  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 2000, 'El archivo XLSX debe tener tamaño significativo');
  // Firma ZIP / XLSX: 'PK\x03\x04'
  assert.equal(buffer[0], 0x50);
  assert.equal(buffer[1], 0x4b);
});

test('generateGradesCsv incluye BOM UTF-8 y todas las columnas esperadas', () => {
  const sampleRows: GradesReportRow[] = [
    {
      estudiante_id: 2,
      nombres_apellidos: 'Ana García',
      grado: '5.° de secundaria',
      seccion: 'B',
      edad_opcion: '17 años',
      edad_exacta: 17,
      sexo: 'Femenino',
      institucion_educativa: 'IE Francisco Lizarzaburu',
      nota_matematica: 19,
      nota_comunicacion: 18,
      nota_ciencia_tecnologia: 19,
      nota_ciencias_sociales: 17,
      nota_dpcc: 18,
      nota_educacion_fisica: 16,
      nota_arte_cultura: 17,
      nota_ingles: 19,
      nota_educacion_trabajo: 18,
      nota_educacion_religiosa: 17,
      promedio_general: 17.8,
      primera_opcion_codigo: '01',
      primera_opcion_nombre: 'Ciencias de la Salud',
      primera_opcion_puntaje: 72,
      segunda_opcion_codigo: null,
      segunda_opcion_nombre: null,
      segunda_opcion_puntaje: null,
      total_s2: 40,
      nivel_psicometrico: 'ALTO',
      observaciones_psicopedagogicas: 'Vocación médica consolidada.',
      fecha_aplicacion: '2026-11-15',
    },
  ];

  const csv = generateGradesCsv(sampleRows);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('Ana García'));
  assert.ok(csv.includes('Ciencias de la Salud (01)'));
  assert.ok(csv.includes('Vocación médica consolidada.'));
});
