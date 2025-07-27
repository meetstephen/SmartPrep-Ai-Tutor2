// This file should be placed in a folder named "functions" inside a "netlify" folder.
// The final path should be: /netlify/functions/gemini-proxy.js

// This is an asynchronous function that handles requests.
exports.handler = async function (event, context) {
  // We only accept POST requests for this function.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Securely get the API key from Netlify's environment variables.
  // You will set this in your Netlify site's settings.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: 'API key is not configured.' };
  }

  // The actual URL for the Gemini API.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    // The front-end will send the payload (prompt, schema, etc.) in the request body.
    const requestBody = JSON.parse(event.body);

    // Make the actual call to the Gemini API from our secure serverless function.
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      // If the API returns an error, pass it back to the front-end.
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      return { statusCode: geminiResponse.status, body: errorText };
    }

    // Get the JSON data from the Gemini API response.
    const data = await geminiResponse.json();

    // Send the successful response back to our front-end application.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allows your front-end to call this function.
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};
