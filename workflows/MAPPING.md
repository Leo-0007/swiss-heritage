# Mapping des donnees - Swiss Heritage

---

## 1. FORMULAIRE SITE -> WEBHOOK

| Champ formulaire | Cle JSON | Type | Obligatoire | Validation |
|-----------------|----------|------|-------------|------------|
| Prenom | `prenom` | string | Oui | Non vide |
| Nom | `nom` | string | Oui | Non vide |
| (calcule) | `name` | string | Auto | `{prenom} {nom}` |
| Email | `email` | string | Oui | Format email valide |
| Telephone | `phone` | string | Oui | Format +41... |
| Date naissance | `date_naissance` | string | Non | Format YYYY-MM-DD |
| Canton | `canton` | string | Non | Un des 26 cantons |
| Nationalite | `nationalite` | string | Non | Defaut: "suisse" |
| Statut emploi | `statut_emploi` | string | Non | employe/independant/chomage/retraite/autre |
| Nb employeurs | `nb_employeurs` | string | Non | 1-2/3-5/6-10/10+ |
| Consentement | `consentement_contact` | boolean | Oui | Doit etre true |
| (auto) | `consentement_timestamp` | string | Auto | ISO-8601 |
| (auto) | `timestamp` | string | Auto | ISO-8601 |
| (fixe) | `source` | string | Auto | "swiss-heritage-website" |
| (fixe) | `langue` | string | Auto | "fr" |

---

## 2. WEBHOOK -> CRM GOOGLE SHEETS

| Colonne Sheets | Source | Transformation |
|---------------|--------|----------------|
| lead_id | (genere) | `SH-{YYYY}-{auto-increment 4 digits}` |
| timestamp | `timestamp` | Format date locale CH |
| prenom | `prenom` | Trim + capitalize |
| nom | `nom` | Trim + capitalize |
| email | `email` | Trim + lowercase |
| phone | `phone` | Normaliser format +41 |
| date_naissance | `date_naissance` | Garder ISO |
| canton | `canton` | Tel quel |
| nationalite | `nationalite` | Tel quel |
| statut_emploi | `statut_emploi` | Tel quel |
| nb_employeurs | `nb_employeurs` | Tel quel |
| score | (calcule par O3) | Entier 0-100 |
| statut | (defaut) | "nouveau" |
| source | `source` | Tel quel |
| consentement_timestamp | `consentement_timestamp` | ISO-8601 |

---

## 3. SCORING (O3) -> ROUTING

```
INPUT: lead depuis CRM
  |
  ├── nb_employeurs
  │     "1-2"  -> 5 pts
  │     "3-5"  -> 15 pts
  │     "6-10" -> 20 pts
  │     "10+"  -> 25 pts
  │
  ├── statut_emploi
  │     "chomage"    -> 20 pts
  │     "retraite"   -> 20 pts
  │     "independant" -> 10 pts
  │     "employe"    -> 5 pts
  │     "autre"      -> 10 pts
  │
  ├── source (champ futur)
  │     "referral"/"partner" -> 10 pts
  │     "ads"                -> 5 pts
  │     "organic"/"website"  -> 3 pts
  │
  └── SCORE TOTAL = somme des criteres
        |
        ├── >= 70 -> HOT    -> O5 (alerte immediate) + O7 (WhatsApp M1)
        ├── 40-69 -> WARM   -> O5 (alerte 1h) + O7 (WhatsApp M1 en 1h)
        ├── 20-39 -> COLD   -> O4 (email nurturing)
        └── < 20  -> DISQ   -> O4 (email generique) + archive
```

---

## 4. STATUTS (Machine d'etat)

```
STATUT               TRIGGER                    ACTION SUIVANTE
─────────────────────────────────────────────────────────────────
nouveau              Reception formulaire       -> O3 scoring
contacted            1er contact effectue       -> Qualification
qualified            Score >= 40                -> O8 docs request
docs_requested       Demande docs envoyee       -> Attente
docs_partial         Certains docs recus        -> O8 relance
docs_complete        Tous docs recus            -> O9 signature
contract_sent        Mandat envoye              -> Attente
mandate_signed       Signature recue            -> O10 Kala Bridge
kala_ready           Dossier valide             -> Soumission Kala
submitted_to_kala    Dossier envoye             -> Attente
kala_processing      En cours chez Kala         -> Monitoring
kala_result_found    Avoirs trouves             -> O12 notification
kala_result_not_found Rien trouve               -> O12 notification
kala_error           Erreur Kala                -> Retry/escalade
client_notified      Client informe             -> Selon resultat
rapatriation_started Rapatriement lance         -> Suivi
payout_confirmed     Paiement confirme          -> Facturation
won                  Dossier cloture avec succes -> Archive
```
