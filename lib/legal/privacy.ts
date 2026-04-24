// lib/legal/privacy.ts
// Contenuti Privacy Policy per ogni lingua
// La versione italiana è quella legalmente vincolante

export interface PrivacySection {
  title: string
  content: string
  list?: string[]
  listBold?: string[]
  extra?: string
  extraLink?: { href: string; text: string }
}

export interface PrivacyContent {
  title: string
  lastUpdated: string
  disclaimer: string
  sections: PrivacySection[]
}

const it: PrivacyContent = {
  title: 'Privacy Policy',
  lastUpdated: 'Ultimo aggiornamento: Aprile 2026',
  disclaimer: '',
  sections: [
    {
      title: '1. Chi siamo',
      content: 'VaultTransfer è un servizio di trasferimento file sicuro accessibile su vaultransfer.com. Il titolare del trattamento dei dati è il gestore del servizio, contattabile a privacy@vaultransfer.com.',
    },
    {
      title: '2. Dati che raccogliamo',
      content: 'Raccogliamo solo i dati strettamente necessari al funzionamento del servizio:',
      listBold: ['Indirizzo email', 'File caricati', 'Metadati dei trasferimenti', 'Dati di pagamento', 'Cookie tecnici', 'Cookie pubblicitari'],
      list: [
        'Indirizzo email — solo se scegli di registrarti o accedere',
        'File caricati — temporaneamente, fino alla scadenza del link',
        'Metadati dei trasferimenti — nome file, dimensione, data di scadenza',
        'Dati di pagamento — gestiti da Stripe, non li conserviamo noi',
        'Cookie tecnici — necessari per il funzionamento del sito (sessione utente)',
        'Cookie pubblicitari — Google AdSense, solo con il tuo consenso esplicito',
      ],
    },
    {
      title: '3. Come usiamo i tuoi dati',
      content: '',
      list: [
        'Per permetterti di caricare e condividere file',
        'Per gestire il tuo account e abbonamento',
        'Per inviarti il link magico di accesso',
        'Per eliminare automaticamente i file alla scadenza',
        'Per mostrare pubblicità contestuale (solo utenti Free, solo con consenso)',
      ],
    },
    {
      title: '4. Cookie e tracciamento',
      content: 'Utilizziamo i seguenti tipi di cookie:',
      listBold: ['Cookie tecnici', 'Cookie pubblicitari (Google AdSense)'],
      list: [
        'Cookie tecnici — strettamente necessari per il login e la sessione. Non richiedono consenso.',
        'Cookie pubblicitari (Google AdSense) — utilizzati per mostrare annunci pertinenti agli utenti Free. Richiedono il tuo consenso esplicito tramite il banner cookie.',
      ],
      extra: 'Puoi modificare le tue preferenze cookie in qualsiasi momento cancellando i dati del browser o contattandoci.',
    },
    {
      title: '5. Conservazione dei dati',
      content: 'I file vengono eliminati automaticamente alla scadenza del link (1, 7 o 30 giorni) sia dal database che dallo storage. I dati dell\'account vengono conservati finché l\'account è attivo. Puoi richiedere la cancellazione del tuo account in qualsiasi momento scrivendo a privacy@vaultransfer.com.',
    },
    {
      title: '6. Condivisione con terze parti',
      content: 'Non vendiamo i tuoi dati. Utilizziamo i seguenti servizi di terze parti:',
      listBold: ['Supabase', 'Vercel', 'Stripe', 'Google AdSense', 'Cloudflare'],
      list: [
        'Supabase — database e storage (server in Europa)',
        'Vercel — hosting dell\'applicazione (server USA con CDN globale)',
        'Stripe — gestione pagamenti (server USA/EU)',
        'Google AdSense — pubblicità contestuale (solo utenti Free con consenso)',
        'Cloudflare — DNS e protezione (server globali)',
      ],
    },
    {
      title: '7. I tuoi diritti (GDPR)',
      content: 'Se sei residente nell\'Unione Europea, hai diritto a:',
      list: [
        'Accedere ai tuoi dati personali',
        'Rettificare dati inesatti',
        'Richiedere la cancellazione dei dati ("diritto all\'oblio")',
        'Opporti al trattamento per fini pubblicitari',
        'Portabilità dei dati',
        'Revocare il consenso in qualsiasi momento',
      ],
      extra: 'Per esercitare questi diritti scrivi a privacy@vaultransfer.com. Risponderemo entro 30 giorni.',
    },
    {
      title: '8. Sicurezza',
      content: 'Tutti i trasferimenti avvengono su connessione HTTPS cifrata con TLS 1.3. I file sono archiviati in bucket privati accessibili solo tramite link firmati temporanei. Le password di protezione sono hashate con bcrypt a 12 round. Non è possibile accedere ai file senza il link univoco.',
    },
    {
      title: '9. Trasferimenti internazionali',
      content: 'Alcuni dei nostri fornitori (Vercel, Stripe) operano negli Stati Uniti. I trasferimenti di dati verso gli USA avvengono nel rispetto delle garanzie previste dal GDPR (Standard Contractual Clauses). I dati del database e dello storage sono ospitati in Europa tramite Supabase.',
    },
    {
      title: '10. Contatti e reclami',
      content: 'Per qualsiasi domanda sulla privacy scrivi a privacy@vaultransfer.com. Hai anche il diritto di presentare reclamo al Garante per la Protezione dei Dati Personali (garanteprivacy.it).',
    },
  ],
}

const en: PrivacyContent = {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: April 2026',
  disclaimer: 'Note: In case of discrepancies between translated versions, the Italian version shall prevail.',
  sections: [
    {
      title: '1. Who we are',
      content: 'VaultTransfer is a secure file transfer service accessible at vaultransfer.com. The data controller is the service operator, reachable at privacy@vaultransfer.com.',
    },
    {
      title: '2. Data we collect',
      content: 'We collect only the data strictly necessary for the service to function:',
      listBold: ['Email address', 'Uploaded files', 'Transfer metadata', 'Payment data', 'Technical cookies', 'Advertising cookies'],
      list: [
        'Email address — only if you choose to register or log in',
        'Uploaded files — temporarily, until the link expires',
        'Transfer metadata — file name, size, expiry date',
        'Payment data — managed by Stripe, we do not store it',
        'Technical cookies — necessary for the site to function (user session)',
        'Advertising cookies — Google AdSense, only with your explicit consent',
      ],
    },
    {
      title: '3. How we use your data',
      content: '',
      list: [
        'To allow you to upload and share files',
        'To manage your account and subscription',
        'To send you the magic login link',
        'To automatically delete files upon expiry',
        'To show contextual advertising (Free users only, with consent only)',
      ],
    },
    {
      title: '4. Cookies and tracking',
      content: 'We use the following types of cookies:',
      listBold: ['Technical cookies', 'Advertising cookies (Google AdSense)'],
      list: [
        'Technical cookies — strictly necessary for login and session. Do not require consent.',
        'Advertising cookies (Google AdSense) — used to show relevant ads to Free users. Require your explicit consent via the cookie banner.',
      ],
      extra: 'You can change your cookie preferences at any time by clearing your browser data or contacting us.',
    },
    {
      title: '5. Data retention',
      content: 'Files are automatically deleted upon link expiry (1, 7, or 30 days) from both the database and storage. Account data is retained while the account is active. You may request deletion of your account at any time by writing to privacy@vaultransfer.com.',
    },
    {
      title: '6. Third-party sharing',
      content: 'We do not sell your data. We use the following third-party services:',
      listBold: ['Supabase', 'Vercel', 'Stripe', 'Google AdSense', 'Cloudflare'],
      list: [
        'Supabase — database and storage (European servers)',
        'Vercel — application hosting (US servers with global CDN)',
        'Stripe — payment processing (US/EU servers)',
        'Google AdSense — contextual advertising (Free users with consent only)',
        'Cloudflare — DNS and protection (global servers)',
      ],
    },
    {
      title: '7. Your rights (GDPR)',
      content: 'If you are a resident of the European Union, you have the right to:',
      list: [
        'Access your personal data',
        'Rectify inaccurate data',
        'Request deletion of your data ("right to be forgotten")',
        'Object to processing for advertising purposes',
        'Data portability',
        'Withdraw consent at any time',
      ],
      extra: 'To exercise these rights, write to privacy@vaultransfer.com. We will respond within 30 days.',
    },
    {
      title: '8. Security',
      content: 'All transfers occur over HTTPS encrypted connections with TLS 1.3. Files are stored in private buckets accessible only via temporary signed links. Protection passwords are hashed with bcrypt at 12 rounds. Files cannot be accessed without the unique link.',
    },
    {
      title: '9. International transfers',
      content: 'Some of our providers (Vercel, Stripe) operate in the United States. Data transfers to the US are carried out in compliance with GDPR guarantees (Standard Contractual Clauses). Database and storage data is hosted in Europe via Supabase.',
    },
    {
      title: '10. Contact and complaints',
      content: 'For any privacy questions, write to privacy@vaultransfer.com. You also have the right to lodge a complaint with the Italian Data Protection Authority — Garante per la Protezione dei Dati Personali (garanteprivacy.it).',
    },
  ],
}

const de: PrivacyContent = {
  title: 'Datenschutzerklärung',
  lastUpdated: 'Letzte Aktualisierung: April 2026',
  disclaimer: 'Hinweis: Bei Abweichungen zwischen den übersetzten Versionen ist die italienische Version maßgeblich.',
  sections: [
    { title: '1. Wer wir sind', content: 'VaultTransfer ist ein sicherer Dateiübertragungsdienst, der unter vaultransfer.com zugänglich ist. Der Verantwortliche für die Datenverarbeitung ist der Dienstbetreiber, erreichbar unter privacy@vaultransfer.com.' },
    { title: '2. Daten, die wir erheben', content: 'Wir erheben nur die für den Betrieb des Dienstes unbedingt erforderlichen Daten:', list: ['E-Mail-Adresse — nur wenn Sie sich registrieren oder anmelden', 'Hochgeladene Dateien — vorübergehend, bis der Link abläuft', 'Transfer-Metadaten — Dateiname, Größe, Ablaufdatum', 'Zahlungsdaten — von Stripe verwaltet, wir speichern diese nicht', 'Technische Cookies — für den Betrieb der Website erforderlich', 'Werbe-Cookies — Google AdSense, nur mit Ihrer ausdrücklichen Einwilligung'] },
    { title: '3. Verwendung Ihrer Daten', content: '', list: ['Um Ihnen das Hochladen und Teilen von Dateien zu ermöglichen', 'Um Ihr Konto und Abonnement zu verwalten', 'Um Ihnen den Magic-Login-Link zu senden', 'Um Dateien automatisch bei Ablauf zu löschen', 'Um kontextbezogene Werbung anzuzeigen (nur Free-Nutzer, nur mit Einwilligung)'] },
    { title: '4. Cookies und Tracking', content: 'Wir verwenden folgende Cookie-Typen:', list: ['Technische Cookies — unbedingt erforderlich für Login und Sitzung. Kein Einverständnis erforderlich.', 'Werbe-Cookies (Google AdSense) — zur Anzeige relevanter Anzeigen für Free-Nutzer. Erfordern Ihre ausdrückliche Einwilligung.'], extra: 'Sie können Ihre Cookie-Einstellungen jederzeit ändern.' },
    { title: '5. Datenspeicherung', content: 'Dateien werden beim Ablauf des Links (1, 7 oder 30 Tage) automatisch gelöscht. Kontodaten werden gespeichert, solange das Konto aktiv ist. Sie können die Löschung Ihres Kontos jederzeit unter privacy@vaultransfer.com beantragen.' },
    { title: '6. Weitergabe an Dritte', content: 'Wir verkaufen Ihre Daten nicht. Wir nutzen folgende Drittanbieter:', list: ['Supabase — Datenbank und Speicher (europäische Server)', 'Vercel — Anwendungshosting (US-Server mit globalem CDN)', 'Stripe — Zahlungsabwicklung (US/EU-Server)', 'Google AdSense — kontextbezogene Werbung (nur Free-Nutzer mit Einwilligung)', 'Cloudflare — DNS und Schutz (globale Server)'] },
    { title: '7. Ihre Rechte (DSGVO)', content: 'Als EU-Bürger haben Sie das Recht auf:', list: ['Zugang zu Ihren personenbezogenen Daten', 'Berichtigung unrichtiger Daten', 'Löschung Ihrer Daten ("Recht auf Vergessenwerden")', 'Widerspruch gegen die Verarbeitung zu Werbezwecken', 'Datenübertragbarkeit', 'Widerruf der Einwilligung jederzeit'], extra: 'Schreiben Sie uns unter privacy@vaultransfer.com. Wir antworten innerhalb von 30 Tagen.' },
    { title: '8. Sicherheit', content: 'Alle Übertragungen erfolgen über HTTPS-verschlüsselte Verbindungen mit TLS 1.3. Dateien werden in privaten Buckets gespeichert, die nur über temporäre signierte Links zugänglich sind.' },
    { title: '9. Internationale Übermittlungen', content: 'Einige unserer Anbieter (Vercel, Stripe) sind in den USA tätig. Datenübermittlungen in die USA erfolgen im Einklang mit den DSGVO-Garantien (Standardvertragsklauseln).' },
    { title: '10. Kontakt und Beschwerden', content: 'Für Datenschutzfragen schreiben Sie an privacy@vaultransfer.com. Sie haben auch das Recht, eine Beschwerde bei der italienischen Datenschutzbehörde einzureichen (garanteprivacy.it).' },
  ],
}

const fr: PrivacyContent = {
  title: 'Politique de confidentialité',
  lastUpdated: 'Dernière mise à jour : Avril 2026',
  disclaimer: 'Note : En cas de divergences entre les versions traduites, la version italienne prévaut.',
  sections: [
    { title: '1. Qui nous sommes', content: 'VaultTransfer est un service de transfert de fichiers sécurisé accessible sur vaultransfer.com. Le responsable du traitement des données est l\'opérateur du service, joignable à privacy@vaultransfer.com.' },
    { title: '2. Données que nous collectons', content: 'Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :', list: ['Adresse e-mail — uniquement si vous choisissez de vous inscrire ou de vous connecter', 'Fichiers téléchargés — temporairement, jusqu\'à l\'expiration du lien', 'Métadonnées des transferts — nom du fichier, taille, date d\'expiration', 'Données de paiement — gérées par Stripe, nous ne les stockons pas', 'Cookies techniques — nécessaires au fonctionnement du site', 'Cookies publicitaires — Google AdSense, uniquement avec votre consentement explicite'] },
    { title: '3. Comment nous utilisons vos données', content: '', list: ['Pour vous permettre de télécharger et partager des fichiers', 'Pour gérer votre compte et votre abonnement', 'Pour vous envoyer le lien de connexion magique', 'Pour supprimer automatiquement les fichiers à l\'expiration', 'Pour afficher de la publicité contextuelle (utilisateurs Free uniquement, avec consentement)'] },
    { title: '4. Cookies et suivi', content: 'Nous utilisons les types de cookies suivants :', list: ['Cookies techniques — strictement nécessaires pour la connexion et la session.', 'Cookies publicitaires (Google AdSense) — pour afficher des annonces pertinentes aux utilisateurs Free.'], extra: 'Vous pouvez modifier vos préférences de cookies à tout moment.' },
    { title: '5. Conservation des données', content: 'Les fichiers sont automatiquement supprimés à l\'expiration du lien (1, 7 ou 30 jours). Les données du compte sont conservées tant que le compte est actif. Vous pouvez demander la suppression de votre compte à tout moment en écrivant à privacy@vaultransfer.com.' },
    { title: '6. Partage avec des tiers', content: 'Nous ne vendons pas vos données. Nous utilisons les services tiers suivants :', list: ['Supabase — base de données et stockage (serveurs européens)', 'Vercel — hébergement de l\'application (serveurs US avec CDN mondial)', 'Stripe — traitement des paiements (serveurs US/EU)', 'Google AdSense — publicité contextuelle (utilisateurs Free avec consentement)', 'Cloudflare — DNS et protection (serveurs mondiaux)'] },
    { title: '7. Vos droits (RGPD)', content: 'Si vous résidez dans l\'Union européenne, vous avez le droit de :', list: ['Accéder à vos données personnelles', 'Rectifier des données inexactes', 'Demander la suppression de vos données ("droit à l\'oubli")', 'Vous opposer au traitement à des fins publicitaires', 'Portabilité des données', 'Retirer votre consentement à tout moment'], extra: 'Écrivez-nous à privacy@vaultransfer.com. Nous répondrons dans les 30 jours.' },
    { title: '8. Sécurité', content: 'Tous les transferts s\'effectuent via des connexions HTTPS chiffrées avec TLS 1.3. Les fichiers sont stockés dans des buckets privés accessibles uniquement via des liens signés temporaires.' },
    { title: '9. Transferts internationaux', content: 'Certains de nos fournisseurs (Vercel, Stripe) opèrent aux États-Unis. Les transferts de données vers les USA sont effectués dans le respect des garanties RGPD (Clauses Contractuelles Types).' },
    { title: '10. Contact et réclamations', content: 'Pour toute question sur la confidentialité, écrivez à privacy@vaultransfer.com. Vous avez également le droit de déposer une plainte auprès de l\'autorité italienne de protection des données (garanteprivacy.it).' },
  ],
}

const es: PrivacyContent = {
  title: 'Política de privacidad',
  lastUpdated: 'Última actualización: Abril 2026',
  disclaimer: 'Nota: En caso de discrepancias entre las versiones traducidas, prevalecerá la versión italiana.',
  sections: [
    { title: '1. Quiénes somos', content: 'VaultTransfer es un servicio seguro de transferencia de archivos accesible en vaultransfer.com. El responsable del tratamiento de datos es el operador del servicio, contactable en privacy@vaultransfer.com.' },
    { title: '2. Datos que recopilamos', content: 'Recopilamos solo los datos estrictamente necesarios para el funcionamiento del servicio:', list: ['Dirección de correo electrónico — solo si decides registrarte o iniciar sesión', 'Archivos subidos — temporalmente, hasta que expire el enlace', 'Metadatos de transferencias — nombre del archivo, tamaño, fecha de vencimiento', 'Datos de pago — gestionados por Stripe, no los almacenamos', 'Cookies técnicas — necesarias para el funcionamiento del sitio', 'Cookies publicitarias — Google AdSense, solo con tu consentimiento explícito'] },
    { title: '3. Cómo usamos tus datos', content: '', list: ['Para permitirte subir y compartir archivos', 'Para gestionar tu cuenta y suscripción', 'Para enviarte el enlace mágico de acceso', 'Para eliminar automáticamente los archivos al vencer', 'Para mostrar publicidad contextual (solo usuarios Free, solo con consentimiento)'] },
    { title: '4. Cookies y seguimiento', content: 'Utilizamos los siguientes tipos de cookies:', list: ['Cookies técnicas — estrictamente necesarias para el inicio de sesión.', 'Cookies publicitarias (Google AdSense) — para mostrar anuncios relevantes a usuarios Free.'], extra: 'Puedes cambiar tus preferencias de cookies en cualquier momento.' },
    { title: '5. Conservación de datos', content: 'Los archivos se eliminan automáticamente al vencer el enlace (1, 7 o 30 días). Los datos de la cuenta se conservan mientras la cuenta esté activa. Puedes solicitar la eliminación de tu cuenta en cualquier momento escribiendo a privacy@vaultransfer.com.' },
    { title: '6. Compartir con terceros', content: 'No vendemos tus datos. Utilizamos los siguientes servicios de terceros:', list: ['Supabase — base de datos y almacenamiento (servidores europeos)', 'Vercel — alojamiento de la aplicación (servidores US con CDN global)', 'Stripe — procesamiento de pagos (servidores US/EU)', 'Google AdSense — publicidad contextual (usuarios Free con consentimiento)', 'Cloudflare — DNS y protección (servidores globales)'] },
    { title: '7. Tus derechos (RGPD)', content: 'Si resides en la Unión Europea, tienes derecho a:', list: ['Acceder a tus datos personales', 'Rectificar datos inexactos', 'Solicitar la eliminación de tus datos ("derecho al olvido")', 'Oponerte al tratamiento con fines publicitarios', 'Portabilidad de datos', 'Retirar el consentimiento en cualquier momento'], extra: 'Escríbenos a privacy@vaultransfer.com. Responderemos en 30 días.' },
    { title: '8. Seguridad', content: 'Todas las transferencias se realizan mediante conexiones HTTPS cifradas con TLS 1.3. Los archivos se almacenan en buckets privados accesibles solo mediante enlaces firmados temporales.' },
    { title: '9. Transferencias internacionales', content: 'Algunos de nuestros proveedores (Vercel, Stripe) operan en Estados Unidos. Las transferencias de datos a EE.UU. se realizan de conformidad con las garantías del RGPD (Cláusulas Contractuales Tipo).' },
    { title: '10. Contacto y reclamaciones', content: 'Para cualquier pregunta sobre privacidad, escribe a privacy@vaultransfer.com. También tienes derecho a presentar una reclamación ante la autoridad italiana de protección de datos (garanteprivacy.it).' },
  ],
}

export const privacyContent: Record<string, PrivacyContent> = { it, en, de, fr, es }

export function getPrivacyContent(locale: string): PrivacyContent {
  return privacyContent[locale] ?? privacyContent['en']
}