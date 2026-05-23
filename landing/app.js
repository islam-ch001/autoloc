// ============================================================
// AutoLoc Landing — Traductions FR/AR + Mode clair/sombre
// ============================================================

const TRANSLATIONS = {
  fr: {
    'title': 'AutoLoc — Gestion de location de voitures pour l\'Algérie',
    'meta.desc': 'Logiciel professionnel pour agences de location de voitures. Gérez véhicules, clients, chauffeurs, réservations et contrats.',
    'nav.features': 'Fonctionnalités',
    'nav.pricing': 'Tarifs',
    'nav.screenshots': 'Aperçu',
    'nav.download': 'Télécharger',
    'nav.webapp': 'Accéder à l\'app web →',
    'pricing.eyebrow': 'Tarifs simples et transparents',
    'pricing.title': 'Choisissez l\'offre qui vous convient',
    'pricing.sub': 'Aucun frais caché. Payez une fois pour la version Windows, ou abonnez-vous pour la version cloud.',
    'pricing.win.tag': 'Achat unique',
    'pricing.win.title': 'AutoLoc Windows',
    'pricing.win.desc': 'L\'application complète hors-ligne, sur votre PC pour toujours.',
    'pricing.win.once': 'Paiement unique · Pas d\'abonnement',
    'pricing.win.f1': '✓ Toutes les fonctionnalités',
    'pricing.win.f2': '✓ Licence à vie',
    'pricing.win.f3': '✓ Mises à jour gratuites',
    'pricing.win.f4': '✓ 100% hors-ligne',
    'pricing.win.f5': '✓ Données privées (SQLite)',
    'pricing.win.f6': '✓ Support technique inclus',
    'pricing.win.cta': 'Acheter & télécharger',
    'pricing.web.tag': 'Bientôt disponible',
    'pricing.web.title': 'AutoLoc Cloud',
    'pricing.web.desc': 'Application web accessible partout, synchronisée en temps réel sur tous vos appareils.',
    'pricing.web.price': 'Sur devis',
    'pricing.web.subtitle': 'Abonnement mensuel · Tarifs à venir',
    'pricing.web.f1': '✓ Accessible depuis le web',
    'pricing.web.f2': '✓ Synchro multi-utilisateurs',
    'pricing.web.f3': '✓ Sauvegardes automatiques',
    'pricing.web.f4': '✓ Optimisé mobile',
    'pricing.web.f5': '✓ Sans installation',
    'pricing.web.f6': '✓ Mises à jour automatiques',
    'pricing.web.cta': 'Contactez-nous →',
    'pricing.note': '💬 Une question sur les tarifs ? <a href="https://wa.me/213554214999" target="_blank" rel="noopener">Contactez-nous sur WhatsApp</a>',
    'hero.badge': 'Conçu pour les agences algériennes',
    'hero.title1': 'Le système',
    'hero.title2': 'tout-en-un',
    'hero.title3': 'pour votre agence de location de voitures',
    'hero.sub': 'Gérez vos véhicules, clients, chauffeurs, réservations, retours et contrats — depuis le web ou votre PC, en ligne ou hors-ligne. Sans complication.',
    'hero.cta.download': 'Télécharger pour Windows',
    'hero.cta.web': 'Essayer la version web →',
    'hero.meta.1': '✓ Installeur Windows 81 MB',
    'hero.meta.2': '✓ Pas d\'abonnement requis',
    'hero.meta.3': '✓ Données 100% privées',
    'stats.1.label': 'Modules intégrés',
    'stats.2.label': 'Langues (FR / AR)',
    'stats.3.label': 'Hors-ligne (desktop)',
    'stats.4.label': 'Véhicules / clients',
    'features.eyebrow': 'Fonctionnalités',
    'features.title': 'Tout ce qu\'il faut pour gérer une agence',
    'features.sub': '7 modules connectés entre eux, pensés pour les agences de location de voitures en Algérie.',
    'f1.title': 'Gestion de flotte',
    'f1.desc': 'Suivez chaque véhicule : marque, modèle, immatriculation, kilométrage, statut (disponible / loué / maintenance), photo, prix journalier.',
    'f2.title': 'Fichier clients',
    'f2.desc': 'Coordonnées, permis, historique de locations, total dépensé. Recherche instantanée. Statut actif / inactif.',
    'f3.title': 'Chauffeurs',
    'f3.desc': 'Vos employés chauffeurs avec permis, expiration, tarif journalier, salaire mensuel. Assignables aux réservations.',
    'f4.title': 'Réservations',
    'f4.desc': 'Création en quelques clics : client + véhicule + chauffeur + dates → prix calculé. Statuts à venir / actif / terminé. Disponibilité vérifiée.',
    'f5.title': 'Retours & dépassements',
    'f5.desc': 'Saisissez kilométrage retour, carburant, état, dommages. Le système calcule automatiquement les frais kilométriques excédentaires.',
    'f6.title': 'Maintenance',
    'f6.desc': 'Historique des interventions par véhicule. Rappels automatiques pour les prochaines maintenances (date ou kilométrage).',
    'f7.title': 'Contrats & Factures PDF',
    'f7.desc': 'Génération automatique de contrats de location (8 articles légaux) et factures imprimables, au format A4.',
    'f8.title': 'Mode sombre & clair',
    'f8.desc': 'Interface adaptable : mode sombre élégant ou mode clair épuré. Bilingue Français/Arabe avec RTL automatique.',
    'platforms.eyebrow': 'Deux plateformes, une expérience',
    'platforms.title': 'Web ou Desktop — vous choisissez',
    'pf.web.title': 'Version Web',
    'pf.web.desc': 'Accessible partout via votre navigateur. Synchronisée en temps réel sur tous vos appareils.',
    'pf.web.f1': '✓ Aucune installation requise',
    'pf.web.f2': '✓ Accessible depuis n\'importe où',
    'pf.web.f3': '✓ Synchro multi-utilisateurs',
    'pf.web.f4': '✓ Optimisé mobile + tablette',
    'pf.web.f5': '✓ Mises à jour automatiques',
    'pf.web.cta': 'Ouvrir l\'app web →',
    'pf.desktop.tag': 'Recommandé pour usage local',
    'pf.desktop.title': 'Application Windows',
    'pf.desktop.desc': 'Application native qui fonctionne entièrement hors-ligne. Vos données restent sur votre ordinateur.',
    'pf.desktop.f1': '✓ 100% hors-ligne',
    'pf.desktop.f2': '✓ Données locales privées (SQLite)',
    'pf.desktop.f3': '✓ Pas d\'abonnement',
    'pf.desktop.f4': '✓ Démarrage instantané (~2s)',
    'pf.desktop.f5': '✓ Tout AutoLoc dans un seul .exe',
    'pf.desktop.cta': 'Télécharger pour Windows',
    'ss.eyebrow': 'Aperçu',
    'ss.title': 'Une interface claire, conçue pour aller vite',
    'ss.sub': 'Vue tableau de bord, gestion des véhicules, calendrier des réservations.',
    'ss.cap1': '📊 Tableau de bord avec KPIs',
    'ss.cap2': '🚗 Gestion de flotte avec photos',
    'ss.cap3': '📅 Calendrier des réservations',
    'dl.title': 'Téléchargez AutoLoc pour Windows',
    'dl.sub': 'Application 100% hors-ligne. Toutes vos données restent privées sur votre ordinateur.',
    'dl.cta': 'Télécharger AutoLoc-Setup.exe',
    'dl.free': '🆓 Gratuit',
    'faq.eyebrow': 'Questions fréquentes',
    'faq.title': 'FAQ',
    'faq.q1': 'L\'application est-elle vraiment gratuite ?',
    'faq.a1': 'Oui, AutoLoc est gratuit. L\'application Windows est entièrement gratuite avec toutes les fonctionnalités. La version web propose un essai gratuit et un abonnement mensuel pour l\'accès cloud.',
    'faq.q2': 'Mes données sont-elles en sécurité ?',
    'faq.a2': 'Avec l\'application Windows : 100% de vos données restent sur votre ordinateur (base SQLite locale). Personne d\'autre n\'y a accès. Avec la version web : les données sont chiffrées et stockées sur des serveurs sécurisés européens.',
    'faq.q3': 'Faut-il une connexion Internet ?',
    'faq.a3': 'Non pour l\'application Windows : elle fonctionne entièrement hors-ligne. Oui pour la version web (forcément). Vous pouvez utiliser les deux à la fois.',
    'faq.q4': 'Combien d\'utilisateurs / véhicules / clients je peux gérer ?',
    'faq.a4': 'Aucune limite. Vous pouvez ajouter autant de véhicules, clients, chauffeurs, réservations que vous voulez.',
    'faq.q5': 'L\'application est-elle en arabe ?',
    'faq.a5': 'Oui ! AutoLoc est bilingue Français / Arabe avec support RTL (droite-à-gauche) complet. Vous pouvez basculer entre les deux langues à tout moment.',
    'faq.q6': 'Comment imprimer un contrat de location ?',
    'faq.a6': 'Depuis la page Réservations, cliquez sur « Contrat » à côté d\'une réservation. Un contrat de location au format A4 (avec 8 articles légaux) s\'ouvre et peut être imprimé ou enregistré en PDF.',
    'cta.title': 'Prêt à digitaliser votre agence ?',
    'cta.sub': 'Commencez aujourd\'hui — gratuit et sans inscription pour la version desktop.',
    'cta.btn1': '⬇️ Télécharger Windows',
    'cta.btn2': '🌐 Essayer la version web',
    'footer.tagline': 'Le système tout-en-un pour les agences de location de voitures.',
    'footer.h1': 'Produit',
    'footer.l1': 'Fonctionnalités',
    'footer.l2': 'Télécharger',
    'footer.l3': 'App web',
    'footer.h3': 'Contact',
    'footer.copy': '© 2026 AutoLoc · Tous droits réservés',
    'toggle.theme': 'Mode clair',
    'toggle.lang': 'العربية',
  },
  ar: {
    'title': 'أوتولوك — برنامج إدارة تأجير السيارات',
    'meta.desc': 'برنامج احترافي لوكالات تأجير السيارات. أدر السيارات والعملاء والسائقين والحجوزات والعقود.',
    'nav.features': 'الميزات',
    'nav.pricing': 'الأسعار',
    'nav.screenshots': 'لقطات الشاشة',
    'nav.download': 'تحميل',
    'nav.webapp': '← الوصول إلى التطبيق',
    'pricing.eyebrow': 'أسعار بسيطة وشفافة',
    'pricing.title': 'اختر الباقة التي تناسبك',
    'pricing.sub': 'بدون رسوم خفية. ادفع مرة واحدة لإصدار ويندوز، أو اشترك في الإصدار السحابي.',
    'pricing.win.tag': 'شراء لمرة واحدة',
    'pricing.win.title': 'أوتولوك ويندوز',
    'pricing.win.desc': 'التطبيق الكامل بدون اتصال، على حاسوبك للأبد.',
    'pricing.win.once': 'دفعة واحدة · بدون اشتراك',
    'pricing.win.f1': '✓ جميع الميزات',
    'pricing.win.f2': '✓ ترخيص مدى الحياة',
    'pricing.win.f3': '✓ تحديثات مجانية',
    'pricing.win.f4': '✓ 100% بدون إنترنت',
    'pricing.win.f5': '✓ بيانات خاصة (SQLite)',
    'pricing.win.f6': '✓ الدعم الفني مشمول',
    'pricing.win.cta': 'اشتر وحمّل',
    'pricing.web.tag': 'قريباً',
    'pricing.web.title': 'أوتولوك السحابي',
    'pricing.web.desc': 'تطبيق ويب يمكن الوصول إليه من أي مكان، متزامن في الوقت الفعلي على جميع أجهزتك.',
    'pricing.web.price': 'حسب الطلب',
    'pricing.web.subtitle': 'اشتراك شهري · الأسعار قريباً',
    'pricing.web.f1': '✓ متاح عبر الويب',
    'pricing.web.f2': '✓ مزامنة متعددة المستخدمين',
    'pricing.web.f3': '✓ نسخ احتياطية تلقائية',
    'pricing.web.f4': '✓ محسّن للهاتف',
    'pricing.web.f5': '✓ بدون تثبيت',
    'pricing.web.f6': '✓ تحديثات تلقائية',
    'pricing.web.cta': '← تواصل معنا',
    'pricing.note': '💬 سؤال عن الأسعار؟ <a href="https://wa.me/213554214999" target="_blank" rel="noopener">تواصل معنا على واتساب</a>',
    'hero.badge': 'مصمم لوكالات التأجير الجزائرية',
    'hero.title1': 'النظام',
    'hero.title2': 'الشامل',
    'hero.title3': 'لإدارة وكالة تأجير سياراتك',
    'hero.sub': 'أدر سياراتك وعملاءك وسائقيك وحجوزاتك وعقودك من الويب أو حاسوبك — متصلاً أو بدون إنترنت. بدون تعقيد.',
    'hero.cta.download': 'تحميل لويندوز',
    'hero.cta.web': '← جرب الإصدار الإلكتروني',
    'hero.meta.1': '✓ مثبت ويندوز 81 ميغابايت',
    'hero.meta.2': '✓ بدون اشتراك مطلوب',
    'hero.meta.3': '✓ بياناتك خاصة 100%',
    'stats.1.label': 'وحدات مدمجة',
    'stats.2.label': 'لغات (FR / AR)',
    'stats.3.label': 'بدون إنترنت (سطح المكتب)',
    'stats.4.label': 'سيارات / عملاء',
    'features.eyebrow': 'الميزات',
    'features.title': 'كل ما تحتاجه لإدارة وكالتك',
    'features.sub': '7 وحدات مترابطة، مصممة لوكالات تأجير السيارات في الجزائر.',
    'f1.title': 'إدارة الأسطول',
    'f1.desc': 'تتبع كل سيارة: العلامة، الطراز، اللوحة، الكيلومترات، الحالة (متوفرة / مؤجرة / صيانة)، الصورة، السعر اليومي.',
    'f2.title': 'ملف العملاء',
    'f2.desc': 'بيانات الاتصال، رخصة القيادة، تاريخ التأجير، المبلغ الإجمالي. بحث فوري. حالة نشط / غير نشط.',
    'f3.title': 'السائقون',
    'f3.desc': 'موظفوك السائقون مع الرخصة، تاريخ الانتهاء، التعرفة اليومية، الراتب الشهري. يمكن تعيينهم للحجوزات.',
    'f4.title': 'الحجوزات',
    'f4.desc': 'إنشاء بنقرات قليلة: عميل + سيارة + سائق + تواريخ ← السعر محسوب. حالات قادمة / نشطة / منتهية. تحقق من التوفر.',
    'f5.title': 'الإرجاع والتجاوزات',
    'f5.desc': 'أدخل كيلومترات الإرجاع، الوقود، الحالة، الأضرار. النظام يحسب تلقائياً رسوم الكيلومترات الزائدة.',
    'f6.title': 'الصيانة',
    'f6.desc': 'سجل التدخلات لكل سيارة. تذكيرات تلقائية للصيانة القادمة (التاريخ أو الكيلومترات).',
    'f7.title': 'العقود والفواتير PDF',
    'f7.desc': 'إنشاء تلقائي لعقود التأجير (8 مواد قانونية) والفواتير القابلة للطباعة بتنسيق A4.',
    'f8.title': 'الوضع الداكن والفاتح',
    'f8.desc': 'واجهة قابلة للتكيف: وضع داكن أنيق أو وضع فاتح. ثنائية اللغة فرنسي/عربي مع دعم RTL تلقائي.',
    'platforms.eyebrow': 'منصتان، تجربة واحدة',
    'platforms.title': 'ويب أو سطح المكتب — أنت تختار',
    'pf.web.title': 'الإصدار الإلكتروني',
    'pf.web.desc': 'يمكن الوصول إليه من أي مكان عبر متصفحك. متزامن في الوقت الفعلي على جميع أجهزتك.',
    'pf.web.f1': '✓ لا حاجة للتثبيت',
    'pf.web.f2': '✓ يمكن الوصول من أي مكان',
    'pf.web.f3': '✓ مزامنة متعددة المستخدمين',
    'pf.web.f4': '✓ محسّن للهاتف والجهاز اللوحي',
    'pf.web.f5': '✓ تحديثات تلقائية',
    'pf.web.cta': '← افتح التطبيق الإلكتروني',
    'pf.desktop.tag': 'موصى به للاستخدام المحلي',
    'pf.desktop.title': 'تطبيق ويندوز',
    'pf.desktop.desc': 'تطبيق أصلي يعمل بالكامل بدون اتصال. بياناتك تبقى على حاسوبك.',
    'pf.desktop.f1': '✓ بدون إنترنت 100%',
    'pf.desktop.f2': '✓ بيانات محلية خاصة (SQLite)',
    'pf.desktop.f3': '✓ بدون اشتراك',
    'pf.desktop.f4': '✓ تشغيل فوري (~2 ثانية)',
    'pf.desktop.f5': '✓ كل أوتولوك في ملف .exe واحد',
    'pf.desktop.cta': 'تحميل لويندوز',
    'ss.eyebrow': 'لقطات الشاشة',
    'ss.title': 'واجهة واضحة، مصممة للسرعة',
    'ss.sub': 'عرض لوحة التحكم، إدارة السيارات، تقويم الحجوزات.',
    'ss.cap1': '📊 لوحة تحكم مع مؤشرات الأداء',
    'ss.cap2': '🚗 إدارة الأسطول بالصور',
    'ss.cap3': '📅 تقويم الحجوزات',
    'dl.title': 'حمّل أوتولوك لويندوز',
    'dl.sub': 'تطبيق بدون اتصال 100%. كل بياناتك تبقى خاصة على حاسوبك.',
    'dl.cta': 'تحميل AutoLoc-Setup.exe',
    'dl.free': '🆓 مجاني',
    'faq.eyebrow': 'الأسئلة الشائعة',
    'faq.title': 'الأسئلة الشائعة',
    'faq.q1': 'هل التطبيق مجاني فعلاً؟',
    'faq.a1': 'نعم، أوتولوك مجاني. تطبيق ويندوز مجاني تماماً مع جميع الميزات. الإصدار الإلكتروني يقدم تجربة مجانية واشتراك شهري للوصول السحابي.',
    'faq.q2': 'هل بياناتي آمنة؟',
    'faq.a2': 'مع تطبيق ويندوز: 100% من بياناتك تبقى على حاسوبك (قاعدة بيانات SQLite محلية). لا أحد آخر يصل إليها. مع الإصدار الإلكتروني: البيانات مشفرة ومخزنة على خوادم أوروبية آمنة.',
    'faq.q3': 'هل أحتاج إلى اتصال إنترنت؟',
    'faq.a3': 'لا لتطبيق ويندوز: يعمل بالكامل بدون اتصال. نعم للإصدار الإلكتروني (بطبيعة الحال). يمكنك استخدام الاثنين معاً.',
    'faq.q4': 'كم عدد المستخدمين / السيارات / العملاء الذين يمكنني إدارتهم؟',
    'faq.a4': 'لا توجد حدود. يمكنك إضافة عدد غير محدود من السيارات والعملاء والسائقين والحجوزات.',
    'faq.q5': 'هل التطبيق بالعربية؟',
    'faq.a5': 'نعم! أوتولوك ثنائي اللغة فرنسي / عربي مع دعم RTL (من اليمين إلى اليسار) كامل. يمكنك التبديل بين اللغتين في أي وقت.',
    'faq.q6': 'كيف أطبع عقد إيجار؟',
    'faq.a6': 'من صفحة الحجوزات، انقر على "عقد" بجانب الحجز. يفتح عقد إيجار بتنسيق A4 (مع 8 مواد قانونية) ويمكن طباعته أو حفظه كملف PDF.',
    'cta.title': 'مستعد لرقمنة وكالتك؟',
    'cta.sub': 'ابدأ اليوم — مجاني وبدون تسجيل لإصدار سطح المكتب.',
    'cta.btn1': '⬇️ تحميل ويندوز',
    'cta.btn2': '🌐 جرب الإصدار الإلكتروني',
    'footer.tagline': 'النظام الشامل لوكالات تأجير السيارات.',
    'footer.h1': 'المنتج',
    'footer.l1': 'الميزات',
    'footer.l2': 'تحميل',
    'footer.l3': 'التطبيق الإلكتروني',
    'footer.h3': 'تواصل معنا',
    'footer.copy': '© 2026 أوتولوك · جميع الحقوق محفوظة',
    'toggle.theme': 'الوضع الفاتح',
    'toggle.lang': 'Français',
  },
};

// ─── Persistance & application des préférences ──────────────
const LS_LANG = 'autoloc_landing_lang';
const LS_THEME = 'autoloc_landing_theme';

function getLang() {
  const stored = localStorage.getItem(LS_LANG);
  if (stored === 'ar' || stored === 'fr') return stored;
  // Détection auto : si navigateur en arabe → AR par défaut
  return navigator.language?.startsWith('ar') ? 'ar' : 'fr';
}
function getTheme() {
  const stored = localStorage.getItem(LS_THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  // Détection auto : préférence système
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t['title'];
  document.querySelector('meta[name="description"]')?.setAttribute('content', t['meta.desc']);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      // si le contenu contient déjà du HTML (ex. <span class="primary">), on injecte en innerHTML
      el.innerHTML = t[key];
    }
  });
  // Met à jour le bouton lang
  document.getElementById('btn-lang-label').textContent = t['toggle.lang'];
  // Met à jour le bouton thème
  document.getElementById('btn-theme-label').textContent = t['toggle.theme'];
  localStorage.setItem(LS_LANG, lang);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_THEME, theme);
  // Texte du bouton selon le mode actuel
  const lang = getLang();
  const t = TRANSLATIONS[lang];
  const label = theme === 'light' ? (lang === 'ar' ? 'الوضع الداكن' : 'Mode sombre') : t['toggle.theme'];
  document.getElementById('btn-theme-label').textContent = label;
  // Met à jour l'icone
  const icon = document.getElementById('btn-theme-icon');
  icon.innerHTML = theme === 'light'
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'  // lune (pour passer au sombre)
    : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';  // soleil
}

// ─── Animations au scroll ──────────────────────────────────
function initScrollAnimations() {
  // Auto-attribuer data-animate aux elements importants
  const selectors = [
    '.section-eyebrow',
    '.section-title',
    '.section-sub',
    '.feature-card',
    '.platform-card',
    '.pricing-card',
    '.screenshot-card',
    '.faq-item',
    '.download-box',
    '.stat',
    '.pricing-note',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.hasAttribute('data-animate')) el.setAttribute('data-animate', '');
    });
  });

  // Marquer les grilles a stagger
  const grids = ['.features-grid', '.platforms-grid', '.pricing-grid', '.screenshots-grid', '.stats-grid'];
  grids.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('stagger'));
  });

  // Observer chaque element et lui ajouter is-visible quand il entre dans le viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);  // animer une seule fois
      }
    });
  }, {
    threshold: 0.12,           // 12% visible suffit pour declencher
    rootMargin: '0px 0px -50px 0px',  // declenche un peu avant l'apparition
  });

  // Observer tous les elements marques
  document.querySelectorAll('[data-animate], .stagger').forEach(el => observer.observe(el));
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang(getLang());
  applyTheme(getTheme());
  initScrollAnimations();

  document.getElementById('btn-lang').addEventListener('click', () => {
    const next = getLang() === 'fr' ? 'ar' : 'fr';
    applyLang(next);
    applyTheme(getTheme());  // refresh theme label too
  });
  document.getElementById('btn-theme').addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
});
