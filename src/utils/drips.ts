import { WaterDrip, DewdropColor } from '../types';

/**
 * Creates a new water drip trickling down from an initial coordinate
 */
export function createWaterDrip(x: number, y: number, initialSize: number = 8, maxDist?: number): WaterDrip {
  const size = Math.max(4, Math.min(initialSize, 14));
  return {
    id: `drip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    x,
    y,
    vy: 1.2 + Math.random() * 1.5,
    length: 0,
    size,
    maxDistance: maxDist || 40 + Math.random() * 120,
    distanceTraveled: 0,
    opacity: 1,
    trailPoints: [{ x, y, width: size * 0.7 }],
    isFinished: false,
  };
}

/**
 * Update active water drips position and physics
 */
export function updateWaterDrips(
  drips: WaterDrip[],
  canvasHeight: number,
  speedMultiplier: number = 1
): WaterDrip[] {
  return drips
    .map(drip => {
      if (drip.isFinished) return drip;

      // Gravity acceleration with slight viscosity resistance
      const currentVy = drip.vy * speedMultiplier;
      const newY = drip.y + currentVy;
      const stepDist = currentVy;
      const newDist = drip.distanceTraveled + stepDist;

      // Slight natural jitter in horizontal flow (glass surface tension micro-variations)
      const newX = drip.x + (Math.sin(newY * 0.08) * 0.4);

      // Width gradually thins as water spreads down
      const currentWidth = Math.max(2, drip.size * (1 - (newDist / drip.maxDistance) * 0.45));

      const newTrail = [...drip.trailPoints, { x: newX, y: newY, width: currentWidth }];

      const isFinished = newDist >= drip.maxDistance || newY >= canvasHeight - 5;

      return {
        ...drip,
        x: newX,
        y: newY,
        distanceTraveled: newDist,
        trailPoints: newTrail,
        isFinished,
      };
    })
    .filter(drip => !drip.isFinished || drip.trailPoints.length > 0);
}

/**
 * Render water drip head and trickling trail directly onto clear canvas/mask
 */
export function drawDripTrailOnMask(ctx: CanvasRenderingContext2D, drip: WaterDrip) {
  if (drip.trailPoints.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(drip.trailPoints[0].x, drip.trailPoints[0].y);
  for (let i = 1; i < drip.trailPoints.length; i++) {
    const p = drip.trailPoints[i];
    ctx.lineWidth = p.width;
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Draw head droplet clearing
  const last = drip.trailPoints[drip.trailPoints.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, drip.size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render glossy water droplet & specular highlights on top overlay
 */
export function drawDripHighlights(ctx: CanvasRenderingContext2D, drip: WaterDrip) {
  if (drip.trailPoints.length === 0) return;
  const head = drip.trailPoints[drip.trailPoints.length - 1];

  ctx.save();
  // Water bead refraction & highlight
  const radius = drip.size * 0.75;

  // Soft bead drop shadow
  ctx.beginPath();
  ctx.arc(head.x, head.y + 1.5, radius * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fill();

  // Glass meniscus ring
  ctx.beginPath();
  ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Specular gleam highlight on upper edge
  ctx.beginPath();
  ctx.arc(head.x - radius * 0.3, head.y - radius * 0.35, radius * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  ctx.restore();
}

/**
 * Render decorative dewdrops / accent dots (like the yellow and red dots in the reference image)
 */
export function drawDewdropDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colorType: DewdropColor = 'crystal'
) {
  ctx.save();

  // Drop shadow on glass
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.25, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fill();

  // Color gradient
  const colorMap: Record<DewdropColor, { base: string; dark: string; rim: string }> = {
    crystal: {
      base: 'rgba(255, 255, 255, 0.4)',
      dark: 'rgba(200, 225, 245, 0.6)',
      rim: 'rgba(255, 255, 255, 0.85)',
    },
    ruby: {
      base: 'rgba(239, 68, 68, 0.88)',
      dark: 'rgba(185, 28, 28, 0.95)',
      rim: 'rgba(254, 202, 202, 0.9)',
    },
    amber: {
      base: 'rgba(234, 179, 8, 0.88)',
      dark: 'rgba(161, 98, 7, 0.95)',
      rim: 'rgba(254, 240, 138, 0.9)',
    },
    cyan: {
      base: 'rgba(6, 182, 212, 0.85)',
      dark: 'rgba(14, 116, 144, 0.95)',
      rim: 'rgba(165, 243, 252, 0.9)',
    },
  };

  const c = colorMap[colorType];
  const grad = ctx.createRadialGradient(
    x - radius * 0.2,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius
  );
  grad.addColorStop(0, c.rim);
  grad.addColorStop(0.4, c.base);
  grad.addColorStop(1, c.dark);

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Glass rim
  ctx.lineWidth = 1;
  ctx.strokeStyle = c.rim;
  ctx.stroke();

  // Specular high shine
  ctx.beginPath();
  ctx.arc(x - radius * 0.32, y - radius * 0.35, radius * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  ctx.restore();
}

/**
 * Stamp preset doodles on the glass (like the wing, sparkle, and heart in the reference image)
 */
export function drawDoodleStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'wing' | 'sparkle' | 'heart',
  size: number = 36
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = Math.max(2, size / 14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'sparkle') {
    // Four point starry sparkle (like bottom left of reference photo)
    const s = size * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.stroke();

    // Small adjacent cross
    const cs = s * 0.35;
    const cx = x - s * 0.7;
    const cy = y + s * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - cs);
    ctx.lineTo(cx, cy + cs);
    ctx.moveTo(cx - cs, cy);
    ctx.lineTo(cx + cs, cy);
    ctx.stroke();
  } else if (type === 'wing') {
    // Cute angel wing outline (like top right of reference photo)
    const scale = size / 50;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(-15 * scale, 5 * scale);
    ctx.bezierCurveTo(-10 * scale, -18 * scale, 10 * scale, -22 * scale, 25 * scale, -15 * scale);
    ctx.bezierCurveTo(30 * scale, -5 * scale, 22 * scale, 12 * scale, 8 * scale, 14 * scale);
    ctx.bezierCurveTo(-2 * scale, 15 * scale, -10 * scale, 12 * scale, -15 * scale, 5 * scale);
    // Inner swirl feather
    ctx.moveTo(10 * scale, -8 * scale);
    ctx.bezierCurveTo(15 * scale, -2 * scale, 8 * scale, 5 * scale, 0 * scale, 2 * scale);
    ctx.stroke();
  } else if (type === 'heart') {
    const s = size * 0.6;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.6, -s * 0.5, -s * 0.8, s * 0.2, 0, s * 0.8);
    ctx.bezierCurveTo(s * 0.8, s * 0.2, s * 0.6, -s * 0.5, 0, s * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}
