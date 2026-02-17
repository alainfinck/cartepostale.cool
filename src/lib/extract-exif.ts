/**
 * Utilitaire pour extraire les données EXIF des images, notamment les coordonnées GPS
 */

import exifr from 'exifr'

export interface ExifGpsData {
  latitude: number
  longitude: number
}

export interface ExifData {
  gps?: ExifGpsData
  dateTime?: Date
  cameraMake?: string
  cameraModel?: string
}

/**
 * Extrait les données EXIF d'une image (File ou Blob ou URL ou Buffer)
 * @param source Fichier image, Blob, URL ou Buffer
 * @returns Données EXIF extraites ou null si non disponibles
 */
export async function extractExifData(
  source: File | Blob | string | Buffer | ArrayBuffer,
): Promise<ExifData | null> {
  try {
    // Basic check to avoid processing non-image files if possible, though exifr handles it.
    // If source is string and not an image URL, exifr might throw or return undefined.

    // Extraire les coordonnées GPS avec la méthode optimisée
    const gpsData = await exifr.gps(source)

    // Extraire d'autres métadonnées EXIF utiles
    const exifData = await exifr.parse(source, {
      pick: ['Make', 'Model', 'DateTime', 'DateTimeOriginal'],
    })

    const result: ExifData = {}

    // GPS coordinates
    if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
      result.gps = {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
      }
    }

    // Camera make & model
    if (exifData) {
      if (exifData.Make) {
        result.cameraMake = String(exifData.Make).trim()
      }
      if (exifData.Model) {
        result.cameraModel = String(exifData.Model).trim()
      }

      // Date taken (prefer DateTimeOriginal over DateTime)
      const dateValue = exifData.DateTimeOriginal || exifData.DateTime
      if (dateValue) {
        try {
          result.dateTime = new Date(dateValue)
        } catch (e) {
          console.warn('Could not parse EXIF date:', dateValue)
        }
      }
    }

    // Retourner null si aucune donnée EXIF trouvée
    return Object.keys(result).length > 0 ? result : null
  } catch (_error) {
    console.warn('Failed to extract EXIF data:', _error)
    return null
  }
}

/**
 * Vérifie si une image a des données GPS
 */
export async function hasGpsData(source: File | Blob | string): Promise<boolean> {
  try {
    const gpsData = await exifr.gps(source)
    return !!(
      gpsData &&
      typeof gpsData.latitude === 'number' &&
      typeof gpsData.longitude === 'number'
    )
  } catch {
    return false
  }
}
