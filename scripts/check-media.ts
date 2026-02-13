import { getPayload } from 'payload'
import config from '../src/payload.config'

async function check() {
    const payload = await getPayload({ config })
    const media = await payload.find({
        collection: 'media',
        limit: 5,
    })

    console.log('Media found:', media.totalDocs)
    for (const doc of media.docs) {
        console.log(`- ID: ${doc.id}, Filename: ${doc.filename}, URL: ${doc.url}`)
        // Try to check if file exists on disk
        const fs = await import('fs')
        const path = await import('path')
        const filePath = path.resolve(process.cwd(), 'public/media', doc.filename as string)
        if (fs.existsSync(filePath)) {
            console.log(`  File exists on disk at ${filePath}`)
        } else {
            console.log(`  MISSING on disk at ${filePath}`)
        }
    }
}

check().catch(console.error)
