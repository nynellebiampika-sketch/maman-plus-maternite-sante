import { AssessmentQuestion, AssessmentResultData, OrientationLevel } from '../types';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: 'Quel est votre terme ou trimestre actuel ?',
    subtitle: 'La pertinence des symptômes varie grandement selon l\'âge gestationnel.',
    options: [
      { label: '1er trimestre', sublabel: 'Semaines 1 à 14 d\'aménorrhée (SA)', value: 't1', score: 0 },
      { label: '2e trimestre', sublabel: 'Semaines 15 à 28 SA', value: 't2', score: 0 },
      { label: '3e trimestre', sublabel: 'Semaines 29 à 41 SA', value: 't3', score: 1 },
      { label: 'Post-partum', sublabel: 'Après la naissance de votre bébé', value: 'postpartum', score: 0 },
    ],
  },
  {
    id: 2,
    question: 'Quel est le symptôme principal qui vous préoccupe ?',
    subtitle: 'Sélectionnez la manifestation clinique la plus marquée.',
    options: [
      { label: 'Nausées ou vomissements fréquents', sublabel: 'Difficulté à vous alimenter ou boire', value: 'nausea', score: 1 },
      { label: 'Douleurs pelviennes ou abdominales', sublabel: 'Tiraillements, crampes ou pesanteur', value: 'belly_pain', score: 2 },
      { label: 'Saignements génitaux', sublabel: 'Pertes de sang brunâtres ou rouges', value: 'bleeding', score: 4 },
      { label: 'Maux de tête intenses ou troubles visuels', sublabel: 'Céphalées, mouches volantes, bourdonnements', value: 'headache', score: 4 },
      { label: 'Diminution ou absence de mouvements de bébé', sublabel: 'Bébé bouge nettement moins que d\'habitude', value: 'baby_moves', score: 5 },
      { label: 'Mal de dos ou douleur sciatique', sublabel: 'Lombalgie, fesse ou cuisse', value: 'back_pain', score: 1 },
      { label: 'Gonflement soudain (visage, mains, pieds)', sublabel: 'Œdèmes brutaux ou prise de poids rapide', value: 'swelling', score: 3 },
      { label: 'Fièvre, frissons ou sensation de malaise', sublabel: 'Température corporelle élevée', value: 'fever', score: 4 },
      { label: 'Fatigue extrême ou vertiges', sublabel: 'Asthénie marquée au repos', value: 'fatigue', score: 1 },
      { label: 'Autre inconfort ou question générale', sublabel: 'Inconfort digestif, sommeil, anxiété', value: 'other', score: 0 },
    ],
  },
  {
    id: 3,
    question: 'Quelle est l\'intensité de la douleur ou de la gêne ressentie ?',
    subtitle: 'Évaluez sur une échelle de ressenti subjectif.',
    options: [
      { label: 'Légère (1 à 3 / 10)', sublabel: 'Gêne présente mais n\'empêche pas les activités', value: 'mild', score: 0 },
      { label: 'Modérée (4 à 6 / 10)', sublabel: 'Douleur nette nécessitant de ralentir ou s\'allonger', value: 'moderate', score: 2 },
      { label: 'Sévère (7 à 8 / 10)', sublabel: 'Douleur intense empêchant les activités normales', value: 'severe', score: 4 },
      { label: 'Insupportable (9 à 10 / 10)', sublabel: 'Douleur intolérable en coup de poignard ou continue', value: 'unbearable', score: 6, isEmergency: true },
    ],
  },
  {
    id: 4,
    question: 'Depuis combien de temps ce problème est-il présent ?',
    subtitle: 'Le mode d\'installation (brutal vs progressif) est un indicateur clé.',
    options: [
      { label: 'Début brutal et violent depuis moins d\'une heure', sublabel: 'Installation soudaine sans signe avant-coureur', value: 'acute', score: 4 },
      { label: 'Apparu au cours des dernières 24 heures', sublabel: 'Début récent depuis ce matin ou la nuit', value: 'day', score: 2 },
      { label: 'Présent depuis 2 à 4 jours', sublabel: 'Évolution continue ou par vagues', value: 'days', score: 1 },
      { label: 'Chronique ou récurrent depuis plus d\'une semaine', sublabel: 'Gêne habituelle qui fluctue', value: 'chronic', score: 0 },
    ],
  },
  {
    id: 5,
    question: 'Avez-vous remarqué des saignements vaginaux ?',
    subtitle: 'Tout saignement doit être évalué selon sa couleur et son abondance.',
    options: [
      { label: 'Aucun saignement', sublabel: 'Pertes vaginales habituelles claires ou blanchâtres', value: 'none', score: 0 },
      { label: 'Minimes traces brunâtres (spottings)', sublabel: 'Quelques gouttes après un rapport ou un examen', value: 'spotting', score: 2 },
      { label: 'Saignement rouge léger à modéré', sublabel: 'Équivalent à un début de règles', value: 'light_red', score: 5, isEmergency: true },
      { label: 'Saignement rouge abondant ou caillots', sublabel: 'Nécessitant une protection toutes les heures', value: 'heavy_red', score: 8, isEmergency: true },
    ],
  },
  {
    id: 6,
    question: 'Avez-vous de la fièvre ou des frissons ?',
    subtitle: 'La température corporelle doit être mesurée au thermomètre.',
    options: [
      { label: 'Aucune fièvre (< 37.5°C)', sublabel: 'Température normale', value: 'none', score: 0 },
      { label: 'Fébrilité légère (entre 37.5°C et 38°C)', sublabel: 'Légère sensation de chaleur sans frisson', value: 'mild_fever', score: 2 },
      { label: 'Fièvre confirmée supérieure à 38°C', sublabel: 'Avec courbatures, sueurs ou frissons', value: 'high_fever', score: 5, isEmergency: true },
    ],
  },
  {
    id: 7,
    question: 'Si vous êtes à plus de 20 SA, comment percevez-vous les mouvements de bébé ?',
    subtitle: 'La vitalité fœtale est un reflet direct de son bien-être.',
    options: [
      { label: 'Bébé bouge normalement et vigoureusement', sublabel: 'Mouvements habituels plusieurs fois par jour', value: 'normal', score: 0 },
      { label: 'Je suis à moins de 20 SA (pas encore de mouvements nets)', sublabel: 'Début de grossesse, perception non établie', value: 'not_yet', score: 0 },
      { label: 'Mouvements plus discrets mais présents après stimulation', sublabel: 'Après s\'être allongée sur le côté gauche au calme', value: 'decreased_slight', score: 2 },
      { label: 'Diminution nette et prolongée (aucun mouvement perçu depuis plus de 4h)', sublabel: 'Malgré collation sucrée et position sur le flanc gauche', value: 'absent', score: 8, isEmergency: true },
    ],
  },
  {
    id: 8,
    question: 'Ressentez-vous des maux de tête violents ou des anomalies de la vue ?',
    subtitle: 'Signes fonctionnels d\'hypertension artérielle et de pré-éclampsie.',
    options: [
      { label: 'Aucun mal de tête ni trouble visuel', sublabel: 'Vision nette et tête légère', value: 'none', score: 0 },
      { label: 'Céphalée légère soulagée par le repos ou l\'hydratation', sublabel: 'Tension des tempes sans vertige', value: 'mild_headache', score: 1 },
      { label: 'Céphalée inhabituelle persistante', sublabel: 'Résistante au paracétamol', value: 'persistent_headache', score: 3 },
      { label: 'Céphalée violente en casque + mouches, étincelles ou bourdonnements', sublabel: 'Troubles visuels nets ou sifflements d\'oreilles', value: 'severe_preeclampsia', score: 7, isEmergency: true },
    ],
  },
  {
    id: 9,
    question: 'Ressentez-vous des contractions de l\'utérus ?',
    subtitle: 'Distinguer les contractions d\'entraînement (Braxton Hicks) du travail.',
    options: [
      { label: 'Aucune contraction', sublabel: 'Ventre souple en permanence', value: 'none', score: 0 },
      { label: 'Quelques durcissements isolés et indolores par jour', sublabel: 'Moins de 10 par jour, durant moins d\'une minute', value: 'braxton', score: 0 },
      { label: 'Contractions régulières et douloureuses toutes les 10 à 15 minutes', sublabel: 'Le ventre devient dur comme du bois avec douleur de règles', value: 'regular_10min', score: 4 },
      { label: 'Contractions très rapprochées (toutes les 5 minutes ou moins)', sublabel: 'Rythmées, intenses et nécessitant d\'arrêter de parler', value: 'very_close', score: 6, isEmergency: true },
      { label: 'Écoulement de liquide chaud comme de l\'eau (poche des eaux)', sublabel: 'Inodore et transparent en continu', value: 'water_broke', score: 7, isEmergency: true },
    ],
  },
  {
    id: 10,
    question: 'Avez-vous des antécédents médicaux particuliers ou une grossesse à risque ?',
    subtitle: 'Permet d\'adapter le niveau de vigilance recommandé.',
    options: [
      { label: 'Aucun antécédent particulier, grossesse physiologique', sublabel: 'Suivi de routine sans facteur de risque connu', value: 'none', score: 0 },
      { label: 'Diabète gestationnel ou hypertension artérielle modérée', sublabel: 'Sous surveillance médicale ou diététique', value: 'diabetes_or_hta', score: 2 },
      { label: 'Antécédent de pré-éclampsie ou accouchement prématuré', sublabel: 'Lors d\'une grossesse antérieure', value: 'history_preterm', score: 3 },
      { label: 'Grossesse multiple (jumeaux) ou pathologie maternelle préexistante', sublabel: 'Cardiaque, rénale, auto-immune', value: 'multiple_or_chronic', score: 4 },
    ],
  },
];

// Calculation and clinical orientation evaluation
export function evaluateAssessment(answers: Record<number, string>): AssessmentResultData {
  let totalScore = 0;
  let hasDirectEmergency = false;
  let emergencyReasons: string[] = [];

  for (const q of ASSESSMENT_QUESTIONS) {
    const selectedVal = answers[q.id];
    if (selectedVal) {
      const opt = q.options.find((o) => o.value === selectedVal);
      if (opt) {
        totalScore += opt.score;
        if (opt.isEmergency) {
          hasDirectEmergency = true;
          emergencyReasons.push(opt.label);
        }
      }
    }
  }

  // Level 4: Urgence médicale immédiate (15 / 112 / SAMU / Maternité)
  if (hasDirectEmergency || totalScore >= 14) {
    return {
      level: 'Urgence',
      title: 'Urgence médicale immédiate',
      colorHex: '#dc2626', // red-600
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      description:
        'Vos réponses mettent en évidence un ou plusieurs signaux d\'alerte obstétricaux critiques (ex : saignement rouge franc, baisse des mouvements de bébé, fièvre > 38°C, céphalées intenses avec troubles visuels ou rupture de la poche des eaux). Vous ne devez pas attendre.',
      actions: [
        'Contactez immédiatement le SAMU en composant le 15 ou le 112 sur votre téléphone.',
        'Ou rendez-vous sans délai aux urgences de votre maternité de rattachement.',
        'Ne prenez aucun médicament (ni aspirine, ni anti-inflammatoire) avant avis médical.',
        'Allongez-vous sur le côté gauche si vous devez attendre l\'arrivée des secours.',
      ],
      recommendedAdviceCategory: 'Signes d\'alerte',
      suggestedFacilityType: 'Maternité',
      emergencyPhoneToCall: '15',
    };
  }

  // Level 3: Consultation médicale rapide
  if (totalScore >= 8) {
    return {
      level: 'Consultation rapide',
      title: 'Consultation médicale rapide requise',
      colorHex: '#ea580c', // orange-600
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      description:
        'Plusieurs symptômes inhabituels ou persistants nécessitent un examen clinique par un médecin ou une sage-femme dans la journée ou sous 24 heures (ex : contractions régulières, fébrilité, douleurs abdominales modérées à fortes).',
      actions: [
        'Prenez contact avec votre sage-femme libérale ou le secrétariat de votre maternité pour une consultation le jour même.',
        'Reposez-vous allongée sur le côté gauche et hydratez-vous régulièrement.',
        'Surveillez l\'apparition de tout nouveau signe (saignements, fièvre, perte de liquide).',
        'Si les symptômes s\'intensifient brutalement, présentez-vous directement aux urgences maternité.',
      ],
      recommendedAdviceCategory: 'Consultations prénatales',
      suggestedFacilityType: 'Maternité',
      emergencyPhoneToCall: '15',
    };
  }

  // Level 2: Avis médical recommandé
  if (totalScore >= 4) {
    return {
      level: 'Avis médical recommandé',
      title: 'Avis médical recommandé',
      colorHex: '#0284c7', // sky-600
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-200',
      description:
        'Vos symptômes semblent correspondre à des désagréments fréquents de la grossesse (nausées, tensions lombaires, fatigue, spottings minimes). Un avis lors de votre prochain rendez-vous ou un appel de conseil à votre praticien permettra d\'ajuster votre accompagnement.',
      actions: [
        'Mentionnez précisément ces manifestations à votre sage-femme ou gynécologue lors de votre prochaine visite.',
        'Consultez les fiches conseils adaptées dans MAMAN+ pour mettre en place des gestes de soulagement validés.',
        'Adoptez des temps de repos réguliers et veillez à une bonne hydratation (1,5 à 2L par jour).',
        'Refaites cette évaluation si la gêne devient plus douloureuse ou persistante.',
      ],
      recommendedAdviceCategory: 'Grossesse générale',
      suggestedFacilityType: 'Centre de santé',
    };
  }

  // Level 1: Surveillance
  return {
    level: 'Surveillance',
    title: 'Surveillance et confort au quotidien',
    colorHex: '#16a34a', // green-600
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description:
      'Aucun signe d\'alerte aigu n\'a été détecté dans vos réponses. Vos ressentis semblent s\'inscrire dans l\'évolution physiologique normale de votre grossesse.',
    actions: [
      'Poursuivez votre suivi médical mensuel habituel en maternité ou cabinet libéral.',
      'Profitez de nos conseils du jour et vidéos thématiques pour accompagner votre bien-être.',
      'Gardez en mémoire les signes imposant une consultation d\'urgence (saignements rouges, fièvre > 38°C, baisse des mouvements).',
      'Restez à l\'écoute de votre corps et accordez-vous du temps de repos.',
    ],
    recommendedAdviceCategory: 'Grossesse générale',
  };
}
