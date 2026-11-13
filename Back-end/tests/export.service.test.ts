import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsv, buildExportColumns } from '../src/services/export.service.js';

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

test('buildExportColumns incluye las 11 notas oficiales después de los datos generales', () => {
  const columns = buildExportColumns(['P1.1']);
  const gradeColumns = [
    'nota_dpcc',
    'nota_ciencias_sociales',
    'nota_educacion_religiosa',
    'nota_educacion_trabajo',
    'nota_educacion_fisica',
    'nota_comunicacion',
    'nota_arte_cultura',
    'nota_castellano_segunda_lengua',
    'nota_ingles',
    'nota_matematica',
    'nota_ciencia_tecnologia',
  ];

  assert.deepEqual(columns.slice(4, 15), gradeColumns);
  assert.equal(columns.length, 4 + 11 + 1 + 7 + 10 + 2);
});
