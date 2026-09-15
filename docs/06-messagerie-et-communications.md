# 06. Messagerie et Communications

## 1. Consultation des Messages

### Endpoint : `POST /v3/eleves/{id}/messages.awp`

Permet d accéder aux dossiers de la messagerie interne (boîte de réception, messages envoyés, corbeille).

#### Corps de la requête
```json
{
  "anneeMessages": "2026-2027",
  "mode": "destinataire"
}
```

- `mode` :
  - `"destinataire"` : Boîte de réception (messages reçus).
  - `"expediteur"` : Boîte d envoi (messages envoyés).
  - `"corbeille"` : Éléments supprimés.
- `anneeMessages` (optionnel) : Année scolaire ciblée (ex: `"2026-2027"`).

#### Réponse type (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "pagination": {
      "messagesRecusCount": 42,
      "messagesEnvoyesCount": 5,
      "messagesNonLusCount": 3
    },
    "messages": {
      "received": [
        {
          "id": 158902,
          "mtype": "received",
          "read": false,
          "idClasseur": 0,
          "transmis": false,
          "repondu": false,
          "date": "2026-09-15 17:45:00",
          "subject": "Organisation de la réunion parents-professeurs",
          "from": {
            "name": "M. LE PROVISEUR",
            "civilite": "M.",
            "role": "DIR",
            "id": 10
          },
          "to": [
            {
              "name": "Classe de Terminale 1",
              "type": "classe"
            }
          ],
          "files": [
            {
              "id": 8901,
              "libelle": "Planning_Entretiens.pdf",
              "type": "application/pdf"
            }
          ]
        },
        {
          "id": 158870,
          "mtype": "received",
          "read": true,
          "date": "2026-09-14 09:20:00",
          "subject": "Consignes pour le devoir surveillé",
          "from": {
            "name": "M. DURAND",
            "civilite": "M.",
            "role": "P",
            "id": 501
          },
          "files": []
        }
      ]
    }
  }
}
```

---

## 2. Lecture Complète d un Message

### Endpoint : `POST /v3/eleves/{id}/messages/{message_id}.awp`

Récupère le corps intégral du message et les liens de téléchargement de ses pièces jointes.

#### Corps de la requête
```json
{
  "mode": "destinataire"
}
```

#### Réponse type (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "id": 158902,
    "date": "2026-09-15 17:45:00",
    "subject": "Organisation de la réunion parents-professeurs",
    "content": "<p>Chers élèves, chers parents,<br/><br/>Vous trouverez ci-joint l organisation détaillée de la réunion parents-professeurs qui se tiendra le vendredi 25 septembre.</p>",
    "from": {
      "name": "M. LE PROVISEUR",
      "role": "DIR"
    },
    "files": [
      {
        "id": 8901,
        "libelle": "Planning_Entretiens.pdf",
        "taille": 154200
      }
    ]
  }
}
```

---

## 3. Gestion du Statut de Lecture (Lu / Non lu)

### Endpoint : `PUT /v3/eleves/{id}/messages.awp`

Permet de modifier l état de lecture d un ou plusieurs messages.

#### Corps de la requête pour marquer comme lu :
```json
{
  "action": "marquerCommeLu",
  "ids": [158902]
}
```

#### Corps de la requête pour marquer comme non lu :
```json
{
  "action": "marquerCommeNonLu",
  "ids": [158902]
}
```

#### Réponse type (Code 200) :
```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {},
  "message": ""
}
```
