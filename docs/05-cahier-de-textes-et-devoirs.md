# 05. Cahier de Textes et Devoirs

## 1. Vue Globale du Travail à Faire

### Endpoint : `POST /v3/Eleves/{id}/cahierdetexte.awp`

Permet d obtenir l ensemble des devoirs programmés pour les jours à venir, indexés par date d échéance.

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
    "2026-09-16": [
      {
        "id": 9501,
        "matiere": "Mathématiques",
        "codeMatiere": "MATHS",
        "aFaire": true,
        "idDevoir": 9501,
        "donneLe": "2026-09-12",
        "pourLe": "2026-09-16",
        "effectue": false,
        "interrogation": false,
        "rendreEnLigne": false,
        "type": "Exercice",
        "nbPieceJointe": 1
      }
    ],
    "2026-09-18": [
      {
        "id": 9504,
        "matiere": "Philosophie",
        "codeMatiere": "PHILO",
        "aFaire": true,
        "idDevoir": 9504,
        "donneLe": "2026-09-11",
        "pourLe": "2026-09-18",
        "effectue": true,
        "interrogation": true,
        "rendreEnLigne": false,
        "type": "Évaluation",
        "nbPieceJointe": 0
      }
    ]
  }
}
```

---

## 2. Détail Quotidien et Contenu de Séance

### Endpoint : `POST /v3/Eleves/{id}/cahierdetexte/{date}.awp`

Récupère le détail exhaustif pour une date donnée (`YYYY-MM-DD`), incluant le contenu pédagogique de chaque cours dispensé, la description complète des devoirs (format HTML) et la liste des pièces jointes.

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
    "date": "2026-09-16",
    "matieres": [
      {
        "id": 1204,
        "matiere": "Mathématiques",
        "codeMatiere": "MATHS",
        "nomEnseignant": "M. DURAND",
        "aFaire": {
          "id": 9501,
          "donneLe": "2026-09-12",
          "contenu": "<p>Faire les exercices <strong>12 et 14 page 85</strong>.<br/>Réviser les théorèmes de continuité.</p>",
          "effectue": false,
          "rendreEnLigne": false,
          "documents": [
            {
              "id": 40182,
              "libelle": "Fiche_Exercices_Continuite.pdf",
              "type": "DOCUMENT",
              "signature": "abcd1234ef",
              "taille": 245760
            }
          ]
        },
        "contenuDeSeance": {
          "id": 8802,
          "contenu": "<p>Chapitre 2 : Théorème des valeurs intermédiaires.<br/>Démonstration du corollaire d injectivité.</p>",
          "documents": []
        }
      }
    ]
  }
}
```

---

## 3. Validation et Statut d un Devoir

### Endpoint : `PUT /v3/Eleves/{id}/cahierdetexte.awp`

Permet à l élève de cocher ou décocher un travail personnel comme effectué sur son compte.

#### Corps de la requête
```json
{
  "idDevoir": 9501,
  "effectue": true
}
```

- `idDevoir` (entier) : Identifiant unique du devoir.
- `effectue` (booléen) : `true` pour marquer comme fait, `false` pour remettre à faire.

#### Réponse type (Code 200)
```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {},
  "message": ""
}
```
