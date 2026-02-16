import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const postcardId = parseInt(id, 10)

    if (isNaN(postcardId)) {
      return NextResponse.json({ error: 'Invalid postcard ID' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get the postcard to verify it exists
    const postcard = await payload.findByID({
      collection: 'postcards',
      id: postcardId,
      depth: 0,
    })

    if (!postcard) {
      return NextResponse.json({ error: 'Postcard not found' }, { status: 404 })
    }

    // Get view events count for this postcard
    const viewEvents = await payload.find({
      collection: 'postcard-view-events',
      where: {
        postcard: {
          equals: postcardId,
        },
      },
      limit: 0, // We only need the count
      depth: 0,
    })

    // Return the view stats
    return NextResponse.json({
      views: postcard.views || 0,
      totalViewEvents: viewEvents.totalDocs,
      lastUpdate: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching postcard view stats:', error)
    return NextResponse.json({ error: 'Failed to fetch view stats' }, { status: 500 })
  }
}
