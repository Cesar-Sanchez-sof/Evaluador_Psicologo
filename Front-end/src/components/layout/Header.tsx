import { BookOpenCheck, ClipboardList, Layers, ListChecks, RotateCcw, Search, X } from 'lucide-react';
import type { QuestionnaireMeta, ViewMode } from '../../types/questionnaire';

interface HeaderProps {
  meta: QuestionnaireMeta;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  answeredCount: number;
  totalCount: number;
  onResetAll: () => void;
}

export function Header({
  meta,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
  answeredCount,
  totalCount,
  onResetAll,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-indigo-700 text-white shadow-sm">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-blue-800 ring-1 ring-blue-700/15">
                UPAO · SISTEMAS
              </span>
              <span className="truncate text-xs font-medium text-slate-500">{meta.school}</span>
            </div>
            <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {meta.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {viewMode === 'all' && (
            <div className="relative min-w-[220px] flex-1 sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar ítem (ej. P4.10, RIASEC)..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5"
            role="group"
            aria-label="Modo de visualización"
          >
            <button
              type="button"
              onClick={() => onChangeViewMode('step')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'step'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Por secciones
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('all')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'all'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Ver todas ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('results')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'results'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Resultados BD
            </button>
          </div>

          {answeredCount > 0 && viewMode !== 'results' && (
            <button
              type="button"
              onClick={onResetAll}
              title="Limpiar respuestas seleccionadas"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
