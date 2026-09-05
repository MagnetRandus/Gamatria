import { useState } from 'react'
import {
  Button,
  Field,
  Input,
  Title1,
  Text,
  makeStyles,
  tokens
} from '@fluentui/react-components'

import { calculateGematria } from '../../shared/gematria/calculateGematria'

const useStyles = makeStyles({
  root: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px'
  },
  header: {
    marginBottom: '32px'
  },
  form: {
    display: 'flex',
    gap: '12px',
    alignItems: 'end'
  },
  field: {
    flexGrow: 1
  },
  result: {
    marginTop: '32px',
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
  }
})

export default function App() {
  const styles = useStyles()

  const [text, setText] = useState('מגנוס')
  const [result, setResult] = useState(() =>
    calculateGematria('מגנוס')
  )

  function analyze() {
    setResult(calculateGematria(text))
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Title1>Gamatria</Title1>
        <br />
        <Text>Hebrew gematria and phonetic analysis</Text>
      </div>

      <div className={styles.form}>
        <Field
          className={styles.field}
          label="Hebrew"
        >
          <Input
            value={text}
            dir="rtl"
            onChange={(_, data) => setText(data.value)}
          />
        </Field>

        <Button
          appearance="primary"
          onClick={analyze}
        >
          Calculate
        </Button>
      </div>

      <div className={styles.result}>
        <div className={styles.hebrew}>
          {result.original}
        </div>

        <div className={styles.breakdown}>
          {result.letters.map((item, index) => (
            <span key={index}>
              {item.letter} = {item.value}
              {index < result.letters.length - 1 ? '  +  ' : ''}
            </span>
          ))}
        </div>

        <div className={styles.total}>
          = {result.total}
        </div>
      </div>
    </div>
  )
}