# Data Retention Policy - Swiss Heritage

---

## Durees de conservation

| Type de donnees | Duree | Action a expiration | Base legale |
|----------------|-------|---------------------|-------------|
| Leads non convertis (score < 20) | 3 mois | Suppression automatique | Interet legitime |
| Leads non convertis (score >= 20) | 12 mois | Suppression automatique | Consentement |
| Leads contactes sans suite | 12 mois | Suppression automatique | Consentement |
| Leads dormants (tag dormant) | 12 mois apres dernier contact | Suppression automatique | Consentement |
| Clients avec mandat actif | Duree du mandat | Conservation | Obligation contractuelle |
| Clients avec mandat termine | Mandat + 10 ans | Suppression automatique | Obligation legale |
| Logs techniques | 90 jours | Rotation automatique | Interet legitime |
| Consentements (preuves) | Duree de conservation des donnees + 2 ans | Suppression | Preuve |
| Resultats Kala | Duree du mandat + 10 ans | Suppression | Obligation legale |

---

## Processus de suppression

### Automatique (a implementer par OpenClaw)
1. Script hebdomadaire : identifier les lignes CRM depassant la duree
2. Exporter les donnees a supprimer (archive encrypted)
3. Supprimer du CRM
4. Logger la suppression (date + lead_id + raison)
5. Confirmer au DPO (privacy@swiss-heritage.ch)

### Sur demande (droit de suppression)
1. Reception demande a privacy@swiss-heritage.ch
2. Verification identite du demandeur
3. Suppression sous 30 jours calendaires
4. Confirmation ecrite au demandeur
5. Log de la suppression

---

## Donnees jamais collectees
- Donnees de sante
- Opinions politiques / religieuses
- Origine ethnique
- Donnees biometriques
- Casier judiciaire
