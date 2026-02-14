# ROADMAP - Swiss Heritage

> **Objectif** : 10'000 CHF/mois de revenue
> **Derniere MAJ** : 2026-02-14

---

## VISION 30 JOURS (Sprint 1-2)

### Objectif : Premier lead traite end-to-end

```
Semaine 1-2 (Sprint 1) — CAPTURE + CRM
├── [Claude Code] Site v2.0 deploye                    ✅ FAIT
├── [OpenClaw]    O1 - Webhook reception                ⬜ A FAIRE
├── [OpenClaw]    O2 - CRM Google Sheets                ⬜ A FAIRE
├── [OpenClaw]    O4 - Email confirmation client         ⬜ A FAIRE
├── [OpenClaw]    O5 - Email notification admin          ⬜ A FAIRE
├── [Claude Code] Pages legales (confidentialite, CGU)   ⬜ A FAIRE
└── GATE PHASE 1 ──────────────────────────────────── ⬜ GO/NO-GO

Semaine 3-4 (Sprint 2) — QUALIFICATION + CONTACT
├── [OpenClaw]    O3 - Agent Qualifier (scoring)         ⬜ A FAIRE
├── [OpenClaw]    O6 - Anti-doublons                     ⬜ A FAIRE
├── [OpenClaw]    O7 - Agent WhatsApp (seq M1/M2/M3)     ⬜ A FAIRE
├── [Claude Code] Liens legaux dans formulaire           ⬜ A FAIRE
└── GATE PHASE 2 ──────────────────────────────────── ⬜ GO/NO-GO
```

### KPIs cibles J+30
| Metrique | Cible |
|----------|-------|
| Leads/semaine | 10+ |
| Taux qualification | > 50% |
| Temps 1er contact HOT | < 15 min |
| Taux reponse WhatsApp | > 30% |
| Emails confirmes delivres | > 95% |

---

## VISION 90 JOURS (Sprint 3-6)

### Objectif : Pipeline Kala fonctionnel + premiers revenus

```
Semaine 5-6 (Sprint 3) — DOSSIER KALA-READY
├── [OpenClaw]    O8 - Agent Documentaliste
├── [OpenClaw]    O9 - Agent Signature (Skribble)
├── [Claude Code] Optimisations conversion site
└── GATE PHASE 3

Semaine 7-8 (Sprint 4) — KALA BRIDGE
├── [OpenClaw]    O10 - Kala Bridge mode degrade
├── [OpenClaw]    O12 - Agent Post-Kala
├── Premier dossier soumis a Kala (manuellement)
└── GATE PHASE 4

Semaine 9-10 (Sprint 5) — INTELLIGENCE
├── [OpenClaw]    O11 - Agent Relance/Nurturing
├── [OpenClaw]    O13 - Dashboard CEO
├── [OpenClaw]    O14 - Monitoring + alertes
├── [Claude Code] A/B testing formulaire
└── GATE PHASE 5

Semaine 11-12 (Sprint 6) — OPTIMISATION
├── Recalibration scoring (donnees reelles)
├── Optimisation sequences WhatsApp
├── Analyse ROI par source
├── Objectif : premiers payouts
└── REVIEW STRATEGIQUE 90 JOURS
```

### KPIs cibles J+90
| Metrique | Cible |
|----------|-------|
| Leads/semaine | 30+ |
| Dossiers Kala-ready/mois | 15+ |
| Taux found (Kala) | > 40% |
| Montant moyen retrouve | > CHF 15'000 |
| Revenue mensuel | > CHF 5'000 (objectif intermediaire) |
| Pipeline value | > CHF 50'000 |

---

## HORIZON 6-12 MOIS

### Phase API Kala (quand disponible)
- Brancher API Kala directe (supprimer human-in-the-loop)
- Soumission automatique des dossiers
- Reception automatique des resultats
- End-to-end entierement automatise

### Phase Scale
- Google Ads (SEA) avec tracking conversion
- Partenariats fiduciaires / courtiers / RH
- Canaux DE/IT (multilangue)
- Migration CRM vers Airtable
- App mobile client (suivi dossier)

### KPIs cibles J+180
| Metrique | Cible |
|----------|-------|
| Revenue mensuel | **10'000 CHF/mois** |
| Leads/mois | 100+ |
| Dossiers soumis Kala/mois | 40+ |
| Taux conversion lead->won | > 15% |
| NPS clients | > 60 |

---

## RISQUES & MITIGATIONS

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| API Kala non disponible | Ralentissement pipeline | Moyenne | Mode degrade human-in-loop |
| Faible trafic organique | Peu de leads | Haute | Google Ads + partenariats |
| Taux found Kala < 20% | Revenue insuffisant | Moyenne | Revoir scoring + qualification |
| Probleme delivrabilite email | Leads perdus | Faible | SendGrid + monitoring |
| Concurrence | Perte parts de marche | Faible | UX premium + service personnalise |
| Non-conformite LPD/LSFIN | Risque legal | Faible | Compliance by design + audit |
