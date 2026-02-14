# CLAUDE.md - Feuille de Route Swiss Heritage

> **Document vivant** - Mis a jour par Claude Code (chef d'orchestre)
> Derniere MAJ : 2026-02-14 v3.0 (clarification role Kala)

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
│     Envoyer les donnees du lead via API Kala              │
│     -> Swiss Heritage n'effectue PAS la recherche         │
│                                                           │
│  3. AUTOMATION POST-RESULTAT                              │
│     Recevoir le resultat Kala via webhook                 │
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
│  - Envoi a la Centrale du 2eme pilier                    │
│  - Rapatriement des avoirs                                │
│  - Dashboard client Kala                                  │
│  - Conformite reglementaire de la recherche              │
└──────────────────────────────────────────────────────────┘
```

### REGLE D'OR
> **Swiss Heritage ne reconstruit JAMAIS ce que Kala fait deja.**
> Pas de verification d'identite. Pas de collecte de documents.
> Pas de gestion de mandat. Pas de rapatriement.
> Swiss Heritage = acquisition + transmission + post-resultat.

---

## 2. ARCHITECTURE SIMPLIFIEE (3 couches)

```
┌─────────────────────────────────────────────────────────┐
│  COUCHE 3 - POST-RESULTAT (Valeur ajoutee)              │
│  Recevoir webhook Kala -> contacter client ->            │
│  sequences email/WhatsApp -> maximiser rapatriement      │
│  [Responsable: OpenClaw]                                 │
├─────────────────────────────────────────────────────────┤
│  COUCHE 2 - TRANSMISSION (API Kala)                      │
│  Recevoir lead -> valider -> envoyer a API Kala ->       │
│  stocker reference dans CRM leger                        │
│  [Responsable: OpenClaw]                                 │
├─────────────────────────────────────────────────────────┤
│  COUCHE 1 - ACQUISITION (Capture)                        │
│  Site web, formulaire, SEO, ads, partenaires             │
│  [Responsable: Claude Code (site) + OpenClaw (canaux)]   │
└─────────────────────────────────────────────────────────┘
```

### Flow complet

```
[Client]  ->  [Site swiss-heritage.ch]  ->  [Webhook n8n W1]
                                                │
                                     ┌──────────▼──────────┐
                                     │  W1: Reception lead  │
                                     │  + Validation        │
                                     │  + CRM leger         │
                                     │  + Envoi API Kala    │
                                     └──────────┬──────────┘
                                                │
                                     ┌──────────▼──────────┐
                                     │  W2: Confirmation    │
                                     │  Email/WhatsApp      │
                                     │  au client           │
                                     └─────────────────────┘

               ... Kala fait la recherche (2-3 mois) ...

                                     ┌─────────────────────┐
                                     │  W3: Webhook retour  │
                                     │  resultat Kala       │
                                     └──────────┬──────────┘
                                                │
                                     ┌──────────▼──────────┐
                                     │  W4: Automation      │
                                     │  post-resultat       │
                                     │  - Si found: push    │
                                     │    rapatriement      │
                                     │  - Si not found:     │
                                     │    email empathique  │
                                     └─────────────────────┘
```

---

## 3. EQUIPE IA & ROLES

### Claude Code - Chef d'Orchestre (LEAD)
- **Responsabilites** : Site web, design, SEO, conformite legale, coordination
- **Autorite** : Decisions techniques, validation des PRs

### OpenClaw - Specialiste Automatisation (EXECUTANT)
- **Responsabilites** : 4 workflows n8n, CRM leger, integration API Kala
- **Rapport** : Rend compte a Claude Code via GitHub Issues/PRs

### Humain - Product Owner
- **Role** : Decisions business, validation finale
- **Contact** : lionel.ndombele@gmail.com

---

## 4. ETAT DU PROJET

### Site Web (Claude Code) - v2.0 FAIT
- [x] Design premium avec effets 3D
- [x] Formulaire multi-etapes (2 steps)
- [x] Checkbox consentement LPD (non pre-cochee)
- [x] Stats : 55 Mrd CHF, 1.35 Mio comptes, 1500+ instituts, 1/5 Suisses
- [x] Footer conforme : SwissEmpire2 Sarl + LSFIN disclaimer
- [x] SEO meta tags + Open Graph + Responsive
- [ ] Page politique de confidentialite
- [ ] Page mentions legales / CGU
- [ ] Google Analytics 4 configuration

### Workflows n8n (OpenClaw) - 4 workflows
- [ ] **W1** : Reception lead + validation + CRM + envoi API Kala
- [ ] **W2** : Email/WhatsApp confirmation client
- [ ] **W3** : Webhook retour resultat Kala
- [ ] **W4** : Sequence automation post-resultat (found / not found)

---

## 5. SPECS TECHNIQUES

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

### Webhooks
- **Reception formulaire (W1)** : `https://n8n.swiss-leads.ch/webhook/lpp-form`
- **Retour resultat Kala (W3)** : `https://n8n.swiss-leads.ch/webhook/kala-result`

### CRM leger (Google Sheets) - 10 colonnes
```
lead_id | timestamp | prenom | nom | email | phone | canton | nb_employeurs | statut | kala_reference
```

### Statuts du lead (6 seulement)
```
new            -> Lead recu du formulaire
sent_to_kala   -> Transmis a l'API Kala
confirmed      -> Confirmation envoyee au client
result_found   -> Kala a trouve des avoirs
result_empty   -> Kala n'a rien trouve
contacted      -> Client contacte post-resultat
```

---

## 6. DONNEES KALA (Business)

| Info | Valeur |
|------|--------|
| Marche total libre passage | 55 Mrd CHF |
| Comptes de libre passage | 1.35 Mio |
| Instituts interroges | ~1'500 |
| Suisses concernes | 1 sur 5 |
| Frais rapatriement | 3% du capital (deduit directement) |
| Delai recherche | 2 a 3 mois |

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

| Phase | Semaine | Claude Code | OpenClaw | Go/No-Go |
|-------|---------|------------|----------|----------|
| **1** | S1-S2 | Site V2 (FAIT) | W1 + W2 | Lead -> Kala + client confirme |
| **2** | S3-S4 | Pages legales + GA4 | W3 + W4 | Resultat Kala -> client contacte |
| **3** | S5+ | Optimisation conversion | Amelioration sequences | Revenue mesurable |

---

## 9. REGLES ABSOLUES

1. **Kala = boite noire** : Ne JAMAIS reconstruire ce que Kala fait
2. **Simplicite** : 4 workflows, pas de sur-ingenierie
3. **Compliance by design** : LPD/LSFIN integre partout
4. **Revenue-first** : L'automation post-resultat = levier #1
5. **Swiss Heritage = acquisition + post-resultat** : Rien d'autre

---

## 10. CHANGELOG

### 2026-02-14 - v3.0 (Claude Code) - CLARIFICATION KALA
- CLARIFICATION : Swiss Heritage != moteur de recherche
- Reduction architecture 5 couches -> 3 couches
- Suppression agents inutiles (Documentaliste, Signature, Kala Bridge)
- Reduction 14 workflows -> 4 workflows
- Reduction 20+ statuts -> 6 statuts
- Nouveau flow simplifie

### 2026-02-14 - v2.0 (Claude Code)
- Refonte site design 3D premium
- Formulaire multi-etapes inspire de Kala
- Initialisation repo GitHub
