# Compliance - Swiss Heritage

> **OBLIGATOIRE** : Ce document definit les regles de conformite.
> Chaque composant du systeme DOIT respecter ces regles.

---

## 1. LPD / nLPD (Protection des donnees)

### Principes
- **Transparence** : L'utilisateur sait exactement ce qu'on fait avec ses donnees
- **Finalite** : Donnees utilisees UNIQUEMENT pour la recherche LPP
- **Minimisation** : Ne collecter que ce qui est strictement necessaire
- **Exactitude** : Donnees a jour et correctes
- **Limitation** : Duree de conservation definie et respectee
- **Securite** : Protection technique et organisationnelle

### Consentement
- Checkbox NON pre-cochee
- Texte clair et comprehensible
- Retrait possible a tout moment (privacy@swiss-heritage.ch)
- Consentement horodate (timestamp ISO-8601)

### Droits des personnes
| Droit | Delai | Processus |
|-------|-------|-----------|
| Acces | 30 jours | Email a privacy@swiss-heritage.ch |
| Rectification | 30 jours | Email + verification identite |
| Suppression | 30 jours | Suppression CRM + backups |
| Portabilite | 30 jours | Export CSV des donnees |
| Opposition | Immediat | Desactivation contact |

---

## 2. LSFIN (Loi sur les services financiers)

### Ce que Swiss Heritage EST
- Service de recherche **administrative**
- Accompagnement dans les **demarches**
- Service **d'information**

### Ce que Swiss Heritage N'EST PAS
- Conseil financier
- Conseil en placement
- Intermediation d'assurance
- Gestion de fortune
- Conseil juridique

### Wording obligatoire
| A UTILISER | A NE JAMAIS UTILISER |
|-----------|---------------------|
| Information | Conseil |
| Recherche administrative | Expertise financiere |
| Accompagnement | Recommandation |
| Service d'information | Conseil en placement |
| Demarche administrative | Strategie financiere |

### Redirection FINMA
Si un client demande un conseil financier apres decouverte d'avoirs :
> "Pour la gestion de vos avoirs retrouves, nous vous orientons vers un conseiller financier dument autorise par la FINMA."

---

## 3. Regles par composant

### Site web
- [x] Checkbox consentement non pre-cochee
- [x] Texte consentement conforme
- [x] Footer avec mention LSFIN
- [x] Page politique de confidentialite (nLPD conforme, integree au site)
- [x] Lien politique de confidentialite dans formulaire (texte consentement cliquable)

### Emails (OpenClaw)
- [ ] Mention legale en footer de chaque email
- [ ] Lien de desinscription
- [ ] Pas de wording "conseil financier"
- [ ] Pas de donnees sensibles dans le sujet de l'email

### WhatsApp (OpenClaw)
- [ ] Consentement verifie avant 1er message
- [ ] Option stop/desinscription
- [ ] Respect horaires (9h-19h CET)
- [ ] Anti-spam (max 1 msg/jour, 7 msg/mois)

### CRM (OpenClaw)
- [ ] Acces restreint (service account uniquement)
- [ ] Pas de partage public du spreadsheet
- [ ] Suppression automatique leads non convertis > 12 mois
- [ ] Colonnes sensibles identifiees
