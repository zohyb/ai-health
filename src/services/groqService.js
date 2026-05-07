import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // For client side only (Educational project)
});

const SYSTEM_PROMPT = "You are a specialized medical diagnostic AI. You must ONLY output valid JSON.";

const JSON_SCHEMA = `Output your response STRICTLY in JSON format matching the following structure exactly (no extra markdown around the json):
{
  "topPredictions": [
    {"disease": "Name of Disease 1", "confidence": 85},
    {"disease": "Name of Disease 2", "confidence": 60}
  ],
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk" | "Emergency",
  "reasoning": "Brief medical reasoning considering the current symptoms, uploaded image (if any), and past history context if relevant.",
  "recommendation": "Actionable recommendation like 'Rest and hydrate' or 'Consult a doctor immediately'."
}`;

const buildHistoryContext = (userHistory) => {
  if (!userHistory || userHistory.length === 0) return 'No significant past history.';
  const summary = userHistory.slice(0, 10).map(h => ({
    date: h.timestamp,
    symptoms: h.symptoms,
    topPrediction: h.predictions?.[0]?.disease || 'N/A'
  }));
  return `User's past diagnoses history: ${JSON.stringify(summary)}.`;
};

const parseAIResponse = (responseContent) => {
  const jsonString = responseContent.replace(/```json/gi, '').replace(/```/gi, '').trim();
  return JSON.parse(jsonString);
};

/**
 * Analyze symptoms (text only) with user history context.
 */
export const analyzeSymptomsWithHistory = async (currentSymptoms, userHistory) => {
  try {
    const historyContext = buildHistoryContext(userHistory);

    const prompt = `
      You are an expert medical AI diagnostician. 
      Analyze the following current symptoms and provide a preliminary assessment.
      
      ${historyContext}
      
      Current Symptoms: "${currentSymptoms}"
      
      ${JSON_SCHEMA}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
    });

    return parseAIResponse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error("Failed to analyze symptoms");
  }
};

/**
 * Analyze symptoms WITH an uploaded medical image using Groq vision model.
 */
export const analyzeSymptomsWithImage = async (currentSymptoms, imageBase64, userHistory) => {
  try {
    const historyContext = buildHistoryContext(userHistory);

    const textPrompt = `
      You are an expert medical AI diagnostician.
      Analyze the following current symptoms AND the uploaded medical image together.
      Provide a combined preliminary assessment considering both inputs.

      ${historyContext}

      Current Symptoms: "${currentSymptoms || 'No text symptoms provided. Analyze the image only.'}"

      ${JSON_SCHEMA}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: textPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      max_tokens: 1024,
    });

    return parseAIResponse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error calling Groq Vision API:", error);
    throw new Error("Failed to analyze image");
  }
};
