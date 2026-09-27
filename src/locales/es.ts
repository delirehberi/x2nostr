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
  appDittoTitle: 'Ditto.pub',
  appDittoDesc: 'Plataforma descentralizada de red social y publicación de formato largo impulsada por el protocolo Nostr.',
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
  appGitWorkshopTitle: 'GitWorkshop',
  appGitWorkshopDesc: 'Colaboración de código descentralizada en Nostr. Explora repositorios, revisa parches (PR) y gestiona problemas con NIP-34.',
  openApp: 'Abrir App',

  // Navigation Links
  navHome: 'Inicio',
  navImporters: 'Centro de Migración',
  navGettingStarted: 'Guía de Inicio',
  navDocs: 'Documentos',
  navSupport: 'Soporte',
  configureRelays: 'Configurar Relés',
  relaysSummary: '{count} Relés Activos',
  userProfile: 'Perfil de Usuario',

  // Ecosystem Categories
  catBooks: 'Libros y Lectura',
  catSocialBlogs: 'Redes Sociales y Blogs',
  catPublishing: 'Publicación y Medios',
  catSocialMobile: 'Social y Móvil',
  catSocialMedia: 'Social y Medios',
  catWebMobile: 'Web y Móvil',
  catMusic: 'Música y Podcasts',
  catVideo: 'Transmisión en Vivo',
  catCodeGit: 'Código y Git (NIP-34)',

  // Documentation Hub
  docsTitle: 'Base de Conocimiento y Guías Nostr',
  docsSubtitle: 'Documentación técnica detallada sobre gestión soberana de claves, extensiones NIP-07, listas NIP-51, bunker Amber y migración de datos.',
  doc1Title: '1. Seguridad de Claves Nostr e Identidad Soberana',
  doc1Summary: 'Aprende cómo las claves criptográficas públicas (npub) y privadas (nsec) reemplazan las contraseñas tradicionales.',
  doc2Title: '2. Configurar Amber como Bunker (NIP-46) en Android',
  doc2Summary: 'Cómo usar Amber como bunker de firma remota para que los sitios web nunca vean tu clave privada.',
  doc3Title: '3. Migración de Goodreads a Bookstr (NIP-51 y NIP-32)',
  doc3Summary: 'Guía detallada de importación CSV de Goodreads, enriquecimiento de Open Library e indexación en Bookstr.',
  doc4Title: '4. Calificaciones IMDb y Letterboxd a Nostr Cine',
  doc4Summary: 'Convierte tus listas de seguimiento y calificaciones de cine en listas NIP-51 y reseñas NIP-32.',
  doc5Title: '5. Publicación de Formato Largo en NIP-23 (Ditto.pub y Yakihonne)',
  doc5Summary: 'Resumen de conversión de artículos de blog de Hugo, Ghost y WordPress a eventos NIP-23.',
  doc6Title: '6. Manifiesto de Soberanía de Datos y Guía de Documentación',
  doc6Summary: 'Por qué creamos un centro de documentación de conocimiento cero para x2nostr y cómo funciona la migración soberana en el navegador.',

  // Documentation Body Contents (Spanish)
  doc1Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Comprendiendo los Pares de Claves Criptográficas de Nostr</h3>
    <p>A diferencia de las redes tradicionales (Twitter, Goodreads, IMDb) donde tu identidad depende de un correo y contraseña guardados en un servidor, Nostr utiliza <strong>pares de claves criptográficas schnorr</strong> (secp256k1).</p>
    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">Resumen de Claves:</h4>
      <ul class="list-disc list-inside space-y-1 text-xs text-purple-950">
        <li><strong>npub (Clave Pública):</strong> Tu dirección universal en Nostr. Compártela libremente con cualquier persona.</li>
        <li><strong>nsec (Clave Privada):</strong> Tu clave secreta de firma. <em>NUNCA compartas tu nsec con ningún sitio web ni persona.</em></li>
      </ul>
    </div>
    <h4 class="font-bold text-slate-900">Extensiones de Navegador Recomendadas (NIP-07):</h4>
    <p>Para iniciar sesión en aplicaciones web de Nostr sin copiar tu <code>nsec</code>, instala una extensión NIP-07:</p>
  </div>`,

  doc2Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Configuración de Amber como Bunker (NIP-46) en Android</h3>
    <p><strong>Amber</strong> es una aplicación Android de código abierto que funciona como un firmante aislado (bunker). Permite mantener tu clave <code>nsec</code> segura en el almacén de claves de tu teléfono sin exponerla a aplicaciones de terceros.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900">Cómo Funciona la Firma Remota con Amber:</h4>
      <ol class="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
        <li>Descarga Amber desde GitHub o F-Droid.</li>
        <li>Importa o genera tu clave <code>nsec</code> en Amber.</li>
        <li>Al abrir clientes de Nostr, selecciona <strong>Firmar con Amber</strong>.</li>
        <li>Amber mostrará una pantalla de confirmación antes de firmar la solicitud.</li>
      </ol>
    </div>
  </div>`,

  doc3Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Guía de Migración de Goodreads a Bookstr</h3>
    <p>Migrar tu biblioteca de Goodreads convierte tus archivos en eventos de listas y reseñas soberanas en Nostr.</p>
    <h4 class="font-bold text-slate-900">Especificaciones del Protocolo:</h4>
    <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-700">
      <li><strong>Kind 30003 (NIP-51 Conjuntos de Marcapáginas):</strong> Listas etiquetadas con <code>read</code>, <code>currently-reading</code> y <code>to-read</code>.</li>
      <li><strong>Listas Nativas de Bookstr (Kinds 10073, 10074, 10075):</strong> Estanterías indexadas con etiquetas ISBN (<code>["k", "isbn"]</code>).</li>
      <li><strong>Kind 31985 (Reseñas NIP-32):</strong> Eventos reemplazables con calificación de 1 a 5 estrellas y notas personales.</li>
    </ul>
  </div>`,

  doc4Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Migración de Calificaciones de IMDb y Letterboxd a Nostr Cine</h3>
    <p>Exportar tus calificaciones y listas de seguimiento crea colecciones descentralizadas de cine compatibles con rastreadores de películas de Nostr.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900 font-mono text-xs">Enriquecimiento de Metadatos con OMDb:</h4>
      <p class="text-xs text-slate-600">x2nostr consulta la Open Movie Database (OMDb) para enriquecer títulos con directores, años de estreno, duraciones y carátulas antes de firmar eventos.</p>
    </div>
  </div>`,

  doc5Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Publicación de Formato Largo en NIP-23 (Ditto.pub y Yakihonne)</h3>
    <p>NIP-23 define eventos de contenido extenso (Kind <code>30023</code>) en formato Markdown con etiquetas de título, resúmenes y portadas.</p>
  </div>`,

  doc6Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Manifiesto de Soberanía de Datos y Guía de Documentación</h3>
    <p>Como mencionamos en nuestros artículos sobre <a href="https://blog.emre.xyz/posts/0d64aa67/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">Hugo2Nostr</a> y el <a href="https://blog.emre.xyz/posts/nostr/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">protocolo Nostr</a>, buscamos escapar de los jardines amurallados y publicar directamente en relays sin permiso. Migrar tu huella digital desde plataformas tradicionales nunca debe ser una caja negra.</p>
    <p>Al migrar tus datos, no deberías confiar en un servidor intermediario con tus credenciales o claves privadas. Por eso publicamos la especificación técnica oficial para <a href="https://x2nostr.emre.xyz" class="text-purple-600 underline hover:text-purple-800">x2nostr (move-to-nostr)</a>.</p>

    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">¿Qué incluye la documentación?</h4>
      <ul class="list-disc list-inside space-y-1.5 text-xs text-purple-950">
        <li><strong>Arquitectura Soberana en Cliente:</strong> Todo el procesamiento CSV (<code>PapaParse</code>), enriquecimiento de metadatos y firma criptográfica ocurre 100% en tu navegador. Sin bases de datos ni rastreo.</li>
        <li><strong>Estandarización NIP:</strong> Firma NIP-07, listas NIP-51 (Kind <code>30003</code>), reseñas NIP-32 (Kind <code>31985</code>) y artículos NIP-23 (Kind <code>30023</code>).</li>
        <li><strong>Política de Contribución:</strong> Límite estricto de diff de 500 líneas para Pull Requests asistidas por IA para garantizar revisiones claras.</li>
      </ul>
    </div>

    <p class="text-xs text-slate-500 pt-2">Lee más sobre nuestro enfoque en <a href="https://blog.emre.xyz/posts/7492c6cf/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Teknofeodalizm</a> y <a href="https://blog.emre.xyz/posts/nostr-nasil-gidiyor/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Nostr Nasıl Gidiyor?</a>.</p>
  </div>`,


  // Newbie Guide & Keygen
  btnNewbieGuide: 'Guía para Principiantes',
  newbieGuideTitle: 'Guía de Inicio en Nostr para Principiantes',
  newbieGuideSubtitle: 'Todo lo que necesitas para entender Nostr, crear tu par de claves soberanas y migrar tus datos sin complicaciones.',
  newbieStep1Title: '1. Crea o Conecta tu Clave',
  newbieStep1Desc: 'Genera un par de claves Nostr directamente dentro del entorno seguro de tu navegador, o conecta una extensión NIP-07 existente.',
  generateKeyBtn: 'Generar Nueva Clave Nostr (nsec/npub)',
  copyNsec: 'Copiar Clave Privada (nsec)',
  copyNpub: 'Copiar Clave Pública (npub)',
  keyGeneratedNotice: '¡Par de claves generado con éxito! Copia y respalda tu clave privada (nsec) en un gestor de contraseñas de inmediato.',
  newbieStep2Title: '2. Firmantes y Bunker (Amber, Extensiones)',
  newbieStep2Desc: 'Utiliza extensiones de navegador NIP-07 (Alby, nos2x) en computadora o Amber (bunker de firma remota NIP-46 / NIP-55) en Android para firmar eventos de forma segura sin revelar tu clave privada a sitios web.',
  whySovereigntyTitle: '¿Por qué Importa la Soberanía de Datos?',
  whySovereigntyDesc: 'Tu clave privada criptográfica te otorga la propiedad total de tu identidad, historial de lectura y reseñas. Ninguna plataforma puede censurar ni suspender tus datos.',
  newbieStep3Title: '3. Migra tus Datos',
  newbieStep3Desc: 'Exporta tus bibliotecas de Goodreads (Libros) o IMDb/Letterboxd (Películas y Series) como archivos CSV y fírmalos en los repetidores de Nostr.',
  newbieStep4Title: '4. Explora Aplicaciones Recomendadas',
  newbieStep4Desc: 'Accede a tu contenido migrado desde las principales aplicaciones Nostr de código abierto en web y móvil:',
  recMobileApps: 'Aplicaciones Móviles Recomendadas: Damus (iOS), Amethyst (Android), Primal (iOS y Android)',
  recWebApps: 'Aplicaciones Web Recomendadas: Bookstr.xyz (Libros), Ditto.pub y Yakihonne (Blogs), Primal.net (Red Social)',

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
  blogsName: 'WordPress (WXR XML)',
  blogsDesc: 'Migra tus publicaciones de WordPress a artículos soberanos NIP-23 de formato largo con conversión automática a Markdown y carga de medios en Blossom.',
  blogsTarget: 'Artículos Formato Largo NIP-23 (Kind 30023)',
  
  linkedinName: 'Artículos de LinkedIn',
  linkedinDesc: 'Migra tus artículos de formato largo de LinkedIn Pulse a eventos de contenido soberanos NIP-23 con formato Markdown enriquecido y alojamiento en Blossom.',
  linkedinTarget: 'Artículos Formato Largo NIP-23 (Kind 30023)',
  
  gistsName: 'GitHub Gists',
  gistsDesc: 'Migra tus Gists de GitHub y fragmentos de código a eventos descentralizados de código NIP-C0 (Kind 1337) y fragmentos privados cifrados con NIP-44.',
  gistsTarget: 'Fragmentos NIP-C0 (Kind 1337) y Cifrados con NIP-44 (Kind 30078)',
  
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
  footerCommunity: 'Una iniciativa comunitaria de {link}',
  footerBuiltWith: 'Construido con TypeScript, Tailwind CSS, Hono y nostr-tools.',
  footerAuthor: 'Creado con 💜 por {author}',
  sourceCode: 'Código Fuente',
  githubRepo: 'Repositorio GitHub',
  gitWorkshopRepo: 'Repositorio Nostr (GitWorkshop)',
  viewExampleRepo: 'Ver x2nostr en GitWorkshop',
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

  // WordPress Migration Wizard
  wpImporterTitle: 'Artículos de WordPress (WXR XML) a Nostr',
  wpImporterSubtitle: 'Migra tus publicaciones de WordPress a artículos soberanos NIP-23 de formato largo. Convierte automáticamente contenido HTML a Markdown y sube imágenes a servidores de medios Blossom.',
  wpDropzoneTitle: 'Arrastra y suelta tu archivo de exportación WXR de WordPress aquí',
  wpDropzoneSubtitle: 'o haz clic para explorar archivos en tu computadora',
  wpDropzoneSupport: 'Soporta archivos estándar de exportación XML de WordPress (.xml, .wxr)',
  wpPostsLoaded: 'Publicaciones Cargadas',
  wpFilterPublished: 'Publicados',
  wpFilterDrafts: 'Borradores',
  wpColCategories: 'Categorías y Etiquetas',
  wpColMedia: 'Recursos Multimedia',
  wpOptBlossomTitle: 'Subir imágenes de publicaciones a servidores Blossom (NIP-98 / Kind 24242)',
  wpOptBlossomDesc: 'Extrae fotos e imágenes de portada, firma cabeceras de autorización Blossom y actualiza enlaces de imágenes en Markdown.',
  wpBlossomServersLabel: 'Servidores Blossom (Separados por Comas)',
  wpOptDeleteTitle: 'Eliminar publicaciones de blog importadas anteriormente (NIP-09 Kind 5)',
  wpOptDeleteDesc: 'Transmite un evento de eliminación para borrar artículos Kind 30023 anteriores antes de una importación limpia.',
  wpSyncTipTitle: '¿Buscas Sincronización Automática en Tiempo Real?',
  wpSyncTipDesc: 'x2nostr está diseñado para la migración por lotes desde archivos de exportación WXR. Si deseas una publicación cruzada continua desde tu sitio WordPress activo hacia Nostr, te recomendamos probar el {link}.',
  postrPluginName: 'Plugin Postr for Nostr para WordPress',

  // GitHub Gists Migration Wizard
  gistsStep1Title: '1. Conectar GitHub / Gists',
  gistsStep1Desc: 'Ingresa tu nombre de usuario de GitHub o una URL específica de Gist, o proporciona archivos de código locales.',
  gistsStep2Title: '2. Vista Previa y Selección',
  gistsStep2Desc: 'Revisa los nombres de archivo de código, lenguajes de programación, privacidad pública/secreta y contenidos.',
  gistsStep3Title: '3. Firmar y Transmitir',
  gistsStep3Desc: 'Firma eventos públicos NIP-C0 y eventos de fragmentos privados cifrados con NIP-44 hacia Nostr.',
  gistsImporterTitle: 'Gists de GitHub y Fragmentos de Código a Nostr',
  gistsImporterSubtitle: 'Migra tus Gists de GitHub y fragmentos de código a eventos descentralizados de Nostr. Los fragmentos públicos se publican como NIP-C0 (Kind 1337) y los Gists secretos/privados se cifran con NIP-44 (Kind 30078).',
  gistsFetchTab: 'API de GitHub Gists',
  gistsUploadTab: 'Subir Código / JSON',
  githubUsernameLabel: 'Usuario de GitHub o URL de Gist',
  githubUsernamePlaceholder: 'ej. torvalds o https://gist.github.com/alice/12345',
  githubTokenLabel: 'Token de Acceso Personal de GitHub (Opcional)',
  githubTokenPlaceholder: 'ghp_... (aumenta el límite a 5000/hora e incluye Gists secretos)',
  githubFetchBtn: 'Obtener Gists',
  githubFetching: 'Obteniendo desde GitHub...',
  rateLimitRemaining: '{remaining} de {limit} solicitudes restantes (se reinicia {time})',
  gistsDropzoneTitle: 'Arrastra y suelta archivos de código (.js, .py, .rs, .ts, etc.) o exportación JSON de Gist aquí',
  gistsDropzoneSubtitle: 'o haz clic para explorar archivos en tu computadora',
  gistsDropzoneSupport: 'Soporta archivos de código fuente y matrices JSON de fragmentos',
  gistsFound: 'Fragmentos Cargados',
  filterPublic: 'Fragmentos Públicos',
  filterSecret: 'Secretos / Privados',
  colSnippetName: 'Fragmento y Archivo',
  colLanguage: 'Lenguaje',
  colPrivacy: 'Privacidad',
  colSize: 'Tamaño',
  colSource: 'Fuente',
  badgePublic: 'Público',
  badgeSecret: 'Secreto',
  markAsSecret: 'Marcar Seleccionados como Secretos 🔒',
  markAsPublic: 'Marcar Seleccionados como Públicos 🌐',
  previewCode: 'Vista Previa del Código',
  noSnippetsFound: 'No se encontraron fragmentos de código que coincidan con los filtros o criterios de búsqueda actuales.',
  optGenerateKind1337: 'Publicar Fragmentos Públicos como Eventos de Código NIP-C0 (Kind 1337)',
  optGenerateKind1337Desc: 'Transmite eventos estándar de fragmentos de código con etiquetas de lenguaje, archivo y descripción para clientes de código en Nostr.',
  optEncryptPrivate: 'Cifrar Gists Secretos con Auto-Cifrado NIP-44 (Kind 30078)',
  optEncryptPrivateDesc: 'Cifra criptográficamente los Gists secretos para que solo tú con tu clave privada (nsec) puedas descifrarlos y leerlos.',
  optDefaultLicense: 'Licencia SPDX Predeterminada',
  optDefaultRuntime: 'Entorno de Ejecución (Opcional)',
  optDeletePreviousGists: 'Eliminar fragmentos de código importados anteriormente (NIP-09 Kind 5)',
  optDeletePreviousGistsDesc: 'Transmite eventos de eliminación para borrar fragmentos anteriores de Kind 1337 y Kind 30078.',
  gistsMigrationCompleted: '¡Migración de Gists y Fragmentos de Código Completada con Éxito!',
  gistsMigrationCompletedDesc: 'Tus fragmentos de código han sido firmados y publicados en los repetidores de Nostr.',
  gistsResumeBannerDescription: '{completed} de {total} fragmentos ya importados',
  secretGistsNoticeTitle: 'Importar Gists Secretos desde GitHub',
  secretGistsNoticeDesc: 'La API de GitHub no expone los Gists secretos (no listados) en listados masivos de usuarios. Para importar Gists secretos, pega sus URLs o IDs directos (separados por comas o saltos de línea) en el campo de entrada junto con tu token, o haz clic en el botón de privacidad de cualquier fragmento en la tabla para marcarlo como Secreto.',

  // Git Repositories Migration Callout (GitWorkshop & ngit)
  gistsRepoMigrationTitle: '¿Deseas Migrar Repositorios Completos de GitHub, GitLab o Bitbucket?',
  gistsRepoMigrationSubtitle: 'Descentraliza tus repositorios Git, historiales de commits, ramas y PRs en Nostr mediante NIP-34.',
  gistsRepoMigrationDesc: 'x2nostr migra fragmentos de código y Gists independientes directamente en tu navegador (NIP-C0 Kind 1337 y NIP-44 Kind 30078). Para migrar y colaborar en repositorios Git completos con historiales de commits, ramas, parches (PRs) e incidencias, utiliza el ecosistema soberano Nostr Git basado en NIP-34:',
  gistsRepoMigrationNgitTitle: '1. Enviar Repositorios con la CLI ngit',
  gistsRepoMigrationNgitDesc: 'Usa la herramienta oficial de línea de comandos ngit para inicializar, enviar y sincronizar cualquier repositorio Git existente (GitHub, GitLab, Bitbucket o local) directamente con repetidores Nostr:',
  gistsRepoMigrationWebTitle: '2. Explorar y Colaborar en GitWorkshop.dev',
  gistsRepoMigrationWebDesc: 'GitWorkshop.dev es una interfaz web soberana y descentralizada para navegar por repositorios Git de Nostr, revisar parches, abrir PRs y gestionar incidencias mediante NIP-34.',
  btnOpenGitWorkshop: 'Abrir GitWorkshop.dev',
  btnViewNgit: 'Ver ngit en GitHub',

  // Dry Run & Event Inspector
  dryRunBadge: 'Modo de Prueba (Dry Run)',
  dryRunButton: 'Modo de Prueba (Inspeccionar Eventos)',
  dryRunTitle: 'Modo de Prueba: Inspeccionar Eventos Nostr Generados',
  dryRunSubtitle: 'Previsualiza todos los eventos no firmados antes de firmar o transmitir ({count} eventos generados).',
  tabRenderedPreview: 'Vista Previa Renderizada',
  tabRawContent: 'Contenido en Bruto',
  tabNostrJson: 'JSON de Nostr',
  copyJson: 'Copiar JSON',
  copiedJson: '¡JSON copiado al portapapeles!',
  copyContent: 'Copiar Contenido',
  copiedContent: '¡Contenido copiado al portapapeles!',
  copyAllEventsJson: 'Copiar Todos los Eventos (JSON)',
  downloadJson: 'Descargar JSON',
  proceedMigration: 'Proceder con la Migración',
  dryRunNoSelection: 'Por favor, selecciona al menos un elemento para realizar una prueba.',
  inspectRowEvent: 'Inspeccionar Evento',

  // General Action Helpers
  all: 'Todos',
  save: 'Guardar',
  dismiss: 'Descartar',
  dryRun: 'Prueba',

  // Instagram Migration Wizard
  instagramImporterTitle: 'Publicaciones de Instagram a Nostr (Fotos)',
  instagramImporterSubtitle: 'Transfiere tus fotos, álbumes en carrusel y vídeos de Instagram a eventos de imágenes descentralizados NIP-68 (Kind 20). Aloja archivos multimedia en servidores Blossom y publica directamente en relés de Nostr.',
  instagramStep1Title: '1. Conectar o Subir',
  instagramStep1Desc: 'Inicia sesión con 1 clic mediante OAuth de Instagram o sube tu archivo oficial de exportación de datos de Meta.',
  instagramStep2Title: '2. Revisar y Seleccionar',
  instagramStep2Desc: 'Inspecciona fotos, diapositivas del carrusel, etiquetas y selecciona qué publicaciones transferir.',
  instagramStep3Title: '3. Blossom y Publicar',
  instagramStep3Desc: 'Aloja imágenes en servidores descentralizados Blossom y publica eventos de fotos NIP-68 (Kind 20).',
  instagramResumeTitle: 'Migración de Instagram Incompleta Detectada',
  instagramResumeDesc: '{done} de {total} publicaciones ya han sido publicadas en los relés.',
  instagramResumeBtn: 'Reanudar Transferencia',
  instagramLoginTab: 'Iniciar sesión con Instagram',
  instagramUploadTab: 'Subir Archivo de Datos',
  instagramLoginPrimaryTitle: 'Autenticación en 1 Clic con Instagram',
  instagramLoginPrimaryDesc: 'Conecta tu cuenta de Instagram de forma segura mediante OAuth oficial. No requiere configuración de desarrollador ni tokens manuales para cuentas estándar.',
  instagramLoginBtn: 'Iniciar sesión con Instagram',
  instagramWalkPostsBtn: 'Obtener Publicaciones de Instagram',
  instagramWalking: 'Recorriendo el Grafo de Instagram...',
  instagramAdvancedTitle: 'Configuración Avanzada / Aplicación y Token Personalizados de Meta',
  instagramAdvancedDesc: 'Para auto-alojadores o aplicaciones de desarrollador de Meta personalizadas, puedes proporcionar tu propio Client ID, Secreto o pegar directamente un Token de Acceso de Usuario.',
  instagramCustomClientId: 'ID de Cliente de Aplicación de Meta',
  instagramCustomClientSecret: 'Secreto de Aplicación de Meta',
  instagramDirectToken: 'Token de Acceso de Usuario Directo de Instagram',
  instagramDropArchiveTitle: 'Arrastra y suelta el archivo JSON de exportación de Instagram (posts_1.json)',
  instagramDropArchiveDesc: 'o haz clic para explorar los archivos de descarga de datos de tu cuenta de Meta',
  instagramFilterPhotos: 'Fotos',
  instagramFilterCarousels: 'Carruseles',
  instagramFilterVideos: 'Vídeos',
  instagramSearchPlaceholder: 'Buscar en descripciones o #etiquetas...',
  instagramBlossomSettingsTitle: 'Almacenamiento Multimedia Descentralizado Blossom',
  instagramUploadBlossomLabel: 'Alojar imágenes en servidores multimedia Blossom (Kind 24242 / NIP-98)',
  instagramUploadBlossomDesc: 'Las URL de la CDN de Instagram caducan con el tiempo. Alojarlas en Blossom mantiene tus fotos permanentemente descentralizadas en Nostr.',
  instagramNostrSettingsTitle: 'Estándar de Publicación de Fotos de Nostr',
  instagramDeletePrevLabel: 'Eliminar publicaciones de imágenes anteriores primero (NIP-09 Kind 5)',
  instagramSelectedSummary: '{count} de {total} publicaciones seleccionadas para transferir',
  instagramDownloadBackupBtn: 'Descargar Copia de Seguridad (.jsonl)',
  instagramStartMigrationBtn: 'Transferir a Nostr (Kind 20)',
  instagramProgressTitle: 'Transfiriendo publicaciones de Instagram a Nostr...',
  instagramConnecting: 'Canjeando código de autorización de Instagram...',
  instagramAuthSuccess: '¡Conectado a Instagram con éxito!',
  instagramPostsLoaded: 'Se han cargado {count} publicaciones de Instagram.',
  instagramTokenSaved: 'Token de acceso de Instagram guardado.',
  instagramBackupDownloaded: 'Paquete de copia de seguridad Nostr Kind 20 descargado.',
  instagramArchiveLoaded: 'Publicaciones cargadas exitosamente desde el archivo de Instagram.',
  instagramUnsupportedFormat: 'Por favor, sube un archivo de exportación de Instagram (posts_1.json).',

  // LinkedIn Articles Migration Wizard
  linkedinImporterTitle: 'Artículos de LinkedIn a Contenido de Formato Largo de Nostr',
  linkedinImporterSubtitle: 'Migra tus artículos de formato largo de LinkedIn Pulse a artículos soberanos NIP-23 (Kind 30023). Convierte HTML enriquecido a Markdown, preserva las portadas y sube los medios a servidores descentralizados Blossom.',
  linkedinGuideTitle: 'Cómo exportar tus artículos desde LinkedIn',
  linkedinGuideShort: 'Exporta tu archivo de artículos de formato largo directamente desde los ajustes de privacidad de tu cuenta de LinkedIn.',
  linkedinStep1Title: 'Ir a los Ajustes de Privacidad de Datos',
  linkedinStep1Desc: 'Haz clic en tu foto de perfil > Configuración y Privacidad > Privacidad de datos > Obtén una copia de tus datos.',
  linkedinStep2Title: 'Seleccionar Artículos y Solicitar Archivo',
  linkedinStep2Desc: 'Elige "¿Quieres algo en particular? > Artículos" (o descarga el archivo completo) y haz clic en "Solicitar archivo".',
  linkedinStep3Title: 'Subir el Archivo ZIP o los Archivos HTML',
  linkedinStep3Desc: 'LinkedIn te enviará un enlace de descarga por correo electrónico. Arrastra el archivo .zip descargado o los archivos .html individuales a continuación.',
  linkedinDropzoneTitle: 'Arrastra y suelta el archivo ZIP de exportación de LinkedIn o los archivos HTML de artículos aquí',
  linkedinDropzoneSubtitle: 'o haz clic para buscar archivos en tu ordenador',
  linkedinDropzoneSupport: 'Admite archivos ZIP de datos de LinkedIn (.zip), archivos HTML de artículos (.html) y exportaciones CSV (.csv)',
  linkedinArticlesLoaded: 'Artículos cargados',
  noArticlesFound: 'No hay artículos que coincidan con los criterios de búsqueda o filtrado.',
  showInstructions: 'Mostrar Instrucciones de Exportación',
  hideInstructions: 'Ocultar Instrucciones',
  changeFile: 'Cambiar Archivo',
  summary: 'Resumen / Extracto',
  tags: 'Temas y Etiquetas',
  publishedDate: 'Fecha de Publicación',
};

