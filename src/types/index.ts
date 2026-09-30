export type ColorThemeId = 'rose' | 'violet' | 'sunset' | 'aurora' | 'gold' | 'ocean';

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  palette: string[]; // particle colors
  glow: string;
  heartCenterColor: string;
  bgGradient: string;
  badgeBg: string;
}

export interface ConfessionConfig {
  recipient: string;
  message: string;
  sender: string;
  dateStr?: string;
  themeId: ColorThemeId;
  daysTogether?: number;
  showDaysCounter: boolean;
  anniversaryLabel?: string;
}

export type ParticleMode = 'galaxy' | 'heart' | 'stardust' | 'bloom';

export interface MemoryStarPhoto {
  id: string;
  title: string;
  date?: string;
  quote: string;
  imageUrl: string;
  galaxyRadiusFactor: number;
  galaxySpeed: number;
  galaxyInitialAngle: number;
  heartT: number;
  stardustXFactor: number;
  stardustYFactor: number;
}

export interface DiaryStarEntry {
  id: string;
  title: string;
  date: string;
  weather?: string;
  mood?: string;
  content: string;
  photoUrl?: string;
  galaxyRadiusFactor: number;
  galaxySpeed: number;
  galaxyInitialAngle: number;
  heartT: number;
  stardustXFactor: number;
  stardustYFactor: number;
  createdAt: number;
}

export interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export interface FireworkParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  color: string;
  twinkle: boolean;
  twinklePhase: number;
  twinkleSpeed: number;
}
