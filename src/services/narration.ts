export function cleanNarrationText(text: string) {
  return text
    .replace(/\[\[pause:(short|medium|look)\]\]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}
type PauseType = 'short' | 'medium' | 'look'

const PAUSE_DURATIONS: Record<PauseType, number> = {
  short: 600,
  medium: 1300,
  look: 2800,
}

let narrationId = 0

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function cancelNarration() {
  narrationId++
  window.speechSynthesis.cancel()
}
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices()

  if (voices.length > 0) {
    return Promise.resolve(voices)
  }

  return new Promise((resolve) => {
    const handleVoicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices()

      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged
      )

      resolve(loadedVoices)
    }

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged
    )
  })
}
export async function speakNarration(
  text: string,
  language = 'es-ES'
) {
  if (!('speechSynthesis' in window)) {
    alert('Este dispositivo no permite reproducción de voz.')
    return
  }

  cancelNarration()

  const currentNarrationId = narrationId

  const voices = await getVoices()

console.log(
  'VOCES DISPONIBLES:',
  voices.map((voice) => ({
    name: voice.name,
    lang: voice.lang,
  }))
)  

const languagePrefix = language.split('-')[0]

const selectedVoice =
  voices.find((voice) => voice.lang === language) ||
  voices.find((voice) =>
    voice.lang.startsWith(languagePrefix)
  )

  const parts = text.split(
    /(\[\[pause:(?:short|medium|look)\]\])/gi
  )
  console.log('PARTES NARRACION:', parts)

  for (const part of parts) {
    if (currentNarrationId !== narrationId) return

    const pauseMatch = part.match(
      /^\[\[pause:(short|medium|look)\]\]$/i
    )

    if (pauseMatch) {
      const pauseType = pauseMatch[1].toLowerCase() as PauseType

      await wait(PAUSE_DURATIONS[pauseType])

      if (currentNarrationId !== narrationId) return

      continue
    }

    const spokenText = part.trim()

    if (!spokenText) continue

    await speakSegment(
  spokenText,
  currentNarrationId,
  selectedVoice,
  language
)
  }
}

function speakSegment(
  text: string,
  currentNarrationId: number,
  voice: SpeechSynthesisVoice | undefined,
  language: string
) {

  return new Promise<void>((resolve) => {
    if (currentNarrationId !== narrationId) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)

    if (voice) {
      utterance.voice = voice
    }

    utterance.lang = language
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    console.log(
      'VOZ SELECCIONADA:',
      voice?.name,
      voice?.lang
    )

    window.speechSynthesis.speak(utterance)
  })
}
