import { ChevronDown, UserRound } from 'lucide-react';
import type { GeneralDataState } from '../../types/questionnaire';

const DEFAULT_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface GeneralDataFormProps {
  data: GeneralDataState;
  ageOptions: string[];
  sexOptions: string[];
  sectionOptions?: string[];
  onChange: (updated: GeneralDataState) => void;
}

export function GeneralDataForm({
  data,
  ageOptions,
  sexOptions,
  sectionOptions = DEFAULT_SECTIONS,
  onChange,
}: GeneralDataFormProps) {
  const availableSections = sectionOptions.length > 0 ? sectionOptions : DEFAULT_SECTIONS;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900/10 text-blue-900">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">DATOS GENERALES</h3>
          <p className="text-xs text-slate-500">Información básica de identificación académica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="student-fullname"
            className="block text-sm font-semibold text-slate-800"
          >
            a. Nombres y apellidos completos:
          </label>
          <input
            id="student-fullname"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="Ingresa tus nombres y apellidos completos"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-slate-800">
            b. Edad (en años cumplidos):
          </span>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ageOptions.map((age) => {
              const selected = data.ageOption === age;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => onChange({ ...data, ageOption: age })}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                    selected
                      ? 'border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
          {data.ageOption === 'Otro' && (
            <input
              type="text"
              value={data.ageOther}
              onChange={(e) => onChange({ ...data, ageOther: e.target.value })}
              placeholder="Especifica tu edad..."
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <span className="block text-sm font-semibold text-slate-800">c. Sexo:</span>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {sexOptions.map((sex) => {
                const selected = data.sex === sex;
                return (
                  <button
                    key={sex}
                    type="button"
                    onClick={() => onChange({ ...data, sex })}
                    className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition ${
                      selected
                        ? 'border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {sex}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="student-section" className="block text-sm font-semibold text-slate-800">
              d. Sección (5.° de secundaria — Sección):
            </label>
            <div className="relative mt-2">
              <select
                id="student-section"
                value={data.sectionName}
                onChange={(e) => onChange({ ...data, sectionName: e.target.value })}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
              >
                <option value="" disabled>
                  -- Selecciona tu sección (A, B, C, D, E o F) --
                </option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    Sección {sec.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {data.sectionName ? (
              <p className="mt-1.5 text-xs font-semibold text-blue-800">
                ✓ Seleccionado: 5.° de secundaria — Sección "{data.sectionName.toUpperCase()}"
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Selecciona la sección correspondiente entre las opciones de la A a la F.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
