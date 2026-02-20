const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '../public')

async function convert() {
  const icons = [
    { src: 'icon-192x192.png', size: 192 },
    { src: 'icon-512x512.png', size: 512 },
  ]

  for (const icon of icons) {
    const filePath = path.join(publicDir, icon.src)
    const tempSvgPath = path.join(publicDir, `temp-${icon.src}.svg`)

    // Read the current file (which is SVG text)
    const svgContent = fs.readFileSync(filePath, 'utf8')

    console.log(`Converting ${icon.src}...`)

    await sharp(Buffer.from(svgContent))
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(publicDir, `new-${icon.src}`))

    // Replace old file with new PNG
    fs.unlinkSync(filePath)
    fs.renameSync(path.join(publicDir, `new-${icon.src}`), filePath)

    console.log(`Done: ${icon.src}`)
  }
}

convert().catch((err) => {
  console.error(err)
  process.exit(1)
})
