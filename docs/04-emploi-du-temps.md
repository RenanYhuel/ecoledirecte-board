# 04. Emploi du Temps

## 1. Consultation de l Emploi du Temps

### Endpoint : `POST /v3/E/{id}/emploidutemps.awp`

Permet d obtenir les séances de cours programmées pour une période donnée.

#### Corps de la requête
```json
{
  "dateDebut": "2026-09-15",
  "dateFin": "2026-09-16",
  "avecTrous": false
}
```

- `dateDebut` (obligatoire) : Date de début au format `YYYY-MM-DD`.
- `dateFin` (obligatoire) : Date de fin au format `YYYY-MM-DD`.
- `avecTrous` (optionnel) : Booléen (`true` pour inclure explicitement les plages horaires libres/vides).

---

## 2. Structure d un Créneau de Cours

### Réponse type (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": [
    {
      "id": 14201,
      "text": "MATHS",
      "matiere": "Mathématiques",
      "codeMatiere": "MATHS",
      "typeCours": "COURS",
      "start_date": "2026-09-15 08:00",
      "end_date": "2026-09-15 09:55",
      "color": "#2563eb",
      "dispensable": false,
      "dispense": 0,
      "prof": "M. DURAND",
      "salle": "Salle 204",
      "classe": "TG1",
      "classeId": 101,
      "classeCode": "TG1",
      "groupe": "",
      "groupeId": 0,
      "groupeCode": "",
      "isAnnule": false,
      "isModifie": false,
      "contenuDeSeance": true,
      "devoirCi": true
    },
    {
      "id": 14202,
      "text": "HISTOIRE-GEO",
      "matiere": "Histoire-Géographie",
      "codeMatiere": "HI-GE",
      "typeCours": "COURS",
      "start_date": "2026-09-15 10:10",
      "end_date": "2026-09-15 11:05",
      "prof": "Mme MARTIN",
      "salle": "Salle 102",
      "isAnnule": true,
      "isModifie": true,
      "motifAnnulation": "Absence professeur"
    },
    {
      "id": 0,
      "text": "PERMANENCE",
      "matiere": "Sans cours",
      "codeMatiere": "LIBRE",
      "typeCours": "PERMANENCE",
      "start_date": "2026-09-15 11:05",
      "end_date": "2026-09-15 12:00",
      "salle": "",
      "isAnnule": false,
      "isModifie": false
    }
  ]
}
```

---

## 3. Analyse des Champs Clés

| Champ | Type | Description |
| :--- | :--- | :--- |
| `start_date` / `end_date` | Chaîne | Horodatage au format `"YYYY-MM-DD HH:mm"`. |
| `matiere` | Chaîne | Intitulé complet de la discipline. |
| `codeMatiere` | Chaîne | Identifiant court de la discipline (ex: `MATHS`, `PH-CH`, `HI-GE`, `PHILO`, `AGL1`). |
| `isAnnule` | Booléen | Indique si le cours a été annulé par l établissement. |
| `isModifie` | Booléen | Indique si le cours a fait l objet d un changement (salle, horaire ou professeur remplaçant). |
| `devoirCi` | Booléen | `true` si du travail à faire ou une évaluation est rattachée à cette séance. |
| `contenuDeSeance` | Booléen | `true` si un compte-rendu de cours a été saisi par l enseignant. |
| `typeCours` | Chaîne | `COURS`, `TP`, `TD`, `PERMANENCE`, `CONSEIL_CLASSE`, etc. |
