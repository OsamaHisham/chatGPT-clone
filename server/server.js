import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

// Importing OpenAI API and Configuration
import OpenAI from "openai";

// To use the dotenv environment
dotenv.config();

// Creating an instance of OpenAI 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

// Initialize our express application
const app = express();

// To allow us to make (Cross Origin Requests) and allows the server to be called from the frontend
app.use(cors());

// Allows us to pass jason from the frontend to the backend
app.use(express.json());

// Creating a dummy root route using an async Function
// Can't recive a lot of data from the frontend
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello From KidoCode intern Osama Hisham :)',
  })
});

// post request is used to get data from the body of the frontend request
app.post('/', async (req, res) => {
  // To handle any errors
  try {

    // Getting the prompt
    const prompt = req.body.prompt;
    
   // Create/Get a response (Fron OpenAI) 
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k", // The name of the Model we are using
      messages: [
        {
          role: 'system',
          content: 'Your name is Sam and you are a helpful assistant.'
        },
        {
          role: 'user',
          content:`${prompt}`
        }
      ],
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    // Sending the response back to the frontend side
    res.status(200).send({
      // bot: response.data.choices[0].text
      bot: response.choices[0].message
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({error})
  }
})

// Making sure that the server listens to the requests we make
app.listen(5000, () => console.log("AI Server is running on port http://localhost:5000"));
