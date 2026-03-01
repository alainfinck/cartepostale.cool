export interface GalleryItemPublic {
  id: string
  title: string
  imageUrl: string
  caption: string | null
  categoryId: number | null
  categoryName: string | null
}

export interface GalleryCategoryPublic {
  id: number
  name: string
  slug: string
}
