# 03. Notes, Évaluations et Bulletins

## 1. Notes et Moyennes Périodiques

### Endpoint : `POST /v3/eleves/{id}/notes.awp?verbe=get&v=4.101.4`

Permet d obtenir l intégralité des notes, les moyennes générales et par matière, ainsi que les statistiques de classe pour chaque période de l année scolaire.

#### Corps de la requête
```json
{
  "anneeScolaire": ""
}
```

#### Structure de la réponse JSON vérifiée (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "foStat": "",
    "parametrage": {
      "affichageAppreciation": true,
      "affichageRang": false
    },
    "periodes": [
      {
        "idPeriode": "A001",
        "periode": "1er Trimestre",
        "annuel": false,
        "dateDebut": "2026-09-01",
        "dateFin": "2026-11-30",
        "cloture": false,
        "ensembleMatieres": {
          "moyenneGenerale": "15,82",
          "moyenneClasse": "13,40",
          "moyenneMin": "09,15",
          "moyenneMax": "17,90",
          "nomPP": "Mme MARTIN",
          "disciplines": [
            {
              "id": 101,
              "codeMatiere": "MATHS",
              "discipline": "Mathématiques",
              "coef": 1.0,
              "moyenne": "16,50",
              "moyenneClasse": "12,80",
              "moyenneMin": "07,50",
              "moyenneMax": "19,00",
              "professeurs": [
                { "id": 501, "nom": "M. DURAND" }
              ]
            }
          ]
        }
      }
    ],
    "notes": [
      {
        "id": 8501,
        "devoir": "Interrogation de cours 1",
        "codePeriode": "A001",
        "codeMatiere": "MATHS",
        "libelleMatiere": "Mathématiques",
        "codeSousMatiere": "",
        "date": "2026-09-12",
        "valeur": "17,50",
        "noteSur": "20",
        "coef": "1.00",
        "nonSignificatif": false,
        "typeDevoir": "Contrôle continu",
        "commentaire": "Très bon raisonnement",
        "moyenne": "13,20",
        "min": "06,00",
        "max": "19,50"
      }
    ]
  }
}
```

---

## 2. Typologie et Traitement des Valeurs de Notes

| Valeur (`valeur`) | `nonSignificatif` | Interprétation recommandée |
| :--- | :--- | :--- |
| `"14,50"` | `false` | Note numérique standard. Remplacer la virgule par un point pour le calcul (`14.50`). |
| `"Abs"` | `true` | Élève absent lors de l évaluation. Non comptabilisé dans la moyenne. |
| `"Disp"` | `true` | Élève dispensé légitimement. |
| `"NE"` | `true` | Non évalué. |
| `"0,00"` | `false` | Note zéro comptabilisée. |

---

## 3. Documents Scolaires et Bulletins PDF

### 1. Liste des documents : `POST /v3/eleves/{id}/documents.awp?verbe=get&v=4.101.4`

- Si le module est activé : renvoie le code `200` avec la liste des `bulletins`, `releves` et `factures`.
- Si le module n est pas souscrit par l établissement : renvoie le code `404` avec `data: null`.

### 2. Téléchargement d un document : `POST /v3/eleves/{id}/documents/{document_id}.awp?verbe=get&v=4.101.4`

```json
{
  "forceDownload": 0
}
```
