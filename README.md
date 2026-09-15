# ÉcoleDirecte Cockpit Dashboard

Tableau de bord en temps réel pour ÉcoleDirecte, conçu pour fonctionner en mode cockpit sur un écran dédié (haute densité d'affichage, auto-défilement ping-pong fluide sans barre de défilement apparente, 100vh sans débordement).

## Architecture

Le projet est composé de deux parties autonomes :
- **Backend (Rust / Axum / Tokio / Reqwest)** : Passerelle API sécurisée assurant l'authentification avec ÉcoleDirecte, le renouvellement automatique des jetons de session, la résolution automatique du challenge 2FA par reconnaissance sémantique, et l'agrégation concurrente des données du tableau de bord.
- **Dashboard (React 19 / TypeScript / Vite / Tailwind CSS)** : Interface cockpit en thème clair structurée en Bento Grid responsive.

Aucune donnée n'est codée en dur dans le code source : toute l'authentification et les réglages transitent par les variables d'environnement (`.env`).

## Prérequis

- **Option A (Docker)** : Docker et Docker Compose
- **Option B (Exécution locale directe)** : Rust 1.80+ (Cargo) et Node.js 20+ (npm)

## Configuration (.env)

Copiez le fichier modèle à la racine du projet :

```bash
cp .env.example .env
```

Renseignez vos identifiants dans le fichier `.env` :

```env
ECOLEDIRECTE_USERNAME=votre_identifiant
ECOLEDIRECTE_PASSWORD=votre_mot_de_passe
ECOLEDIRECTE_AUTO_SOLVE_2FA=true
SERVER_PORT=3001
VITE_API_URL=/api
```

## Démarrage avec Docker Compose

Pour construire et lancer les conteneurs du backend et du dashboard :

```bash
docker compose up --build
```

- Dashboard accessible sur : `http://localhost:5173`
- Backend API accessible sur : `http://localhost:3001`

Pour arrêter les conteneurs :

```bash
docker compose down
```

## Démarrage en Développement Local

### 1. En un clic (PowerShell)

```powershell
.\start-all.ps1
```

### 2. Ou dans deux terminaux séparés

**Terminal 1 - Backend Rust** :
```bash
cd backend
cargo run
```

**Terminal 2 - Dashboard Vite** :
```bash
cd dashboard
npm install
npm run dev
```

Le dashboard est accessible sur `http://localhost:5174` (ou le port indiqué par Vite) et se connecte automatiquement au backend sur le port `3001`.

## Endpoints API de la Passerelle

- `GET /api/auth/status` : Statut de la session en cours
- `POST /api/auth/login` : Authentification et résolution 2FA
- `POST /api/auth/logout` : Déconnexion et suppression du jeton
- `GET /api/dashboard/overview` : Agrégation globale (identité, emploi du temps aujourd'hui et demain, devoirs, notes récentes, moyennes, messagerie)
- `PUT /api/homework/:id/toggle` : Validation ou réouverture d'un devoir
- `GET /api/messages/:id/:msg_id` : Contenu complet d'un message
- `PUT /api/messages/:id/:msg_id/read` : Marquer un message comme lu ou non lu

## Fonctionnalités Clés du Dashboard

- **Horloge & Identité** : Heure exacte et date française, nom de l'élève et classe chargés dynamiquement depuis le compte.
- **Emploi du Temps** : Sélecteur Aujourd'hui / Demain, jauge de progression en temps réel sur le cours en direct, salles et professeurs.
- **Cahier de Textes & Devoirs** : Distinction visuelle claire entre devoirs à faire (couleurs thématiques par matière) et devoirs faits (atténués en gris avec texte barré), bouton interactif de validation instantanée avec synchronisation ÉcoleDirecte.
- **Notes & Évaluations** : Moyennes générale et de classe, coefficient, date et moyenne de groupe pour chaque évaluation.
- **Messagerie** : Catégorisation automatique par statut et service (Professeurs, Direction, Administration, Pastorale), horodatage français, bouton de bascule Lu / Non lu direct.
- **Auto-défilement Ping-Pong** : Défilement continu aller-retour automatique sur les listes longues avec pause lors du survol par la souris ou du toucher tactile.
