import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
    try {
        const payload = await getPayload({ config })
        const result = await payload.find({
            collection: 'postcards',
            limit: 1,
            depth: 2,
        })

        if (result.docs.length > 0) {
            const p = result.docs[0]
            console.log('Postcard:', p.id, p.publicId)
            console.log('frontImageURL:', p.frontImageURL)
            console.log('frontImage (URL):', (p.frontImage as any)?.url)
        } else {
            console.log('No postcards found')
        }
    } catch (err) {
        console.error(err)
    }
    process.exit(0)
}

main()
