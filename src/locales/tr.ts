import { TranslationKey } from './en';

export const tr: Record<TranslationKey, string> = {
  // App & Navigation
  appTitle: 'x2nostr — Nostr\'a Taşı',
  appTagline: 'Veri egemenliğinizi geri kazanın. Kütüphanenizi, incelemelerinizi ve gönderilerinizi merkezi platformlardan merkeziyetsiz Nostr protokolüne aktarın.',
  connectNostr: 'Nostr ile Bağlan',
  connecting: 'Bağlanıyor...',
  connected: 'Bağlandı',
  fetchingProfile: 'Profil yükleniyor...',
  disconnect: 'Bağlantıyı Kes',
  extensionNotFound: 'Nostr eklentisi bulunamadı. Lütfen Alby, nos2x veya başka bir NIP-07 eklentisi yükleyin.',
  activeRelays: 'Aktif Röleler',
  relaysConfig: 'Röle Yapılandırması',
  language: 'Dil',
  
  // Hero & Manifesto
  heroBadge: '⚡ %100 Egemen & İstemci Taraflı',
  heroTitle: 'Kapalı Bahçelerden Kurtulun.',
  heroTitleHighlight: 'Nostr\'a Geçin.',
  heroSubtitle: 'Merkezi platformlar anılarınızı, incelemelerinizi, okuma geçmişinizi ve sosyal ağınızı kapalı silolara kilitler. x2nostr, verilerinizi dışa aktarmanızı ve doğrudan Nostr rölelerine kriptografik olarak imzalamanızı sağlar — arka uç yok, takip yok, tam mülkiyet.',
  getStarted: 'Taşımayı Başlat',
  exploreEcosystem: 'Ekosistemi Keşfet',
  
  // Manifesto Cards ("Why Nostr?")
  whyNostrTitle: 'Neden Verilerinizi Nostr\'a Taşımalısınız?',
  whyNostrSubtitle: 'Web 2.0 şirket silolarının aksine Nostr size kriptografik güvenceler sunar.',
  feature1Title: 'Gerçek Veri Egemenliği',
  feature1Desc: 'Okuma geçmişiniz ve incelemeleriniz özel anahtarınızla imzalanır. Seçtiğiniz izinsiz rölelerde saklanır.',
  feature2Title: 'Sansür Direnci',
  feature2Desc: 'Hiçbir şirket hesabınızı kapatamaz, okuma geçmişinizi silemez veya incelemelerinizi gizlice değiştiremez.',
  feature3Title: 'Evrensel Kimlik (npub)',
  feature3Desc: 'Tek bir Nostr genel anahtarı sizi okuma uygulamalarına, sosyal ağlara, bloglara, ses ve video platformlarına bağlar.',
  feature4Title: 'Lightning Zap\'leri & Değer',
  feature4Desc: 'Kitap incelemeleriniz ve makaleleriniz üzerinden doğrudan Lightning cüzdanınıza anlık Bitcoin mikro-bahşişleri (zap) alın.',
  feature5Title: 'Sıfır Bilgili Gizlilik',
  feature5Desc: 'Tüm ayrıştırma, meta veri çözümleme ve imzalama işlemleri tamamen tarayıcınızda çalışır. Sunucuda kayıt tutulmaz.',
  feature6Title: 'Açık Ekosistem Uyumluluğu',
  feature6Desc: 'Aktarılan veriler Bookstr, Habla, Damus, Amethyst, Primal ve tüm standart Nostr istemcilerinde anında çalışır.',

  // Ecosystem Section
  ecosystemTitle: 'Nostr Uygulama Evreni',
  ecosystemSubtitle: 'Verileriniz Nostr rölelerine yayınlandığında, bu açık kaynaklı istemcilerde anında okunabilir ve etkileşime geçilebilir hale gelir.',
  appBookstrTitle: 'Bookstr',
  appBookstrDesc: 'Nostr üzerinde inşa edilmiş merkeziyetsiz okuma takipçisi, kitaplık yöneticisi ve kitap inceleme sosyal ağı (NIP-51 Listeleri, Kinds 10073-10075 & 31985).',
  appHablaTitle: 'Habla.news',
  appHablaDesc: 'Yerel Lightning para kazanma özelliğiyle NIP-23 içerik etkinlikleriyle desteklenen merkeziyetsiz uzun blog platformu.',
  appYakihonneTitle: 'Yakihonne',
  appYakihonneDesc: 'Nostr yazarları için zengin özelliklere sahip uzun formatlı yayın portalı, medya kürasyonu ve akıllı bileşenler.',
  appDamusTitle: 'Damus (iOS)',
  appDamusDesc: 'Sorunsuz Zap entegrasyonu ve şık tasarımıyla iPhone ve iPad için harika, hızlı, yerel Nostr istemcisi.',
  appAmethystTitle: 'Amethyst (Android)',
  appAmethystDesc: 'Kapsamlı NIP desteği ve medya oynatıcısıyla Android için önde gelen açık kaynaklı Nostr sosyal istemcisi.',
  appPrimalTitle: 'Primal (Web / Mobil)',
  appPrimalDesc: 'Entegre cüzdan, portföy takibi ve yüksek performanslı önbelleğe alma özelliğine sahip süper hızlı Nostr istemcisi.',
  appWavelakeTitle: 'Wavelake',
  appWavelakeDesc: 'Müzisyenlerin Lightning aracılığıyla değer karşılığı değer kazandığı merkeziyetsiz müzik ve podcast yayın platformu.',
  appZapStreamTitle: 'ZapStream',
  appZapStreamDesc: 'Gerçek zamanlı sohbet, zap\'ler ve merkeziyetsiz yayın dağıtımı ile Nostr üzerinde canlı yayın platformu.',
  openApp: 'Uygulamayı Aç',

  // Importer Catalog Menu
  importersTitle: 'Taşıma Merkezi',
  importersSubtitle: 'Egemen veri taşımanıza başlamak için bir veri kaynağı seçin.',
  statusActive: 'Aktif & Hazır',
  statusBeta: 'Beta',
  statusComingSoon: 'Yakında',
  targetNip: 'Hedef Protokol',

  // Goodreads Importer Plugin
  goodreadsName: 'Goodreads\'ten Bookstr\'a',
  goodreadsDesc: 'Goodreads kitap kütüphanenizi, özel raflarınızı, yıldız puanlarınızı, okuma tarihlerinizi ve incelemelerinizi doğrudan Bookstr\'a aktarın.',
  goodreadsTarget: 'NIP-51 (Kind 30003), Bookstr (Kinds 10073-10075) & Kind 31985 İncelemeler',
  
  // Movies & TV Importer Plugin
  moviesName: 'Filmler ve Diziler (Open Movie Database)',
  moviesDesc: 'İzleme listenizi, puanlarınızı ve film incelemelerinizi merkeziyetsiz sinema listelerine ve topluluk değerlendirmelerine aktarın.',
  moviesTarget: 'NIP-51 Sinema Listeleri (Kind 30003) & Kind 31985 İncelemeler',
  
  // Coming Soon Importers
  blogsName: 'Uzun Format Bloglar',
  blogsDesc: 'Hugo, Ghost, WordPress veya Blogger arşivlerinizi Habla ve Yakihonne için egemen NIP-23 makalelerine dönüştürün.',
  blogsTarget: 'NIP-23 Uzun Format (Kind 30023)',
  
  imdbName: 'Film ve Dizi Takipçisi',
  imdbDesc: 'İzleme listenizi, puanlarınızı ve film incelemelerinizi merkeziyetsiz film listelerine ve topluluk incelemelerine aktarın.',
  imdbTarget: 'NIP-51 Sinema Listeleri & Kind 31985 İncelemeler',
  
  letterboxdName: 'Letterboxd Günlüğü',
  letterboxdDesc: 'Letterboxd günlüğünüzü, izlenen filmlerinizi, inceleme kayıtlarınızı ve özel sinema listelerinizi Nostr\'a taşıyın.',
  letterboxdTarget: 'NIP-51 Film Listeleri & Puanlama Etkinlikleri',
  
  twitterName: 'Twitter / X Arşivi',
  twitterDesc: 'Twitter veri arşivinizi içe aktarın ve en iyi tweet dizilerinizi Nostr ana notları ve yanıtları olarak yeniden oluşturun.',
  twitterTarget: 'NIP-01 Kısa Notlar (Kind 1)',
  
  instagramName: 'Instagram Fotoğrafları',
  instagramDesc: 'Fotoğraf arşivlerinizi merkeziyetsiz Blossom/NIP-96 medya sunucularına aktarın ve resim gönderileri yayınlayın.',
  instagramTarget: 'NIP-68 Resim Gönderileri (Kind 20)',
  
  spotifyName: 'Spotify Çalma Listeleri',
  spotifyDesc: 'Kaydedilen çalma listelerinizi ve favori parçalarınızı Wavelake ve Stemstr üzerindeki merkeziyetsiz koleksiyonlara aktarın.',
  spotifyTarget: 'NIP-51 Müzik Listeleri (Kind 30001)',

  // Goodreads Migration Wizard
  step1Title: '1. Goodreads\'ten Dışa Aktar',
  step1Desc: 'Goodreads > My Books > Import and export yolunu izleyin ve "Export Library" butonuna tıklayın. Bir CSV dosyası inecektir.',
  step2Title: '2. Yükle ve Önizle',
  step2Desc: 'Goodreads CSV dosyanızı aşağıya bırakın. Kitaplarınızı ayrıştıracak, formülleri temizleyecek ve Open Library kapaklarını eşleştireceğiz.',
  step3Title: '3. İmzala ve Yayınla',
  step3Desc: 'Raflarınızı seçin, NIP-07 eklentinizi bağlayın ve egemen listelerinizi Nostr ağına imzalayın.',

  // Upload Area
  dropzoneTitle: 'Goodreads CSV dışa aktarma dosyanızı buraya sürükleyip bırakın',
  dropzoneSubtitle: 'veya bilgisayarınızdan dosya seçmek için tıklayın',
  dropzoneSupport: 'Standart Goodreads kütüphane CSV dışa aktarımlarını destekler (goodreads_library_export.csv)',
  processingCsv: 'CSV dosyası ayrıştırılıyor...',
  sampleCsvLink: 'Örnek Goodreads CSV indir',

  // Table & Preview
  booksFound: 'Yüklenen Kitaplar',
  filterAll: 'Tüm Kitaplar',
  filterRead: 'Okunanlar',
  filterCurrentlyReading: 'Şu An Okunanlar',
  filterToRead: 'Okunacaklar',
  filterUnrated: 'Puansızlar',
  searchPlaceholder: 'Başlık, yazar veya ISBN ile arayın...',
  selectAll: 'Tümünü Seç',
  deselectAll: 'Seçimi Temizle',
  selectedCount: '{count} / {total} seçildi',
  colCover: 'Kapak',
  colTitleAuthor: 'Başlık & Yazar',
  colShelf: 'Raf',
  colRating: 'Puanım',
  colDateRead: 'Okuma Tarihi',
  colIsbn: 'ISBN',
  colOpenLibrary: 'Open Library',
  noBooksFound: 'Mevcut filtre veya arama kriterlerine uygun kitap bulunamadı.',
  fetchingMetadata: 'Open Library meta verileri çözümleniyor...',
  metadataReady: 'Meta veri zenginleştirildi',
  enrichmentProgress: 'Open Library meta verisi zenginleştiriliyor ({current}/{total})...',
  enrichmentCompleted: 'Open Library meta verileri zenginleştirildi ({current}/{total})',
  
  // Migration Controls & Options
  migrationOptionsTitle: 'Taşıma Ayarları',
  optGenerateLists: 'Kitap Listelerini Yayınla (NIP-51 Kind 30003 & Bookstr Kinds 10073-10075: "read", "currently-reading", "to-read")',
  optGenerateListsDesc: 'Coracle, Nostrudel, Bookstr.xyz ve tüm NIP-51 istemcileriyle tam uyumlu egemen kategorize listeler oluşturur.',
  optGenerateReviews: 'Bireysel İnceleme ve Puanlama Etkinliklerini Yayınla (Kind 31985)',
  optGenerateReviewsDesc: 'Kişisel notlarınızı içeren kitaplar için zaman damgalı bağımsız puan ve inceleme etkinlikleri yayınlar.',
  optDeletePreviousReviews: 'Önceki inceleme etkinliklerini sil (NIP-09 Kind 5)',
  optDeletePreviousReviewsDesc: 'Yeniden aktarmadan önce önceki inceleme etkinliklerini kaldırmak için rölelerinize kriptografik silme isteği yayınlar.',
  confirmDeleteModalTitle: 'Önceki İncelemelerin Silinmesini Onayla',
  confirmDeleteModalDesc: 'Bu işlem, bu hesap için daha önce yayınlanan kitap incelemelerini silmek üzere rölelerinize NIP-09 (Kind 5) silme etkinliği yayınlayacaktır. Devam etmek istiyor musunuz?',
  confirmDeleteModalConfirm: 'Evet, Sil ve Yeniden Aktar',
  confirmDeleteModalCancel: 'Vazgeç',
  startMigration: 'Nostr\'a Taşımayı Başlat',
  pauseMigration: 'Duraklat',
  resumeMigration: 'Devam Et',
  cancelMigration: 'İptal Et',
  migrationCompleted: 'Taşıma Başarıyla Tamamlandı!',
  migrationCompletedDesc: 'Kitaplarınız ve listeleriniz imzalanıp Nostr rölelerine yayınlandı. Kütüphanenizi artık Bookstr üzerinde görüntüleyebilirsiniz!',
  viewOnBookstr: 'Kütüphaneyi Bookstr.xyz\'de Görüntüle',
  
  // Progress & Status
  signingNotice: 'Lütfen Nostr tarayıcı eklentinizdeki imza onay isteklerini onaylayın.',
  currentProgress: 'İşleniyor: {current} / {total} (%{percent})',
  currentlyProcessing: 'Şu an işleniyor: {title}',
  successCount: '{count} başarılı',
  failedCount: '{count} başarısız',
  timeRemaining: 'Tahmini kalan süre: {time}',

  // Activity Log Console
  activityLogTitle: 'Canlı Taşıma Günlüğü Konsolu',
  clearLogs: 'Günlükleri Temizle',
  exportLogs: 'Günlük Dosyasını İndir',
  noLogsYet: 'Ayrıştırma, meta veri zenginleştirme ve röle yayını sırasında işlem günlükleri burada akacaktır.',

  // Coming Soon Modal
  comingSoonTitle: '{name} İçe Aktarıcı',
  comingSoonBadge: 'Geliştirme Aşamasında',
  comingSoonDesc: 'Bu taşıma modülü Faz {phase} yol haritamızda yer almaktadır. Lansmanı hızlandırmak için Nostr sohbetine katılın veya GitHub\'da katkıda bulunun!',
  roadmapStage: 'Yol Haritası Aşaması: {stage}',
  targetEvents: 'Hedef Nostr Etkinlikleri: {events}',
  notifyMe: 'Yol Haritasını Gör',
  closeModal: 'Kapat',

  // Relay Modal
  relayModalTitle: 'Nostr Röle Yapılandırması',
  relayModalDesc: 'x2nostr imzalı etkinliklerinizi doğrudan bu rölelere yayınlar. Kendi favori rölelerinizi ekleyebilirsiniz.',
  addRelayPlaceholder: 'wss://role.ornek.com',
  addRelayBtn: 'Röle Ekle',
  removeRelay: 'Kaldır',
  relayConnected: 'Bağlandı',
  relayConnecting: 'Bağlanıyor',
  relayError: 'Bağlantı başarısız',

  // Footer
  footerTagline: 'Açık internet için merkeziyetsiz, egemen veri taşıma platformu.',
  footerClientSideOnly: '🔒 Sıfır sunucu kaydı. Tüm veri işleme ve kriptografik imzalama işlemleri yalnızca tarayıcınızda gerçekleşir.',
  footerBuiltWith: 'TypeScript, Tailwind CSS, Hono ve nostr-tools ile inşa edildi.',
  footerAuthor: '{author} tarafından 💜 ile geliştirildi',
  githubRepo: 'GitHub Deposu',
  roadmapLink: 'Yol Haritası',

  // Resume Banner
  resumeBannerTitle: 'Önceki içe aktarma tespit edildi',
  resumeBannerDescription: '{total} kitabın {completed} tanesi zaten aktarıldı',
  resumeBannerResume: 'Devam Et',
  resumeBannerFresh: 'Baştan Başla',
  resumeBannerFreshWarning: 'Baştan başlamak, bağlı Nostr rölelerinizdeki raf ve inceleme etkinliklerinizi yeniden yayınlayacak ve güncelleyecektir.',
  resumeBannerFreshConfirm: 'Evet, baştan başla',
  resumeBannerFreshCancel: 'İptal',

  // Movies & TV Migration Wizard
  moviesStep1Title: '1. Puanlarınızı Dışa Aktarın',
  moviesStep1Desc: 'Film takip platformunuzdan puanlarınızı veya izleme listenizi CSV dosyası olarak dışa aktarın.',
  moviesStep2Title: '2. Yükle ve Önizle',
  moviesStep2Desc: 'Film CSV dosyanızı aşağıya bırakın. Başlıklarınızı, puanlarınızı (1-10), türleri ve yönetmenleri ayrıştıracağız.',
  moviesStep3Title: '3. İmzala ve Yayınla',
  moviesStep3Desc: 'Nostr eklentinizi bağlayın, liste ayarlarını yapılandırın ve egemen sinema etkinliklerinizi rölelere imzalayın.',

  // Movies Upload Area
  moviesDropzoneTitle: 'Film puanları CSV dışa aktarma dosyanızı buraya sürükleyip bırakın',
  moviesDropzoneSubtitle: 'veya bilgisayarınızdan dosya seçmek için tıklayın',
  moviesDropzoneSupport: 'Standart film puanları ve izleme listesi CSV dışa aktarımlarını destekler',

  // Movies Table & Filters
  filterMovies: 'Filmler',
  filterTvSeries: 'Diziler',
  filterTvEpisodes: 'Bölümler',
  filterHighRated: 'Yüksek Puanlılar (8-10★)',
  colTitleMedia: 'Başlık & Yıl',
  colType: 'Tür',
  colDirector: 'Yönetmen / Yapımcı',
  colGenres: 'Kategoriler',
  colRuntime: 'Süre',
  colOmdbId: 'Eser Kimliği',
  noMoviesFound: 'Mevcut filtreye veya arama kriterlerine uyan film veya dizi bulunamadı.',

  // Movies Migration Controls & Options
  optGenerateMovieLists: 'Derlenmiş Sinema & Dizi Listesini Yayınla (NIP-51 Kind 30003)',
  optGenerateMovieListsDesc: 'Puanlanan film ve dizilerinizin Coracle, Nostrudel ve NIP-51 istemcileriyle uyumlu egemen kategorize listelerini oluşturur.',
  optGenerateMovieReviews: 'Bireysel Puanlama ve İnceleme Etkinliklerini Yayınla (Kind 31985)',
  optGenerateMovieReviewsDesc: 'Her başlık için zengin film üstverileri içeren bireysel zaman damgalı NIP-32 puanlama etkinlikleri (1-10 ölçeğinde) yayınlar.',
  optDeletePreviousMovieReviews: 'Önce daha önce yayınlanmış film inceleme etkinliklerini sil (NIP-09 Kind 5)',
  optDeletePreviousMovieReviewsDesc: 'Temiz içe aktarmadan önce önceki film inceleme etkinliklerini kaldırmak için kriptografik bir silme isteği yayınlar.',
  confirmDeleteMovieModalTitle: 'Önceki Film İncelemelerinin Silinmesini Onaylayın',
  confirmDeleteMovieModalDesc: 'Bu işlem, bu hesap için daha önce yayınlanan film incelemelerini silmek üzere rölelerinize bir NIP-09 (Kind 5) silme etkinliği yayınlayacaktır. Devam etmek istediğinizden emin misiniz?',
  moviesMigrationCompleted: 'Film ve Dizi Aktarımı Başarıyla Tamamlandı!',
  moviesMigrationCompletedDesc: 'Film puanlarınız ve derlenen listeleriniz imzalanarak Nostr rölelerine yayınlandı.',
  moviesResumeBannerDescription: '{total} başlıktan {completed} tanesi zaten içe aktarıldı',
};
