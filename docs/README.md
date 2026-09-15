# Documentation Technique de l'API ÉcoleDirecte v3

Ce dossier rassemble la référence technique complète et anonymisée de l'API privée d'ÉcoleDirecte (version 3), documentant le protocole de communication, l'authentification par double facteur QCM, l'ensemble des modules métiers ainsi que les formats des requêtes et réponses JSON.

## Sommaire de la Documentation

1. [01. Architecture et Authentification](01-architecture-et-authentification.md)
   - Protocole de communication (URL de base, en-têtes requis, format `data=`).
   - Processus d'authentification standard et cycle de vie du jeton `X-Token`.
   - Mécanisme de Double Authentification (2FA) par QCM encodé en Base64.
   - Résolution automatique du challenge de sécurité.

2. [02. Profil et Vie Scolaire](02-profil-et-vie-scolaire.md)
   - Données d'identité, types de comptes (Élève, Famille, Professeur, Personnel) et modules actifs.
   - Timeline des événements scolaires.
   - Gestion de la vie scolaire : absences, retards, sanctions et encouragements.

3. [03. Notes, Évaluations et Bulletins](03-notes-evaluations-et-bulletins.md)
   - Structure hiérarchique des périodes, moyennes générales et moyennes de classe.
   - Détails des évaluations : coefficients, barèmes, notes non numériques.
   - Récupération des relevés périodiques et téléchargement des bulletins PDF officiels.

4. [04. Emploi du Temps](04-emploi-du-temps.md)
   - Format de requête par plage de dates.
   - Structure des créneaux de cours : matières, enseignants, salles.
   - Gestion des états spécifiques : cours annulés, remplacements, permanences.

5. [05. Cahier de Textes et Devoirs](05-cahier-de-textes-et-devoirs.md)
   - Vue globale du travail à faire regroupé par date.
   - Détail quotidien et contenus de séance dispensés par les enseignants.
   - Téléchargement des pièces jointes et validation interactive des devoirs (effectué / non effectué).

6. [06. Messagerie et Communications](06-messagerie-et-communications.md)
   - Consultation des boîtes de réception, d'envoi et de la corbeille.
   - Lecture du contenu détaillé d'un message (HTML formaté, pièces jointes).
   - Modification du statut de lecture (marquer comme lu / non lu).

7. [07. Espaces Cloud, Restauration et Carnet](07-espaces-cloud-et-restauration.md)
   - Arborescence des fichiers du Cloud ÉcoleDirecte.
   - Suivi de la restauration scolaire, soldes et réservations de repas.
   - Carnet de correspondance numérique et signatures.

8. [08. Référentiel des Codes et Bonnes Pratiques](08-referentiel-codes-et-bonnes-pratiques.md)
   - Matrice complète des codes de retour de l'API (200, 210, 225, 250, 403, 404, 505, 520, 525).
   - Recommandations pour la gestion des sessions et la reconnexion automatique.
   - Bonnes pratiques d'intégration et sécurité.
