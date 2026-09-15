# Documentation Technique de l API EcoleDirecte v3

Ce dossier rassemble la reference technique complete et anonymisee de l API privee d EcoleDirecte (version 3), documentant le protocole de communication, l authentification par double facteur QCM, l ensemble des modules metiers ainsi que les formats des requetes et reponses JSON.

## Sommaire de la Documentation

1. [01. Architecture et Authentification](01-architecture-et-authentification.md)
   - Protocole de communication (URL de base, headers requis, format data=).
   - Processus d authentification standard et cycle de vie du jeton X-Token.
   - Mecanisme de Double Authentification (2FA) par QCM encode en Base64.
   - Resolution automatique du challenge de securite.

2. [02. Profil et Vie Scolaire](02-profil-et-vie-scolaire.md)
   - Donnees d identite, types de comptes (Eleve, Famille, Professeur, Personnel) et modules actifs.
   - Timeline des evenements scolaires.
   - Gestion de la vie scolaire : absences, retards, sanctions et encouragements.

3. [03. Notes, Evaluations et Bulletins](03-notes-evaluations-et-bulletins.md)
   - Structure hierarchique des periodes, moyennes generales et moyennes de classe.
   - Details des evaluations : coefficients, baremes, notes non numeriques.
   - Recuperation des releves periodiques et telechargement des bulletins PDF officiels.

4. [04. Emploi du Temps](04-emploi-du-temps.md)
   - Format de requete par plage de dates.
   - Structure des creneaux de cours : matieres, enseignants, salles.
   - Gestion des etats specifiques : cours annules, remplacements, permanences.

5. [05. Cahier de Textes et Devoirs](05-cahier-de-textes-et-devoirs.md)
   - Vue globale du travail a faire regroupe par date.
   - Detail quotidien et contenus de seance dispenses par les enseignants.
   - Telechargement des pieces jointes et validation interactive des devoirs (effectue / non effectue).

6. [06. Messagerie et Communications](06-messagerie-et-communications.md)
   - Consultation des boites de reception, d envoi et de la corbeille.
   - Lecture du contenu detaille d un message (HTML formate, pieces jointes).
   - Modification du statut de lecture (marquer comme lu / non lu).

7. [07. Espaces Cloud, Restauration et Carnet](07-espaces-cloud-et-restauration.md)
   - Arborescence des fichiers du Cloud EcoleDirecte.
   - Suivi de la restauration scolaire, soldes et reservations de repas.
   - Carnet de correspondance numerique et signatures.

8. [08. Referentiel des Codes et Bonnes Pratiques](08-referentiel-codes-et-bonnes-pratiques.md)
   - Matrice complete des codes de retour de l API (200, 250, 505, 520, 525).
   - Recommandations pour la gestion des sessions et la reconnexion automatique.
   - Bonnes pratiques d integration et securite.
