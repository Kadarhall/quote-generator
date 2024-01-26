"use client"

import React, { useEffect, useState } from 'react'
import styles from './page.module.css'

//import type { Schema } from '@/amplify/data/resource'
import { Amplify } from '@/node_modules/aws-amplify/dist/esm/index';
import config from '../src/amplifyconfiguration.json';

Amplify.configure(config);

import { generateClient } from '@/node_modules/@aws-amplify/api/dist/esm/index';

// Components
import { BackgroundImage1, BackgroundImage2, FooterCon, FooterLink, GenerateQuoteButton, GenerateQuoteButtonText, GradientBackgroundCon, QuoteGeneratorCon, QuoteGeneratorInnerCon, QuoteGeneratorSubTitle, QuoteGeneratorTitle } from './components/QuoteGenerator/QuoteGeneratorElements'

// Assets
import Clouds1 from '../assets/cloud-and-thunder.png'
import Clouds2 from '../assets/cloudy-weather.png'
import { generateAQuote, quotesQueryName } from '@/src/graphql/queries';
import QuoteGeneratorModal from './components/QuoteGenerator/index';

// interface for our appsync <> lambda JSON response
interface GenerateAQuoteData {
  generateAQuote: {
    statusCode: number;
    headers: { [key: string]: string };
    body: string;
  }
}

// interface for our Dynamo DB object
interface UpdateQuoteInfoData {
  id: string;
  queryName: string;
  quotesGenerated: number;
  createdAt: string;
  updatedAt: string;
}



// type guard for our fetch function
function isGraphQLResultForquotesQueryName(response: any) {
  return response.data && response.data.quotesQueryName
}



export default function Home() {
  const [numberOfQuotes, setNumberOfQuotes] = useState<Number | null>(0);
  const [openGenerator, setOpenGenerator] = useState(false);
  const [processingQuote, setProcessingQuote] = useState(false);
  const [quoteReceived, setQuoteReceived] = useState<String | null>(null);

  // function to fetch our DynamoDB object (quotes generated)
  const updateQuoteInfo = async () => {
    try {
      const client = generateClient();

      const response = await client.graphql<UpdateQuoteInfoData>({
        query: quotesQueryName,
        authMode: "iam",
        variables: {
          queryName: "LIVE",
        }
      });

      //console.log('response', response);

      // Create type guards
      if (!isGraphQLResultForquotesQueryName(response)) {
        throw new Error('Unexpected response from API.graphql');
      }

      if (!response.data) {
        throw new Error('Response data is undefined');
      }

      const receivedNumberOfQuotes = response.data.quotesQueryName.items[0].quotesGenerated;
      setNumberOfQuotes(receivedNumberOfQuotes);

    } catch (error) {
      console.log('error getting quote data', error);
    }
  }

  useEffect(() => {
    updateQuoteInfo();
  }, []);

  const handleCloseGenerator = () => {
    setOpenGenerator(false);
    setProcessingQuote(false);
    setQuoteReceived(null);
  }

  const handleOpenGenerator = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setOpenGenerator(true);
    setProcessingQuote(true);
    try {
      const client = generateClient();
      // Run Lambda function
      const runFunction = "runFunction";
      const runFunctionStringified = JSON.stringify(runFunction);
      const response = await client.graphql<GenerateAQuoteData>({
        query: generateAQuote,
        authMode: "iam",
        variables: {
          input: runFunctionStringified
        }
      });
      const responseStringified = JSON.stringify(response);
      const responseReStringified = JSON.stringify(responseStringified);
      const bodyIndex = responseReStringified.indexOf("body=") + 5;
      const bodyAndBase64 = responseReStringified.substring(bodyIndex);
      const bodyArray = bodyAndBase64.split(",");
      const body = bodyArray[0];
      console.log(body);
      setQuoteReceived(body);

      // End state:
      setProcessingQuote(false);

      // Fetch if any new quotes were generated from counter
      updateQuoteInfo();

      // setTimeout(() => {
      //   setProcessingQuote(false);
      // }, 3000);
    } catch (error) {
      console.log('Error generating quote', error);
      setProcessingQuote(false);
    }
  }

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
        <QuoteGeneratorModal
          open={openGenerator}
          close={handleCloseGenerator}
          processingQuote={processingQuote}
          setProcessingQuote={setProcessingQuote}
          quoteReceived={quoteReceived}
          setQuoteReceived={setQuoteReceived}
        />

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

            <GenerateQuoteButton onClick={handleOpenGenerator}>
              <GenerateQuoteButtonText>
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
