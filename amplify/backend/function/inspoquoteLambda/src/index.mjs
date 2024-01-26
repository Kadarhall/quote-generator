/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 const GRAPHQL_ID = process.env.API_QUOTEGENERATOR_GRAPHQLAPIIDOUTPUT;
 const QOUTAPPDATATABLE_ARN = process.env.API_QUOTEGENERATOR_QOUTAPPDATATABLE_ARN;
 const QOUTAPPDATATABLE_NAME = process.env.API_QUOTEGENERATOR_QOUTAPPDATATABLE_NAME;

// AWS packages
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Image generation packages
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Function: update DynamoDB table
async function updateDynamoDBObject() {
    const quoteTableName = QOUTAPPDATATABLE_NAME;
    const quoteObjectId = "23338-232323-2332323-323445";

    try {
        var quoteParams = JSON.stringify({
            TableName: quoteTableName,
            Key: {
                "id": quoteObjectId
            },
            UpdateExpression: "SET #quotesGenerated = #quotesGenerated + :inc",
            ExpressionAttributeValues: {
                ":inc": 1,
            },
            ExpressionAttributeNames: {
                "#quotesGenerated": "quotesGenerated",
            },
            ReturnValues: "UPDATED_NEW",
        });

        const updateQuoteObject = await docClient.send(new UpdateCommand(quoteParams)).promise();
        console.log(updateQuoteObject);
        return updateQuoteObject;
    } catch (error) {
        console.log('Error updating quote logic in DynamoDB', error);
    }
}

export const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const apiUrl = "https://zenquotes.io/api/random";

    // Function: Generate quote image

    const getRandomQuote = async (apiUrlInput) => {
        // My quote is...
        let quoteText;
        // Author name here...
        let quoteAuthor;
      
        // Validate response to the api
        const response = await fetch(apiUrlInput);
        let quoteData = await response.json();
        console.log(quoteData);
      
        // quote elements
        quoteText = quoteData[0].q;
        quoteAuthor = quoteData[0].a;
        console.log(quoteText + "\n" + quoteAuthor);
      
        // Image construction
        const width = 750;
        const height = 500;
        const text = quoteText;
        const words = text.split(" ");
        const lineBreak = 4;
        let newLine = "";
      
        // Define some tspanElements w/ 4 words each
        let tspanElements = "";
        for (let i = 0; i < words.length; i++) {
          newLine += words[i] + " ";
          if ((i + 1) % lineBreak === 0) {
            tspanElements += `<tspan x="${width / 2}" dy="1.2em">${newLine}</tspan>`;
            newLine = "";
          }
        }
        if (newLine !== "") {
          tspanElements += `<tspan x="${width / 2}" dy="1.2em">${newLine}</tspan>`;
        }
        console.log(tspanElements);
      
        //construct SVG image
        const svgImage = `
              <svg width="${width}" height="${height}">
                  <style>
                      .title {
                          fill: #fff,
                          font-size: 20px;
                          font-weight: bold;
                      }
                      .quoteAuthorStyles {
                          font-size: 35px;
                          font-weight: bold;
                          padding: 50px;
                      }
                      .footerStyles {
                          font-size: 20px;
                          font-weight: bold;
                          fill: lightgrey;
                          text-anchor: middle;
                          font-family: Verdana;
                      }
                  </style>
                  <circle cx="382" cy="76" r="44" fill="rgba(255, 255, 255, 0.155)" />
                  <text x="382" y="76" dy="50" text-anchor="middle" font-size="90" font-family="Verdana" fill="white">"</text>
                  <g>
                      <rect x="0" y="0" width="${width}" height="auto"></rect>
                      <text id="lastLineOfQuote" x="375" y="120" font-family="Verdana" font-size="35" fill="white" text-anchor="middle">
                          ${tspanElements}
                      <tspan class="quoteAuthorStyles" x="375" dy="1.8em">- ${quoteAuthor}</tspan>
                      </text>
                  </g>
                  <text x="${width / 2}" y="${
                    height - 20
                  }" class="footerStyles"> Developed by @KadarHall | Quotes from ZenQuotes.io</text>
              </svg>
          `;
      
        // Add background images for the SVG creation
        const backgroundImages = [
          "backgrounds/CompareNow750.jpg",
          "backgrounds/CrystalClear750.jpg",
          "backgrounds/Mello750.jpg",
          "backgrounds/Sunkist750.jpg",
        ];
      
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        const selectedBackgroundImage = backgroundImages[randomIndex];
      
        // Composite this image together
        const timestamp = new Date().toLocaleString().replace(/[^\d]/g, "");
        const svgBuffer = Buffer.from(svgImage);

        const imagePath = path.join('/tmp', 'quote-card.png');

        const image = await sharp(selectedBackgroundImage)
          .composite([
            {
              input: svgBuffer,
              top: 0,
              left: 0,
            },
          ])
          .toFile(imagePath);

        // Function: update DynamoDB object in table
        try {
            updateDynamoDBObject();
        } catch (error) {
            console.log('error updating quote object in DynamoDB', error);
        }

        return {
            statusCode: 200,
            //  Uncomment below to enable CORS requests
            headers: {
                "Content-Type": "image/png",
                "Access-Control-Allow-Origin": "*",
            },
            body: fs.readFileSync(imagePath).toString('base64'),
            isBase64Encoded: true,
        }
    };
    
    return await getRandomQuote(apiUrl);  
};
