import { useMemo, useState } from 'react'
import {
  Button,
  Field,
  Input,
  Spinner,
  Text,
  Title1,
  makeStyles,
  tokens
} from '@fluentui/react-components'

import { calculateGematria } from '../../shared/gematria/calculateGematria'
import {
  generateHebrewCandidates,
  type PhoneticCandidate
} from '../../shared/phonetic/generateHebrewCandidates'
import type { BibleSearchResult } from '../../shared/bible/types'

const useStyles = makeStyles({
  root: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px'
  },
  header: {
    marginBottom: '32px'
  },
  panel: {
    padding: '20px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    marginBottom: '24px'
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: '6px'
  },
  helpText: {
    display: 'block',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    gap: '12px',
    alignItems: 'end',
    flexWrap: 'wrap'
  },
  field: {
    flexGrow: 1,
    minWidth: '300px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  candidateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '10px',
    marginTop: '18px'
  },
  candidateCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '14px'
  },
  candidateHebrew: {
    direction: 'rtl',
    fontSize: '28px',
    fontWeight: '600',
    margin: '6px 0'
  },
  candidateValue: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  candidateActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  result: {
    marginTop: '20px',
    padding: '24px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2
  },
  hebrew: {
    fontSize: '32px',
    direction: 'rtl'
  },
  total: {
    fontSize: '28px',
    fontWeight: 'bold'
  },
  breakdown: {
    marginTop: '16px',
    fontSize: '18px'
  },
  biblePanel: {
    marginTop: '24px'
  },
  summary: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  section: {
    marginTop: '28px'
  },
  matchList: {
    display: 'grid',
    gap: '8px'
  },
  matchCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '10px 12px'
  },
  matchSummary: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  matchHebrew: {
    direction: 'rtl',
    fontSize: '22px',
    fontWeight: '600'
  },
  matchDetails: {
    marginTop: '10px',
    lineHeight: '1.5'
  },
  references: {
    marginTop: '6px',
    overflowWrap: 'anywhere'
  },
  error: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1
  },
  loading: {
    marginTop: '24px'
  }
})

interface WordGroup {
  hebrew: string
  source: string
  lemma?: string
  morphology?: string
  references: string[]
}

interface PhraseGroup {
  hebrew: string
  source: string
  wordCount: number
  references: string[]
}

export default function App() {
  const styles = useStyles()

  const [englishName, setEnglishName] = useState('Magnus')
  const [candidates, setCandidates] = useState<PhoneticCandidate[]>(() =>
    generateHebrewCandidates('Magnus')
  )
  const [text, setText] = useState('מגנוס')
  const [result, setResult] = useState(() =>
    calculateGematria('מגנוס')
  )
  const [bibleResult, setBibleResult] = useState<BibleSearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordGroups = useMemo<WordGroup[]>(() => {
    if (!bibleResult) {
      return []
    }

    const groups = new Map<string, WordGroup>()

    for (const match of bibleResult.wordMatches) {
      const key = `${match.hebrew}|${match.lemma ?? ''}|${match.morphology ?? ''}`
      const reference = `${match.book} ${match.chapter}:${match.verse}`
      const existing = groups.get(key)

      if (existing) {
        existing.references.push(reference)
      } else {
        groups.set(key, {
          hebrew: match.hebrew,
          source: match.source,
          lemma: match.lemma,
          morphology: match.morphology,
          references: [reference]
        })
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) =>
        b.references.length - a.references.length ||
        a.hebrew.localeCompare(b.hebrew, 'he')
    )
  }, [bibleResult])

  const phraseGroups = useMemo<PhraseGroup[]>(() => {
    if (!bibleResult) {
      return []
    }

    const groups = new Map<string, PhraseGroup>()

    for (const match of bibleResult.phraseMatches) {
      const key = `${match.hebrew}|${match.wordCount}`
      const reference = `${match.book} ${match.chapter}:${match.verse}`
      const existing = groups.get(key)

      if (existing) {
        existing.references.push(reference)
      } else {
        groups.set(key, {
          hebrew: match.hebrew,
          source: match.source,
          wordCount: match.wordCount,
          references: [reference]
        })
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) =>
        b.references.length - a.references.length ||
        a.hebrew.localeCompare(b.hebrew, 'he')
    )
  }, [bibleResult])

  function clearSearchResults(): void {
    setBibleResult(null)
    setError(null)
  }

  function createCandidates(): void {
    setCandidates(generateHebrewCandidates(englishName))
    clearSearchResults()
  }

  function selectCandidate(candidate: PhoneticCandidate): void {
    setText(candidate.hebrew)
    setResult(calculateGematria(candidate.hebrew))
    clearSearchResults()
  }

  function calculate(): void {
    setResult(calculateGematria(text))
    clearSearchResults()
  }

  async function searchHebrew(hebrew: string): Promise<void> {
    const calculated = calculateGematria(hebrew)
    setText(hebrew)
    setResult(calculated)
    setBibleResult(null)
    setError(null)

    if (calculated.total <= 0) {
      setError('Enter Hebrew letters before searching the Bible corpus.')
      return
    }

    setSearching(true)

    try {
      const matches = await window.gamatria.searchBible(calculated.total)
      setBibleResult(matches)
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'The Bible search failed.'
      )
    } finally {
      setSearching(false)
    }
  }

  async function searchBible(): Promise<void> {
    await searchHebrew(text)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title1>Gamatria</Title1>
        <br />
        <Text>Hebrew gematria and phonetic analysis</Text>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>1. English / Name</h2>
        <Text className={styles.helpText}>
          Generate plausible Hebrew spellings from the sound of an English name. These are phonetic candidates, not a claim that one spelling is uniquely correct.
        </Text>

        <div className={styles.form}>
          <Field className={styles.field} label="English name or word">
            <Input
              value={englishName}
              onChange={(_, data) => setEnglishName(data.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  createCandidates()
                }
              }}
            />
          </Field>

          <Button appearance="primary" onClick={createCandidates}>
            Generate Hebrew
          </Button>
        </div>

        {candidates.length > 0 && (
          <div className={styles.candidateGrid}>
            {candidates.map((candidate) => (
              <div className={styles.candidateCard} key={candidate.hebrew}>
                <Text>{candidate.label}</Text>
                <div className={styles.candidateHebrew}>{candidate.hebrew}</div>
                <div className={styles.candidateValue}>= {candidate.value}</div>

                <div className={styles.candidateActions}>
                  <Button onClick={() => selectCandidate(candidate)}>
                    Use Hebrew
                  </Button>
                  <Button
                    appearance="primary"
                    disabled={searching}
                    onClick={() => void searchHebrew(candidate.hebrew)}
                  >
                    Search Bible
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>2. Hebrew</h2>
        <Text className={styles.helpText}>
          Select a phonetic candidate above or enter/edit Hebrew directly.
        </Text>

        <div className={styles.form}>
          <Field className={styles.field} label="Hebrew">
            <Input
              value={text}
              dir="rtl"
              onChange={(_, data) => setText(data.value)}
            />
          </Field>

          <div className={styles.actions}>
            <Button onClick={calculate}>
              Calculate
            </Button>
            <Button
              appearance="primary"
              disabled={searching}
              onClick={() => void searchBible()}
            >
              Search Bible
            </Button>
          </div>
        </div>

        <div className={styles.result}>
          <div className={styles.hebrew}>
            {result.original}
          </div>

          <div className={styles.breakdown}>
            {result.letters.map((item, index) => (
              <span key={`${item.letter}-${index}`}>
                {item.letter} = {item.value}
                {index < result.letters.length - 1 ? '  +  ' : ''}
              </span>
            ))}
          </div>

          <div className={styles.total}>
            = {result.total}
          </div>
        </div>
      </section>

      {searching && (
        <div className={styles.loading}>
          <Spinner label={`Searching the Hebrew Bible for ${result.total}...`} />
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {bibleResult && (
        <div className={styles.biblePanel}>
          <h2>Bible matches for {bibleResult.target}</h2>

          <div className={styles.summary}>
            <Text>
              {bibleResult.wordMatches.length} word occurrences / {wordGroups.length} unique forms
            </Text>
            <Text>
              {bibleResult.phraseMatches.length} phrase occurrences / {phraseGroups.length} unique phrases
            </Text>
          </div>

          <section className={styles.section}>
            <h3>Word matches</h3>
            <div className={styles.matchList}>
              {wordGroups.length === 0 && <Text>No word matches.</Text>}

              {wordGroups.map((group) => (
                <details
                  className={styles.matchCard}
                  key={`${group.hebrew}-${group.lemma ?? ''}-${group.morphology ?? ''}`}
                >
                  <summary className={styles.matchSummary}>
                    <span className={styles.matchHebrew}>{group.hebrew}</span>
                    <span>{group.references.length} occurrence{group.references.length === 1 ? '' : 's'}</span>
                  </summary>

                  <div className={styles.matchDetails}>
                    {group.source !== group.hebrew && (
                      <div>OSHB form: {group.source}</div>
                    )}
                    {group.lemma && <div>Lemma: {group.lemma}</div>}
                    {group.morphology && <div>Morphology: {group.morphology}</div>}
                    <div className={styles.references}>
                      References: {group.references.join(', ')}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3>Phrase matches</h3>
            <div className={styles.matchList}>
              {phraseGroups.length === 0 && <Text>No phrase matches.</Text>}

              {phraseGroups.map((group) => (
                <details
                  className={styles.matchCard}
                  key={`${group.hebrew}-${group.wordCount}`}
                >
                  <summary className={styles.matchSummary}>
                    <span className={styles.matchHebrew}>{group.hebrew}</span>
                    <span>
                      {group.wordCount} words · {group.references.length} occurrence{group.references.length === 1 ? '' : 's'}
                    </span>
                  </summary>

                  <div className={styles.matchDetails}>
                    {group.source !== group.hebrew && (
                      <div>OSHB form: {group.source}</div>
                    )}
                    <div className={styles.references}>
                      References: {group.references.join(', ')}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
