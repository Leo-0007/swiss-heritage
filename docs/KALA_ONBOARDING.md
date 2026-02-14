# Kala API Onboarding - Checklist

> **Objectif** : Documenter toutes les informations a obtenir de Kala
> pour basculer Swiss Heritage de Mode A (redirection URL) a Mode B (API directe).
> **Responsable** : Humain (Product Owner) en contact avec Kala
> **Statut** : EN ATTENTE - Kala API pas encore documentee

---

## 1. Informations a obtenir de Kala

### Acces partenaire (Mode A - URGENT)

| # | Information | Statut | Valeur |
|---|------------|--------|--------|
| 1 | URL partenaire de redirection | A OBTENIR | `https://kala.ch/partner/swiss-heritage` ? |
| 2 | Parametres URL (reference lead, tracking) | A OBTENIR | `?ref=SH-xxxx&partner=swiss-heritage` ? |
| 3 | Identifiant partenaire Swiss Heritage | A OBTENIR | - |
| 4 | Dashboard partenaire (suivi des leads rediriges) | A OBTENIR | URL ? |
| 5 | Convention partenariat signee | A OBTENIR | - |

### Acces API (Mode B - QUAND DISPONIBLE)

| # | Information | Statut | Valeur |
|---|------------|--------|--------|
| 6 | Documentation API (OpenAPI/Swagger) | A OBTENIR | - |
| 7 | URL de base API | A OBTENIR | `https://api.kala.ch/v1` ? |
| 8 | Cle API (API key ou OAuth) | A OBTENIR | - |
| 9 | Environnement sandbox/test | A OBTENIR | - |
| 10 | Rate limits | A OBTENIR | - |
| 11 | Format authentification (Bearer, API key header) | A OBTENIR | - |

### Webhook retour (Mode B)

| # | Information | Statut | Valeur |
|---|------------|--------|--------|
| 12 | Kala supporte les webhooks de retour ? | A OBTENIR | oui/non |
| 13 | Format payload webhook | A OBTENIR | JSON ? |
| 14 | Signature webhook (HMAC, secret) | A OBTENIR | - |
| 15 | Evenements envoyes (found, not_found, error) | A OBTENIR | - |
| 16 | Frequence / delai des notifications | A OBTENIR | - |
| 17 | Si pas de webhook : endpoint polling GET ? | A OBTENIR | - |

---

## 2. Mapping des champs Swiss Heritage -> Kala

### Champs a transmettre

| Champ Swiss Heritage | Champ Kala (a confirmer) | Obligatoire | Notes |
|---------------------|------------------------|-------------|-------|
| `lead_id` | `partner_reference` | Oui | Notre reference interne |
| `prenom` | `first_name` ? | Oui | |
| `nom` | `last_name` ? | Oui | |
| `email` | `email` ? | Oui | |
| `phone` | `phone` ? | Oui | Format +41... |
| `date_naissance` | `date_of_birth` ? | Non | Format ISO YYYY-MM-DD |
| `canton` | `canton` ? | Non | |
| `nationalite` | `nationality` ? | Non | |
| `nb_employeurs` | ? | Non | Kala a besoin de ca ? |
| `statut_emploi` | ? | Non | Kala a besoin de ca ? |
| (callback) | `callback_url` ? | Oui | Notre webhook W3 |

> **IMPORTANT** : Les noms de champs Kala sont hypothetiques.
> Ils seront remplaces par les vrais noms une fois la doc API recue.

### Champs retour Kala (a confirmer)

| Champ Kala (hypothetique) | Usage Swiss Heritage |
|--------------------------|---------------------|
| `case_id` | Stocke dans CRM comme `kala_reference` |
| `status` | Mappe vers nos statuts (result_found, result_empty) |
| `amount_found` | Montant des avoirs trouves |
| `institutions_count` | Nombre d'institutions avec des avoirs |
| `details` | Details additionnels |

---

## 3. Plan de bascule Mode A -> Mode B

### Phase 1 : Preparation (1-2 jours)

- [ ] Recevoir documentation API de Kala
- [ ] Recevoir credentials sandbox
- [ ] Valider le mapping des champs (section 2 ci-dessus)
- [ ] Confirmer le format du webhook retour
- [ ] Confirmer URL de callback : `https://n8n.swiss-leads.ch/webhook/kala-result`

### Phase 2 : Implementation (2-3 jours)

- [ ] OpenClaw : ajouter branche Mode B dans W1
- [ ] OpenClaw : configurer variables d'environnement n8n
- [ ] OpenClaw : creer W3 (webhook retour Kala)
- [ ] OpenClaw : connecter W3 a W4 (post-resultat)
- [ ] Claude Code : ajuster formulaire si Kala requiert des champs supplementaires

### Phase 3 : Test (1-2 jours)

- [ ] Envoyer 3 leads de test via sandbox Kala
- [ ] Verifier creation dossier cote Kala
- [ ] Verifier reception kala_reference dans CRM
- [ ] Simuler webhook retour (result_found + result_empty)
- [ ] Verifier declenchement W4 (email post-resultat)
- [ ] Verifier fallback automatique si API Kala down

### Phase 4 : Go Live (1 jour)

- [ ] Changer `KALA_MODE=B` en production
- [ ] Monitorer les 10 premiers leads
- [ ] Verifier aucun lead perdu (comparer CRM vs dashboard Kala)
- [ ] Confirmer reception des premiers webhooks retour
- [ ] Communiquer le changement a l'equipe

---

## 4. Questions pour Kala

### A poser en priorite

1. **Avez-vous une URL partenaire** que nous pouvons utiliser pour rediriger nos clients ? (Mode A)
2. **L'API est-elle disponible pour les partenaires** ? Si oui, pouvez-vous nous fournir la documentation ?
3. **Supportez-vous les webhooks** pour notifier les partenaires du resultat de recherche ?
4. **Quel est le format d'authentification** ? (API key, OAuth2, autre)
5. **Avez-vous un environnement de test** (sandbox) ?

### A poser ensuite

6. Quels champs sont obligatoires pour creer un dossier ?
7. Y a-t-il des restrictions de rate limiting ?
8. Comment sont geres les doublons (meme personne soumise 2 fois) ?
9. Quel est le SLA de l'API (uptime, temps de reponse) ?
10. Comment est tracee la commission partenaire (3%) ?

---

## 5. Contacts Kala

| Role | Nom | Email | Notes |
|------|-----|-------|-------|
| Contact commercial | A remplir | A remplir | Premier contact |
| Contact technique | A remplir | A remplir | Pour integration API |
| Support partenaire | A remplir | A remplir | Problemes en production |

---

## 6. Timeline estimee

```
Aujourd'hui          Mode A operationnel (redirection URL)
                     |
                     v
Reception specs API  -----> Phase 1 (1-2j) : Preparation
                                    |
                                    v
                            Phase 2 (2-3j) : Implementation
                                    |
                                    v
                            Phase 3 (1-2j) : Test sandbox
                                    |
                                    v
                            Phase 4 (1j) : Go Live Mode B
                                    |
                                    v
                     Mode B operationnel (automatique end-to-end)
```

> **Estimation totale** : 5-8 jours ouvrables apres reception des specs API.
