# Specification Consentement - Swiss Heritage

---

## Texte de consentement (formulaire site)

```
J'accepte que SwissEmpire2 Sarl me contacte par telephone, WhatsApp et/ou
e-mail dans le cadre de ma demande de recherche d'avoirs LPP. Mes donnees
seront traitees conformement a la politique de confidentialite et pourront
etre transmises aux prestataires de recherche LPP dans le cadre de cette
demarche. Je peux retirer mon consentement a tout moment en ecrivant a
privacy@swiss-heritage.ch.
```

## Regles d'implementation

### Frontend (Claude Code)
- Checkbox HTML `<input type="checkbox">` NON pre-cochee
- Le bouton "Lancer ma recherche" est desactive si checkbox non cochee
- Timestamp enregistre au moment du clic (pas au chargement de page)
- Format timestamp : ISO-8601 (`2026-02-14T10:30:00.000Z`)

### Backend (OpenClaw)
- Le champ `consentement_contact` DOIT etre `true` pour traiter le lead
- Si `false` ou absent : rejeter le lead, ne pas stocker, log warning
- Le `consentement_timestamp` est stocke dans le CRM
- Ce timestamp est la preuve legale du consentement

### Retrait du consentement
- Canal : email a privacy@swiss-heritage.ch
- Delai : traitement sous 48h ouvrables
- Action :
  1. Stopper tout contact automatise immediatement
  2. Marquer le lead comme "consent_withdrawn"
  3. Supprimer les donnees sous 30 jours
  4. Conserver uniquement : lead_id + date retrait (preuve)

---

## Consentement mandat (Phase 3)

Le mandat signe couvre :
- Autorisation de transmission de donnees a Kala
- Autorisation de recherche via Centrale du 2eme pilier
- Conditions de remuneration (3% du capital rapatrie)
- Clause de confidentialite

Ce consentement est SEPARE du consentement formulaire.
