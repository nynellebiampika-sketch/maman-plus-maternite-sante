export interface UserGuideFeature {
  id: string;
  number: number;
  emoji: string;
  name: string;
  category: 'daily' | 'clinical' | 'organization' | 'system';
  categoryLabel: string;
  route: string;
  badge: string;
  summary: string;
  purpose: string; // À quoi elle sert
  howToUse: string; // Comment l'utiliser
  recordableInfo: string[]; // Quelles informations la maman peut enregistrer
  viewAndEdit: string; // Comment consulter ou modifier ses données
  keyActions: string[]; // Les actions importantes disponibles
  proTip: string; // Conseil sage-femme / recommandation
}

export const USER_GUIDE_CATEGORIES = [
  { id: 'all', label: 'Toutes les rubriques (17)' },
  { id: 'daily', label: '🏠 Suivi Quotidien' },
  { id: 'clinical', label: '🩺 Santé & Clinique' },
  { id: 'organization', label: '📔 Organisation' },
  { id: 'system', label: '⚙️ Outils & Compte' },
] as const;

export const USER_GUIDE_FEATURES: UserGuideFeature[] = [
  {
    id: 'dashboard',
    number: 1,
    emoji: '🏠',
    name: 'Tableau de bord',
    category: 'daily',
    categoryLabel: 'Suivi Quotidien',
    route: '/',
    badge: 'Vue Centrale',
    summary: 'La tour de contrôle quotidienne de votre grossesse en un clin d’œil.',
    purpose:
      'Offrir une synthèse visuelle instantanée de l’état de votre grossesse au jour le jour. Il récapitule votre terme en semaines d’aménorrhée (SA), le décompte jusqu’à l’accouchement, les consultations imminentes, la météo intérieure du jour et les raccourcis vers vos fonctionnalités clés.',
    howToUse:
      'C’est la page d’accueil affichée à chaque ouverture de MAMAN+. Faites défiler l’écran pour consulter les cartes interactives. Cliquez sur n’importe quelle tuile (symptômes, poids, rendez-vous, rapport) pour ouvrir immédiatement l’outil correspondant.',
    recordableInfo: [
      'Votre météo intérieure du jour (humeur, énergie, ressenti global)',
      'Déclenchement direct de l’enregistrement de symptômes, poids ou rendez-vous',
      'Accès rapide à la mise à jour de votre terme ou profil',
    ],
    viewAndEdit:
      'Les données affichées sur le tableau de bord sont automatiquement synchronisées en temps réel avec vos saisies dans les autres rubriques. Pour modifier une information (par exemple votre terme ou un rendez-vous), cliquez sur la carte concernée.',
    keyActions: [
      'Visualiser votre semaine d’aménorrhée (SA) et vos jours restants',
      'Consigner votre météo intérieure quotidienne avec un mot doux d’encouragement',
      'Aperçu PDF et téléchargement immédiat du Rapport Médical de Grossesse A4',
      'Accès rapide à l’Assistant IA et aux raccourcis vers chaque spécialité',
    ],
    proTip:
      'Consultez votre tableau de bord chaque matin pour vérifier les rappels d’examens de la semaine et noter votre ressenti intérieur.',
  },
  {
    id: 'pregnancy',
    number: 2,
    emoji: '🤰',
    name: 'Ma grossesse',
    category: 'daily',
    categoryLabel: 'Suivi Quotidien',
    route: '/ma-grossesse',
    badge: 'Évolution SA',
    summary: 'Le calendrier clinique et physiologique de votre grossesse semaine par semaine.',
    purpose:
      'Décrypter l’évolution biologique de votre corps et de votre futur bébé semaine après semaine (de 1 à 41 SA). Elle détaille les transformations maternelles, les étapes du développement embryonnaire puis fœtal, ainsi que les examens recommandés pour chaque trimestre.',
    howToUse:
      'Accédez à la section « Ma Grossesse » depuis le menu latéral. L’application sélectionne automatiquement votre semaine actuelle en fonction de votre date de début de grossesse. Vous pouvez également cliquer sur d’autres semaines ou trimestres pour anticiper la suite de votre parcours.',
    recordableInfo: [
      'Date des Dernières Règles (DDR) ou Date Présumée d’Accouchement (DPA)',
      'Ajustement du terme précis calculé par l’échographie de datation T1',
    ],
    viewAndEdit:
      'Pour modifier la date de référence de votre grossesse, rendez-vous dans « Mon Profil ». Le recalcul de la semaine d’aménorrhée et de la progression s’applique instantanément à l’ensemble de l’application.',
    keyActions: [
      'Découvrir la fiche détaillée de votre semaine d’aménorrhée actuelle',
      'Consulter les conseils de santé et d’alimentation adaptés au trimestre en cours',
      'Identifier les signaux corporels normaux et les symptômes à surveiller',
      'Vérifier les jalons médicaux obligatoires du trimestre (déclaration, échographies)',
    ],
    proTip:
      'Partagez les explications hebdomadaires avec votre co-parent pour lui permettre de visualiser concrètement ce que vous et bébé vivez chaque semaine.',
  },
  {
    id: 'baby',
    number: 3,
    emoji: '👶',
    name: 'Bébé',
    category: 'daily',
    categoryLabel: 'Suivi Quotidien',
    route: '/bebe',
    badge: 'Développement Fœtal',
    summary: 'Suivez la taille, le poids estimé et les progrès sensoriels de votre futur enfant.',
    purpose:
      'Donner vie à l’évolution de bébé de façon concrète, émouvante et documentée. Cette rubrique présente les repères de taille ludiques (fruits, légumes, objets du quotidien), les estimations biométriques de poids et de taille, ainsi que les acquisitions physiologiques clés (ouïe, réflexe de déglutition, sommeil paradoxal).',
    howToUse:
      'Rendez-vous dans la rubrique « Bébé » pour observer la silhouette fœtale correspondant à votre semaine. Utilisez les curseurs et onglets pour découvrir les progrès sensoriels et moteurs de bébé.',
    recordableInfo: [
      'Prénom ou petit surnom affectif de bébé',
      'Sexe de l’enfant (Fille, Garçon, Surprise / Gardé secret)',
      'Notes et commentaires personnels sur les mouvements ressentis ou échographies',
    ],
    viewAndEdit:
      'La fiche bébé se met à jour automatiquement avec votre terme. Vous pouvez modifier le prénom, le sexe ou les anecdotes directement sur la page ou via la rubrique Profil.',
    keyActions: [
      'Comparer la taille de bébé à des équivalences visuelles faciles à imaginer',
      'Consulter le poids moyen estimé et la longueur crânio-caudale ou sommet-talon',
      'Découvrir les sens en plein éveil (réaction à la voix, aux caresses sur le ventre)',
      'Noter les premiers battements de cils, hoquets fœtaux ou galipettes nocturnes',
    ],
    proTip:
      'À partir de 24-26 SA, bébé entend très bien votre voix et celle de vos proches : parlez-lui ou écoutez des mélodies douces pour créer les premiers liens.',
  },
  {
    id: 'calendar',
    number: 4,
    emoji: '📅',
    name: 'Calendrier',
    category: 'organization',
    categoryLabel: 'Organisation',
    route: '/calendrier',
    badge: 'Agenda Temporel',
    summary: 'La planification temporelle complète de vos échéances médicales et personnelles.',
    purpose:
      'Rassembler sur un calendrier mensuel et hebdomadaire l’ensemble des événements de votre maternité : consultations prénatales, échographies, bilans sanguins, rappels de vitamines et ateliers de préparation à l’accouchement.',
    howToUse:
      'Naviguez de mois en mois grâce aux flèches du calendrier. Les journées comportant un événement affichent une pastille colorée (rouge pour les rendez-vous, vert pour les prises de vitamines, or pour les examens). Cliquez sur un jour pour ouvrir son détail.',
    recordableInfo: [
      'Rendez-vous médicaux avec date, heure et praticien',
      'Échéances d’examens biologiques et d’imagerie',
      'Séances de préparation à la naissance, yoga prénatal, acupuncture',
      'Événements personnels et rendez-vous administratifs',
    ],
    viewAndEdit:
      'Cliquez sur n’importe quel jour pour afficher la liste des événements programmés. Vous pouvez modifier l’heure, le praticien ou supprimer un événement en un clic.',
    keyActions: [
      'Visualiser l’ensemble de vos obligations médicales sur une vue mensuelle fluide',
      'Ajouter directement un nouveau rendez-vous depuis le calendrier',
      'Filtrer les événements par typologie (consultation, échographie, examen)',
      'Repérer les périodes clés pour planifier vos congés de maternité',
    ],
    proTip:
      'Ajoutez vos séances de préparation à la naissance dès le 6e mois pour garder une visibilité complète sur vos fins de semaine.',
  },
  {
    id: 'appointments',
    number: 5,
    emoji: '🩺',
    name: 'Rendez-vous',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/rendez-vous',
    badge: 'Consultations',
    summary: 'Gérez et préparez vos consultations médicales avec vos soignants.',
    purpose:
      'Organiser rigoureusement le suivi médical de grossesse : consultations mensuelles obligatoires, échographies T1/T2/T3, bilan bucco-dentaire, consultation d’anesthésie du 8e mois et rendez-vous de terme.',
    howToUse:
      'Cliquez sur « Nouveau rendez-vous ». Renseignez le motif, le praticien (gynécologue, sage-femme, anesthésiste), le lieu, la date et l’heure. Vous pouvez également rédiger à l’avance les questions à poser pour ne rien oublier le jour J.',
    recordableInfo: [
      'Nom du praticien ou établissement (maternité, clinique, cabinet)',
      'Type de consultation (mensuelle, écho T1/T2/T3, anesthésie, monitoring)',
      'Date, heure exacte et adresse du cabinet',
      'Questions préparatoires à poser au médecin',
      'Compte-rendu et conclusions de la consultation',
    ],
    viewAndEdit:
      'Retrouvez vos rendez-vous triés en deux onglets : « À venir » et « Historique / Réalisés ». Cliquez sur l’icône crayon pour modifier les notes, reporter l’heure ou cocher la consultation comme effectuée.',
    keyActions: [
      'Programmer un rendez-vous avec rappel automatique',
      'Ajouter votre pense-bête de questions médicales avant la consultation',
      'Consigner les mesures prises (hauteur utérine, tension artérielle, bruits du cœur)',
      'Intégration automatique dans le Rapport Médical PDF officiel',
    ],
    proTip:
      'Notez vos questions dans l’application dès qu’elles vous traversent l’esprit ; vous les aurez sous les yeux lors du rendez-vous sans rien omettre.',
  },
  {
    id: 'symptoms',
    number: 6,
    emoji: '❤️',
    name: 'Symptômes',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/symptomes',
    badge: 'Journal Clinique',
    summary: 'Consignez vos sensations, nausées, fatigue et signaux corporels quotidiens.',
    purpose:
      'Tenir un carnet de bord clinique précis de votre confort physique et émotionnel. Ce suivi permet de détecter des tendances (ex. nausées récurrentes à telle heure, pic de fatigue), d’adapter vos habitudes et d’apporter des données objectives à votre soignant.',
    howToUse:
      'Ouvrez « Symptômes » et cliquez sur « Noter un symptôme ». Choisissez la catégorie (nausées, fatigue, tiraillements utérins, reflux, maux de tête, jambes lourdes, sommeil...), sélectionnez l’intensité (faible, modérée, forte) et ajoutez un commentaire si besoin.',
    recordableInfo: [
      'Type de symptôme parmi une liste médicale complète',
      'Échelle d’intensité visuelle (1 à 3 / léger à sévère)',
      'Date et heure précise de l’épisode',
      'Remarques, facteurs déclenchants ou remèdes apaisants utilisés',
    ],
    viewAndEdit:
      'Consultez l’historique chronologique complet sous forme de cartes élégantes et de graphiques. Vous pouvez modifier ou supprimer un enregistrement à tout moment.',
    keyActions: [
      'Enregistrer un symptôme en moins de 10 secondes',
      'Filtrer vos symptômes par intensité ou par période',
      'Identifier les signaux d’alerte (fièvre, saignements, maux de tête violents) grâce aux repères intégrés',
      'Export automatique dans votre rapport médical A4 destiné au praticien',
    ],
    proTip:
      'Si un symptôme de forte intensité apparaît soudainement (ex. contractions régulières avant terme ou œdème brutal), contactez sans délai votre maternité.',
  },
  {
    id: 'weight',
    number: 7,
    emoji: '⚖️',
    name: 'Poids',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/suivi-poids',
    badge: 'Courbe IOM',
    summary: 'Suivez l’évolution de votre prise de poids par rapport aux recommandations médicales.',
    purpose:
      'Surveiller sereinement la prise de poids au fil des semaines. L’outil calcule automatiquement votre Indice de Masse Corporelle (IMC) pré-grossesse et trace le couloir de référence médical optimal recommandé par l’Institut de Médecine (IOM).',
    howToUse:
      'Pesez-vous idéalement une fois par semaine, le matin à jeun. Cliquez sur « Ajouter une pesée », entrez votre poids en kilogrammes et la date. Le graphique met à jour instantanément votre courbe par rapport au couloir vert recommandé.',
    recordableInfo: [
      'Taille et poids initial avant la grossesse (dans votre profil)',
      'Nouvelles pesées régulières avec date et poids en kg (au dixième près)',
      'Notes associées (ex. période de rétention d’eau, repas de fête)',
    ],
    viewAndEdit:
      'Visualisez votre courbe d’évolution dynamique avec calcul du gain total (+X kg). Un tableau détaillé en bas de page liste toutes vos pesées et permet de modifier ou supprimer une entrée erronée.',
    keyActions: [
      'Calcul automatique de l’IMC initial et du gain total recommandé',
      'Visualisation graphique interactive de votre courbe vs couloir de santé IOM',
      'Détection précoce d’une prise de poids trop brutale (signe possible de rétention hydrique)',
      'Exportation directe dans le rapport médical imprimable',
    ],
    proTip:
      'Ne vous pesez pas tous les jours : le poids fluctue naturellement avec l’hydratation. Une pesée hebdomadaire à jour fixe suffit amplement.',
  },
  {
    id: 'exams',
    number: 8,
    emoji: '🧪',
    name: 'Examens',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/examens',
    badge: 'Biologie & Échographies',
    summary: 'Centralisez vos bilans sanguins, analyses d’urine et comptes-rendus d’imagerie.',
    purpose:
      'Conserver un répertoire clair et exhaustif de tous les examens obligatoires et recommandés de la grossesse : sérologies mensuelles (toxoplasmose, rubéole), numération formule sanguine (NFS), glycémie à jeun / HGPO, recherche d’agglutinines irrégulières (RAI), protéinurie et échographies morphologiques.',
    howToUse:
      'Dans la rubrique « Examens », cliquez sur « Ajouter un examen ». Renseignez le nom du bilan, la date de prélèvement, le laboratoire ou cabinet de radiologie, le statut (Effectué, Programmé, En attente) et les résultats clés.',
    recordableInfo: [
      'Nom de l’examen ou du test de dépistage',
      'Date de réalisation et laboratoire',
      'Résultats normaux / anormaux et valeurs clés (taux d’hémoglobine, glycémie, protéinurie)',
      'Nom du prescripteur et commentaires médicaux',
    ],
    viewAndEdit:
      'Classez vos examens par trimestre ou par statut. Cliquez sur la carte d’un examen pour consulter son détail complet, actualiser son statut ou enregistrer les conclusions reçues du laboratoire.',
    keyActions: [
      'Suivre la liste des examens recommandés trimestre par trimestre',
      'Enregistrer les résultats biologiques pour les avoir sous la main en consultation',
      'Surveiller les bilans mensuels obligatoires (ex. sérologie toxoplasmose pour les mamans non immunisées)',
      'Intégration systématique dans la synthèse de suivi officielle',
    ],
    proTip:
      'Gardez vos résultats dans MAMAN+ : lors de votre admission en salle d’accouchement, l’équipe aura immédiatement accès à vos sérologies et à votre groupe sanguin.',
  },
  {
    id: 'journal',
    number: 9,
    emoji: '📔',
    name: 'Journal',
    category: 'organization',
    categoryLabel: 'Organisation',
    route: '/journal',
    badge: 'Carnet Intime',
    summary: 'Votre carnet de souvenirs intimes, émotions, anecdotes et lettres à votre bébé.',
    purpose:
      'Offrir un sanctuaire d’écriture doux et sécurisé pour immortaliser les souvenirs précieux de votre grossesse : l’annonce aux proches, la découverte du sexe, les premiers coups de pied, vos rêves de maman, vos doutes apaisés et vos lettres d’amour à bébé.',
    howToUse:
      'Ouvrez le « Journal » et cliquez sur « Nouveau souvenir ». Donnez un titre à votre note, choisissez votre humeur (émerveillée, sereine, émue, pensive), sélectionnez la semaine de grossesse correspondante et rédigez librement vos pensées.',
    recordableInfo: [
      'Titre du souvenir ou de la réflexion',
      'Date et semaine d’aménorrhée associée',
      'Humeur dominante et météo émotionnelle',
      'Texte narratif libre, poème, lettre ou anecdote',
    ],
    viewAndEdit:
      'Vos écrits sont présentés sous forme d’un élégant journal chronologique. Vous pouvez relire chaque page, modifier un texte pour le compléter ou archiver un souvenir à votre rythme.',
    keyActions: [
      'Créer un livre de souvenirs numérique personnel de votre grossesse',
      'Associer chaque écrit à la semaine d’aménorrhée précise de sa survenue',
      'Rechercher dans vos billets par mots-clés ou par sentiment',
      'Garder une trace inoubliable que vous pourrez relire ou transmettre plus tard à votre enfant',
    ],
    proTip:
      'Écrivez quelques lignes lors des moments forts (première échographie, premier vêtement acheté) : ces émotions sont uniques et s’oublient vite après la naissance.',
  },
  {
    id: 'checklist',
    number: 10,
    emoji: '🧳',
    name: 'Checklist maternité',
    category: 'organization',
    categoryLabel: 'Organisation',
    route: '/checklist',
    badge: 'Valise Maternité',
    summary: 'Organisez sans stress la valise de maternité pour maman, bébé et le co-parent.',
    purpose:
      'Vous décharger de toute charge mentale logistique avant le grand départ. La checklist pré-établie par des professionnelles de santé réunit tout le nécessaire pour la salle de naissance, le séjour à la maternité, les soins de bébé et les démarches administratives indispensables.',
    howToUse:
      'Naviguez entre les 4 catégories pré-organisées (« Pour Bébé », « Pour Maman », « Salle d’accouchement », « Administratif »). Cochez les articles au fur et à mesure que vous les préparez. Vous pouvez aussi ajouter vos propres articles personnalisés.',
    recordableInfo: [
      'Articles pré-remplis essentiels (bodies coton, pyjamas, coussin d’allaitement, papiers)',
      'Nouveaux articles personnalisés avec nom et catégorie de votre choix',
      'Statut coché (dans la valise) ou non coché (à acheter / préparer)',
    ],
    viewAndEdit:
      'Une barre de progression vous indique en temps réel le pourcentage de votre valise prêt (ex. 78% bouclé). Décochez ou supprimez un élément d’un simple clic.',
    keyActions: [
      'Visualiser la jauge de progression globale de préparation de la valise',
      'Filtrer par thématique pour faire ses achats méthodiquement',
      'Ajouter des articles sur-mesure (ex. veilleuse d’allaitement, enceinte de relaxation)',
      'Vérifier en un coup d’œil les documents administratifs cruciaux (livret de famille, carte vitale, reconnaissance anticipée)',
    ],
    proTip:
      'Bouclez votre valise vers 36 SA (8 mois) pour être parée en toute sérénité même si bébé décide d’arriver un peu en avance.',
  },
  {
    id: 'reminders',
    number: 11,
    emoji: '🔔',
    name: 'Rappels',
    category: 'organization',
    categoryLabel: 'Organisation',
    route: '/rappels',
    badge: 'Alertes Santé',
    summary: 'Programmez vos rappels de prises de compléments, hydratation et soins quotidiens.',
    purpose:
      'Veiller à la régularité de vos traitements essentiels de grossesse : acide folique (vitamine B9), fer, calcium, vitamine D, hydratation régulière, exercices de respiration ou temps de repos.',
    howToUse:
      'Dans « Rappels », cliquez sur « Ajouter un rappel ». Définissez l’intitulé (ex. « Prendre le comprimé de fer »), l’heure souhaitée et la récurrence (chaque matin, midi, soir ou hebdomadaire). Activez ou désactivez-le avec l’interrupteur.',
    recordableInfo: [
      'Nom du traitement, du complément ou de l’activité bien-être',
      'Heure de l’alerte et fréquence de répétition',
      'Statut actif ou mis en pause',
    ],
    viewAndEdit:
      'Chaque rappel dispose d’un interrupteur on/off immédiat. Vous pouvez modifier l’heure ou le titre en cliquant sur la carte.',
    keyActions: [
      'Activer des rappels quotidiens discrets pour ne jamais sauter une prise de fer ou de vitamines',
      'Créer des alertes d’hydratation (1,5 à 2L d’eau par jour recommandés pendant la grossesse)',
      'Mettre en pause temporairement un rappel sans le supprimer',
    ],
    proTip:
      'Associez le rappel de fer à une prise avec un jus d’orange riche en vitamine C pour maximiser l’absorption digestive du fer.',
  },
  {
    id: 'prescriptions',
    number: 12,
    emoji: '💊',
    name: 'Mon ordonnance',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/mon-ordonnance',
    badge: 'Prescriptions A4',
    summary: 'Numérisez et générez des ordonnances médicales officielles au format A4 certifié.',
    purpose:
      'Conserver un registre sécurisé et infalsifiable des traitements prescrits par vos médecins et sages-femmes. L’outil permet également de rééditer ou imprimer une ordonnance claire et propre pour la pharmacie ou votre carnet médical.',
    howToUse:
      'Cliquez sur « Nouvelle ordonnance ». Renseignez le praticien, son établissement, la date, puis ajoutez un ou plusieurs médicaments avec leur posologie détaillée (ex. « Spasfon 80mg - 2 comprimés jusqu’à 3 fois par jour si contractions non régulières »).',
    recordableInfo: [
      'Nom du prescripteur (Dr. ou sage-femme) et spécialité',
      'Établissement ou cabinet médical d’émission',
      'Date de prescription',
      'Liste des médicaments : molécule/nom commercial, dosage, fréquence et durée',
      'Instructions spécifiques (à jeun, au milieu du repas, en cas de crise)',
    ],
    viewAndEdit:
      'Retrouvez la liste de vos ordonnances actives et passées. Cliquez sur une ordonnance pour en visualiser le détail, ajouter un médicament ou la modifier.',
    keyActions: [
      'Prévisualiser instantanément l’ordonnance au format A4 avec en-tête et logo officiel MAMAN+',
      'Imprimer directement sans quitter l’application',
      'Télécharger le PDF haute définition prêt pour la pharmacie',
      'Zone officielle réservée à la signature et au cachet du praticien',
    ],
    proTip:
      'Ne prenez aucun médicament (même sans ordonnance ou à base de plantes) sans avoir validé sa compatibilité avec votre grossesse auprès d’un professionnel.',
  },
  {
    id: 'notifications',
    number: 13,
    emoji: '🔔',
    name: 'Notifications',
    category: 'system',
    categoryLabel: 'Outils & Compte',
    route: '/notifications',
    badge: 'Centre d’Alertes',
    summary: 'Recevez les conseils de votre semaine, les rappels d’examens et les mises à jour.',
    purpose:
      'Être avertie au bon moment de chaque échéance sans avoir à vous en soucier : passage à une nouvelle semaine de grossesse, examen obligatoire à programmer dans le mois, rendez-vous du lendemain ou conseil de santé sur-mesure.',
    howToUse:
      'Accessible via l’icône cloche située dans l’en-tête en haut de l’écran ou via le menu latéral. Les pastilles rouges signalent les messages non lus.',
    recordableInfo: [
      'Historique des alertes reçues dans l’application',
      'Statut lu / non lu de chaque notification',
    ],
    viewAndEdit:
      'Consultez la liste des notifications avec possibilité de filtrer par « Toutes » ou « Non lues ». Cliquez sur une notification pour la marquer comme lue.',
    keyActions: [
      'Navigation instantanée vers le module concerné en cliquant sur la notification',
      'Bouton « Tout marquer comme lu » pour réinitialiser le compteur',
      'Filtrage par catégorie (médical, bien-être, système)',
      'Gestion des autorisations de notifications push sur navigateur et mobile',
    ],
    proTip:
      'Activez les notifications pour recevoir une douce notification à chaque début de nouvelle semaine d’aménorrhée.',
  },
  {
    id: 'report',
    number: 14,
    emoji: '📄',
    name: 'Rapport de suivi PDF',
    category: 'clinical',
    categoryLabel: 'Santé & Clinique',
    route: '/synthese-suivi',
    badge: 'Dossier Clinique A4',
    summary: 'Générez un dossier médical complet certifié A4 pour vos soignants et la maternité.',
    purpose:
      'Créer en un clic un document médical exhaustif et officiel regroupant l’ensemble des constantes et événements de votre grossesse. Ce document est conçu pour être remis à votre obstétricien, votre sage-femme ou présenté le jour de votre admission en maternité.',
    howToUse:
      'Depuis la rubrique « Synthèse du suivi » (ou depuis le bouton dédié du tableau de bord), cliquez sur « Aperçu du rapport » ou « Télécharger mon rapport ». Le visualiseur haute fidélité s’ouvre instantanément.',
    recordableInfo: [
      'Synthèse automatique : identité, terme exact en SA, DPA, groupe sanguin et rhésus',
      'Historique des pesées et gain pondéral total',
      'Derniers symptômes consignés avec intensité',
      'Dernières consultations et examens de laboratoire',
      'Traitements et ordonnances en cours, contacts d’urgence',
    ],
    viewAndEdit:
      'Les données du rapport sont le reflet fidèle de vos saisies dans MAMAN+. Pour corriger une information, modifiez simplement le module correspondant (poids, examen, profil) puis régénérez l’aperçu.',
    keyActions: [
      'Aperçu PDF haute fidélité avec technologie Canvas (aucun blocage par navigateur)',
      'Contrôles de zoom (+ / - / 100%), défilement multi-pages fluide et impression directe',
      'Téléchargement du fichier PDF A4 prêt à être imprimé ou partagé par e-mail avec vos soignants',
      'En-tête de prestige avec emblème officiel MAMAN+ et mise en page médicale standardisée',
    ],
    proTip:
      'Imprimez un exemplaire de votre rapport de suivi au début du 9e mois et glissez-le dans votre pochette de maternité avec vos échographies.',
  },
  {
    id: 'assistant',
    number: 15,
    emoji: '🤖',
    name: 'Assistant IA',
    category: 'system',
    categoryLabel: 'Outils & Compte',
    route: '/assistant-ia',
    badge: 'Gemini 2.5',
    summary: 'Votre interlocuteur bienveillant disponible 24h/24 pour répondre à vos questions de santé.',
    purpose:
      'Fournir des réponses rapides, fiables et apaisantes à toutes vos interrogations courantes sur la grossesse : aliments autorisés ou déconseillés, soulagement naturel des maux de grossesse, positions de sommeil, valise de maternité ou organisation du post-partum.',
    howToUse:
      'Cliquez sur le bouton flottant de l’assistant en bas à droite de votre écran ou sur l’option « Assistant IA » dans le menu. Tapez votre question dans le champ de message ou cliquez sur une suggestion rapide.',
    recordableInfo: [
      'Historique de vos échanges et conversations',
      'Questions personnalisées selon votre semaine actuelle de grossesse',
    ],
    viewAndEdit:
      'Vous pouvez parcourir l’historique des réponses reçues au cours de votre session ou réinitialiser la conversation à tout moment.',
    keyActions: [
      'Poser des questions sur l’alimentation, les cosmétiques et les activités compatibles',
      'Obtenir des conseils de confort doux et bienveillants',
      'Rappel automatique des signaux d’alerte imposant une consultation d’urgence',
      'Disponible instantanément jour et nuit, sans délai d’attente',
    ],
    proTip:
      'L’Assistant IA est un formidable outil d’information au quotidien, mais il ne remplace jamais le diagnostic médical de votre médecin ou sage-femme.',
  },
  {
    id: 'profile',
    number: 16,
    emoji: '👤',
    name: 'Profil',
    category: 'system',
    categoryLabel: 'Outils & Compte',
    route: '/profil',
    badge: 'Identité Médicale',
    summary: 'Votre fiche d’identité de grossesse, calcul du terme et coordonnées d’urgence.',
    purpose:
      'Centraliser vos informations administratives et médicales de base. C’est ici que vous définissez votre terme de référence, votre groupe sanguin, la maternité retenue et les coordonnées de la personne à prévenir en cas d’urgence.',
    howToUse:
      'Cliquez sur votre photo ou vos initiales en haut à droite de l’écran, ou choisissez « Mon Profil » dans la barre latérale. Complétez ou ajustez les champs, puis cliquez sur « Enregistrer les modifications ».',
    recordableInfo: [
      'Prénom, nom de famille, date de naissance, téléphone et e-mail',
      'Date des Dernières Règles (DDR) et Date Présumée d’Accouchement (DPA)',
      'Groupe sanguin, facteur Rhésus (Rh+ / Rh-) et statut des anticorps',
      'Maternité de suivi et nom de votre praticien référent',
      'Nom et numéro de téléphone du contact d’urgence (co-parent ou proche)',
    ],
    viewAndEdit:
      'Toutes les informations sont éditables à tout moment. Dès validation, la nouvelle DPA recalcule instantanément votre terme dans tout MAMAN+.',
    keyActions: [
      'Mettre à jour vos dates de grossesse dès la confirmation de l’écho T1',
      'Enregistrer votre groupe sanguin pour sécuriser vos rapports médicaux',
      'Renseigner le contact d’urgence accessible en un clic',
      'Personnaliser votre nom et prénom affichés sur vos documents officiels',
    ],
    proTip:
      'Renseignez précisément votre groupe sanguin et rhésus : si vous êtes Rhésus négatif, un suivi spécifique des agglutinines irrégulières (RAI) sera programmé.',
  },
  {
    id: 'settings',
    number: 17,
    emoji: '⚙️',
    name: 'Paramètres',
    category: 'system',
    categoryLabel: 'Outils & Compte',
    route: '/parametres',
    badge: 'Configuration',
    summary: 'Exports de santé, sécurité du mot de passe, préférences et le présent Guide Officiel.',
    purpose:
      'Gérer la sécurité technique de votre compte, exercer vos droits sur vos données médicales personnelles (exports JSON / CSV conformes RGPD et secret médical), régler les préférences de notifications et accéder au **Guide d’utilisation officiel complet**.',
    howToUse:
      'Accédez à « Paramètres » depuis le menu latéral. Naviguez entre la configuration générale de votre compte et l’onglet « Guide d’utilisation » pour explorer l’ensemble des fonctionnalités et télécharger le manuel PDF.',
    recordableInfo: [
      'Nouveau mot de passe de connexion sécurisé',
      'Préférences d’alertes sonores et rappels quotidiens de bien-être',
      'Exports complets de vos données de santé au format JSON ou CSV',
    ],
    viewAndEdit:
      'Les modifications de mot de passe et de préférences sont prises en compte immédiatement après validation.',
    keyActions: [
      'Consulter le Guide d’utilisation interactif des 17 fonctionnalités MAMAN+',
      'Télécharger le Guide d’utilisation complet en PDF officiel grand format',
      'Exporter l’intégralité de vos données de santé en fichier JSON sécurisé',
      'Télécharger le tableau chronologique des symptômes au format tableur CSV (Excel)',
      'Modifier votre mot de passe pour protéger votre intimité médicale',
      'Se déconnecter en toute sécurité sur un appareil partagé',
    ],
    proTip:
      'Téléchargez une sauvegarde JSON de vos données tous les trimestres dans les Paramètres pour conserver une copie personnelle de votre parcours.',
  },
];
