const puppeteer = require('puppeteer')

;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text())
      } else {
        console.log('BROWSER LOG:', msg.text())
      }
    })
    page.on('pageerror', (error) => console.log('PAGE EXCEPTION:', error.message))

    await page.goto('http://localhost:3000/editor', { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 2000))
    await browser.close()
  } catch (err) {
    console.error('SCRIPT ERROR:', err)
  }
})()
