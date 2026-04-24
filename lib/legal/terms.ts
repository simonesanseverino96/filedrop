// lib/legal/terms.ts
// Contenuti Termini di Servizio per ogni lingua
// La versione italiana è quella legalmente vincolante

export interface TermsSection {
  title: string
  content?: string
  list?: string[]
  extra?: string
  extra2?: string
  contacts?: { label: string; email: string }[]
}

export interface TermsContent {
  title: string
  lastUpdated: string
  disclaimer: string
  sections: TermsSection[]
}

const it: TermsContent = {
  title: 'Termini di Servizio',
  lastUpdated: 'Ultimo aggiornamento: Aprile 2026',
  disclaimer: '',
  sections: [
    { title: '1. Accettazione dei termini', content: 'Utilizzando VaultTransfer accetti questi Termini di Servizio. Se non accetti, non utilizzare il servizio. Ci riserviamo il diritto di modificare questi termini con notifica agli utenti registrati con almeno 15 giorni di preavviso.' },
    { title: '2. Età minima', content: 'Il servizio è riservato a persone di età pari o superiore a 16 anni, in conformità al GDPR (art. 8). Utilizzando VaultTransfer dichiari di avere almeno 16 anni. Non raccogliamo consapevolmente dati di minori di 16 anni.' },
    { title: '3. Descrizione del servizio', content: 'VaultTransfer è un servizio di trasferimento file che permette di caricare file e condividerli tramite link sicuri con scadenza automatica. Il servizio è disponibile in versione gratuita (Free) e a pagamento (Pro, Business).' },
    {
      title: '4. Uso accettabile',
      content: 'È vietato utilizzare VaultTransfer per:',
      list: [
        'Caricare contenuti illegali, offensivi o che violino diritti di terzi',
        'Distribuire malware, virus o software dannosi',
        'Violare diritti d\'autore o proprietà intellettuale',
        'Attività di spam, phishing o truffe',
        'Contenuti che sfruttano o danneggiano minori (CSAM)',
        'Qualsiasi attività che violi le leggi vigenti in Italia e nell\'UE',
      ],
      extra: 'Ci riserviamo il diritto di rimuovere contenuti e sospendere account che violino queste regole, senza preavviso e senza rimborso.',
    },
    { title: '5. Piani e pagamenti', content: 'Il piano Free è gratuito con le limitazioni descritte nella pagina Prezzi. I piani Pro e Business sono in abbonamento mensile con rinnovo automatico.', extra: 'I pagamenti sono gestiti da Stripe. Non conserviamo i dati della tua carta di credito.' },
    { title: '6. Diritto di recesso (14 giorni)', content: 'In conformità alla Direttiva UE 2011/83/UE e al Codice del Consumo italiano, hai diritto di recedere dal contratto di abbonamento entro 14 giorni dalla sottoscrizione, senza necessità di fornire motivazioni.', extra: 'Per esercitare il diritto di recesso scrivi a support@vaultransfer.com entro 14 giorni dall\'acquisto. Rimborseremo l\'importo pagato entro 14 giorni dalla ricezione della richiesta.', extra2: 'Il diritto di recesso non si applica se hai già usufruito del servizio premium e hai espressamente acconsentito all\'esecuzione immediata del contratto.' },
    { title: '7. Cancellazione abbonamento', content: 'Puoi cancellare il tuo abbonamento in qualsiasi momento dal portale di gestione nella Dashboard. L\'accesso al piano pagato rimane attivo fino alla fine del periodo fatturato. Non effettuiamo rimborsi parziali per periodi non utilizzati, salvo esercizio del diritto di recesso entro 14 giorni.' },
    { title: '8. Eliminazione dei file', content: 'I file vengono eliminati automaticamente alla scadenza del link impostata dall\'utente (1, 7 o 30 giorni), sia dal database che dallo storage. Non effettuiamo backup dei file caricati. Non siamo responsabili per la perdita di file scaduti.' },
    { title: '9. Limitazione di responsabilità', content: 'VaultTransfer è fornito "così com\'è". Non garantiamo la disponibilità continua del servizio. Non siamo responsabili per danni diretti o indiretti derivanti dall\'uso o dall\'impossibilità di usare il servizio, inclusa la perdita di dati, nei limiti consentiti dalla legge italiana.' },
    { title: '10. Proprietà intellettuale', content: 'Il codice, il design e i contenuti di VaultTransfer sono di proprietà del gestore del servizio. I file caricati dagli utenti rimangono di loro proprietà. Caricare un file non ci trasferisce alcun diritto su di esso.' },
    { title: '11. Segnalazione contenuti illegali (DSA)', content: 'In conformità al Digital Services Act (Regolamento UE 2022/2065), puoi segnalare contenuti illegali o violazioni scrivendo a abuse@vaultransfer.com. Esamineremo ogni segnalazione entro 72 ore lavorative e adotteremo le misure necessarie.' },
    { title: '12. Sospensione e chiusura', content: 'Ci riserviamo il diritto di sospendere o chiudere account che violino questi termini, senza preavviso. In caso di chiusura del servizio, forniremo almeno 30 giorni di preavviso agli utenti registrati e rimborseremo gli abbonamenti attivi pro-rata.' },
    { title: '13. Legge applicabile e foro competente', content: 'Questi termini sono regolati dalla legge italiana. Per controversie con consumatori è competente il foro del luogo di residenza o domicilio del consumatore, in conformità al Codice del Consumo (D.Lgs. 206/2005). Per la risoluzione alternativa delle controversie puoi rivolgerti alla piattaforma ODR della Commissione Europea: ec.europa.eu/consumers/odr.' },
    {
      title: '14. Contatti',
      contacts: [
        { label: 'Supporto generale', email: 'support@vaultransfer.com' },
        { label: 'Privacy e GDPR', email: 'privacy@vaultransfer.com' },
        { label: 'Questioni legali', email: 'legal@vaultransfer.com' },
        { label: 'Segnalazioni abusi', email: 'abuse@vaultransfer.com' },
      ],
    },
  ],
}

const en: TermsContent = {
  title: 'Terms of Service',
  lastUpdated: 'Last updated: April 2026',
  disclaimer: 'Note: In case of discrepancies between translated versions, the Italian version shall prevail.',
  sections: [
    { title: '1. Acceptance of terms', content: 'By using VaultTransfer you accept these Terms of Service. If you do not accept them, do not use the service. We reserve the right to modify these terms with at least 15 days notice to registered users.' },
    { title: '2. Minimum age', content: 'The service is reserved for persons aged 16 or over, in compliance with GDPR (art. 8). By using VaultTransfer you declare you are at least 16 years old. We do not knowingly collect data from minors under 16.' },
    { title: '3. Service description', content: 'VaultTransfer is a file transfer service that allows you to upload files and share them via secure links with automatic expiry. The service is available in a free version (Free) and paid versions (Pro, Business).' },
    { title: '4. Acceptable use', content: 'It is prohibited to use VaultTransfer to:', list: ['Upload illegal, offensive content or content that violates third-party rights', 'Distribute malware, viruses or harmful software', 'Violate copyright or intellectual property', 'Spam, phishing or scam activities', 'Content that exploits or harms minors (CSAM)', 'Any activity that violates applicable laws in Italy and the EU'], extra: 'We reserve the right to remove content and suspend accounts that violate these rules, without notice and without refund.' },
    { title: '5. Plans and payments', content: 'The Free plan is free with the limitations described on the Pricing page. Pro and Business plans are monthly subscriptions with automatic renewal.', extra: 'Payments are managed by Stripe. We do not store your credit card data.' },
    { title: '6. Right of withdrawal (14 days)', content: 'In accordance with EU Directive 2011/83/EU and the Italian Consumer Code, you have the right to withdraw from the subscription contract within 14 days of subscription, without providing reasons.', extra: 'To exercise the right of withdrawal, write to support@vaultransfer.com within 14 days of purchase. We will refund the amount paid within 14 days of receiving the request.', extra2: 'The right of withdrawal does not apply if you have already used the premium service and have expressly consented to the immediate execution of the contract.' },
    { title: '7. Subscription cancellation', content: 'You can cancel your subscription at any time from the management portal in the Dashboard. Access to the paid plan remains active until the end of the billing period. We do not make partial refunds for unused periods, except when exercising the right of withdrawal within 14 days.' },
    { title: '8. File deletion', content: 'Files are automatically deleted upon link expiry set by the user (1, 7 or 30 days), from both the database and storage. We do not backup uploaded files. We are not responsible for the loss of expired files.' },
    { title: '9. Limitation of liability', content: 'VaultTransfer is provided "as is". We do not guarantee continuous availability of the service. We are not liable for direct or indirect damages arising from the use or inability to use the service, including data loss, to the extent permitted by Italian law.' },
    { title: '10. Intellectual property', content: 'The code, design and content of VaultTransfer are the property of the service operator. Files uploaded by users remain their property. Uploading a file does not transfer any rights to us.' },
    { title: '11. Reporting illegal content (DSA)', content: 'In accordance with the Digital Services Act (EU Regulation 2022/2065), you can report illegal content or violations by writing to abuse@vaultransfer.com. We will review each report within 72 working hours and take necessary measures.' },
    { title: '12. Suspension and closure', content: 'We reserve the right to suspend or close accounts that violate these terms, without notice. In the event of service closure, we will provide at least 30 days notice to registered users and refund active subscriptions pro-rata.' },
    { title: '13. Applicable law and jurisdiction', content: 'These terms are governed by Italian law. For disputes with consumers, the competent court is that of the consumer\'s place of residence or domicile, in accordance with the Consumer Code (D.Lgs. 206/2005). For alternative dispute resolution, you may contact the European Commission\'s ODR platform: ec.europa.eu/consumers/odr.' },
    { title: '14. Contact', contacts: [{ label: 'General support', email: 'support@vaultransfer.com' }, { label: 'Privacy & GDPR', email: 'privacy@vaultransfer.com' }, { label: 'Legal matters', email: 'legal@vaultransfer.com' }, { label: 'Abuse reports', email: 'abuse@vaultransfer.com' }] },
  ],
}

const de: TermsContent = {
  title: 'Nutzungsbedingungen',
  lastUpdated: 'Letzte Aktualisierung: April 2026',
  disclaimer: 'Hinweis: Bei Abweichungen zwischen den übersetzten Versionen ist die italienische Version maßgeblich.',
  sections: [
    { title: '1. Annahme der Bedingungen', content: 'Durch die Nutzung von VaultTransfer akzeptieren Sie diese Nutzungsbedingungen. Wenn Sie nicht zustimmen, nutzen Sie den Dienst nicht. Wir behalten uns das Recht vor, diese Bedingungen mit mindestens 15 Tagen Vorankündigung an registrierte Nutzer zu ändern.' },
    { title: '2. Mindestalter', content: 'Der Dienst ist Personen ab 16 Jahren vorbehalten, gemäß DSGVO (Art. 8). Durch die Nutzung von VaultTransfer erklären Sie, mindestens 16 Jahre alt zu sein.' },
    { title: '3. Dienstbeschreibung', content: 'VaultTransfer ist ein Dateiübertragungsdienst, der das Hochladen und Teilen von Dateien über sichere Links mit automatischem Ablauf ermöglicht.' },
    { title: '4. Akzeptable Nutzung', content: 'Es ist verboten, VaultTransfer zu verwenden für:', list: ['Hochladen illegaler oder beleidigender Inhalte', 'Verbreitung von Malware oder schädlicher Software', 'Verletzung von Urheberrechten', 'Spam, Phishing oder Betrug', 'Inhalte, die Minderjährige ausbeuten (CSAM)', 'Aktivitäten, die gegen geltendes Recht verstoßen'], extra: 'Wir behalten uns das Recht vor, Inhalte zu entfernen und Konten zu sperren.' },
    { title: '5. Pläne und Zahlungen', content: 'Der Free-Plan ist kostenlos. Pro- und Business-Pläne sind monatliche Abonnements mit automatischer Verlängerung.', extra: 'Zahlungen werden von Stripe abgewickelt. Wir speichern keine Kreditkartendaten.' },
    { title: '6. Widerrufsrecht (14 Tage)', content: 'Gemäß EU-Richtlinie 2011/83/EU haben Sie das Recht, innerhalb von 14 Tagen nach Abschluss des Abonnements ohne Angabe von Gründen zurückzutreten.', extra: 'Schreiben Sie an support@vaultransfer.com innerhalb von 14 Tagen nach dem Kauf.' },
    { title: '7. Kündigung des Abonnements', content: 'Sie können Ihr Abonnement jederzeit über das Dashboard kündigen. Der Zugang bleibt bis zum Ende des Abrechnungszeitraums aktiv.' },
    { title: '8. Dateilöschung', content: 'Dateien werden automatisch beim Ablauf des Links (1, 7 oder 30 Tage) gelöscht. Wir erstellen keine Backups der hochgeladenen Dateien.' },
    { title: '9. Haftungsbeschränkung', content: 'VaultTransfer wird "wie besehen" bereitgestellt. Wir haften nicht für direkte oder indirekte Schäden durch die Nutzung oder Nichtnutzung des Dienstes.' },
    { title: '10. Geistiges Eigentum', content: 'Code, Design und Inhalte von VaultTransfer sind Eigentum des Betreibers. Hochgeladene Dateien bleiben Eigentum der Nutzer.' },
    { title: '11. Meldung illegaler Inhalte (DSA)', content: 'Gemäß Digital Services Act können Sie illegale Inhalte unter abuse@vaultransfer.com melden. Wir prüfen jede Meldung innerhalb von 72 Arbeitsstunden.' },
    { title: '12. Sperrung und Schließung', content: 'Wir behalten uns das Recht vor, Konten ohne Vorankündigung zu sperren. Bei Schließung des Dienstes informieren wir mindestens 30 Tage im Voraus.' },
    { title: '13. Anwendbares Recht', content: 'Diese Bedingungen unterliegen italienischem Recht. Für alternative Streitbeilegung: ec.europa.eu/consumers/odr.' },
    { title: '14. Kontakt', contacts: [{ label: 'Allgemeiner Support', email: 'support@vaultransfer.com' }, { label: 'Datenschutz & DSGVO', email: 'privacy@vaultransfer.com' }, { label: 'Rechtliche Fragen', email: 'legal@vaultransfer.com' }, { label: 'Missbrauchsmeldungen', email: 'abuse@vaultransfer.com' }] },
  ],
}

const fr: TermsContent = {
  title: 'Conditions d\'utilisation',
  lastUpdated: 'Dernière mise à jour : Avril 2026',
  disclaimer: 'Note : En cas de divergences entre les versions traduites, la version italienne prévaut.',
  sections: [
    { title: '1. Acceptation des conditions', content: 'En utilisant VaultTransfer, vous acceptez ces Conditions d\'utilisation. Si vous n\'acceptez pas, n\'utilisez pas le service.' },
    { title: '2. Âge minimum', content: 'Le service est réservé aux personnes âgées de 16 ans ou plus, conformément au RGPD (art. 8).' },
    { title: '3. Description du service', content: 'VaultTransfer est un service de transfert de fichiers permettant de télécharger et partager des fichiers via des liens sécurisés avec expiration automatique.' },
    { title: '4. Utilisation acceptable', content: 'Il est interdit d\'utiliser VaultTransfer pour :', list: ['Télécharger des contenus illégaux ou offensants', 'Distribuer des logiciels malveillants', 'Violer des droits d\'auteur', 'Spam, phishing ou escroqueries', 'Contenus exploitant des mineurs (CSAM)', 'Toute activité violant les lois applicables'], extra: 'Nous nous réservons le droit de supprimer des contenus et de suspendre des comptes.' },
    { title: '5. Plans et paiements', content: 'Le plan Free est gratuit. Les plans Pro et Business sont des abonnements mensuels à renouvellement automatique.', extra: 'Les paiements sont gérés par Stripe. Nous ne stockons pas vos données de carte.' },
    { title: '6. Droit de rétractation (14 jours)', content: 'Conformément à la Directive UE 2011/83/UE, vous avez le droit de vous rétracter dans les 14 jours suivant la souscription.', extra: 'Écrivez à support@vaultransfer.com dans les 14 jours suivant l\'achat.' },
    { title: '7. Résiliation de l\'abonnement', content: 'Vous pouvez résilier votre abonnement à tout moment depuis le Dashboard. L\'accès reste actif jusqu\'à la fin de la période facturée.' },
    { title: '8. Suppression des fichiers', content: 'Les fichiers sont automatiquement supprimés à l\'expiration du lien (1, 7 ou 30 jours). Nous ne faisons pas de sauvegardes.' },
    { title: '9. Limitation de responsabilité', content: 'VaultTransfer est fourni "tel quel". Nous ne garantissons pas la disponibilité continue du service.' },
    { title: '10. Propriété intellectuelle', content: 'Le code, le design et les contenus de VaultTransfer sont la propriété de l\'opérateur. Les fichiers téléchargés restent la propriété des utilisateurs.' },
    { title: '11. Signalement de contenus illégaux (DSA)', content: 'Conformément au Digital Services Act, vous pouvez signaler des contenus illégaux à abuse@vaultransfer.com.' },
    { title: '12. Suspension et fermeture', content: 'Nous nous réservons le droit de suspendre des comptes. En cas de fermeture du service, nous informerons les utilisateurs avec 30 jours de préavis.' },
    { title: '13. Droit applicable', content: 'Ces conditions sont régies par le droit italien. Pour la résolution alternative des litiges : ec.europa.eu/consumers/odr.' },
    { title: '14. Contact', contacts: [{ label: 'Support général', email: 'support@vaultransfer.com' }, { label: 'Confidentialité & RGPD', email: 'privacy@vaultransfer.com' }, { label: 'Questions juridiques', email: 'legal@vaultransfer.com' }, { label: 'Signalements d\'abus', email: 'abuse@vaultransfer.com' }] },
  ],
}

const es: TermsContent = {
  title: 'Términos de Servicio',
  lastUpdated: 'Última actualización: Abril 2026',
  disclaimer: 'Nota: En caso de discrepancias entre las versiones traducidas, prevalecerá la versión italiana.',
  sections: [
    { title: '1. Aceptación de los términos', content: 'Al usar VaultTransfer aceptas estos Términos de Servicio. Si no aceptas, no uses el servicio.' },
    { title: '2. Edad mínima', content: 'El servicio está reservado a personas de 16 años o más, de conformidad con el RGPD (art. 8).' },
    { title: '3. Descripción del servicio', content: 'VaultTransfer es un servicio de transferencia de archivos que permite subir y compartir archivos mediante enlaces seguros con vencimiento automático.' },
    { title: '4. Uso aceptable', content: 'Está prohibido usar VaultTransfer para:', list: ['Subir contenido ilegal u ofensivo', 'Distribuir malware o software dañino', 'Violar derechos de autor', 'Spam, phishing o estafas', 'Contenido que explote a menores (CSAM)', 'Cualquier actividad que viole las leyes aplicables'], extra: 'Nos reservamos el derecho de eliminar contenido y suspender cuentas.' },
    { title: '5. Planes y pagos', content: 'El plan Free es gratuito. Los planes Pro y Business son suscripciones mensuales con renovación automática.', extra: 'Los pagos son gestionados por Stripe. No almacenamos datos de tarjetas.' },
    { title: '6. Derecho de desistimiento (14 días)', content: 'De conformidad con la Directiva UE 2011/83/UE, tienes derecho a desistir del contrato dentro de los 14 días posteriores a la suscripción.', extra: 'Escribe a support@vaultransfer.com dentro de los 14 días siguientes a la compra.' },
    { title: '7. Cancelación de suscripción', content: 'Puedes cancelar tu suscripción en cualquier momento desde el Dashboard. El acceso permanece activo hasta el final del período facturado.' },
    { title: '8. Eliminación de archivos', content: 'Los archivos se eliminan automáticamente al vencer el enlace (1, 7 o 30 días). No realizamos copias de seguridad.' },
    { title: '9. Limitación de responsabilidad', content: 'VaultTransfer se proporciona "tal cual". No garantizamos la disponibilidad continua del servicio.' },
    { title: '10. Propiedad intelectual', content: 'El código, diseño y contenidos de VaultTransfer son propiedad del operador. Los archivos subidos por los usuarios siguen siendo de su propiedad.' },
    { title: '11. Notificación de contenido ilegal (DSA)', content: 'De conformidad con el Digital Services Act, puedes reportar contenido ilegal a abuse@vaultransfer.com.' },
    { title: '12. Suspensión y cierre', content: 'Nos reservamos el derecho de suspender cuentas. En caso de cierre del servicio, informaremos con 30 días de antelación.' },
    { title: '13. Ley aplicable', content: 'Estos términos se rigen por la ley italiana. Para resolución alternativa de disputas: ec.europa.eu/consumers/odr.' },
    { title: '14. Contacto', contacts: [{ label: 'Soporte general', email: 'support@vaultransfer.com' }, { label: 'Privacidad y RGPD', email: 'privacy@vaultransfer.com' }, { label: 'Asuntos legales', email: 'legal@vaultransfer.com' }, { label: 'Informes de abuso', email: 'abuse@vaultransfer.com' }] },
  ],
}

export const termsContent: Record<string, TermsContent> = { it, en, de, fr, es }

export function getTermsContent(locale: string): TermsContent {
  return termsContent[locale] ?? termsContent['en']
}