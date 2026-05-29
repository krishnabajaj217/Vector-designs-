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

// Helper to generate a beautiful procedural fallback SVG logo if API is hitting rate constraints
function generateProceduralFallbackSvg(companyName: string, tagline: string, style: string, colors: string[]): { logoSvg: string; hexColors: string[]; recommendedAnimation: string } {
  const activeColors = colors && colors.length >= 2 ? colors : ['#38BDF8', '#818CF8', '#34D399'];
  const primary = activeColors[0] || '#38BDF8';
  const secondary = activeColors[1] || '#818CF8';
  const accent = activeColors[2] || activeColors[0];

  let pathData = '';
  let animation = 'float-glow';

  // Custom paths for procedural vectors matching aesthetic preferences
  if (style === 'organic') {
    animation = 'draw-in';
    pathData = `
      <path d="M 250 130 C 295 175, 295 245, 250 290 C 205 245, 205 175, 250 130 Z" fill="url(#grad-primary)" opacity="0.85" />
      <path d="M 250 200 C 280 220, 290 260, 271 292 C 241 272, 231 232, 250 200 Z" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" />
      <path d="M 250 200 C 220 220, 210 260, 229 292 C 259 272, 269 232, 250 200 Z" fill="none" stroke="${secondary}" stroke-width="4" stroke-linecap="round" />
      <circle cx="250" cy="130" r="10" fill="${accent}" />
    `;
  } else if (style === 'emblem') {
    animation = 'assemble-stagger';
    pathData = `
      <path d="M 250 110 L 340 140 C 340 260, 250 315, 250 315 C 250 315, 160 260, 160 140 Z" fill="none" stroke="url(#grad-primary)" stroke-width="8" stroke-linejoin="round" />
      <path d="M 250 130 L 320 155 C 320 245, 250 290, 250 290 C 250 290, 180 245, 180 155 Z" fill="url(#grad-secondary)" opacity="0.25" />
      <path d="M 235 180 L 265 180 L 260 250 L 240 250 Z" fill="${accent}" />
      <circle cx="250" cy="170" r="12" fill="none" stroke="${accent}" stroke-width="4" />
      <line x1="205" y1="215" x2="295" y2="215" stroke="${primary}" stroke-width="5" />
    `;
  } else if (style === 'minimalist' || style === 'abstract') {
    animation = 'modern-reveal';
    pathData = `
      <rect x="170" y="160" width="40" height="142" rx="4" fill="url(#grad-primary)" />
      <rect x="230" y="115" width="45" height="188" rx="4" fill="url(#grad-secondary)" />
      <rect x="295" y="190" width="35" height="112" rx="4" fill="${accent}" />
      <circle cx="252" cy="85" r="10" fill="${primary}" />
    `;
  } else {
    // default to tech / geometric / cosmic orbit
    animation = 'rotator-pulse';
    pathData = `
      <circle cx="250" cy="210" r="90" fill="none" stroke="url(#grad-primary)" stroke-width="6" stroke-dasharray="14 7" />
      <circle cx="250" cy="210" r="62" fill="none" stroke="url(#grad-secondary)" stroke-width="4" />
      <circle cx="250" cy="120" r="11" fill="${accent}" />
      <circle cx="312" cy="210" r="7" fill="${accent}" />
      <circle cx="188" cy="210" r="7" fill="${primary}" />
      <path d="M 215 210 L 285 210" stroke="${primary}" stroke-width="4" />
      <path d="M 250 175 L 250 245" stroke="${secondary}" stroke-width="4" />
      <circle cx="250" cy="210" r="22" fill="none" stroke="${accent}" stroke-width="5" />
    `;
  }

  const svgMarkup = `<svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
    <linearGradient id="grad-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${secondary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>

  <g id="group-emblem">
    ${pathData}
  </g>

  <g id="group-text">
    <text id="text-company" x="250" y="415" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="1.5" text-anchor="middle" fill="#FFFFFF">${companyName.toUpperCase()}</text>
    ${tagline ? `<text id="text-tagline" x="250" y="450" font-family="'Inter', system-ui, sans-serif" font-weight="600" font-size="12" letter-spacing="6" text-anchor="middle" fill="#99F6E4" opacity="0.8">${tagline.toUpperCase()}</text>` : ''}
  </g>
</svg>`;

  return {
    logoSvg: svgMarkup,
    hexColors: activeColors,
    recommendedAnimation: animation
  };
}

// REST Endpoint to generate brand kits and company logos
app.post('/api/generate-logo', async (req, res) => {
  const { companyName, tagline, description, style, paletteColors } = req.body;
  
  if (!companyName) {
    res.status(400).json({ error: 'Company Name is required.' });
    return;
  }

  const mockPalette = paletteColors && paletteColors.length > 0 ? paletteColors : ['#38BDF8', '#818CF8', '#34D399'];

  try {
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
      model: 'models/gemini-3.5-flash',
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
    console.warn('[Gemini Generator Fallback Action] API is currently unconfigured or rate-limited (429/503). Generating beautiful procedural vector local logo.');
    
    // Perform procedural local fallback design matching style and selected palette parameters
    const fallbackData = generateProceduralFallbackSvg(companyName, tagline || '', style || 'geometric', mockPalette);
    
    res.json({
      companyName,
      tagline: tagline || '',
      concept: `Bespoke local design vector. Generated dynamically using server-side local design rules (under constraints of Gemini API limit rate/429 status). Uses custom ${style} layouts alongside selected colors.`,
      hexColors: fallbackData.hexColors,
      logoSvg: fallbackData.logoSvg,
      recommendedAnimation: fallbackData.recommendedAnimation,
      isProceduralFallback: true
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
