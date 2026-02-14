# SECURITY GATE - Criteres GO/NO-GO

> **Chaque phase doit passer cette gate avant mise en production.**
> **Responsable gate** : Claude Code (LEAD)
> **Validateur final** : Humain (Product Owner)

---

## GATE PHASE 1 : Capture + CRM + Emails

### Criteres GO obligatoires

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G1.1 | Webhook recoit et parse correctement le payload JSON | OpenClaw | Test avec 5 payloads differents |
| G1.2 | Lead_id unique genere pour chaque soumission | OpenClaw | Aucun doublon sur 20 tests |
| G1.3 | Toutes les 15 colonnes CRM alimentees correctement | OpenClaw | Verification manuelle sur 10 leads |
| G1.4 | Email confirmation envoye au client sous 30s | OpenClaw | Test sur 3 adresses differentes |
| G1.5 | Email admin envoye sous 30s | OpenClaw | Verification reception |
| G1.6 | Consentement LPD enregistre avec timestamp | OpenClaw | Colonne consentement_timestamp remplie |
| G1.7 | Aucune donnee perdue en cas d'erreur (dead letter) | OpenClaw | Test avec payload invalide |
| G1.8 | HTTPS sur tous les endpoints | OpenClaw | Verification certificat |
| G1.9 | Pas de secrets dans le code source | Claude Code | Audit repo |
| G1.10 | Footer legal conforme (SwissEmpire2 Sarl + LSFIN) | Claude Code | Verification visuelle |

### Procedure de validation

```
1. OpenClaw commente l'issue GitHub avec preuves (screenshots, logs)
2. Claude Code review la PR
3. Claude Code coche les criteres passes
4. Si TOUS les criteres = OK -> GO
5. Si 1+ critere = NOK -> NO-GO + issue correctif
6. Humain donne le feu vert final
```

---

## GATE PHASE 2 : Scoring + Anti-doublons + WhatsApp

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G2.1 | Score calcule automatiquement (0-100) | OpenClaw | 10 leads avec scores varies |
| G2.2 | Routing HOT/WARM/COLD/DISQUALIFIED correct | OpenClaw | 4 tests (1 par categorie) |
| G2.3 | Anti-doublons fonctionne (email + phone) | OpenClaw | Test doublon = merge, pas de nouvelle ligne |
| G2.4 | WhatsApp M1 envoye sous 5 min (WARM/HOT) | OpenClaw | Test end-to-end |
| G2.5 | Anti-spam respecte (max 1 msg/jour) | OpenClaw | Verification logique |
| G2.6 | Pages legales en ligne (confidentialite, CGU) | Claude Code | URLs accessibles |
| G2.7 | Lien politique de confidentialite dans le formulaire | Claude Code | Verification visuelle |

---

## GATE PHASE 3 : Documentaliste + Signature

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G3.1 | Lien upload securise genere et envoye | OpenClaw | Test complet |
| G3.2 | Verification completude docs automatique | OpenClaw | Test docs manquants |
| G3.3 | Relances docs J+1/J+3/J+7 fonctionnent | OpenClaw | Simulation timeline |
| G3.4 | Mandat genere avec bonnes infos client | OpenClaw | Verification visuelle |
| G3.5 | E-signature Skribble fonctionnelle | OpenClaw | Signature test |
| G3.6 | Statut mandate_signed declenche Kala Bridge | OpenClaw | Test transition |

---

## GATE PHASE 4 : Kala Bridge

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G4.1 | Alerte humaine envoyee quand dossier Kala-ready | OpenClaw | Test notification |
| G4.2 | Formulaire MAJ statut fonctionnel | OpenClaw | Test toutes transitions |
| G4.3 | Agent Post-Kala traite les 3 cas (found/not_found/error) | OpenClaw | 3 tests |
| G4.4 | Client notifie du resultat | OpenClaw | Verification email/WA |

---

## GATE PHASE 5 : Intelligence

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G5.1 | Dashboard CEO affiche les KPIs | OpenClaw | Verification visuelle |
| G5.2 | Alertes automatiques fonctionnent | OpenClaw | Test seuils |
| G5.3 | Dead letter queue operationnelle | OpenClaw | Test replay |

---

## REGLES ABSOLUES (toutes phases)

1. **ZERO donnees personnelles** dans les logs publics ou le repo
2. **Consentement LPD** requis et trace pour chaque contact
3. **Wording LSFIN** : "information" jamais "conseil financier"
4. **Pas de deploiement** le vendredi apres 16h
5. **Rollback possible** en < 15 min sur chaque composant
6. **Post-mortem obligatoire** pour tout incident SEV1/SEV2
