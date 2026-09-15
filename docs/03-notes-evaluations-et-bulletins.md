# 03. Notes, Évaluations et Bulletins

## 1. Notes et Moyennes Périodiques

### Endpoint : `POST /v3/eleves/{id}/notes.awp`

Permet d obtenir l intégralité des notes, les moyennes générales et par matière, ainsi que les statistiques de classe pour chaque période de l année scolaire.

#### Corps de la requête
```json
{
  "anneeScolaire": ""
}
```
*Note : Laisser une chaîne vide `""` sélectionne automatiquement l année scolaire en cours.*

#### Structure générale de la réponse JSON (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "foNote": "Note sur 20",
    "periodes": [
      {
        "idPeriode": "A001",
        "periode": "Trimestre 1",
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
      },
      {
        "id": 8502,
        "devoir": "TP Noté d Optique",
        "codePeriode": "A001",
        "codeMatiere": "PH-CH",
        "libelleMatiere": "Physique-Chimie",
        "date": "2026-09-14",
        "valeur": "Abs",
        "noteSur": "20",
        "coef": "1.00",
        "nonSignificatif": true,
        "typeDevoir": "TP"
      }
    ]
  }
}
```

---

## 2. Typologie et Traitement des Valeurs de Notes

ÉcoleDirecte utilise des chaînes de caractères avec virgule française (ex: `"15,50"`) ou des statuts spéciaux :

| Valeur (`valeur`) | `nonSignificatif` | Interprétation recommandée |
| :--- | :--- | :--- |
| `"14,50"` | `false` | Note numérique standard. Remplacer la virgule par un point pour le calcul (`14.50`). |
| `"Abs"` | `true` | Élève absent lors de l évaluation. Non comptabilisé dans la moyenne. |
| `"Disp"` | `true` | Élève dispensé légitimement (ex: certificat médical en EPS). |
| `"NE"` | `true` | Non évalué. |
| `"0,00"` | `false` | Note zéro comptabilisée avec le coefficient spécifié. |

---

## 3. Documents Scolaires et Bulletins PDF

### 1. Liste des documents : `POST /v3/eleves/{id}/documents.awp`

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
    "factures": [],
    "bulletins": [
      {
        "id": 140021,
        "date": "2026-06-28",
        "titre": "Bulletin du 3ème Trimestre 2025-2026",
        "codePeriode": "A003",
        "type": "bulletin"
      }
    ],
    "releves": [],
    "documents": []
  }
}
```

### 2. Téléchargement d un document : `POST /v3/eleves/{id}/documents/{document_id}.awp`

#### Corps de la requête
```json
{
  "forceDownload": 0
}
```

#### Réponse :
Renvoie soit le flux binaire direct du document PDF avec l en-tête `Content-Type: application/pdf`, soit un objet JSON contenant le document encodé en Base64 dans `data.fichier`.
