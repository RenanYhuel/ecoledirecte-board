# EcoleDirecte Cockpit Dashboard

Tableau de bord temps reel pour EcoleDirecte, concu pour fonctionner en mode cockpit sur un ecran dedie (haute densite, auto-defilement ping-pong fluide sans barre de defilement, 100vh sans debordement).

## Architecture

Le projet est compose de deux parties autonomes :
- **Backend (Rust / Axum / Tokio / Reqwest)** : Passerelle API securisee assurant l'authentification avec EcoleDirecte, le renouvellement automatique des jetons de session, la resolution automatique du challenge 2FA par reconnaissance semantique, et l'agregation concurrente des donnees du tableau de bord.
- **Dashboard (React 19 / TypeScript / Vite / Tailwind CSS)** : Interface cockpit en theme clair structuree en Bento Grid responsive.

Aucune donnee n'est hardcodee dans le code source : toute l'authentification et les reglages transitent par les variables d'environnement (.env).

## Pre-requis

- **Option A (Docker)** : Docker et Docker Compose
- **Option B (Execution locale directe)** : Rust 1.80+ (Cargo) et Node.js 20+ (npm)

## Configuration (.env)

Copiez le fichier modele a la racine du projet :

```bash
cp .env.example .env
```

Remplissez vos identifiants dans le fichier `.env` :

```env
ECOLEDIRECTE_USERNAME=votre_identifiant
ECOLEDIRECTE_PASSWORD=votre_mot_de_passe
ECOLEDIRECTE_AUTO_SOLVE_2FA=true
SERVER_PORT=3001
VITE_API_URL=/api
```

## Demarrage avec Docker Compose

Pour construire et lancer les conteneurs du backend et du dashboard :

```bash
docker compose up --build
```

- Dashboard accessible sur : `http://localhost:5173`
- Backend API accessible sur : `http://localhost:3001`

Pour arreter les conteneurs :

```bash
docker compose down
```

## Demarrage en Developpement Local

### 1. En un clic (PowerShell)

```powershell
.\start-all.ps1
```

### 2. Ou dans deux terminaux separes

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

Le dashboard est accessible sur `http://localhost:5174` (ou le port indique par Vite) et se connecte automatiquement au backend sur le port `3001`.

## Endpoints API de la Passerelle

- `GET /api/auth/status` : Statut de la session en cours
- `POST /api/auth/login` : Authentification et resolution 2FA
- `POST /api/auth/logout` : Deconnexion et suppression du jeton
- `GET /api/dashboard/overview` : Agregation globale (identite, emploi du temps aujourd'hui et demain, devoirs, notes recentes, moyennes, messagerie)
- `PUT /api/homework/:id/toggle` : Validation ou reouverture d'un devoir
- `GET /api/messages/:id/:msg_id` : Contenu complet d'un message
- `PUT /api/messages/:id/:msg_id/read` : Marquer un message comme lu ou non lu

## Fonctionnalites Cles du Dashboard

- **Horloge & Identite** : Heure exacte et date francaise, nom de l'eleve et classe charges dynamiquement depuis le compte.
- **Emploi du Temps** : Selecteur Aujourd'hui / Demain, jauge de progression en temps reel sur le cours en direct, salles et professeurs.
- **Cahier de Textes & Devoirs** : Distinction visuelle claire entre devoirs a faire (couleurs thematiques de matiere) et devoirs faits (attenues en gris avec texte barre), bouton interactif de validation instantanee avec synchronisation EcoleDirecte.
- **Notes & Evaluations** : Moyennes generale et de classe, coefficient, date et moyenne de groupe pour chaque evaluation.
- **Messagerie** : Categorisation automatique par statut et service (Professeurs, Direction, Administration, Pastorale), horodatage francais, bouton de bascule Lu / Non lu direct.
- **Auto-defilement Ping-Pong** : Defilement continu aller-retour automatique sur les listes longues avec pause sur survol souris ou tactile.
