export interface Point3D {
  x: number;
  y: number;
  z: number;
  type: 'contour' | 'fill' | 'halo' | 'stardust';
}

/**
 * Standard Gaussian normal random distribution generator via Box-Muller transform
 * Generates natural bell-curve dispersion without harsh rectangular artifacts
 */
function gaussianRandom(mean = 0, stdev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z0 * stdev + mean;
}

/**
 * Parametric heart curve equation:
 * x = 16 * sin^3(t)
 * y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
 */
export function getHeartCoord(t: number, scale: number = 1): { x: number; y: number } {
  const sinT = Math.sin(t);
  const x = 16 * Math.pow(sinT, 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return {
    x: x * scale,
    y: y * scale,
  };
}

/**
 * Generate heart target positions with soft layered volumetric depth and smooth distribution
 */
export function generateHeartTargets(
  count: number,
  cx: number,
  cy: number,
  baseScale: number
): Point3D[] {
  const points: Point3D[] = [];

  for (let i = 0; i < count; i++) {
    const ratio = i / count;
    let x = 0;
    let y = 0;
    let z = 0;
    let type: Point3D['type'] = 'fill';

    if (ratio < 0.36) {
      // 1. Crisp yet soft outer contour (36% of particles) with stratified smooth sampling
      const t = (i / (count * 0.36)) * Math.PI * 2 + gaussianRandom(0, 0.04);
      const coord = getHeartCoord(t, baseScale);
      // Soft Gaussian perturbation along edge
      x = cx + coord.x + gaussianRandom(0, 2.8);
      y = cy + coord.y + gaussianRandom(0, 2.8);
      z = gaussianRandom(0, 18);
      type = 'contour';
    } else if (ratio < 0.74) {
      // 2. Volumetric inner starlight volume (38% of particles)
      const t = Math.random() * Math.PI * 2;
      // Smooth cubic falloff towards center for crystalline glow
      const innerScaleFactor = Math.pow(Math.random(), 0.72);
      const innerScale = innerScaleFactor * baseScale;
      const coord = getHeartCoord(t, innerScale);
      
      x = cx + coord.x + gaussianRandom(0, 6);
      y = cy + coord.y + gaussianRandom(0, 6);
      // Thicker in center, tapering at contour
      z = gaussianRandom(0, 38 * (1 - innerScaleFactor * 0.4));
      type = 'fill';
    } else if (ratio < 0.88) {
      // 3. Diffuse outer romantic aura / nebula halo (14% of particles)
      const t = Math.random() * Math.PI * 2;
      const haloScale = baseScale * (1.06 + Math.pow(Math.random(), 1.5) * 0.34);
      const coord = getHeartCoord(t, haloScale);
      x = cx + coord.x + gaussianRandom(0, 12);
      y = cy + coord.y + gaussianRandom(0, 12);
      z = gaussianRandom(0, 45);
      type = 'halo';
    } else {
      // 4. Ambient floating celestial stardust (12% of particles)
      const angle = Math.random() * Math.PI * 2;
      const dist = (Math.pow(Math.random(), 0.8) * 0.6 + 0.4) * baseScale * 22;
      x = cx + Math.cos(angle) * dist;
      y = cy + Math.sin(angle) * dist * 0.85;
      z = gaussianRandom(0, 60);
      type = 'stardust';
    }

    points.push({ x, y, z, type });
  }

  return points;
}

/**
 * Generate logarithmic spiral galaxy with smooth Gaussian arm ribbons, dense glowing core, and 3D depth
 */
export function generateGalaxyTargets(count: number, width: number, height: number): Point3D[] {
  const points: Point3D[] = [];
  const cx = width * 0.5;
  const cy = height * 0.5;
  const maxR = Math.min(width, height) * 0.48;

  // 4 graceful celestial spiral arms
  const numArms = 4;

  for (let i = 0; i < count; i++) {
    const ratio = i / count;

    if (ratio < 0.22) {
      // Dense luminous galactic core with smooth exponential falloff
      const coreR = Math.pow(Math.random(), 1.8) * (maxR * 0.24);
      const angle = Math.random() * Math.PI * 2;
      const x = cx + Math.cos(angle) * coreR;
      const y = cy + Math.sin(angle) * (coreR * 0.75);
      const z = gaussianRandom(0, 35 * (1 - coreR / (maxR * 0.25)));

      points.push({ x, y, z, type: 'fill' });
    } else {
      // Flowing spiral arms with smooth logarithmic curve & Gaussian cross-section
      const armIndex = i % numArms;
      const armOffset = (armIndex * 2 * Math.PI) / numArms;

      // Distance along spiral arm
      const r = Math.pow(Math.random(), 0.85) * (maxR - 20) + 20;

      // Logarithmic spiral angle theta = b * ln(r)
      const spiralTheta = Math.log(r / 20) * 1.45 + armOffset;

      // Cross-arm Gaussian dispersion: increases smoothly with radius
      const armSpread = 5 + (r / maxR) * 26;
      const spreadOffset = gaussianRandom(0, armSpread);
      const spreadAngle = spiralTheta + Math.PI / 2;

      const x = cx + Math.cos(spiralTheta) * r + Math.cos(spreadAngle) * spreadOffset;
      const y = cy + (Math.sin(spiralTheta) * r + Math.sin(spreadAngle) * spreadOffset) * 0.72;
      
      // 3D thickness of the galactic disc
      const discThickness = 15 + (1 - r / maxR) * 35;
      const z = gaussianRandom(0, discThickness);

      points.push({ x, y, z, type: 'stardust' });
    }
  }

  return points;
}

/**
 * Generate smooth floating stardust field targets across full screen with organic depth layers
 */
export function generateStardustTargets(count: number, width: number, height: number): Point3D[] {
  const points: Point3D[] = [];

  // Multi-cluster celestial stardust clouds
  const numClusters = 4;
  const clusters = Array.from({ length: numClusters }, () => ({
    cx: width * (0.2 + Math.random() * 0.6),
    cy: height * (0.2 + Math.random() * 0.6),
    radius: Math.min(width, height) * (0.25 + Math.random() * 0.25),
  }));

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    let z = 0;

    if (Math.random() < 0.65) {
      // 65% in soft organic celestial clouds
      const cluster = clusters[i % numClusters];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.9) * cluster.radius;
      x = cluster.cx + Math.cos(angle) * dist + gaussianRandom(0, 20);
      y = cluster.cy + Math.sin(angle) * dist + gaussianRandom(0, 20);
      z = gaussianRandom(0, 55);
    } else {
      // 35% evenly distributed background stardust field
      x = Math.random() * width;
      y = Math.random() * height;
      z = (Math.random() - 0.5) * 110;
    }

    points.push({
      x,
      y,
      z,
      type: 'stardust',
    });
  }

  return points;
}

/**
 * Calculates heartbeat scale multiplier at given timestamp (seconds)
 */
export function calculateHeartbeatScale(timeInSec: number): { scale: number; isBeatPeak: boolean } {
  const period = 1.05; // ~57-60 beats per minute
  const progress = (timeInSec % period) / period;
  let pulse = 0;
  let isBeatPeak = false;

  // Primary systole pulse
  if (progress < 0.16) {
    const t = progress / 0.16;
    pulse = Math.sin(t * Math.PI) * 0.18;
    if (progress > 0.06 && progress < 0.10) {
      isBeatPeak = true;
    }
  }
  // Secondary dicrotic pulse
  else if (progress > 0.22 && progress < 0.40) {
    const t = (progress - 0.22) / 0.18;
    pulse = Math.sin(t * Math.PI) * 0.09;
  }
  // Diastole relaxation with gentle harmonic breathing
  else {
    pulse = Math.sin(progress * Math.PI * 2) * 0.02;
  }

  return {
    scale: 1 + pulse,
    isBeatPeak,
  };
}
