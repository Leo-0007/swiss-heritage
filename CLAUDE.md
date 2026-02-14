# CLAUDE.md - Feuille de Route Swiss Heritage

> **Document vivant** - Mis a jour par Claude Code (chef d'orchestre)
> Derniere MAJ : 2026-02-14

---

## 0. IDENTITE DU PROJET

| Champ | Valeur |
|-------|--------|
| **Entreprise** | SwissEmpire2 Sarl (CHE-489.583.893) |
| **Siege** | Moutier, Suisse |
| **Projet** | Swiss Heritage (swiss-heritage.ch) |
| **Service** | Recherche administrative d'avoirs LPP (2eme pilier) oublies |
| **Partenaire tech** | Kala (kala.ch) - moteur de recherche officiel LPP |
| **Objectif revenue** | 10'000 CHF/mois |
| **Stack** | React 18 (CDN), Netlify, n8n, Google Sheets |

---

## 1. EQUIPE IA & ROLES

### Claude Code - Chef d'Orchestre (LEAD)
- **Responsabilites** : Architecture globale, frontend, design, SEO, conformite legale, coordination
- **Acces** : Code source, fichiers projet, Notion, navigateur Chrome
- **Autorite** : Decisions techniques, validation des PRs, approbation des specs

### OpenClaw - Specialiste Automatisation (EXECUTANT)
- **Responsabilites** : Workflows n8n, agents IA, integrations API, CRM, emails
- **Acces** : n8n (n8n.swiss-leads.ch), webhooks, APIs externes
- **Rapport** : Rend compte a Claude Code via GitHub Issues/PRs

### Humain - Product Owner
- **Role** : Decisions business, validation finale, relais de communication
- **Contact** : lionel.ndombele@gmail.com

---

## 2. ARCHITECTURE TECHNIQUE

```
COUCHE 5 - INTELLIGENCE (Auto-amelioration)
   Scoring adaptatif, A/B testing, rapports IA
   [Responsable: Claude Code + OpenClaw]

COUCHE 4 - ORCHESTRATION (Auto-correction)
   Monitoring, retry, alertes, dead letter queue
   [Responsable: OpenClaw]

COUCHE 3 - KALA BRIDGE (Interface partenaire)
   Connecteur Kala, orchestrateur, mode degrade
   [Responsable: OpenClaw]

COUCHE 2 - AGENTS IA SPECIALISES (6 agents)
   Qualifier, Conversationnel, Documentaliste, Signature, Relance, Post-Kala
   [Responsable: OpenClaw]

COUCHE 1 - CAPTURE (Multi-canal)
   Site web, formulaires, WhatsApp, telephone
   [Responsable: Claude Code (site) + OpenClaw (canaux)]
```

---

## 3. ETAT DU PROJET

### Site Web (Claude Code) - v2.0
- [x] Design premium avec effets 3D (orbes, tilt, animations)
- [x] Formulaire multi-etapes (2 steps) inspire de Kala
- [x] Champs : prenom, nom, email, phone, dateNaissance, canton, statutEmploi, nbEmployeurs
- [x] Checkbox consentement LPD (non pre-cochee)
- [x] Stats mises a jour : 55 Mrd CHF, 1.35 Mio comptes, 1500+ instituts, 1/5 Suisses
- [x] Section situations (10 cas d'usage Kala)
- [x] Comparaison institution suppletive vs Swiss Heritage
- [x] FAQ enrichie (6 questions, frais 3%, rapatriement anticipe)
- [x] Footer conforme : SwissEmpire2 Sarl + LSFIN disclaimer
- [x] SEO meta tags + Open Graph
- [x] Responsive (968px, 480px)
- [ ] Page politique de confidentialite
- [ ] Page mentions legales / CGU
- [ ] Google Analytics configuration
- [ ] A/B testing formulaire

### Workflows n8n (OpenClaw) - Phase 1
- [ ] **O1** : Webhook reception formulaire (POST JSON enrichi)
- [ ] **O2** : CRM Google Sheets structure (15 colonnes)
- [ ] **O3** : Agent Qualifier (matrice scoring)
- [ ] **O4** : Email confirmation client (template HTML)
- [ ] **O5** : Email notification admin
- [ ] **O6** : Anti-doublons (email + phone)

### Workflows n8n (OpenClaw) - Phase 2
- [ ] **O7** : Agent WhatsApp (sequences M1/M2/M3 + relances)
- [ ] **O8** : Agent Documentaliste (upload securise + relances)
- [ ] **O9** : Agent Signature (Skribble e-signature)
- [ ] **O10** : Kala Bridge mode degrade (human-in-the-loop)
- [ ] **O11** : Agent Relance/Nurturing
- [ ] **O12** : Agent Post-Kala (resultats + closing)
- [ ] **O13** : Dashboard CEO
- [ ] **O14** : Monitoring + alertes

---

## 4. SPECS TECHNIQUES PARTAGEES

### Payload formulaire -> webhook n8n
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
  "consentement_timestamp": "2026-02-13T14:30:00.000Z",
  "timestamp": "2026-02-13T14:30:00.000Z",
  "source": "swiss-heritage-website",
  "langue": "fr"
}
```

### Webhook URL
- **Test** : `https://n8n.swiss-leads.ch/webhook-test/lpp-form`
- **Production** : `https://n8n.swiss-leads.ch/webhook/lpp-form` (a activer par OpenClaw)

### Matrice de Scoring (Agent Qualifier)
| Critere | Poids | Score max | Logique |
|---------|-------|-----------|---------|
| nb_employeurs >= 3 | 25% | 25 | Plus d'employeurs = plus de chances |
| statut = chomage/retraite | 20% | 20 | Transitions = risque perte |
| Periodes lacunes | 15% | 15 | Lacunes = forte probabilite |
| Intention pret a agir | 15% | 15 | Conversion rapide |
| Urgence high/critical | 10% | 10 | Priorite traitement |
| Source referral/partner | 10% | 10 | Meilleur taux conversion |
| Documents en main | 5% | 5 | Accelere dossier |

### Routing par score
| Score | Categorie | Action | Delai |
|-------|-----------|--------|-------|
| >= 70 | HOT | Agent Appel | 15 min |
| 40-69 | WARM | Agent WhatsApp | 1h |
| 20-39 | COLD | Sequence email | 24h |
| < 20 | DISQUALIFIED | Archive + email | - |

### CRM Google Sheets - Colonnes
```
lead_id | timestamp | prenom | nom | email | phone | date_naissance | canton | nationalite | statut_emploi | nb_employeurs | score | statut | source | consentement_timestamp
```

### Statuts du lead (machine d'etat)
```
new -> contacted -> qualified -> docs_requested -> docs_partial -> docs_complete
-> contract_sent -> mandate_signed -> kala_ready -> submitted_to_kala
-> kala_processing -> kala_result_found / kala_result_not_found / kala_error
-> client_notified -> rapatriation_started -> payout_confirmed -> won
```

---

## 5. DONNEES KALA (Business)

| Info | Valeur |
|------|--------|
| Marche total libre passage | 55 Mrd CHF |
| Comptes de libre passage | 1.35 Mio |
| Instituts interroges | ~1'500 |
| Suisses concernes | 1 sur 5 |
| Frais rapatriement | 3% du capital (deduit directement) |
| Delai recherche Centrale 2e pilier | ~2 mois |
| Delai recherche Institution suppletive | ~1 mois |
| Rapatriement anticipe | Possible |
| Partenaires financiers | Lemania (Mirabaud), Zugerberg Finanz |
| Seuil Lemania | min CHF 1'300 |
| Seuil Zugerberg | Aucun minimum, recommande < CHF 50'000 |

---

## 6. CONFORMITE (NON NEGOCIABLE)

### LPD/nLPD
- Consentement EXPLICITE avant tout contact (checkbox non pre-cochee)
- Finalite declaree : recherche d'avoirs LPP et accompagnement administratif
- Conservation : leads non convertis 12 mois, clients mandat + 10 ans
- Droit acces/rectification/suppression : privacy@swiss-heritage.ch
- Partage Kala : couvert par mandat signe

### LSFIN
- Swiss Heritage = service ADMINISTRATIF, PAS conseil financier
- Wording : "information" JAMAIS "conseil"
- Si conseil financier necessaire -> redirection FINMA autorise
- Kala = recherche, Swiss Heritage = acquisition + accompagnement admin

### Texte consentement (formulaire)
```
J'accepte que SwissEmpire2 Sarl me contacte par telephone, WhatsApp et/ou
e-mail dans le cadre de ma demande de recherche d'avoirs LPP. Mes donnees
seront traitees conformement a la politique de confidentialite et pourront
etre transmises aux prestataires de recherche LPP dans le cadre de cette
demarche. Je peux retirer mon consentement a tout moment en ecrivant a
privacy@swiss-heritage.ch.
```

### Mention legale footer
```
Swiss Heritage est un service de SwissEmpire2 Sarl (CHE-489.583.893), Moutier.
Service de recherche administrative d'avoirs de prevoyance professionnelle (LPP).
Ce service ne constitue pas du conseil financier au sens de la LSFIN.
Pour tout conseil en placement, consultez un conseiller financier autorise FINMA.
```

---

## 7. PLANNING DE DEPLOIEMENT

| Phase | Semaine | Claude Code | OpenClaw | Go/No-Go |
|-------|---------|------------|----------|----------|
| **1** | S1-S2 | Site V2 (FAIT) | O1 + O2 + O4 + O5 | Leads entrent et sont stockes |
| **2** | S3-S4 | Pages legales | O3 + O6 + O7 | Scoring auto + 1er contact < 1h |
| **3** | S5-S6 | Optimisations site | O8 + O9 | Dossiers Kala-ready produits |
| **4** | S7-S8 | - | O10 + O12 | Soumission Kala fonctionnelle |
| **5** | S9-S10 | A/B tests | O11 + O13 + O14 | KPIs visibles temps reel |
| **API** | Quand dispo | Adapter form si besoin | Brancher API Kala | End-to-end automatique |

---

## 8. PROTOCOLE DE COLLABORATION GITHUB

### Branches
- `main` : Production (deploye sur Netlify)
- `dev` : Developpement / integration
- `feature/*` : Nouvelles fonctionnalites
- `openclaw/*` : Branches d'OpenClaw (workflows, configs)

### Issues
- Label `claude-code` : Taches pour moi
- Label `openclaw` : Taches pour OpenClaw
- Label `P0` `P1` `P2` `P3` : Priorites
- Label `blocked` : En attente d'une dependance
- Label `review` : Necessite validation de Claude Code

### Pull Requests
- OpenClaw cree des PRs vers `dev`
- Claude Code review et merge
- Merge `dev` -> `main` uniquement apres validation

### Communication
```
Claude Code ecrit les specs/issues sur GitHub
   -> Humain transmet a OpenClaw
   -> OpenClaw execute et cree PR/commit
   -> Humain rapporte le retour
   -> Claude Code review et coordonne
```

---

## 9. REGLES ABSOLUES

1. **Kala = boite noire** : Ne JAMAIS reconstruire le process de recherche Kala
2. **Compliance by design** : LPD/LSFIN integre dans chaque composant
3. **Revenue-first** : Chaque decision justifiee par impact revenue
4. **Mode degrade toujours pret** : Fonctionne sans API Kala (human-in-the-loop)
5. **Propriete relation client** : Swiss Heritage possede la relation, Kala = prestataire
6. **Autonomie maximale** : Humain intervient uniquement pour decisions strategiques
7. **Iteration rapide** : MVP fonctionnel d'abord, perfectionnement ensuite
8. **Claude Code = lead** : Toute decision technique passe par Claude Code

---

## 10. CHANGELOG

### 2026-02-14 - v2.0 (Claude Code)
- Refonte complete du site avec design 3D premium
- Formulaire multi-etapes inspire de Kala
- Conformite LPD/LSFIN complete
- Stats mises a jour depuis donnees Kala
- Creation CLAUDE.md (ce document)
- Initialisation repo GitHub
- Repartition des taches Claude Code / OpenClaw
