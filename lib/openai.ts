import OpenAI from "openai";

const openAiApiKey = process.env.OPENAI_API_KEY;

export const openai = openAiApiKey
  ? new OpenAI({
      apiKey: openAiApiKey,
    })
  : null;
