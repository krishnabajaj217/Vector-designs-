import { LogoStyle } from '../types';

export interface GeneratedBrandConcept {
  companyName: string;
  tagline: string;
  description: string;
  style: LogoStyle;
  paletteId: string;
  industry: string;
}

const SECTORS = [
  {
    name: 'Cosmic Tech & AI',
    id: 'cosmo-tech',
    prefixes: ['QUANTUM', 'ASTRA', 'NEBULA', 'SYNAPSE', 'NEXUS', 'VERTICE', 'COBALT', 'HELIOS', 'ORBITAL', 'KINETIC', 'APEX', 'SIRIUS', 'GRAVITY'],
    suffixes: ['LABS', 'SYSTEMS', 'DYNAMICS', 'SYNTHETICS', 'AI', 'SATELLITE', 'COMPUTING', 'NETWORKS', 'ROBOTICS', 'SPACE', 'AEROSPACE'],
    taglines: [
      'ORBITAL INFRASTRUCTURE FOR NEXT-GEN',
      'COGNITIVE INTELLIGENCE & SYMMETRY',
      'BEYOND EVENT HORIZONS',
      'COMPUTATIONAL VECTOR INTEGRITY',
      'REDEFINING PLANETARY CONNECTIVITY'
    ],
    vibes: [
      'Futuristic clean tech. Concentric orbital circuit lines, integrated nodes, elegant star lattices, deep metallic cyan and electric purple gradients.',
      'Symmetric computational matrix. Intertwined honeycomb hex grids, network vertices converging at a central singular core node.',
      'Sleek modern aerospace symbol. Dynamic ascending geometric wing with elegant split lines, representing velocity and mathematical balance.',
      'High-performance quantum architecture. Intersecting curved vector shards creating a subtle abstract letter Q, glowing neon elements.'
    ],
    styles: ['modern-tech', 'geometric', 'abstract'] as LogoStyle[],
    palettes: ['cool-tech', 'neon-cyberpunk']
  },
  {
    name: 'Eco-Wellness & Nature',
    id: 'eco-wellness',
    prefixes: ['TERRA', 'SOL', 'MOSS', 'FLORA', 'AMBER', 'SAGE', 'LOTUS', 'PRANA', 'LUNA', 'IRIS', 'EMERALD', 'AURA', 'CLAY', 'FOREST'],
    suffixes: ['ORGANICS', 'WELLNESS', 'BOTANICALS', 'APOTHECARY', 'STUDIOS', 'COLLECTIVE', 'MOSS', 'EARTH', 'SPROUTS', 'NUTRITION'],
    taglines: [
      'COZY HARMONY WITH PRESTINE EARTH',
      'ANCIENT HERBAL ESSENCE & LIFE',
      'NATURAL BOTANICAL SYMMETRY',
      'MINIMALIST WELLNESS SECRETS',
      'MINDFUL SPIRALS & RESTORATION'
    ],
    vibes: [
      'Flowing plant stems. Curved leaf loops, elegant organic spirals, handcrafted textures, natural soft moss greens and warmth cream tints.',
      'Golden lotus geometry. Symmetrical geometric botanical petals surrounding a subtle central cycle of balance, soothing zen proportions.',
      'Cozy terracotta pottery design. Minimal stone vessel, emerging thin organic leaf shoots, soft rustic solar waves and warm sunset tones.',
      'Mindful rain or wave ripple. Clean thin concentric water rings enclosing a single rising botanical leaf, conveying peace and natural beauty.'
    ],
    styles: ['organic', 'minimalist', 'geometric'] as LogoStyle[],
    palettes: ['forest-cream', 'warm-sunset']
  },
  {
    name: 'Cyberpunk & Creative Creators',
    id: 'cyber-gaming',
    prefixes: ['NEON', 'GLITCH', 'PULSE', 'SHARD', 'VOLT', 'CATALYST', 'GRID', 'STATIC', 'VIXEN', 'ROGUE', 'HYPER', 'KODEX', 'COSMIC', 'MATRIX'],
    suffixes: ['CREATIVE', 'CHIPS', 'DIGITAL', 'ARCADE', 'FORGE', 'GUILD', 'MEDIA', 'LABS', 'STUDIOS', 'DESIGNCO', 'INTERACTIVE', 'SYNDICATE'],
    taglines: [
      'HIGH-VOLTAGE VECTOR PLAYGROUNDS',
      'DEVIANT DIGITAL CRAFTSMANSHIP',
      'SHATTERING CONVENTIONAL DESIGN',
      'LATE-NIGHT NEON SYNERGIES',
      'CRAFTING VIRTUAL FUTURES'
    ],
    vibes: [
      'Intense cyber aesthetic. Sharp angular circuitry, glowing node paths, holographic neon lasers, magenta, energetic rose, and deep ultraviolet tones.',
      'Futuristic abstract game mark. Asymmetric glowing shards forming a low-poly fox or crest, neon synthwave grid backgrounds.',
      'Bold digital layout. Dynamic overlapping vector cards with sharp corners, tech symbols, and vibrant electric neon color accents.',
      'Liquid geometric glitch art. Segmented abstract form with lateral slide offsets, resembling high-speed render layers.'
    ],
    styles: ['modern-tech', 'abstract', 'geometric'] as LogoStyle[],
    palettes: ['neon-cyberpunk', 'cool-tech']
  },
  {
    name: 'Classic Heritage & Finance',
    id: 'finance-heritage',
    prefixes: ['AURELIA', 'STERLING', 'VALOR', 'MONARCH', 'CROWN', 'SOVEREIGN', 'TRUST', 'VANGUARD', 'LEGACY', 'MERIDIAN', 'HARBOR', 'TEMPLE'],
    suffixes: ['TRUST', 'CAPITAL', 'PARTNERS', 'LAW', 'HOLDINGS', 'ASSETS', 'ADVISORS', 'MANAGEMENT', 'HERITAGE', 'CHAMBERS', 'GROUPS'],
    taglines: [
      'INTEGRITY, WEALTH, AND DECADES',
      'TIMELESS ESTATE STEWARDSHIP',
      'PRESERVING GENERAION LEGACIES',
      'EXQUISITE VIRTUE & STRATEGY',
      'THE APEX OF TRANQUIL SECURITIES'
    ],
    vibes: [
      'Traditional emblem crest. Elegant geometric shield enclosing a stylized vertical pillar or clean balanced columns, royal gold curves.',
      'Minimal star compass. Exquisite geometric geometric compass rose pointing North-East, thin gold vectors with deep navy background fills.',
      'Symmetric interlocking heraldry. Double ribbon curves forming a luxurious endless loop, conveying safety, legacy, and trust.',
      'Luxurious geometric brand mark. Modern thin line-art crown paired with clean corporate geometric alignments.'
    ],
    styles: ['emblem', 'geometric', 'minimalist'] as LogoStyle[],
    palettes: ['royal-heritage', 'minimal-charcoal']
  },
  {
    name: 'Minimal Brutalist & Architecture',
    id: 'minimal-brutalist',
    prefixes: ['VELO', 'STRUCT', 'SLATE', 'MONOLITH', 'CARBON', 'AXIS', 'VOID', 'GRID', 'PLATINUM', 'TECTONIC', 'CUBE', 'BRUTAL', 'RAW', 'FRAME'],
    suffixes: ['ARCHITECTS', 'STUDIO', 'DESIGN', 'WORKSHOP', 'SPATIAL', 'ATELIER', 'BUILDS', 'STRUCTURES', 'FORM', 'FOUNDRY', 'LABS'],
    taglines: [
      'OFFLINE MINIMAL VECTOR MATRIX',
      'STARK STRUCTURAL SUSTAINABILITY',
      'BALANCING BOLD GEOMETRIC VOIDS',
      'RAW ABSTRACT MONOLITHS / WEST',
      'ESTABLISHED MODERN FORMULATIONS'
    ],
    vibes: [
      'Brutalist architectural forms. Alternating thick-and-thin vertical concrete monoliths, raw geometric balance, high contrast slate gray.',
      'Ultra-minimal concentric geometry. Thick solid black circle intersected by a single clean diagonal line, maximizing beautiful negative space.',
      'Tectonic grid lines. Symmetric cubic framework using isometric wireframes and precise architectural vector outlines.',
      'Stark minimalist lines. Parallel lines intersecting at exact angles, creating an abstract architectural structure, monochromatic.'
    ],
    styles: ['minimalist', 'geometric', 'abstract'] as LogoStyle[],
    palettes: ['minimal-charcoal', 'cool-tech']
  },
  {
    name: 'Artisanal Gourmet & Crafted',
    id: 'artisanal-gourmet',
    prefixes: ['KAIZEN', 'OVEN', 'HEARTH', 'CRUST', 'VELVET', 'NECTAR', 'BLOOM', 'SAGE', 'MELLOW', 'BARREL', 'CRAFT', 'FLINT', 'GRAIN', 'COPPER'],
    suffixes: ['BAKERY', 'CAFE', 'ROAST', 'BREWERY', 'PROVISIONS', 'TABLE', 'BISTRO', 'MILL', 'KITCHEN', 'DISTILLERY', 'COFFEE', 'OVEN'],
    taglines: [
      'HANDCRAFTED SLOW STONE BAKED',
      'AMBER ROASTS & ORGANIC INGRIDIENTS',
      'COMFORT IN COZY GRAINS',
      'ARTISAN BAKERY & NATURAL HEARTH',
      'HONEST GOURMET FLAVOR SECRETS'
    ],
    vibes: [
      'Warm artisanal wheat stalks. Organic handdrawn line art grains paired with cozy baker ovens and natural golden fire sparkles.',
      'Aromatic roasting waves. Dynamic hot steam wave lines enclosed in a minimalist coffee bean ring, brown-gold natural textures.',
      'Handcrafted baker seal. Traditional circular badge containing rustic grain ears and baking mills, rich chocolate color presets.',
      'Symmetric gourmet leaf emblem. Elegant branch of leaves inside a warm copper plate shape, reflecting slow luxury culinary arts.'
    ],
    styles: ['organic', 'emblem', 'minimalist'] as LogoStyle[],
    palettes: ['warm-sunset', 'forest-cream']
  }
];

export function generateRandomBrand(selectedSectorId?: string): GeneratedBrandConcept {
  let sector = SECTORS.find(s => s.id === selectedSectorId);
  if (!sector) {
    const rIdx = Math.floor(Math.random() * SECTORS.length);
    sector = SECTORS[rIdx];
  }

  const prefix = sector.prefixes[Math.floor(Math.random() * sector.prefixes.length)];
  const suffix = sector.suffixes[Math.floor(Math.random() * sector.suffixes.length)];
  const companyName = `${prefix} ${suffix}`;

  const tagline = sector.taglines[Math.floor(Math.random() * sector.taglines.length)];
  const description = sector.vibes[Math.floor(Math.random() * sector.vibes.length)];
  const style = sector.styles[Math.floor(Math.random() * sector.styles.length)];
  const paletteId = sector.palettes[Math.floor(Math.random() * sector.palettes.length)];

  return {
    companyName,
    tagline,
    description,
    style,
    paletteId,
    industry: sector.name
  };
}

export function getAllSectors() {
  return SECTORS.map(s => ({ id: s.id, name: s.name }));
}
