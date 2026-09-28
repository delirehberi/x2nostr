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
  appDittoTitle: 'Ditto.pub',
  appDittoDesc: 'Decentralized social networking and long-form publishing platform powered by the Nostr protocol.',
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
  appGitWorkshopTitle: 'GitWorkshop',
  appGitWorkshopDesc: 'Decentralized code collaboration on Nostr. Browse repositories, review patches, and track issues over NIP-34.',
  openApp: 'Open App',

  // Navigation Links
  navHome: 'Home',
  navImporters: 'Migration Hub',
  navGettingStarted: 'Getting Started',
  navDocs: 'Documents',
  navSupport: 'Support',
  configureRelays: 'Configure Relays',
  relaysSummary: '{count} Active Relays',
  userProfile: 'User Profile',

  // Ecosystem Categories
  catBooks: 'Books & Reading',
  catSocialBlogs: 'Social & Blogs',
  catPublishing: 'Publishing & Media',
  catSocialMobile: 'Social & Mobile',
  catSocialMedia: 'Social & Media',
  catWebMobile: 'Web & Mobile',
  catMusic: 'Music & Podcasts',
  catVideo: 'Live Streaming',
  catCodeGit: 'Code & Git (NIP-34)',

  // Documentation Hub
  docsTitle: 'Nostr Knowledge Base & HowTos',
  docsSubtitle: 'In-depth technical documentation on sovereign key management, NIP-07 extensions, NIP-51 lists, Amber bunker, and data migration.',
  doc1Title: '1. Nostr Keypair Security & Sovereign Identity',
  doc1Summary: 'Learn how cryptographic public (npub) and private (nsec) keys replace traditional passwords and centralized platform logins.',
  doc2Title: '2. Setting Up Amber as a NIP-46 Bunker on Android',
  doc2Summary: 'How to use Amber as a remote signer bunker so third-party websites and apps never see your private key.',
  doc3Title: '3. Goodreads Migration & Bookstr (NIP-51 & NIP-32)',
  doc3Summary: 'Deep dive into Goodreads CSV ingestion, Open Library cover enrichment, and Bookstr reading list indexing.',
  doc4Title: '4. IMDb & Letterboxd Ratings to Nostr Cinema',
  doc4Summary: 'Convert film watchlists and rating archives into NIP-51 curated cinema sets and NIP-32 reviews.',
  doc5Title: '5. Long-Form Publishing on NIP-23 (Ditto.pub & Yakihonne)',
  doc5Summary: 'Overview of converting Hugo, Ghost, and WordPress blog posts into sovereign NIP-23 content events.',
  doc6Title: '6. Documenting Data Sovereignty: The x2nostr Manifesto & Spec',
  doc6Summary: 'Why we built a zero-knowledge documentation hub for x2nostr and how client-side sovereign migration works under the hood.',
  
  // Documentation Body Contents
  doc1Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Understanding Nostr Cryptographic Keypairs</h3>
    <p>Unlike legacy social networks (Twitter, Goodreads, IMDb) where your identity is tied to an email address and password stored on a corporate server, Nostr uses standard <strong>schnorr signature keypairs</strong> (secp256k1).</p>
    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">Keypair Overview:</h4>
      <ul class="list-disc list-inside space-y-1 text-xs text-purple-950">
        <li><strong>npub (Public Key):</strong> Your universal Nostr address (like a username or wallet address). Share it freely with anyone.</li>
        <li><strong>nsec (Private Key):</strong> Your secret cryptographic signature key. <em>NEVER share your nsec with any website or individual.</em></li>
      </ul>
    </div>
    <h4 class="font-bold text-slate-900">Recommended Browser Extensions (NIP-07):</h4>
    <p>To log into Nostr web applications without copy-pasting your <code>nsec</code>, install a NIP-07 browser extension:</p>
  </div>`,

  doc2Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Configuring Amber as a Remote Signer Bunker on Android</h3>
    <p><strong>Amber</strong> is an open-source Android application that acts as an isolated Nostr signer (bunker). It allows you to keep your <code>nsec</code> stored securely inside your phone's keystore, authorizing signature requests from mobile clients without granting them raw private key access.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900">How Amber Remote Signing Works:</h4>
      <ol class="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
        <li>Download Amber from GitHub or F-Droid.</li>
        <li>Import or generate your <code>nsec</code> keypair inside Amber.</li>
        <li>When opening Nostr clients (such as Amethyst or web apps via NIP-46 connection strings), select <strong>Sign with Amber</strong>.</li>
        <li>Amber will display a prompt showing the event kind and content before signing.</li>
      </ol>
    </div>
  </div>`,

  doc3Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Goodreads to Bookstr Migration Guide</h3>
    <p>Migrating your Goodreads library converts standard book exports into sovereign Nostr list events and rating reviews.</p>
    <h4 class="font-bold text-slate-900">Target Protocol Specifications:</h4>
    <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-700">
      <li><strong>Kind 30003 (NIP-51 Bookmark Sets):</strong> Curated book lists tagged with <code>read</code>, <code>currently-reading</code>, and <code>to-read</code>.</li>
      <li><strong>Bookstr Native Lists (Kinds 10073, 10074, 10075):</strong> Indexed shelves featuring ISBN tags (<code>["k", "isbn"]</code>) and cover metadata.</li>
      <li><strong>Kind 31985 (NIP-32 Reviews):</strong> Parameterized replaceable events with 1-5 star ratings, personal notes, and timestamps.</li>
    </ul>
  </div>`,

  doc4Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">IMDb & Letterboxd Ratings to Nostr Cinema</h3>
    <p>Exporting your movie ratings and watchlists from IMDb or Letterboxd creates decentralized film collection events compatible with open-source Nostr movie trackers.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900 font-mono text-xs">Metadata Enrichment via OMDb:</h4>
      <p class="text-xs text-slate-600">x2nostr queries the Open Movie Database (OMDb) to enrich titles with directors, release years, runtimes, posters, and genre tags before signing events to connected relays.</p>
    </div>
  </div>`,

  doc5Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Long-Form Publishing on NIP-23 (Ditto.pub & Yakihonne)</h3>
    <p>NIP-23 defines long-form content events (Kind <code>30023</code>) formatted in Markdown with title tags, summaries, publication dates, and image header banners.</p>
  </div>`,

  doc6Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Documenting Data Sovereignty: Introducing the x2nostr Spec & Docs</h3>
    <p>In our previous posts about <a href="https://blog.emre.xyz/posts/0d64aa67/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">Hugo2Nostr</a> and the <a href="https://blog.emre.xyz/posts/nostr/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">Nostr protocol</a>, we wrote about escaping walled gardens and publishing content directly to permissionless relays. But moving data out of legacy platforms—whether it's your Goodreads reading history, Letterboxd movie ratings, or Hugo markdown posts—should never feel like a black box.</p>
    <p>When you migrate your digital footprint, you shouldn't have to trust an intermediary server with your unencrypted credentials or private keys. That is why we published the official documentation and technical spec for <a href="https://x2nostr.emre.xyz" class="text-purple-600 underline hover:text-purple-800">x2nostr (move-to-nostr)</a>.</p>
    
    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">What Does the Specification Cover?</h4>
      <ul class="list-disc list-inside space-y-1.5 text-xs text-purple-950">
        <li><strong>Client-Side Sovereign Architecture:</strong> All CSV parsing (via <code>PapaParse</code>), metadata enrichment (via rate-limited <code>Open Library API</code> queues), and cryptographic signing happen 100% inside your browser context. No databases, no telemetry, no tracking cookies.</li>
        <li><strong>NIP Protocol Standardizations:</strong> <code>NIP-07</code> extension signing, <code>NIP-51</code> reading and cinema sets (Kind <code>30003</code>), <code>NIP-32</code> rating reviews (Kind <code>31985</code>), and <code>NIP-23</code> long-form articles (Kind <code>30023</code>).</li>
        <li><strong>Relay Broadcasting Mechanics:</strong> How <code>nostr-tools SimplePool</code> handles concurrent broadcasting to both default bootstrap relays and custom user-defined relays.</li>
      </ul>
    </div>

    <h4 class="font-bold text-slate-900">Strict Guidelines for AI & Open-Source Contributors</h4>
    <p>We welcome contributions from developers utilizing AI coding assistants. However, maintainability and code quality come first. Our documentation explicitly outlines our <strong>Strict 500-Line Diff Policy</strong>: Pull requests exceeding 500 lines of code changes will be rejected until decomposed into clean, atomic commits.</p>
    
    <p class="text-xs text-slate-500 pt-2">Read more about our philosophical approach to escaping digital feudalism on <a href="https://blog.emre.xyz/posts/7492c6cf/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Teknofeodalizm - Dijital Toprak Ağalığı</a> and <a href="https://blog.emre.xyz/posts/nostr-nasil-gidiyor/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Nostr Nasıl Gidiyor?</a>.</p>
  </div>`,


  // Newbie Guide & Keygen
  btnNewbieGuide: 'Nostr for Newbies Guide',
  newbieGuideTitle: 'Nostr Onboarding Guide for Newbies',
  newbieGuideSubtitle: 'Everything you need to understand Nostr, create your sovereign keypair, and migrate your data seamlessly.',
  newbieStep1Title: '1. Create or Connect Your Key',
  newbieStep1Desc: 'Generate a fresh Nostr keypair directly inside your browser sandbox, or connect an existing NIP-07 extension.',
  generateKeyBtn: 'Generate New Nostr Key (nsec/npub)',
  copyNsec: 'Copy Private Key (nsec)',
  copyNpub: 'Copy Public Key (npub)',
  keyGeneratedNotice: 'Keypair successfully generated! Please copy and back up your private key (nsec) in a password manager immediately.',
  newbieStep2Title: '2. Signers & Bunker (Amber, Extensions)',
  newbieStep2Desc: 'Use NIP-07 browser extensions (Alby, nos2x) on desktop or Amber (NIP-46 / NIP-55 remote signer bunker) on Android to sign events securely without revealing private keys to websites.',
  whySovereigntyTitle: 'Why Data Sovereignty Matters',
  whySovereigntyDesc: 'Your cryptographic private key gives you total ownership of your identity, reading history, and reviews. No platform can censor or ban your data.',
  newbieStep3Title: '3. Import Your Data',
  newbieStep3Desc: 'Export your Goodreads (Books) or IMDb/Letterboxd (Movies & TV) libraries as CSV files and sign them onto Nostr relays.',
  newbieStep4Title: '4. Explore Recommended Apps',
  newbieStep4Desc: 'Access your migrated content across top open-source Nostr apps on web and mobile:',
  recMobileApps: 'Recommended Mobile Apps: Damus (iOS), Amethyst (Android), Primal (iOS & Android)',
  recWebApps: 'Recommended Web Apps: Bookstr.xyz (Books), Ditto.pub & Yakihonne (Blogs), Primal.net (Social)',

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
  blogsName: 'WordPress (WXR XML)',
  blogsDesc: 'Migrate your WordPress blog posts into sovereign NIP-23 long-form articles with automatic Markdown conversion and Blossom media uploads.',
  blogsTarget: 'NIP-23 Long-Form (Kind 30023)',
  
  linkedinName: 'LinkedIn Articles',
  linkedinDesc: 'Migrate your long-form LinkedIn Pulse articles into sovereign NIP-23 content events with rich Markdown formatting and Blossom media hosting.',
  linkedinTarget: 'NIP-23 Long-Form Articles (Kind 30023)',
  
  gistsName: 'GitHub Gists',
  gistsDesc: 'Migrate your GitHub Gists and code snippets into decentralized NIP-C0 (Kind 1337) code events and NIP-44 encrypted private snippets.',
  gistsTarget: 'NIP-C0 Snippets (Kind 1337) & NIP-44 Encrypted (Kind 30078)',
  
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
  footerCommunity: 'A {link} community initiative',
  footerBuiltWith: 'Built with TypeScript, Tailwind CSS, Hono, and nostr-tools.',
  footerAuthor: 'Created with 💜 by {author}',
  sourceCode: 'Source Code',
  githubRepo: 'GitHub Repository',
  gitWorkshopRepo: 'Nostr Repo (GitWorkshop)',
  viewExampleRepo: 'View x2nostr on GitWorkshop',
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

  // WordPress Migration Wizard
  wpImporterTitle: 'WordPress (WXR XML) to Nostr Articles',
  wpImporterSubtitle: 'Migrate your WordPress blog posts into sovereign NIP-23 long-form articles. Automatically converts HTML content to Markdown and uploads post image assets to Blossom media servers.',
  wpDropzoneTitle: 'Drag & drop your WordPress WXR export file here',
  wpDropzoneSubtitle: 'or click to browse files from your computer',
  wpDropzoneSupport: 'Supports standard WordPress XML export files (.xml, .wxr)',
  wpPostsLoaded: 'Posts Loaded',
  wpFilterPublished: 'Published',
  wpFilterDrafts: 'Drafts',
  wpColCategories: 'Categories & Tags',
  wpColMedia: 'Media Assets',
  wpOptBlossomTitle: 'Upload post images to Blossom servers (NIP-98 / Kind 24242)',
  wpOptBlossomDesc: 'Extracts inline post photos and cover images, signs Blossom authorization headers, and updates Markdown image links.',
  wpBlossomServersLabel: 'Blossom Servers (Comma Separated)',
  wpOptDeleteTitle: 'Delete previously imported blog posts first (NIP-09 Kind 5)',
  wpOptDeleteDesc: 'Broadcasts a deletion event to remove previous Kind 30023 articles before fresh import.',
  wpSyncTipTitle: 'Looking for Real-Time Auto-Sync?',
  wpSyncTipDesc: 'x2nostr is designed for client-side batch migration from WXR export files. If you want continuous real-time cross-posting from your live WordPress site to Nostr, we recommend trying the {link}.',
  postrPluginName: 'Postr for Nostr WordPress Plugin',

  // GitHub Gists Migration Wizard
  gistsStep1Title: '1. Connect GitHub / Gists',
  gistsStep1Desc: 'Enter your GitHub username or specific Gist URL, or provide local code files.',
  gistsStep2Title: '2. Preview & Select',
  gistsStep2Desc: 'Review snippet filenames, programming languages, public/secret privacy status, and code contents.',
  gistsStep3Title: '3. Sign & Broadcast',
  gistsStep3Desc: 'Sign public NIP-C0 events and NIP-44 self-encrypted private snippet events to Nostr.',
  gistsImporterTitle: 'GitHub Gists & Code Snippets to Nostr',
  gistsImporterSubtitle: 'Migrate your GitHub Gists and code snippets into decentralized Nostr events. Public snippets are published as NIP-C0 (Kind 1337) and secret/private gists are encrypted with NIP-44 (Kind 30078).',
  gistsFetchTab: 'GitHub Gists API',
  gistsUploadTab: 'Upload Code / JSON',
  githubUsernameLabel: 'GitHub Username or Gist URL',
  githubUsernamePlaceholder: 'e.g. torvalds or https://gist.github.com/alice/12345',
  githubTokenLabel: 'GitHub Personal Access Token (Optional)',
  githubTokenPlaceholder: 'ghp_... (increases rate limit to 5000/hr & includes secret gists)',
  githubFetchBtn: 'Fetch Gists',
  githubFetching: 'Fetching from GitHub...',
  rateLimitRemaining: '{remaining} / {limit} requests remaining (resets {time})',
  gistsDropzoneTitle: 'Drag & drop code files (.js, .py, .rs, .ts, etc.) or Gist JSON export here',
  gistsDropzoneSubtitle: 'or click to browse files from your computer',
  gistsDropzoneSupport: 'Supports code source files and JSON snippet arrays',
  gistsFound: 'Snippets Loaded',
  filterPublic: 'Public Snippets',
  filterSecret: 'Secret / Private',
  colSnippetName: 'Snippet & Filename',
  colLanguage: 'Language',
  colPrivacy: 'Privacy',
  colSize: 'Size',
  colSource: 'Source',
  badgePublic: 'Public',
  badgeSecret: 'Secret',
  markAsSecret: 'Mark Selected as Secret 🔒',
  markAsPublic: 'Mark Selected as Public 🌐',
  previewCode: 'Preview Code',
  noSnippetsFound: 'No code snippets match the current filter or search criteria.',
  optGenerateKind1337: 'Publish Public Snippets as NIP-C0 Code Events (Kind 1337)',
  optGenerateKind1337Desc: 'Broadcasts standard code snippet events with language, filename, and description tags for Nostr code clients.',
  optEncryptPrivate: 'Encrypt Secret Gists with NIP-44 Self-Encryption (Kind 30078)',
  optEncryptPrivateDesc: 'Cryptographically encrypts secret gists so only you holding your private key (nsec) can decrypt and read them.',
  optDefaultLicense: 'Default SPDX License',
  optDefaultRuntime: 'Runtime / Environment (Optional)',
  optDeletePreviousGists: 'Delete previously imported code snippets first (NIP-09 Kind 5)',
  optDeletePreviousGistsDesc: 'Broadcasts deletion events for previous Kind 1337 and Kind 30078 snippet events.',
  gistsMigrationCompleted: 'Gists & Code Snippets Migration Successfully Completed!',
  gistsMigrationCompletedDesc: 'Your code snippets have been signed and published to Nostr relays.',
  gistsResumeBannerDescription: '{completed} of {total} snippets already imported',
  secretGistsNoticeTitle: 'Importing Secret Gists from GitHub',
  secretGistsNoticeDesc: "GitHub's API does not expose secret (unlisted) gists in bulk user listings. To import secret gists, paste their direct Gist URLs or IDs (separated by commas or newlines) into the input field with your token, or click the privacy badge on any snippet in the table to mark it as Secret.",

  // Git Repositories Migration Callout (GitWorkshop & ngit)
  gistsRepoMigrationTitle: 'Migrating Full GitHub, GitLab, or Bitbucket Repositories?',
  gistsRepoMigrationSubtitle: 'Decentralize your Git repositories, commit histories, branches, and PRs on Nostr using NIP-34.',
  gistsRepoMigrationDesc: 'x2nostr migrates standalone code snippets and Gists directly inside your browser (NIP-C0 Kind 1337 & NIP-44 Kind 30078). To migrate and collaborate on entire Git repositories with full commit histories, branches, patches (PRs), and issues, use the sovereign Nostr Git ecosystem:',
  gistsRepoMigrationNgitTitle: '1. Push Repositories with ngit CLI',
  gistsRepoMigrationNgitDesc: 'Use the official ngit CLI tool to initialize, push, and sync any existing Git repository (GitHub, GitLab, Bitbucket, or local) directly to Nostr relays:',
  gistsRepoMigrationWebTitle: '2. Browse & Collaborate on GitWorkshop.dev',
  gistsRepoMigrationWebDesc: 'GitWorkshop.dev is a decentralized, sovereign web UI for browsing Nostr Git repositories, reviewing patches, opening PRs, and tracking issues over NIP-34.',
  btnOpenGitWorkshop: 'Open GitWorkshop.dev',
  btnViewNgit: 'View ngit on GitHub',

  // Dry Run & Event Inspector
  dryRunBadge: 'Dry Run Mode',
  dryRunButton: 'Dry Run (Inspect Events)',
  dryRunTitle: 'Dry Run: Inspect Generated Nostr Events',
  dryRunSubtitle: 'Preview all unsigned events before signing or broadcasting ({count} events generated).',
  tabRenderedPreview: 'Rendered Preview',
  tabRawContent: 'Raw Content',
  tabNostrJson: 'Nostr JSON',
  copyJson: 'Copy JSON',
  copiedJson: 'Copied JSON to clipboard!',
  copyContent: 'Copy Content',
  copiedContent: 'Copied content to clipboard!',
  copyAllEventsJson: 'Copy All Events (JSON)',
  downloadJson: 'Download JSON',
  proceedMigration: 'Proceed with Migration',
  dryRunNoSelection: 'Please select at least one item to perform a dry run.',
  inspectRowEvent: 'Inspect Event',

  // General Action Helpers
  all: 'All',
  save: 'Save',
  dismiss: 'Dismiss',
  dryRun: 'Dry Run',

  // Instagram Migration Wizard
  instagramImporterTitle: 'Instagram to Nostr Picture Posts',
  instagramImporterSubtitle: 'Transfer your Instagram photos, carousels, and videos into decentralized NIP-68 (Kind 20) picture events. Re-host media assets onto Blossom servers and publish directly to Nostr relays.',
  instagramStep1Title: '1. Export & Upload',
  instagramStep1Desc: 'Export your media in JSON format from Meta Account Center and upload your archive.',
  instagramStep2Title: '2. Review & Select',
  instagramStep2Desc: 'Inspect photos, carousel slides, hashtags, and select which posts to transfer.',
  instagramStep3Title: '3. Blossom & Broadcast',
  instagramStep3Desc: 'Re-host images on decentralized Blossom servers and publish NIP-68 (Kind 20) picture events.',
  instagramResumeTitle: 'Incomplete Instagram Migration Found',
  instagramResumeDesc: '{done} of {total} posts already published to relays.',
  instagramResumeBtn: 'Resume Transfer',
  instagramUploadTab: 'Upload Data Export',
  instagramDropArchiveTitle: 'Drag & drop Instagram export folder or JSON (posts_1.json, posts.json, reels.json)',
  instagramDropArchiveDesc: 'Supports unzipped Meta Account Center export folders with media or standalone JSON export files',
  instagramSelectFolderBtn: 'Select Export Folder',
  instagramSelectFileBtn: 'Select JSON File',
  instagramFilterPhotos: 'Photos',
  instagramFilterCarousels: 'Carousels',
  instagramFilterVideos: 'Videos & Reels',
  instagramFilterStories: 'Stories',
  instagramSelectCategory: 'Select Category',
  instagramDeselectCategory: 'Deselect Category',
  instagramConvertHeicLabel: 'Convert HEIC/HEIF to JPEG for universal Nostr compatibility',
  instagramConvertHeicDesc: 'Converts Apple photos to high-compatibility JPEG in your browser before uploading to Blossom, ensuring all web and mobile Nostr clients can display them.',
  instagramIncludePosts: 'Include Photos (Posts)',
  instagramIncludeCarousels: 'Include Carousels (Albums)',
  instagramIncludeReels: 'Include Reels (Videos)',
  instagramIncludeStories: 'Include Stories',
  instagramSearchPlaceholder: 'Search captions or #hashtags...',
  instagramBlossomSettingsTitle: 'Blossom Decentralized Media Storage',
  instagramUploadBlossomLabel: 'Re-host images on Blossom media servers (Kind 24242 / NIP-98)',
  instagramUploadBlossomDesc: 'Instagram CDN URLs expire over time. Re-hosting to Blossom keeps your picture posts permanently decentralized on Nostr.',
  instagramNostrSettingsTitle: 'Nostr Picture Post Standard',
  instagramDeletePrevLabel: 'Delete previously published picture posts first (NIP-09 Kind 5)',
  instagramSelectedSummary: '{count} of {total} posts selected for transfer',
  instagramDownloadBackupBtn: 'Download Backup (.jsonl)',
  instagramStartMigrationBtn: 'Transfer to Nostr (Kind 20)',
  instagramProgressTitle: 'Transferring Instagram Posts to Nostr...',
  instagramBackupDownloaded: 'Downloaded Nostr Kind 20 backup bundle.',
  instagramArchiveLoaded: 'Successfully loaded posts from Instagram archive.',
  instagramOptimizingPreviews: 'Preparing photo previews: {current}/{total} ({percent}%)',
  instagramHeicDetectedTitle: 'HEIC Photos Detected ({count} files)',
  instagramHeicDetectedDesc: 'Your export contains {count} Apple HEIC photos. Decoding and converting high-resolution HEIC files is computationally intensive. Pre-converting gallery previews is optional: you can convert them one-by-one in a background worker now, or skip this step and let them convert automatically on-the-fly during migration.',
  instagramConvertHeicBtn: 'Convert HEIC Photos for Gallery',
  instagramCancelConversionBtn: 'Stop Conversion',
  instagramHeicWorkerNotice: 'Runs 1 file at a time in a background Web Worker with bounded RAM usage.',
  instagramAttachVideoFile: 'Attach Video File ({filename})',
  instagramAttachMediaDesc: 'Select the offline media file from your export to preview and upload',
  instagramMediaLinked: 'Linked {count} media assets to existing posts.',
  instagramMediaMissingAlert: '{count} posts need media files (photos/videos)',
  instagramMediaMissingDesc: 'The loaded export contains post metadata, but media assets were not linked yet. Select your media folder to enable previews and Blossom uploads.',
  instagramLinkMediaBtn: 'Link Media Folder',
  instagramLinkFilesBtn: 'Select Media Files',
  instagramUnsupportedFormat: 'Please upload an Instagram export folder or JSON file (posts_1.json, posts.json, reels.json).',

  // LinkedIn Articles Migration Wizard
  linkedinImporterTitle: 'LinkedIn Articles to Nostr Long-Form Content',
  linkedinImporterSubtitle: 'Migrate your long-form LinkedIn Pulse articles into sovereign NIP-23 (Kind 30023) articles. Convert rich HTML to Markdown, preserve cover banners, and upload media to decentralized Blossom servers.',
  linkedinGuideTitle: 'How to Export Your Articles from LinkedIn',
  linkedinGuideShort: 'Export your long-form articles archive directly from your LinkedIn account privacy settings.',
  linkedinStep1Title: 'Go to Data Privacy Settings',
  linkedinStep1Desc: 'Click your profile picture > Settings & Privacy > Data privacy > Get a copy of your data.',
  linkedinStep2Title: 'Select Articles & Request Archive',
  linkedinStep2Desc: 'Choose "Want something in particular? > Articles" (or download the full archive) and click "Request archive".',
  linkedinStep3Title: 'Upload the ZIP Archive or HTML Files',
  linkedinStep3Desc: 'LinkedIn will email you a download link. Drop the downloaded .zip archive or individual article .html files below.',
  linkedinDropzoneTitle: 'Drag & drop LinkedIn export ZIP archive or HTML article files here',
  linkedinDropzoneSubtitle: 'or click to browse files from your computer',
  linkedinDropzoneSupport: 'Supports LinkedIn data archive ZIP files (.zip), Article HTML files (.html), and CSV exports (.csv)',
  linkedinArticlesLoaded: 'Articles Loaded',
  noArticlesFound: 'No articles match your search or filter criteria.',
  showInstructions: 'Show Export Instructions',
  hideInstructions: 'Hide Instructions',
  changeFile: 'Change File',
  summary: 'Summary / Excerpt',
  tags: 'Topics & Hashtags',
  publishedDate: 'Published Date',

  // Hub & Subpage Navigation
  hubFilterAll: 'All Sources',
  hubFilterBooksMedia: 'Books & Cinema',
  hubFilterPublishing: 'Blogs & Articles',
  hubFilterCode: 'Code & Gists',
  hubFilterSocial: 'Photos & Social',
  breadcrumbHome: 'Home',
  breadcrumbHub: 'Migration Hub',
  allImporters: 'All Importers',
  launchImporter: 'Launch Importer',
  switchTool: 'Switch Importer Tool:',
  activeWorkbench: 'Active Migration Workbench',
  backToHub: 'Back to Migration Hub',
  searchImportersPlaceholder: 'Search migration tools (e.g. Goodreads, WordPress, Gists)...',
  noImportersFound: 'No migration tools found matching your search.',
};

export type TranslationKey = keyof typeof en;

