"use client"

import React, { useState } from 'react'
import styles from './page.module.css'

// Components
import { BackgroundImage1, BackgroundImage2, FooterCon, FooterLink, GenerateQuoteButton, GenerateQuoteButtonText, GradientBackgroundCon, QuoteGeneratorCon, QuoteGeneratorInnerCon, QuoteGeneratorSubTitle, QuoteGeneratorTitle } from './components/QuoteGenerator/QuoteGeneratorElements'

// Assets
import Clouds1 from '../assets/cloud-and-thunder.png'
import Clouds2 from '../assets/cloudy-weather.png'


export default function Home() {
  const [numberOfQuotes, setNumberOfQuotes] = useState<Number | null>(0);
  return (
    <>
      {/* <Head>
        <title>Inspirational Quote Generator</title>
        <meta name="description" content="A fun project to generate quotes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      {/* Background */}
      <GradientBackgroundCon>

        {/* Quote Generator Modal Popup */}
        {/* <QuoteGeneratorModal

        /> */}

        {/* Quote Generator */}
        <QuoteGeneratorCon style={styles}>
          <QuoteGeneratorInnerCon>
            <QuoteGeneratorTitle>
              Daily Inspiration Generator
            </QuoteGeneratorTitle>

            <QuoteGeneratorSubTitle>
              Looking for a splash of inspiration? Generate a quote card with a random inspirational
              quote provided by <FooterLink href="https://zenquotes.io" target="_blank"
              rel="noopener noreferrer">ZenQuotes API</FooterLink>
            </QuoteGeneratorSubTitle>

            <GenerateQuoteButton>
              <GenerateQuoteButtonText onClick={null}>
                Make a Quote
              </GenerateQuoteButtonText>
            </GenerateQuoteButton>
          </QuoteGeneratorInnerCon>
        </QuoteGeneratorCon>

        <BackgroundImage1
          src={Clouds1}
          height="300"
          alt="cloudybackground1"
        />

        <BackgroundImage2
          src={Clouds2}
          height="300"
          alt="cloudybackground2"
        />

        <FooterCon>
          <>
            Quotes generated: {numberOfQuotes}
            <br />
            Developed by <FooterLink href="http://kadarhall.com" target="_blank" rel="noopener noreferrer">Kadar Hall</FooterLink>
          </>
        </FooterCon>

      </GradientBackgroundCon>
    </>
    
  )
}
