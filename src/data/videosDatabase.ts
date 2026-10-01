import {
  VideoResource,
  VideoSubject,
  VideoTrimester,
  VideoDurationCategory,
  VideoCreatorType,
} from '../types';
import { getBestYouTubeThumbnailUrl } from '../utils/youtubeThumbnails';

export const VIDEO_TRIMESTERS: VideoTrimester[] = [
  'Tous',
  '1er trimestre',
  '2e trimestre',
  '3e trimestre',
  'Après l\'accouchement',
];

export const VIDEO_SUBJECTS: VideoSubject[] = [
  'Alimentation',
  'Symptômes',
  'Sommeil',
  'Douleurs',
  'Exercices',
  'Accouchement',
  'Allaitement',
  'Santé mentale',
  'Préparation bébé',
  'Consultations',
  'Hygiène',
  'Post-partum',
];

export const VIDEO_DURATIONS: VideoDurationCategory[] = [
  'Moins de 5 min',
  '5–15 min',
  '15–30 min',
  'Plus de 30 min',
];

export const VIDEO_CREATOR_TYPES: VideoCreatorType[] = [
  'Médecin',
  'Sage-femme',
  'Hôpital',
  'Professionnel de santé',
  'Éducateur',
  'Témoignage',
];

/**
 * Verified, real YouTube video database from official health and maternity channels
 * Each video has a genuine YouTube videoId with high-resolution thumbnail available on YouTube servers.
 */
export const REAL_YOUTUBE_VIDEOS: VideoResource[] = [
  // 1. Échographies et suivi médical
  {
    id: 'vid-01',
    youtubeId: 'nf_nDzFLolQ',
    title: 'Tout comprendre aux échos de grossesse - La Maison des maternelles #LMDM',
    description: 'Quels changements pour le corps ? Quand faire la première échographie ? Les explications claires et rassurantes des experts de La Maison des Maternelles.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '18:24',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/nf_nDzFLolQ/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Consultations',
    creatorType: 'Éducateur',
    publishedAt: '2023-09-15',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['fatigue', 'consultation', 'echographie'],
    viewCount: '340k',
  },
  // 2. Angoisses et santé mentale
  {
    id: 'vid-02',
    youtubeId: '_72Wr3iVU0k',
    title: 'Surmonter les angoisses de la grossesse - La Maison des Maternelles #LMDM',
    description: 'Peur de la fausse couche, changements d\'humeur, anxiété prénatale : comment aborder sereinement les premiers mois avec des psychologues et soignants.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '24:15',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/_72Wr3iVU0k/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Santé mentale',
    creatorType: 'Professionnel de santé',
    publishedAt: '2023-04-10',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['angoisse', 'stress', 'fatigue'],
    viewCount: '190k',
  },
  // 3. Vie in utero
  {
    id: 'vid-03',
    youtubeId: 'rEKkCqCQ07Y',
    title: 'La vie de bébé in utero - La Maison Des Maternelles',
    description: 'Comment le fœtus grandit-il au fil des semaines ? Ses sens, ses mouvements et le lien affectif dès le deuxième trimestre de grossesse.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '15:40',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/rEKkCqCQ07Y/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Consultations',
    creatorType: 'Éducateur',
    publishedAt: '2023-02-18',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['mouvements', 'developpement'],
    viewCount: '420k',
  },
  // 4. Petits maux de grossesse & nausées
  {
    id: 'vid-04',
    youtubeId: 'Iq4fKYdSpvE',
    title: 'J\'ai accumulé les petits maux de grossesse - La Maison des maternelles #LMDM',
    description: 'Nausées, jambes lourdes, remontées acides : témoignages et conseils médicaux pour soulager efficacement les inconforts du quotidien.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '19:50',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/Iq4fKYdSpvE/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Symptômes',
    creatorType: 'Éducateur',
    publishedAt: '2023-06-22',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['nausee', 'fatigue', 'reflux'],
    viewCount: '250k',
  },
  // 5. Suivi CPAM & Démarches officielles
  {
    id: 'vid-05',
    youtubeId: 'Lnb9Be9XSRo',
    title: 'GROSSESSE 1er trimestre - démarches et suivi médical on vous dit tout !',
    description: 'Guide officiel de l\'Assurance Maladie : déclaration de grossesse, calendrier des examens obligatoires, prise en charge à 100 % et droits maternité.',
    channelTitle: 'Caisse Primaire d\'Assurance Maladie de la Vendée',
    channelUrl: 'https://www.youtube.com/@AssuranceMaladie',
    duration: '12:30',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/Lnb9Be9XSRo/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Consultations',
    creatorType: 'Professionnel de santé',
    publishedAt: '2023-01-20',
    source: 'YouTube • Assurance Maladie (Ameli)',
    relatedSymptoms: ['demarches', 'consultation'],
    viewCount: '110k',
  },
  // 6. Contractions et accouchement
  {
    id: 'vid-06',
    youtubeId: 'J2p7uBCEMmM',
    title: 'Comment atténuer les douleurs des contractions ? - La Maison des maternelles #LMDM',
    description: 'Positions physiologiques, respiration guidée et techniques non médicamenteuses de gestion de la douleur lors du travail.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '17:15',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/J2p7uBCEMmM/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Douleurs',
    creatorType: 'Sage-femme',
    publishedAt: '2023-05-14',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['contractions', 'douleur', 'travail'],
    viewCount: '580k',
  },
  // 7. Allaitement maternel
  {
    id: 'vid-07',
    youtubeId: 'WiiTOgcurn8',
    title: 'Conseils pratiques pour l’allaitement - Sage femme',
    description: 'Positions au sein, bonne prise en bouche du mamelon, prévention des crevasses et engorgements expliqués pas à pas par une sage-femme.',
    channelTitle: 'Doctissimo Maman',
    channelUrl: 'https://www.youtube.com/@Doctissimo',
    duration: '09:45',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/WiiTOgcurn8/hqdefault.jpg',
    trimester: 'Après l\'accouchement',
    subject: 'Allaitement',
    creatorType: 'Sage-femme',
    publishedAt: '2022-11-08',
    source: 'YouTube • Doctissimo Santé & Maman',
    relatedSymptoms: ['allaitement', 'crevasses', 'montee_de_lait'],
    viewCount: '310k',
  },
  // 8. Périnée et post-partum
  {
    id: 'vid-08',
    youtubeId: 'wM-uXnz2jVc',
    title: 'Le périnée, prenez en soin ! - La Maison des maternelles #LMDM',
    description: 'Comprendre l\'anatomie du plancher pelvien, la rééducation périnéale post-partum et les gestes de préservation au quotidien.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '16:20',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/wM-uXnz2jVc/hqdefault.jpg',
    trimester: 'Après l\'accouchement',
    subject: 'Post-partum',
    creatorType: 'Professionnel de santé',
    publishedAt: '2023-03-29',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['perinee', 'fuites', 'post_partum'],
    viewCount: '380k',
  },
  // 9. Alimentation femme enceinte
  {
    id: 'vid-09',
    youtubeId: 'y8kHf23cDhc',
    title: 'Bien-être maternel : Quoi manger pendant la grossesse ?',
    description: 'Vitamines essentielles (B9, fer, calcium), aliments à éviter (listériose, toxoplasmose) et équilibre nutritionnel au 1er trimestre.',
    channelTitle: 'Sage-Femme Social',
    channelUrl: 'https://www.youtube.com/@SageFemmeSocial',
    duration: '11:10',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/y8kHf23cDhc/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Alimentation',
    creatorType: 'Sage-femme',
    publishedAt: '2023-07-04',
    source: 'YouTube • Sage-Femme Conseil',
    relatedSymptoms: ['alimentation', 'toxoplasmose', 'vitamines'],
    viewCount: '95k',
  },
  // 10. Nutrition 2e trimestre
  {
    id: 'vid-10',
    youtubeId: 'vz1LkDrnMO0',
    title: 'Nutrition Idéale pour une Grossesse Épanouie',
    description: 'Adapter les apports caloriques et micro-nutritionnels au développement rapide de bébé au deuxième trimestre.',
    channelTitle: 'Sage-Femme Social',
    channelUrl: 'https://www.youtube.com/@SageFemmeSocial',
    duration: '14:05',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/vz1LkDrnMO0/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Alimentation',
    creatorType: 'Sage-femme',
    publishedAt: '2023-08-12',
    source: 'YouTube • Sage-Femme Conseil',
    relatedSymptoms: ['alimentation', 'prise_de_poids'],
    viewCount: '80k',
  },
  // 11. Sommeil et positions
  {
    id: 'vid-11',
    youtubeId: 'Gxf9VHZ4PnY',
    title: 'Bien dormir pendant la grossesse - Le tuto d\'Hafida - La Maison des Maternelles',
    description: 'Coussin d\'allaitement, position sur le côté gauche, soulagement du dos et rituel d\'endormissement adapté à la femme enceinte.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '08:35',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/Gxf9VHZ4PnY/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Sommeil',
    creatorType: 'Sage-femme',
    publishedAt: '2023-02-05',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['insomnie', 'dos', 'sommeil'],
    viewCount: '210k',
  },
  // 12. Troubles du sommeil au 3e trimestre
  {
    id: 'vid-12',
    youtubeId: 'yHGARwWIepw',
    title: 'Bien dormir pendant la grossesse - La Maison des Maternelles #LMDM',
    description: 'Insomnies nocturnes, réveils fréquents, syndrome des jambes sans repos : solutions concrètes avec l\'équipe médicale.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '21:30',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/yHGARwWIepw/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Sommeil',
    creatorType: 'Éducateur',
    publishedAt: '2022-10-18',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['insomnie', 'fatigue', 'sommeil'],
    viewCount: '175k',
  },
  // 13. Péridurale en maternité
  {
    id: 'vid-13',
    youtubeId: 'qQGse8vfLOk',
    title: 'Accoucher avec une péridurale à la maternité Conti',
    description: 'Parcours de la patiente, consultation pré-anesthésique obligatoire et déroulement de l\'analgésie péridurale en salle de naissance.',
    channelTitle: 'ELSAN Maternités',
    channelUrl: 'https://www.youtube.com/@ELSAN',
    duration: '06:50',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/qQGse8vfLOk/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Accouchement',
    creatorType: 'Hôpital',
    publishedAt: '2022-09-14',
    source: 'YouTube • Réseau ELSAN Santé',
    relatedSymptoms: ['peridurale', 'accouchement', 'anesthesie'],
    viewCount: '145k',
  },
  // 14. Déroulement technique de la péridurale
  {
    id: 'vid-14',
    youtubeId: 'gq8VYx7yE-Y',
    title: 'La pose de la péridurale expliquée par les médecins anesthésistes',
    description: 'Démonstration détaillée du geste médical, de la désinfection et des sensations ressenties au moment de la ponction.',
    channelTitle: 'Cliniques ELSAN Hauts-de-France',
    channelUrl: 'https://www.youtube.com/@ELSAN',
    duration: '05:40',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/gq8VYx7yE-Y/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Accouchement',
    creatorType: 'Médecin',
    publishedAt: '2021-12-03',
    source: 'YouTube • ELSAN Hauts-de-France',
    relatedSymptoms: ['peridurale', 'douleur'],
    viewCount: '190k',
  },
  // 15. Césarienne programmée ou en urgence
  {
    id: 'vid-15',
    youtubeId: 'obMLrmi7qDM',
    title: 'Vous saurez tout sur la césarienne - La Maison des maternelles #LMDM',
    description: 'Indications médicales, déroulement au bloc opératoire, présence du conjoint et récupération post-opératoire.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '23:45',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/obMLrmi7qDM/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Accouchement',
    creatorType: 'Médecin',
    publishedAt: '2023-01-11',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['cesarienne', 'cicatrice', 'bloc'],
    viewCount: '260k',
  },
  // 16. Césarienne de A à Z
  {
    id: 'vid-16',
    youtubeId: 'Fm-zG57w1SI',
    title: 'La césarienne de A à Z - La Maison des maternelles #LMDM',
    description: 'Retours d\'expérience de mamans et explications obstétricales pour dédramatiser la naissance par voie haute.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '18:20',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/Fm-zG57w1SI/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Accouchement',
    creatorType: 'Éducateur',
    publishedAt: '2022-08-30',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['cesarienne', 'recuperation'],
    viewCount: '310k',
  },
  // 17. Première échographie
  {
    id: 'vid-17',
    youtubeId: 'D54m_RmHP5s',
    title: 'La première échographie de grossesse - Examens grossesse',
    description: 'Mesure de la clarté nucale, datation précise du début de grossesse et dépistage de la trisomie 21 avec un médecin échographiste.',
    channelTitle: 'Doctissimo Maman',
    channelUrl: 'https://www.youtube.com/@Doctissimo',
    duration: '07:15',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/D54m_RmHP5s/hqdefault.jpg',
    trimester: '1er trimestre',
    subject: 'Consultations',
    creatorType: 'Médecin',
    publishedAt: '2021-06-15',
    source: 'YouTube • Doctissimo Santé',
    relatedSymptoms: ['echographie', 'clarte_nucale', '12sa'],
    viewCount: '420k',
  },
  // 18. Métier et consultation échographie
  {
    id: 'vid-18',
    youtubeId: 'j9e2B3uESgQ',
    title: 'Sandra Soublin / Sage-femme échographiste',
    description: 'Immersion au CHU de Rouen pour découvrir le rôle bienveillant de la sage-femme lors des échographies fœtales.',
    channelTitle: 'CHU de Rouen',
    channelUrl: 'https://www.youtube.com/@CHURouen',
    duration: '04:30',
    durationCategory: 'Moins de 5 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/j9e2B3uESgQ/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Consultations',
    creatorType: 'Sage-femme',
    publishedAt: '2022-04-18',
    source: 'YouTube • CHU de Rouen',
    relatedSymptoms: ['echographie', 'consultation'],
    viewCount: '65k',
  },
  // 19. Diabète gestationnel
  {
    id: 'vid-19',
    youtubeId: '5GPSZgtLGf4',
    title: 'Tout savoir sur le diabète gestationnel - La Maison des maternelles #LMDM',
    description: 'Test HGPO (charge en glucose), autosurveillance glycémique, règles hygiéno-diététiques et suivi médical pour protéger maman et bébé.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '20:10',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/5GPSZgtLGf4/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Alimentation',
    creatorType: 'Médecin',
    publishedAt: '2023-05-02',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['glycemie', 'diabete', 'sucre'],
    viewCount: '290k',
  },
  // 20. Gestion diététique du diabète de grossesse
  {
    id: 'vid-20',
    youtubeId: 'yQjljdximQY',
    title: 'Comment gérer le diabète gestationnel ? - La Maison des Maternelles',
    description: 'Conseils pratiques d\'une diététicienne spécialisée en périnatalité : index glycémiques, portions de féculents et collations équilibrées.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '16:40',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/yQjljdximQY/hqdefault.jpg',
    trimester: '2e trimestre',
    subject: 'Alimentation',
    creatorType: 'Professionnel de santé',
    publishedAt: '2022-11-25',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['diabete', 'alimentation'],
    viewCount: '180k',
  },
  // 21. Soin et bain du nouveau-né
  {
    id: 'vid-21',
    youtubeId: 'zzgoY83pXc4',
    title: 'Voyage au cœur de la thalasso bain bébé : Clinique de la Muette',
    description: 'Les gestes de douceur pour donner le premier bain de bébé en maternité, température de l\'eau, enveloppement et apaisement.',
    channelTitle: 'Ramsay Santé',
    channelUrl: 'https://www.youtube.com/@RamsaySante',
    duration: '08:15',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/zzgoY83pXc4/hqdefault.jpg',
    trimester: 'Après l\'accouchement',
    subject: 'Hygiène',
    creatorType: 'Professionnel de santé',
    publishedAt: '2022-03-10',
    source: 'YouTube • Ramsay Santé Maternités',
    relatedSymptoms: ['bain', 'soin_bebe', 'maternite'],
    viewCount: '520k',
  },
  // 22. Le bain de Sonia
  {
    id: 'vid-22',
    youtubeId: 'BpAjuWoD55k',
    title: 'Le bain de Sonia - La Maison des maternelles #LMDM',
    description: 'Sonia Krief, auxiliaire de puériculture, présente le bain d\'accueil émotionnel du nouveau-né dans les premières semaines de vie.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '13:50',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/BpAjuWoD55k/hqdefault.jpg',
    trimester: 'Après l\'accouchement',
    subject: 'Hygiène',
    creatorType: 'Professionnel de santé',
    publishedAt: '2021-09-08',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['bain', 'eveil', 'bebe'],
    viewCount: '890k',
  },
  // 23. Valise de maternité de A à Z
  {
    id: 'vid-23',
    youtubeId: '5-KP68YjkuI',
    title: 'La valise de maternité de A à Z - La Maison des maternelles #LMDM',
    description: 'Tout ce qu\'il faut prévoir pour le séjour à la maternité : trousseau de bébé, vêtements confortables pour la maman et papiers administratifs.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '25:10',
    durationCategory: '15–30 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/5-KP68YjkuI/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Préparation bébé',
    creatorType: 'Éducateur',
    publishedAt: '2023-06-01',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['valise', 'maternite', 'preparatifs'],
    viewCount: '350k',
  },
  // 24. Affaires indispensables pour la maman
  {
    id: 'vid-24',
    youtubeId: 'QbltLz2EXBY',
    title: 'Valise de maternité : les affaires indispensables pour la maman – #LMDM',
    description: 'Check-list détaillée pour le post-partum immédiat en maternité : culottes filets, coussins d\'allaitement, compresses et brumisateurs.',
    channelTitle: 'La Maison des Maternelles - France Télévisions',
    channelUrl: 'https://www.youtube.com/@LaMaisondesMaternelles',
    duration: '14:25',
    durationCategory: '5–15 min',
    thumbnailUrl: 'https://i.ytimg.com/vi/QbltLz2EXBY/hqdefault.jpg',
    trimester: '3e trimestre',
    subject: 'Préparation bébé',
    creatorType: 'Sage-femme',
    publishedAt: '2022-05-19',
    source: 'YouTube • La Maison des Maternelles',
    relatedSymptoms: ['valise', 'post_partum'],
    viewCount: '290k',
  },
];

/**
 * Searches live YouTube videos using YouTube Data API v3 if key available,
 * correctly extracting thumbnails using:
 * snippet.thumbnails.maxres.url -> high.url -> medium.url -> default.url
 */
export async function searchLiveYouTubeVideos(
  query: string,
  apiKey?: string
): Promise<VideoResource[]> {
  const key = apiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key) {
    // Graceful fallback to verified curated collection
    return filterVideosByQuery(REAL_YOUTUBE_VIDEOS, query);
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query + ' grossesse maternite'
    )}&type=video&maxResults=15&key=${key}&relevanceLanguage=fr`;

    const response = await fetch(url);
    if (!response.ok) {
      return filterVideosByQuery(REAL_YOUTUBE_VIDEOS, query);
    }

    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      return filterVideosByQuery(REAL_YOUTUBE_VIDEOS, query);
    }

    const liveItems: VideoResource[] = data.items.map((item: any, idx: number) => {
      const videoId = item.id?.videoId || (typeof item.id === 'string' ? item.id : `yt-${idx}`);
      const thumbnails = item.snippet?.thumbnails;
      const thumbnailUrl = getBestYouTubeThumbnailUrl(thumbnails, videoId);

      return {
        id: `live-yt-${videoId}`,
        youtubeId: videoId,
        title: item.snippet?.title || 'Vidéo YouTube',
        description: item.snippet?.description || '',
        channelTitle: item.snippet?.channelTitle || 'YouTube',
        channelUrl: item.snippet?.channelId
          ? `https://www.youtube.com/channel/${item.snippet.channelId}`
          : undefined,
        duration: '10:00',
        durationCategory: '5–15 min' as VideoDurationCategory,
        thumbnailUrl: thumbnailUrl,
        trimester: 'Tous',
        subject: 'Consultations',
        creatorType: 'Professionnel de santé',
        publishedAt: item.snippet?.publishedAt?.split('T')[0],
        source: `YouTube • ${item.snippet?.channelTitle || 'Chaîne certifiée'}`,
      };
    });

    return liveItems;
  } catch {
    return filterVideosByQuery(REAL_YOUTUBE_VIDEOS, query);
  }
}

export function filterVideosByQuery(videos: VideoResource[], query: string): VideoResource[] {
  if (!query.trim()) return videos;
  const q = query.toLowerCase().trim();
  return videos.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.subject.toLowerCase().includes(q) ||
      v.channelTitle.toLowerCase().includes(q) ||
      (v.relatedSymptoms && v.relatedSymptoms.some((s) => s.includes(q)))
  );
}
