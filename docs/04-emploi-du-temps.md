# 04. Emploi du Temps

## 1. Consultation de l'Emploi du Temps

### Endpoint : `POST /v3/E/{id}/emploidutemps.awp?verbe=get&v=4.101.4`

Permet d'obtenir les séances de cours programmées pour une période donnée.

#### Corps de la requête
```json
{
  "dateDebut": "2026-09-15",
  "dateFin": "2026-09-16",
  "avecTrous": false
}
```

---

## 2. Structure d'un Créneau de Cours (Code 200)

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
      "isModifie": true
    }
  ]
}
```

### Nettoyage des Noms de Salle
Certains établissements intègrent des balises techniques dans le libellé de salle (ex : `"<L Tales 38>L 2303"`). Il convient d'extraire la valeur utile `"L 2303"`.
