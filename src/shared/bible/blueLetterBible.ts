const BLUE_LETTER_BIBLE_BOOKS: Record<string, string> = {
  Genesis: 'gen',
  Exodus: 'exo',
  Leviticus: 'lev',
  Numbers: 'num',
  Deuteronomy: 'deu',
  Joshua: 'jos',
  Judges: 'jdg',
  Ruth: 'rut',
  'I Samuel': '1sa',
  'II Samuel': '2sa',
  'I Kings': '1ki',
  'II Kings': '2ki',
  'I Chronicles': '1ch',
  'II Chronicles': '2ch',
  Ezra: 'ezr',
  Nehemiah: 'neh',
  Esther: 'est',
  Job: 'job',
  Psalms: 'psa',
  Proverbs: 'pro',
  Ecclesiastes: 'ecc',
  'Song of Solomon': 'sng',
  Isaiah: 'isa',
  Jeremiah: 'jer',
  Lamentations: 'lam',
  Ezekiel: 'eze',
  Daniel: 'dan',
  Hosea: 'hos',
  Joel: 'joe',
  Amos: 'amo',
  Obadiah: 'oba',
  Jonah: 'jon',
  Micah: 'mic',
  Nahum: 'nah',
  Habakkuk: 'hab',
  Zephaniah: 'zep',
  Haggai: 'hag',
  Zechariah: 'zec',
  Malachi: 'mal'
}

export function blueLetterBibleUrl(
  book: string,
  chapter: number,
  verse: number
): string | null {
  const bookSlug = BLUE_LETTER_BIBLE_BOOKS[book]

  if (!bookSlug) {
    return null
  }

  return `https://www.blueletterbible.org/amp/${bookSlug}/${chapter}/${verse}`
}
