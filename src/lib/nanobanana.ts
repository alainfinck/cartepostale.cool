/**
 * NanoBanana API – AI image generation for postcards.
 * Doc: https://nanobananaapi.dev/docs
 *
 * The API key (NANOBANANA_API_KEY) must never be exposed client-side;
 * all calls go through our own API route.
 */

const NANOBANANA_API_URL = 'https://api.nanobananaapi.dev/v1/images/generate'

export type NanoBananaModel =
  | 'gemini-2.5-flash-image'
  | 'gemini-2.5-flash-image-hd'
  | 'gemini-3-pro-image-preview'

export type NanoBananaImageSize = '3:2' | '2:3' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

export interface GenerateImageParams {
  prompt: string
  model?: NanoBananaModel
  imageSize?: NanoBananaImageSize
  num?: number
}

export interface NanoBananaImage {
  url: string
}

export interface NanoBananaResponse {
  data: NanoBananaImage[]
}

export async function generatePostcardImage(
  apiKey: string,
  params: GenerateImageParams,
): Promise<NanoBananaResponse> {
  const { prompt, model = 'gemini-2.5-flash-image-hd', imageSize = '3:2', num = 1 } = params

  const postcardPrompt = [
    'Create a beautiful, high-quality postcard photograph.',
    'The image should be vibrant, well-composed, and suitable as the front of a postcard.',
    'Style: professional travel/landscape photography with warm natural colors.',
    prompt,
  ].join(' ')

  const res = await fetch(NANOBANANA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      prompt: postcardPrompt,
      model,
      image_size: imageSize,
      num,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let errJson: { message?: string; error?: string } = {}
    try {
      errJson = JSON.parse(errText)
    } catch {
      // ignore
    }
    throw new Error(
      errJson.message || errJson.error || `NanoBanana API ${res.status}: ${errText}`,
    )
  }

  return (await res.json()) as NanoBananaResponse
}
