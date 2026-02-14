# Infrastructure - Swiss Heritage

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│  Netlify CDN — swiss-heritage.ch                        │
│  Branch master = production auto-deploy                  │
│  Stack: React 18 (CDN) + Babel standalone               │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS POST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   N8N (Self-hosted)                       │
│  n8n.swiss-leads.ch                                      │
│  Workflows: O1-O14                                       │
│  Credentials: Google Sheets, SMTP, Twilio, Skribble      │
└───────┬────────────┬────────────┬───────────────────────┘
        │            │            │
   ┌────▼────┐  ┌────▼────┐  ┌───▼──────┐
   │ Google  │  │  SMTP   │  │ Twilio   │
   │ Sheets  │  │SendGrid │  │ WhatsApp │
   │  (CRM)  │  │         │  │          │
   └─────────┘  └─────────┘  └──────────┘
```

## Configuration requise

1. Copier `.env.example` vers `.env`
2. Remplir les credentials
3. Les credentials sont stockes DANS n8n (pas dans ce repo)

## Responsable

- **Architecture** : Claude Code
- **Deploiement & maintenance** : OpenClaw
