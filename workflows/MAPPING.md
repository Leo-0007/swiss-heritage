# Mapping des donnees - Swiss Heritage

> **v3.0** - Avec Mode A/B Kala + KalaAdapter
> Swiss Heritage = acquisition + transmission Kala + post-resultat

---

## FLOW COMPLET

### Mode A (Fallback - ACTIF maintenant)

```
[Formulaire site] --POST--> [W1: webhook n8n]
                                   |
                                   v
                            [Scoring leger]
                                   |
                                   v
                            [CRM Google Sheets]
                                   |
                                   v
                            [KalaAdapter.createCase(Mode A)]
                                   |
                                   v
                            [W2: email client]
                            - Confirmation reception
                            - Lien vers URL Kala partenaire
                            + [email admin: nouveau lead]

         ... Client clique sur lien Kala ...
         ... Kala fait la recherche (2 mois) ...
         ... Admin verifie manuellement le dashboard Kala ...

[Admin] --MAJ manuelle CRM--> [W4: email post-resultat auto]
```

### Mode B (API - Quand specs recues)

```
[Formulaire site] --POST--> [W1: webhook n8n]
                                   |
                                   v
                            [Scoring leger]
                                   |
                                   v
                            [CRM Google Sheets]
                                   |
                                   v
                            [KalaAdapter.createCase(Mode B)]
                                   |
                                   v
                            [POST API Kala] --> [kala_reference]
                                   |
                                   v
                            [MAJ CRM: kala_reference]
                                   |
                                   v
                            [W2: email confirmation client]
                            + [email admin: lead + kala_reference]

         ... Kala fait la recherche (2 mois) ...

[API Kala] --webhook--> [W3: webhook retour]
                                   |
                                   v
                            [KalaAdapter.handleWebhook()]
                                   |
                                   v
                            [MAJ CRM: statut + montant]
                                   |
                                   v
                            [W4: automation post-resultat]
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

## 2. W1 -> Scoring leger

```
Score = 0

Si nb_employeurs == "3-5"   -> score += 15
Si nb_employeurs == "6-10"  -> score += 20
Si nb_employeurs == "10+"   -> score += 25

Si statut_emploi == "chomage"     -> score += 20
Si statut_emploi == "retraite"    -> score += 20
Si statut_emploi == "independant" -> score += 10

Score final stocke dans CRM (colonne `score`)
```

---

## 3. W1 -> CRM Google Sheets

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
| statut_emploi | payload | Tel quel |
| score | (calcule) | Scoring leger |
| statut | (defaut) | "new" -> "scored" |
| kala_reference | (retour Kala) | Mode A: vide / Mode B: kala_id |

---

## 4. W1 -> KalaAdapter.createCase()

### Mode A (Fallback)

**Input :** lead data du CRM
**Action :** Generer l'URL de redirection
**Output :**
```json
{
  "case_id": "SH-2026-0042",
  "redirect_url": "https://kala.ch/partner/swiss-heritage?ref=SH-2026-0042",
  "mode": "A"
}
```
**Effet :** Le lien Kala est inclus dans l'email client (W2).

### Mode B (API)

**Input :** lead data du CRM
**Action :** POST a l'API Kala
```json
{
  "partner_reference": "SH-2026-0042",
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@email.ch",
  "phone": "+41 79 123 45 67",
  "date_naissance": "1985-03-15",
  "callback_url": "https://n8n.swiss-leads.ch/webhook/kala-result"
}
```
> Champs exacts a confirmer avec Kala (voir docs/KALA_ONBOARDING.md)

**Output :**
```json
{
  "case_id": "KALA-78291",
  "mode": "B"
}
```
**Effet :** `kala_reference` stocke dans CRM.

---

## 5. W3 <- Retour Kala (Mode B uniquement)

Payload recu de Kala (format a confirmer) :
```json
{
  "partner_reference": "SH-2026-0042",
  "status": "found | not_found | error",
  "amount_found": 47320.00,
  "details": "..."
}
```

**Mapping statuts :**
| Kala `status` | CRM `statut` |
|---------------|--------------|
| `found` | `result_found` |
| `not_found` | `result_empty` |
| `error` | `result_empty` + alerte admin |

---

## 6. W4 -> Post-resultat

### Mode A (MAJ manuelle)

```
[Admin met a jour CRM] --> [Trigger: statut change]
      |
      v
  Si result_found :
      -> Email client "Bonne nouvelle, des avoirs ont ete trouves"
      -> Relance J+2 si pas de reponse
      -> Relance J+5 si toujours pas de reponse
  Si result_empty :
      -> Email client "Recherche terminee, aucun avoir trouve"
```

### Mode B (Automatique)

```
[W3 normalise le resultat] --> [MAJ CRM auto]
      |
      v
  Si result_found :
      -> Email client immediat (montant + prochaines etapes)
      -> WhatsApp optionnel
      -> Relances automatiques J+2, J+5
  Si result_empty :
      -> Email client (aucun avoir trouve)
      -> Suggestion : verifier institution suppletive
```

---

## 7. STATUTS

```
new              -> Lead recu du formulaire
scored           -> Score calcule
kala_redirected  -> Lien Kala envoye au client (Mode A)
sent_to_kala     -> Transmis via API (Mode B)
result_found     -> Avoirs trouves
result_empty     -> Rien trouve
contacted        -> Client contacte post-resultat
```

---

## 8. VARIABLE DE BASCULE

```
# n8n environment variables

KALA_MODE=A                          # A ou B
KALA_PARTNER_URL=https://kala.ch/... # Mode A : URL de redirection
KALA_API_URL=https://api.kala.ch/v1  # Mode B : endpoint API
KALA_API_KEY=sk_live_xxxx            # Mode B : cle API
KALA_WEBHOOK_SECRET=whsec_xxxx       # Mode B : verification webhook
```

> Le noeud Switch dans n8n lit `KALA_MODE` et route vers la branche A ou B.
> Voir `workflows/KalaAdapter.md` pour les details d'implementation.
