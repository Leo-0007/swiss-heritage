# Tracking Plan - Swiss Heritage

> **Objectif** : Mesurer chaque etape du funnel pour optimiser les conversions.
> **Outil** : Google Analytics 4 (a configurer)

---

## Events a tracker

### Site Web (Claude Code)

| Event | Trigger | Parametres | Priorite |
|-------|---------|------------|----------|
| `page_view` | Chargement page | url, referrer | P0 |
| `scroll_depth` | 25%, 50%, 75%, 100% | depth_percent, section | P2 |
| `form_start` | Clic sur premier champ du formulaire | step: 1 | P0 |
| `form_step_complete` | Validation etape 1 | step: 1, fields_filled | P0 |
| `form_step_2_start` | Arrivee etape 2 | step: 2 | P0 |
| `form_submit` | Soumission finale | step: 2, canton, statut_emploi, nb_employeurs | P0 |
| `form_success` | Reponse webhook 200 | lead_id (hash) | P0 |
| `form_error` | Reponse webhook erreur | error_type | P0 |
| `form_consent_check` | Coche consentement | - | P1 |
| `faq_open` | Ouverture question FAQ | faq_index, faq_question | P2 |
| `cta_click` | Clic sur CTA hero | cta_type: primary/secondary | P1 |
| `nav_click` | Clic navigation | nav_item | P2 |
| `testimonial_view` | Section temoignages visible | - | P2 |

### N8n / Backend (OpenClaw)

| Event | Trigger | Parametres | Priorite |
|-------|---------|------------|----------|
| `lead_created` | Nouveau lead CRM | lead_id, score, source | P0 |
| `lead_scored` | Score calcule | lead_id, score, category | P0 |
| `email_sent` | Email confirmation envoye | lead_id, type, status | P0 |
| `email_opened` | Email ouvert (tracking pixel) | lead_id, type | P1 |
| `whatsapp_sent` | Message WA envoye | lead_id, sequence_step | P1 |
| `whatsapp_replied` | Reponse recue | lead_id | P1 |
| `docs_requested` | Demande docs envoyee | lead_id | P1 |
| `docs_received` | Document uploade | lead_id, doc_type | P1 |
| `mandate_signed` | Mandat signe | lead_id | P0 |
| `kala_submitted` | Dossier soumis Kala | lead_id | P0 |
| `kala_result` | Resultat recu | lead_id, result_type, amount | P0 |
| `payout_confirmed` | Paiement confirme | lead_id, amount | P0 |

---

## Funnel de conversion

```
Visiteurs uniques (GA4)
    |
    ├── form_start (taux engagement)
    |       |
    |       ├── form_step_complete (taux completion etape 1)
    |       |       |
    |       |       ├── form_submit (taux completion etape 2)
    |       |       |       |
    |       |       |       ├── lead_created (taux capture)
    |       |       |       |       |
    |       |       |       |       ├── lead_scored >= 40 (taux qualification)
    |       |       |       |       |       |
    |       |       |       |       |       ├── mandate_signed (taux engagement)
    |       |       |       |       |       |       |
    |       |       |       |       |       |       ├── kala_result_found (taux found)
    |       |       |       |       |       |       |       |
    |       |       |       |       |       |       |       └── payout_confirmed (taux payout)
```

---

## Google Analytics 4 - Configuration

### Property ID
A configurer dans `index.html` (remplacer `G-XXXXXXXXXX`)

### Conversions a definir dans GA4
1. `form_submit` = Conversion principale
2. `form_start` = Micro-conversion
3. `cta_click` = Micro-conversion

### UTM Parameters
Tous les liens marketing doivent inclure :
- `utm_source` : google / facebook / linkedin / partner / referral
- `utm_medium` : cpc / organic / social / email / whatsapp
- `utm_campaign` : nom de la campagne
