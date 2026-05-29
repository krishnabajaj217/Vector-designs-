import { ColorPalettePreset, LogoStylePreset } from './types';

export const COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'cool-tech',
    name: 'Nordic Crisp Slate',
    colors: ['#0EA5E9', '#38BDF8', '#0F172A', '#E2E8F0', '#0284C7'],
    description: 'Cold slate with sharp sky blues and platinum whites. Perfect for security and high-tech SaaS.',
  },
  {
    id: 'neon-cyberpunk',
    name: 'Electric Cyberpunk',
    colors: ['#F43F5E', '#D946EF', '#8B5CF6', '#0F172A', '#1E1B4B'],
    description: 'Vibrant rose, energetic magenta, and deep indigo. Great for design studios, gaming, and creative creators.',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset & Earth',
    colors: ['#F97316', '#F59E0B', '#10B981', '#451A03', '#FDF8F6'],
    description: 'Cozy terracotta, amber, and deep botanical green. Outstanding for organic cafes, bistros, and pottery.',
  },
  {
    id: 'minimal-charcoal',
    name: 'Monochrome Carbon',
    colors: ['#18181B', '#3F3F46', '#A1A1AA', '#FAFAFA', '#27272A'],
    description: 'Ultra-clean charcoal, carbon grays, and pristine whites. Ideal for architectural firms and minimalist clothing.',
  },
  {
    id: 'royal-heritage',
    name: 'Midnight & Royal Gold',
    colors: ['#EAB308', '#CA8A04', '#1E3A8A', '#0F172A', '#FEF08A'],
    description: 'Lavish gold, deep royal sapphire, and navy slate. Exquisite for financial law groups or luxury jewelry brands.',
  },
  {
    id: 'forest-cream',
    name: 'Ancient Forest & Moss',
    colors: ['#065F46', '#10B981', '#34D399', '#FAF7F2', '#312E81'],
    description: 'Rich emerald moss paired with elegant off-white cream. Ideal for eco-tech, organic farming, and wellness.',
  },
];

export const LOGO_STYLES: LogoStylePreset[] = [
  {
    id: 'minimalist',
    name: 'Minimalist Line Art',
    description: 'Clean thin vector lines, balanced weights, and negative space metaphors.',
    iconName: 'Fingerprint',
  },
  {
    id: 'geometric',
    name: 'Sacred Geometry',
    description: 'Symmetric, circular, and grid-based mathematical logos with impeccable precision.',
    iconName: 'Compass',
  },
  {
    id: 'abstract',
    name: 'Dynamic Abstract',
    description: 'Asymmetric vector fluid shapes, floating gradients, and symbolic brand elements.',
    iconName: 'Activity',
  },
  {
    id: 'modern-tech',
    name: 'Circuit Tech',
    description: 'Cubic grid paths, modern angles, intersecting connection points on a grid.',
    iconName: 'Cpu',
  },
  {
    id: 'emblem',
    name: 'Emblem Crest',
    description: 'Traditional shield, badge, or stamp-like enclosing structures with modern layout.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'organic',
    name: 'Flowing Organic',
    description: 'Curved leafs, botanical spirals, natural textures, and cozy warm proportions.',
    iconName: 'Leaf',
  },
];
