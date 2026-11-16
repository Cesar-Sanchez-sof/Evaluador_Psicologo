import assert from 'node:assert/strict';
import test from 'node:test';
import { answersSchema } from '../src/schemas/evaluation.schema.js';
import { evaluateQuestionnaire } from '../src/services/scoring.service.js';

test('Caso 1 (Juan Pérez — Plantilla pág. 7): calcula puntajes exactos por sección y área', () => {
  const parsed = answersSchema.parse({
    'P1.1': ['d'],
    'P1.2': ['a'],
    'P1.3': 4,
    'P1.4': 5,
    'P1.5': 2,
    'P1.6': 1,
    'P1.7': 4,
    'P2.1': 5,
    'P2.2': 4,
    'P2.3': 4,
    'P2.4': 4,
    'P2.5': 3,
    'P2.6': 3,
    'P2.7': 3,
    'P2.8': 4,
    'P2.9': 3,
    'P3.1': 5,
    'P3.2': 4,
    'P3.3': 4,
    'P3.4': 3,
    'P3.5': 3,
    'P3.6': 2,
    'P3.7': 4,
    'P3.8': 5,
    'P3.9': 4,
    'P4.1': 4,
    'P4.2': 3,
    'P4.3': 4,
    'P4.4': 5,
    'P4.5': 5,
    'P4.6': 5,
    'P4.7': 3,
    'P4.8': 2,
    'P4.9': 2,
    'P4.10': 3,
    'P4.11': 3,
    'P4.12': 3,
    'P4.13': 4,
    'P4.14': 3,
    'P4.15': 3,
    'P4.16': 4,
    'P4.17': 4,
    'P4.18': 3,
    'P5.1': 'b',
    'P5.2': 'b',
    'P5.3': 'a',
    'P5.4': 'c',
    'P6.1': 'c',
    'P6.2': 'c',
    'P6.3': 'a',
    'P6.4': 'a',
    'P6.5': 'a',
    'P6.6': 'a',
  });

  const result = evaluateQuestionnaire(parsed);

  assert.equal(result.primeraOpcionCodigo, '02');
  assert.equal(result.primeraOpcionPuntaje, 66);
  assert.equal(result.segundaOpcionCodigo, '03');
  assert.equal(result.segundaOpcionPuntaje, 44);
  assert.equal(result.seccion2.totalS2, 33);
  assert.equal(result.seccion2.nivelPsicometrico, 'MEDIO');

  const byArea = Object.fromEntries(result.detalleAreas.map((r) => [r.areaCodigo, r]));
  assert.equal(byArea['01'].totalArea, 36);
  assert.equal(byArea['02'].totalArea, 66);
  assert.equal(byArea['03'].totalArea, 44);
  assert.equal(byArea['04'].totalArea, 19);
  assert.equal(byArea['05'].totalArea, 38);
  assert.equal(byArea['06'].totalArea, 38);
  assert.equal(byArea['07'].totalArea, 30);
  assert.equal(byArea['08'].totalArea, 33);
  assert.equal(byArea['09'].totalArea, 22);
  assert.equal(byArea['10'].totalArea, 14);

  // Suma de todos los totales positivos = 36+66+44+19+38+38+30+33+22+14 = 340
  const sumaPorcentajes = result.detalleAreas.reduce(
    (acc, row) => acc + row.porcentajeOrientacion,
    0,
  );
  assert.ok(Math.abs(sumaPorcentajes - 100) < 0.05);
  assert.equal(byArea['02'].porcentajeOrientacion, 19.41);
  assert.equal(result.primeraOpcionPorcentaje, 19.41);
  assert.equal(result.seccion3.puntaje3aLogicoMatematico, 13);
  assert.equal(result.seccion4Riasec.iInvestigador, 15);
});

test('Caso 2 (Respuestas múltiples en P1.1 y P1.2): acumula +1 y -1 por cada opción marcada', () => {
  const parsed = answersSchema.parse({
    'P1.1': ['a', 'e'],
    'P1.2': ['d', 'k'],
    'P1.3': 2,
    'P1.4': 2,
    'P1.5': 5,
    'P1.6': 5,
    'P1.7': 4,
    'P2.1': 4,
    'P2.2': 4,
    'P2.3': 4,
    'P2.4': 4,
    'P2.5': 4,
    'P2.6': 4,
    'P2.7': 4,
    'P2.8': 4,
    'P2.9': 4,
    'P3.1': 2,
    'P3.2': 2,
    'P3.3': 2,
    'P3.4': 5,
    'P3.5': 5,
    'P3.6': 4,
    'P3.7': 4,
    'P3.8': 4,
    'P3.9': 3,
    'P4.1': 2,
    'P4.2': 2,
    'P4.3': 1,
    'P4.4': 3,
    'P4.5': 2,
    'P4.6': 2,
    'P4.7': 5,
    'P4.8': 5,
    'P4.9': 5,
    'P4.10': 4,
    'P4.11': 4,
    'P4.12': 3,
    'P4.13': 4,
    'P4.14': 4,
    'P4.15': 4,
    'P4.16': 3,
    'P4.17': 3,
    'P4.18': 2,
    'P5.1': 'c',
    'P5.2': 'c',
    'P5.3': 'c',
    'P5.4': 'c',
    'P6.1': 'd',
    'P6.2': 'd',
    'P6.3': 'a',
    'P6.4': 'a',
    'P6.5': 'a',
    'P6.6': 'b',
  });

  const result = evaluateQuestionnaire(parsed);
  const byArea = Object.fromEntries(result.detalleAreas.map((r) => [r.areaCodigo, r]));

  // P1.1 ('a' -> 06, 'e' -> 04,06) suma +2 a Área 06; P1.6 = 5 -> ptosS1 = 7
  assert.equal(byArea['06'].ptosS1, 7);
  // P1.2 ('d' -> 01,02,03,08; 'k' -> 02,03,05) resta -2 a Área 02; P1.3 = 2 -> ptosS1 = 0
  assert.equal(byArea['02'].ptosS1, 0);
  assert.equal(result.primeraOpcionCodigo, '06');
  assert.equal(result.primeraOpcionPuntaje, 68);
  assert.equal(result.seccion2.totalS2, 36);
  assert.equal(result.seccion2.nivelPsicometrico, 'ALTO');
});

test('Caso 3 (Bonus S6): P6.6="d" Escuela militar/policial otorga +2 al Área 09', () => {
  const parsed = answersSchema.parse({
    'P1.1': 'g',
    'P1.2': 'k',
    'P1.3': 1,
    'P1.4': 1,
    'P1.5': 2,
    'P1.6': 1,
    'P1.7': 4,
    'P2.1': 4,
    'P2.2': 4,
    'P2.3': 4,
    'P2.4': 4,
    'P2.5': 4,
    'P2.6': 4,
    'P2.7': 4,
    'P2.8': 4,
    'P2.9': 4,
    'P3.1': 1,
    'P3.2': 1,
    'P3.3': 1,
    'P3.4': 2,
    'P3.5': 2,
    'P3.6': 2,
    'P3.7': 1,
    'P3.8': 1,
    'P3.9': 1,
    'P4.1': 5,
    'P4.2': 5,
    'P4.3': 5,
    'P4.4': 1,
    'P4.5': 1,
    'P4.6': 1,
    'P4.7': 1,
    'P4.8': 1,
    'P4.9': 1,
    'P4.10': 2,
    'P4.11': 2,
    'P4.12': 2,
    'P4.13': 2,
    'P4.14': 2,
    'P4.15': 2,
    'P4.16': 5,
    'P4.17': 5,
    'P4.18': 5,
    'P5.1': 'a',
    'P5.2': 'f',
    'P5.3': 'd',
    'P5.4': 'd',
    'P6.1': 'b',
    'P6.2': 'b',
    'P6.3': 'a',
    'P6.4': 'b',
    'P6.5': 'a',
    'P6.6': 'd',
  });

  const result = evaluateQuestionnaire(parsed);
  const byArea = Object.fromEntries(result.detalleAreas.map((r) => [r.areaCodigo, r]));

  assert.equal(byArea['09'].bonusS6, 2);
  assert.equal(byArea['02'].bonusS6, 0);
  assert.equal(result.primeraOpcionCodigo, '09');
});
