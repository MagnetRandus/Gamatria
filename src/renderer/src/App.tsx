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

import { blueLetterBibleUrl } from '../../shared/bible/blueLetterBible'
import {
  blueLetterBibleStrongsUrl,
  extractStrongs
} from '../../shared/bible/strongs'
import type {
  BiblePhraseToken,
  BibleSearchResult
} from '../../shared/bible/types'
import { calculateGematria } from '../../shared/gematria/calculateGematria'
import {
  generateHebrewCandidates,
  type PhoneticCandidate
} from '../../shared/phonetic/generateHebrewCandidates'

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
  biblePanel: {
    marginTop: '24px'
  },
  searchedCandidate: {
    direction: 'rtl',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px'
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
  matchIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
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
    marginTop: '10px',
    overflowWrap: 'anywhere'
  },
  referenceLink: {
    border: 'none',
    backgroundColor: 'transparent',
    color: tokens.colorBrandForegroundLink,
    cursor: 'pointer',
    font: 'inherit',
    padding: 0,
    textDecorationLine: 'underline'
  },
  strongsLink: {
    border: `1px solid ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForegroundLink,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '13px',
    fontWeight: '600',
    padding: '2px 6px'
  },
  tokenList: {
    display: 'grid',
    gap: '6px',
    marginTop: '10px',
    marginBottom: '10px'
  },
  tokenRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  tokenHebrew: {
    direction: 'rtl',
    fontSize: '20px',
    fontWeight: '600',
    minWidth: '90px'
  },
  noStrongs: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px'
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

interface VerseReference {
  book: string
  chapter: number
  verse: number
}

interface WordGroup {
  hebrew: string
  source: string
  lemma?: string
  morphology?: string
  strongs: string[]
  references: VerseReference[]
}

interface PhraseGroup {
  hebrew: string
  source: string
  wordCount: number
  tokens: BiblePhraseToken[]
  references: VerseReference[]
}

export default function App() {
  const styles = useStyles()

  const [englishName, setEnglishName] = useState('Magnus')
  const [candidates, setCandidates] = useState<PhoneticCandidate[]>(() =>
    generateHebrewCandidates('Magnus')
  )
  const [bibleResult, setBibleResult] = useState<BibleSearchResult | null>(null)
  const [searchedHebrew, setSearchedHebrew] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordGroups = useMemo<WordGroup[]>(() => {
    if (!bibleResult) {
      return []
    }

    const groups = new Map<string, WordGroup>()

    for (const match of bibleResult.wordMatches) {
      const key = `${match.hebrew}|${match.lemma ?? ''}|${match.morphology ?? ''}`
      const reference = {
        book: match.book,
        chapter: match.chapter,
        verse: match.verse
      }
      const existing = groups.get(key)

      if (existing) {
        existing.references.push(reference)
      } else {
        groups.set(key, {
          hebrew: match.hebrew,
          source: match.source,
          lemma: match.lemma,
          morphology: match.morphology,
          strongs: extractStrongs(match.lemma),
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
      const lexicalKey = match.tokens
        .map((token) => `${token.hebrew}:${token.lemma ?? ''}`)
        .join('|')
      const key = `${match.hebrew}|${match.wordCount}|${lexicalKey}`
      const reference = {
        book: match.book,
        chapter: match.chapter,
        verse: match.verse
      }
      const existing = groups.get(key)

      if (existing) {
        existing.references.push(reference)
      } else {
        groups.set(key, {
          hebrew: match.hebrew,
          source: match.source,
          wordCount: match.wordCount,
          tokens: match.tokens,
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
    setSearchedHebrew(null)
    setError(null)
  }

  function createCandidates(): void {
    setCandidates(generateHebrewCandidates(englishName))
    clearSearchResults()
  }

  async function searchHebrew(hebrew: string): Promise<void> {
    const calculated = calculateGematria(hebrew)
    setBibleResult(null)
    setSearchedHebrew(hebrew)
    setError(null)

    if (calculated.total <= 0) {
      setError('No Hebrew gematria value could be calculated for this candidate.')
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

  async function openReference(reference: VerseReference): Promise<void> {
    const url = blueLetterBibleUrl(
      reference.book,
      reference.chapter,
      reference.verse
    )

    if (!url) {
      setError(`No Blue Letter Bible link is configured for ${reference.book}.`)
      return
    }

    try {
      await window.gamatria.openExternal(url)
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : 'The scripture link could not be opened.'
      )
    }
  }

  async function openStrongs(strongs: string): Promise<void> {
    const url = blueLetterBibleStrongsUrl(strongs)

    if (!url) {
      setError(`No Strong's link could be generated for ${strongs}.`)
      return
    }

    try {
      await window.gamatria.openExternal(url)
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : `Strong's ${strongs} could not be opened.`
      )
    }
  }

  function renderReferences(references: VerseReference[]) {
    return references.map((reference, index) => (
      <span key={`${reference.book}-${reference.chapter}-${reference.verse}-${index}`}>
        {index > 0 && ', '}
        <button
          type="button"
          className={styles.referenceLink}
          onClick={() => void openReference(reference)}
          title="Open in Blue Letter Bible"
        >
          {reference.book} {reference.chapter}:{reference.verse} ↗
        </button>
      </span>
    ))
  }

  function renderStrongsButton(
    strongs: string,
    preventSummaryToggle = false
  ) {
    return (
      <button
        type="button"
        className={styles.strongsLink}
        key={strongs}
        onClick={(event) => {
          if (preventSummaryToggle) {
            event.preventDefault()
            event.stopPropagation()
          }
          void openStrongs(strongs)
        }}
        title={`Open Strong's ${strongs} in Blue Letter Bible`}
      >
        Strong's {strongs} ↗
      </button>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title1>Gamatria</Title1>
        <br />
        <Text>Hebrew gematria and phonetic analysis</Text>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>English / Name</h2>
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

                <Button
                  appearance="primary"
                  disabled={searching}
                  onClick={() => void searchHebrew(candidate.hebrew)}
                >
                  Search Bible
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {searching && (
        <div className={styles.loading}>
          <Spinner label="Searching the Hebrew Bible..." />
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

          {searchedHebrew && (
            <div className={styles.searchedCandidate}>{searchedHebrew}</div>
          )}

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
                    <span className={styles.matchIdentity}>
                      <span className={styles.matchHebrew}>{group.hebrew}</span>
                      {group.strongs.map((strongs) =>
                        renderStrongsButton(strongs, true)
                      )}
                    </span>
                    <span>{group.references.length} occurrence{group.references.length === 1 ? '' : 's'}</span>
                  </summary>

                  <div className={styles.matchDetails}>
                    {group.source !== group.hebrew && (
                      <div>OSHB form: {group.source}</div>
                    )}
                    {group.lemma && <div>OSHB lemma: {group.lemma}</div>}
                    {group.morphology && <div>Morphology: {group.morphology}</div>}
                    <div className={styles.references}>
                      References: {renderReferences(group.references)}
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
                  key={`${group.hebrew}-${group.wordCount}-${group.tokens.map((token) => token.lemma ?? '').join('-')}`}
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

                    <div className={styles.tokenList}>
                      {group.tokens.map((token, index) => {
                        const strongsNumbers = extractStrongs(token.lemma)

                        return (
                          <div
                            className={styles.tokenRow}
                            key={`${token.hebrew}-${token.lemma ?? ''}-${index}`}
                          >
                            <span className={styles.tokenHebrew}>{token.hebrew}</span>
                            {strongsNumbers.length > 0 ? (
                              strongsNumbers.map((strongs) =>
                                renderStrongsButton(strongs)
                              )
                            ) : (
                              <span className={styles.noStrongs}>
                                No Strong's reference
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className={styles.references}>
                      References: {renderReferences(group.references)}
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
