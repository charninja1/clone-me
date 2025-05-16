import '../styles/globals.css'
import Head from 'next/head'
import { ThemeProvider } from '../contexts/ThemeContext'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CloneMe - AI Email Generator</title>
        <meta name="description" content="Generate professional emails with personalized tones using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp