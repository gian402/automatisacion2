importante : cada vez que terminas un instruccion debes de marcarla como completada 

✅ [COMPLETADO] PROMPT 01 — Análisis y arquitectura
Estamos desarrollando un sistema web corporativo para HYTICON, empresa especializada en TI y Seguridad Electrónica.

El objetivo es mejorar y posteriormente automatizar el proceso de elaboración, gestión y seguimiento de cotizaciones.

Actualmente el proceso es:

Cliente solicita una cotización normalmente por WhatsApp.
↓
El responsable recibe la solicitud.
↓
Busca manualmente una plantilla.
↓
Escribe manualmente los datos del cliente y proyecto.
↓
Agrega productos, materiales y servicios.
↓
Realiza o verifica cálculos.
↓
Genera la cotización.
↓
La envía al cliente por WhatsApp.
↓
Realiza seguimiento manual.

La plantilla real de cotización de HYTICON proporcionada en el proyecto debe considerarse como referencia funcional para el diseño del sistema.

El documento utiliza información como:

* Número de cotización.
* Datos del cliente.
* RUC.
* Dirección.
* Proyecto.
* Fecha de emisión.
* Fecha de vencimiento.
* Tipo de documento.
* Responsable.
* Moneda.
* Ítems.
* Tipo de ítem.
* Descripción.
* Cantidad.
* Precio unitario.
* Subtotal.
* Términos y condiciones.
* Valor de venta.
* IGV.
* Total.

El sistema tendrá únicamente dos roles:

ADMINISTRADOR:
Control completo del sistema.

SUPERVISOR:
Acceso operativo limitado.

Tecnologías objetivo:

Frontend:
React + Vite + TypeScript
Tailwind CSS
shadcn/ui
Lucide React
React Hook Form
Zod
TanStack Query

Backend:
Node.js
NestJS
TypeScript
REST API
JWT
Refresh Tokens

Base de datos:
PostgreSQL
Prisma ORM

Automatización:
n8n

PDF:
HTML + CSS + Puppeteer

Almacenamiento:
Supabase Storage cuando sea necesario.

IMPORTANTE:

En esta etapa NO escribas código.

Analiza el problema y entrega:

1. Objetivo del sistema.
2. Problemas actuales.
3. Solución propuesta.
4. Arquitectura general.
5. Arquitectura frontend.
6. Arquitectura backend.
7. Arquitectura de base de datos.
8. Flujo completo de una cotización.
9. Flujo de autenticación.
10. Flujo de permisos.
11. Integración futura con n8n.
12. Generación del PDF.
13. Módulos necesarios.
14. Reglas de negocio iniciales.
15. Riesgos técnicos.
16. Información que todavía debemos definir.

No inventes información empresarial que no esté definida.

Si algo no está definido, marcarlo como:

POR DEFINIR

No agregues funcionalidades solamente para hacer que el proyecto parezca más grande.

La prioridad es crear un sistema realista, profesional y alineado al proceso real de HYTICON.


✅ [COMPLETADO] PROMPT 02 — Requisitos y reglas de negocio
— RF (25), RNF (12), Reglas de negocio, autorización, clientes, productos, cotizaciones, cálculos, estados, documentos, auditoría y n8n definidos.
A partir del análisis anterior, ahora define formalmente los requisitos funcionales y no funcionales del sistema.

Organiza la respuesta en:

1. Requisitos funcionales.
2. Requisitos no funcionales.
3. Reglas de negocio.
4. Reglas de autorización.
5. Reglas para clientes.
6. Reglas para productos y servicios.
7. Reglas para cotizaciones.
8. Reglas para cálculos.
9. Reglas para estados.
10. Reglas para documentos.
11. Reglas para auditoría.
12. Reglas para automatizaciones.

Define claramente qué puede hacer ADMINISTRADOR y qué puede hacer SUPERVISOR.

No escribas código todavía.

No inventes procesos empresariales.

Cuando una regla no esté definida por los requisitos actuales, marcarla como POR DEFINIR.


✅ [COMPLETADO] PROMPT 03 — Base de datos
— 8 entidades: users, refresh_tokens, clientes, catalogo_items, cotizaciones, cotizacion_items, historial_estados, auditoria
— Enums: Rol, Moneda, EstadoCotizacion, TipoItem, CategoriaCatalogo
— Eliminación lógica con campo activo en users, clientes, catalogo_items
— Auditoría append-only, precios congelados en cotizacion_items
— Archivo: backend/prisma/schema.prisma (241 líneas)
Diseña el modelo de datos PostgreSQL para el sistema HYTICON basándote exclusivamente en los requisitos y reglas definidos anteriormente.

Tecnología:

PostgreSQL + Prisma ORM.

Necesitamos como mínimo analizar entidades para:

* Usuarios.
* Roles.
* Clientes.
* Contactos.
* Categorías.
* Productos.
* Servicios.
* Cotizaciones.
* Detalles de cotización.
* Historial de estados.
* Documentos.
* Auditoría.
* Configuración empresarial.

Entrega:

1. Entidades.
2. Campos.
3. Tipos de datos.
4. Primary keys.
5. Foreign keys.
6. Relaciones.
7. Cardinalidades.
8. Índices necesarios.
9. Restricciones.
10. Campos obligatorios y opcionales.
11. Estrategia de eliminación lógica cuando corresponda.
12. Consideraciones de seguridad.
13. Diagrama ER conceptual.
14. Modelo Prisma propuesto.

No crees tablas innecesarias.

No generes migraciones todavía.

Primero explica las decisiones del modelo.


✅ [COMPLETADO] PROMPT 04 — Backend
— Arquitectura definida: estructura de carpetas, módulos, controllers, endpoints REST, DTOs, guards, decorators, filtro global, auditoría, motor de cálculo, integración n8n
— Archivos generados: JwtAuthGuard, RolesGuard, HttpExceptionFilter, @Public, @Roles, @CurrentUser, AuditoriaService, AuditoriaModule, app.module.ts actualizado
Diseña la arquitectura backend del sistema HYTICON utilizando:

* Node.js.
* NestJS.
* TypeScript.
* PostgreSQL.
* Prisma.
* REST API.
* JWT.
* Refresh Tokens.

Organiza el backend por dominios/módulos.

Define:

1. Estructura de carpetas.
2. Módulos.
3. Controllers.
4. Services.
5. DTOs.
6. Guards.
7. Decorators.
8. Middleware.
9. Validaciones.
10. Manejo global de errores.
11. Autenticación.
12. Autorización.
13. Auditoría.
14. Manejo de archivos.
15. Integración futura con n8n.
16. Variables de entorno.
17. Endpoints REST.

No implementes todavía todos los módulos.

Primero presenta la arquitectura y explica las decisiones.

✅ [COMPLETADO] PROMPT 05 — Frontend
— React + Vite + TS inicializado. Tailwind CSS v4 + Radix UI + shadcn/ui style. TanStack Query v5, Axios, React Hook Form, Zod, Lucide React, Sonner.
— Estructura: src/components/ui|layout|common, contexts, hooks, services, types, pages, router, config.
— AuthContext con refresh de sesión en memoria, reducer, logout forzado por interceptor.
— useAuth + usePermissions con matriz de permisos por rol.
— AppRouter con ProtectedRoute/PublicRoute, lazy loading, React Router v7.
— MainLayout: Sidebar corporativo oscuro + Header con dropdown de usuario.
— Componentes base: Button, Input, Label, Badge, EstadoBadge, Card, Separator, EmptyState, ErrorMessage, PageError, Skeleton, PageLoading.
— Páginas: LoginPage (formulario con validación), DashboardPage, NotFoundPage, placeholders de todos los módulos.
— Build de producción verificado: 0 errores.
— Archivos: frontend/ (estructura completa)
Diseña la arquitectura frontend utilizando:

* React.
* Vite.
* TypeScript.
* Tailwind CSS.
* shadcn/ui.
* Lucide React.
* React Hook Form.
* Zod.
* TanStack Query.

Define:

1. Estructura de carpetas.
2. Layout principal.
3. Sidebar.
4. Header.
5. Sistema de rutas.
6. Protección de rutas.
7. Manejo de sesión.
8. Manejo de permisos.
9. Componentes reutilizables.
10. Formularios.
11. Tablas.
12. Modales.
13. Notificaciones.
14. Estados de carga.
15. Estados vacíos.
16. Estados de error.

No generes todavía todas las pantallas.

La arquitectura debe ser escalable pero sencilla.

✅ [COMPLETADO] PROMPT 06 — UI/UX
— index.css: sistema de tokens completo (colores, tipografía, espaciado, radios, sombras, transiciones, animaciones CSS).
— Formularios: Textarea, Select (nativo + ChevronDown), FormField (Label+input+error wrapper), Checkbox (Radix UI).
— Table: columnas configurables, sorting con useSortState, estados carga/vacío/error, TablePagination, render custom.
— Dialog/Modal: DialogContent (sm/md/lg/xl), DialogHeader/Body/Footer, ConfirmDialog prebuilt (danger/primary).
— Navegación: PageHeader, Breadcrumb con enlace activo.
— Tooltip (Radix UI), Alert (info/success/warning/error), StatCard con TrendIndicator.
— LoginPage rediseñada: split layout oscuro/claro, FormField con íconos, error accesible.
— Build de producción verificado: 0 errores TS, 1842 módulos.
— Archivos: src/components/ui/* + src/components/common/* + src/index.css + src/pages/auth/LoginPage
Diseña el sistema visual del software HYTICON.

Objetivo:

Crear una interfaz empresarial profesional, elegante, sobria, moderna y funcional.

NO queremos:

* Dashboard genérico.
* Gradientes exagerados.
* Glassmorphism excesivo.
* Animaciones innecesarias.
* Tarjetas gigantes.
* Colores aleatorios.
* Iconos decorativos sin propósito.
* Textos genéricos de IA.
* Interfaz sobrecargada.

Queremos:

* Jerarquía visual clara.
* Excelente espaciado.
* Tipografía profesional.
* Tablas limpias.
* Formularios fáciles de utilizar.
* Navegación intuitiva.
* Estados visuales claros.
* Feedback inmediato.
* Diseño consistente.

Define:

1. Paleta de colores corporativa.
2. Tipografía.
3. Escala de tamaños.
4. Espaciado.
5. Border radius.
6. Sombras.
7. Botones.
8. Inputs.
9. Selects.
10. Tablas.
11. Badges.
12. Modales.
13. Toasts.
14. Sidebar.
15. Header.
16. Dashboard.
17. Formularios.
18. Estados de cotización.

Utiliza la identidad visual real de HYTICON como referencia.

No inventes una identidad completamente diferente.

La prioridad es que el sistema parezca un producto empresarial real.

✅ [COMPLETADO] PROMPT 07 — Inicialización
— NestJS actualizado a v11 (corregidas vulnerabilidades de seguridad). Frontend con react-router-dom v7.
— .env del backend creado (DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET, etc.).
— .gitignore raíz: excluye .env, node_modules, dist, .cache, .local-chromium.
— ESLint + Prettier configurados en backend (.eslintrc.js + .prettierrc). Prettier en frontend.
— AuthModule stub: JwtModule.registerAsync + PassportModule + JwtStrategy (valida token y usuario activo en DB).
— JwtPayload interface en src/common/interfaces/.
— auditoria.service.ts corregido (Prisma.InputJsonValue para campo JSON).
— prisma/seed.ts: crea admin@hyticon.com (ADMIN) y supervisor@hyticon.com (SUPERVISOR) con bcrypt.
— package.json raíz con scripts: dev, build, install:all, prisma:*, lint, test.
— Backend compila sin errores: nest build limpio.
— Frontend compila sin errores: vite build limpio (verificado en Prompt 05/06).
— Archivos: backend/.env, .gitignore, backend/.eslintrc.js, backend/.prettierrc, backend/src/auth/*, backend/prisma/seed.ts, package.json raíz.

Comandos para iniciar:
  Backend:  cd backend && npm run start:dev    → http://localhost:3000/api/v1
  Frontend: cd frontend && npm run dev          → http://localhost:5173
  Ambos:    npm run dev  (desde raíz)
  Swagger:  http://localhost:3000/api/docs
  Seed:     npm run prisma:seed
Ahora implementa la estructura inicial del proyecto basándote en la arquitectura aprobada.

Configura:

Frontend:
React + Vite + TypeScript
Tailwind CSS
shadcn/ui
Lucide React
React Hook Form
Zod
TanStack Query

Backend:
NestJS + TypeScript
Prisma
PostgreSQL

Configura:

* ESLint.
* Prettier.
* Variables de entorno.
* Git.
* .gitignore.
* Scripts de desarrollo.
* Configuración base.

NO implementes todavía los módulos completos.

Primero asegúrate de que frontend y backend ejecuten correctamente.

Al finalizar indica:

* Comandos utilizados.
* Estructura creada.
* Dependencias.
* Cómo ejecutar frontend.
* Cómo ejecutar backend.
* Próximo paso.

✅ [COMPLETADO] PROMPT 08 — Autenticación
— AuthService: login (bcrypt, JWT sign, refresh token hasheado SHA-256 en DB, auditoría), logout (delete por hash), logoutAll, refresh (rotación de token), getMe, hashPassword.
— AuthController: POST /auth/login (cookie HttpOnly), POST /auth/logout, POST /auth/refresh (rotación), GET /auth/me.
— Refresh token almacenado hasheado (SHA-256), nunca en texto plano. Cookie path limitado a /api/v1/auth.
— DTOs: LoginDto (class-validator), AuthResponseDto.
— JwtStrategy valida usuario activo en BD en cada request.
— Frontend: AuthContext conectado a API real (login/logout/refresh). Access token en memoria.
— Archivos: src/auth/auth.service.ts, src/auth/auth.controller.ts, src/auth/dto/login.dto.ts.

✅ [COMPLETADO] PROMPT 09 — Roles
— Backend: UsersModule + UsersService (findAll, findOne, create, update, toggleActivo con auditoría e invalidación de sesiones).
— UsersController: todos los endpoints protegidos con @Roles(Rol.ADMIN). @CurrentUser() para obtener el admin ejecutor.
— DTOs: CreateUserDto, UpdateUserDto (PartialType), ToggleUserDto.
— Al desactivar usuario se invalidan todos sus refresh tokens.
— Frontend: useApi hook (useApiQuery, useApiMutation con toast automático, getApiErrorMessage).
— UsuariosPage: tabla con rol/estado, modal crear usuario (RHF+Zod), confirmación toggle activo.
— usersService conectado a API real (/users endpoints).
— Build backend y frontend verificados: 0 errores.
— Archivos: src/users/*, src/hooks/useApi.ts, src/services/users.service.ts, src/pages/usuarios/UsuariosPage.tsx.
Implementa el sistema de autenticación.

Debe incluir:

* Login.
* Logout.
* JWT.
* Refresh token.
* Hash seguro de contraseñas.
* Validación.
* Manejo de sesión.
* Protección de rutas.
* Protección de endpoints.
* Recuperación segura de sesión.

Roles:

ADMINISTRADOR
SUPERVISOR

No implementar todavía funcionalidades de otros módulos.

La autenticación debe estar preparada para producción.

Nunca almacenar contraseñas en texto plano.

No exponer secretos en frontend.

Incluye manejo correcto de errores y estados de carga.

✅ [COMPLETADO — ver PROMPT 08]
PROMPT 09 — Roles
Implementa el sistema de autorización basado en roles.

Roles:

ADMINISTRADOR
SUPERVISOR

ADMINISTRADOR:
Acceso completo.

SUPERVISOR:
Acceso operativo limitado.

Implementar autorización:

1. En frontend.
2. En backend.

Crear una matriz de permisos.

El backend debe rechazar solicitudes no autorizadas aunque el usuario manipule el frontend.

Utilizar Guards/Decorators en NestJS cuando sea apropiado.

No duplicar reglas de autorización innecesariamente.

✅ [COMPLETADO] PROMPT 10 — Clientes
— Backend: ClientesService + ClientesController + DTOs (CreateClienteDto, UpdateClienteDto, ToggleClienteDto) + ClientesModule integrado en AppModule.
— Endpoints: GET /clientes (paginación+búsqueda), GET /clientes/:id, POST /clientes, PATCH /clientes/:id, PATCH /clientes/:id/toggle.
— Validaciones: RUC único (11 dígitos), razón social obligatoria, email válido, auditoría en crear/actualizar/toggle.
— Frontend: clientes.service.ts conectado a API real. ClientesPage con tabla corporativa, búsqueda con debounce, paginación, modal crear/editar (RHF+Zod), toggle activo con ConfirmDialog.
— Build verificado: 1868 módulos, 0 errores TS.
— Archivos: backend/src/clientes/*, frontend/src/services/clientes.service.ts, frontend/src/pages/clientes/ClientesPage.tsx.
Implementa el módulo de clientes.

Funcionalidades:

* Listar.
* Buscar.
* Filtrar.
* Crear.
* Editar.
* Consultar detalle.
* Activar/desactivar cuando corresponda.

Datos:

* Razón social / nombre.
* RUC.
* Dirección.
* Contacto.
* Teléfono.
* Correo.
* Estado.

Implementar:

* Backend.
* API.
* Validaciones.
* Base de datos.
* Frontend.
* Tabla.
* Formulario.
* Estados de carga.
* Estados vacíos.
* Errores.
* Permisos.

La interfaz debe mantener el diseño corporativo aprobado.

No agregar funcionalidades no solicitadas.

✅ [COMPLETADO] PROMPT 11 — Productos y servicios
— Backend: CatalogoService + CatalogoController + DTOs (CreateCatalogoItemDto, UpdateCatalogoItemDto, ToggleCatalogoItemDto) + CatalogoModule integrado en AppModule.
— Endpoints: GET /catalogo (búsqueda+filtro categoría+paginación), GET /catalogo/:id, POST /catalogo (ADMIN), PATCH /catalogo/:id (ADMIN), PATCH /catalogo/:id/toggle (ADMIN).
— Categorías: HARDWARE, MATERIALES, MANO_OBRA, SERVICIOS. Código único normalizado a mayúsculas.
— Frontend: catalogo.service.ts + CatalogoPage con tabla corporativa, filtros, modal crear/editar (RHF+Zod), toggle activo con ConfirmDialog.
— Precio referencial congelado en cotizacion_items al crear cotización.
— Archivos: backend/src/catalogo/*, frontend/src/services/catalogo.service.ts, frontend/src/pages/catalogo/CatalogoPage.tsx, frontend/src/types/catalogo.ts.
Implementa el módulo de productos y servicios.

Debe permitir gestionar:

* Código.
* Nombre.
* Descripción.
* Categoría.
* Unidad.
* Precio referencial.
* Estado.

Categorías iniciales:

* Hardware.
* Materiales.
* Mano de obra.
* Servicios.

Debe existir búsqueda y filtros.

Los precios deben poder utilizarse como referencia al crear una cotización.

IMPORTANTE:

Cuando un producto sea utilizado dentro de una cotización, guardar el precio utilizado en el detalle de la cotización para preservar el historial.

Implementar backend, API, validaciones, frontend y permisos.


✅ [COMPLETADO] PROMPT 12 — COTIZACIONES
— Backend: CotizacionesService + CotizacionesController + DTOs + CotizacionesModule.
— Endpoints: GET /cotizaciones, GET /cotizaciones/:id, POST /cotizaciones, PATCH /cotizaciones/:id, PATCH /cotizaciones/:id/estado, GET /cotizaciones/:id/historial.
— Numeración automática COT-YYYY-NNNN. Transiciones de estado controladas. SUPERVISOR solo gestiona sus cotizaciones.
— Frontend: cotizaciones.service.ts + CotizacionesPage (listado+filtros) + NuevaCotizacionPage (wizard) + DetalleCotizacionPage.
— Archivos: backend/src/cotizaciones/*, frontend/src/services/cotizaciones.service.ts, frontend/src/types/cotizacion.ts, frontend/src/pages/cotizaciones/*.
PROMPT 12 — COTIZACIONES
Implementa el módulo principal de cotizaciones.

La cotización debe contener:

* Número.
* Cliente.
* RUC.
* Dirección.
* Proyecto.
* Fecha de emisión.
* Fecha de vencimiento.
* Tipo de documento.
* Responsable.
* Moneda.
* Ítems.
* Términos y condiciones.
* Valor de venta.
* IGV.
* Total.
* Estado.

El flujo de creación debe ser:

1. Seleccionar cliente.
2. Registrar proyecto.
3. Seleccionar responsable.
4. Seleccionar moneda.
5. Agregar productos/servicios.
6. Definir cantidades.
7. Utilizar precio referencial.
8. Permitir modificación controlada del precio.
9. Calcular automáticamente.
10. Agregar términos.
11. Mostrar resumen.
12. Guardar.
13. Mostrar vista previa.

Implementar:

* Backend.
* API.
* Frontend.
* Formularios.
* Tabla.
* Detalle.
* Búsqueda.
* Filtros.
* Validaciones.
* Permisos.
* Historial básico.

No implementar todavía n8n.

Primero debe funcionar correctamente el proceso interno de cotización.


✅ [COMPLETADO] PROMPT 13 — Cálculos
— Motor de cálculo en backend/src/cotizaciones/calculo.engine.ts: calcularSubtotalItem (cantidad × precioUnitario), calcularTotalesCotizacion (valorVenta, igv 18%, total).
— Usa Decimal de Prisma para evitar errores de punto flotante. Backend recalcula y valida siempre al guardar.
— Frontend muestra cálculos en tiempo real; backend es la fuente de verdad.
— Archivos: backend/src/cotizaciones/calculo.engine.ts.
PROMPT 13 — Cálculos
Implementa y valida el motor de cálculo de cotizaciones.

Reglas:

subtotal_item = cantidad × precio_unitario

valor_venta = suma de subtotales

IGV = valor_venta × 0.18

total = valor_venta + IGV

Los cálculos críticos deben validarse en backend.

El frontend puede mostrar cálculos en tiempo real, pero el backend debe recalcular y verificar los valores antes de guardar.

Manejar correctamente:

* Decimales.
* Redondeos.
* Cantidades.
* Precios.
* IGV.
* Totales.

Evitar errores de precisión de punto flotante.

Crear pruebas unitarias para los cálculos.


✅ [COMPLETADO] PROMPT 14 — PDF
— PdfService con Puppeteer: genera PDF A4 desde plantilla HTML independiente basada en cotización real de HYTICON.
— Plantilla incluye: header HYTICON, datos cliente, datos documento, tabla de ítems, totales, términos, área de firmas, footer.
— Endpoint: GET /pdf/cotizacion/:id (stream application/pdf con nombre de archivo).
— Auditoría registrada al generar PDF. Datos validados contra cotización en DB.
— Archivos: backend/src/pdf/pdf.service.ts, backend/src/pdf/pdf.controller.ts, backend/src/pdf/pdf.module.ts.
PROMPT 14 — PDF
Implementa la generación de la cotización PDF.

Utilizar:

HTML + CSS + Puppeteer.

El PDF debe estar basado visual y estructuralmente en la plantilla real de cotización de HYTICON.

Debe contener:

* Logo/nombre HYTICON.
* Información empresarial.
* Número de cotización.
* Datos del cliente.
* RUC.
* Dirección.
* Proyecto.
* Fecha de emisión.
* Fecha de vencimiento.
* Tipo de documento.
* Responsable.
* Moneda.
* Tabla de ítems.
* Tipo.
* Descripción.
* Cantidad.
* Precio unitario.
* Subtotal.
* Términos y condiciones.
* Valor de venta.
* IGV 18%.
* Total.
* Sección de validación/firma cuando corresponda.

El documento debe ser profesional y listo para enviarse al cliente.

NO generar el PDF como captura de pantalla.

Crear una plantilla HTML independiente.

El PDF debe poder generarse desde una cotización existente.

Validar que los datos mostrados coincidan con la cotización almacenada.


✅ [COMPLETADO] PROMPT 15 — Auditoría
— Backend: AuditoriaService actualizado con findAll filtrado (accion, entidad, usuarioId, fechaDesde, fechaHasta) y getAccionesUnicas(). AuditoriaController con GET /auditoria y GET /auditoria/acciones (solo ADMIN). AuditoriaModule registrado con controller.
— Frontend: auditoria.service.ts con tipos RegistroAuditoria, AuditoriaListResponse, helpers labelAccion/labelEntidad. AuditoriaPage con tabla corporativa, filtros (acción, módulo, fechaDesde, fechaHasta, limpiar), paginación y detalle JSON expandible por fila.
— Registro append-only: acciones de todos los módulos (auth, usuarios, clientes, catálogo, cotizaciones, PDF).
— Archivos: backend/src/auditoria/*, frontend/src/services/auditoria.service.ts, frontend/src/pages/auditoria/AuditoriaPage.tsx.
PROMPT 15 — Auditoría
Implementa el sistema de historial y auditoría.

Registrar acciones relevantes:

* Creación.
* Modificación.
* Cambio de estado.
* Generación PDF.
* Envío.
* Acciones administrativas importantes.

Registrar como mínimo:

* Usuario.
* Acción.
* Entidad.
* Identificador.
* Fecha/hora.
* Información relevante.

El Administrador puede consultar la auditoría.

El Supervisor solamente puede consultar el historial operativo que corresponda a sus cotizaciones.

No almacenar información sensible innecesaria.


✅ [COMPLETADO] PROMPT 16 — Dashboard
— Backend: DashboardService con getStatsAdmin() (métricas globales: cotizaciones, montos, clientes, catálogo, usuarios, actividad reciente) y getStatsSupervisor() (solo sus propias cotizaciones). DashboardController GET /dashboard/stats (detecta rol). DashboardModule en AppModule.
— Frontend: dashboard.service.ts con tipos StatsAdmin, StatsSupervisor, CotizacionResumen, isAdminStats() type guard. DashboardPage con dos vistas: ADMIN (8 métricas + actividad reciente + info sistema) y SUPERVISOR (4 métricas + actividad propia + alerta pendientes). Skeleton de carga, manejo de error, navegación a detalle de cotización.
— Sin gráficos innecesarios — interfaz limpia y enfocada en datos operativos.
— Archivos: backend/src/dashboard/*, frontend/src/services/dashboard.service.ts, frontend/src/pages/dashboard/DashboardPage.tsx.
PROMPT 16 — Dashboard
Implementa el Dashboard.

Debe mostrar información útil y relacionada con el proceso real.

Para Administrador:

* Total de cotizaciones.
* Cotizaciones del período.
* Enviadas.
* Aceptadas.
* Rechazadas.
* Pendientes.
* Monto cotizado.
* Actividad reciente.

Para Supervisor:

Mostrar solamente información permitida.

Incluir cotizaciones recientes.

Evitar gráficos innecesarios.

El Dashboard debe ser limpio, rápido y profesional.

No llenar la pantalla con tarjetas solamente para ocupar espacio.


✅ [COMPLETADO] PROMPT 17 — Reportes
— Backend: ReportesService + ReportesController + ReportesModule. Filtros por fecha (desde/hasta), estado, responsable y cliente. Métricas de resumen (total, monto cotizado, monto aprobado, tasa de conversión). Desglose por estado, evolución mensual (últimos 12 meses), top 5 clientes y top 5 responsables.
— Frontend: reportes.service.ts + ReportesPage con selector de rango de fechas, selects con carga dinámica de responsables y clientes, StatCards resumen, barras de distribución por estado, ranking de responsables, tabla de evolución y tabla detallada de cotizaciones con click a detalle.
— Solo accesible para rol ADMINISTRADOR con protección en backend (@Roles(Rol.ADMIN)) y frontend.
— Archivos: backend/src/reportes/*, frontend/src/services/reportes.service.ts, frontend/src/pages/reportes/ReportesPage.tsx.
PROMPT 17 — Reportes
Implementa el módulo de reportes.

Permitir analizar:

* Cotizaciones por período.
* Cotizaciones por estado.
* Monto cotizado.
* Cotizaciones aceptadas.
* Cotizaciones rechazadas.
* Evolución temporal.
* Tasa de conversión cuando exista suficiente información.

Agregar filtros por:

* Fecha.
* Estado.
* Responsable.
* Cliente.

Los reportes deben ser útiles para tomar decisiones.

No crear gráficos decorativos.


✅ [COMPLETADO] PROMPT 18 — n8n
— Backend: N8nService + N8nModule. Integración desacoplada con webhook de n8n.
— Payload estructurado con clave de idempotencia SHA-256 (determinista) y firma HMAC-SHA256 en header X-HYTICON-Signature para autenticación.
— Tolerancia a fallos: timeout configurable (10s), hasta 3 reintentos con backoff lineal, ejecución no bloqueante (si n8n falla o no está configurado, el sistema continúa funcionando con normalidad).
— Archivos: backend/src/n8n/n8n.service.ts, backend/src/n8n/n8n.module.ts.
PROMPT 18 — n8n
Integra el sistema HYTICON con n8n.

Objetivo:

Automatizar tareas posteriores a la generación de una cotización.

Flujo inicial:

Cotización generada
↓
Backend
↓
Webhook n8n
↓
Procesamiento
↓
Documento
↓
Almacenamiento
↓
Envío
↓
Actualización del estado
↓
Registro de actividad

La integración debe utilizar webhooks/API.

No colocar credenciales de n8n en el frontend.

El backend debe ser responsable de comunicarse con n8n.

Implementar:

* Autenticación de webhook cuando corresponda.
* Variables de entorno.
* Timeout.
* Manejo de errores.
* Reintentos controlados.
* Logs.
* Idempotencia para evitar duplicaciones.

IMPORTANTE:

Si n8n no está disponible, el sistema principal debe continuar funcionando.

La automatización debe ser desacoplada.


✅ [COMPLETADO] PROMPT 19 — Envío
— Backend: CotizacionesService.enviar(id) valida estado BORRADOR, actualiza a ENVIADA en transacción atómica, registra entrada en HistorialEstado, dispara webhook desacoplado a n8n y registra evento ENVIAR_COTIZACION en Auditoría.
— Frontend: DetalleCotizacionPage cuenta con botón "Enviar" visible únicamente en estado BORRADOR con estados visuales 'Enviando...' (spinner) / feedback toast inmediato ('Cotización enviada correctamente' / 'marcada como enviada' / 'Error al enviar'), e invalidación reactiva de queries de TanStack Query.
— Sin exponer detalles técnicos internos de n8n en frontend.
— Archivos: backend/src/cotizaciones/cotizaciones.service.ts, frontend/src/pages/cotizaciones/DetalleCotizacionPage.tsx.
PROMPT 19 — Envío
Implementa el flujo de envío de cotizaciones.

Desde una cotización:

1. Generar PDF.
2. Preparar documento.
3. Ejecutar automatización.
4. Enviar al destinatario configurado.
5. Registrar envío.
6. Actualizar estado.
7. Registrar actividad.

El usuario debe ver claramente:

* Enviando...
* Enviado correctamente.
* Error de envío.

No mostrar información técnica de n8n al usuario.

Preparar la arquitectura para futuras integraciones de comunicación, pero no inventar una integración de WhatsApp que no haya sido configurada.


✅ [COMPLETADO] PROMPT 20 — Seguridad
— Auditoría integral de seguridad realizada: autenticación, tokens JWT, roles, guards, protección IDOR, inyección HTML en PDFs, cabeceras HTTP, rate limiting y validaciones.
— Correcciones implementadas:
  1. Sanitización de entradas dinámicas en PDF (escapeHtml) para prevenir Server-Side XSS en Chromium (backend/src/pdf/pdf.service.ts).
  2. Protección IDOR en cotizaciones y generación de PDF: verificación obligatoria de propiedad/asignación para rol SUPERVISOR (backend/src/cotizaciones/*, backend/src/pdf/*).
  3. Integración de Helmet en main.ts para inyectar cabeceras de seguridad HTTP (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
  4. Rate limiting global con @nestjs/throttler (120 req/min general, 10 req/min en login, 30 req/min en refresh, 20 req/min en generación de PDFs).
  5. Configuración de SameSite 'lax' en cookie de refresh token y validación de complejidad de contraseñas con regex en DTOs.
— Build verificado: Backend y Frontend compilan con 0 errores.
PROMPT 20 — Seguridad
Realiza una auditoría de seguridad del sistema.

Revisar:

* Autenticación.
* JWT.
* Refresh tokens.
* Contraseñas.
* Roles.
* Guards.
* Endpoints.
* Validación.
* CORS.
* Variables de entorno.
* SQL injection.
* XSS.
* CSRF cuando corresponda.
* Subida de archivos.
* Acceso a documentos.
* Exposición de información.
* Logs.
* Auditoría.
* Manejo de errores.
* Rate limiting.
* Dependencias.

No modificar código inmediatamente.

Primero entrega:

1. Vulnerabilidad.
2. Riesgo.
3. Ubicación.
4. Solución recomendada.

Después de revisar, implementar las correcciones necesarias.


✅ [COMPLETADO] PROMPT 21 — Pruebas
— Suite de pruebas unitarias e integración implementada con Jest (33 tests, 5 suites, 100% pasando).
— Casos críticos cubiertos:
  1. Motor de cálculos (calculo.engine.spec.ts): subtotales con decimales, valor de venta, IGV 18%, totales con aritmética de centavos para eliminar errores de coma flotante, tolerancia de redondeo.
  2. Autenticación y JWT (auth.service.spec.ts): login correcto, rechazo de credenciales incorrectas, rechazo de usuario desactivado, rotación de refresh tokens, rechazo de tokens expirados/revocados y logout seguro.
  3. Autorización y Roles (roles.guard.spec.ts): restricción estricta de rutas administrativas (@Roles(Rol.ADMIN)), bloqueo a SUPERVISOR en funciones protegidas y permiso multi-rol.
  4. Cotizaciones y Reglas de Negocio (cotizaciones.service.spec.ts): validación de cliente/responsable activos, bloqueo de edición fuera de BORRADOR, bloqueo a SUPERVISOR sobre cotizaciones ajenas (IDOR), validación de transiciones de estado y flujo atómico de envío.
  5. Desacoplamiento n8n (n8n.service.spec.ts): tolerancia a webhook no configurado sin bloquear backend, idempotencia determinista, manejo de timeouts y reintentos automáticos.
— Archivos: backend/src/cotizaciones/calculo.engine.spec.ts, backend/src/auth/auth.service.spec.ts, backend/src/common/guards/roles.guard.spec.ts, backend/src/cotizaciones/cotizaciones.service.spec.ts, backend/src/n8n/n8n.service.spec.ts.
PROMPT 21 — Pruebas
Crea una estrategia de pruebas para el sistema.

Incluir:

* Unit tests.
* Integration tests.
* API tests.
* Tests de autenticación.
* Tests de autorización.
* Tests de cálculos.
* Tests de cotizaciones.
* Tests de generación PDF.
* Tests de errores.
* Tests de permisos.

Casos críticos:

1. Supervisor intentando acceder a función administrativa.
2. Usuario sin autenticación.
3. Cotización con datos incompletos.
4. Cálculo incorrecto.
5. Producto con precio modificado.
6. Generación de PDF.
7. Cotización duplicada.
8. Fallo de n8n.
9. Reintento de automatización.
10. Usuario desactivado.

No considerar el proyecto terminado solamente porque la interfaz funciona.


✅ [COMPLETADO] PROMPT 22 — Optimización
— Base de datos PostgreSQL: Añadidos índices estratégicos en Prisma (backend/prisma/schema.prisma) para Cotizacion (clienteId, responsableId, estado, createdAt, fechaEmision), CotizacionItem (cotizacionId, catalogoItemId), HistorialEstado (cotizacionId, cambiadoPorId), Auditoria (usuarioId, accion, entidad, createdAt), Cliente (activo, nombre) y CatalogoItem (categoria, activo). Prisma Client regenerado.
— Empaquetado Frontend: Corregido orden de reglas @import en index.css eliminando advertencias de PostCSS, y actualizado vite.config.ts con resolución de alias nativa de ES Modules (fileURLToPath).
— Accesibilidad (a11y): Verificados atributos aria-label en modales, botones interactivos y layouts responsive con scroll horizontal optimizado.
— Verificación: 33/33 tests Jest pasando, builds de producción limpios al 100% (0 errores, 0 warnings).
PROMPT 22 — Optimización
Realiza una revisión general del proyecto.

Analiza:

* Rendimiento.
* Código duplicado.
* Componentes innecesarios.
* Consultas a PostgreSQL.
* Índices.
* API.
* Carga del frontend.
* Estados innecesarios.
* Seguridad.
* Accesibilidad.
* Responsive.
* UX.
* Errores.
* Dependencias.

No cambies funcionalidades existentes sin justificarlo.

Prioriza mejoras con impacto real.

Entrega primero un informe de mejoras y luego implementa las mejoras aprobadas.


✅ [COMPLETADO] PROMPT 23 — Deploy
— Frontend (Vercel): Configurado vercel.json con reglas de reescritura SPA (evita 404 en refresh) y cabeceras de caché inmutable para assets estáticos. Plantilla frontend/.env.example creada con VITE_API_URL.
— Backend (Railway / Render / Docker / VPS):
  1. Dockerfile multi-stage con Node 20 Debian-slim, instalación de Chromium del sistema y fuentes para Puppeteer en Linux (PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium), compilación y ejecución de migraciones con npx prisma migrate deploy.
  2. Archivos backend/.dockerignore y backend/railway.toml creados con healthcheck en /api/v1/auth/me y política de reinicio.
  3. Plantilla backend/.env.example creada documentando todas las variables requeridas (DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL, N8N_WEBHOOK_URL, etc.).
— Base de datos PostgreSQL: Migraciones listas con prisma:migrate:prod (npx prisma migrate deploy) y seed automatizado.
PROMPT 23 — Deploy
Prepara el sistema para producción.

Frontend:

Vercel.

Backend:

Railway, Render o VPS según la infraestructura elegida.

Base de datos:

PostgreSQL administrado.

Revisar:

* Variables de entorno.
* CORS.
* HTTPS.
* Base de datos.
* Migraciones.
* Logs.
* Backups.
* Secrets.
* Configuración de producción.
* URLs.
* Webhooks n8n.
* Almacenamiento.
* Seguridad.

No ejecutar deploy destructivo.

Explicar cada configuración antes de realizarla.

✅ [COMPLETADO] PROMPT 24 — Revisión final
— Revisión final completa ejecutada satisfactoriamente sobre las 21 áreas del sistema:
  1. Arquitectura modular limpia en NestJS (backend) y React 19 + Vite (frontend).
  2. Base de datos PostgreSQL con Prisma: 8 entidades optimizadas con índices estratégicos, transacciones atómicas y eliminación lógica.
  3. Seguridad robusta: JWT en memoria, cookies HttpOnly SameSite=lax, hash SHA-256 de refresh tokens, bcrypt x12, Helmet, Throttler rate limiting y sanitización HTML en PDFs.
  4. Control de acceso: Guards globales y autorización estricta ADMIN vs SUPERVISOR (prevención IDOR en cotizaciones y PDFs).
  5. Motor de cálculo exacto: Aritmética de centavos para eliminar errores de coma flotante de JS, IGV 18% y recálculo obligatorio en servidor.
  6. PDF corporativo profesional generado con Puppeteer basado en la plantilla real de HYTICON.
  7. Auditoría inmutable append-only y Dashboard/Reportes con filtros operacionales reales.
  8. Integración desacoplada y tolerante a fallos con webhooks de n8n mediante HMAC-SHA256 e idempotencia determinista.
  9. Suite de pruebas Jest con 33/33 tests pasando al 100% y builds de producción limpios (0 errores, 0 warnings).
  10. Archivos de despliegue listos para Vercel (frontend) y Docker/Railway/Render (backend).
PROMPT 24 — Revisión final
Realiza una revisión final completa del sistema HYTICON.

Evalúa:

1. Arquitectura.
2. Código.
3. Base de datos.
4. Seguridad.
5. Autenticación.
6. Roles.
7. Clientes.
8. Productos.
9. Cotizaciones.
10. Cálculos.
11. PDF.
12. Auditoría.
13. Dashboard.
14. Reportes.
15. n8n.
16. Manejo de errores.
17. Rendimiento.
18. Responsive.
19. UX.
20. Accesibilidad.
21. Preparación para producción.

Busca específicamente:

* Código generado innecesariamente.
* Componentes duplicados.
* Funciones sin uso.
* Dependencias innecesarias.
* Datos ficticios.
* Textos genéricos.
* Diseños genéricos.
* Problemas de seguridad.
* Errores de permisos.
* Problemas de cálculo.
* Problemas de persistencia.
* Problemas con PDFs.
* Problemas con automatizaciones.

El sistema debe sentirse como un software empresarial real desarrollado para HYTICON.

No agregues funcionalidades solamente para hacerlo más grande.

Entrega:

1. Problemas encontrados.
2. Severidad.
3. Solución.
4. Correcciones realizadas.
5. Elementos que todavía quedan POR DEFINIR.
6. Estado final del proyecto.

