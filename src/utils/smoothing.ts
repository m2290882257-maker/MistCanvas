import { Point, SmoothingLevel } from '../types';

/**
 * Distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

/**
 * Midpoint between two points
 */
export function getMidPoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    time: (p1.time + p2.time) / 2,
    pressure: ((p1.pressure || 0.5) + (p2.pressure || 0.5)) / 2,
  };
}

/**
 * Smooth raw stream of points by removing micro-jitters
 * based on smoothingLevel
 */
export function smoothPoints(rawPoints: Point[], level: SmoothingLevel): Point[] {
  if (rawPoints.length <= 2) return rawPoints;

  // Weight for EMA filter
  const weights: Record<SmoothingLevel, number> = {
    light: 0.25,     // minimal jitter filtering, very close to raw
    natural: 0.5,    // optimal handwriting balance, graceful curves
    high: 0.75,      // high smoothing for unsteady hands
  };

  const alpha = weights[level];
  const smoothed: Point[] = [rawPoints[0]];

  for (let i = 1; i < rawPoints.length; i++) {
    const prev = smoothed[i - 1];
    const curr = rawPoints[i];

    // Low-pass filter coordinates
    const sx = prev.x * alpha + curr.x * (1 - alpha);
    const sy = prev.y * alpha + curr.y * (1 - alpha);

    smoothed.push({
      x: sx,
      y: sy,
      time: curr.time,
      pressure: curr.pressure,
      speed: curr.speed,
    });
  }

  return smoothed;
}

/**
 * Render a smooth stroke on a Canvas 2D context using Quadratic Bezier midpoints
 */
export function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  baseWidth: number
) {
  if (points.length === 0) return;

  if (points.length === 1) {
    const p = points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, baseWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (points.length === 2) {
    const p0 = points[0];
    const p1 = points[1];
    ctx.beginPath();
    ctx.lineWidth = baseWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    return;
  }

  ctx.beginPath();
  ctx.lineWidth = baseWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
  }

  // Final segment to end point
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}
