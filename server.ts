import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Create the express app
const app = express();
const PORT = 3000;

// Enable JSON body parsing with reasonable size limits for SVG vectors
app.use(express.json({ limit: '10mb' }));

// Lazy initialiser for Gemini API clients
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in your environment variable settings. Make sure to supply it via the Settings > Secrets configuration.'
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to perform exponential backoff retries on transient errors (e.g. 503, 429)
async function callGeminiWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3, initialDelayMs = 1500) {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      const isTransient = 
        errorMessage.includes('503') || 
        errorMessage.includes('SERVICE_UNAVAILABLE') || 
        errorMessage.includes('502') ||
        errorMessage.includes('429') ||
        errorMessage.includes('ResourceExhausted') || 
        errorMessage.includes('high demand') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('try again later');

      if (attempt <= maxRetries && isTransient) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[Gemini API] Request failed with transient error: "${errorMessage}". Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// REST Endpoint to generate brand kits and company logos
app.post('/api/generate-logo', async (req, res) => {
  try {
    const { companyName, tagline, description, style, paletteColors } = req.body;

    if (!companyName) {
      res.status(400).json({ error: 'Company Name is required.' });
      return;
    }

    const ai = getGeminiClient();

    const colorsString = paletteColors && paletteColors.length > 0 
      ? `Colors schema: ${paletteColors.join(', ')}` 
      : 'Generate and use a premium cohesive palette matching the description.';

    const systemPrompt = `You are a master brand identity vector designer & professional geometric illustrator.
Your task is to model a bespoke logo in valid standalone inline SVG format based on the business name, tagline, description, and aesthetic style, then return it structured as clean JSON.

Follow these strict constraints:
1. ONLY return the structured JSON containing:
   - "companyName": The provided name.
   - "tagline": The provided tagline.
   - "concept": Explanation of the geometric vectors, choice of symbols, metaphors, colors, and styling reasons.
   - "hexColors": Array of 3-5 hex code colors actually implemented in the SVG logo elements.
   - "logoSvg": Clean, valid SVG markup string matching the constraints.
   - "recommendedAnimation": Must be one of: 'draw-in', 'float-glow', 'assemble-stagger', 'modern-reveal', 'rotator-pulse'.

2. Strict SVG Requirements for Animation:
   - The SVG must be standalone: viewBox="0 0 500 500", transparent background (no base fill on svg, keep it clean for dark/light container card backgrounds).
   - Separate major segments into groups with clear descriptive IDs:
     - <g id="group-emblem"> for the primary vector mark, symbol, or crest.
       Inside, group specific segments, e.g., <path id="emblem-base" ...>, <path id="emblem-accent" ...>, etc.
     - <g id="group-text"> for text assets.
       Contains:
       - <text id="text-company" x="250" y="410" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="bold" font-size="32" text-anchor="middle" fill="...">...</text>
       - (optional) <text id="text-tagline" x="250" y="445" font-family="'Inter', system-ui, sans-serif" font-weight="500" font-size="14" letter-spacing="4" text-anchor="middle" fill="...">...</text>
   - Aesthetics: Do not draw primitive basic triangles/ellipses. Construct sophisticated intersecting arcs, geometric grids, flowing organic curves, or clean neon circuits.
   - Use premium gradient maps inside a <defs> block if it benefits the visual depth, and reference them.
   - Set stroke-linecap="round" and stroke-linejoin="round" on outlines. If doing line art or line paths, use standard stroke-width="4" up to "8" to facilitate smooth drawing effects.
   - Make sure all vector labels/paths align perfectly and are visually centered within the 500x500 box.`;

    const userPrompt = `
Generate a professional logo for the following brand:
Company Name: "${companyName}"
Tagline (optional): "${tagline || ''}"
Description/Vibe: "${description}"
Aesthetic Style: "${style}"
Colors Required: ${colorsString}
`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'companyName',
            'tagline',
            'concept',
            'hexColors',
            'logoSvg',
            'recommendedAnimation',
          ],
          properties: {
            companyName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            concept: { type: Type.STRING },
            hexColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            logoSvg: { type: Type.STRING },
            recommendedAnimation: { type: Type.STRING },
          },
        },
      },
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error('Received an empty response from Gemini');
    }

    const payload = JSON.parse(bodyText.trim());
    res.json(payload);
  } catch (error: any) {
    console.error('API Error in generation:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while generating the logo kit.',
    });
  }
});

// Start host server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
