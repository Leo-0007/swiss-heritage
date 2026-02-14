# CLAUDE.md - Feuille de Route Swiss Heritage

> **Document vivant** - Mis a jour par Claude Code (chef d'orchestre)
> Derniere MAJ : 2026-02-14 v3.1 (Mode A/B Kala + KalaAdapter)

---

## 0. IDENTITE DU PROJET

| Champ | Valeur |
|-------|--------|
| **Entreprise** | SwissEmpire2 Sarl (CHE-489.583.893) |
| **Siege** | Moutier, Suisse |
| **Projet** | Swiss Heritage (swiss-heritage.ch) |
| **Partenaire tech** | Kala (kala.ch) - moteur de recherche officiel LPP |
| **Objectif revenue** | 10'000 CHF/mois |
| **Stack** | React 18 (CDN), Netlify, n8n, Google Sheets |

---

## 1. ROLE EXACT DE SWISS HERITAGE (NON NEGOCIABLE)

### Ce que Swiss Heritage FAIT

```
┌──────────────────────────────────────────────────────────┐
│          SWISS HERITAGE = 3 MISSIONS                      │
│                                                           │
│  1. ACQUISITION                                           │
│     Site web, formulaire, SEO, ads, partenaires           │
│     -> Capter des leads qualifies                         │
│                                                           │
│  2. TRANSMISSION A KALA                                   │
│     Mode A : Redirection vers URL Kala (cle en main)      │
│     Mode B : POST API Kala (quand specs recues)           │
│     -> Swiss Heritage n'effectue PAS la recherche         │
│                                                           │
│  3. AUTOMATION POST-RESULTAT                              │
│     Recevoir le resultat Kala (webhook ou polling)        │
│     Contacter le client (email, WhatsApp)                 │
│     Maximiser le taux de rapatriement                     │
│     -> C'est la ou Swiss Heritage cree de la valeur       │
└──────────────────────────────────────────────────────────┘
```

### Ce que Kala GERE (Swiss Heritage ne touche JAMAIS)

```
┌──────────────────────────────────────────────────────────┐
│              KALA = BOITE NOIRE                           │
│                                                           │
│  - Recherche LPP complete (Centrale 2e pilier)           │
│  - Verification d'identite                                │
│  - CRM principal / gestion dossier                        │
│  - Processus legal et mandat                              │
│  - Rapatriement des avoirs                                │
│  - Dashboard client                                       │
│  - Conformite reglementaire de la recherche              │
└──────────────────────────────────────────────────────────┘
```

### INTERDICTIONS ABSOLUES
- Ne PAS scraper Kala
- Ne PAS automatiser le navigateur Kala
- Ne PAS contourner l'acces API
- Ne PAS reconstruire le process de recherche

---

## 2. MODES KALA (A/B)

### MODE A — Fallback (ACTIF maintenant)
L'API Kala n'est pas publique. Swiss Heritage redirige le client vers une URL Kala personnalisee (solution cle en main Kala).

```
[Client] -> [Formulaire Swiss Heritage] -> [CRM Swiss Heritage]
                                               |
                                               v
                                        [Email au client]
                                        "Cliquez ici pour
                                         lancer votre recherche"
                                               |
                                               v
                                        [URL Kala partenaire]
                                        kala.ch/partner/swiss-heritage
                                        ou URL fournie par Kala
```

**Ce qui fonctionne en Mode A :**
- Acquisition (site + formulaire)
- CRM leger (Google Sheets)
- Email confirmation + lien Kala
- Email notification admin
- Scoring leger (nb_employeurs + statut)
- Suivi manuel des resultats (admin verifie + met a jour CRM)

**Ce qui est en attente en Mode A :**
- Transmission automatique a Kala (pas d'API)
- Reception automatique des resultats (pas de webhook)
- Automation post-resultat automatique

### MODE B — API (A activer quand specs Kala recues)
Quand Kala fournit la documentation API, Swiss Heritage bascule :

```
[Client] -> [Formulaire] -> [n8n W1] -> [KalaAdapter.createCase()]
                                              |
                                              v
                                        [API Kala POST]
                                              |
                                              v
                                        [case_id retourne]
                                              |
                                              v
                                        [CRM: kala_reference]

         ... Kala fait la recherche ...

[Kala webhook] -> [n8n W3] -> [KalaAdapter.handleWebhook()]
      ou
[n8n cron] -> [KalaAdapter.getCaseStatus()] -> [polling]
                                              |
                                              v
                                        [W4: post-resultat]
```

### BASCULE A -> B
Voir `/docs/KALA_ONBOARDING.md` pour la checklist complete.

---

## 3. ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│  COUCHE 3 - POST-RESULTAT (Valeur ajoutee)               │
│  Mode A: admin met a jour manuellement -> email auto     │
│  Mode B: webhook/polling Kala -> sequences automatiques  │
│  [Responsable: OpenClaw]                                  │
├──────────────────────────────────────────────────────────┤
│  COUCHE 2 - KALA ADAPTER (Abstraction)                    │
│  Interface stable : createCase / getCaseStatus /          │
│  handleWebhook. Implem interchangeable A ou B.           │
│  [Responsable: OpenClaw]                                  │
├──────────────────────────────────────────────────────────┤
│  COUCHE 1 - ACQUISITION (Capture + Scoring)               │
│  Site web, formulaire, scoring leger, CRM, emails        │
│  [Responsable: Claude Code (site) + OpenClaw (n8n)]       │
└──────────────────────────────────────────────────────────┘
```

---

## 4. EQUIPE

### Claude Code - Chef d'Orchestre (LEAD)
- Site web, design, SEO, conformite legale, coordination, KalaAdapter spec

### OpenClaw - Specialiste Automatisation (EXECUTANT)
- Workflows n8n, CRM, KalaAdapter implementation, emails

### Humain - Product Owner
- Decisions business, contact Kala pour obtenir les specs API
- Contact : lionel.ndombele@gmail.com

---

## 5. ETAT DU PROJET

### Site Web (Claude Code) - v2.0 FAIT
- [x] Design premium avec effets 3D
- [x] Formulaire multi-etapes (2 steps)
- [x] Checkbox consentement LPD (non pre-cochee)
- [x] Stats, FAQ, comparaison, temoignages
- [x] Footer conforme + SEO + Responsive
- [ ] Page politique de confidentialite
- [ ] Page mentions legales / CGU
- [ ] Google Analytics 4

### Workflows n8n (OpenClaw) - Mode A d'abord
- [ ] **W1** : Reception lead + CRM + scoring leger + email avec lien Kala
- [ ] **W2** : Email confirmation client (avec lien Kala partenaire)
- [ ] **W3** : (Mode B) Webhook retour resultat Kala
- [ ] **W4** : (Mode A) Formulaire admin MAJ statut -> email auto
              (Mode B) Automation post-resultat complete

### KalaAdapter
- [ ] Interface definie (createCase, getCaseStatus, handleWebhook)
- [ ] Mode A : implementation fallback (redirection URL)
- [ ] Mode B : implementation API (a coder quand specs recues)

---

## 6. SPECS TECHNIQUES

### Payload formulaire -> webhook n8n (W1)
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "name": "Jean Dupont",
  "email": "jean.dupont@email.ch",
  "phone": "+41 79 123 45 67",
  "date_naissance": "1985-03-15",
  "canton": "Geneve",
  "nationalite": "suisse",
  "statut_emploi": "employe",
  "nb_employeurs": "3-5",
  "consentement_contact": true,
  "consentement_timestamp": "2026-02-14T14:30:00.000Z",
  "timestamp": "2026-02-14T14:30:00.000Z",
  "source": "swiss-heritage-website",
  "langue": "fr"
}
```

### Scoring leger (dans W1)
```
nb_employeurs "3-5"  -> score += 15
nb_employeurs "6-10" -> score += 20
nb_employeurs "10+"  -> score += 25
statut "chomage"     -> score += 20
statut "retraite"    -> score += 20
statut "independant" -> score += 10
Score enregistre dans CRM, utilise pour prioriser le suivi
```

### CRM leger (Google Sheets) - 12 colonnes
```
lead_id | timestamp | prenom | nom | email | phone | canton | nb_employeurs | statut_emploi | score | statut | kala_reference
```

### Statuts du lead
```
new              -> Lead recu du formulaire
scored           -> Score calcule
kala_redirected  -> Lien Kala envoye au client (Mode A)
sent_to_kala     -> Transmis via API (Mode B)
result_found     -> Avoirs trouves
result_empty     -> Rien trouve
contacted        -> Client contacte post-resultat
```

### KalaAdapter Interface
```
createCase(lead) -> { case_id, redirect_url? }
  Mode A: retourne { case_id: lead_id, redirect_url: KALA_PARTNER_URL }
  Mode B: POST API Kala -> retourne { case_id: kala_id }

getCaseStatus(case_id) -> { status, amount?, details? }
  Mode A: lecture CRM (statut mis a jour manuellement)
  Mode B: GET API Kala

handleWebhook(event) -> { lead_id, status, amount?, details? }
  Mode A: non utilise
  Mode B: parse payload webhook Kala -> format normalise
```

---

## 7. CONFORMITE (NON NEGOCIABLE)

### LPD/nLPD
- Consentement EXPLICITE (checkbox non pre-cochee)
- Finalite : recherche d'avoirs LPP via partenaire technologique
- Conservation : leads non convertis 12 mois
- Contact : privacy@swiss-heritage.ch

### LSFIN
- Swiss Heritage = service d'ACQUISITION, PAS conseil financier
- Wording : "information" JAMAIS "conseil"

### Texte consentement
```
J'accepte que SwissEmpire2 Sarl me contacte par telephone, WhatsApp et/ou
e-mail dans le cadre de ma demande de recherche d'avoirs LPP. Mes donnees
seront traitees conformement a la politique de confidentialite et pourront
etre transmises aux prestataires de recherche LPP dans le cadre de cette
demarche. Je peux retirer mon consentement a tout moment en ecrivant a
privacy@swiss-heritage.ch.
```

---

## 8. PLANNING

| Phase | Semaine | Claude Code | OpenClaw | Mode | Go/No-Go |
|-------|---------|------------|----------|------|----------|
| **1** | S1-S2 | Site (FAIT) | W1+W2 (Mode A) | A | Lead -> CRM -> lien Kala |
| **2** | S3-S4 | Pages legales | W4 Mode A (admin MAJ) | A | Suivi manuel fonctionnel |
| **API** | Quand specs | Adapter form si besoin | Bascule Mode B | B | End-to-end automatique |
| **3** | Post-API | Optimisation | W3+W4 Mode B complet | B | Revenue mesurable |

---

## 9. REGLES ABSOLUES

1. **Kala = boite noire** : Ne JAMAIS reconstruire, scraper, ou contourner
2. **Mode A d'abord** : Fonctionner maintenant sans API
3. **KalaAdapter** : Abstraction stable, implementation interchangeable
4. **Simplicite** : 4 workflows max
5. **Compliance by design** : LPD/LSFIN integre partout
6. **Revenue-first** : L'automation post-resultat = levier #1

---

## 10. CHANGELOG

### 2026-02-14 - v3.1 (Claude Code) - MODE A/B + KALA ADAPTER
- Ajout Mode A (fallback redirection URL) et Mode B (API)
- Definition interface KalaAdapter (createCase/getCaseStatus/handleWebhook)
- Ajout scoring leger dans W1
- Ajout docs/KALA_ONBOARDING.md (checklist specs a obtenir)
- Interdictions explicites (pas de scraping, pas d'automation navigateur)
- CRM ajuste a 12 colonnes (+ statut_emploi, score)
- Statuts ajustes (+ scored, kala_redirected)

### 2026-02-14 - v3.0 (Claude Code)
- Clarification : Swiss Heritage = acquisition + post-resultat uniquement
- Reduction 14 workflows -> 4, 20+ statuts -> 6

### 2026-02-14 - v2.0 (Claude Code)
- Refonte site design 3D premium + formulaire multi-etapes
