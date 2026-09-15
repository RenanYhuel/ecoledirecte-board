# 06. Messagerie et Communications

## 1. Consultation des Messages

### Endpoint : `POST /v3/eleves/{id}/messages.awp?verbe=get&v=4.101.4`

#### Corps de la requête
```json
{
  "anneeMessages": "2026-2027",
  "mode": "destinataire"
}
```

#### Réponse type vérifiée (Code 200)

```json
{
  "code": 200,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "classeurs": [],
    "pagination": {
      "messagesRecusCount": 42,
      "messagesEnvoyesCount": 5,
      "messagesNonLusCount": 3
    },
    "parametrage": {
      "isActif": true,
      "canSend": false
    },
    "messages": {
      "received": [
        {
          "id": 158902,
          "mtype": "received",
          "read": false,
          "date": "2026-09-15 17:45:00",
          "subject": "Organisation de la réunion de rentrée",
          "from": {
            "name": "Direction du Lycée",
            "role": "DIR",
            "id": 10
          },
          "files": []
        }
      ]
    }
  }
}
```

---

## 2. Lecture Complète d'un Message

### Endpoint : `POST /v3/eleves/{id}/messages/{message_id}.awp?verbe=get&v=4.101.4`

```json
{
  "mode": "destinataire"
}
```

---

## 3. Modification de l'État de Lecture

### Endpoint : `PUT /v3/eleves/{id}/messages.awp?verbe=put&v=4.101.4`

```json
{
  "action": "marquerCommeLu",
  "ids": [158902]
}
```
