import '../styles/globals.css'
import Head from 'next/head'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SavingProvider } from '../contexts/SavingContext'
import { useEffect } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import GlobalSavingIndicator from '../components/GlobalSavingIndicator'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(function(error) {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>CloneMe - AI Email Generator</title>
        <meta name="description" content="Generate professional emails with personalized tones using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CloneMe" />
      </Head>
      <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
        <SavingProvider>
          <ThemeProvider>
            <GlobalSavingIndicator />
            <Component {...pageProps} />
          </ThemeProvider>
        </SavingProvider>
      </ErrorBoundary>
    </>
  )
}

export default MyApp