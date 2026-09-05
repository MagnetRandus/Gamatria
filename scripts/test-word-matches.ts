import { findWordMatches } from '../src/main/bible/findWordMatches'

const target = Number(process.argv[2] ?? 159)

if (!Number.isFinite(target)) {
  console.error('Please provide a numeric gematria value.')
  process.exit(1)
}

const matches = findWordMatches(target)

console.log()
console.log(`Gematria ${target}`)
console.log(`Word occurrences found: ${matches.length}`)
console.log()

const grouped = new Map<
  string,
  {
    count: number
    lemma?: string
    references: string[]
  }
>()

for (const match of matches) {
  const existing = grouped.get(match.hebrew)

  const reference =
    `${match.book} ${match.chapter}:${match.verse}`

  if (existing) {
    existing.count++
    existing.references.push(reference)
  } else {
    grouped.set(match.hebrew, {
      count: 1,
      lemma: match.lemma,
      references: [reference]
    })
  }
}

for (const [hebrew, info] of grouped) {
  console.log(
    `${hebrew}  | occurrences: ${info.count}` +
    `${info.lemma ? ` | lemma: ${info.lemma}` : ''}`
  )

  console.log(`  ${info.references.join(', ')}`)
}

console.log()
console.log(`Unique Hebrew forms: ${grouped.size}`)
