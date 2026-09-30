import { ColorTheme, ConfessionConfig, MemoryStarPhoto, DiaryStarEntry } from '../types';

export const COLOR_THEMES: Record<string, ColorTheme> = {
  violet: {
    id: 'violet',
    name: '梦幻紫',
    palette: ['#c084fc', '#a855f7', '#9333ea', '#818cf8', '#e0e7ff', '#f3e8ff'],
    glow: 'rgba(168, 85, 247, 0.45)',
    heartCenterColor: '#9333ea',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #1e0b36 0%, #0d041a 50%, #05010a 100%)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
  },
  rose: {
    id: 'rose',
    name: '热烈红',
    palette: ['#ff2a6d', '#ff5e7e', '#ef4444', '#f43f5e', '#ff8da1', '#fff0f3'],
    glow: 'rgba(255, 42, 109, 0.45)',
    heartCenterColor: '#ff1493',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #2a081a 0%, #13030d 50%, #060105 100%)',
    badgeBg: 'rgba(255, 42, 109, 0.15)',
  },
  ocean: {
    id: 'ocean',
    name: '深海蓝',
    palette: ['#0ea5e9', '#38bdf8', '#0284c7', '#7dd3fc', '#bae6fd', '#f0f9ff'],
    glow: 'rgba(14, 165, 233, 0.45)',
    heartCenterColor: '#0284c7',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #041f36 0%, #02111f 50%, #01060c 100%)',
    badgeBg: 'rgba(14, 165, 233, 0.15)',
  },
  sunset: {
    id: 'sunset',
    name: '落日金',
    palette: ['#ff6b6b', '#ffa07a', '#feca57', '#ff7849', '#ffeaa7', '#fff5eb'],
    glow: 'rgba(255, 107, 107, 0.45)',
    heartCenterColor: '#ff5722',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #33140d 0%, #170704 50%, #070202 100%)',
    badgeBg: 'rgba(255, 107, 107, 0.15)',
  },
  aurora: {
    id: 'aurora',
    name: '极光青',
    palette: ['#00f2fe', '#4facfe', '#10b981', '#34d399', '#70a1ff', '#ffffff'],
    glow: 'rgba(79, 172, 254, 0.45)',
    heartCenterColor: '#38bdf8',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #052636 0%, #03131c 50%, #010609 100%)',
    badgeBg: 'rgba(79, 172, 254, 0.15)',
  },
  gold: {
    id: 'gold',
    name: '香槟金',
    palette: ['#f59e0b', '#fbbf24', '#fde047', '#fed7aa', '#fef3c7', '#ffffff'],
    glow: 'rgba(245, 158, 11, 0.45)',
    heartCenterColor: '#d97706',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, #2a200b 0%, #130d03 50%, #070401 100%)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
  },
};

export const PRESET_MESSAGES = [
  {
    title: '星河告白',
    recipient: '亲爱的女孩',
    message: '从遇见你的第一眼起，我的星系便只为你运转。想借着这漫天星辰告诉你：我喜欢你，很长很长的时间了。',
    sender: '永远偏向你的我',
  },
  {
    title: '心动告白',
    recipient: '小仙女',
    message: '在这数十亿星辰交织的浩瀚宇宙里，我最幸运的奇迹，就是能跨越茫茫人海走向你。做我女朋友好吗？',
    sender: '满心欢喜的人',
  },
  {
    title: '执手相伴',
    recipient: '我的挚爱',
    message: '山河远阔，人间烟火，无一是你，无一不是你。愿以后的每一个春夏秋冬、朝朝暮暮，都与你同在。',
    sender: '一生的伴侣',
  },
  {
    title: '温柔余生',
    recipient: '宝贝',
    message: '喜欢是骤然心动的乍见之欢，爱是朝夕相处的久处不厌。愿将世间所有的温柔与浪漫，毫无保留全留给你。',
    sender: '守护你的那颗星',
  },
  {
    title: '甜蜜纪念',
    recipient: '亲爱的',
    message: '和你在一起的每一天，都像是拆开一个藏满欢喜的礼物。感谢有你在身边，让我看见了生活最甜美的模样。',
    sender: '最爱你的我',
  },
];

export const DEFAULT_CONFIG: ConfessionConfig = {
  recipient: '亲爱的小仙女',
  message: '在这繁星漫天的宇宙里，数十亿光年交织。而我最幸运的奇迹，就是跨越人海遇见了你。做我女朋友好吗？',
  sender: '那个默默守护你的人',
  dateStr: '2024.05.20',
  themeId: 'rose',
  daysTogether: 520,
  showDaysCounter: true,
  anniversaryLabel: '相恋',
};

export const DEFAULT_MEMORY_STARS: MemoryStarPhoto[] = [
  {
    id: 'star-1',
    title: '初遇星河',
    date: '遇见你的那一刻',
    quote: '茫茫人海中，你如同最耀眼的恒星闯入我的生命',
    imageUrl: '/src/assets/images/couple_starlit_1790643468442.jpg',
    galaxyRadiusFactor: 0.38,
    galaxySpeed: 0.0006,
    galaxyInitialAngle: 0.4,
    heartT: 0.95, // upper-left lobe
    stardustXFactor: 0.28,
    stardustYFactor: 0.32,
  },
  {
    id: 'star-2',
    title: '落日漫步',
    date: '橘色晚霞的承诺',
    quote: '落日沉溺于橘色的海，而我沉溺于温柔的你',
    imageUrl: '/src/assets/images/sunset_beach_1790643481201.jpg',
    galaxyRadiusFactor: 0.54,
    galaxySpeed: 0.00045,
    galaxyInitialAngle: 2.1,
    heartT: 2.2, // upper-right lobe
    stardustXFactor: 0.72,
    stardustYFactor: 0.26,
  },
  {
    id: 'star-3',
    title: '樱花之约',
    date: '春风吹拂的时节',
    quote: '樱花盛开有千万朵，而我的目光只停留于你',
    imageUrl: '/src/assets/images/cherry_blossom_1790643491657.jpg',
    galaxyRadiusFactor: 0.68,
    galaxySpeed: 0.00035,
    galaxyInitialAngle: 3.8,
    heartT: 4.71, // bottom apex of heart
    stardustXFactor: 0.22,
    stardustYFactor: 0.65,
  },
  {
    id: 'star-4',
    title: '烟火誓言',
    date: '夜空中永恒的绚丽',
    quote: '愿每一个灿烂如焰火的明天，都有你在身旁',
    imageUrl: '/src/assets/images/fireworks_night_1790643502182.jpg',
    galaxyRadiusFactor: 0.82,
    galaxySpeed: 0.00028,
    galaxyInitialAngle: 5.2,
    heartT: 3.8, // lower-left contour
    stardustXFactor: 0.78,
    stardustYFactor: 0.62,
  },
];

export const DEFAULT_DIARY_STARS: DiaryStarEntry[] = [
  {
    id: 'diary-1',
    title: '第一次牵手的傍晚',
    date: '2024.05.20',
    weather: '橘色晚霞 🌇',
    mood: '心动 💖',
    content: '走在湖边微风吹拂的堤岸上，我假装不经意地碰到了你的指尖。你没有躲开，反而轻轻握住了我的手。那一瞬间，我心中的整片夜空都绽放了无声的绚烂烟花。',
    galaxyRadiusFactor: 0.46,
    galaxySpeed: 0.0005,
    galaxyInitialAngle: 1.25,
    heartT: 1.57, // top cleft of heart
    stardustXFactor: 0.42,
    stardustYFactor: 0.22,
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'diary-2',
    title: '冬日第一场初雪',
    date: '2024.12.18',
    weather: '细雪纷飞 ❄️',
    mood: '温暖 ☕',
    content: '街角咖啡店的玻璃蒙上了薄薄的白雾。你把冻得有些发红的双手塞进我的大衣口袋里，笑着对我说：“有你在的冬天，连风都是甜的”。真想就这样陪你走过一岁又一岁。',
    galaxyRadiusFactor: 0.62,
    galaxySpeed: 0.00038,
    galaxyInitialAngle: 2.95,
    heartT: 3.14, // left lobe
    stardustXFactor: 0.82,
    stardustYFactor: 0.45,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'diary-3',
    title: '夏夜流星许愿',
    date: '2025.07.07',
    weather: '璀璨星河 🌌',
    mood: '星愿 ✨',
    content: '山顶的夜风有些微凉，我们裹着同一张毛毯并肩抬头看着浩瀚夜空。流星划破天际的那一刻，我没有许下什么宏大的愿望，我只愿未来的每一寸光阴，身旁都有你的笑颜。',
    galaxyRadiusFactor: 0.74,
    galaxySpeed: 0.00032,
    galaxyInitialAngle: 4.5,
    heartT: 5.6, // right contour
    stardustXFactor: 0.35,
    stardustYFactor: 0.78,
    createdAt: Date.now() - 86400000 * 10,
  },
];


