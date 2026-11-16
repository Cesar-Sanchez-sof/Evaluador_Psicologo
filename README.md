# Evaluador Psicológico de Orientación Vocacional & Rendimiento Académico

> **Sistema Integrado de Evaluación Vocacional, Registro de Notas Oficiales y Dataset para Machine Learning**  
> Proyecto de Investigación y Aplicación Psicométrica para Estudiantes de 5.° de Secundaria.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Academic-green)]()

---

## 📌 Datos Institucionales y Académicos

- **Institución Educativa de Aplicación:** IE - SPMA / A1-80819 FRANCISCO LIZARZABURU
- **Población Objetivo:** Estudiantes de 5.° de secundaria (16 a 17 años)
- **Investigadores:**
  - **César Diego Sánchez Chiroque**
  - **Renzo Daniel Ponce Evangelista**
- **Afiliación Académica:** Universidad Privada Antenor Orrego (UPAO) — Facultad de Ingeniería, Escuela Profesional de Ingeniería de Sistemas
- **Propósito:** Investigación psicopedagógica y desarrollo de un modelo predictivo de orientación vocacional basado en Machine Learning (CatBoost).

---

## 📖 Descripción General

El **Evaluador Psicológico** es una solución integral orientada a optimizar el proceso de orientación vocacional escolar. El sistema digitaliza la **Plantilla Oficial de Corrección del Cuestionario de Orientación Vocacional**, automatiza el motor de cálculo de puntajes acumulativos por sección, registra las calificaciones oficiales del Currículo Nacional (CNEB - MINEDU), permite el seguimiento psicopedagógico en vivo con alertas clínicas contextuales, y genera reportes ejecutivos en **Microsoft Excel (.xlsx)** filtrados por sección escolar, así como datasets normalizados para algoritmos de Inteligencia Artificial.

---

## 🚀 Características Principales

1. **Cuestionario Psicométrico Completo (53 Ítems / 7 Secciones):**
   - Escalas Likert (1 a 5) y preguntas de opción única y múltiple.
   - Puntuación automática hacia las 10 áreas vocacionales oficiales.
   - Preguntas **P5.1** y **P5.2** con soporte para respuestas múltiples (+3 puntos a cada área correspondiente).
   - Regla de excepción vocacional militar/policial (+2 puntos al Área 09 en P6.6 = `'d'`).
2. **Módulo de Notas Académicas Oficiales (Rendimiento Escolar):**
   - Registro de los 10 cursos oficiales de secundaria en escala vigesimal (0 a 20).
   - Catálogo relacional de **11 Áreas Curriculares** y **29 Competencias** del Currículo Nacional (CNEB).
   - Conversión automática desde niveles de logro de trimestres (T1 y T2: `AD=19`, `A=16`, `B=12`, `C=8`).
3. **Módulo de Observaciones Psicopedagógicas en Vivo:**
   - Detección automática y en tiempo real de situaciones clínicas notables:
     - **P1.7:** Dedicación académica baja (alerta de desaprovechamiento).
     - **Sección 2:** Perfil psicométrico bajo o muy bajo (Autoeficacia, Resiliencia, Estrés).
     - **P5.4:** Dedicación extracurricular (<2 h o >10 h semanales).
     - **Sección 6:** Entorno socioeconómico o aspiración institucional.
     - **Veredicto:** Empate técnico entre primera y segunda opción vocacional (requiere revisión experta o vocación dual).
   - Cuaderno interactivo tipo Drawer para anotaciones libres o inserción de alertas en un clic.
   - Persistencia oficial en la tabla `veredictos_psicologo`.
4. **Exportación de Reportes a Microsoft Excel (.xlsx) y CSV:**
   - Generación de hojas de cálculo estilizadas (.xlsx nativo) con membrete institucional, formato numérico `0.00`, promedios destacados, fila consolidada de sección y observaciones del evaluador.
   - Filtro interactivo por **Sección escolar** (ej. `"5.° A"`, `"5.° B"`) o consolidado de **Todas las secciones**.
   - Exportación de notas en CSV con BOM UTF-8 (`\uFEFF`) para compatibilidad directa con Excel en español.
5. **Generador de Dataset para Machine Learning (CatBoost):**
   - Exportación de datasets planos normalizados en formato CSV y JSON estructurado (una fila por estudiante con 53 ítems, 10 notas y 10 puntajes consolidados).

---

## 🎯 Estructura del Instrumento de Evaluación

El cuestionario consta de **53 preguntas distribuidas en 7 secciones**:

| Sección | Código | Título | Tipo de Ítems | Ponderación / Regla |
| :---: | :---: | :--- | :--- | :--- |
| **S1** | `P1.1` - `P1.7` | **Rendimiento Académico y Percepción Curricular** | Opción múltiple (`P1.1`, `P1.2`), Likert 1-5 (`P1.3`-`P1.6`), Apoyo (`P1.7`) | `P1.1` suma +1 por área afín; `P1.2` resta -1 por área con dificultad. Likert aportan valor directo. |
| **S2** | `P2.1` - `P2.9` | **Perfil Psicométrico (Conductual y Emocional)** | Likert 1-5 (9 ítems) | Mide Autoeficacia (2A), Resiliencia (2B) y Manejo del Estrés (2C). Nivel: Alto (36-45), Medio (27-35), Bajo (18-26), Muy Bajo (9-17). Moduladora (no suma puntos a áreas). |
| **S3** | `P3.1` - `P3.9` | **Aptitudes Cognitivas Autopercibidas** | Likert 1-5 (9 ítems) | Mide Lógico-Matemático (3A -> Áreas 02, 03, 05), Comprensión Verbal (3B -> Áreas 04, 06, 07) y Espacial-Visual (3C -> Áreas 02, 06, 08, 10). |
| **S4** | `P4.1` - `P4.18` | **Personalidad Vocacional (Modelo RIASEC de Holland)** | Likert 1-5 (18 ítems: 3 por dimensión) | **R**ealista, **I**nvestigador, **A**rtístico, **S**ocial, **E**mprendedor, **C**onvencional. Cada dimensión transfiere sus puntos a las áreas correspondientes. |
| **S5** | `P5.1` - `P5.4` | **Intereses, Hobbies y Exploración Práctica** | Opción múltiple (`P5.1`, `P5.2`), Opción única (`P5.3`), Apoyo (`P5.4`) | Cada opción seleccionada en `P5.1`, `P5.2` y `P5.3` suma **+3 puntos** a sus áreas afines. `P5.4` evalúa horas semanales de dedicación extracurricular. |
| **S6** | `P6.1` - `P6.6` | **Entorno Socioeconómico y Proyecto de Vida** | Opción única (`P6.1` a `P6.6`) | Contextualización familiar, recursos y aspiraciones. Excepción: si `P6.6 = 'd'` (Escuela militar o policial), otorga **+2 puntos bonus al Área 09**. |
| **S7** | — | **Veredicto del Experto Psicólogo** | Uso exclusivo del profesional | Confirmación de 1.ª y 2.ª opción, dictamen de Vocación Dual y registro de observaciones psicopedagógicas. |

---

### Catálogo de las 10 Áreas Vocacionales Oficiales

| Código | Nombre del Área Vocacional | Ejemplos de Carreras Afines |
| :---: | :--- | :--- |
| **`01`** | **Ciencias de la Salud** | Medicina Humana, Enfermería, Odontología, Obstetricia, Farmacia, Nutrición, Psicología Clínica. |
| **`02`** | **Ingenierías y Tecnología** | Ing. de Sistemas y Computación, Civil, Industrial, Mecatrónica, Electrónica, Arquitectura. |
| **`03`** | **Ciencias Básicas y Naturales** | Biología, Química, Física, Matemáticas, Estadística Aplicada, Biotecnología. |
| **`04`** | **Ciencias Sociales y Humanidades** | Derecho, Psicología Organizacional/Educativa, Sociología, Historia, Filosofía, Antropología. |
| **`05`** | **Ciencias Económicas y Empresariales** | Administración, Contabilidad y Finanzas, Economía, Marketing, Negocios Internacionales. |
| **`06`** | **Comunicación, Arte y Diseño** | Ciencias de la Comunicación, Publicidad, Diseño Gráfico, Audiovisuales, Animación Digital. |
| **`07`** | **Educación y Pedagogía** | Educación Inicial, Primaria, Secundaria, Educación Física, Docencia de Idiomas. |
| **`08`** | **Ciencias Agrarias y Ambientales** | Agronomía, Medicina Veterinaria, Zootecnia, Ingeniería Ambiental, Agroindustria. |
| **`09`** | **Seguridad, Defensa y FF. AA.** | Escuelas de Oficiales y Suboficiales de las FF. AA. y PNP, Criminología, Seguridad Integral. |
| **`10`** | **Oficios Técnicos y Tecnológicos** | Mecánica Automotriz, Electricidad Industrial, Gastronomía, Computación e Informática Técnica. |

---

## 🏛️ Modelo de Base de Datos (PostgreSQL)

El esquema relacional cuenta con tablas maestras, transaccionales, vistas consolidadas y funciones PL/pgSQL:

```
[estudiantes]
     │
     ├── 1:1 ──► [notas_oficiales]              (10 notas vigesimales 0-20)
     ├── 1:N ──► [notas_competencias]           (calificaciones T1/T2 por competencia)
     │
     └── 1:N ──► [evaluaciones]
                       │
                       ├── 1:N ──► [respuestas_cuestionario]  (opciones y Likert P1.1 a P6.6)
                       ├── 1:1 ──► [resultados_evaluacion]   (carreras ganadoras y perfil S2)
                       ├── 1:10 ─► [resultados_detalle_area] (puntos S1 a S6 por área)
                       └── 1:1 ──► [veredictos_psicologo]    (observaciones y firma profesional)

[areas_curriculares] ── 1:N ──► [competencias_curriculares]   (29 competencias CNEB)
[secciones_cuestionario] ── 1:N ──► [preguntas] ── 1:N ──► [opciones_pregunta]
```

### Tablas Principales:
- **`estudiantes`**: Almacena datos generales (nombres, sección, grado, edad, sexo, institución).
- **`notas_oficiales`**: Calificaciones finales en escala 0–20 de los 10 cursos obligatorios de secundaria.
- **`areas_curriculares` & `competencias_curriculares`**: Catálogo normalizado de 11 áreas de secundaria y 29 competencias de la Educación Básica Regular.
- **`evaluaciones`**: Encabezado de la prueba con fecha, estado (`'completada'`, `'evaluada'`, `'revisada'`) y tiempo de llenado.
- **`respuestas_cuestionario`**: Registro detallado de respuestas con clave única `(evaluacion_id, pregunta_id, codigo_opcion)` que soporta respuestas múltiples.
- **`resultados_evaluacion`**: Consolidado final generado por el motor SQL con la 1.ª y 2.ª opción vocacional y el perfil psicométrico.
- **`resultados_detalle_area`**: Desglose transparente de los puntos obtenidos en cada sección (Ptos. S1, S3, S4, S5 y S6) y porcentaje de orientación.
- **`veredictos_psicologo`**: Ficha del profesional con nombre del evaluador, número CPSP, vocación dual y observaciones psicopedagógicas.

---

## 💻 Stack Tecnológico

| Capa | Tecnologías Utilizadas |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5, Vite 6, Tailwind CSS 4, Lucide React Icons |
| **Backend** | Node.js (v18+ / v20+), Express 5, TypeScript (ES Modules), Zod, node-postgres (`pg`), ExcelJS |
| **Base de Datos** | PostgreSQL 15+ (Vistas analíticas y funciones almacenadas PL/pgSQL) |
| **Testing** | Node.js Native Test Runner (`tsx --test`), comprobación estática con `tsc --noEmit` |

---

## 📂 Estructura del Repositorio

```text
Evaluador_Psicologo/
├── Back-end/
│   ├── database/
│   │   ├── evaluador_vocacional.sql     # Script DDL y DML maestro completo
│   │   └── migrations/                  # Migraciones incrementales numeradas
│   ├── src/
│   │   ├── config/                      # Conexión a PostgreSQL y validación de variables de entorno
│   │   ├── controllers/                 # Controladores Express (evaluación y exportación)
│   │   ├── middlewares/                 # Manejo centralizado de errores
│   │   ├── routes/                      # Definición de rutas API REST
│   │   ├── schemas/                     # Esquemas de validación Zod
│   │   ├── services/                    # Lógica de scoring, evaluación y exportación Excel/CSV
│   │   └── types/                       # Interfaces TypeScript
│   ├── tests/                           # Tests unitarios del motor de scoring y exportación
│   ├── package.json
│   └── tsconfig.json
├── Front-end/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Componentes reutilizables (barras de progreso, etc.)
│   │   │   ├── layout/                  # Header y barra de navegación lateral
│   │   │   ├── observations/            # Drawer interactivo de observaciones psicopedagógicas
│   │   │   ├── questionnaire/           # Formularios de datos, notas, Likert, opciones y veredicto
│   │   │   └── results/                 # Panel de resultados, monitor de áreas y visor de notas
│   │   ├── services/                    # Cliente HTTP API y detección de alertas
│   │   ├── types/                       # Tipado del cuestionario, notas y competencias
│   │   ├── App.tsx                      # Orquestador del flujo de navegación
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## ⚙️ Instalación y Configuración

### 1. Prerrequisitos
- **Node.js** (v18 o superior) y **npm** instalados.
- **PostgreSQL** (v14 o superior) en ejecución local o remota.

### 2. Clonación del Repositorio
```bash
git clone https://github.com/Cesar-Sanchez-sof/Evaluador_Psicologo.git
cd Evaluador_Psicologo
```

### 3. Configuración de la Base de Datos
Crea una base de datos en PostgreSQL (por ejemplo, `evaluador_vocacional_db`) y ejecuta el script maestro:
```bash
# Con psql (o utiliza pgAdmin / DBeaver)
psql -U postgres -d evaluador_vocacional_db -f Back-end/database/evaluador_vocacional.sql
```

### 4. Configuración del Backend
Crea un archivo `.env` en el directorio `Back-end/` con tus credenciales:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/evaluador_vocacional_db
CORS_ORIGIN=http://localhost:5173
```

Instala las dependencias del backend:
```bash
cd Back-end
npm install
```

### 5. Configuración del Frontend
Instala las dependencias del frontend:
```bash
cd ../Front-end
npm install
```

---

## 🏃 Ejecución en Desarrollo

Para iniciar el sistema en tu entorno local:

1. **Iniciar el Backend (API):**
   ```bash
   cd Back-end
   npm run dev
   ```
   *El servidor API estará disponible en `http://localhost:3000`.*

2. **Iniciar el Frontend (Interfaz de Usuario):**
   ```bash
   cd Front-end
   npm run dev
   ```
   *La aplicación web se abrirá en `http://localhost:5173`.*

---

## 🧪 Pruebas Unitarias y Calidad de Código

El backend cuenta con tests unitarios automatizados que verifican:
- Cálculo exacto de puntajes por sección y área vocacional según el caso testigo de la Plantilla oficial (Juan Pérez).
- Acumulación de puntos con respuestas múltiples en `P1.1`, `P1.2`, `P5.1` y `P5.2`.
- Bonificación especial de vocación militar (+2 puntos al Área 09).
- Generación de archivos Excel (`.xlsx`) y CSV con BOM UTF-8 y formatos numéricos.

Para ejecutar los tests y validaciones:
```bash
# Ejecutar tests unitarios en el Backend
npm test --prefix Back-end

# Verificación de tipos TypeScript en el Backend
npm run typecheck --prefix Back-end

# Build de producción y verificación de tipos en el Frontend
npm run build --prefix Front-end
```

---

## 🌐 Endpoints de la API REST

| Método | Endpoint | Descripción | Parámetros / Body |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/cuestionario/estructura` | Retorna catálogo de áreas, 7 secciones, 53 preguntas y opciones. | — |
| `POST` | `/api/cuestionario/preview` | Calcula y previsualiza los puntajes en memoria sin guardar. | `{ respuestas: { ... } }` |
| `POST` | `/api/evaluaciones` | Guarda el estudiante, notas oficiales, respuestas y evalúa en BD. | Estudiante, notas, respuestas, observaciones. |
| `GET` | `/api/evaluaciones` | Lista todas las evaluaciones registradas con sus resultados. | — |
| `GET` | `/api/evaluaciones/:id` | Detalle completo de una evaluación (hoja de corrección y desglose). | `id` (parámetro de ruta) |
| `PUT` | `/api/evaluaciones/:id/veredicto` | Actualiza el veredicto del psicólogo y observaciones en PostgreSQL. | Veredicto, observaciones, CPSP. |
| `GET` | `/api/export/secciones` | Lista de secciones escolares únicas registradas en la base de datos. | — |
| `GET` | `/api/export/notas` | Descarga el reporte consolidado de notas oficiales en Excel (`.xlsx`) o CSV. | `?seccion=A&format=xlsx` (o `format=csv`) |
| `GET` | `/api/export/csv` | Descarga dataset plano normalizado de 53 ítems para Pandas / CatBoost. | `?seccion=A` (opcional) |
| `GET` | `/api/export/json` | Descarga el dataset de investigación en formato JSON. | `?seccion=A` (opcional) |

---

## 📊 Formato de Exportación a Excel (.xlsx)

El reporte generado por el endpoint `/api/export/notas` cuenta con diseño profesional que incluye:
- **Encabezado Institucional:** Membrete oficial de la IE Francisco Lizarzaburu y fecha de emisión.
- **Filtro Aplicado:** Indicador dinámico de la sección escolar seleccionada o `"Todas las Secciones"`.
- **Calificaciones Vigesimales (0–20):** Columnas formateadas numéricamente con decimales (`0.00`) para los 10 cursos oficiales.
- **Promedio Ponderado:** Columna destacada en color azul suave con el promedio general del estudiante.
- **Resultados Vocacionales:** 1.ª y 2.ª opción vocacional con puntaje, nivel psicométrico S2 y observaciones cualitativas.
- **Fila de Consolidado:** Promedio general por curso calculado para toda la sección al final de la tabla.

---

## 🤝 Convenciones de Git y Flujo de Trabajo

El proyecto implementa el estándar **Conventional Commits**:
- `feat(...)`: Nuevas funcionalidades del sistema.
- `fix(...)`: Corrección de errores o ajustes de lógica.
- `docs(...)`: Documentación y actualización de manuales.
- `refactor(...)`: Mejoras de arquitectura sin alterar el comportamiento.
- `test(...)`: Incorporación o mejora de pruebas unitarias.

Estructura de ramas:
- `main`: Versión estable para producción.
- `develop`: Rama principal de integración y desarrollo.
- `feature/...`: Ramas temáticas de trabajo creadas a partir de `develop` que se incorporan mediante Pull Request.

---

## 📄 Licencia y Derechos

Desarrollado con fines académicos y de investigación científica por **César Diego Sánchez Chiroque** y **Renzo Daniel Ponce Evangelista** en colaboración con la **Universidad Privada Antenor Orrego (UPAO)** y la **IE - SPMA / A1-80819 Francisco Lizarzaburu**. Todos los derechos reservados.
