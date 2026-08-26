import { TranslationKey } from './en';

export const es: Record<TranslationKey, string> = {
  // App & Navigation
  appTitle: 'x2nostr — Múdate a Nostr',
  appTagline: 'Recupera tu soberanía de datos. Migra tus bibliotecas, reseñas y publicaciones desde plataformas centralizadas hacia el protocolo descentralizado Nostr.',
  connectNostr: 'Conectar Nostr',
  connecting: 'Conectando...',
  connected: 'Conectado',
  fetchingProfile: 'Cargando perfil...',
  disconnect: 'Desconectar',
  extensionNotFound: 'No se encontró ninguna extensión de Nostr. Instala Alby, nos2x u otra extensión NIP-07.',
  activeRelays: 'Relés Activos',
  relaysConfig: 'Configuración de Relés',
  language: 'Idioma',
  
  // Hero & Manifesto
  heroBadge: '⚡ 100% Soberano y en el Navegador',
  heroTitle: 'Escapa de los Jardines Cerrados.',
  heroTitleHighlight: 'Múdate a Nostr.',
  heroSubtitle: 'Las plataformas centralizadas encierran tus recuerdos, reseñas, historial de lectura y red social en silos privados. x2nostr te permite exportar y firmar criptográficamente tus datos directamente hacia relés de Nostr — sin backend, sin rastreo, propiedad absoluta.',
  getStarted: 'Comenzar Migración',
  exploreEcosystem: 'Explorar Ecosistema',
  
  // Manifesto Cards ("Why Nostr?")
  whyNostrTitle: '¿Por qué recuperar tus datos en Nostr?',
  whyNostrSubtitle: 'A diferencia de los silos corporativos de la Web 2.0, Nostr te brinda garantías criptográficas.',
  feature1Title: 'Soberanía Real de Datos',
  feature1Desc: 'Tu historial de lectura y reseñas están firmados con tu clave privada. Almacenados en relés libres que tú elijas.',
  feature2Title: 'Resistencia a la Censura',
  feature2Desc: 'Ninguna empresa puede cerrar tu cuenta, borrar tu historial o modificar tus reseñas a puerta cerrada.',
  feature3Title: 'Identidad Universal (npub)',
  feature3Desc: 'Una única clave pública de Nostr te conecta a aplicaciones de lectura, redes sociales, blogs, audio y video.',
  feature4Title: 'Zaps de Lightning y Valor',
  feature4Desc: 'Recibe micropropinas instantáneas de Bitcoin (zaps) en tus reseñas de libros y artículos directo a tu billetera.',
  feature5Title: 'Privacidad de Conocimiento Cero',
  feature5Desc: 'Todo el procesamiento, resolución de metadatos y firmado se ejecuta en tu navegador. No existen registros en servidores.',
  feature6Title: 'Interoperabilidad Abierta',
  feature6Desc: 'Tus datos migrados funcionan de inmediato en Bookstr, Habla, Damus, Amethyst, Primal y cualquier cliente Nostr estándar.',

  // Ecosystem Section
  ecosystemTitle: 'El Universo de Aplicaciones Nostr',
  ecosystemSubtitle: 'Una vez que tus datos se transmiten a los relés de Nostr, son legibles e interactivos al instante en estos clientes de código abierto.',
  appBookstrTitle: 'Bookstr',
  appBookstrDesc: 'Rastreador de lectura descentralizado, gestor de estanterías y red social de libros en Nostr (Listas NIP-51, Kinds 10073-10075 y 31985).',
  appHablaTitle: 'Habla.news',
  appHablaDesc: 'Plataforma de blogs descentralizada impulsada por eventos de contenido NIP-23 con monetización nativa vía Lightning.',
  appYakihonneTitle: 'Yakihonne',
  appYakihonneDesc: 'Portal de publicación de formato largo con herramientas avanzadas y curaduría multimedia para escritores en Nostr.',
  appDamusTitle: 'Damus (iOS)',
  appDamusDesc: 'Cliente nativo de Nostr para iPhone e iPad, rápido, elegante y con integración fluida de Zaps.',
  appAmethystTitle: 'Amethyst (Android)',
  appAmethystDesc: 'El principal cliente social de Nostr de código abierto para Android, con amplio soporte de NIPs y reproducción multimedia.',
  appPrimalTitle: 'Primal (Web / Móvil)',
  appPrimalDesc: 'Cliente Nostr ultrarrápido con billetera integrada, seguimiento de portafolio y almacenamiento en caché de alto rendimiento.',
  appWavelakeTitle: 'Wavelake',
  appWavelakeDesc: 'Plataforma descentralizada de música y podcasts donde los creadores reciben valor por valor mediante Lightning.',
  appZapStreamTitle: 'ZapStream',
  appZapStreamDesc: 'Transmisión en vivo en Nostr con chat en tiempo real, zaps y distribución de video descentralizada.',
  openApp: 'Abrir App',

  // Importer Catalog Menu
  importersTitle: 'Centro de Migración',
  importersSubtitle: 'Selecciona una fuente de datos para comenzar tu migración soberana.',
  statusActive: 'Activo y Listo',
  statusBeta: 'Beta',
  statusComingSoon: 'Próximamente',
  targetNip: 'Protocolo de Destino',

  // Goodreads Importer Plugin
  goodreadsName: 'Goodreads a Bookstr',
  goodreadsDesc: 'Migra toda tu biblioteca de Goodreads, estantes personalizados, calificaciones, fechas de lectura y reseñas directo a Bookstr.',
  goodreadsTarget: 'NIP-51 (Kind 30003), Bookstr (Kinds 10073-10075) y Reseñas Kind 31985',
  
  // Movies & TV Importer Plugin
  moviesName: 'Películas y Series (Open Movie Database)',
  moviesDesc: 'Exporta tus calificaciones, listas de seguimiento y reseñas a listas de cine descentralizadas y valoraciones comunitarias.',
  moviesTarget: 'Listas de Cine NIP-51 (Kind 30003) y Reseñas Kind 31985',
  
  // Coming Soon Importers
  blogsName: 'Blogs de Formato Largo',
  blogsDesc: 'Convierte archivos de Hugo, Ghost, WordPress o Blogger en artículos NIP-23 soberanos para Habla y Yakihonne.',
  blogsTarget: 'NIP-23 Formato Largo (Kind 30023)',
  
  imdbName: 'Rastreador de Películas y Series',
  imdbDesc: 'Exporta tu lista de seguimiento, puntuaciones y reseñas a listas descentralizadas de cine y reseñas comunitarias.',
  imdbTarget: 'Listas de Cine NIP-51 y Reseñas Kind 31985',
  
  letterboxdName: 'Diario de Letterboxd',
  letterboxdDesc: 'Migra tu diario de Letterboxd, películas vistas, registros de reseñas y listas de cine personalizadas a Nostr.',
  letterboxdTarget: 'Listas de Cine NIP-51 y Calificaciones',
  
  twitterName: 'Archivo de Twitter / X',
  twitterDesc: 'Importa tu archivo de datos de Twitter y reconstruye tus mejores hilos y tuits históricos como notas raíz y respuestas de Nostr.',
  twitterTarget: 'NIP-01 Notas Cortas (Kind 1)',
  
  instagramName: 'Fotos de Instagram',
  instagramDesc: 'Migra tus archivos fotográficos a servidores descentralizados Blossom/NIP-96 media servers y publica eventos de imágenes.',
  instagramTarget: 'NIP-68 Publicaciones de Fotos (Kind 20)',
  
  spotifyName: 'Listas de Spotify',
  spotifyDesc: 'Exporta tus listas de reproducción guardadas y pistas favoritas a colecciones musicales descentralizadas en Wavelake y Stemstr.',
  spotifyTarget: 'NIP-51 Listas Musicales (Kind 30001)',

  // Goodreads Migration Wizard
  step1Title: '1. Exportar desde Goodreads',
  step1Desc: 'Ve a Goodreads > My Books > Import and export > Haz clic en "Export Library". Se descargará un archivo CSV.',
  step2Title: '2. Cargar y Previsualizar',
  step2Desc: 'Arrastra tu archivo CSV de Goodreads aquí abajo. Procesaremos tus libros, limpiaremos fórmulas y resolveremos portadas de Open Library.',
  step3Title: '3. Firmar y Transmitir',
  step3Desc: 'Selecciona tus estantes, conecta tu extensión NIP-07 y firma tus listas soberanas en la red Nostr.',

  // Upload Area
  dropzoneTitle: 'Arrastra y suelta tu archivo CSV exportado de Goodreads aquí',
  dropzoneSubtitle: 'o haz clic para seleccionar archivos desde tu computadora',
  dropzoneSupport: 'Compatible con exportaciones estándar de biblioteca Goodreads (goodreads_library_export.csv)',
  processingCsv: 'Analizando archivo CSV...',
  sampleCsvLink: 'Descargar CSV de muestra de Goodreads',

  // Table & Preview
  booksFound: 'Libros Cargados',
  filterAll: 'Todos los Libros',
  filterRead: 'Leídos',
  filterCurrentlyReading: 'Leyendo Actualmente',
  filterToRead: 'Por Leer',
  filterUnrated: 'Sin Calificación',
  searchPlaceholder: 'Buscar por título, autor o ISBN...',
  selectAll: 'Seleccionar Todo',
  deselectAll: 'Deseleccionar Todo',
  selectedCount: '{count} de {total} seleccionados',
  colCover: 'Portada',
  colTitleAuthor: 'Título y Autor',
  colShelf: 'Estante',
  colRating: 'Mi Calificación',
  colDateRead: 'Fecha de Lectura',
  colIsbn: 'ISBN',
  colOpenLibrary: 'Open Library',
  noBooksFound: 'No se encontraron libros con los filtros o búsqueda actuales.',
  fetchingMetadata: 'Resolviendo metadatos de Open Library...',
  metadataReady: 'Metadatos enriquecidos',
  enrichmentProgress: 'Enriqueciendo metadatos de Open Library ({current}/{total})...',
  enrichmentCompleted: 'Metadatos de Open Library enriquecidos ({current}/{total})',
  
  // Migration Controls & Options
  migrationOptionsTitle: 'Configuración de Migración',
  optGenerateLists: 'Publicar Listas de Libros (NIP-51 Kind 30003 y Bookstr Kinds 10073-10075 para "read", "currently-reading", "to-read")',
  optGenerateListsDesc: 'Crea listas categorizadas soberanas totalmente compatibles con Coracle, Nostrudel, Bookstr.xyz y todos los clientes NIP-51.',
  optGenerateReviews: 'Publicar Eventos Individuales de Reseñas y Calificaciones (Kind 31985)',
  optGenerateReviewsDesc: 'Transmite eventos individuales con fecha, calificación y texto para libros con notas personales.',
  optDeletePreviousReviews: 'Eliminar eventos de reseñas anteriores primero (NIP-09 Kind 5)',
  optDeletePreviousReviewsDesc: 'Transmite una solicitud criptográfica de eliminación a sus relés para suprimir eventos de reseñas anteriores antes de la nueva importación.',
  confirmDeleteModalTitle: 'Confirmar Eliminación de Reseñas Anteriores',
  confirmDeleteModalDesc: 'Esto transmitirá un evento de eliminación NIP-09 (Kind 5) a sus relés para eliminar las reseñas de libros publicadas anteriormente para esta cuenta. ¿Está seguro de continuar?',
  confirmDeleteModalConfirm: 'Sí, Eliminar y Reimportar',
  confirmDeleteModalCancel: 'Cancelar',
  startMigration: 'Iniciar Migración a Nostr',
  pauseMigration: 'Pausar',
  resumeMigration: 'Reanudar',
  cancelMigration: 'Cancelar',
  migrationCompleted: '¡Migración Completada con Éxito!',
  migrationCompletedDesc: '¡Tus libros y listas han sido firmados y transmitidos a los relés de Nostr! Ahora puedes ver tu biblioteca en Bookstr.',
  viewOnBookstr: 'Ver Biblioteca en Bookstr.xyz',
  
  // Progress & Status
  signingNotice: 'Por favor, aprueba las solicitudes de firma en tu extensión de Nostr.',
  currentProgress: 'Procesando: {current} / {total} ({percent}%)',
  currentlyProcessing: 'Procesando actualmente: {title}',
  successCount: '{count} exitosos',
  failedCount: '{count} fallidos',
  timeRemaining: 'Tiempo estimado restante: {time}',

  // Activity Log Console
  activityLogTitle: 'Consola de Registro de Migración en Vivo',
  clearLogs: 'Limpiar Registros',
  exportLogs: 'Descargar Archivo de Registros',
  noLogsYet: 'Los registros de actividad aparecerán aquí durante el análisis, enriquecimiento y transmisión a relés.',

  // Coming Soon Modal
  comingSoonTitle: 'Importador de {name}',
  comingSoonBadge: 'En Desarrollo Activo',
  comingSoonDesc: 'Este módulo de migración está en nuestra Fase {phase} del plan de desarrollo. ¡Únete a la conversación en Nostr o colabora en GitHub para acelerar su lanzamiento!',
  roadmapStage: 'Hito del Roadmap: {stage}',
  targetEvents: 'Eventos Nostr Objetivo: {events}',
  notifyMe: 'Ver Roadmap',
  closeModal: 'Cerrar',

  // Relay Modal
  relayModalTitle: 'Configuración de Relés Nostr',
  relayModalDesc: 'x2nostr transmite tus eventos firmados directamente a estos relés. Puedes agregar tus propios relés favoritos.',
  addRelayPlaceholder: 'wss://rele.ejemplo.com',
  addRelayBtn: 'Agregar Relé',
  removeRelay: 'Eliminar',
  relayConnected: 'Conectado',
  relayConnecting: 'Conectando',
  relayError: 'Error al conectar',

  // Footer
  footerTagline: 'Plataforma de migración de datos soberana y descentralizada para la web abierta.',
  footerClientSideOnly: '🔒 Cero retención en servidores. Todo el procesamiento de datos y firmado criptográfico ocurre exclusivamente en tu navegador.',
  footerBuiltWith: 'Construido con TypeScript, Tailwind CSS, Hono y nostr-tools.',
  footerAuthor: 'Creado con 💜 por {author}',
  githubRepo: 'Repositorio GitHub',
  roadmapLink: 'Roadmap',

  // Resume Banner
  resumeBannerTitle: 'Importación anterior detectada',
  resumeBannerDescription: '{completed} de {total} libros ya importados',
  resumeBannerResume: 'Continuar importación',
  resumeBannerFresh: 'Empezar de nuevo',
  resumeBannerFreshWarning: 'Empezar de nuevo volverá a publicar y actualizar tus eventos de estantes y reseñas en tus relés de Nostr conectados.',
  resumeBannerFreshConfirm: 'Sí, empezar de nuevo',
  resumeBannerFreshCancel: 'Cancelar',

  // Movies & TV Migration Wizard
  moviesStep1Title: '1. Exporta tus Calificaciones',
  moviesStep1Desc: 'Exporta tus calificaciones o lista de seguimiento desde tu plataforma de cine en un archivo CSV.',
  moviesStep2Title: '2. Cargar y Previsualizar',
  moviesStep2Desc: 'Suelta tu archivo CSV de películas abajo. Analizaremos tus títulos, calificaciones (1-10), géneros y directores.',
  moviesStep3Title: '3. Firmar y Transmitir',
  moviesStep3Desc: 'Conecta tu extensión de Nostr, configura las opciones de lista y firma tus eventos de cine soberanos en los repetidores.',

  // Movies Upload Area
  moviesDropzoneTitle: 'Arrastra y suelta tu archivo CSV de películas aquí',
  moviesDropzoneSubtitle: 'o haz clic para explorar archivos de tu ordenador',
  moviesDropzoneSupport: 'Admite exportaciones CSV estándar de calificaciones y listas de películas',

  // Movies Table & Filters
  filterMovies: 'Películas',
  filterTvSeries: 'Series de TV',
  filterTvEpisodes: 'Episodios',
  filterHighRated: 'Mejor Valoradas (8-10★)',
  colTitleMedia: 'Título y Año',
  colType: 'Tipo',
  colDirector: 'Director / Creador',
  colGenres: 'Géneros',
  colRuntime: 'Duración',
  colOmdbId: 'ID del Título',
  noMoviesFound: 'No hay películas o series que coincidan con los criterios actuales.',

  // Movies Migration Controls & Options
  optGenerateMovieLists: 'Publicar Lista de Cine y TV (NIP-51 Kind 30003)',
  optGenerateMovieListsDesc: 'Crea listas categorizadas soberanas de tus películas y series compatibles con Coracle, Nostrudel y clientes NIP-51.',
  optGenerateMovieReviews: 'Publicar Eventos Individuales de Calificación y Reseña (Kind 31985)',
  optGenerateMovieReviewsDesc: 'Transmite eventos individuales de calificación NIP-32 (escala 1-10) con metadatos enriquecidos para cada título.',
  optDeletePreviousMovieReviews: 'Eliminar primero los eventos de reseñas de películas publicados anteriormente (NIP-09 Kind 5)',
  optDeletePreviousMovieReviewsDesc: 'Emite una solicitud de eliminación criptográfica para borrar eventos de reseñas anteriores antes de una importación limpia.',
  confirmDeleteMovieModalTitle: 'Confirmar Eliminación de Reseñas de Películas Anteriores',
  confirmDeleteMovieModalDesc: 'Esto transmitirá un evento de eliminación NIP-09 (Kind 5) a tus repetidores para eliminar reseñas de películas publicadas anteriormente. ¿Estás seguro de que deseas continuar?',
  moviesMigrationCompleted: '¡Migración de Películas y Series Completada con Éxito!',
  moviesMigrationCompletedDesc: 'Tus calificaciones y listas seleccionadas han sido firmadas y transmitidas a los repetidores de Nostr.',
  moviesResumeBannerDescription: '{completed} de {total} títulos ya importados',
};
