# MAMAN+ — Maternité & Santé

**MAMAN+** est une application web moderne, bienveillante et sécurisée dédiée au suivi de grossesse, au bien-être de la future maman et à la préparation de l'arrivée de bébé.

---

## 🌟 Présentation

MAMAN+ accompagne chaque future maman pas à pas tout au long de sa grossesse :
- **Suivi obstétrical semaine par semaine** : taille et poids du fœtus comparés à des repères visuels, développement des organes.
- **Calendrier & Rendez-vous prénataux** : organisation des consultations prénatales (CPN), échographies et analyses biologiques.
- **Surveillance quotidienne des symptômes** : journal de bord, repérage des signaux d'alerte et conseils de prévention.
- **Courbe de poids & IMC** : suivi personnalisé de la prise de poids par rapport aux couloirs de santé recommandés.
- **Ordonnances & Traitements** : gestion des prescriptions de vitamines, fer et compléments.
- **Synthèse médicale PDF** : exportation en un clic d'un carnet récapitulatif clair pour le médecin ou la sage-femme.
- **Valise de maternité & Checklist** : préparatifs administratifs et matériels pour maman et bébé.
- **Journal intime** : souvenirs, émotions, prénoms et questions pour le praticien.

---

## 🛠️ Technologies & Stack

- **Frontend** : React 19, TypeScript, Tailwind CSS 4, Motion (animations fluides).
- **Backend & API** : Node.js, Express (pour le serveur proxy sécurisé et les actions server-side).
- **Intelligence Artificielle** : SDK `@google/genai` (pour l'assistant virtuel intelligent MAMAN+).
- **Stockage & Persistance** : Firebase Firestore & Authentication.
- **Build System** : Vite, ESBuild.
- **PWA (Progressive Web App)** : Installable sur mobile et ordinateur avec support hors-ligne (Service Worker & Manifest).

---

## 📦 Installation

Clonez le dépôt et installez les dépendances avec votre gestionnaire de paquets préféré (npm, bun ou pnpm) :

```bash
# Cloner le dépôt
git clone https://github.com/votre-compte/maman-plus.git
cd maman-plus

# Installer les dépendances
npm install
```

---

## 💻 Développement

Pour lancer l'application en mode développement local :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

---

## 🏗️ Build de Production

Pour compiler l'application pour la production :

```bash
npm run build
```

Pour démarrer le serveur de production compilé :

```bash
npm start
```

---

## ⚙️ Variables d'Environnement

Le projet utilise des variables d'environnement pour configurer l'accès à Firebase et aux API externes.

1. Dupliquez le fichier `.env.example` et renommez-le en `.env` (ou `.env.local`).
2. Renseignez les variables nécessaires :

```env
VITE_FIREBASE_API_KEY=votre_cle_api_firebase
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
```

⚠️ **Important** : Ne committez **jamais** vos fichiers `.env`, `.env.local` ou `.env.production` contenant des secrets dans Git.

---

## 📱 Progressive Web App (PWA)

MAMAN+ est une PWA entièrement installable. Lorsque vous visitez l'application sur un navigateur compatible (Chrome, Safari, Edge), vous pouvez l'installer directement sur l'écran d'accueil de votre téléphone ou de votre bureau pour un accès rapide et une consultation fluide même en cas de réseau intermittent.

---

## 🗂️ Structure du Projet

```text
src/
├── assets/            # Logos, emblèmes et illustrations officielles
├── components/        # Composants UI modulaires (Header, Sidebar, Modals, LandingPage, LoginPage)
│   ├── resources/     # Modules publics (Conseils, fiches santé, structures de santé)
│   └── views/         # Écrans principaux du dashboard et de l'application
├── contexts/          # Contextes React (AuthContext, UserDataContext)
├── data/              # Bases de données statiques (conseils, FAQ, santés)
├── server/            # Actions serveur et intégration Gemini API
├── services/          # Services Firestore, Firebase Auth, Analytics & Géolocalisation
├── App.tsx            # Routeur principal et gestion des accès publics/privés
└── main.tsx           # Point d'entrée React
```

---

## 🩺 Déontologie Médicale

MAMAN+ est un outil de suivi personnel et d'éducation sanitaire. Il ne remplace en aucun cas un avis, diagnostic ou traitement médical fourni par un médecin ou une sage-femme qualifiée.
