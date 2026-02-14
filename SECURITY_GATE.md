# SECURITY GATE - Criteres GO/NO-GO

> **Chaque phase doit passer cette gate avant mise en production.**
> **Responsable gate** : Claude Code (LEAD)
> **Validateur final** : Humain (Product Owner)
> **v2.0** : Simplifie apres clarification role Kala

---

## GATE PHASE 1 : Capture + Transmission Kala + Confirmation

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G1.1 | Webhook recoit et parse le payload JSON | OpenClaw | 5 payloads testes |
| G1.2 | Lead stocke dans CRM (10 colonnes) | OpenClaw | Verification manuelle |
| G1.3 | Lead transmis a API Kala | OpenClaw | kala_reference retournee |
| G1.4 | Email confirmation envoye au client sous 60s | OpenClaw | Test 3 adresses |
| G1.5 | Email notification admin sous 60s | OpenClaw | Verification reception |
| G1.6 | Consentement timestamp enregistre | OpenClaw | Colonne CRM remplie |
| G1.7 | Payload invalide = erreur geree (pas de crash) | OpenClaw | Test payload vide |
| G1.8 | HTTPS sur tous les endpoints | OpenClaw | Verification |
| G1.9 | Aucun secret dans le repo | Claude Code | Audit |
| G1.10 | Footer legal conforme (SwissEmpire2 Sarl + LSFIN) | Claude Code | Verification |

### Decision
- Tous OK -> **GO** : Merge dev -> master
- 1+ NOK -> **NO-GO** : Corriger d'abord

---

## GATE PHASE 2 : Post-Resultat

| # | Critere | Responsable | Validation |
|---|---------|-------------|------------|
| G2.1 | Webhook retour Kala fonctionnel | OpenClaw | Test payload |
| G2.2 | Statut CRM mis a jour (result_found / result_empty) | OpenClaw | Verification |
| G2.3 | Email post-resultat envoye automatiquement | OpenClaw | Test 2 scenarios |
| G2.4 | Relances programmees (J+2, J+5) si result_found | OpenClaw | Verification |
| G2.5 | Pas de wording "conseil financier" dans les emails | Claude Code | Audit texte |
| G2.6 | Pages legales en ligne | Claude Code | URLs accessibles |

---

## REGLES ABSOLUES (toutes phases)

1. **ZERO donnees personnelles** dans les logs ou le repo
2. **Consentement LPD** trace pour chaque contact
3. **Wording LSFIN** : "information" jamais "conseil financier"
4. **Rollback possible** en < 15 min
5. **Swiss Heritage ne duplique JAMAIS Kala**
