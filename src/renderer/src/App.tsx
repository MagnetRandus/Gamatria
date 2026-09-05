import {
  Button,
  Field,
  Input,
  Title1,
  Text,
  makeStyles,
  tokens
} from '@fluentui/react-components'

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
  }
})

export default function App() {
  const styles = useStyles()

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
          label="Name or phrase"
        >
          <Input defaultValue="Magnus" />
        </Field>

        <Button appearance="primary">
          Analyze
        </Button>
      </div>

      <div className={styles.result}>
        <Text>Analysis results will appear here.</Text>
      </div>
    </div>
  )
}
