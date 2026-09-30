import React, { useEffect, useRef, useCallback } from 'react';
import { ColorTheme, ColorThemeId, ParticleMode, TouchRipple, Sparkle, FireworkParticle } from '../types';
import { COLOR_THEMES } from '../constants/themes';
import { Point3D, generateHeartTargets, generateGalaxyTargets, generateStardustTargets, calculateHeartbeatScale } from '../utils/heartMath';
import { romanticAudio } from '../utils/audio';
import { Palette, Sparkles } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  trail: { x: number; y: number }[];
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  baseTargetX: number;
  baseTargetY: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  type: Point3D['type'];
  wanderAngle: number;
  wanderSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  speed: number;
  thickness: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  glowColor: string;
}

interface ParticleCanvasProps {
  theme: ColorTheme;
  mode: ParticleMode;
  onHeartActivated?: () => void;
  isAudioMuted?: boolean;
  onThemeChange?: (theme: ColorTheme) => void;
  isImmersive?: boolean;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  theme,
  mode,
  onHeartActivated,
  onThemeChange,
  isImmersive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<TouchRipple[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const fireworksRef = useRef<FireworkParticle[]>([]);
  const fireworkCountRef = useRef<number>(0);
  const meteorsRef = useRef<ShootingStar[]>([]);
  const lastMeteorTimeRef = useRef<number>(0);
  const nextMeteorIntervalRef = useRef<number>(1800);
  const pointerPosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const lastBeatTimeRef = useRef<number>(0);
  const modeRef = useRef<ParticleMode>(mode);
  const themeRef = useRef<ColorTheme>(theme);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    themeRef.current = theme;
    // Update existing particle colors smoothly
    particlesRef.current.forEach((p, i) => {
      const palette = theme.palette;
      p.color = palette[i % palette.length];
    });
  }, [theme]);

  // Spawn sparkles (burst on click or beat)
  const spawnSparkles = useCallback((x: number, y: number, count: number = 24) => {
    const palette = themeRef.current.palette;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      sparklesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: Math.random() * 2.8 + 1.2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
  }, []);

  // Spawn romantic fireworks with physical gravity, rich colors, and ballistic trails
  const spawnFireworks = useCallback((x: number, y: number) => {
    const themeColors = themeRef.current.palette;
    // Rich romantic & celestial fireworks color bank
    const fireworkColors = [
      ...themeColors,
      '#ff007f', // Deep Rose Pink
      '#ff5376', // Sakura Pink
      '#ffd700', // Imperial Gold
      '#ffe066', // Starlight Champagne
      '#ff6b6b', // Coral Peach
      '#c084fc', // Bright Lavender
      '#38bdf8', // Electric Cyan
      '#ffffff', // Diamond White
      '#f43f5e', // Ruby Red
    ];

    fireworkCountRef.current++;
    // Alternate burst shapes: 50% heart-shaped burst, 50% spherical floral starburst
    const isHeartBurst = fireworkCountRef.current % 2 === 1;
    const particleCount = isHeartBurst ? 72 : 84;

    for (let i = 0; i < particleCount; i++) {
      let vx = 0;
      let vy = 0;
      const speedMult = Math.random() * 0.4 + 0.8;

      if (isHeartBurst) {
        // Parametric heart formula for initial explosion velocity
        const t = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const sinT = Math.sin(t);
        const hx = 16 * Math.pow(sinT, 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        const spread = (0.28 + Math.random() * 0.12) * speedMult;
        vx = hx * spread + (Math.random() - 0.5) * 1.5;
        vy = hy * spread - 1.2; // Slight upward launch impulse
      } else {
        // Spherical starburst with multi-speed layers
        const angle = Math.random() * Math.PI * 2;
        const layerSpeed = (Math.random() * 5.5 + 2.5) * speedMult;
        vx = Math.cos(angle) * layerSpeed;
        vy = Math.sin(angle) * layerSpeed - 1.5; // Upward bias for natural firework arcs
      }

      const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      const size = Math.random() * 2.2 + 1.6;
      const gravity = Math.random() * 0.05 + 0.13; // Physical downward gravity
      const friction = Math.random() * 0.015 + 0.965; // Air drag / resistance
      const decay = Math.random() * 0.008 + 0.012; // Natural lifespan (1.5 - 2.5s)

      fireworksRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx,
        vy,
        size,
        alpha: 1,
        decay,
        gravity,
        friction,
        color,
        twinkle: Math.random() < 0.65,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.25 + 0.15,
      });
    }

    // Add a few extra micro-stars for lingering willow sparkle effect
    for (let j = 0; j < 18; j++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.8;
      fireworksRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: Math.random() * 1.5 + 1.0,
        alpha: 1,
        decay: Math.random() * 0.006 + 0.008, // Extra long duration willow sparks
        gravity: 0.08,
        friction: 0.98,
        color: '#ffffff',
        twinkle: true,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.35,
      });
    }
  }, []);

  // Spawn romantic celestial shooting star (meteor) with long gradient trail
  const spawnShootingStar = useCallback((width: number, height: number) => {
    // 75% streak diagonally top-left -> bottom-right; 25% top-right -> bottom-left
    const isLeftToRight = Math.random() < 0.75;
    const angle = isLeftToRight
      ? (Math.PI / 180) * (30 + Math.random() * 20) // ~30° - 50°
      : (Math.PI / 180) * (130 + Math.random() * 20); // ~130° - 150°

    const speed = Math.random() * 8 + 18; // 18 - 26 px per frame
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const startX = isLeftToRight
      ? Math.random() * (width * 0.7) - 60
      : Math.random() * (width * 0.7) + width * 0.3;
    const startY = Math.random() * (height * 0.35) - 40;

    const length = Math.random() * 140 + 200; // 200px - 340px long luminous tail
    const thickness = Math.random() * 1.2 + 2.0; // 2.0px - 3.2px core width
    const maxLife = Math.floor(Math.random() * 24 + 40); // 40 - 64 frames (~0.7s - 1.1s)
    const maxAlpha = Math.random() * 0.25 + 0.75;

    // Palette of romantic shooting star hues matching celestial themes
    const meteorPalettes = [
      { core: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },
      { core: '#e0f2fe', glow: 'rgba(56, 189, 248, 0.85)' },
      { core: '#fdf4ff', glow: 'rgba(244, 114, 182, 0.85)' },
      { core: '#fef9c3', glow: 'rgba(251, 191, 36, 0.85)' },
    ];
    const chosen = meteorPalettes[Math.floor(Math.random() * meteorPalettes.length)];

    meteorsRef.current.push({
      x: startX,
      y: startY,
      vx,
      vy,
      length,
      speed,
      thickness,
      alpha: 0,
      maxAlpha,
      life: 0,
      maxLife,
      color: chosen.core,
      glowColor: chosen.glow,
    });
  }, []);

  // Spawn interactive touch ripple
  const spawnRipple = useCallback((x: number, y: number) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      alpha: 0.8,
      color: themeRef.current.palette[0],
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Adaptive particle count based on screen size
    const getTargetParticleCount = () => {
      if (width < 640) return 1300; // Mobile
      if (width < 1024) return 1800; // Tablet
      return 2400; // Desktop
    };

    let particleCount = getTargetParticleCount();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate center and scale for heart and galaxy
    const getHeartParams = () => {
      const isMobile = width < 640;
      // Exactly screen centered
      const cy = height * 0.5;
      const cx = width * 0.5;
      const minDim = Math.min(width, height);
      // Scale: responsive
      const baseScale = isMobile ? minDim * 0.024 : minDim * 0.023;
      return { cx, cy, baseScale };
    };

    // Rebuild targets
    const rebuildTargets = (currentMode: ParticleMode) => {
      const { cx, cy, baseScale } = getHeartParams();
      const targets =
        currentMode === 'heart' || currentMode === 'bloom'
          ? generateHeartTargets(particleCount, cx, cy, baseScale)
          : currentMode === 'stardust'
          ? generateStardustTargets(particleCount, width, height)
          : generateGalaxyTargets(particleCount, width, height);

      // Create or update particles
      const palette = themeRef.current.palette;
      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const target = targets[i] || targets[0];
        const existing = particlesRef.current[i];

        if (existing) {
          existing.baseTargetX = target.x;
          existing.baseTargetY = target.y;
          existing.type = target.type;
          newParticles.push(existing);
        } else {
          // New particle starting at random position
          const randAngle = Math.random() * Math.PI * 2;
          const randDist = Math.random() * Math.min(width, height) * 0.4;
          const x = cx + Math.cos(randAngle) * randDist;
          const y = cy + Math.sin(randAngle) * randDist;
          const baseSize = target.type === 'contour' ? Math.random() * 2.2 + 1.2 : Math.random() * 1.8 + 0.8;
          const baseAlpha = target.type === 'contour' ? 0.95 : Math.random() * 0.65 + 0.35;

          newParticles.push({
            x,
            y,
            z: target.z,
            prevX: x,
            prevY: y,
            trail: [{ x, y }],
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            targetX: target.x,
            targetY: target.y,
            baseTargetX: target.x,
            baseTargetY: target.y,
            size: baseSize,
            baseSize,
            color: palette[i % palette.length],
            alpha: baseAlpha,
            baseAlpha,
            type: target.type,
            wanderAngle: Math.random() * Math.PI * 2,
            wanderSpeed: Math.random() * 0.03 + 0.01,
          });
        }
      }

      particlesRef.current = newParticles;
    };

    rebuildTargets(modeRef.current);

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      particleCount = getTargetParticleCount();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      rebuildTargets(modeRef.current);
    };

    // Window-level smooth pointer tracking for gravitational field
    const onWindowPointerMove = (e: PointerEvent) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        pointerPosRef.current = { x, y, active: true };
      } else {
        pointerPosRef.current.active = false;
      }
    };

    const onWindowPointerLeave = () => {
      pointerPosRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerleave', onWindowPointerLeave);

    // Main animation loop
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // cap delta time for smooth frame drops
      lastTime = currentTime;
      const timeInSec = currentTime * 0.001;

      const isHeartMode = modeRef.current === 'heart' || modeRef.current === 'bloom';
      const isStardustMode = modeRef.current === 'stardust';
      const { cx, cy } = getHeartParams();

      // Romantic atmospheric backdrop: trail fade with subtle deep tint (silkier and longer in galaxy & stardust)
      ctx.globalCompositeOperation = 'source-over';
      const trailOpacity = isHeartMode ? 0.28 : 0.16;
      ctx.fillStyle = `rgba(7, 5, 13, ${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);

      // Calculate heart heartbeat pulse
      let heartScale = 1;
      if (isHeartMode) {
        const beatData = calculateHeartbeatScale(timeInSec);
        heartScale = beatData.scale;

        // Trigger periodic soft heart pulse sound and center sparkle
        if (beatData.isBeatPeak && currentTime - lastBeatTimeRef.current > 600) {
          lastBeatTimeRef.current = currentTime;
          romanticAudio.playHeartbeat();
          spawnSparkles(cx, cy, 14);
        }

        // Draw soft ambient heart glow in the center
        const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180 * heartScale);
        glowGrad.addColorStop(0, themeRef.current.glow);
        glowGrad.addColorStop(0.5, 'rgba(255, 105, 180, 0.08)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 180 * heartScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Switch to glowing additive blend mode for luminous stardust & fireworks
      ctx.globalCompositeOperation = 'lighter';

      // Update and draw particles
      const particles = particlesRef.current;
      const pointer = pointerPosRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Dynamic target calculations
        if (isHeartMode) {
          // Scale relative to heart center
          const dx = p.baseTargetX - cx;
          const dy = p.baseTargetY - cy;
          p.targetX = cx + dx * heartScale;
          p.targetY = cy + dy * heartScale;
        } else if (isStardustMode) {
          // Slow organic cosmic stardust drift with gentle vector flow field
          const flowAngle = Math.sin(p.baseTargetY * 0.002 + timeInSec * 0.35 + (i % 5)) * 
                            Math.cos(p.baseTargetX * 0.002 + timeInSec * 0.25) * Math.PI * 1.5;
          const driftSpeed = 0.30 + (p.baseSize / 2.5) * 0.45; // gentle parallax depth
          p.baseTargetX += Math.cos(flowAngle) * driftSpeed + 0.16; // soft horizontal drift
          p.baseTargetY += Math.sin(flowAngle) * driftSpeed - 0.26; // soft buoyant upward float

          // Seamless edge wrap-around
          if (p.baseTargetX > width + 25) p.baseTargetX = -25;
          if (p.baseTargetX < -25) p.baseTargetX = width + 25;
          if (p.baseTargetY < -25) p.baseTargetY = height + 25;
          if (p.baseTargetY > height + 25) p.baseTargetY = -25;

          p.targetX = p.baseTargetX;
          p.targetY = p.baseTargetY;
        } else {
          // Galaxy gentle continuous spiral rotation
          p.wanderAngle += p.wanderSpeed * dt * 20;
          const rotX = (p.baseTargetX - cx) * Math.cos(0.001) - (p.baseTargetY - cy) * Math.sin(0.001) + cx;
          const rotY = (p.baseTargetX - cx) * Math.sin(0.001) + (p.baseTargetY - cy) * Math.cos(0.001) + cy;
          p.baseTargetX = rotX;
          p.baseTargetY = rotY;
          p.targetX = rotX;
          p.targetY = rotY;
        }

        // Spring physics towards target (softer and more floating in stardust mode)
        const spring = isHeartMode ? 0.055 : isStardustMode ? 0.022 : 0.035;
        const friction = isHeartMode ? 0.88 : isStardustMode ? 0.94 : 0.91;

        p.vx += (p.targetX - p.x) * spring;
        p.vy += (p.targetY - p.y) * spring;

        // Magnetic Gravitational Field Interaction (引力场微聚收拢效果)
        if (pointer.active) {
          const toCursorX = pointer.x - p.x;
          const toCursorY = pointer.y - p.y;
          const dist = Math.sqrt(toCursorX * toCursorX + toCursorY * toCursorY);
          const gravityRadius = isStardustMode ? 175 : isHeartMode ? 135 : 155;

          if (dist < gravityRadius && dist > 1) {
            // Smooth bell-curve magnetic pull factor (strongest at mid-close, gentle at periphery)
            const normalizedDist = dist / gravityRadius;
            const pullFactor = Math.sin((1 - normalizedDist) * (Math.PI / 2));

            // Gentle magnetic attraction pulling particles towards cursor center
            const pullStrength = isStardustMode ? 2.6 : isHeartMode ? 1.8 : 2.2;
            const force = pullFactor * pullStrength;

            p.vx += (toCursorX / dist) * force;
            p.vy += (toCursorY / dist) * force;

            // Soft core damping to let particles cluster smoothly without jitter
            if (dist < 32) {
              const coreDamping = 0.86 + (dist / 32) * 0.1;
              p.vx *= coreDamping;
              p.vy *= coreDamping;
            }
          }
        }

        // Apply friction & velocity
        p.vx *= friction;
        p.vy *= friction;

        // Record previous position for trajectory trail
        p.prevX = p.x;
        p.prevY = p.y;

        // Subtle organic Brownian shimmer
        p.wanderAngle += p.wanderSpeed;
        const jitter = p.type === 'contour' ? 0.35 : isStardustMode ? 0.5 : 0.8;
        p.x += p.vx + Math.cos(p.wanderAngle) * jitter;
        p.y += p.vy + Math.sin(p.wanderAngle) * jitter;

        // Update trail history buffer
        const dx = p.x - p.prevX;
        const dy = p.y - p.prevY;
        const distSq = dx * dx + dy * dy;

        // Reset trail on edge wrap-around or teleport
        if (distSq > 2000) {
          p.trail = [{ x: p.x, y: p.y }];
          p.prevX = p.x;
          p.prevY = p.y;
        } else if (!isHeartMode) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 5) {
            p.trail.shift();
          }
        } else if (p.trail.length > 1) {
          p.trail = [{ x: p.x, y: p.y }];
        }

        // Shimmering alpha (gentle breathing twinkle in stardust mode)
        const alphaPulse = isStardustMode
          ? Math.sin(timeInSec * 2.0 + i * 0.45) * 0.28
          : Math.sin(timeInSec * 3 + i) * 0.15;
        const currentAlpha = Math.max(0.12, Math.min(1, p.baseAlpha + alphaPulse));

        // 1. Draw silky fading trajectory trail for galaxy and stardust modes
        if (!isHeartMode && p.trail.length > 1) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.65, p.baseSize * 0.65);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = currentAlpha * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.stroke();
        }

        // 2. Render particle head
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        const renderSize = p.baseSize * (isHeartMode && p.type === 'contour' ? (heartScale > 1.05 ? 1.25 : 1) : 1);
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------------------
      // Update and draw Romantic Fireworks with Physical Gravity
      // ----------------------------------------------------
      const fireworks = fireworksRef.current;
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];

        // Store previous position for sparkler streak trail
        f.prevX = f.x;
        f.prevY = f.y;

        // Air resistance drag
        f.vx *= f.friction;
        f.vy *= f.friction;

        // Physical downward gravity!
        f.vy += f.gravity;

        // Update position
        f.x += f.vx;
        f.y += f.vy;

        // Decay alpha
        f.alpha -= f.decay;
        f.twinklePhase += f.twinkleSpeed;

        if (f.alpha <= 0 || f.y > height + 50) {
          fireworks.splice(i, 1);
          continue;
        }

        // Twinkle factor
        const twinkleMod = f.twinkle ? (0.65 + 0.35 * Math.sin(f.twinklePhase)) : 1;
        const currentAlpha = Math.max(0, f.alpha * twinkleMod);

        // 1. Draw glowing firework trail streak (sparkler trail)
        ctx.strokeStyle = f.color;
        ctx.lineWidth = Math.max(1, f.size * 0.7);
        ctx.lineCap = 'round';
        ctx.globalAlpha = currentAlpha * 0.75;
        ctx.beginPath();
        ctx.moveTo(f.prevX, f.prevY);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();

        // 2. Draw brilliant sparkler head
        ctx.fillStyle = f.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();

        // 3. Incandescent white core for close/bright sparks
        if (f.alpha > 0.4 && f.size > 1.8) {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = currentAlpha * 0.85;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw sparkles (burst particles)
      const sparkles = sparklesRef.current;
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw touch ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.5;
        r.alpha -= 0.022;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = r.alpha * 0.6;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update and draw Shooting Stars (Meteors with long trail)
      // Periodically triggered when mode is 'galaxy' or 'stardust'
      const nowMs = performance.now();
      const currentMode = modeRef.current;
      if (currentMode === 'galaxy' || currentMode === 'stardust') {
        if (nowMs - lastMeteorTimeRef.current > nextMeteorIntervalRef.current) {
          lastMeteorTimeRef.current = nowMs;
          // Randomize next interval: 2.2s - 4.6s for organic celestial rhythm
          nextMeteorIntervalRef.current = Math.random() * 2400 + 2200;
          spawnShootingStar(width, height);

          // 25% chance of a romantic twin shooting star trailing shortly behind
          if (Math.random() < 0.25) {
            setTimeout(() => {
              if (canvasRef.current) {
                spawnShootingStar(width, height);
              }
            }, Math.random() * 280 + 140);
          }
        }
      }

      const meteors = meteorsRef.current;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += m.vx;
        m.y += m.vy;

        // Smooth fade envelope (fade-in, sustain, fade-out)
        const fadeIn = m.maxLife * 0.22;
        const fadeOut = m.maxLife * 0.65;
        if (m.life < fadeIn) {
          m.alpha = (m.life / fadeIn) * m.maxAlpha;
        } else if (m.life > fadeOut) {
          m.alpha = Math.max(0, ((m.maxLife - m.life) / (m.maxLife - fadeOut)) * m.maxAlpha);
        } else {
          m.alpha = m.maxAlpha;
        }

        if (m.life >= m.maxLife || m.alpha <= 0.01 || m.x > width + 250 || m.y > height + 250) {
          meteors.splice(i, 1);
          continue;
        }

        // Tail origin
        const trailProgress = Math.min(1, m.life / (m.maxLife * 0.35));
        const currentLength = m.length * trailProgress;
        const speedNorm = Math.hypot(m.vx, m.vy);
        const dirX = m.vx / speedNorm;
        const dirY = m.vy / speedNorm;
        const tailX = m.x - dirX * currentLength;
        const tailY = m.y - dirY * currentLength;

        // 1. Long luminous core gradient trail
        const trailGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        trailGrad.addColorStop(0.35, m.glowColor.replace(/[\d\.]+\)$/, `${(m.alpha * 0.25).toFixed(3)})`));
        trailGrad.addColorStop(0.75, m.glowColor.replace(/[\d\.]+\)$/, `${(m.alpha * 0.75).toFixed(3)})`));
        trailGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha.toFixed(3)})`);

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // 2. Wide ethereal outer glow streak
        const glowGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glowGrad.addColorStop(0.5, m.glowColor.replace(/[\d\.]+\)$/, `${(m.alpha * 0.12).toFixed(3)})`));
        glowGrad.addColorStop(1, m.glowColor.replace(/[\d\.]+\)$/, `${(m.alpha * 0.45).toFixed(3)})`));

        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = m.thickness * 3.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // 3. Glowing star head
        // Soft halo
        ctx.fillStyle = m.glowColor.replace(/[\d\.]+\)$/, `${(m.alpha * 0.75).toFixed(3)})`);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Incandescent brilliant center
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = m.alpha;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 0.95, 0, Math.PI * 2);
        ctx.fill();

        // 4. Stardust wake: drop twinkling micro-sparkles along the trail
        if (Math.random() < 0.35) {
          sparklesRef.current.push({
            x: m.x - dirX * (Math.random() * currentLength * 0.6) + (Math.random() - 0.5) * 4,
            y: m.y - dirY * (Math.random() * currentLength * 0.6) + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6 + 0.2,
            size: Math.random() * 1.6 + 0.8,
            alpha: m.alpha * 0.8,
            decay: Math.random() * 0.03 + 0.02,
            color: m.color,
          });
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerleave', onWindowPointerLeave);
    };
  }, [spawnSparkles, spawnShootingStar]);

  // When mode prop changes, re-assign particle targets
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 640;
    const cy = height * 0.5;
    const cx = width * 0.5;
    const minDim = Math.min(width, height);
    const baseScale = isMobile ? minDim * 0.024 : minDim * 0.023;
    const particleCount = particlesRef.current.length;

    const targets =
      mode === 'heart' || mode === 'bloom'
        ? generateHeartTargets(particleCount, cx, cy, baseScale)
        : mode === 'stardust'
        ? generateStardustTargets(particleCount, width, height)
        : generateGalaxyTargets(particleCount, width, height);

    particlesRef.current.forEach((p, i) => {
      const target = targets[i] || targets[0];
      p.baseTargetX = target.x;
      p.baseTargetY = target.y;
      p.type = target.type;
    });

    if (mode === 'heart') {
      spawnSparkles(cx, cy, 45);
      spawnFireworks(cx, cy);
      romanticAudio.playFireworkSound(0, 0.4);
    } else if (mode === 'stardust') {
      spawnSparkles(width * 0.5, height * 0.4, 25);
      romanticAudio.playChime(1.15);
    }
  }, [mode, spawnSparkles, spawnFireworks]);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = rect.width > 0 ? (x / rect.width) * 2 - 1 : 0;
    const normY = rect.height > 0 ? y / rect.height : 0.5;

    pointerPosRef.current = { x, y, active: true };
    spawnRipple(x, y);
    spawnSparkles(x, y, 16);
    
    // Trigger brilliant romantic fireworks with physical gravity!
    spawnFireworks(x, y);
    romanticAudio.playFireworkSound(normX, normY);

    // If currently in galaxy mode, activate heart on click
    if (modeRef.current === 'galaxy') {
      onHeartActivated?.();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerPosRef.current = { x, y, active: true };

    // Gentle stardust trail while moving pointer/touch
    if (Math.random() < 0.28) {
      spawnSparkles(x, y, 2);
    }
  };

  const handlePointerUp = () => {
    pointerPosRef.current.active = false;
  };

  // Switch color theme with immediate particle color update & celebratory sparkles
  const handleSelectTheme = (themeId: ColorThemeId) => {
    const targetTheme = COLOR_THEMES[themeId];
    if (!targetTheme) return;

    themeRef.current = targetTheme;
    // Update existing particle colors immediately
    const newPalette = targetTheme.palette;
    particlesRef.current.forEach((p, i) => {
      p.color = newPalette[i % newPalette.length];
    });

    // Spawn a burst of celebratory sparkles across the center
    const width = window.innerWidth;
    const height = window.innerHeight;
    spawnSparkles(width * 0.5, height * 0.5, 36);
    romanticAudio.playChime(1.5);
    onThemeChange?.(targetTheme);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-pointer touch-none block"
        style={{
          background: theme.bgGradient,
        }}
      />

      {/* Minimalist Interactive Palette Switcher Dock (Vertical layout, no text) */}
      {!isImmersive && (
        <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300">
            {/* Top Palette Indicator Icon */}
            <div className="pt-1 pb-0.5 text-pink-300/80" title="星空调色盘">
              <Palette className="w-3.5 h-3.5" />
            </div>

            {/* Vertical Theme Color Jewels (Pure minimalist glowing gems, no text) */}
            {(['violet', 'rose', 'ocean', 'sunset', 'aurora'] as ColorThemeId[]).map((thmId) => {
              const thm = COLOR_THEMES[thmId];
              if (!thm) return null;
              const isSelected = theme.id === thm.id;
              return (
                <button
                  key={thm.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTheme(thm.id as ColorThemeId);
                  }}
                  title={thm.name}
                  aria-label={thm.name}
                  className={`group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'scale-110'
                      : 'hover:scale-115 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full border-2 border-white/90"
                      style={{
                        boxShadow: `0 0 12px ${thm.palette[0]}, 0 0 20px ${thm.glow}`,
                      }}
                    />
                  )}

                  {/* Inner Glowing Color Jewel Orb */}
                  <span
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full shadow-inner transition-transform group-hover:scale-110 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${thm.palette[0]} 45%, ${thm.palette[2] || thm.palette[1]} 100%)`,
                      boxShadow: isSelected
                        ? `0 0 10px ${thm.palette[0]}`
                        : `0 0 4px ${thm.palette[0]}`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
