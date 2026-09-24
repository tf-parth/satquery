// SatQuery AI - Gemini Generative Intelligence Service
// Directly communicates with Google Generative Language API (Gemini 3.6 Flash)
// Server-side only.

const SATQUERY_SYSTEM_PROMPT = `You are SatQuery AI, an Earth Observation and Satellite Intelligence assistant.

You help users understand satellite imagery, geography, land use, vegetation, water bodies, urban development, environmental changes and satellite-based observations, especially for India.

Answer naturally and clearly.

Users may ask questions in English, Hindi or Hinglish. Respond in the same language as the user.

Do not pretend that you have analyzed satellite imagery when no imagery or analysis result was provided.

If the user asks a general knowledge question, answer normally.

If the user asks for satellite/image analysis but no image or analysis data is available, clearly tell the user that imagery is required.

Keep responses concise but useful.

You are part of the SatQuery application.`;

export async function askGemini({ 
  query, 
  conversation = [], 
  context = {}, 
  image = null,
  systemInstruction = null 
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "AI_NOT_CONFIGURED"
    };
  }

  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const candidateModels = [preferredModel, "gemini-3.5-flash-lite", "gemini-flash-latest"].filter(
    (v, i, a) => a.indexOf(v) === i
  );



  // Build multi-turn contents list for Gemini API
  const contents = [];

  // Add recent conversation history (capped at last 8 messages for token efficiency)
  if (Array.isArray(conversation) && conversation.length > 0) {
    const recent = conversation.slice(-8);
    for (const turn of recent) {
      const role = (turn.role === 'assistant' || turn.role === 'model') ? 'model' : 'user';
      const text = turn.content || turn.text;
      if (text && typeof text === 'string') {
        contents.push({
          role,
          parts: [{ text: text.trim() }]
        });
      }
    }
  }

  // Build current user message with context if provided
  let userText = query.trim();
  const contextNotes = [];
  if (context?.location) {
    contextNotes.push(`Selected Location: ${context.location}`);
  }
  if (image && (image.name || image.data)) {
    contextNotes.push(`Uploaded Image File: "${image.name || 'satellite_imagery'}". Imagery is attached to this request; directly analyze the visual features, land cover, weather/cyclone patterns, water bodies, or structures visible in this image to answer.`);
  }
  if (context?.advancedOptions) {
    const { dataset, dateRange, analysisMethod, resolution } = context.advancedOptions;
    const details = [];
    if (dataset && dataset !== 'auto') details.push(`Dataset: ${dataset}`);
    if (dateRange && dateRange !== 'current') details.push(`Date: ${dateRange}`);
    if (analysisMethod && analysisMethod !== 'auto') details.push(`Method: ${analysisMethod}`);
    if (resolution && resolution !== 'auto') details.push(`Resolution: ${resolution}`);
    if (details.length > 0) contextNotes.push(`User Filters: ${details.join(', ')}`);
  }
  if (context?.analysisResultsSummary) {
    contextNotes.push(`Remote Sensing Pipeline Results: ${context.analysisResultsSummary}`);
  }

  if (contextNotes.length > 0) {
    userText = `[Context: ${contextNotes.join(' | ')}]\n${userText}`;
  }

  const currentParts = [];
  if (image && image.data) {
    let mimeType = image.mimeType || 'image/jpeg';
    if (mimeType.includes('webp')) mimeType = 'image/webp';
    else if (mimeType.includes('png')) mimeType = 'image/png';
    else if (mimeType.includes('gif')) mimeType = 'image/gif';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) mimeType = 'image/jpeg';

    currentParts.push({
      inlineData: {
        mimeType,
        data: image.data
      }
    });
  }

  currentParts.push({ text: userText });

  contents.push({
    role: "user",
    parts: currentParts
  });

  const bodyPayload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction || SATQUERY_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 800
    }
  };

  let lastError = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(25000)
      });


      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Gemini model ${model} responded with status ${res.status}:`, errJson?.error?.message || errJson);
        // If 503 (high demand) or 429 (rate limit), failover to next model
        if (res.status === 503 || res.status === 429) {
          lastError = { error: "GEMINI_API_ERROR", status: res.status };
          continue;
        }
        return {
          success: false,
          error: "GEMINI_API_ERROR",
          status: res.status
        };
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const textParts = candidate?.content?.parts
        ?.map(p => p.text)
        ?.filter(Boolean)
        ?.join('');

      if (!textParts) {
        return {
          success: false,
          error: "EMPTY_RESPONSE"
        };
      }

      return {
        success: true,
        model,
        text: textParts.trim()
      };
    } catch (err) {
      console.warn(`Gemini request to ${model} failed: ${err.message}`);
      lastError = {
        error: err.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_ERROR'
      };
    }
  }

  return {
    success: false,
    ...lastError
  };
}
