import {
    getAllGalleryImages,
    getAllGalleryCategories,
    getAllGalleryTags,
} from '@/actions/manager-actions'
import { ManagerGalleryClient } from './ManagerGalleryClient'

export const dynamic = 'force-dynamic'

export default async function ManagerGaleriePage() {
    const [imagesResult, categoriesResult, tagsResult] = await Promise.all([
        getAllGalleryImages({ limit: 100 }),
        getAllGalleryCategories({ limit: 100 }),
        getAllGalleryTags({ limit: 100 }),
    ])

    return (
        <ManagerGalleryClient
            initialImages={imagesResult.docs}
            initialCategories={categoriesResult.docs}
            initialTags={tagsResult.docs}
        />
    )
}
