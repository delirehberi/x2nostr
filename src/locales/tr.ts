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
  appDittoTitle: 'Ditto.pub',
  appDittoDesc: 'Nostr protokolü tarafından desteklenen merkeziyetsiz sosyal ağ ve uzun format yayın platformu.',
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
  appGitWorkshopTitle: 'GitWorkshop',
  appGitWorkshopDesc: 'Nostr üzerinde merkeziyetsiz kod iş birliği. Depoları inceleyin, yamaları (PR) gözden geçirin ve NIP-34 ile sorunları takip edin.',
  openApp: 'Uygulamayı Aç',

  // Navigation Links
  navHome: 'Ana Sayfa',
  navImporters: 'Taşıma Merkezi',
  navGettingStarted: 'Başlangıç',
  navDocs: 'Dokümanlar',
  navSupport: 'Destek',
  configureRelays: 'Röleleri Yapılandır',
  relaysSummary: '{count} Aktif Röle',
  userProfile: 'Kullanıcı Profili',

  // Ecosystem Categories
  catBooks: 'Kitaplar ve Okuma',
  catSocialBlogs: 'Sosyal Ağlar ve Bloglar',
  catPublishing: 'Yayıncılık ve Medya',
  catSocialMobile: 'Sosyal Mobil Uygulamalar',
  catSocialMedia: 'Sosyal ve Medya',
  catWebMobile: 'Web ve Mobil',
  catMusic: 'Müzik ve Podcast',
  catVideo: 'Canlı Yayın ve Video',
  catCodeGit: 'Kod ve Git (NIP-34)',

  // Documentation Hub
  docsTitle: 'Nostr Bilgi Bankası ve Rehberler',
  docsSubtitle: 'Egemen anahtar yönetimi, NIP-07 eklentileri, NIP-51 listeleri, Amber bunker ve veri taşıma hakkında detaylı rehberler.',
  doc1Title: '1. Nostr Anahtar Güvenliği ve Egemen Kimlik',
  doc1Summary: 'Kriptografik açık (npub) ve özel (nsec) anahtarların geleneksel şifrelerin ve merkezi platform girişlerinin yerini nasıl aldığını öğrenin.',
  doc2Title: '2. Android\'de Amber Bunker (NIP-46) Yapılandırması',
  doc2Summary: 'Amber\'ı uzak imzalayıcı bunker olarak kullanarak özel anahtarınızı üçüncü taraf web sitelerine ve uygulamalara göstermeden işlem imzalayın.',
  doc3Title: '3. Goodreads\'ten Bookstr\'a (NIP-51 & NIP-32) Taşıma Rehberi',
  doc3Summary: 'Goodreads CSV ayrıştırma, Open Library kapak zenginleştirme ve Bookstr okuma listesi indeksleme rehberi.',
  doc4Title: '4. IMDb & Letterboxd Puanlarını Nostr Sinema Listelerine Aktarma',
  doc4Summary: 'Film izleme listenizi ve puan arşivlerinizi NIP-51 sinema listelerine ve NIP-32 incelemelerine dönüştürün.',
  doc5Title: '5. NIP-23 Uzun Format Yayıncılık (Ditto.pub & Yakihonne)',
  doc5Summary: 'Hugo, Ghost ve WordPress blog yazılarını egemen NIP-23 içerik etkinliklerine dönüştürme rehberi.',
  doc6Title: '6. Dijital Özgürlüğün Kullanım Kılavuzu: x2nostr Dokümantasyonu Neden Var?',
  doc6Summary: 'Yıllardır merkezi platformlarda biriktirdiğimiz verileri Nostr protokolüne taşırken neden şeffaf ve güçlü bir dokümantasyona ihtiyaç duyduk?',

  // Documentation Body Contents (Turkish)
  doc1Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Nostr Kriptografik Anahtar Çiftlerini Anlamak</h3>
    <p>Kimliğinizin şirket sunucularında saklanan e-posta ve şifrelere bağlı olduğu geleneksel sosyal ağların (Twitter, Goodreads, IMDb) aksine Nostr, standart <strong>schnorr imza anahtar çiftlerini</strong> (secp256k1) kullanır.</p>
    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">Anahtar Çifti Genel Bakış:</h4>
      <ul class="list-disc list-inside space-y-1 text-xs text-purple-950">
        <li><strong>npub (Açık Genel Anahtar):</strong> Evrensel Nostr adresinizdir (kullanıcı adı veya cüzdan adresi gibi). Herkesle özgürce paylaşabilirsiniz.</li>
        <li><strong>nsec (Gizli Özel Anahtar):</strong> Kriptografik imzalama gizli anahtarınızdır. <em>nsec anahtarınızı ASLA hiçbir web sitesi veya kişiyle paylaşmayın.</em></li>
      </ul>
    </div>
    <h4 class="font-bold text-slate-900">Önerilen Tarayıcı Eklentileri (NIP-07):</h4>
    <p>Nostr web uygulamalarına <code>nsec</code> anahtarınızı yapıştırmadan güvenle giriş yapmak için bir NIP-07 tarayıcı eklentisi yükleyin:</p>
  </div>`,

  doc2Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Android'de Amber Bunker (NIP-46) Yapılandırması</h3>
    <p><strong>Amber</strong>, korumalı bir Nostr imzalayıcısı (bunker) olarak çalışan açık kaynaklı bir Android uygulamasıdır. <code>nsec</code> gizli anahtarınızı telefonunuzun güvenli kasasında tutarak mobil uygulamaların ham anahtarınıza erişmeden işlem imzalamasını sağlar.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900">Amber Uzak İmzalama Nasıl Çalışır:</h4>
      <ol class="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
        <li>Amber uygulamasını GitHub veya F-Droid üzerinden indirin.</li>
        <li><code>nsec</code> anahtarınızı Amber içine aktarın veya yeni bir anahtar oluşturun.</li>
        <li>Nostr istemcilerini (Amethyst veya NIP-46 bağlantı dizili web uygulamaları) açtığınızda <strong>Amber ile İmzala</strong> seçeneğini belirleyin.</li>
        <li>Amber, imzalamadan önce işlem türünü ve içeriğini gösteren bir onay ekranı açacaktır.</li>
      </ol>
    </div>
  </div>`,

  doc3Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Goodreads'ten Bookstr'a Taşıma Rehberi</h3>
    <p>Goodreads kütüphanenizi taşımak, standart kitap dışa aktarımlarını egemen Nostr liste etkinliklerine ve puanlama incelemelerine dönüştürür.</p>
    <h4 class="font-bold text-slate-900">Hedef Protokol Özellikleri:</h4>
    <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-700">
      <li><strong>Kind 30003 (NIP-51 Yer İmi Setleri):</strong> <code>read</code>, <code>currently-reading</code> ve <code>to-read</code> etiketli derlenmiş kitap listeleri.</li>
      <li><strong>Bookstr Yerel Listeleri (Kinds 10073, 10074, 10075):</strong> ISBN etiketleri (<code>["k", "isbn"]</code>) ve kapak üstverileri içeren indekslenmiş raflar.</li>
      <li><strong>Kind 31985 (NIP-32 İncelemeleri):</strong> 1-5 yıldız puanı, kişisel notlar ve zaman damgaları içeren değiştirilebilir inceleme etkinlikleri.</li>
    </ul>
  </div>`,

  doc4Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">IMDb ve Letterboxd Puanlarını Nostr Sinema Listelerine Aktarma</h3>
    <p>IMDb veya Letterboxd üzerindeki film puanlarınızı ve izleme listelerinizi dışa aktarmak, açık kaynaklı Nostr film takipçileriyle uyumlu merkeziyetsiz film koleksiyon etkinlikleri oluşturur.</p>
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <h4 class="font-bold text-slate-900 font-mono text-xs">OMDb ile Meta Veri Zenginleştirme:</h4>
      <p class="text-xs text-slate-600">x2nostr, etkinlikleri bağlı rölelere imzalamadan önce yönetmen, yayın yılı, süre, afiş ve tür etiketlerini Open Movie Database (OMDb) üzerinden zenginleştirir.</p>
    </div>
  </div>`,

  doc5Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">NIP-23 Uzun Format Yayıncılık (Ditto.pub ve Yakihonne)</h3>
    <p>NIP-23, başlık etiketleri, özetler, yayın tarihleri ve kapak görselleri içeren Markdown formatındaki uzun içerik etkinliklerini (Kind <code>30023</code>) tanımlar.</p>
  </div>`,

  doc6Content: `<div class="space-y-4 leading-relaxed">
    <h3 class="text-xl font-bold text-slate-900">Dijital Özgürlüğün Kullanım Kılavuzu: x2nostr Dokümantasyonu Neden Var?</h3>
    <p>Daha önce <a href="https://blog.emre.xyz/posts/7492c6cf/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">Teknofeodalizm - Dijital Toprak Ağalığı</a> yazımda da bahsettiğim gibi; yıllardır internet üzerinde ürettiğimiz tüm içerikleri, okuduğumuz kitap listelerini, izlediğimiz filmleri ve yazdığımız yazıları merkezi platformların insafına terk etmiş durumdayız. <strong>Goodreads</strong>, <strong>Letterboxd</strong>, <strong>Spotify</strong>, <strong>Medium</strong> veya <strong>Twitter</strong>... Adına ne derseniz deyin, günün sonunda hepimiz bu platformların ücretsiz (veya verimizle ödediğimiz) kiracılarıyız. Ev sahibi bir gün algoritmayı değiştirdiğinde veya hesabınızı askıya aldığında, yılların birikimi bir anda yok olabiliyor.</p>
    <p>Bu veri gaspına karşı <a href="https://blog.emre.xyz/posts/nostr/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline hover:text-purple-800">Nostr protokolünü</a> ve açık protokollerin getirdiği özgürlüğü savunuyoruz. Ancak "Verini kurtar!" demek yetmiyor. İnsanların bu verileri nasıl taşıyacağını, arka planda hangi NIP'lerin (Nostr Implementation Possibilities) çalıştığını ve şifreleme mekanizmasını anlaması gerekiyor. İşte bu yüzden <a href="https://x2nostr.emre.xyz" class="text-purple-600 underline hover:text-purple-800">x2nostr (move-to-nostr)</a> dokümantasyon sayfasını tamamen açık bir rehbere dönüştürdük.</p>

    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
      <h4 class="font-bold text-purple-900">Dokümantasyon Neleri Kapsıyor?</h4>
      <ul class="list-disc list-inside space-y-1.5 text-xs text-purple-950">
        <li><strong>Gizlilik ve Güvenlik:</strong> x2nostr %100 tarayıcı içinde (<em>client-side sovereign</em>) çalışır. Tüm ayrıştırma, Open Library istekleri ve NIP-07 imzalama işlemleri tarayıcı sandbox'ınızda gerçekleşir. Sunucumuza tek bir bayt veri gitmez.</li>
        <li><strong>Hangi NIP Nerede Kullanılıyor?:</strong> Kitap ve sinema listeleriniz <code>NIP-51</code> (Kind <code>30003</code>), incelemeleriniz <code>NIP-32</code> (Kind <code>31985</code>) ve blog yazılarınız <code>NIP-23</code> (Kind <code>30023</code>) standartlarına dönüştürülür.</li>
        <li><strong>Açık Kaynak Katkı Kuralları:</strong> AI araçlarıyla katkıda bulunan geliştiriciler için <strong>500 satırlık diff sınırı</strong> getirerek kod incelemesini ve sürdürülebilirliği garantiye aldık.</li>
      </ul>
    </div>

    <p class="text-xs text-slate-500 pt-2">Daha fazla detay için <a href="https://blog.emre.xyz/posts/nostr-nasil-gidiyor/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Nostr Nasıl Gidiyor?</a> ve <a href="https://blog.emre.xyz/posts/0d64aa67/" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Hugo2Nostr</a> yazılarımı inceleyebilirsiniz.</p>
  </div>`,


  // Newbie Guide & Keygen
  btnNewbieGuide: 'Yeni Başlayanlar Rehberi',
  newbieGuideTitle: 'Yeni Başlayanlar İçin Nostr Rehberi',
  newbieGuideSubtitle: 'Nostr protokolünü anlamanız, egemen anahtarınızı oluşturmanız ve verilerinizi sorunsuz taşımanız için ihtiyacınız olan her şey.',
  newbieStep1Title: '1. Anahtarınızı Oluşturun veya Bağlayın',
  newbieStep1Desc: 'Doğrudan tarayıcınızın güvenli ortamında yeni bir Nostr anahtar çifti oluşturun veya mevcut NIP-07 eklentinizi bağlayın.',
  generateKeyBtn: 'Yeni Nostr Anahtarı Oluştur (nsec/npub)',
  copyNsec: 'Özel Anahtarı Kopyala (nsec)',
  copyNpub: 'Genel Anahtarı Kopyala (npub)',
  keyGeneratedNotice: 'Anahtar çiftiniz başarıyla oluşturuldu! Lütfen nsec özel anahtarınızı bir şifre yöneticisine kopyalayıp hemen yedekleyin.',
  newbieStep2Title: '2. İmzalayıcılar ve Bunker (Amber, Eklentiler)',
  newbieStep2Desc: 'Masaüstünde NIP-07 tarayıcı eklentilerini (Alby, nos2x) veya Android\'de Amber\'ı (NIP-46 / NIP-55 uzak imzalayıcı bunker) kullanarak özel anahtarınızı web sitelerine göstermeden güvenle imzalayın.',
  whySovereigntyTitle: 'Neden Veri Egemenliği Önemli?',
  whySovereigntyDesc: 'Kriptografik özel anahtarınız kimliğinizin, okuma geçmişinizin ve incelemelerinizin tam mülkiyetini size verir. Hiçbir platform verilerinize el koyamaz veya sansürleyemez.',
  newbieStep3Title: '3. Verilerinizi İçe Aktarın',
  newbieStep3Desc: 'Goodreads (Kitaplar) veya IMDb/Letterboxd (Filmler ve Diziler) kütüphanelerinizi CSV dosyası olarak dışa aktarın ve Nostr rölelerine imzalayın.',
  newbieStep4Title: '4. Önerilen Uygulamaları Keşfedin',
  newbieStep4Desc: 'Taşınan verilerinize web ve mobilde önde gelen açık kaynaklı Nostr uygulamalarından erişin:',
  recMobileApps: 'Önerilen Mobil Uygulamalar: Damus (iOS), Amethyst (Android), Primal (iOS & Android)',
  recWebApps: 'Önerilen Web Uygulamaları: Bookstr.xyz (Kitaplar), Ditto.pub & Yakihonne (Bloglar), Primal.net (Sosyal Ağ)',

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
  blogsName: 'WordPress (WXR XML)',
  blogsDesc: 'WordPress blog yazılarınızı otomatik Markdown dönüştürme ve Blossom medya yüklemeleri ile egemen NIP-23 uzun yazılara aktarın.',
  blogsTarget: 'NIP-23 Uzun Yazılar (Kind 30023)',
  
  linkedinName: 'LinkedIn Makaleleri',
  linkedinDesc: 'Uzun formatlı LinkedIn Pulse makalelerinizi zengin Markdown biçimlendirmesi ve Blossom medya barındırma ile egemen NIP-23 içerik etkinliklerine aktarın.',
  linkedinTarget: 'NIP-23 Uzun Yazılar (Kind 30023)',
  
  gistsName: 'GitHub Gists',
  gistsDesc: 'GitHub Gist\'lerinizi ve kod parçacıklarınızı merkeziyetsiz NIP-C0 (Kind 1337) kod etkinliklerine ve NIP-44 ile şifrelenmiş özel parçacıklara aktarın.',
  gistsTarget: 'NIP-C0 Kod Parçacıkları (Kind 1337) & NIP-44 Şifreli (Kind 30078)',
  
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
  footerCommunity: 'Bir {link} topluluk girişimidir',
  footerBuiltWith: 'TypeScript, Tailwind CSS, Hono ve nostr-tools ile inşa edildi.',
  footerAuthor: '{author} tarafından 💜 ile geliştirildi',
  sourceCode: 'Kaynak Kod',
  githubRepo: 'GitHub Deposu',
  gitWorkshopRepo: 'Nostr Deposu (GitWorkshop)',
  viewExampleRepo: 'x2nostr\'ı GitWorkshop\'ta Görün',
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

  // WordPress Migration Wizard
  wpImporterTitle: 'WordPress (WXR XML) -> Nostr Makaleleri',
  wpImporterSubtitle: 'WordPress blog yazılarınızı egemen NIP-23 uzun yazılara aktarın. HTML içeriğini otomatik olarak Markdown formatına dönüştürür ve resimlerinizi Blossom sunucularına yükler.',
  wpDropzoneTitle: 'WordPress WXR dışa aktarım dosyanızı buraya sürükleyip bırakın',
  wpDropzoneSubtitle: 'veya bilgisayarınızdan dosya seçmek için tıklayın',
  wpDropzoneSupport: 'Standart WordPress XML dışa aktarım dosyalarını destekler (.xml, .wxr)',
  wpPostsLoaded: 'Yazı Yüklendi',
  wpFilterPublished: 'Yayınlananlar',
  wpFilterDrafts: 'Taslaklar',
  wpColCategories: 'Kategoriler & Etiketler',
  wpColMedia: 'Medya Varlıkları',
  wpOptBlossomTitle: 'Yazı görsellerini Blossom sunucularına yükle (NIP-98 / Kind 24242)',
  wpOptBlossomDesc: 'Satır içi görselleri ve kapak resimlerini çıkarır, Blossom yetkilendirme başlıklarını imzalar ve Markdown resim bağlantılarını günceller.',
  wpBlossomServersLabel: 'Blossom Sunucuları (Virgülle Ayrılmış)',
  wpOptDeleteTitle: 'Önce daha önce aktarılan blog yazılarını sil (NIP-09 Kind 5)',
  wpOptDeleteDesc: 'Yeni aktarımdan önce önceki Kind 30023 makalelerini kaldırmak için bir silme etkinliği yayınlar.',
  wpSyncTipTitle: 'Anlık Canlı Senkronizasyon mu Arıyorsunuz?',
  wpSyncTipDesc: 'x2nostr, WXR dışa aktarım dosyalarından toplu aktarım için tasarlanmıştır. Canlı WordPress sitenizden Nostr rölelerine sürekli anlık çapraz paylaşım yapmak istiyorsanız, {link} eklentisini deneyebilirsiniz.',
  postrPluginName: 'Postr for Nostr WordPress Eklentisi',

  // GitHub Gists Migration Wizard
  gistsStep1Title: '1. GitHub / Gist Bağlantısı',
  gistsStep1Desc: 'GitHub kullanıcı adınızı veya belirli bir Gist URL\'sini girin ya da yerel kod dosyalarını yükleyin.',
  gistsStep2Title: '2. Önizleme & Seçim',
  gistsStep2Desc: 'Kod dosyası adlarını, programlama dillerini, genel/özel gizlilik durumlarını ve kod içeriklerini inceleyin.',
  gistsStep3Title: '3. İmzala & Yayınla',
  gistsStep3Desc: 'Genel NIP-C0 etkinliklerini ve NIP-44 ile kendinize şifrelenmiş özel kod parçacıklarını Nostr\'a imzalayın.',
  gistsImporterTitle: 'GitHub Gist\'leri ve Kod Parçacıklarını Nostr\'a Aktarın',
  gistsImporterSubtitle: 'GitHub Gist\'lerinizi ve kod parçacıklarınızı merkeziyetsiz Nostr etkinliklerine dönüştürün. Genel parçacıklar NIP-C0 (Kind 1337) olarak yayınlanır, gizli/özel Gist\'ler ise NIP-44 (Kind 30078) ile şifrelenir.',
  gistsFetchTab: 'GitHub Gists API',
  gistsUploadTab: 'Kod / JSON Yükle',
  githubUsernameLabel: 'GitHub Kullanıcı Adı veya Gist URL',
  githubUsernamePlaceholder: 'örn. torvalds veya https://gist.github.com/alice/12345',
  githubTokenLabel: 'GitHub Kişisel Erişim Belirteci (İsteğe Bağlı)',
  githubTokenPlaceholder: 'ghp_... (oran sınırını 5000/saat yapar ve gizli Gist\'leri dahil eder)',
  githubFetchBtn: 'Gist\'leri Getir',
  githubFetching: 'GitHub\'dan getiriliyor...',
  rateLimitRemaining: '{limit} istekten {remaining} tanesi kaldı ({time} saatinde sıfırlanır)',
  gistsDropzoneTitle: 'Kod dosyalarını (.js, .py, .rs, .ts vb.) veya Gist JSON dışa aktarımını buraya sürükleyip bırakın',
  gistsDropzoneSubtitle: 'veya bilgisayarınızdan dosya seçmek için tıklayın',
  gistsDropzoneSupport: 'Kaynak kod dosyalarını ve JSON kod parçacığı dizilerini destekler',
  gistsFound: 'Kod Parçacığı Yüklendi',
  filterPublic: 'Genel Parçacıklar',
  filterSecret: 'Gizli / Özel',
  colSnippetName: 'Parçacık & Dosya Adı',
  colLanguage: 'Dil',
  colPrivacy: 'Gizlilik',
  colSize: 'Boyut',
  colSource: 'Kaynak',
  badgePublic: 'Genel',
  badgeSecret: 'Gizli',
  markAsSecret: 'Seçilenleri Gizli Yap 🔒',
  markAsPublic: 'Seçilenleri Genel Yap 🌐',
  previewCode: 'Kodu Önizle',
  noSnippetsFound: 'Mevcut filtre veya arama kriterleriyle eşleşen kod parçacığı bulunamadı.',
  optGenerateKind1337: 'Genel Parçacıkları NIP-C0 Kod Etkinliği Olarak Yayınla (Kind 1337)',
  optGenerateKind1337Desc: 'Nostr kod istemcileri için dil, dosya adı ve açıklama etiketlerine sahip standart kod parçacığı etkinlikleri yayınlar.',
  optEncryptPrivate: 'Gizli Gist\'leri NIP-44 ile Şifrele (Kind 30078)',
  optEncryptPrivateDesc: 'Gizli Gist\'leri yalnızca özel anahtarınızı (nsec) elinde bulunduran sizin çözüp okuyabileceğiniz şekilde şifreler.',
  optDefaultLicense: 'Varsayılan SPDX Lisansı',
  optDefaultRuntime: 'Çalışma Zamanı / Ortam (İsteğe Bağlı)',
  optDeletePreviousGists: 'Önce daha önce aktarılan kod parçacıklarını sil (NIP-09 Kind 5)',
  optDeletePreviousGistsDesc: 'Önceki Kind 1337 ve Kind 30078 parçacık etkinliklerini kaldırmak için silme istekleri yayınlar.',
  gistsMigrationCompleted: 'Gist ve Kod Parçacığı Aktarımı Başarıyla Tamamlandı!',
  gistsMigrationCompletedDesc: 'Kod parçacıklarınız imzalandı ve Nostr rölelerine yayınlandı.',
  gistsResumeBannerDescription: '{total} parçacıktan {completed} tanesi zaten içe aktarıldı',
  secretGistsNoticeTitle: 'GitHub Gizli (Secret) Gist\'lerini İçe Aktarma',
  secretGistsNoticeDesc: 'GitHub API\'si, gizli (unlisted) Gist\'leri toplu kullanıcı listelerinde döndürmez. Gizli Gist\'leri içe aktarmak için doğrudan Gist URL\'lerini veya kimliklerini (virgülle veya alt alta) belirtecinizle birlikte giriş alanına yapıştırabilir ya da aşağıdaki tablodan herhangi bir parçacığın gizlilik rozetine tıklayarak Gizli olarak işaretleyebilirsiniz.',

  // Git Repositories Migration Callout (GitWorkshop & ngit)
  gistsRepoMigrationTitle: 'Tam GitHub, GitLab veya Bitbucket Depolarını mı Aktarmak İstiyorsunuz?',
  gistsRepoMigrationSubtitle: 'NIP-34 standardı ile Git depolarınızı, commit geçmişlerinizi, dallarınızı ve PR\'larınızı Nostr üzerinde merkeziyetsizleştirin.',
  gistsRepoMigrationDesc: 'x2nostr bağımsız kod parçacıklarını ve Gist\'leri doğrudan tarayıcınızda aktarır (NIP-C0 Kind 1337 & NIP-44 Kind 30078). Tam commit geçmişi, dallar, yamalar (PR) ve sorun takibi içeren eksiksiz Git depolarını aktarmak ve yönetmek için NIP-34 tabanlı egemen Nostr Git ekosistemini kullanabilirsiniz:',
  gistsRepoMigrationNgitTitle: '1. Depoları ngit Komut Satırı ile Gönderin',
  gistsRepoMigrationNgitDesc: 'Mevcut herhangi bir Git deposunu (GitHub, GitLab, Bitbucket veya yerel) doğrudan Nostr rölelerine başlatmak, senkronize etmek ve göndermek için resmi ngit CLI aracını kullanın:',
  gistsRepoMigrationWebTitle: '2. GitWorkshop.dev Üzerinde İnceleyin ve İş Birliği Yapın',
  gistsRepoMigrationWebDesc: 'GitWorkshop.dev; Nostr Git depolarını taramak, yamaları gözden geçirmek, PR açmak ve sorunları takip etmek için geliştirilmiş merkeziyetsiz bir web arayüzüdür.',
  btnOpenGitWorkshop: 'GitWorkshop.dev\'i Aç',
  btnViewNgit: 'ngit CLI\'yı GitHub\'da Görüntüle',

  // Dry Run & Event Inspector
  dryRunBadge: 'Deneme Modu (Dry Run)',
  dryRunButton: 'Deneme Modu (Olayları İncele)',
  dryRunTitle: 'Deneme Modu: Üretilen Nostr Olaylarını İncele',
  dryRunSubtitle: 'İmzalamadan ve rölelere göndermeden önce tüm imzasız olayları önizleyin ({count} olay oluşturuldu).',
  tabRenderedPreview: 'Görsel Önizleme',
  tabRawContent: 'Ham İçerik',
  tabNostrJson: 'Nostr JSON',
  copyJson: 'JSON Kopyala',
  copiedJson: 'JSON panoya kopyalandı!',
  copyContent: 'İçeriği Kopyala',
  copiedContent: 'İçerik panoya kopyalandı!',
  copyAllEventsJson: 'Tüm Olayları Kopyala (JSON)',
  downloadJson: 'JSON Olarak İndir',
  proceedMigration: 'Aktarımı Başlat',
  dryRunNoSelection: 'Lütfen deneme çalıştırması yapmak için en az bir öğe seçin.',
  inspectRowEvent: 'Olayı İncele',

  // General Action Helpers
  all: 'Tümü',
  save: 'Kaydet',
  dismiss: 'Kapat',
  dryRun: 'Deneme Çalıştırması',

  // Instagram Migration Wizard
  instagramImporterTitle: 'Instagram Gönderilerini Nostr Resim Olaylarına Aktarma',
  instagramImporterSubtitle: 'Instagram fotoğraflarınızı, kaydırmalı albümlerinizi ve videolarınızı merkeziyetsiz NIP-68 (Kind 20) resim olaylarına dönüştürün. Medya varlıklarını Blossom sunucularında barındırın ve doğrudan Nostr rölelerine yayınlayın.',
  instagramStep1Title: '1. Dışa Aktar ve Yükle',
  instagramStep1Desc: 'Meta Hesaplar Merkezi üzerinden medyanızı JSON formatında dışa aktarın ve arşivinizi yükleyin.',
  instagramStep2Title: '2. İncele ve Seç',
  instagramStep2Desc: 'Fotoğrafları, albüm slaytlarını, etiketleri inceleyin ve aktarılacak gönderileri seçin.',
  instagramStep3Title: '3. Blossom ve Yayınla',
  instagramStep3Desc: 'Görselleri merkeziyetsiz Blossom sunucularına yükleyin ve NIP-68 (Kind 20) resim olayları olarak yayınlayın.',
  instagramResumeTitle: 'Tamamlanmamış Instagram Aktarımı Bulundu',
  instagramResumeDesc: '{done} / {total} gönderi zaten rölelere başarıyla yayınlandı.',
  instagramResumeBtn: 'Aktarımı Sürdür',
  instagramUploadTab: 'Veri İndirme Arşivi Yükle',
  instagramDropArchiveTitle: 'Instagram dışa aktarma JSON dosyasını (posts_1.json) sürükleyip bırakın',
  instagramDropArchiveDesc: 'veya bilgisayarınızdaki Meta Veri İndirme arşiv dosyalarına göz atmak için tıklayın',
  instagramFilterPhotos: 'Fotoğraflar',
  instagramFilterCarousels: 'Albümler',
  instagramFilterVideos: 'Videolar',
  instagramSearchPlaceholder: 'Açıklamalarda veya #etiketlerde ara...',
  instagramBlossomSettingsTitle: 'Blossom Merkeziyetsiz Medya Depolama',
  instagramUploadBlossomLabel: 'Görselleri Blossom medya sunucularına yükle (Kind 24242 / NIP-98)',
  instagramUploadBlossomDesc: 'Instagram CDN bağlantılarının süresi zamanla dolar. Blossom üzerine yüklemek, fotoğraflarınızı Nostr üzerinde kalıcı olarak merkeziyetsiz kılar.',
  instagramNostrSettingsTitle: 'Nostr Resim Gönderisi Standardı',
  instagramDeletePrevLabel: 'Daha önce aktarılan resim gönderilerini önce sil (NIP-09 Kind 5)',
  instagramSelectedSummary: '{count} / {total} gönderi aktarım için seçildi',
  instagramDownloadBackupBtn: 'Yedeği İndir (.jsonl)',
  instagramStartMigrationBtn: "Nostr'a Aktar (Kind 20)",
  instagramProgressTitle: 'Instagram Gönderileri Nostr Resim Olaylarına Aktarılıyor...',
  instagramBackupDownloaded: 'Nostr Kind 20 yedek paketi indirildi.',
  instagramArchiveLoaded: 'Instagram arşivinden gönderiler başarıyla yüklendi.',
  instagramUnsupportedFormat: 'Lütfen geçerli bir Instagram dışa aktarım dosyası (posts_1.json) yükleyin.',

  // LinkedIn Articles Migration Wizard
  linkedinImporterTitle: 'LinkedIn Makalelerini Nostr Uzun Yazılarına Aktar',
  linkedinImporterSubtitle: 'Uzun formatlı LinkedIn Pulse makalelerinizi egemen NIP-23 (Kind 30023) yazılarına dönüştürün. Zengin HTML\'i Markdown\'a çevirin, kapak görsellerini koruyun ve medyayı merkeziyetsiz Blossom sunucularına yükleyin.',
  linkedinGuideTitle: 'LinkedIn Makalelerinizi Nasıl Dışa Aktarırsınız?',
  linkedinGuideShort: 'Uzun makale arşivinizi doğrudan LinkedIn hesap gizlilik ayarlarınızdan dışa aktarın.',
  linkedinStep1Title: 'Veri Gizliliği Ayarlarına Gidin',
  linkedinStep1Desc: 'Profil resminize tıklayın > Ayarlar ve Gizlilik > Veri gizliliği > Verilerinizin bir kopyasını alın.',
  linkedinStep2Title: 'Makaleleri Seçin ve Arşiv İsteyin',
  linkedinStep2Desc: '"Belirli bir şey mi istiyorsunuz? > Makaleler" seçeneğini seçin (veya tam arşivi indirin) ve "Arşiv iste" düğmesine tıklayın.',
  linkedinStep3Title: 'ZIP Arşivini veya HTML Dosyalarını Yükleyin',
  linkedinStep3Desc: 'LinkedIn size indirme bağlantısı içeren bir e-posta gönderecektir. İndirilen .zip arşivini veya tekil .html dosyalarını aşağıya bırakın.',
  linkedinDropzoneTitle: 'LinkedIn dışa aktarım ZIP arşivini veya HTML makale dosyalarını buraya sürükleyip bırakın',
  linkedinDropzoneSubtitle: 'veya bilgisayarınızdan dosya seçmek için tıklayın',
  linkedinDropzoneSupport: 'LinkedIn veri arşivi ZIP dosyalarını (.zip), Makale HTML dosyalarını (.html) ve CSV dışa aktarımlarını (.csv) destekler',
  linkedinArticlesLoaded: 'Makale Yüklendi',
  noArticlesFound: 'Arama veya filtreleme kriterlerinize uygun makale bulunamadı.',
  showInstructions: 'Dışa Aktarma Yönergesini Göster',
  hideInstructions: 'Yönergeyi Gizle',
  changeFile: 'Dosyayı Değiştir',
  summary: 'Özet / Alıntı',
  tags: 'Konular ve Etiketler',
  publishedDate: 'Yayın Tarihi',
};

