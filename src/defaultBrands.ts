import { BrandKit } from './types';

export const DEFAULT_BRANDS: BrandKit[] = [
  {
    companyName: 'VELO ARCHITECTS',
    tagline: 'ESTABLISHED 2024 / SEATTLE',
    concept: 'A stark, high-contrast brutalist logo designed with alternating thick-and-thin vertical monoliths, evoking architectural structure, balance, and modern sustainability.',
    hexColors: ['#FFFFFF', '#D4D4D8', '#3F3F46'],
    recommendedAnimation: 'modern-reveal',
    createdAt: '2026-05-29T08:00:00Z',
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" style="overflow: visible;">
      <defs>
        <linearGradient id="velo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#71717A" />
        </linearGradient>
      </defs>
      <!-- Primary Design Element Group -->
      <g id="group-emblem">
        <!-- Vertical Monoliths representing architectural forms -->
        <rect id="rect-1" x="160" y="100" width="30" height="240" rx="4" fill="url(#velo-grad)" />
        <rect id="rect-2" x="210" y="140" width="30" height="200" rx="4" fill="url(#velo-grad)" opacity="0.85" />
        <rect id="rect-3" x="260" y="80" width="30" height="260" rx="4" fill="#FFFFFF" />
        <rect id="rect-4" x="310" y="160" width="30" height="180" rx="4" fill="url(#velo-grad)" opacity="0.6" />
        
        <!-- Framing subtle geometric accents -->
        <circle cx="250" cy="220" r="110" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="8 6" opacity="0.5" />
        <line x1="120" y1="220" x2="380" y2="220" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="4 4" />
      </g>
      <!-- Typography Group -->
      <g id="group-text">
        <text id="text-company" x="250" y="415" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="2" text-anchor="middle" fill="#FFFFFF">VELO ARCH</text>
        <text id="text-tagline" x="250" y="445" font-family="'JetBrains Mono', monospace" font-weight="500" font-size="11" letter-spacing="4" text-anchor="middle" fill="#3B82F6">ESTABLISHED 2024 / SEATTLE</text>
      </g>
    </svg>`
  },
  {
    companyName: 'KAIZEN OVEN',
    tagline: 'ORGANIC BREAD & ROAST',
    concept: 'A delicate minimalist line-art logo capturing natural baker heat ripples, organic grain leaves, and warm circular harmony.',
    hexColors: ['#F59E0B', '#10B981', '#4b2d18'],
    recommendedAnimation: 'draw-in',
    createdAt: '2026-05-29T08:05:00Z',
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
      <defs>
        <linearGradient id="kaizen-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#EF4444" />
        </linearGradient>
      </defs>
      <g id="group-emblem">
        <!-- Circular alignment ring -->
        <circle cx="250" cy="210" r="95" fill="none" stroke="#F59E0B" stroke-width="3" stroke-dasharray="300" stroke-dashoffset="0" />
        
        <!-- Intricate grain stalks -->
        <path d="M250,305 C250,220 220,180 220,130 C220,110 230,120 250,140 C270,120 280,110 280,130 C280,180 250,220 250,305 Z" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round" />
        
        <!-- Decorative abstract seeds -->
        <path d="M220,200 C210,195 200,205 210,210 C220,215 225,205 220,200 Z" fill="url(#kaizen-grad)" />
        <path d="M280,200 C290,195 300,205 290,210 C280,215 275,205 280,200 Z" fill="url(#kaizen-grad)" />
        <path d="M230,160 C220,155 215,165 225,170 C235,175 238,165 230,160 Z" fill="url(#kaizen-grad)" />
        <path d="M270,160 C280,155 285,165 275,170 C265,175 262,165 270,160 Z" fill="url(#kaizen-grad)" />
      </g>
      <g id="group-text">
        <text id="text-company" x="250" y="395" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="700" font-size="34" letter-spacing="1" text-anchor="middle" fill="#FFFFFF">KAIZEN OVEN</text>
        <text id="text-tagline" x="250" y="425" font-family="'Inter', system-ui, sans-serif" font-weight="400" font-size="11" letter-spacing="5" text-anchor="middle" fill="#F59E0B">ORGANIC BREAD &amp; ROAST</text>
      </g>
    </svg>`
  },
  {
    companyName: 'VERTEX SPACE',
    tagline: 'ORBITAL INFRASTRUCTURE',
    concept: 'A futuristic modern-tech symbol leveraging concentric orbital circuits, satellite nodes, and vector convergence grids.',
    hexColors: ['#0EA5E9', '#8B5CF6', '#1E1B4B'],
    recommendedAnimation: 'rotator-pulse',
    createdAt: '2026-05-29T08:10:00Z',
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" style="overflow: visible;">
      <defs>
        <linearGradient id="vertex-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0EA5E9" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
      <g id="group-emblem">
        <!-- Triple integrated nodes & paths -->
        <circle cx="250" cy="210" r="100" fill="none" stroke="url(#vertex-blue)" stroke-width="4" stroke-dasharray="150 100" />
        <circle cx="250" cy="210" r="65" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-dasharray="60 40" />
        <circle cx="250" cy="210" r="30" fill="none" stroke="#0EA5E9" stroke-width="1.5" />
        
        <!-- Glowing star cluster or satellite nodes -->
        <circle cx="250" cy="110" r="7" fill="#0EA5E9" />
        <circle cx="250" cy="310" r="7" fill="#8B5CF6" />
        <circle cx="150" cy="210" r="5" fill="#FFFFFF" />
        <circle cx="350" cy="210" r="5" fill="#FFFFFF" />
        
        <!-- Center core shard -->
        <polygon points="250,185 272,210 250,235 228,210" fill="url(#vertex-blue)" />
      </g>
      <g id="group-text">
        <text id="text-company" x="250" y="405" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="800" font-size="32" letter-spacing="3" text-anchor="middle" fill="#FFFFFF">VERTEX SPACE</text>
        <text id="text-tagline" x="250" y="435" font-family="'JetBrains Mono', monospace" font-weight="500" font-size="10.5" letter-spacing="6" text-anchor="middle" fill="#8B5CF6">ORBITAL INFRASTRUCTURE</text>
      </g>
    </svg>`
  }
];
