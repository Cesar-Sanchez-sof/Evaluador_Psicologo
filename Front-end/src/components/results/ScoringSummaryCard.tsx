import {
  AlertTriangle,
  Award,
  BarChart3,
  BrainCircuit,
  Calculator,
  Sparkles,
} from 'lucide-react';
import type {
  AreaScoreDetailRow,
  EvaluationScoringPreview,
  HojaCorreccionFinal,
} from '../../types/questionnaire';

function toNumber(val: number | string | null | undefined, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface ScoringDisplayModel {
  primeraOpcionCodigo: string;
  primeraOpcionNombre: string;
  primeraOpcionPuntaje: number;
  primeraOpcionPorcentaje: number;
  segundaOpcionCodigo: string;
  segundaOpcionNombre: string;
  segundaOpcionPuntaje: number;
  segundaOpcionPorcentaje: number;
  requiereRevisionEmpateDual: boolean;
  carrerasRecomendadas: string | null;
  seccion1Detalle?: {
    p1_1Opciones: string[];
    p1_2Opciones: string[];
    p1_3Matematica: number;
    p1_4Ciencias: number;
    p1_5Humanidades: number;
    p1_6Arte: number;
  };
  grupoA: number;
  grupoB: number;
  grupoC: number;
  totalS2: number;
  nivelPsicometrico: string;
  interpretacionS2: string;
  seccion3: {
    puntaje3a: number;
    puntaje3b: number;
    puntaje3c: number;
  };
  seccion4Riasec: {
    r: number;
    i: number;
    a: number;
    s: number;
    e: number;
    c: number;
  };
  seccion5Detalle?: {
    p5_1: string;
    p5_2: string;
    p5_3: string;
  };
  bonusS6Area09: number;
  p1_7Dedicacion: number | null;
  p1_7Interpretacion: string | null;
  p5_4Opcion: string | null;
  p5_4Interpretacion: string | null;
  p6_3Internet: string | null;
  p6_4Computadora: string | null;
  p6_5PlanPrincipal: string | null;
  p6_6TipoInstitucion: string | null;
  detalleAreas: Array<{
    codigo: string;
    nombre: string;
    ptosS1: number;
    ptosS3: number;
    ptosS4: number;
    ptosS5: number;
    bonusS6: number;
    total: number;
    porcentajeOrientacion: number;
    orden: number;
  }>;
}

export function mapPreviewToScoringDisplay(preview: EvaluationScoringPreview): ScoringDisplayModel {
  const area09 = preview.detalleAreas.find((d) => d.areaCodigo === '09');
  return {
    primeraOpcionCodigo: preview.primeraOpcionCodigo,
    primeraOpcionNombre: preview.primeraOpcionNombre,
    primeraOpcionPuntaje: preview.primeraOpcionPuntaje,
    primeraOpcionPorcentaje: preview.primeraOpcionPorcentaje,
    segundaOpcionCodigo: preview.segundaOpcionCodigo,
    segundaOpcionNombre: preview.segundaOpcionNombre,
    segundaOpcionPuntaje: preview.segundaOpcionPuntaje,
    segundaOpcionPorcentaje: preview.segundaOpcionPorcentaje,
    requiereRevisionEmpateDual: preview.requiereRevisionEmpateDual,
    carrerasRecomendadas: preview.carrerasRecomendadasPrimeraOpcion,
    seccion1Detalle: preview.seccion1Detalle,
    grupoA: preview.seccion2.grupoAAutoeficacia,
    grupoB: preview.seccion2.grupoBResiliencia,
    grupoC: preview.seccion2.grupoCEstres,
    totalS2: preview.seccion2.totalS2,
    nivelPsicometrico: preview.seccion2.nivelPsicometrico,
    interpretacionS2: preview.seccion2.interpretacionS2,
    seccion3: {
      puntaje3a: preview.seccion3.puntaje3aLogicoMatematico,
      puntaje3b: preview.seccion3.puntaje3bComprensionVerbal,
      puntaje3c: preview.seccion3.puntaje3cEspacialVisual,
    },
    seccion4Riasec: {
      r: preview.seccion4Riasec.rRealista,
      i: preview.seccion4Riasec.iInvestigador,
      a: preview.seccion4Riasec.aArtistico,
      s: preview.seccion4Riasec.sSocial,
      e: preview.seccion4Riasec.eEmprendedor,
      c: preview.seccion4Riasec.cConvencional,
    },
    seccion5Detalle: preview.seccion5Detalle,
    bonusS6Area09: preview.seccion6Detalle?.bonusArea09 ?? area09?.bonusS6 ?? 0,
    p1_7Dedicacion: preview.indicadoresApoyo.p1_7Dedicacion,
    p1_7Interpretacion: preview.indicadoresApoyo.p1_7Interpretacion,
    p5_4Opcion: preview.indicadoresApoyo.p5_4Opcion,
    p5_4Interpretacion: preview.indicadoresApoyo.p5_4Interpretacion,
    p6_3Internet: preview.indicadoresApoyo.p6_3Internet,
    p6_4Computadora: preview.indicadoresApoyo.p6_4Computadora,
    p6_5PlanPrincipal: preview.indicadoresApoyo.p6_5PlanPrincipal,
    p6_6TipoInstitucion: preview.indicadoresApoyo.p6_6TipoInstitucion,
    detalleAreas: preview.detalleAreas.map((d) => ({
      codigo: d.areaCodigo,
      nombre: d.areaNombre,
      ptosS1: d.ptosS1,
      ptosS3: d.ptosS3,
      ptosS4: d.ptosS4,
      ptosS5: d.ptosS5,
      bonusS6: d.bonusS6,
      total: d.totalArea,
      porcentajeOrientacion: d.porcentajeOrientacion,
      orden: d.ordenPrioridad,
    })),
  };
}

export function mapDetailToScoringDisplay(
  hoja: HojaCorreccionFinal,
  detalleAreas: AreaScoreDetailRow[],
): ScoringDisplayModel {
  const mappedAreas = detalleAreas.map((d) => ({
    codigo: d.area_codigo,
    nombre: d.area_nombre,
    ptosS1: d.ptos_s1,
    ptosS3: d.ptos_s3,
    ptosS4: d.ptos_s4,
    ptosS5: d.ptos_s5,
    bonusS6: d.bonus_s6,
    total: d.total_area,
    porcentajeOrientacion: toNumber(d.porcentaje_orientacion),
    orden: d.orden_prioridad,
  }));

  const area09 = mappedAreas.find((d) => d.codigo === '09');
  const firstPct =
    hoja.primera_opcion_porcentaje !== undefined && hoja.primera_opcion_porcentaje !== null
      ? toNumber(hoja.primera_opcion_porcentaje)
      : (mappedAreas[0]?.porcentajeOrientacion ?? 0);
  const secondPct =
    hoja.segunda_opcion_porcentaje !== undefined && hoja.segunda_opcion_porcentaje !== null
      ? toNumber(hoja.segunda_opcion_porcentaje)
      : (mappedAreas[1]?.porcentajeOrientacion ?? 0);

  return {
    primeraOpcionCodigo: hoja.primera_opcion_codigo ?? '—',
    primeraOpcionNombre: hoja.primera_opcion_nombre ?? 'Sin calcular',
    primeraOpcionPuntaje: hoja.primera_opcion_puntaje ?? 0,
    primeraOpcionPorcentaje: firstPct,
    segundaOpcionCodigo: hoja.segunda_opcion_codigo ?? '—',
    segundaOpcionNombre: hoja.segunda_opcion_nombre ?? 'Sin calcular',
    segundaOpcionPuntaje: hoja.segunda_opcion_puntaje ?? 0,
    segundaOpcionPorcentaje: secondPct,
    requiereRevisionEmpateDual: Boolean(hoja.requiere_revision_empate_dual),
    carrerasRecomendadas: hoja.carreras_recomendadas_primera_opcion,
    grupoA: hoja.grupo_a_autoeficacia ?? 0,
    grupoB: hoja.grupo_b_resiliencia ?? 0,
    grupoC: hoja.grupo_c_estres ?? 0,
    totalS2: hoja.total_s2 ?? 0,
    nivelPsicometrico: hoja.nivel_psicometrico ?? '—',
    interpretacionS2: hoja.interpretacion_s2 ?? '',
    seccion3: {
      puntaje3a: hoja.puntaje_3a_logico_matematico ?? 0,
      puntaje3b: hoja.puntaje_3b_comprension_verbal ?? 0,
      puntaje3c: hoja.puntaje_3c_espacial_visual ?? 0,
    },
    seccion4Riasec: {
      r: hoja.puntaje_r_realista ?? 0,
      i: hoja.puntaje_i_investigador ?? 0,
      a: hoja.puntaje_a_artistico ?? 0,
      s: hoja.puntaje_s_social ?? 0,
      e: hoja.puntaje_e_emprendedor ?? 0,
      c: hoja.puntaje_c_convencional ?? 0,
    },
    bonusS6Area09: area09?.bonusS6 ?? 0,
    p1_7Dedicacion: hoja.p1_7_dedicacion,
    p1_7Interpretacion: hoja.p1_7_interpretacion,
    p5_4Opcion: hoja.p5_4_opcion,
    p5_4Interpretacion: hoja.p5_4_interpretacion,
    p6_3Internet: hoja.p6_3_internet,
    p6_4Computadora: hoja.p6_4_computadora,
    p6_5PlanPrincipal: hoja.p6_5_plan_principal,
    p6_6TipoInstitucion: hoja.p6_6_tipo_institucion,
    detalleAreas: mappedAreas,
  };
}

interface ScoringSummaryCardProps {
  data: ScoringDisplayModel;
  title?: string;
}

export function ScoringSummaryCard({ data, title }: ScoringSummaryCardProps) {
  const totalS3 = data.seccion3.puntaje3a + data.seccion3.puntaje3b + data.seccion3.puntaje3c;
  const totalS4 =
    data.seccion4Riasec.r +
    data.seccion4Riasec.i +
    data.seccion4Riasec.a +
    data.seccion4Riasec.s +
    data.seccion4Riasec.e +
    data.seccion4Riasec.c;
  const maxPct = Math.max(...data.detalleAreas.map((d) => d.porcentajeOrientacion), 1);

  return (
    <div className="space-y-5">
      {title && <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">{title}</h3>}

      {data.requiereRevisionEmpateDual && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <span>
            <strong>Empate detectado en 1.º lugar (Vocación Dual):</strong> La 1.ª y 2.ª opción
            empataron tanto en puntaje total como en Sección 4 (RIASEC). Ambas áreas se consideran
            orientación dual válida según la plantilla oficial.
          </span>
        </div>
      )}

      {/* Tarjetas resumen principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-blue-900 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              1.ª Opción Vocacional
            </span>
            <span className="rounded-full bg-blue-900 px-2 py-0.5 text-[11px] font-bold text-white">
              {data.primeraOpcionPorcentaje.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1.5 text-base font-extrabold text-blue-950">
            {data.primeraOpcionCodigo} — {data.primeraOpcionNombre}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-blue-800">
            Puntaje total: {data.primeraOpcionPuntaje} pts · Orientación:{' '}
            {data.primeraOpcionPorcentaje.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-indigo-900 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              2.ª Opción Vocacional
            </span>
            <span className="rounded-full bg-indigo-800 px-2 py-0.5 text-[11px] font-bold text-white">
              {data.segundaOpcionPorcentaje.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1.5 text-base font-extrabold text-indigo-950">
            {data.segundaOpcionCodigo} — {data.segundaOpcionNombre}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-indigo-800">
            Puntaje total: {data.segundaOpcionPuntaje} pts · Orientación:{' '}
            {data.segundaOpcionPorcentaje.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <BrainCircuit className="h-4 w-4" />
            Perfil Psicométrico (S2)
          </div>
          <p className="mt-1.5 text-base font-extrabold text-slate-900">
            {data.nivelPsicometrico} ({data.totalS2}/45 pts)
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            A: {data.grupoA}/15 · B: {data.grupoB}/15 · C: {data.grupoC}/15
          </p>
        </div>
      </div>

      {data.carrerasRecomendadas && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-950">
          <strong className="font-bold">Carreras afines recomendadas (1.ª Opción): </strong>
          {data.carrerasRecomendadas}
        </div>
      )}

      {/* Sumatorias detalladas por cada sección de la Plantilla */}
      <div>
        <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-800 uppercase">
          <Calculator className="h-4 w-4 text-blue-800" />
          Sumatorias por Sección (Plantilla de Corrección S1 – S6)
        </h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* S1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
            <p className="font-bold text-slate-900 uppercase">Sección 1 — Asignaturas</p>
            {data.seccion1Detalle ? (
              <div className="mt-2 space-y-1 text-slate-700">
                <p>
                  P1.1 (+1 c/u):{' '}
                  <strong>{data.seccion1Detalle.p1_1Opciones.join(', ').toUpperCase()}</strong>
                </p>
                <p>
                  P1.2 (-1 c/u):{' '}
                  <strong>{data.seccion1Detalle.p1_2Opciones.join(', ').toUpperCase()}</strong>
                </p>
                <p>
                  Autocalif.: Mat {data.seccion1Detalle.p1_3Matematica} · Cien{' '}
                  {data.seccion1Detalle.p1_4Ciencias} · Hum {data.seccion1Detalle.p1_5Humanidades} ·
                  Arte {data.seccion1Detalle.p1_6Arte}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-slate-600">
                Desglose aplicado por área en columna <strong>Ptos. S1</strong> (P1.1 +1, P1.2 -1 y
                P1.3–P1.6 directos).
              </p>
            )}
            <p className="mt-1.5 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
              P1.7 Dedicación: {data.p1_7Dedicacion ?? '—'}/5
            </p>
          </div>

          {/* S2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 uppercase">Sección 2 — Psicométrico</p>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                {data.totalS2}/45
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-slate-50 p-1.5">
                <span className="block text-[10px] text-slate-500">Grupo A</span>
                <strong className="text-slate-900">{data.grupoA}/15</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-1.5">
                <span className="block text-[10px] text-slate-500">Grupo B</span>
                <strong className="text-slate-900">{data.grupoB}/15</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-1.5">
                <span className="block text-[10px] text-slate-500">Grupo C</span>
                <strong className="text-slate-900">{data.grupoC}/15</strong>
              </div>
            </div>
            <p className="mt-1.5 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
              Nivel: <strong>{data.nivelPsicometrico}</strong> (modulador, no suma a áreas)
            </p>
          </div>

          {/* S3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 uppercase">Sección 3 — Aptitudes</p>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-900">
                Suma {totalS3}/45
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-blue-50/60 p-1.5">
                <span className="block text-[10px] text-slate-600">3A Lóg-Mat</span>
                <strong className="text-blue-950">{data.seccion3.puntaje3a}/15</strong>
              </div>
              <div className="rounded-lg bg-blue-50/60 p-1.5">
                <span className="block text-[10px] text-slate-600">3B Verbal</span>
                <strong className="text-blue-950">{data.seccion3.puntaje3b}/15</strong>
              </div>
              <div className="rounded-lg bg-blue-50/60 p-1.5">
                <span className="block text-[10px] text-slate-600">3C Espacial</span>
                <strong className="text-blue-950">{data.seccion3.puntaje3c}/15</strong>
              </div>
            </div>
            <p className="mt-1.5 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
              Ponderado directo a áreas afines en Ptos. S3.
            </p>
          </div>

          {/* S4 RIASEC */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 uppercase">
                Sección 4 — Personalidad Vocacional (RIASEC)
              </p>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-900">
                Suma RIASEC: {totalS4}/90
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center sm:grid-cols-6">
              {[
                { key: 'R (Realista)', val: data.seccion4Riasec.r },
                { key: 'I (Invest.)', val: data.seccion4Riasec.i },
                { key: 'A (Artístico)', val: data.seccion4Riasec.a },
                { key: 'S (Social)', val: data.seccion4Riasec.s },
                { key: 'E (Emprend.)', val: data.seccion4Riasec.e },
                { key: 'C (Convenc.)', val: data.seccion4Riasec.c },
              ].map((dim) => (
                <div key={dim.key} className="rounded-lg bg-indigo-50/50 p-1.5">
                  <span className="block text-[10px] text-slate-600">{dim.key}</span>
                  <strong className="text-indigo-950">{dim.val}/15</strong>
                </div>
              ))}
            </div>
          </div>

          {/* S5 + S6 */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
            <p className="font-bold text-slate-900 uppercase">Secciones 5 y 6 — Hobbies y Bonus</p>
            <div className="mt-2 space-y-1 text-slate-700">
              {data.seccion5Detalle ? (
                <p>
                  S5 (+3 pts c/u): P5.1 <strong>{data.seccion5Detalle.p5_1.toUpperCase()}</strong> ·
                  P5.2 <strong>{data.seccion5Detalle.p5_2.toUpperCase()}</strong> · P5.3{' '}
                  <strong>{data.seccion5Detalle.p5_3.toUpperCase()}</strong>
                </p>
              ) : (
                <p>S5 (+3 pts c/u): acumulado en columna Ptos. S5.</p>
              )}
              <p>
                S6 Bonus Área 09 (P6.6 = d):{' '}
                <strong className={data.bonusS6Area09 > 0 ? 'text-emerald-700' : 'text-slate-800'}>
                  +{data.bonusS6Area09} pts
                </strong>
              </p>
              <p className="text-[11px] text-slate-500">
                P6.3: {data.p6_3Internet ?? '—'} · P6.4: {data.p6_4Computadora ?? '—'} · P6.5:{' '}
                {data.p6_5PlanPrincipal ?? '—'} · P6.6: {data.p6_6TipoInstitucion ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Consolidación de Puntajes y Porcentaje de Orientación (Paso 8) */}
      <div>
        <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-800 uppercase">
          <BarChart3 className="h-4 w-4 text-blue-800" />
          Consolidación de Puntajes y Porcentaje de Orientación por Área (Paso 8)
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-950 text-xs font-semibold text-white">
              <tr>
                <th className="px-3 py-2.5">Prior.</th>
                <th className="px-3 py-2.5">Cód.</th>
                <th className="px-3 py-2.5">Área Vocacional</th>
                <th className="px-3 py-2.5 text-right">Ptos. S1</th>
                <th className="px-3 py-2.5 text-right">Ptos. S3</th>
                <th className="px-3 py-2.5 text-right">Ptos. S4</th>
                <th className="px-3 py-2.5 text-right">Ptos. S5</th>
                <th className="px-3 py-2.5 text-right">Bonus S6</th>
                <th className="px-3 py-2.5 text-right">TOTAL</th>
                <th className="min-w-[155px] px-3 py-2.5 text-right">% Orientación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.detalleAreas.map((row) => {
                const barWidth = Math.min(
                  100,
                  Math.max(4, Math.round((row.porcentajeOrientacion / maxPct) * 100)),
                );
                return (
                  <tr
                    key={row.codigo}
                    className={
                      row.orden === 1
                        ? 'bg-blue-50/80 font-semibold text-blue-950'
                        : row.orden === 2
                          ? 'bg-indigo-50/45'
                          : 'bg-white'
                    }
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.orden}</td>
                    <td className="px-3 py-2 font-mono text-xs font-bold">{row.codigo}</td>
                    <td className="px-3 py-2">{row.nombre}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.ptosS1}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.ptosS3}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.ptosS4}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.ptosS5}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.bonusS6}</td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">{row.total}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              row.orden === 1
                                ? 'bg-blue-700'
                                : row.orden === 2
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-bold tabular-nums">
                          {row.porcentajeOrientacion.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicadores Complementarios */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-700 md:grid-cols-2">
        <div>
          <span className="font-bold text-slate-900">P1.7 Dedicación al estudio:</span>{' '}
          {data.p1_7Dedicacion ?? '—'}/5 — {data.p1_7Interpretacion ?? '—'}
        </div>
        <div>
          <span className="font-bold text-slate-900">P5.4 Actividad extracurricular:</span>{' '}
          {data.p5_4Opcion ? `${data.p5_4Opcion}) ` : ''}
          {data.p5_4Interpretacion ?? '—'}
        </div>
        <div className="md:col-span-2">
          <span className="font-bold text-slate-900">Interpretación Psicométrica (S2):</span>{' '}
          {data.interpretacionS2 || '—'}
        </div>
      </div>
    </div>
  );
}
