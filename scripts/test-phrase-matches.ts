import { findPhraseMatches } from '../src/main/bible/findPhraseMatches'

const target = Number(process.argv[2] ?? 1273)

if (!Number.isFinite(target) || target <= 0) {
  console.error('Please provide a positive gematria value.')
  process.exit(1)
}

const matches = findPhraseMatches(target)

console.log()
console.log(`Gematria ${target}`)
console.log(`Phrase occurrences found: ${matches.length}`)
console.log()

for (const match of matches) {
  console.log(
    `${match.hebrew} = ${match.value}`
  )
  console.log(
    `  ${match.book} ${match.chapter}:${match.verse}` +
    ` | ${match.wordCount} words`
  )
  console.log()
}
