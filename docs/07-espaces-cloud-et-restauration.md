# 07. Espaces Cloud, Restauration et Carnet

## 1. Espace de Stockage Cloud

### Endpoint : `POST /v3/cloud.awp` ou `POST /v3/Eleves/{id}/cloud.awp`

Permet d accéder aux dossiers partagés par les enseignants ou à l espace personnel de stockage de l élève.

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
      "id": "root",
      "libelle": "Espace Collaboratif",
      "type": "folder",
      "children": [
        {
          "id": "f_101",
          "libelle": "Mathématiques - Cours et Exercices",
          "type": "folder",
          "proprietaire": "M. DURAND",
          "date": "2026-09-10",
          "children": [
            {
              "id": "doc_552",
              "libelle": "Chapitre1_Suites_Numeriques.pdf",
              "type": "file",
              "taille": 1048576,
              "extension": "pdf",
              "url": "/v3/telechargement.awp?id=doc_552"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 2. Restauration Scolaire et Réservations de Repas

### 1. Solde et Passages au Self : `POST /v3/eleves/{id}/restauration.awp`

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
    "solde": "45,50",
    "devise": "EUR",
    "numeroBadge": "8849201",
    "derniersPassages": [
      {
        "date": "2026-09-15 12:15:00",
        "montant": "-4,20",
        "libelle": "Repas Midi - Self"
      },
      {
        "date": "2026-09-14 12:18:00",
        "montant": "-4,20",
        "libelle": "Repas Midi - Self"
      }
    ]
  }
}
```

### 2. Réservation de Repas : `POST /v3/eleves/{id}/reservations.awp`

Permet de réserver ou d annuler des repas pour les jours scolaires à venir.

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "jours": [
      {
        "date": "2026-09-21",
        "repasReserve": true,
        "bloque": false,
        "tarif": "4.20"
      },
      {
        "date": "2026-09-22",
        "repasReserve": false,
        "bloque": false,
        "tarif": "4.20"
      }
    ]
  }
}
```

---

## 3. Carnet de Correspondance Numérique

### Endpoint : `POST /v3/eleves/{id}/carnetcorrespondance.awp`

Permet de consulter les communications officielles de l établissement exigeant un accusé de réception ou une signature des responsables légaux.

#### Réponse type (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "mots": [
      {
        "id": 781,
        "date": "2026-09-08",
        "titre": "Règlement intérieur de l établissement",
        "contenu": "Merci de prendre connaissance et de signer le règlement intérieur 2026-2027.",
        "emetteur": "Direction du Lycée",
        "signatureRequise": true,
        "estSigne": true,
        "dateSignature": "2026-09-09 19:30:00"
      }
    ]
  }
}
```
