# 🚀 DÉMARRAGE RAPIDE - Swiss Heritage

## 📦 Ce que vous avez

✅ **Site web complet** prêt pour Netlify
✅ **Workflow n8n** complet et testé
✅ **Guide de configuration** détaillé
✅ **Outil de test** du webhook

---

## ⚡ EN 5 MINUTES

### 1️⃣ Déployer le Site (2 min)

```bash
# Ouvrez votre navigateur
https://app.netlify.com/drop

# Glissez-déposez CE DOSSIER COMPLET
# Attendez 30 secondes
# ✅ Votre site est en ligne !
```

### 2️⃣ Importer le Workflow n8n (1 min)

1. Allez sur `https://n8n.swiss-leads.ch`
2. Cliquez sur **"+"** → **"Import from File"**
3. Sélectionnez `WORKFLOW_N8N_SWISS_HERITAGE_COMPLET.json`
4. ✅ Workflow importé !

### 3️⃣ Configuration Minimale (2 min)

**Google Sheets :**
1. Créez un Google Sheet avec ces colonnes :
   ```
   lead_id | date | nom | email | telephone | source | statut | timestamp
   ```
2. Copiez l'ID du Sheet (dans l'URL)
3. Dans n8n, node "📊 Enregistrer CRM" → Collez l'ID

**SMTP (Gmail) :**
1. Dans n8n, node "📧 Email Client"
2. Credentials → Create New → SMTP
3. Remplissez :
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `votre-email@gmail.com`
   - Password: [App Password Gmail]

**Activer :**
1. En haut à droite → Switch "Active" à ON
2. ✅ C'est parti !

---

## 🧪 TESTER (30 secondes)

### Option 1 : Page de Test
```bash
# Ouvrez ce fichier dans votre navigateur
test-webhook.html

# Remplissez et cliquez "Envoyer"
```

### Option 2 : Formulaire du Site
```bash
# Allez sur votre site Netlify
# Remplissez le formulaire en bas
# Cliquez "Lancer ma recherche gratuite"
```

### ✅ Vérifications
- [ ] Lead apparaît dans Google Sheets
- [ ] Email reçu (client)
- [ ] Email reçu (admin)
- [ ] Message de succès sur le site

---

## 📋 FICHIERS IMPORTANTS

| Fichier | Description |
|---------|-------------|
| `index.html` | Page principale du site |
| `swiss-heritage-lpp.jsx` | Code React du site |
| `WORKFLOW_N8N_SWISS_HERITAGE_COMPLET.json` | Workflow n8n à importer |
| `GUIDE_CONFIGURATION_N8N.md` | Guide détaillé (LISEZ EN CAS DE PROBLÈME) |
| `test-webhook.html` | Outil de test du webhook |
| `README.md` | Documentation complète |

---

## ❓ PROBLÈMES FRÉQUENTS

### Le site ne s'affiche pas
→ Vérifiez que vous avez glissé **TOUT LE DOSSIER** sur Netlify

### Le formulaire ne s'envoie pas
→ Vérifiez que le workflow n8n est **ACTIF** (switch ON)

### Les emails ne partent pas
→ Utilisez un **App Password** Gmail, pas votre mot de passe normal

### Google Sheets ne se remplit pas
→ Vérifiez l'**ID du Sheet** et les **noms de colonnes**

---

## 📞 AIDE

**Guide complet :** `GUIDE_CONFIGURATION_N8N.md`
**Documentation n8n :** https://docs.n8n.io
**Support Netlify :** https://docs.netlify.com

---

## 🎯 CHECKLIST FINALE

- [ ] Site déployé sur Netlify ✅
- [ ] Workflow n8n importé ✅
- [ ] Google Sheets configuré ✅
- [ ] SMTP configuré ✅
- [ ] Workflow activé (ON) ✅
- [ ] Test réussi ✅
- [ ] Emails reçus ✅

---

## 🔗 LIENS UTILES

**Votre site Netlify :** `https://VOTRE-SITE.netlify.app`
**n8n :** `https://n8n.swiss-leads.ch`
**Webhook URL :** `https://n8n.swiss-leads.ch/webhook-test/lpp-form`

---

**🎉 Tout est prêt ! Bonne chance avec Swiss Heritage !**
