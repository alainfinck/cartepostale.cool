const { Client } = require('pg')

async function test() {
  const client1 = new Client({ connectionString: 'postgres://localhost:5432/postgres' })
  try {
    await client1.connect()
    const res = await client1.query('SELECT count(*) FROM posts')
    console.log('localhost posts count:', res.rows[0].count)
  } catch (e) {
    console.error('localhost err:', e.message)
  } finally {
    await client1.end()
  }

  const client2 = new Client({
    connectionString:
      'postgres://postgres:92zPaxJMJflZvavuFGj2MuuuKCTVAXS6M3XicB5KD8ioKezgqPPdoBPMjOT2abkw@46.225.1.245:5432/postgres',
  })
  try {
    await client2.connect()
    const res2 = await client2.query('SELECT count(*) FROM posts')
    console.log('remote posts count:', res2.rows[0].count)
  } catch (e) {
    console.error('remote err:', e.message)
  } finally {
    await client2.end()
  }
}

test()
