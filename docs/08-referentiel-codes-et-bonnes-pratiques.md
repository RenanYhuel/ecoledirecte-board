# 08. Référentiel des Codes et Bonnes Pratiques

## 1. Matrice des Codes de Statut JSON

L API d ÉcoleDirecte retourne systématiquement un statut HTTP `200 OK` au niveau transport, et véhicule le statut applicatif réel dans le champ JSON racine `code`.

| Code | Signification | Comportement Recommandé |
| :--- | :--- | :--- |
| `200` | Opération réussie | Traiter la charge utile contenue dans `data` et mettre à jour le jeton de session `token`. |
| `250` | Double authentification requise | Décoder la question et les propositions Base64, résoudre le challenge et appeler `/v3/connexion/doubleauth.awp`. |
| `505` | Identifiants invalides ou compte verrouillé | Interrompre les requêtes et inviter l utilisateur à vérifier son identifiant et son mot de passe. |
| `520` | Session expirée ou jeton révoqué | Déclencher une ré-authentification transparente (`login.awp` + `doubleauth.awp`) puis rejouer la requête initiale. |
| `525` | Jeton de session invalide ou format corrompu | Réinitialiser le stockage local des jetons et forcer un nouveau login complet. |
| `400` | Paramètres de requête invalides | Vérifier la structure du payload JSON transmis dans le paramètre `data=`. |
| `403` | Module ou ressource non accessible pour ce compte | Vérifier que le module correspondant figure bien avec `"enable": true` dans le profil du compte. |

---

## 2. Bonnes Pratiques d Intégration et de Robustesse

### 1. Gestion Dynamique du Jeton (`X-Token`)
Le jeton d ÉcoleDirecte utilise une stratégie de renouvellement par glissement (*sliding expiration*). Chaque réponse HTTP réussie contenant un champ `token` non vide doit immédiatement remplacer le jeton actuellement conservé en mémoire ou en session.

### 2. Traitement des Encodages et Caractères Spéciaux
Les données textuelles renvoyées par ÉcoleDirecte peuvent contenir des artefacts d encodage historiques (mélange CP1252 et UTF-8) ou des entités HTML. Il est recommandé d appliquer une passe de normalisation :
- Remplacement des séquences d échappement (`\u0027` vers `'`).
- Décodage des entités HTML standard (`&amp;` vers `&`, `&quot;` vers `"`, `&#039;` vers `'`).
- Nettoyage des balises de paragraphe et sauts de ligne pour les affichages condensés.

### 3. Gestion de la Concurrence et Rate Limiting
- **Agrégation parallèle raisonnée** : Lors de la construction d un tableau de bord (ex: chargement simultané des notes, devoirs, emploi du temps et messages), regrouper les appels avec `tokio::join!` ou `Promise.all` en limitant le parallélisme à 4 ou 5 requêtes simultanées pour éviter les blocages pare-feu.
- **Cache temporaire** : Les données statiques ou semi-statiques (profil, trimestres, configuration des modules) peuvent être mises en cache court (30 à 60 secondes) pour optimiser les temps de réponse.

### 4. Sécurité et Confidentialité
- Ne jamais versionner d identifiants, de mots de passe ou de jetons d accès dans les dépôts de code source.
- Centraliser tous les paramètres d authentification dans des variables d environnement (`.env`).
- S assurer que les réponses de l API exposées aux interfaces clientes n intègrent pas de données brutes superflues.
