# Mapping des donnees - Swiss Heritage

> **v2.0** - Simplifie. Swiss Heritage = acquisition + post-resultat.

---

## FLOW COMPLET

```
[Formulaire site] --POST--> [W1: webhook n8n] --POST--> [API Kala]
                                   |
                                   v
                            [CRM Google Sheets]
                                   |
                                   v
                            [W2: email/WA confirmation]

         ... 2-3 mois plus tard ...

[API Kala] --POST--> [W3: webhook retour] --> [W4: automation post-resultat]
```

---

## 1. FORMULAIRE -> W1 (webhook reception)

| Champ formulaire | Cle JSON | Type | Obligatoire |
|-----------------|----------|------|-------------|
| Prenom | `prenom` | string | Oui |
| Nom | `nom` | string | Oui |
| (calcule) | `name` | string | Auto |
| Email | `email` | string | Oui |
| Telephone | `phone` | string | Oui |
| Date naissance | `date_naissance` | string | Non |
| Canton | `canton` | string | Non |
| Nationalite | `nationalite` | string | Non |
| Statut emploi | `statut_emploi` | string | Non |
| Nb employeurs | `nb_employeurs` | string | Non |
| Consentement | `consentement_contact` | boolean | Oui (= true) |
| (auto) | `consentement_timestamp` | string | Auto |
| (auto) | `timestamp` | string | Auto |
| (fixe) | `source` | string | Auto |
| (fixe) | `langue` | string | Auto |

---

## 2. W1 -> CRM Google Sheets

| Colonne | Source | Transformation |
|---------|--------|----------------|
| lead_id | (genere) | SH-{YYYY}-{auto} |
| timestamp | payload | Format local |
| prenom | payload | Trim + capitalize |
| nom | payload | Trim + capitalize |
| email | payload | Trim + lowercase |
| phone | payload | Normaliser +41 |
| canton | payload | Tel quel |
| nb_employeurs | payload | Tel quel |
| statut | (defaut) | "new" |
| kala_reference | (retour API Kala) | ID du dossier chez Kala |

---

## 3. W1 -> API Kala

Payload a envoyer a Kala (format exact a confirmer avec Kala) :
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@email.ch",
  "phone": "+41 79 123 45 67",
  "date_naissance": "1985-03-15",
  "nationalite": "suisse",
  "partner_reference": "SH-2026-0001",
  "callback_url": "https://n8n.swiss-leads.ch/webhook/kala-result"
}
```

---

## 4. W3 <- Retour Kala

Payload recu de Kala (format exact a confirmer) :
```json
{
  "partner_reference": "SH-2026-0001",
  "status": "found | not_found | error",
  "amount_found": 47320.00,
  "details": "..."
}
```

---

## 5. STATUTS

```
new            -> Lead recu
sent_to_kala   -> Transmis a Kala (kala_reference recu)
confirmed      -> Client confirme par email/WA
result_found   -> Kala: avoirs trouves
result_empty   -> Kala: rien trouve
contacted      -> Client contacte post-resultat
```
