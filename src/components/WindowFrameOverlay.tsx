import React from 'react';
import { WindowMode } from '../types';

interface WindowFrameOverlayProps {
  mode: WindowMode;
}

export const WindowFrameOverlay: React.FC<WindowFrameOverlayProps> = ({ mode }) => {
  if (mode === 'none') return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ======================================================== */}
      {/* 1. CAR WINDOW MODE (汽车车窗)                             */}
      {/* ======================================================== */}
      {mode === 'car' && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top: Sloping roof liner, A-pillar header & dark sun tint band */}
          <div className="w-full relative shrink-0">
            {/* Dark automotive headliner */}
            <div className="h-7 sm:h-9 md:h-12 w-full bg-gradient-to-b from-[#0e0f12] via-[#141519] to-[#1a1b20] border-b border-[#282a32] shadow-lg flex items-center justify-between px-6">
              {/* Subtle roof trim seam */}
              <div className="w-full h-px bg-white/5 border-t border-dashed border-white/10" />
            </div>

            {/* Aerodynamic glass sun-tint strip gradient inside the top of the glass */}
            <div className="h-10 sm:h-14 md:h-18 w-full bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none" />
          </div>

          {/* Left & Right Door Pillars / Weatherstripping Frame */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {/* Left Pillar Frame */}
            <div className="w-5 sm:w-8 md:w-12 h-full bg-gradient-to-r from-[#0d0e11] via-[#131418] to-transparent border-r border-black/40 flex flex-col justify-between py-12">
              <div className="h-full w-2 sm:w-3 ml-auto bg-[#0a0a0d] border-l border-white/5 opacity-80" />
            </div>

            {/* Right B-Pillar Frame */}
            <div className="w-5 sm:w-8 md:w-12 h-full bg-gradient-to-l from-[#0d0e11] via-[#131418] to-transparent border-l border-black/40 flex flex-col justify-between py-12">
              <div className="h-full w-2 sm:w-3 mr-auto bg-[#0a0a0d] border-r border-white/5 opacity-80" />
            </div>
          </div>

          {/* Inner perimeter rubber weatherstrip gasket surrounding the glass */}
          <div className="absolute inset-x-4 sm:inset-x-7 md:inset-x-11 top-6 sm:top-8 md:top-11 bottom-10 sm:bottom-14 md:bottom-18 rounded-t-2xl sm:rounded-t-3xl rounded-b-md border-[5px] sm:border-[8px] md:border-[10px] border-[#0a0b0d] shadow-[inset_0_4px_16px_rgba(0,0,0,0.85),_0_0_0_1px_rgba(255,255,255,0.08)] pointer-events-none">
            {/* Subtle inner highlight bead on the rubber seal */}
            <div className="w-full h-full rounded-t-xl rounded-b-sm border border-white/[0.06] shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]" />

            {/* Corner Automotive Glass Etching (Micro DOT safety print) */}
            <div className="absolute bottom-2.5 right-3 text-[8px] sm:text-[9px] font-mono tracking-widest text-white/35 drop-shadow-sm select-none pointer-events-none flex flex-col items-end leading-tight">
              <span>◬ TEMPERED AUTO GLASS</span>
              <span className="opacity-70">DOT-615 AS2 · E4 43R-00812</span>
            </div>
          </div>

          {/* Bottom: Car Door Interior Trim, Window Sill & Window Switch */}
          <div className="w-full relative shrink-0 z-30">
            {/* Armrest / Upper Door Trim with leather grain effect */}
            <div className="h-10 sm:h-14 md:h-18 w-full bg-gradient-to-b from-[#1b1c21] via-[#131418] to-[#0d0e11] border-t-2 border-[#2b2d36] shadow-[0_-8px_24px_rgba(0,0,0,0.8)] px-5 sm:px-10 flex items-center justify-between">
              {/* Twin decorative interior stitch line */}
              <div className="hidden sm:flex items-center gap-1 opacity-25">
                <div className="w-20 md:w-32 h-px bg-white border-t border-dashed border-white/60" />
              </div>

              {/* Window Power Lift Switch Toggle */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0e0f13] border border-white/10 shadow-inner">
                <div className="w-4 sm:w-5 h-2 sm:h-2.5 rounded-sm bg-[#1e2027] border border-white/15 flex items-center justify-center">
                  <span className="text-[6px] sm:text-[7px] font-mono text-neutral-400 font-bold">▲</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                  WINDOW
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              </div>

              {/* Right decorative stitch */}
              <div className="hidden sm:flex items-center gap-1 opacity-25">
                <div className="w-20 md:w-32 h-px bg-white border-t border-dashed border-white/60" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HIGH-SPEED TRAIN / BULLET TRAIN MODE (动车高铁车窗)      */}
      {/* ======================================================== */}
      {mode === 'train' && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top: High-speed rail aerodynamic acoustic ceiling & blind track */}
          <div className="w-full relative shrink-0 z-20">
            <div className="h-8 sm:h-11 md:h-14 w-full bg-gradient-to-b from-[#cdd2da] via-[#dbe0e7] to-[#e4e8ee] border-b border-[#b2b7c0] shadow-md px-6 sm:px-12 flex items-center justify-between">
              {/* Train Seat Indicator */}
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-black/10 border border-black/10">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-neutral-700">
                  CRH · 08F (靠窗)
                </span>
              </div>

              {/* Centered Sunblind Cassette & Pull Notch */}
              <div className="flex items-center gap-1.5">
                <div className="w-24 sm:w-44 h-1 rounded-full bg-[#9da3ad]/70 shadow-inner" />
                <div className="w-3.5 h-2 rounded-sm bg-[#8c929d] border border-white/40 shadow-sm" />
                <div className="w-24 sm:w-44 h-1 rounded-full bg-[#9da3ad]/70 shadow-inner" />
              </div>

              <div className="text-[9px] font-mono text-neutral-500 hidden sm:block">
                EMU EXPRESS 350km/h
              </div>
            </div>
          </div>

          {/* Train Sides: Acoustic Wall Shell */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {/* Left train wall */}
            <div className="w-6 sm:w-10 md:w-16 h-full bg-gradient-to-r from-[#d2d7df] via-[#dbe0e7] to-transparent shadow-lg flex items-center pl-2">
              <div className="w-0.5 h-3/4 bg-black/10 rounded-full" />
            </div>

            {/* Right train wall */}
            <div className="w-6 sm:w-10 md:w-16 h-full bg-gradient-to-l from-[#d2d7df] via-[#dbe0e7] to-transparent shadow-lg flex items-center justify-end pr-2">
              <div className="w-0.5 h-3/4 bg-black/10 rounded-full" />
            </div>
          </div>

          {/* Deep Iconic Rounded-Corner Train Window Aperture & Aluminum Rim */}
          <div className="absolute inset-x-5 sm:inset-x-9 md:inset-x-15 top-8 sm:top-10 md:top-13 bottom-12 sm:bottom-16 md:bottom-20 rounded-[28px] sm:rounded-[42px] md:rounded-[54px] border-[6px] sm:border-[10px] md:border-[14px] border-[#c4c9d2] shadow-[inset_0_6px_22px_rgba(0,0,0,0.8),_0_0_0_2px_rgba(255,255,255,0.7),_0_12px_28px_rgba(0,0,0,0.35)] pointer-events-none">
            {/* Brushed Inner Composite Trim Ring */}
            <div className="w-full h-full rounded-[22px] sm:rounded-[34px] md:rounded-[44px] border-[2px] sm:border-[3px] border-[#8a919e]/40 shadow-[inset_0_0_16px_rgba(0,0,0,0.75)] relative">
              {/* Corner High-speed Rail Safety Etching */}
              <div className="absolute bottom-3 left-4 text-[8px] sm:text-[9px] font-mono tracking-widest text-white/40 drop-shadow select-none pointer-events-none">
                <span>CRH LAMINATED ACOUSTIC · GB9656</span>
              </div>
            </div>
          </div>

          {/* Bottom: Molded High-Speed Rail Utility Window Sill (动车置物窗台) */}
          <div className="w-full relative shrink-0 z-20">
            <div className="h-11 sm:h-15 md:h-20 w-full bg-gradient-to-b from-[#e3e7ee] via-[#d6dbe3] to-[#c5cbd4] border-t-2 border-[#f0f4f9] shadow-[0_-6px_20px_rgba(0,0,0,0.3)] px-6 sm:px-14 flex items-center justify-between">
              {/* Cup Coaster Ring / Beverage Recess */}
              <div className="flex items-center gap-3">
                <div className="w-7 sm:w-10 h-7 sm:h-10 rounded-full bg-gradient-to-br from-[#bcc3cd] to-[#e6eaf0] border border-[#9ca4b0] shadow-inner flex items-center justify-center">
                  <div className="w-4 sm:w-6 h-4 sm:h-6 rounded-full border border-black/15 flex items-center justify-center text-[9px] text-neutral-600">
                    ☕
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-mono font-bold text-neutral-700">BEVERAGE HOLDER</div>
                  <div className="text-[8px] font-mono text-neutral-500">MAX 500ml</div>
                </div>
              </div>

              {/* Phone / Device dock groove */}
              <div className="w-28 sm:w-44 md:w-56 h-2 sm:h-2.5 rounded-full bg-[#aeb5c0] border border-white/60 shadow-inner" />

              {/* Emergency info subtle print */}
              <div className="text-[8px] sm:text-[9px] font-mono text-neutral-500 text-right">
                <span className="block font-bold text-neutral-700">EMERGENCY EXIT</span>
                <span className="hidden sm:inline">HAMMER NEAR PILLAR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. COZY HOME WINDOW MODE (家中的窗口 / 居室木窗)            */}
      {/* ======================================================== */}
      {mode === 'home' && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top: Rich warm cedar/oak architectural upper casing */}
          <div className="w-full relative shrink-0 z-20">
            <div className="h-8 sm:h-10 md:h-13 w-full bg-gradient-to-b from-[#2e1c12] via-[#3a2519] to-[#483021] border-b-2 border-[#5a3e2b] shadow-xl px-6 flex items-center justify-between">
              {/* Woodgrain subtle horizontal bands */}
              <div className="w-full h-px bg-amber-400/10 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            </div>
          </div>

          {/* Left & Right: Wooden Window Stiles & 45-degree miter corner trims */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {/* Left wooden jamb */}
            <div className="w-5 sm:w-8 md:w-12 h-full bg-gradient-to-r from-[#29180f] via-[#3d271a] to-[#4d3222] border-r border-[#20130b] shadow-2xl flex flex-col justify-between">
              {/* Corner 45-degree miter joint line top */}
              <div className="w-full h-8 border-b border-black/50 rotate-45 origin-top-left opacity-30" />
              {/* Corner 45-degree miter joint line bottom */}
              <div className="w-full h-8 border-t border-black/50 -rotate-45 origin-bottom-left opacity-30" />
            </div>

            {/* Right wooden jamb */}
            <div className="w-5 sm:w-8 md:w-12 h-full bg-gradient-to-l from-[#29180f] via-[#3d271a] to-[#4d3222] border-l border-[#20130b] shadow-2xl flex flex-col justify-between">
              {/* Corner 45-degree miter joint line top */}
              <div className="w-full h-8 border-b border-black/50 -rotate-45 origin-top-right opacity-30" />
              {/* Corner 45-degree miter joint line bottom */}
              <div className="w-full h-8 border-t border-black/50 rotate-45 origin-bottom-right opacity-30" />
            </div>
          </div>

          {/* Wooden Sash Bezel & Glass Stops with warm amber indoor bounce light */}
          <div className="absolute inset-x-4 sm:inset-x-7 md:inset-x-11 top-7 sm:top-9 md:top-12 bottom-12 sm:bottom-16 md:bottom-20 rounded-md sm:rounded-lg border-[6px] sm:border-[10px] md:border-[14px] border-[#382317] shadow-[inset_0_6px_22px_rgba(0,0,0,0.85),_0_0_0_1px_rgba(255,200,140,0.15)] pointer-events-none">
            {/* Inner beveled timber stop */}
            <div className="w-full h-full rounded-sm border border-black/60 shadow-[inset_0_0_16px_rgba(0,0,0,0.8)] relative">
              {/* Antique Brass Sash Window Latch / Rotary Lock on Right Frame */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 sm:-right-4.5 w-6 sm:w-8 h-10 sm:h-14 rounded-md bg-gradient-to-br from-[#c89b53] via-[#946e31] to-[#5a3f18] border border-[#e1b76e] shadow-lg flex flex-col items-center justify-around py-1.5 opacity-90">
                <div className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-[#463114] border border-[#e8c47f] shadow-inner" />
                <div className="w-1.5 h-3 sm:h-4 rounded bg-[#e8c47f] shadow" />
              </div>

              {/* Warm Indoor Amber Rim Glow at the bottom of the glass */}
              <div className="absolute bottom-0 inset-x-0 h-10 sm:h-14 bg-gradient-to-t from-amber-500/15 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Bottom: Deep Polished Wooden Windowsill (飘窗窗台板) */}
          <div className="w-full relative shrink-0 z-20">
            <div className="h-12 sm:h-16 md:h-22 w-full bg-gradient-to-b from-[#4e3423] via-[#3a2417] to-[#25150d] border-t-[3px] border-[#734e34] shadow-[0_-8px_28px_rgba(0,0,0,0.7)] px-6 sm:px-14 flex items-center justify-between">
              {/* Natural Timber grain highlights */}
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-[10px] sm:text-[11px] font-serif italic text-amber-200/80 tracking-wider">
                  Warm indoor sanctuary · 窗前微雨
                </span>
              </div>

              {/* Ledge depth highlight */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-20 md:w-36 h-1 rounded bg-amber-400/10" />
                <span className="text-[9px] font-mono text-neutral-400/60 uppercase">
                  OAK TIMBER CASING
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Draws the selected window frame onto a target 2D canvas (for high-res export)
 */
export function drawWindowFrameOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: WindowMode
) {
  if (mode === 'none') return;

  ctx.save();

  if (mode === 'car') {
    // 1. CAR MODE EXPORT DRAWING
    const topH = Math.round(height * 0.05);
    const bottomH = Math.round(height * 0.08);
    const sideW = Math.round(width * 0.04);

    // Top tint visor on glass
    const tintGrad = ctx.createLinearGradient(0, topH, 0, topH + height * 0.15);
    tintGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    tintGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    tintGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tintGrad;
    ctx.fillRect(sideW, topH, width - sideW * 2, height * 0.15);

    // Outer door body panels
    ctx.fillStyle = '#111215';
    // Top
    ctx.fillRect(0, 0, width, topH);
    // Bottom
    ctx.fillStyle = '#16171c';
    ctx.fillRect(0, height - bottomH, width, bottomH);
    // Left
    ctx.fillStyle = '#111215';
    ctx.fillRect(0, 0, sideW, height);
    // Right
    ctx.fillRect(width - sideW, 0, sideW, height);

    // Rubber weatherstrip border
    ctx.strokeStyle = '#0a0b0d';
    ctx.lineWidth = Math.max(6, Math.round(width * 0.012));
    ctx.strokeRect(sideW, topH, width - sideW * 2, height - topH - bottomH);

    // Bottom Armrest accent line
    ctx.strokeStyle = '#2d2f38';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - bottomH);
    ctx.lineTo(width, height - bottomH);
    ctx.stroke();

    // Corner safety mark
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.textAlign = 'right';
    ctx.fillText('◬ TEMPERED AUTO GLASS · E4 43R', width - sideW - 14, height - bottomH - 12);
  } else if (mode === 'train') {
    // 2. HIGH SPEED TRAIN MODE EXPORT DRAWING
    const topH = Math.round(height * 0.06);
    const bottomH = Math.round(height * 0.09);
    const sideW = Math.round(width * 0.05);

    // Outer train wall composite
    ctx.fillStyle = '#dbe0e7';
    // Top
    ctx.fillRect(0, 0, width, topH);
    // Bottom sill
    ctx.fillStyle = '#d1d6df';
    ctx.fillRect(0, height - bottomH, width, bottomH);
    // Left
    ctx.fillStyle = '#dbe0e7';
    ctx.fillRect(0, 0, sideW, height);
    // Right
    ctx.fillRect(width - sideW, 0, sideW, height);

    // Train Rounded Aperture Bezel
    const r = Math.min(48, Math.round(width * 0.04));
    const wx = sideW;
    const wy = topH;
    const ww = width - sideW * 2;
    const wh = height - topH - bottomH;

    ctx.strokeStyle = '#c4c9d2';
    ctx.lineWidth = Math.max(8, Math.round(width * 0.015));
    ctx.beginPath();
    ctx.roundRect(wx, wy, ww, wh, r);
    ctx.stroke();

    // Sill divider line
    ctx.strokeStyle = '#f4f7fb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - bottomH);
    ctx.lineTo(width, height - bottomH);
    ctx.stroke();

    // Train Safety marking
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'left';
    ctx.fillText('CRH LAMINATED ACOUSTIC · GB9656', sideW + 20, height - bottomH - 14);
  } else if (mode === 'home') {
    // 3. HOME WINDOW MODE EXPORT DRAWING
    const topH = Math.round(height * 0.06);
    const bottomH = Math.round(height * 0.1);
    const sideW = Math.round(width * 0.045);

    // Timber frame
    ctx.fillStyle = '#3a2519';
    // Top
    ctx.fillRect(0, 0, width, topH);
    // Bottom Windowsill
    ctx.fillStyle = '#4e3423';
    ctx.fillRect(0, height - bottomH, width, bottomH);
    // Left
    ctx.fillStyle = '#3a2519';
    ctx.fillRect(0, 0, sideW, height);
    // Right
    ctx.fillRect(width - sideW, 0, sideW, height);

    // Inner wooden reveal
    ctx.strokeStyle = '#29180f';
    ctx.lineWidth = Math.max(8, Math.round(width * 0.012));
    ctx.strokeRect(sideW, topH, width - sideW * 2, height - topH - bottomH);

    // Windowsill edge highlight
    ctx.strokeStyle = '#734e34';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - bottomH);
    ctx.lineTo(width, height - bottomH);
    ctx.stroke();

    // Soft warm ambient bottom glow
    const warmGrad = ctx.createLinearGradient(0, height - bottomH - 60, 0, height - bottomH);
    warmGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    warmGrad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
    ctx.fillStyle = warmGrad;
    ctx.fillRect(sideW, height - bottomH - 60, width - sideW * 2, 60);
  }

  ctx.restore();
}
