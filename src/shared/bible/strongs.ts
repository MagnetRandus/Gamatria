export function extractStrongs(lemma?: string): string[] {
  if (!lemma) {
    return []
  }

  const matches = lemma.match(/H\d+[A-Za-z]?/g) ?? []
  return Array.from(new Set(matches.map((value) => value.toUpperCase())))
}

export function blueLetterBibleStrongsUrl(strongs: string): string | null {
  const normalized = strongs.trim().toUpperCase()

  if (!/^H\d+[A-Z]?$/.test(normalized)) {
    return null
  }

  return `https://www.blueletterbible.org/lexicon/${normalized.toLowerCase()}/kjv/wlc/0-1/`
}
