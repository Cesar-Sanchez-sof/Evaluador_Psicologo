import { Clock, GraduationCap, Lock, School, Sparkles, Users } from 'lucide-react';
import { LIKERT_SCALE, QUESTIONNAIRE_META } from '../../data/questionnaireData';

export function WelcomeCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      {/* Cabecera Institucional */}
      <div className="border-b border-blue-900/10 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-6 py-7 text-white sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-blue-200 uppercase">
          {QUESTIONNAIRE_META.university}
        </p>
        <p className="mt-1 text-xs font-medium text-blue-100/90">
          {QUESTIONNAIRE_META.faculty}
        </p>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {QUESTIONNAIRE_META.title}
        </h2>
        <p className="mt-1 text-sm font-semibold tracking-wide text-blue-100 sm:text-base">
          {QUESTIONNAIRE_META.subtitle}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <School className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
            <div>
              <p className="text-[11px] font-medium text-blue-200 uppercase">Institución Educativa</p>
              <p className="text-xs font-semibold text-white">{QUESTIONNAIRE_META.school}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
            <div>
              <p className="text-[11px] font-medium text-blue-200 uppercase">Población objetivo</p>
              <p className="text-xs font-semibold text-white">
                {QUESTIONNAIRE_META.targetPopulation}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
            <div>
              <p className="text-[11px] font-medium text-blue-200 uppercase">Tiempo estimado</p>
              <p className="text-xs font-semibold text-white">{QUESTIONNAIRE_META.estimatedTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs text-blue-100">
          <Users className="h-4 w-4 shrink-0 text-blue-200" />
          <span>
            <strong className="font-semibold text-white">Investigadores responsables:</strong>{' '}
            {QUESTIONNAIRE_META.researchers} ({QUESTIONNAIRE_META.affiliation})
          </span>
        </div>
      </div>

      {/* Bienvenida e Instrucciones */}
      <div className="space-y-6 p-6 sm:p-8">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
            <h3 className="text-sm font-bold tracking-wide uppercase">
              {QUESTIONNAIRE_META.welcomeTitle}
            </h3>
          </div>

          <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-700">
            {QUESTIONNAIRE_META.welcomeIntro.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {QUESTIONNAIRE_META.welcomeBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-medium text-blue-900">
            {QUESTIONNAIRE_META.welcomeClosing}
          </p>
        </div>

        {/* Tabla de Valoración Likert 1-5 */}
        <div>
          <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
            Escala de Valoración (Preguntas del 1 al 5)
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {LIKERT_SCALE.map((item) => (
              <div
                key={item.value}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900 text-xs font-bold text-white">
                  {item.value}
                </span>
                <p className="mt-2 text-xs leading-snug font-medium text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compromiso de Confidencialidad */}
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              {QUESTIONNAIRE_META.confidentialityTitle}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/90 sm:text-sm">
              {QUESTIONNAIRE_META.confidentialityText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
