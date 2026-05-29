export type LogoStyle =
  | 'minimalist'
  | 'geometric'
  | 'abstract'
  | 'modern-tech'
  | 'emblem'
  | 'organic';

export interface ColorPalettePreset {
  id: string;
  name: string;
  colors: string[]; // hex codes
  description: string;
}

export interface LogoStylePreset {
  id: LogoStyle;
  name: string;
  description: string;
  iconName: string;
}

export interface GeneratorInput {
  companyName: string;
  tagline: string;
  description: string;
  style: LogoStyle;
  paletteId: string;
  customPaletteColors?: string[];
}

export interface BrandKit {
  logoId?: string;
  companyName: string;
  tagline: string;
  concept: string;
  hexColors: string[];
  logoSvg: string;
  recommendedAnimation: string;
  createdAt: string;
}

export type AnimationType =
  | 'draw-in'
  | 'float-glow'
  | 'assemble-stagger'
  | 'modern-reveal'
  | 'rotator-pulse';

export interface AnimationSettings {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'backOut' | 'anticipate';
  loop: boolean;
  intensity: number; // 0 to 100 for motion bounds/glows
}
