# 🏦 Swiss Heritage - Site Web + Automation n8n

## 📁 Contenu du Dossier

```
versionfianleswissheritage/
├── index.html                          # Page HTML principale
├── swiss-heritage-lpp.jsx              # Composant React (modifié pour Netlify)
├── _redirects                          # Configuration Netlify redirects
├── netlify.toml                        # Configuration Netlify
├── WORKFLOW_N8N_SWISS_HERITAGE_COMPLET.json  # Workflow n8n complet
├── GUIDE_CONFIGURATION_N8N.md          # Guide de configuration détaillé
├── TEMPLATE_GOOGLE_SHEET.csv           # Template pour Google Sheets
└── README.md                           # Ce fichier
```

---

## 🚀 Déploiement Rapide

### 1️⃣ Déployer le Site Web sur Netlify

**Méthode Drag & Drop (la plus simple) :**

1. Allez sur [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez **tout le dossier** `versionfianleswissheritage`
3. Attendez la fin du déploiement
4. Netlify vous donne une URL : `https://random-name.netlify.app`
5. Vous pouvez personnaliser le nom du site dans les paramètres

**Ou via Git :**

```bash
# Initialisez un repo Git
git init
git add .
git commit -m "Initial commit - Swiss Heritage LPP"

# Poussez sur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/swiss-heritage.git
git push -u origin main

# Connectez Netlify à votre repo GitHub
```

### 2️⃣ Configurer n8n

1. Ouvrez `GUIDE_CONFIGURATION_N8N.md`
2. Suivez les étapes pas à pas
3. Importez le workflow `WORKFLOW_N8N_SWISS_HERITAGE_COMPLET.json`
4. Configurez Google Sheets et SMTP
5. Activez le workflow

### 3️⃣ Connecter le Site au Webhook

L'URL du webhook est **déjà configurée** dans le code :
```
https://n8n.swiss-leads.ch/webhook-test/lpp-form
```

✅ **Aucune modification nécessaire** si vous utilisez cette URL n8n !

---

## ✨ Fonctionnalités

### Site Web
- ✅ Design premium et responsive
- ✅ Formulaire de capture de leads
- ✅ Validation côté client
- ✅ Messages de succès/erreur
- ✅ Compatible tous navigateurs
- ✅ Optimisé SEO

### Automation n8n
- ✅ Réception automatique des leads
- ✅ Validation des données
- ✅ Enregistrement dans Google Sheets (CRM)
- ✅ Email de confirmation au client (HTML stylé)
- ✅ Email de notification à l'admin
- ✅ Réponse JSON au site web
- ✅ Support Make.com (optionnel)

---

## 🎯 Ce qui a été Modifié

### ✅ Problèmes Résolus

**1. Compatibilité Netlify**
- ❌ Avant : `import React from 'react'` (ne fonctionne pas avec Babel standalone)
- ✅ Après : `const { useState, useEffect } = React` (compatible)

**2. Formulaire Connecté au Webhook**
- ✅ Fonction `handleSubmit` ajoutée
- ✅ Validation des champs
- ✅ États de chargement
- ✅ Messages de succès/erreur
- ✅ Envoi des données en JSON vers n8n

**3. Workflow n8n Complet**
- ✅ Basé sur le workflow LPP précédent
- ✅ Amélioré et simplifié
- ✅ Emails HTML professionnels
- ✅ Gestion d'erreurs robuste
- ✅ Validation des données

---

## 📊 Flux de Données

```
┌─────────────────┐
│  Site Web       │
│  (Formulaire)   │
└────────┬────────┘
         │ POST JSON
         ▼
┌─────────────────┐
│  n8n Webhook    │
│  /lpp-form      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
│  Données        │
└────────┬────────┘
         │
         ├─────────────┬─────────────┬──────────────┐
         ▼             ▼             ▼              ▼
┌──────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│ Google Sheets│ │Email     │ │Email      │ │Make.com  │
│ (CRM)        │ │Client    │ │Admin      │ │(Option)  │
└──────────────┘ └──────────┘ └───────────┘ └──────────┘
         │
         ▼
┌─────────────────┐
│  Réponse JSON   │
│  au Site Web    │
└─────────────────┘
```

---

## 🔧 Configuration Requise

### Pour le Site Web
- ✅ Compte Netlify (gratuit)
- ✅ Navigateur moderne

### Pour n8n
- ✅ Instance n8n (`n8n.swiss-leads.ch`)
- ✅ Compte Google (pour Google Sheets)
- ✅ Compte SMTP (Gmail, etc.)

---

## 📝 Données Envoyées

### Format JSON du Formulaire → n8n
```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+41 79 123 45 67",
  "timestamp": "2025-02-11T16:00:00.000Z",
  "source": "swiss-heritage-website"
}
```

### Réponse n8n → Site Web (Succès)
```json
{
  "success": true,
  "message": "Votre demande a été enregistrée avec succès.",
  "lead_id": "LPP_jean_dupont_at_example_20250211160000",
  "next_steps": [
    "Vérifiez votre email (y compris spam)",
    "Notre équipe vous contactera sous 24-48h",
    "Préparez vos documents LPP si vous en avez"
  ]
}
```

### Réponse n8n → Site Web (Erreur)
```json
{
  "success": false,
  "error": "Données invalides",
  "message": "Veuillez remplir tous les champs obligatoires"
}
```

---

## 🧪 Tests

### Test du Site Web

1. Déployez sur Netlify
2. Ouvrez l'URL du site
3. Remplissez le formulaire :
   - Nom : Test User
   - Email : votre-email@example.com
   - Téléphone : +41 79 123 45 67
4. Cliquez sur "Lancer ma recherche gratuite"
5. Vérifiez le message de succès

### Test du Workflow n8n

1. Activez le workflow dans n8n
2. Cliquez sur "Execute Workflow" ou soumettez le formulaire web
3. Vérifiez :
   - ✅ Lead dans Google Sheets
   - ✅ Email reçu (client)
   - ✅ Email reçu (admin)
   - ✅ Pas d'erreurs dans les logs n8n

---

## 🐛 Dépannage

### Le site ne s'affiche pas sur Netlify
- ❌ Vérifiez que `index.html` est à la racine
- ❌ Vérifiez que `swiss-heritage-lpp.jsx` est présent
- ❌ Regardez les logs de build Netlify

### Le formulaire ne s'envoie pas
- ❌ Vérifiez l'URL du webhook dans le code
- ❌ Vérifiez que le workflow n8n est actif
- ❌ Ouvrez la console du navigateur (F12) pour voir les erreurs

### Les emails ne partent pas
- ❌ Vérifiez les credentials SMTP dans n8n
- ❌ Vérifiez les logs du workflow n8n
- ❌ Testez avec un autre email

### Google Sheets ne se remplit pas
- ❌ Vérifiez les permissions du compte Google
- ❌ Vérifiez l'ID du Google Sheet
- ❌ Vérifiez que les colonnes correspondent

---

## 📚 Documentation

- **n8n** : [docs.n8n.io](https://docs.n8n.io)
- **Netlify** : [docs.netlify.com](https://docs.netlify.com)
- **React** : [react.dev](https://react.dev)

---

## 🎉 Checklist de Mise en Production

- [ ] Site déployé sur Netlify
- [ ] Workflow n8n importé
- [ ] Google Sheets créé et configuré
- [ ] SMTP configuré dans n8n
- [ ] Webhook actif dans n8n
- [ ] Test end-to-end réussi
- [ ] Emails de test reçus
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Analytics ajouté (Google Analytics)

---

## 📞 Support

Pour toute question :
- 📧 Email : contact@swiss-heritage.ch
- 📖 Guide complet : `GUIDE_CONFIGURATION_N8N.md`

---

## 🔐 Sécurité

- ✅ Validation des données côté client et serveur
- ✅ HTTPS sur Netlify
- ✅ Webhook sécurisé (n8n)
- ✅ CORS configuré
- ✅ Pas de données sensibles en frontend
- ✅ Emails cryptés (SSL/TLS)

---

## 📈 Améliorations Futures

- [ ] Ajouter Google Analytics
- [ ] Ajouter un chatbot (Intercom, Crisp)
- [ ] Ajouter des témoignages dynamiques
- [ ] Créer une page de remerciement dédiée
- [ ] Ajouter un système de suivi des leads (pipeline)
- [ ] Intégrer un CRM (Pipedrive, HubSpot)

---

**Créé avec ❤️ pour Swiss Heritage**
