# 02. Profil et Vie Scolaire

## 1. Structure du Compte Utilisateur

Lors de l authentification, le tableau `data.accounts` renvoie un ou plusieurs comptes associés aux identifiants.

### Typologie des Comptes (`typeCompte`)

| Code | Type de Compte | Description |
| :--- | :--- | :--- |
| `E` | Élève | Compte individuel de l élève avec accès direct à ses données scolaires. |
| `1` ou `2` | Famille / Responsable | Compte parent pouvant superviser un ou plusieurs élèves rattachés (`data.accounts[0].eleves`). |
| `P` | Enseignant / Professeur | Accès au cahier de textes enseignant, saisie des notes et appel. |
| `A` / `D` | Administration / Direction | Gestion globale de l établissement et vie scolaire. |

### Référentiel des Modules (`modules`)

Chaque compte expose la liste des fonctionnalités activées par l établissement :

- `NOTES` : Consultation des évaluations et moyennes.
- `CAHIER_DE_TEXTES` : Devoirs et contenus de cours.
- `EDT` : Emploi du temps temps réel.
- `MESSAGERIE` : Boîte de réception et d envoi d emails internes.
- `VIE_SCOLAIRE` : Absences, retards, passages à l infirmerie, sanctions.
- `DOCUMENTS` : Bulletins périodiques, certificats de scolarité, factures.
- `CLOUD` : Espace de stockage et partage de documents pédagogiques.
- `RESTAURATION` : Réservation de repas et solde du badge self.
- `CARNET_CORRESPONDANCE` : Échanges formalisés école-famille et signatures.

---

## 2. Timeline Scolaire

### Endpoint : `POST /v3/Eleves/{id}/timeline.awp`

Permet d obtenir le fil d actualité chronologique des événements récents affectant l élève (nouvelles notes publiées, devoirs ajoutés, messages non lus, modifications d emploi du temps).

#### Corps de la requête
```json
{}
```

#### Réponse type (Code 200)
```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": [
    {
      "date": "2026-09-15 14:30:00",
      "typeElement": "NOTE",
      "idElement": 8541,
      "titre": "Nouvelle note en Mathématiques",
      "soustitre": "Devoir surveillé 1",
      "contenu": "Note : 17.5 / 20"
    },
    {
      "date": "2026-09-15 11:00:00",
      "typeElement": "DEVOIR",
      "idElement": 9230,
      "titre": "Devoir à rendre en Philosophie",
      "soustitre": "Pour le 2026-09-18",
      "contenu": "Dissertation : La liberté est-elle une illusion ?"
    }
  ]
}
```

---

## 3. Module Vie Scolaire

### Endpoint : `POST /v3/eleves/{id}/viescolaire.awp`

#### Corps de la requête
```json
{}
```

#### Réponse type (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "absencesRetards": [
      {
        "id": 4012,
        "typeElement": "Absence",
        "date": "2026-09-10",
        "displayDate": "Le 10/09/2026 de 08:00 à 10:00",
        "libelle": "Absence demi-journée",
        "motif": "Rendez-vous médical",
        "justifie": true,
        "par": "Responsable légal",
        "commentaire": "Justificatif médical fourni au secrétariat."
      },
      {
        "id": 4015,
        "typeElement": "Retard",
        "date": "2026-09-14",
        "displayDate": "Le 14/09/2026 à 08:12",
        "libelle": "Retard 12 minutes",
        "motif": "Problème de transport en commun",
        "justifie": false,
        "commentaire": ""
      }
    ],
    "sanctionsEncouragements": [
      {
        "id": 102,
        "typeElement": "Encouragement",
        "date": "2026-06-25",
        "libelle": "Félicitations du Conseil de Classe",
        "motif": "Excellents résultats et investissement continu",
        "commentaire": "Trimestre remarquable."
      }
    ],
    "parametrage": {
      "justificationEnLigne": true,
      "absenceCommentaire": true
    }
  }
}
```

### Typologie des Absences et Retards
- `typeElement` : `"Absence"` ou `"Retard"`.
- `justifie` : Booléen (`true` si validé par la vie scolaire).
- `displayDate` : Format textuel prêt pour l affichage.
