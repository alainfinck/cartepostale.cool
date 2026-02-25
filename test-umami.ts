import { getDetailedUmamiStats, getUmamiPageStats } from './src/actions/umami-actions'

async function test() {
  console.log('Testing Umami API...')

  console.log('Fetching page stats...')
  const pageStats = await getUmamiPageStats()
  console.log('Page stats keys:', Object.keys(pageStats).slice(0, 10))
  console.log('Total URLs found:', Object.keys(pageStats).length)

  const testPublicId = process.argv[2]
  if (testPublicId) {
    console.log(`Fetching detailed stats for ${testPublicId}...`)
    const stats = await getDetailedUmamiStats(testPublicId)
    console.log('Stats:', JSON.stringify(stats, null, 2))
  } else {
    console.log('No publicId provided to test detailed stats.')
    // Try to find one from pageStats
    const firstPath = Object.keys(pageStats).find((k) => k.startsWith('/carte/'))
    if (firstPath) {
      const publicId = firstPath.replace('/carte/', '')
      console.log(`Found a path: ${firstPath}, testing with publicId: ${publicId}`)
      const stats = await getDetailedUmamiStats(publicId)
      console.log('Stats:', JSON.stringify(stats, null, 2))
    }
  }
}

test().catch(console.error)
