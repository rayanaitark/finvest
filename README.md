# FinVest — Simulateur d'investissement

Application web interactive permettant de simuler des placements financiers et de visualiser la puissance des intérêts composés. Projet réalisé dans le cadre du cours de WebDev à l'ESILV (4A Fintech).

## Description

FinVest permet à un utilisateur de :

- **Créer un compte** avec vérification d'email (token par mail, ou lien direct en mode dev)
- **Se connecter / se déconnecter** via JWT stocké en cookie httpOnly
- **Créer des simulations d'investissement** en renseignant un capital initial, des versements mensuels, un taux annuel et une durée
- **Visualiser une projection en temps réel** pendant la saisie du formulaire (courbe SVG custom)
- **Consulter ses simulations sauvegardées** avec un dashboard qui agrège les stats
- **Voir le détail d'une simulation** avec un graphique et un tableau année par année
- **Supprimer des simulations**

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Vue.js 3 (beta), Vite, Vue Router 5, Pinia 3 |
| Backend | Node.js, Fastify 5, Mongoose 9 |
| Base de données | MongoDB (via Docker) |
| Auth | JWT (@fastify/jwt) + cookie httpOnly |
| Monorepo | npm workspaces + Turborepo |

## Architecture

```
.
├── client/                  # Frontend Vue.js
│   ├── src/
│   │   ├── assets/          # CSS global (main.css)
│   │   ├── components/      # Composants réutilisables (SimulationChart)
│   │   ├── composables/     # Helpers (useFormat)
│   │   ├── router/          # Vue Router + guards d'auth
│   │   ├── services/        # Couche API (fetch wrapper)
│   │   ├── stores/          # Pinia stores (auth, simulations)
│   │   └── views/           # Pages (Home, Login, Register, Dashboard...)
│   └── vite.config.js       # Config Vite + proxy dev
├── server/                  # Backend Fastify
│   ├── src/
│   │   ├── plugins/         # Auth (JWT/cookie), Mongoose
│   │   ├── users/           # Schema + routes utilisateurs + auth
│   │   ├── simulations/     # Schema + routes simulations (notre feature)
│   │   ├── services/        # Mailer (nodemailer)
│   │   └── utils/           # Crypto (bcrypt)
│   └── tests/               # Fichier .http pour tester l'API
├── mongo-init/              # Script d'init MongoDB (optionnel, pour Docker)
├── docker-compose.yml       # MongoDB en container (optionnel)
└── turbo.json               # Orchestration Turborepo
```

## Prérequis

- **Node.js 22+** (ou 20.19+)
- **npm** (livré avec Node)
- **Un cluster MongoDB Atlas** (gratuit : https://www.mongodb.com/cloud/atlas)

## Installation

```bash
# Cloner le repo
git clone https://github.com/rayanaitark/finvest.git
cd finvest

# Installer toutes les dépendances (workspaces)
npm install
```

## Configurer la base de données (MongoDB Atlas)

1. Créez un cluster gratuit (M0) sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Dans **Database Access**, créez un utilisateur avec mot de passe
3. Dans **Network Access**, ajoutez votre IP (ou `0.0.0.0/0` pour le dev)
4. Cliquez **Connect > Drivers** et copiez la connection string
5. Dans `server/.env.development.local`, remplacez la valeur de `MONGODB_URI` :

```
MONGODB_URI=mongodb+srv://votre-user:votre-mdp@votre-cluster.mongodb.net/finvest?retryWrites=true&w=majority
```

## Lancer le serveur backend

Le fichier `.env.development.local` est déjà configuré dans `server/`. Si besoin, copiez `.env-example` et adaptez.

```bash
# Depuis la racine (via Turborepo)
npm run dev

# Ou individuellement
cd server && npm run dev
```

Le serveur écoute sur **http://localhost:3000**.

## Lancer le frontend

```bash
# Depuis la racine (lancé en parallèle par npm run dev)
# Ou individuellement
cd client && npm run dev
```

Le frontend est accessible sur **http://localhost:5173**. Le proxy Vite redirige `/api/*` vers le backend.

## Routes API

### Auth (`/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription (email, username, password) |
| POST | `/auth/login` | Connexion (retourne un cookie JWT) |
| POST | `/auth/logout` | Déconnexion (efface le cookie) |
| POST | `/auth/resend-verification-email` | Renvoyer l'email de validation |

### Users (`/users`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users/verify-email?token=...` | Valider son email |
| GET | `/users/me` | Profil de l'utilisateur connecté |
| GET | `/users` | Liste des utilisateurs (paginée) |
| GET | `/users/:id` | Détail d'un utilisateur |
| DELETE | `/users/:id` | Supprimer un utilisateur |

### Simulations (`/simulations`) — toutes protégées

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/simulations` | Mes simulations |
| GET | `/simulations/:id` | Détail + breakdown année par année |
| POST | `/simulations` | Créer une simulation |
| POST | `/simulations/preview` | Preview sans sauvegarder |
| DELETE | `/simulations/:id` | Supprimer une simulation |

## Choix techniques

- **Pas de librairie de chart** : le graphique est un composant SVG maison (`SimulationChart.vue`). C'est plus léger et ça m'a permis de comprendre comment fonctionne un graphique sous le capot.
- **Proxy Vite en dev** : plutôt que de gérer CORS dans le navigateur, le proxy `/api → :3000` simplifie tout. CORS est quand même configuré côté Fastify pour la prod.
- **Cookie httpOnly pour le JWT** : plus sécurisé que de stocker le token en localStorage (pas accessible par du JS malveillant).
- **Calcul des intérêts côté serveur** : le calcul se fait mois par mois dans une boucle (pas de formule fermée), ce qui est plus lisible et extensible.
- **Design éditorial** : j'ai voulu éviter le look "dashboard SaaS classique". Le choix cream + encre + vert profond s'inspire des journaux financiers (FT, etc.) mais en version moderne.

## Déploiement

- **Frontend** : Netlify — build command `npm run build` dans `client/`, publish directory `client/dist`
- **Backend** : Render — build command `npm install` dans `server/`, start command `node src/index.js` avec les variables d'env configurées

## Auteur

Rayan Ait Ark — ESILV A4 Fintech, 2026
