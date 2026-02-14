# 🚀 Guide de Configuration n8n - Swiss Heritage LPP

## 📋 Vue d'ensemble du Workflow

Ce workflow complet gère automatiquement :
- ✅ Réception des leads du formulaire web
- ✅ Validation des données
- ✅ Enregistrement dans Google Sheets (CRM)
- ✅ Email de confirmation au client
- ✅ Email de notification à l'admin
- ✅ Réponse JSON au site web
- ✅ Intégration Make.com (optionnel)

---

## 🛠️ ÉTAPE 1 : Importer le Workflow dans n8n

### Sur votre instance n8n (https://n8n.swiss-leads.ch)

1. **Connectez-vous** à votre n8n
2. Cliquez sur **"Workflows"** dans le menu
3. Cliquez sur **"Import from File"** ou **"+"** puis **"Import"**
4. Sélectionnez le fichier `WORKFLOW_N8N_SWISS_HERITAGE_COMPLET.json`
5. Le workflow apparaît avec tous les nœuds

---

## 🔧 ÉTAPE 2 : Configuration Google Sheets

### 2.1 Créer votre Google Sheet CRM

1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez un nouveau tableur nommé **"Swiss Heritage - CRM Leads"**
3. Dans la première feuille (onglet "Leads"), créez ces colonnes (ligne 1) :

```
A: lead_id
B: date
C: nom
D: email
E: telephone
F: source
G: statut
H: timestamp
```

4. Notez l'**ID du Google Sheet** (dans l'URL) :
   ```
   https://docs.google.com/spreadsheets/d/COPIEZ_CET_ID/edit
   ```

### 2.2 Configurer dans n8n

1. Dans le workflow, cliquez sur le nœud **"📊 Enregistrer CRM (Google Sheets)"**
2. Cliquez sur **"Credentials"** → **"Create New"**
3. Choisissez **"Google Sheets OAuth2 API"**
4. Suivez les instructions pour connecter votre compte Google
5. Une fois connecté, dans le champ **"Document ID"** :
   - Collez l'ID de votre Google Sheet
6. Vérifiez que **"Sheet Name"** est bien **"Leads"**
7. Sauvegardez

---

## 📧 ÉTAPE 3 : Configuration SMTP (Emails)

### 3.1 Récupérer vos identifiants SMTP

**Option A : Gmail**
- Email : `votre-email@gmail.com`
- SMTP Host : `smtp.gmail.com`
- Port : `587`
- Sécurité : `TLS`
- Utilisateur : `votre-email@gmail.com`
- Mot de passe : **Créer un "App Password"** dans les paramètres Google

**Option B : Autre fournisseur**
- Consultez la documentation de votre fournisseur email

### 3.2 Configurer dans n8n

1. Cliquez sur le nœud **"📧 Email Client (Confirmation)"**
2. Cliquez sur **"Credentials"** → **"Create New"**
3. Choisissez **"SMTP"**
4. Remplissez :
   ```
   User: votre-email@gmail.com
   Password: votre-app-password
   Host: smtp.gmail.com
   Port: 587
   SSL/TLS: Activé
   ```
5. Testez la connexion
6. Sauvegardez

7. **Répétez** pour le nœud **"📧 Email Admin (Notification)"**
   - Utilisez la même credential SMTP

### 3.3 Personnaliser les emails

**Email Client :**
- Modifiez `fromEmail` : `noreply@votre-domaine.ch`
- Personnalisez le contenu HTML si besoin

**Email Admin :**
- Modifiez `toEmail` : `admin@swiss-heritage.ch` (votre email admin)
- Modifiez le lien CRM avec votre Sheet ID

---

## 🌐 ÉTAPE 4 : Activer le Webhook

### 4.1 Dans n8n

1. Cliquez sur le nœud **"📥 Webhook Formulaire"**
2. Cliquez sur **"Execute Node"** pour activer le webhook
3. **Copiez l'URL du webhook** qui s'affiche :
   ```
   https://n8n.swiss-leads.ch/webhook-test/lpp-form
   ```

### 4.2 Tester le webhook

**Méthode 1 : Depuis n8n**
1. Cliquez sur **"Listen for Test Event"** sur le webhook
2. Allez sur votre site et remplissez le formulaire
3. Le webhook devrait recevoir les données

**Méthode 2 : Avec curl**
```bash
curl -X POST https://n8n.swiss-leads.ch/webhook-test/lpp-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+41791234567",
    "timestamp": "2025-02-11T16:00:00Z",
    "source": "test"
  }'
```

---

## ✅ ÉTAPE 5 : Activation et Tests

### 5.1 Activer le Workflow

1. En haut à droite du workflow, activez le switch **"Active"**
2. Le workflow est maintenant en écoute permanente

### 5.2 Tests complets

**Test 1 : Données valides**
```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+41 79 123 45 67",
  "source": "swiss-heritage-website"
}
```
✅ Attendu :
- Lead enregistré dans Google Sheets
- Email de confirmation envoyé au client
- Email de notification envoyé à l'admin
- Réponse JSON `{"success": true}`

**Test 2 : Données invalides (email manquant)**
```json
{
  "name": "Jean Dupont",
  "phone": "+41 79 123 45 67"
}
```
❌ Attendu :
- Réponse JSON `{"success": false, "error": "Données invalides"}`
- Rien n'est enregistré

### 5.3 Vérifications

✅ **Google Sheets** : Les leads apparaissent dans le tableau
✅ **Emails** : Client et admin reçoivent les emails
✅ **Logs n8n** : Pas d'erreurs dans l'historique des exécutions

---

## 🔍 ÉTAPE 6 : Monitoring et Debug

### Voir les exécutions

1. Dans n8n, cliquez sur **"Executions"** dans le menu
2. Vous voyez toutes les exécutions du workflow
3. Cliquez sur une exécution pour voir le détail

### En cas d'erreur

**Erreur Google Sheets :**
- Vérifiez que les credentials sont valides
- Vérifiez que l'ID du Sheet est correct
- Vérifiez que les noms de colonnes correspondent

**Erreur Email :**
- Vérifiez les credentials SMTP
- Vérifiez que le port et la sécurité sont corrects
- Testez avec un email de test

**Erreur Webhook :**
- Vérifiez que le workflow est actif
- Vérifiez l'URL du webhook
- Vérifiez les CORS (allowed origins)

---

## 🎯 ÉTAPE 7 : Intégrations Avancées (Optionnel)

### 7.1 Make.com (si vous l'utilisez)

1. Créez un webhook dans Make.com
2. Copiez l'URL du webhook Make
3. Dans n8n, nœud **"🔗 Webhook Make.com"** :
   - Collez l'URL dans le champ `url`
   - Désactivez l'option `disabled`

### 7.2 Slack/Discord Notifications

Pour ajouter une notification Slack/Discord :

1. Ajoutez un nouveau nœud **Slack** ou **Discord**
2. Connectez-le après **"📊 Enregistrer CRM"**
3. Configurez le message :
   ```
   🚨 Nouveau lead LPP !
   👤 {{$json.name}}
   📧 {{$json.email}}
   📱 {{$json.phone}}
   ```

---

## 📊 Structure des Données

### Données reçues du formulaire
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "timestamp": "ISO 8601 string",
  "source": "string"
}
```

### Données enregistrées dans le CRM
```
lead_id: LPP_email_at_domain_20250211160000
date: 11/02/2025 16:00
nom: Jean Dupont
email: jean.dupont@example.com
telephone: +41 79 123 45 67
source: swiss-heritage-website
statut: nouveau
timestamp: 2025-02-11T16:00:00.000Z
```

---

## 🆘 Support et Dépannage

### Problèmes Courants

**1. Le webhook ne reçoit rien**
- Vérifiez que le workflow est actif
- Vérifiez l'URL dans le formulaire web
- Vérifiez les CORS

**2. Les emails ne partent pas**
- Vérifiez les credentials SMTP
- Vérifiez que Gmail autorise les "apps moins sécurisées"
- Utilisez un App Password pour Gmail

**3. Google Sheets n'enregistre pas**
- Vérifiez les permissions du compte Google
- Vérifiez l'ID du Sheet
- Vérifiez les noms de colonnes

### Logs utiles

```bash
# Dans n8n, voir les logs :
# Menu → Settings → Log streaming
# ou dans la console Docker si self-hosted
```

---

## ✨ Améliorations Futures

- [ ] Ajout d'un système de scoring des leads
- [ ] Intégration CRM (Pipedrive, HubSpot)
- [ ] SMS de confirmation (Twilio)
- [ ] WhatsApp Business API
- [ ] Dashboard analytics temps réel

---

## 📝 Checklist Finale

Avant de mettre en production :

- [ ] Workflow importé dans n8n
- [ ] Google Sheets configuré et testé
- [ ] SMTP configuré et testé
- [ ] Webhook activé et testé
- [ ] Emails de test reçus
- [ ] Données apparaissent dans Google Sheets
- [ ] Workflow activé (switch ON)
- [ ] URL du webhook mise à jour dans le site web
- [ ] Test end-to-end réussi

---

## 🎉 Vous êtes prêt !

Votre système d'automatisation est maintenant opérationnel !

**URL du webhook à utiliser :**
```
https://n8n.swiss-leads.ch/webhook-test/lpp-form
```

**Questions ?** Consultez la documentation n8n : https://docs.n8n.io
