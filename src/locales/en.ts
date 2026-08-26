export const en = {
  // App & Navigation
  appTitle: 'x2nostr — Move to Nostr',
  appTagline: 'Reclaim your data sovereignty. Migrate your libraries, reviews, and posts from centralized platforms to the decentralized Nostr protocol.',
  connectNostr: 'Connect Nostr',
  connecting: 'Connecting...',
  connected: 'Connected',
  fetchingProfile: 'Fetching profile...',
  disconnect: 'Disconnect',
  extensionNotFound: 'No Nostr extension found. Please install Alby, nos2x, or another NIP-07 extension.',
  activeRelays: 'Active Relays',
  relaysConfig: 'Relays Configuration',
  language: 'Language',
  
  // Hero & Manifesto
  heroBadge: '⚡ 100% Sovereign & Client-Side',
  heroTitle: 'Escape Walled Gardens.',
  heroTitleHighlight: 'Move to Nostr.',
  heroSubtitle: 'Centralized platforms lock your memories, reviews, reading history, and social graph inside closed silos. x2nostr lets you export and cryptographically sign your data straight to Nostr relays — no backend, zero tracking, total ownership.',
  getStarted: 'Start Migration',
  exploreEcosystem: 'Explore Ecosystem',
  
  // Manifesto Cards ("Why Nostr?")
  whyNostrTitle: 'Why Reclaim Your Data on Nostr?',
  whyNostrSubtitle: 'Unlike Web 2.0 corporate silos, Nostr gives you cryptographic guarantees.',
  feature1Title: 'True Data Sovereignty',
  feature1Desc: 'Your reading history and reviews are signed by your private key. Stored on permissionless relays that you choose.',
  feature2Title: 'Censorship Resistance',
  feature2Desc: 'No corporation can ban your account, delete your reading history, or modify your reviews behind closed doors.',
  feature3Title: 'Universal Identity (npub)',
  feature3Desc: 'A single Nostr public key connects you to reading apps, social networks, blog platforms, audio, and video.',
  feature4Title: 'Lightning Zaps & Value',
  feature4Desc: 'Receive instant Bitcoin micro-tips (zaps) on your book reviews and articles directly to your Lightning wallet.',
  feature5Title: 'Zero-Knowledge Privacy',
  feature5Desc: 'All parsing, metadata resolution, and event signing run entirely inside your browser sandbox. No server records exist.',
  feature6Title: 'Open Ecosystem Interoperability',
  feature6Desc: 'Migrated data works immediately across Bookstr, Habla, Damus, Amethyst, Primal, and any compliant Nostr client.',

  // Ecosystem Section
  ecosystemTitle: 'The Nostr App Universe',
  ecosystemSubtitle: 'Once your data is broadcast to Nostr relays, it is instantly readable and interactable across these open-source clients.',
  appBookstrTitle: 'Bookstr',
  appBookstrDesc: 'Decentralized reading tracker, bookshelf manager, and book review social network built on Nostr (NIP-51 Lists, Kinds 10073-10075 & 31985).',
  appHablaTitle: 'Habla.news',
  appHablaDesc: 'Decentralized long-form blogging platform powered by NIP-23 content events with native Lightning monetization.',
  appYakihonneTitle: 'Yakihonne',
  appYakihonneDesc: 'Feature-rich long-form publishing portal, media curation, and smart widgets for Nostr writers.',
  appDamusTitle: 'Damus (iOS)',
  appDamusDesc: 'Beautiful, fast, native Nostr client for iPhone and iPad with seamless Zap integration and clean design.',
  appAmethystTitle: 'Amethyst (Android)',
  appAmethystDesc: 'The premier open-source Nostr social client for Android with extensive NIP support and media playback.',
  appPrimalTitle: 'Primal (Web / Mobile)',
  appPrimalDesc: 'Lightning-fast Nostr client with integrated wallet, portfolio tracking, and high-performance caching.',
  appWavelakeTitle: 'Wavelake',
  appWavelakeDesc: 'Decentralized music and podcast streaming platform where musicians earn value for value via Lightning.',
  appZapStreamTitle: 'ZapStream',
  appZapStreamDesc: 'Live streaming on Nostr with real-time chat, zaps, and decentralized stream distribution.',
  openApp: 'Open App',

  // Importer Catalog Menu
  importersTitle: 'Migration Hub',
  importersSubtitle: 'Select a data source to begin your sovereign migration.',
  statusActive: 'Active & Ready',
  statusBeta: 'Beta',
  statusComingSoon: 'Coming Soon',
  targetNip: 'Target Protocol',

  // Goodreads Importer Plugin
  goodreadsName: 'Goodreads to Bookstr',
  goodreadsDesc: 'Migrate your complete Goodreads book library, custom shelves, star ratings, read dates, and reviews directly to Bookstr (NIP-51).',
  goodreadsTarget: 'NIP-51 (Kind 30003), Bookstr (Kinds 10073-10075) & Kind 31985 Reviews',
  
  // Movies & TV Importer Plugin
  moviesName: 'Movies & TV Shows (Open Movie Database)',
  moviesDesc: 'Export your ratings, watchlists, and movie reviews into decentralized cinema lists and community reviews.',
  moviesTarget: 'NIP-51 Cinema Lists (Kind 30003) & Kind 31985 Reviews',
  
  // Coming Soon Importers
  blogsName: 'Long-Form Blogs',
  blogsDesc: 'Migrate Hugo, Ghost, WordPress, or Blogger archives into sovereign NIP-23 long-form articles for Habla and Yakihonne.',
  blogsTarget: 'NIP-23 Long-Form (Kind 30023)',
  
  imdbName: 'Movies & TV Tracker',
  imdbDesc: 'Export your watchlist, ratings, and film reviews into decentralized movie lists and community reviews.',
  imdbTarget: 'NIP-51 Cinema Lists & Kind 31985 Reviews',
  
  letterboxdName: 'Letterboxd Diary',
  letterboxdDesc: 'Migrate your Letterboxd diary, watched films, review logs, and custom curated cinema lists to Nostr.',
  letterboxdTarget: 'NIP-51 Film Lists & Rating Events',
  
  twitterName: 'Twitter / X Archive',
  twitterDesc: 'Ingest your Twitter data archive and rebuild your best threads and historical tweets as Nostr root notes and replies.',
  twitterTarget: 'NIP-01 Short Notes (Kind 1)',
  
  instagramName: 'Instagram Photos',
  instagramDesc: 'Migrate your photo archives into decentralized Blossom/NIP-96 media servers and publish picture events.',
  instagramTarget: 'NIP-68 Picture Posts (Kind 20)',
  
  spotifyName: 'Spotify Playlists',
  spotifyDesc: 'Export your saved playlists and favorite tracks to decentralized music collections on Wavelake and Stemstr.',
  spotifyTarget: 'NIP-51 Music Playlists (Kind 30001)',

  // Goodreads Migration Wizard
  step1Title: '1. Export from Goodreads',
  step1Desc: 'Go to Goodreads > My Books > Import and export > Click "Export Library". A CSV file will download.',
  step2Title: '2. Upload & Preview',
  step2Desc: 'Drop your Goodreads CSV file below. We will parse your books, clean formulas, and resolve Open Library covers.',
  step3Title: '3. Sign & Broadcast',
  step3Desc: 'Select your shelves, connect your NIP-07 extension, and sign your sovereign lists onto the Nostr network.',

  // Upload Area
  dropzoneTitle: 'Drag & drop your Goodreads CSV export file here',
  dropzoneSubtitle: 'or click to browse files from your computer',
  dropzoneSupport: 'Supports standard Goodreads library CSV exports (goodreads_library_export.csv)',
  processingCsv: 'Parsing CSV file...',
  sampleCsvLink: 'Download sample Goodreads CSV',

  // Table & Preview
  booksFound: 'Books Loaded',
  filterAll: 'All Books',
  filterRead: 'Read',
  filterCurrentlyReading: 'Currently Reading',
  filterToRead: 'To Read',
  filterUnrated: 'Unrated',
  searchPlaceholder: 'Search by title, author, or ISBN...',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  selectedCount: '{count} of {total} selected',
  colCover: 'Cover',
  colTitleAuthor: 'Title & Author',
  colShelf: 'Shelf',
  colRating: 'My Rating',
  colDateRead: 'Date Read',
  colIsbn: 'ISBN',
  colOpenLibrary: 'Open Library',
  noBooksFound: 'No books match the current filter or search criteria.',
  fetchingMetadata: 'Resolving Open Library metadata...',
  metadataReady: 'Metadata enriched',
  enrichmentProgress: 'Enriching Open Library metadata ({current}/{total})...',
  enrichmentCompleted: 'Open Library metadata enriched ({current}/{total})',
  
  // Migration Controls & Options
  migrationOptionsTitle: 'Migration Settings',
  optGenerateLists: 'Publish Book Lists (NIP-51 Kind 30003 & Bookstr Kinds 10073-10075 for "read", "currently-reading", "to-read")',
  optGenerateListsDesc: 'Creates sovereign categorized lists fully compatible with Coracle, Nostrudel, Bookstr.xyz, and all NIP-51 clients.',
  optGenerateReviews: 'Publish Individual Review & Rating Events (Kind 31985)',
  optGenerateReviewsDesc: 'Broadcasts individual timestamped rating and review events for books containing your personal notes.',
  optDeletePreviousReviews: 'Delete previously published review events first (NIP-09 Kind 5)',
  optDeletePreviousReviewsDesc: 'Broadcasts a cryptographic deletion request to your relays to remove previous review events before fresh import.',
  confirmDeleteModalTitle: 'Confirm Deletion of Previous Reviews',
  confirmDeleteModalDesc: 'This will broadcast a NIP-09 (Kind 5) deletion event to your relays to delete previously published book reviews for this account. Are you sure you want to proceed?',
  confirmDeleteModalConfirm: 'Yes, Delete & Re-import',
  confirmDeleteModalCancel: 'Cancel',
  startMigration: 'Start Migration to Nostr',
  pauseMigration: 'Pause',
  resumeMigration: 'Resume',
  cancelMigration: 'Cancel',
  migrationCompleted: 'Migration Successfully Completed!',
  migrationCompletedDesc: 'Your books and lists have been signed and broadcast to Nostr relays. You can now view your library on Bookstr!',
  viewOnBookstr: 'View Library on Bookstr.xyz',
  
  // Progress & Status
  signingNotice: 'Please approve the signature prompts in your Nostr extension.',
  currentProgress: 'Processing: {current} / {total} ({percent}%)',
  currentlyProcessing: 'Currently processing: {title}',
  successCount: '{count} succeeded',
  failedCount: '{count} failed',
  timeRemaining: 'Estimated time remaining: {time}',

  // Activity Log Console
  activityLogTitle: 'Migration Live Activity Console',
  clearLogs: 'Clear Logs',
  exportLogs: 'Export Log File',
  noLogsYet: 'Activity logs will stream here during parsing, metadata enrichment, and relay broadcasting.',

  // Coming Soon Modal
  comingSoonTitle: '{name} Importer',
  comingSoonBadge: 'In Active Development',
  comingSoonDesc: 'This migration module is currently on our Phase {phase} roadmap. Join the Nostr conversation or contribute on GitHub to accelerate its launch!',
  roadmapStage: 'Roadmap Milestone: {stage}',
  targetEvents: 'Target Nostr Events: {events}',
  notifyMe: 'View Roadmap',
  closeModal: 'Close',

  // Relay Modal
  relayModalTitle: 'Nostr Relay Configuration',
  relayModalDesc: 'x2nostr broadcasts your signed events directly to these relays. You can add your own favorite relays.',
  addRelayPlaceholder: 'wss://relay.example.com',
  addRelayBtn: 'Add Relay',
  removeRelay: 'Remove',
  relayConnected: 'Connected',
  relayConnecting: 'Connecting',
  relayError: 'Failed to connect',

  // Footer
  footerTagline: 'Decentralized, sovereign data migration for the open web.',
  footerClientSideOnly: '🔒 Zero server retention. All data processing and cryptographic signing happens exclusively within your browser.',
  footerBuiltWith: 'Built with TypeScript, Tailwind CSS, Hono, and nostr-tools.',
  footerAuthor: 'Created with 💜 by {author}',
  githubRepo: 'GitHub Repository',
  roadmapLink: 'Roadmap',

  // Resume Banner
  resumeBannerTitle: 'Previous import detected',
  resumeBannerDescription: '{completed} of {total} books already imported',
  resumeBannerResume: 'Resume Import',
  resumeBannerFresh: 'Start Fresh',
  resumeBannerFreshWarning: 'Starting fresh will re-publish and overwrite your shelf and review events across your connected Nostr relays.',
  resumeBannerFreshConfirm: 'Yes, start fresh',
  resumeBannerFreshCancel: 'Cancel',

  // Movies & TV Migration Wizard
  moviesStep1Title: '1. Export Ratings',
  moviesStep1Desc: 'Export your ratings or watchlist from your movie tracking platform as a CSV file.',
  moviesStep2Title: '2. Upload & Preview',
  moviesStep2Desc: 'Drop your movie CSV file below. We will parse your titles, ratings (1-10), genres, and directors.',
  moviesStep3Title: '3. Sign & Broadcast',
  moviesStep3Desc: 'Connect your Nostr extension, configure list options, and sign your sovereign cinema events to relays.',

  // Movies Upload Area
  moviesDropzoneTitle: 'Drag & drop your movie ratings CSV export file here',
  moviesDropzoneSubtitle: 'or click to browse files from your computer',
  moviesDropzoneSupport: 'Supports standard movie ratings & watchlist CSV exports',

  // Movies Table & Filters
  filterMovies: 'Movies',
  filterTvSeries: 'TV Series',
  filterTvEpisodes: 'Episodes',
  filterHighRated: 'Top Rated (8-10★)',
  colTitleMedia: 'Title & Year',
  colType: 'Type',
  colDirector: 'Director',
  colGenres: 'Genres',
  colRuntime: 'Runtime',
  colOmdbId: 'Title ID',
  noMoviesFound: 'No movies or TV shows match the current filter or search criteria.',

  // Movies Migration Controls & Options
  optGenerateMovieLists: 'Publish Curated Cinema & TV List (NIP-51 Kind 30003)',
  optGenerateMovieListsDesc: 'Creates sovereign categorized lists of your rated films and series fully compatible with Coracle, Nostrudel, and NIP-51 clients.',
  optGenerateMovieReviews: 'Publish Individual Ratings & Review Events (Kind 31985)',
  optGenerateMovieReviewsDesc: 'Broadcasts individual timestamped NIP-32 rating events (1-10 scale) for each title with rich movie metadata.',
  optDeletePreviousMovieReviews: 'Delete previously published movie review events first (NIP-09 Kind 5)',
  optDeletePreviousMovieReviewsDesc: 'Broadcasts a cryptographic deletion request to remove previous movie review events before fresh import.',
  confirmDeleteMovieModalTitle: 'Confirm Deletion of Previous Movie Reviews',
  confirmDeleteMovieModalDesc: 'This will broadcast a NIP-09 (Kind 5) deletion event to your relays to delete previously published movie reviews for this account. Are you sure you want to proceed?',
  moviesMigrationCompleted: 'Movie & TV Migration Successfully Completed!',
  moviesMigrationCompletedDesc: 'Your movie ratings and curated lists have been signed and broadcast to Nostr relays.',
  moviesResumeBannerDescription: '{completed} of {total} titles already imported',
};

export type TranslationKey = keyof typeof en;
