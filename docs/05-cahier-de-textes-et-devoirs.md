# 05. Cahier de Textes et Devoirs

## 1. Vue Globale du Travail à Faire

### Endpoint : `POST /v3/Eleves/{id}/cahierdetexte.awp?verbe=get&v=4.101.4`

Renvoie un dictionnaire dont les clés sont les dates d échéance (`YYYY-MM-DD`) et les valeurs les tableaux de devoirs.

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
    ]
  }
}
```

---

## 2. Détail Quotidien et Contenu de Séance

### Endpoint : `POST /v3/Eleves/{id}/cahierdetexte/{date}.awp?verbe=get&v=4.101.4`

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
          "contenu": "<p>Faire les exercices <strong>12 et 14 page 85</strong>.</p>",
          "effectue": false,
          "rendreEnLigne": false,
          "documents": [
            {
              "id": 40182,
              "libelle": "Fiche_Exercices.pdf",
              "taille": 245760
            }
          ]
        },
        "contenuDeSeance": {
          "id": 8802,
          "contenu": "<p>Chapitre 2 : Démonstrations et applications.</p>",
          "documents": []
        }
      }
    ]
  }
}
```

---

## 3. Validation d un Devoir

### Endpoint : `PUT /v3/Eleves/{id}/cahierdetexte.awp?verbe=put&v=4.101.4`

```json
{
  "idDevoir": 9501,
  "effectue": true
}
```
