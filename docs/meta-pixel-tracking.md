# Meta Pixel & Conversions API — CartePostale.cool

> Documentation de l'implémentation du tracking Facebook/Meta Ads.  
> Dernière mise à jour : Février 2026

---

## 📐 Architecture

L'implémentation utilise une **approche hybride** (client + serveur) pour maximiser la qualité des données envoyées à Meta :

```
Navigateur                          Serveur Next.js
──────────────────────────────────  ─────────────────────────────────────
Meta Pixel (fbq)                    Conversions API (CAPI)
• Temps réel                        • Bypass bloqueurs de pubs
• Facile à déclencher               • Bypass restrictions iOS 14+
• Limité par ad blockers            • PII hashée SHA256
                         ↘       ↙
                      Meta Ads Manager
                   (déduplication via eventId)
```

---

## 🔧 Variables d'environnement requises

```env
# .env
META_PIXEL_ID=your_pixel_id           # Côté serveur (CAPI)
META_ACCESS_TOKEN=your_token          # Côté serveur (CAPI)
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id  # Côté client (Pixel script)
```

---

## 📁 Fichiers créés / modifiés

| Fichier                                         | Rôle                                                                            |
| :---------------------------------------------- | :------------------------------------------------------------------------------ |
| `src/components/FacebookPixel.tsx`              | Composant client — initialise le Pixel et envoie `PageView` à chaque navigation |
| `src/hooks/useFacebookPixel.ts`                 | Hook React — fonctions typées pour chaque événement                             |
| `src/app/api/meta/event/route.ts`               | Route API Next.js — proxy vers la Conversions API Meta (server-side)            |
| `src/components/analytics/PricingTracking.tsx`  | Tracking `ViewContent` sur `/pricing`                                           |
| `src/components/analytics/PostcardTracking.tsx` | Tracking `ViewContent` sur `/carte/[id]`                                        |
| `src/app/(frontend)/contact/ContactClient.tsx`  | Formulaire de contact client avec tracking `Lead`                               |
| `src/app/layout.tsx`                            | Intégration de `<FacebookPixel />` dans le layout racine                        |

---

## 📊 Événements trackés — Parcours utilisateur complet

### 1. `PageView` — Toutes les pages

- **Déclencheur** : Automatique à chaque chargement de page et chaque changement de route (SPA).
- **Mode** : Client uniquement.
- **Implémenté dans** : `FacebookPixel.tsx` + `layout.tsx`.

---

### 2. `ViewContent` — Consultation d'une page produit

| Sous-événement                | Déclencheur                 | `content_name`            |
| :---------------------------- | :-------------------------- | :------------------------ |
| Page Tarifs `/pricing`        | Ouverture de la page        | `"Page Tarifs"`           |
| Vue d'une carte `/carte/[id]` | Ouverture de la carte reçue | `"Carte de {senderName}"` |

- **Mode** : Client uniquement.
- **Implémenté dans** : `PricingTracking.tsx`, `PostcardTracking.tsx`.

---

### 3. `CustomizeProduct` — L'utilisateur commence à créer

| Sous-événement    | Déclencheur                                          |
| :---------------- | :--------------------------------------------------- |
| Début de création | Upload de la **première photo recto** dans l'éditeur |
| Finalisation      | Postcard créée avec succès (`handlePublish`)         |

- **Mode** : Client uniquement.
- **Implémenté dans** : `EditorClient.tsx`.

---

### 4. `AddToCart` — Intention d'achat premium

- **Déclencheur** : Le premier média premium (photo d'album ou vidéo) est ajouté → `isPremium` passe à `true`.
- **Données** :
  ```json
  {
    "content_name": "Carte Postale Premium CartePostale.cool",
    "value": 2.99,
    "currency": "EUR"
  }
  ```
- **Mode** : Client uniquement.
- **Implémenté dans** : `EditorClient.tsx` (useEffect sur `isPremium`).

---

### 5. `InitiateCheckout` — Ouverture du tunnel de paiement

- **Déclencheur** : Clic sur le bouton **"Régler X€ avec Revolut"**.
- **Données** :
  ```json
  {
    "value": 2.99,
    "currency": "EUR",
    "content_name": "Carte Postale Premium CartePostale.cool"
  }
  ```
- **Mode** : Client uniquement.
- **Implémenté dans** : `EditorClient.tsx` → `handlePayWithRevolut()`.

---

### 6. `Purchase` ⭐ — Paiement validé

- **Déclencheur** : Retour sur le site après paiement Revolut avec `?payment_success=true`.
- **Données** :
  ```json
  {
    "value": 2.99,
    "currency": "EUR",
    "content_name": "Carte Postale Premium CartePostale.cool",
    "content_type": "product"
  }
  ```
- **Mode** : **Serveur uniquement via Conversions API** (résistant aux bloqueurs et à iOS 14+).
- **PII** : L'email de l'utilisateur est hashé en SHA256 avant envoi.
- **Implémenté dans** : `EditorClient.tsx` (useEffect sur `searchParams`) → `POST /api/meta/event`.

> ⚠️ **Note** : Pour un tracking encore plus précis, ce déclenchement devrait idéalement se faire côté serveur via le **webhook Revolut** (à implémenter ultérieurement).

---

### 7. `Lead` — Expression d'intérêt

| Sous-événement     | Déclencheur                    | `content_name`            |
| :----------------- | :----------------------------- | :------------------------ |
| Connexion email    | Login réussi sur `/connexion`  | `"Connexion Email"`       |
| Formulaire contact | Envoi du formulaire `/contact` | `"Formulaire de Contact"` |

- **Mode** : Client uniquement.
- **Implémenté dans** : `ConnexionClient.tsx`, `ContactClient.tsx`.

---

### 8. `CompleteRegistration` — Création de compte

| Sous-événement         | Déclencheur                             | `content_name`            |
| :--------------------- | :-------------------------------------- | :------------------------ |
| Inscription email      | Inscription réussie sur `/connexion`    | `"Inscription Email"`     |
| Google Login (éditeur) | Connexion Google réussie dans l'éditeur | `"Google Login - Editor"` |

- **Mode** : Client uniquement.
- **Implémenté dans** : `ConnexionClient.tsx`, `EditorClient.tsx`.

---

## 🔄 Déduplication

Les événements envoyés à la fois via le Pixel client ET la Conversions API utilisent un `eventId` commun pour que Meta ne compte pas l'événement deux fois.

```ts
const eventId = `purchase_${Date.now()}`
// Envoyé dans fbq('track', 'Purchase', params, { eventID: eventId })
// ET dans le body de POST /api/meta/event { eventId }
```

---

## 🛠️ Utilisation du hook `useFacebookPixel`

```tsx
import { useFacebookPixel } from '@/hooks/useFacebookPixel'

function MyComponent() {
  const {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase, // client + serveur (CAPI)
    trackLead,
    trackCompleteRegistration,
    trackCustomizeProduct,
    trackSearch,
    trackServerEvent, // CAPI uniquement
  } = useFacebookPixel()

  // Exemple
  const handleBuy = async () => {
    await trackPurchase({
      value: 2.99,
      currency: 'EUR',
      eventId: `purchase_${Date.now()}`,
      userEmail: 'user@example.com', // hashé automatiquement côté serveur
    })
  }
}
```

---

## ✅ Liste de vérification avant mise en prod

- [ ] `META_PIXEL_ID` configuré sur le serveur de prod
- [ ] `META_ACCESS_TOKEN` configuré sur le serveur de prod (token système Meta, pas temporaire)
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` configuré sur le serveur de prod
- [ ] Tester avec **Meta Pixel Helper** (extension Chrome)
- [ ] Valider les événements dans **Meta Events Manager → Test Events**
- [ ] Vérifier la déduplication : un seul `Purchase` affiché par achat
- [ ] Ajouter le tracking `Purchase` dans le **webhook Revolut** pour une couverture 100%

---

## 🔮 Améliorations futures

| Priorité   | Amélioration                                                           |
| :--------- | :--------------------------------------------------------------------- |
| 🔴 Haute   | Déclencher `Purchase` depuis le webhook Revolut (côté serveur garanti) |
| 🟡 Moyenne | Passer `content_ids` avec l'ID de la carte lors du `Purchase`          |
| 🟡 Moyenne | Ajouter `Search` sur la page galerie `/galerie`                        |
| 🟢 Basse   | Ajouter le tracking sur les pages agence `/agences` (Lead B2B)         |
