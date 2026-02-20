import payloadConfig from '@payload-config'
import { getPayload } from 'payload'
import { getAuthjsInstance } from 'payload-authjs'

let payloadInstance: null | ReturnType<typeof getPayload> = null

// Use a singleton pattern to ensure Payload is initialized only once
const getPayloadInstance = async () => {
  if (!payloadInstance) {
    payloadInstance = getPayload({ config: payloadConfig })
  }
  return await payloadInstance
}

const payload = await getPayloadInstance()
export const { handlers, signIn, signOut, auth } = getAuthjsInstance(payload)
