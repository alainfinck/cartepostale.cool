# 🧭 Démonstration Agence : Voyages Lumière

Ce document explique le fonctionnement et la configuration de la démonstration pour les agences de voyage sur **CartePostale.cool**.

## 🎯 Objectif de la démo

L'objectif est de montrer aux prospects (agences, hôtels, offices du tourisme) comment ils peuvent proposer une expérience de création de cartes postales en **marque blanche**.

La démo simule l'agence fictive **"Voyages Lumière"** avec son propre logo, ses couleurs et sa galerie de destinations.

---

## 🚀 Mise en place rapide

Un script de "seed" automatisé permet de réinitialiser et de peupler les données de démo en un clic.

### Exécuter le seed

```bash
pnpm seed:demo-agency
```

_Note : Cela utilise les images locales situées dans `public/images/demo/` pour une fiabilité totale._

---

## 📦 Ce qui est inclus dans la démo

### 1. La Galerie Agence (`/agences/demo`)

Une page vitrine premium qui simule ce que le client final voit.

- **Marque blanche** : Logo Voyages Lumière et couleur Teal (#0d9488).
- **Galerie interactive** : Filtrage par destination (Plages, Villes d'Art, etc.).
- **Aperçu 3D** : Exemple de carte postale avec retournement animé.
- **Stats fictives** : Pour montrer le potentiel de tracking.

### 2. Le Dashboard Agence (`/espace-agence/login`)

Identifiants pour tester l'interface de gestion de l'agence :

- **Email** : `demo@voyages-lumiere.fr`
- **Mot de passe** : `Demo2026!`

Dans cet espace, l'agence peut :

- Gérer son image bank (ajouter des photos de ses destinations).
- Voir les statistiques d'envoi et de partage.
- Personnaliser ses informations de contact.

---

## 🛠️ Détails techniques

### Fichiers clés

- **Script de seed** : `scripts/seed-demo-agency.ts`
- **Page Démo (Frontend)** : `src/app/(frontend)/agences/demo/`
- **Composant UI** : `AgenceDemoClient.tsx`
- **Images de démo** : `public/images/demo/`

### Branding de la démo

- **Nom** : Voyages Lumière
- **Code Agence** : `voyages-lumiere-demo` (utilisé pour filtrer la galerie)
- **Couleur Primaire** : `#0d9488` (Teal)
- **Logo** : 🧭 (Boussole)

---

## 📈 Argumentaire pour les prospects

1. **Notoriété** : Votre logo est sur chaque carte envoyée (physique et digitale).
2. **Engagement** : Vos clients partagent leurs souvenirs avec vos photos professionnelles.
3. **Data** : Vous savez quelles destinations sont les plus partagées par vos clients.
4. **Simplicité** : Un QR code suffit pour lancer l'expérience.

---

_Document généré par l'assistant Antigravity._
