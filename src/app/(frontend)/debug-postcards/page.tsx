import { getPayload } from 'payload'
import config from '@/payload.config'
import { fixPrivatePostcards } from './actions'

export default async function DebugPostcards() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'postcards',
    limit: 20,
    sort: '-createdAt',
  })

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Postcards</h1>
      <form action={fixPrivatePostcards}>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: '600',
            transition: 'opacity 0.2s',
          }}
        >
          Fix Private Postcards (Make All Public)
        </button>
      </form>
      <pre>
        {JSON.stringify(
          result.docs.map((d) => ({
            id: d.id,
            publicId: d.publicId,
            isPublic: d.isPublic,
            senderName: d.senderName,
            status: d.status,
          })),
          null,
          2,
        )}
      </pre>
    </div>
  )
}
