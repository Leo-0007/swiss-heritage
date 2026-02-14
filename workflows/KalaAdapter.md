# KalaAdapter - Specification Technique

> **Abstraction stable** pour interfacer Swiss Heritage avec Kala.
> Implementation interchangeable : Mode A (fallback) ou Mode B (API).
> **Responsable implementation** : OpenClaw (n8n)

---

## Interface

### `createCase(lead) -> { case_id, redirect_url? }`

Cree un nouveau dossier cote Kala (ou simule en Mode A).

**Input :**
```json
{
  "lead_id": "SH-2026-0042",
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@email.ch",
  "phone": "+41 79 123 45 67",
  "date_naissance": "1985-03-15",
  "canton": "Geneve",
  "nb_employeurs": "3-5",
  "statut_emploi": "employe",
  "score": 35
}
```

**Output Mode A :**
```json
{
  "case_id": "SH-2026-0042",
  "redirect_url": "https://kala.ch/partner/swiss-heritage?ref=SH-2026-0042",
  "mode": "A",
  "status": "kala_redirected"
}
```

**Output Mode B :**
```json
{
  "case_id": "KALA-78291",
  "mode": "B",
  "status": "sent_to_kala"
}
```

---

### `getCaseStatus(case_id) -> { status, amount?, details? }`

Recupere le statut d'un dossier.

**Input :** `case_id` (string)

**Output Mode A :**
```json
{
  "case_id": "SH-2026-0042",
  "status": "result_found",
  "amount": 47320.00,
  "details": "Mis a jour manuellement par admin",
  "mode": "A",
  "source": "crm_manual"
}
```
> En Mode A, le statut est lu depuis la colonne `statut` du CRM Google Sheets.
> L'admin met a jour manuellement apres verification sur le dashboard Kala.

**Output Mode B :**
```json
{
  "case_id": "KALA-78291",
  "status": "result_found",
  "amount": 47320.00,
  "details": "3 comptes trouves aupres de 2 institutions",
  "mode": "B",
  "source": "kala_api"
}
```

---

### `handleWebhook(event) -> { lead_id, status, amount?, details? }`

Parse un evenement webhook entrant de Kala et le normalise.

**Input (payload brut Kala) :**
```json
{
  "partner_reference": "SH-2026-0042",
  "status": "found",
  "amount_found": 47320.00,
  "details": "3 comptes trouves"
}
```
> Format exact a confirmer avec Kala lors de l'onboarding API.

**Output normalise :**
```json
{
  "lead_id": "SH-2026-0042",
  "kala_case_id": "KALA-78291",
  "status": "result_found",
  "amount": 47320.00,
  "details": "3 comptes trouves",
  "raw_event": { ... }
}
```

**Mapping statuts Kala -> Swiss Heritage :**
| Kala status | Swiss Heritage status |
|-------------|----------------------|
| `found` | `result_found` |
| `not_found` | `result_empty` |
| `error` | `result_empty` (+ alerte admin) |
| `processing` | (ignorer, pas de MAJ) |

> En Mode A, `handleWebhook` n'est pas utilise.
> L'admin met a jour le CRM manuellement.

---

## Implementation n8n

### Mode A (Fallback) - Workflow W1

```
[Webhook POST] -> [Parse payload] -> [Scoring leger]
      -> [Ecriture CRM Google Sheets]
      -> [createCase Mode A]
            -> case_id = lead_id
            -> redirect_url = env.KALA_PARTNER_URL + "?ref=" + lead_id
      -> [Email client: confirmation + lien Kala]
      -> [Email admin: nouveau lead]
```

**Variable d'environnement :**
```
KALA_MODE=A
KALA_PARTNER_URL=https://kala.ch/partner/swiss-heritage
```

### Mode B (API) - Workflow W1 modifie

```
[Webhook POST] -> [Parse payload] -> [Scoring leger]
      -> [Ecriture CRM Google Sheets]
      -> [createCase Mode B]
            -> POST ${KALA_API_URL}/cases
            -> Headers: Authorization: Bearer ${KALA_API_KEY}
            -> Body: lead data (mapping selon KALA_ONBOARDING.md)
            -> Reponse: case_id = kala_id
      -> [MAJ CRM: kala_reference = case_id]
      -> [Email client: confirmation (sans lien, Kala prend le relai)]
      -> [Email admin: nouveau lead + kala_reference]
```

**Variables d'environnement supplementaires :**
```
KALA_MODE=B
KALA_API_URL=https://api.kala.ch/v1
KALA_API_KEY=sk_live_xxxx
KALA_WEBHOOK_SECRET=whsec_xxxx
```

---

## Bascule A -> B

La bascule se fait en changeant UNE variable d'environnement :

```
KALA_MODE=A  ->  KALA_MODE=B
```

Le workflow n8n utilise un noeud **Switch** sur `KALA_MODE` :
- Si `A` : branche fallback (genere URL, envoie email avec lien)
- Si `B` : branche API (POST a Kala, stocke kala_reference)

### Checklist bascule
1. Recevoir specs API Kala (voir KALA_ONBOARDING.md)
2. Configurer `KALA_API_URL`, `KALA_API_KEY`, `KALA_WEBHOOK_SECRET`
3. Tester avec 3 leads de test en Mode B
4. Verifier reception webhook retour (W3)
5. Changer `KALA_MODE=B` en production
6. Monitorer 24h les premiers leads Mode B

---

## Gestion d'erreurs

### Mode A
- Si email non delivre : retry 2x, puis alerte admin
- Si CRM write echoue : dead letter queue (log JSON)

### Mode B
- Si API Kala timeout (>10s) : fallback Mode A pour ce lead
- Si API Kala 4xx : log erreur, alerte admin, ne pas retenter
- Si API Kala 5xx : retry 3x avec backoff (5s, 15s, 45s), puis fallback Mode A
- Si webhook invalide : log + ignorer (ne pas MAJ CRM)

### Fallback automatique
```
Si KALA_MODE=B ET erreur API :
  -> Executer createCase en Mode A pour ce lead specifique
  -> Marquer dans CRM : "fallback_to_A"
  -> Alerte admin
```
