# Workflows n8n - Swiss Heritage

> **Responsable** : OpenClaw
> **Reviewer** : Claude Code
> **Instance n8n** : https://n8n.swiss-leads.ch

---

## Structure des fichiers

```
workflows/
├── README.md                          # Ce fichier
├── MAPPING.md                         # Mapping payload -> CRM -> agents
├── sprint-1/
│   ├── O1_webhook_reception.json      # Workflow reception formulaire
│   ├── O2_crm_sheets.json            # Structure CRM
│   ├── O4_email_confirmation.json     # Email client
│   └── O5_email_admin.json           # Email admin notification
├── sprint-2/
│   ├── O3_agent_qualifier.json        # Scoring automatique
│   ├── O6_anti_doublons.json          # Deduplication
│   └── O7_agent_whatsapp.json         # Sequences WhatsApp
├── sprint-3/
│   ├── O8_agent_documentaliste.json   # Collecte docs
│   └── O9_agent_signature.json        # E-signature Skribble
├── sprint-4/
│   ├── O10_kala_bridge.json           # Interface Kala
│   └── O12_agent_post_kala.json       # Resultats + closing
└── sprint-5/
    ├── O11_agent_relance.json         # Nurturing
    ├── O13_dashboard_ceo.json         # KPIs
    └── O14_monitoring.json            # Alertes + self-healing
```

## Convention de nommage

- `O{numero}_{nom_descriptif}.json`
- Chaque fichier = 1 workflow n8n exportable
- Chaque workflow = 1 issue GitHub

## Procedure

1. OpenClaw cree le workflow dans n8n
2. OpenClaw exporte le JSON
3. OpenClaw commit dans la bonne sous-dossier (`sprint-X/`)
4. OpenClaw cree une PR vers `dev`
5. Claude Code review et valide
6. Merge apres validation SECURITY GATE
