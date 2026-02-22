import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://ce9bf2e12d51842c76e9929b56b1e470.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '9af79bcc40f9af683ca4147812b7d2da',
    secretAccessKey: 'bee726895bd3337f39a4465bc77c8c039f05c650b5c83a5e06eb385a5b7df281',
  },
})

async function uploadDir() {
  const dirPath = path.resolve('public/images/demo')
  const files = fs.readdirSync(dirPath)

  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const content = fs.readFileSync(filePath)
    let mimeType = 'image/jpeg'
    if (file.endsWith('.png')) mimeType = 'image/png'
    else if (file.endsWith('.webp')) mimeType = 'image/webp'

    const command = new PutObjectCommand({
      Bucket: 'cartepostale',
      Key: `demo/${file}`,
      Body: content,
      ContentType: mimeType,
    })

    try {
      await s3Client.send(command)
      console.log(`Uploaded demo/${file}`)
    } catch (e) {
      console.error(`Failed to upload ${file}:`, e)
    }
  }
}

uploadDir().catch(console.error)
