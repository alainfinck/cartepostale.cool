# Déploiement Coolify / VPS

## Problème : images qui disparaissent après quelques minutes

En Docker/Coolify, les fichiers uploadés (photos des cartes) sont écrits dans `public/media` **à l’intérieur du container**. Ce système de fichiers est **éphémère** : à chaque redémarrage du container (redeploy, health check, mise à jour), les fichiers sont perdus. La base de données garde les références, mais les fichiers n’existent plus → **image introuvable (404)**.

## Solutions

### Option 1 : Volume persistant (rapide, sans changement de code)

Monter un volume sur le répertoire où l’app écrit les médias pour qu’ils survivent aux redémarrages.

1. Dans **Coolify** → votre application → **Storages** (ou **Volumes**).
2. Ajouter un volume persistant :
   - **Container Path** : `/app/public/media`
   - **Source** : un chemin sur l’hôte (ex. `cartepostale-media`) ou laisser Coolify gérer.
3. Redémarrer le service.

Les nouveaux uploads seront alors stockés sur le volume et resteront après un redéploiement.

**Note** : Les fichiers déjà “perdus” ne reviendront pas. Il faudra re-uploader les images concernées ou migrer vers l’option 2 puis re-uploader.

---

### Option 2 : Stockage S3-compatible (recommandé en production)

Les médias sont stockés dans un bucket S3 (ou compatible : **Cloudflare R2**, Minio, DigitalOcean Spaces, etc.). Les URLs pointent vers le bucket, plus vers le filesystem du container.

#### Cloudflare R2

1. Dans **Cloudflare Dashboard** → **R2** → votre bucket → **Settings** → **S3 API** : récupérez l’endpoint, créez des **API tokens** (Access Key ID + Secret Access Key) si besoin.
2. Dans **Coolify** → votre application → **Variables d’environnement**, ajoutez :

   | Variable               | Description | Exemple R2 |
   |------------------------|-------------|------------|
   | `S3_BUCKET`            | Nom du bucket R2 | `cartepostale` |
   | `S3_ACCESS_KEY_ID`     | R2 API Token – Access Key ID | (depuis Cloudflare R2) |
   | `S3_SECRET_ACCESS_KEY` | R2 API Token – Secret Key | (depuis Cloudflare R2) |
   | `S3_ENDPOINT`          | URL S3 de R2 | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
   | `R2_PUBLIC_BASE_URL`   | URL publique du bucket (R2.dev subdomain ou custom domain, sans slash final) | `https://pub-xxxxx.r2.dev` |

   **Important** : `S3_ACCESS_KEY_ID` doit contenir **uniquement** la valeur de l’Access Key (pas de format `key=value`, pas d’espaces avant/après). Sinon erreur Sigv4 « Credential should have at least 5 slash-separated parts, not 1 » et 401 sur les uploads.

   Pour R2, **ne pas** définir `S3_REGION` (l’app utilise `auto` automatiquement quand l’endpoint contient `r2.cloudflarestorage.com`).

   **CORS** (obligatoire pour l’éditeur public) : pour les uploads depuis le navigateur (manager/cartes, éditeur), le navigateur envoie une requête préflight (OPTIONS) vers R2 avant le PUT. Sans CORS configuré sur le bucket, R2 répond **403** et vous verrez « Preflight response is not successful » / « access control checks » dans la console, puis « Impossible de créer le lien » après publication.

   Dans **Cloudflare** → **R2** → votre bucket → **Settings** → **CORS policy**, ajoutez une politique (ou remplacez l’existant) par le JSON suivant, en adaptant les origines si besoin :

   ```json
   [
     {
       "AllowedOrigins": [
         "https://www.cartepostale.cool",
         "https://cartepostale.cool",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Sauvegardez, puis réessayez un upload (photo de face ou album) et la publication depuis l’éditeur.

3. **Domaine public R2 (affichage des images)**  
   L’endpoint S3 de R2 n’est pas lisible publiquement. Il faut activer l’accès public sur le bucket et définir l’URL de base :

   - Dans **Cloudflare** → **R2** → votre bucket → **Settings** → **Public access** : activez « R2.dev subdomain » (ou un Custom Domain).
   - Récupérez l’URL publique (ex. `https://pub-xxxxx.r2.dev`).
   - Dans Coolify, ajoutez la variable **`R2_PUBLIC_BASE_URL`** = cette URL (sans slash final), ex. `https://pub-xxxxx.r2.dev`.
   Sans `R2_PUBLIC_BASE_URL`, les URLs stockées pointeraient vers l’API S3 et les images ne s’afficheraient pas.

4. **Redéployer** l’application. Les **nouveaux** uploads iront dans R2 (upload direct navigateur → R2 via presigned URL). Les anciens médias restent en base ; s’ils pointaient vers `/media/...` (fichiers locaux perdus), re-uploader ces images.

5. **Migrer les fichiers locaux vers R2** (optionnel) : si tu as encore des fichiers dans `public/media` (par ex. en local ou sur un volume), lance une fois :
   ```bash
   pnpm run migrate-media-to-r2
   ```
   Le script envoie chaque fichier listé en base vers le bucket R2.

6. **Mettre à jour la BDD vers les URLs R2** : pour que les champs `url` (media) et `frontImageURL` (postcards) pointent vers les URLs R2, lance une fois (après avoir défini `R2_PUBLIC_BASE_URL`) :
   ```bash
   pnpm run update-media-urls-to-r2
   ```
   À faire après la migration des fichiers, ou dès que les médias sont sur R2 (nouveaux uploads). Les pages publiques utiliseront alors directement les URLs R2.

#### Autres (AWS S3, Minio, etc.)

| Variable               | Description |
|------------------------|-------------|
| `S3_BUCKET`           | Nom du bucket |
| `S3_ACCESS_KEY_ID`    | Clé d’accès |
| `S3_SECRET_ACCESS_KEY`| Clé secrète |
| `S3_REGION`           | Optionnel ; défaut `us-east-1` (ou `auto` pour R2) |
| `S3_ENDPOINT`         | Pour Minio / R2 : URL de l’API S3 |

Rendre les objets lisibles (policy du bucket ou domaine public R2) pour que les images s’affichent.

---

## Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| **403** sur `r2.cloudflarestorage.com` / « Preflight response is not successful » / « access control checks » | CORS non configuré sur le bucket R2 | Configurer la politique CORS (voir section Cloudflare R2 ci-dessus). |
| **Impossible de créer le lien** après publication, ou **500** sur l’éditeur | Souvent : upload R2 en 403 → fallback base64 → payload trop volumineux ou erreur serveur | Corriger CORS sur R2 pour que les photos partent bien en PUT ; réessayer la publication. |
| Images 404 sur la carte publique | `R2_PUBLIC_BASE_URL` non défini ou accès public R2 désactivé | Définir `R2_PUBLIC_BASE_URL` et activer l’accès public (R2.dev ou custom domain) sur le bucket. |

---

## Résumé

| Situation                         | Action recommandée                                      |
|----------------------------------|---------------------------------------------------------|
| Déploiement actuel, pas de S3    | Option 1 : volume sur `/app/public/media`               |
| Nouveau déploiement / production | Option 2 : S3 (ou Minio) + variables d’env ci-dessus   |
| Images déjà 404                  | Re-upload des images après avoir mis en place 1 ou 2    |
