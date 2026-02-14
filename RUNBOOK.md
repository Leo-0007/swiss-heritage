# RUNBOOK - Swiss Heritage Operations

> **Responsable** : Claude Code (architecture) + OpenClaw (execution infra)
> **Derniere MAJ** : 2026-02-14

---

## 1. ARCHITECTURE DE DEPLOIEMENT

```
                    ┌─────────────────────────────┐
                    │       NETLIFY (CDN)          │
                    │  swiss-heritage.ch           │
                    │  Branch: master = prod       │
                    │  Auto-deploy on push         │
                    └────────────┬────────────────┘
                                 │ POST /webhook
                                 ▼
                    ┌─────────────────────────────┐
                    │   N8N (Self-hosted)          │
                    │   n8n.swiss-leads.ch         │
                    │   Workflows O1-O14           │
                    └──────┬──────────┬───────────┘
                           │          │
                    ┌──────▼──┐  ┌────▼──────────┐
                    │ Google  │  │  SMTP          │
                    │ Sheets  │  │  (SendGrid/    │
                    │ CRM     │  │   Gmail)       │
                    └─────────┘  └───────────────┘
```

---

## 2. DEPLOIEMENT

### 2.1 Frontend (Netlify)

**Trigger** : Push sur `master`

```bash
# Deploiement automatique
git checkout master
git merge dev                 # Apres validation
git push origin master        # Netlify auto-deploy

# Verification
curl -s -o /dev/null -w "%{http_code}" https://swiss-heritage.ch
# Attendu: 200
```

**Deploiement manuel (drag & drop)** :
1. Aller sur https://app.netlify.com/drop
2. Glisser le dossier du projet
3. Configurer domaine custom : swiss-heritage.ch

### 2.2 Workflows n8n (OpenClaw)

**Procedure** :
1. Importer le JSON du workflow dans n8n
2. Configurer les credentials (Google Sheets, SMTP)
3. Activer le workflow (toggle ON)
4. Tester avec le webhook-test
5. Basculer sur le webhook de production

```
Webhook test : https://n8n.swiss-leads.ch/webhook-test/lpp-form
Webhook prod : https://n8n.swiss-leads.ch/webhook/lpp-form
```

---

## 3. ROLLBACK

### 3.1 Rollback Frontend

```bash
# Identifier le dernier commit stable
git log --oneline -10

# Rollback sur Netlify
# Option A : Depuis le dashboard Netlify -> Deploys -> Cliquer sur un deploy precedent -> "Publish deploy"
# Option B : Git revert
git revert HEAD
git push origin master
```

### 3.2 Rollback Workflow n8n

1. Desactiver le workflow problematique (toggle OFF)
2. Reimporter la version precedente du JSON
3. Reactiver
4. Verifier les leads en attente dans la dead letter queue

**RTO (Recovery Time Objective)** : < 15 min
**RPO (Recovery Point Objective)** : 0 leads perdus (dead letter queue)

---

## 4. HEALTHCHECKS

### 4.1 Checks automatiques (a implementer par OpenClaw)

| Check | Endpoint/Methode | Frequence | Seuil alerte |
|-------|-----------------|-----------|--------------|
| Site web UP | `GET https://swiss-heritage.ch` = 200 | 5 min | 2 echecs consecutifs |
| Webhook UP | `POST webhook-test` avec payload test | 15 min | 1 echec |
| Google Sheets accessible | API read derniere ligne | 30 min | 1 echec |
| SMTP fonctionnel | Email test interne | 1h | 1 echec |
| SSL valide | Check certificat | 24h | < 7 jours expiration |

### 4.2 Checks manuels (quotidiens)

- [ ] Verifier les leads du jour dans le CRM
- [ ] Confirmer emails de confirmation envoyes
- [ ] Verifier aucune erreur dans les logs n8n
- [ ] Verifier le score de qualification est coherent

---

## 5. GESTION DES INCIDENTS

### Niveaux de severite

| Niveau | Description | Delai reponse | Exemples |
|--------|-------------|---------------|----------|
| **SEV1** | Service completement DOWN | 15 min | Site inaccessible, webhook mort |
| **SEV2** | Fonctionnalite critique degradee | 1h | Emails non envoyes, CRM non alimente |
| **SEV3** | Fonctionnalite secondaire cassee | 4h | Scoring incorrect, doublon non detecte |
| **SEV4** | Amelioration / bug mineur | 24h | CSS casse sur mobile, typo |

### Procedure d'incident

1. **Detecter** : Monitoring / alerte / signalement humain
2. **Qualifier** : Assigner un niveau SEV
3. **Contenir** : Rollback si necessaire
4. **Communiquer** : Notifier l'equipe (GitHub Issue label `incident`)
5. **Resoudre** : Fix + PR + review + merge
6. **Post-mortem** : Si SEV1/SEV2, documenter dans `/docs/incidents/`

### Contacts d'escalade

| Role | Contact | Quand |
|------|---------|-------|
| Product Owner | lionel.ndombele@gmail.com | Decisions business |
| Claude Code | Via Claude Code CLI | Architecture, frontend, review |
| OpenClaw | Via GitHub Issues | Workflows, infra, APIs |

---

## 6. DONNEES SENSIBLES

### Ce qui NE DOIT JAMAIS etre dans le repo
- Credentials SMTP
- Google Sheets API keys
- Tokens n8n
- Cles Twilio / WhatsApp
- Cles Skribble
- Donnees personnelles de leads

### Ou sont les secrets
- **n8n** : Credentials internes a n8n (encrypted)
- **Netlify** : Variables d'environnement (dashboard)
- **Infra** : Voir `/infra/.env.example` pour la liste des variables requises

---

## 7. METRIQUES OPERATIONNELLES

| Metrique | Cible | Mesure |
|----------|-------|--------|
| Uptime site | > 99.5% | Netlify analytics |
| Temps reponse webhook | < 2s | n8n logs |
| Taux delivrabilite emails | > 95% | SendGrid dashboard |
| Leads traites sans erreur | > 98% | CRM + logs n8n |
| Temps moyen 1er contact (HOT) | < 15 min | CRM timestamp delta |
