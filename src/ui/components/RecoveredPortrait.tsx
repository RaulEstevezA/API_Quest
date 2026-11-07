/**
 * Image recovered by the hidden `/developer` route of the Sandbox. The file is stored
 * gzipped under a neutral name, so that it cannot be previewed by browsing the repository
 * or the published folder. It is only downloaded and decoded when a player finds it.
 */

import { useEffect, useState } from 'react'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.sandbox

const ARTIFACT_URL = `${import.meta.env.BASE_URL}assets/data/dv-5c2e.bin`

/**
 * Downloads and decompresses the image.
 *
 * @param signal Cancels the download when the component goes away.
 * @returns The decoded image.
 * @throws When the download or the decompression fails.
 */
async function decodeArtifact(signal: AbortSignal): Promise<Blob> {
  const response = await fetch(ARTIFACT_URL, { signal })
  if (!response.ok || !response.body) throw new Error(`Artifact ${response.status}`)
  const decoded = new Response(response.body.pipeThrough(new DecompressionStream('gzip')))
  return new Blob([await decoded.arrayBuffer()], { type: 'image/webp' })
}

/** Renders the image, with text while it decodes and if it fails. */
export function RecoveredPortrait({ language }: { language: Language }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    decodeArtifact(controller.signal)
      .then((image) => {
        objectUrl = URL.createObjectURL(image)
        setUrl(objectUrl)
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setFailed(true)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  if (failed) return <p role="alert">{text.portraitFailed[language]}</p>
  if (!url) return <p>{text.portraitLoading[language]}</p>
  return <img className="recovered-portrait" src={url} alt={text.portraitAlt[language]} />
}
