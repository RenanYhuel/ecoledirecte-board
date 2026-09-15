# 08. Référentiel des Codes et Bonnes Pratiques

## 1. Matrice Exhaustive des Codes Applicatifs

| Code | Signification | Contexte d Apparition | Comportement Recommandé |
| :--- | :--- | :--- | :--- |
| `200` | Opération réussie | Requête valide avec données retournées. | Traiter `data` et actualiser le `token`. |
| `210` | Aucune donnée à afficher | Dossier vide (ex: 0 absence / retard dans `viescolaire.awp`). | Considérer l opération comme réussie avec collection vide. |
| `225` | Paramètres spécifiés incorrects | Omission des paramètres d URL obligatoires (`?verbe=get&v=...`). | Ajouter systématiquement `?verbe=get&v=4.101.4` dans l URL. |
| `250` | Double authentification requise | Première connexion ou ré-authentification avec QCM 2FA. | Décoder les propositions Base64 et soumettre le choix. |
| `403` | Module non activé ou accès interdit | Module désactivé pour l élève (ex: carnet de correspondance non souscrit). | Désactiver l affichage du composant concerné. |
| `404` | Ressource introuvable | Module absent de l établissement (ex: documents PDF non publiés). | Retourner un tableau vide ou état neutre. |
| `505` | Identifiants invalides | Mot de passe erroné ou compte verrouillé. | Signaler l erreur d identifiants à l utilisateur. |
| `520` | Session expirée | Jeton `X-Token` devenu caduc côté serveur. | Déclencher une ré-authentification transparente immédiate. |
| `525` | Jeton invalide ou corrompu | Format de jeton altéré. | Purger la session et forcer une reconnexion complète. |

---

## 2. Bonnes Pratiques d Intégration

1. **Format des Requêtes** : Toujours inclure `?verbe=get&v=4.101.4` en lecture et `?verbe=put&v=4.101.4` en modification pour éviter l erreur `225`.
2. **Gestion du Sliding Token** : Récupérer et stocker la valeur du champ `token` renvoyée à chaque réponse `200` pour la requête suivante.
3. **Reconnexion Transparente** : Dès réception d un code `520`, ré-exécuter la séquence `login.awp` + `doubleauth.awp` en arrière-plan sans bloquer l interface utilisateur.
