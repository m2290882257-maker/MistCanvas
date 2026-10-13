import React, { useState, useRef, useEffect } from 'react';
import { 
  ToolType, 
  DewdropColor, 
  CanvasSettings, 
  SmoothingLevel,
  RainSettings,
  DEFAULT_RAIN_SETTINGS
} from '../types';
import { 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Sparkle,
  ChevronLeft,
  ChevronRight,
  CloudRain
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  settings: CanvasSettings;
  updateSettings: (newSettings: Partial<CanvasSettings>) => void;
  rainSettings: RainSettings;
  updateRainSettings: (newSettings: Partial<RainSettings>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBreatheMist: () => void;
  onAddDrip: () => void;
  onOpenSettings: () => void;
  onOpenBackgrounds: () => void;
  onExport: () => void;
  onOpenReference: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  settings,
  updateSettings,
  rainSettings,
  updateRainSettings,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBreatheMist,
  onOpenSettings,
  onOpenBackgrounds,
  onExport,
  onOpenReference,
}) => {
  // Dropdown states for PAINT and STROKE
  const [isPaintHovered, setIsPaintHovered] = useState(false);
  const [isStrokeHovered, setIsStrokeHovered] = useState(false);
  const [hoveredSubTool, setHoveredSubTool] = useState<ToolType | null>(null);

  // Pagination for STROKE menu: 'stroke' | 'rain' (only when rainSettings.enabled)
  const [strokePage, setStrokePage] = useState<'stroke' | 'rain'>('stroke');

  // If Rain Effect is disabled while on Rain page, automatically return to Stroke page
  useEffect(() => {
    if (!rainSettings.enabled && strokePage === 'rain') {
      setStrokePage('stroke');
    }
  }, [rainSettings.enabled, strokePage]);

  const paintMenuRef = useRef<HTMLDivElement>(null);
  const strokeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click if opened on touch devices
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        paintMenuRef.current && 
        !paintMenuRef.current.contains(e.target as Node) &&
        strokeMenuRef.current &&
        !strokeMenuRef.current.contains(e.target as Node)
      ) {
        setIsPaintHovered(false);
        setIsStrokeHovered(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, []);

  // Sub-items for PAINT menu according to user request:
  const isZh = settings.language === 'zh';

  // WIPE, DRIP, DEWDROP, WINGS, SPARKLE, HEART, STEAM
  const paintSubItems: { id: ToolType; num: string; label: string; desc: string }[] = [
    { id: 'wipe', num: '01', label: 'WIPE', desc: isZh ? '水雾擦除' : 'Fingertip Mist Removal' },
    { id: 'drip', num: '02', label: 'DRIP', desc: isZh ? '水痕流淌' : 'Trickle Water Trail' },
    { id: 'dewdrop', num: '03', label: 'DEWDROP', desc: isZh ? '露珠点缀' : 'Crystal Droplet Stamp' },
    { id: 'wing', num: '04', label: 'WINGS', desc: isZh ? '羽翼涂鸦' : 'Angel Wing Doodle' },
    { id: 'sparkle', num: '05', label: 'SPARKLE', desc: isZh ? '四角星光' : 'Starry Shine Doodle' },
    { id: 'heart', num: '06', label: 'HEART', desc: isZh ? '暖心印记' : 'Warm Heart Stamp' },
    { id: 'steam', num: '07', label: 'STEAM', desc: isZh ? '局部补雾' : 'Re-condense Mist Pen' },
  ];

  return (
    <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none pointer-events-auto">
      
      {/* ========================================================
          DROPDOWN 1: PAINT SUB-MENU (Directly matching image.png)
         ======================================================== */}
      {isPaintHovered && (
        <div 
          ref={paintMenuRef}
          onMouseEnter={() => setIsPaintHovered(true)}
          onMouseLeave={() => setIsPaintHovered(false)}
          className="absolute bottom-full mb-4 left-6 sm:left-14 flex flex-col items-start z-50 animate-fade-in"
        >
          {/* Ethereal soft diffuse white glow backdrop behind the list matching image.png */}
          <div className="absolute -inset-4 bg-white/40 rounded-3xl blur-2xl pointer-events-none" />
          <div className="absolute -inset-8 bg-white/20 rounded-full blur-3xl pointer-events-none" />

          {/* Submenu Item Stack */}
          <div className="relative flex flex-col items-start gap-1 py-3 px-4 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_10px_rgba(255,255,255,0.7),0_15px_35px_rgba(0,0,0,0.35)] border border-white min-w-[190px]">
            {paintSubItems.map((item) => {
              const isActive = activeTool === item.id;
              const isHovered = hoveredSubTool === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTool(item.id);
                    setIsPaintHovered(false);
                  }}
                  onMouseEnter={() => setHoveredSubTool(item.id)}
                  onMouseLeave={() => setHoveredSubTool(null)}
                  className={`group relative flex items-center gap-2 py-1.5 px-2.5 w-full rounded-lg text-left transition-all duration-150 ${
                    isActive 
                      ? 'text-neutral-950 font-bold bg-neutral-900/5' 
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-900/5'
                  }`}
                >
                  {/* Superscript editorial numbering matching image.png (e.g. ⁰¹, ⁰², ⁰³) */}
                  <span className="font-mono text-[9px] font-bold text-neutral-400 group-hover:text-neutral-700 w-3.5 tracking-tight">
                    {item.num}
                  </span>

                  {/* Tool Label in crisp uppercase monospace */}
                  <span className="font-mono text-xs tracking-[0.16em] uppercase font-bold text-neutral-900">
                    {item.label}
                  </span>

                  {/* Cursor Arrow Pointer from image.png (pointing to hovered/active item) */}
                  {(isActive || isHovered) && (
                    <span className="ml-auto text-neutral-900 drop-shadow-sm transition-transform duration-150 animate-pulse">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M4 2l16 11-7 1.5-4 7.5L4 2z" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          DROPDOWN 2: STROKE & EFFECT ADJUSTMENT PANEL
         ======================================================== */}
      {isStrokeHovered && (
        <div 
          ref={strokeMenuRef}
          onMouseEnter={() => setIsStrokeHovered(true)}
          onMouseLeave={() => setIsStrokeHovered(false)}
          className="absolute bottom-full mb-4 left-1/3 -translate-x-1/2 flex flex-col items-start z-50 animate-fade-in"
        >
          {/* Ethereal soft diffuse glow */}
          <div className="absolute -inset-4 bg-white/40 rounded-3xl blur-2xl pointer-events-none" />
          
          <div className="relative p-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_10px_rgba(255,255,255,0.7),0_15px_35px_rgba(0,0,0,0.35)] border border-white text-neutral-900 w-[280px] space-y-3.5 transition-all duration-200">
            {/* Header pagination when Rain Effect is enabled */}
            {rainSettings.enabled && (
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 text-[11px] font-mono font-bold tracking-wider">
                {strokePage === 'stroke' ? (
                  <>
                    <span className="text-neutral-900 uppercase">
                      {isZh ? 'STROKE · 笔触设置' : 'PAGE 1 · STROKE'}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Dots indicator */}
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      </div>
                      {/* Next button */}
                      <button
                        onClick={() => setStrokePage('rain')}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors text-[10px] uppercase font-bold"
                        title={isZh ? '切换至雨滴控制面板' : 'Switch to Rain Controls'}
                      >
                        <span>{isZh ? '雨滴' : 'RAIN'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Prev button */}
                    <button
                      onClick={() => setStrokePage('stroke')}
                      className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors text-[10px] uppercase font-bold"
                      title={isZh ? '返回笔触设置' : 'Return to Stroke'}
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>{isZh ? '笔触' : 'STROKE'}</span>
                    </button>
                    <div className="flex items-center gap-1 text-neutral-900 uppercase">
                      <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                      <span>{isZh ? '雨滴控制' : 'PAGE 2 · RAIN'}</span>
                    </div>
                    {/* Dots indicator */}
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PAGE 1: STROKE SETTINGS */}
            {(!rainSettings.enabled || strokePage === 'stroke') && (
              <div className="space-y-3.5 animate-fade-in">
                {/* 1. Brush Width */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'STROKE WIDTH · 笔触粗细' : 'STROKE WIDTH'}</span>
                    <span>{settings.brushSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="75"
                    value={settings.brushSize}
                    onChange={(e) => updateSettings({ brushSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                </div>

                {/* 2. Background Blur Degree */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'BACKGROUND BLUR · 虚化' : 'BACKGROUND BLUR'}</span>
                    <span>{settings.backgroundBlur}PX</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    value={settings.backgroundBlur}
                    onChange={(e) => updateSettings({ backgroundBlur: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                </div>

                {/* 3. Mist Density */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'MIST DENSITY · 水雾浓度' : 'MIST DENSITY'}</span>
                    <span>{Math.round(settings.mistDensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={settings.mistDensity}
                    onChange={(e) => updateSettings({ mistDensity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                </div>

                {/* 4. Drip Water Trail Density (水痕密度调节) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span className="flex items-center gap-1">
                      <span>{isZh ? 'DRIP DENSITY' : 'DRIP DENSITY'}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-neutral-100 text-neutral-500 rounded font-normal">
                        {isZh ? '水痕密度' : 'WATER TRAIL'}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {isZh 
                        ? (settings.dripDensity <= 0.25 ? '低' : settings.dripDensity >= 0.75 ? '高' : '中')
                        : (settings.dripDensity <= 0.25 ? 'LOW' : settings.dripDensity >= 0.75 ? 'HIGH' : 'MED')} ({Math.round((settings.dripDensity ?? 0.45) * 100)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.dripDensity ?? 0.45}
                    onChange={(e) => updateSettings({ dripDensity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '稀疏 (10%)' : 'SUBTLE (10%)'}</span>
                    <span>{isZh ? '密集 (100%)' : 'DENSE (100%)'}</span>
                  </div>
                </div>

                {/* 5. Smoothing Level */}
                <div>
                  <div className="text-[11px] font-mono font-bold tracking-wider uppercase mb-1.5">
                    {isZh ? 'SMOOTHING · 防抖平滑' : 'SMOOTHING LEVEL'}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['light', 'natural', 'high'] as SmoothingLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => updateSettings({ smoothingLevel: lvl })}
                        className={`py-1 text-[10px] font-mono font-bold uppercase rounded-md border transition-all ${
                          settings.smoothingLevel === lvl
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:text-neutral-900'
                        }`}
                      >
                        {isZh ? (lvl === 'light' ? '轻微' : lvl === 'natural' ? '自然' : '强力') : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Dewdrop Color Swatches (if dewdrop selected) */}
                {activeTool === 'dewdrop' && (
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5">
                      DEWDROP COLOR
                    </div>
                    <div className="flex items-center gap-2">
                      {(['crystal', 'ruby', 'amber', 'cyan'] as DewdropColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSettings({ dewdropColor: c })}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            settings.dewdropColor === c ? 'scale-125 ring-2 ring-neutral-900' : 'opacity-60 hover:opacity-100'
                          } ${
                            c === 'crystal' ? 'bg-sky-200 border-sky-300' :
                            c === 'ruby' ? 'bg-rose-500 border-rose-400' :
                            c === 'amber' ? 'bg-amber-400 border-amber-300' :
                            'bg-cyan-400 border-cyan-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 2: RAIN CONTROLS (7 Exact Parameters) */}
            {rainSettings.enabled && strokePage === 'rain' && (
              <div className="space-y-3 animate-fade-in max-h-[360px] overflow-y-auto pr-0.5 scrollbar-thin">
                {/* 1. Rain Rate: 0 - 3, default 1.0 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'RAIN RATE · 出现频率' : 'RAIN RATE'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{rainSettings.rainRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.05"
                    value={rainSettings.rainRate}
                    onChange={(e) => updateRainSettings({ rainRate: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '停止 (0x)' : 'STOP (0x)'}</span>
                    <span>{isZh ? '频繁 (3x)' : 'FAST (3x)'}</span>
                  </div>
                </div>

                {/* 2. Rain Density: 0 - 1, default 0.65 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'RAIN DENSITY · 空间密度' : 'RAIN DENSITY'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{Math.round(rainSettings.rainDensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rainSettings.rainDensity}
                    onChange={(e) => updateRainSettings({ rainDensity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '稀落 (0%)' : 'SPARSE (0%)'}</span>
                    <span>{isZh ? '密集 (100%)' : 'DENSE (100%)'}</span>
                  </div>
                </div>

                {/* 3. Drop Size: 0.3 - 2.5, default 1.0 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'DROP SIZE · 雨滴大小' : 'DROP SIZE'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{rainSettings.dropSize.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.05"
                    value={rainSettings.dropSize}
                    onChange={(e) => updateRainSettings({ dropSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '细小 (0.3x)' : 'SMALL (0.3x)'}</span>
                    <span>{isZh ? '饱满 (2.5x)' : 'LARGE (2.5x)'}</span>
                  </div>
                </div>

                {/* 4. Trail Density: 0 - 1, default 0.75 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'TRAIL DENSITY · 水痕密度' : 'TRAIL DENSITY'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{Math.round(rainSettings.trailDensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rainSettings.trailDensity}
                    onChange={(e) => updateRainSettings({ trailDensity: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '无拖尾 (0%)' : 'NONE (0%)'}</span>
                    <span>{isZh ? '明显水痕 (100%)' : 'HIGH (100%)'}</span>
                  </div>
                </div>

                {/* 5. Slide Speed: 0 - 3, default 1.0 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'SLIDE SPEED · 滑落速度' : 'SLIDE SPEED'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{rainSettings.slideSpeed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.05"
                    value={rainSettings.slideSpeed}
                    onChange={(e) => updateRainSettings({ slideSpeed: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '静止 (0x)' : 'STILL (0x)'}</span>
                    <span>{isZh ? '疾速 (3x)' : 'FAST (3x)'}</span>
                  </div>
                </div>

                {/* 6. Trail Length: 0.3 - 1.5, default 1.0 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'TRAIL LENGTH · 水痕长度' : 'TRAIL LENGTH'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{rainSettings.trailLength.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.05"
                    value={rainSettings.trailLength}
                    onChange={(e) => updateRainSettings({ trailLength: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '较短 (0.3x)' : 'SHORT (0.3x)'}</span>
                    <span>{isZh ? '深长 (1.5x)' : 'LONG (1.5x)'}</span>
                  </div>
                </div>

                {/* 7. Refraction: 0 - 2, default 1.0 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                    <span>{isZh ? 'REFRACTION · 折射强度' : 'REFRACTION'}</span>
                    <span className="tabular-nums text-sky-700 font-bold">{rainSettings.refraction.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={rainSettings.refraction}
                    onChange={(e) => updateRainSettings({ refraction: Number(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5">
                    <span>{isZh ? '平滑 (0x)' : 'FLAT (0x)'}</span>
                    <span>{isZh ? '强折射 (2x)' : 'STRONG (2x)'}</span>
                  </div>
                </div>

                {/* Reset Defaults button */}
                <div className="pt-2 border-t border-neutral-200/80 flex justify-end">
                  <button
                    onClick={() => updateRainSettings({
                      rainRate: DEFAULT_RAIN_SETTINGS.rainRate,
                      rainDensity: DEFAULT_RAIN_SETTINGS.rainDensity,
                      dropSize: DEFAULT_RAIN_SETTINGS.dropSize,
                      trailDensity: DEFAULT_RAIN_SETTINGS.trailDensity,
                      slideSpeed: DEFAULT_RAIN_SETTINGS.slideSpeed,
                      trailLength: DEFAULT_RAIN_SETTINGS.trailLength,
                      refraction: DEFAULT_RAIN_SETTINGS.refraction,
                    })}
                    className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 transition-colors underline"
                  >
                    {isZh ? '恢复雨滴默认参数' : 'Reset rain defaults'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MAIN LUMINOUS CAPSULE BAR (High-Diffusion Aesthetic from image.png)
         ======================================================== */}
      <div className="relative group">
        {/* Layer 1: Enhanced Wide Dispersion Aura (加强边缘弥散效果) */}
        <div className="absolute -inset-6 sm:-inset-10 bg-white/40 rounded-full blur-3xl pointer-events-none transition-all duration-300" />
        
        {/* Layer 2: Intermediate Intense Halo (加强弥散白光) */}
        <div className="absolute -inset-2.5 sm:-inset-4 bg-white/70 rounded-full blur-2xl pointer-events-none transition-all duration-300" />

        {/* Layer 3: Soft Edge Diffusion Ring */}
        <div className="absolute -inset-1 bg-white/90 rounded-full blur-md pointer-events-none" />

        {/* Central Pure White Capsule Bar */}
        <div className="relative flex items-center bg-white/95 backdrop-blur-2xl rounded-full px-4 sm:px-8 py-2.5 sm:py-3.5 shadow-[0_0_80px_22px_rgba(255,255,255,0.75),0_15px_45px_rgba(0,0,0,0.5)] border border-white">
          <div className="flex items-center gap-3 sm:gap-7 overflow-x-auto scrollbar-none py-0.5">
            
            {/* 1. PAINT (Hover to show WIPE / DRIP / DEWDROP / WINGS / SPARKLE / HEART) */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setIsPaintHovered(true);
                setIsStrokeHovered(false);
              }}
            >
              <button
                onClick={() => setIsPaintHovered(!isPaintHovered)}
                className={`flex items-center gap-1.5 py-1 px-2 rounded-full font-mono font-bold tracking-[0.16em] uppercase text-xs sm:text-[13px] transition-all select-none ${
                  isPaintHovered || ['wipe', 'drip', 'dewdrop', 'wing', 'sparkle', 'heart', 'steam'].includes(activeTool)
                    ? 'text-neutral-900 font-extrabold'
                    : 'text-neutral-800 hover:text-neutral-950'
                }`}
              >
                <span>PAINT</span>
                {/* Count badge like "WORKS 4" in image.png */}
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400">
                  {paintSubItems.findIndex(i => i.id === activeTool) >= 0 
                    ? `0${paintSubItems.findIndex(i => i.id === activeTool) + 1}` 
                    : '6'}
                </span>
              </button>
            </div>

            {/* 2. STROKE (Stroke Size & Adjustments Panel) */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setIsStrokeHovered(true);
                setIsPaintHovered(false);
              }}
            >
              <button
                onClick={() => setIsStrokeHovered(!isStrokeHovered)}
                className="flex items-center gap-1.5 py-1 px-2 rounded-full font-mono font-bold tracking-[0.16em] uppercase text-xs sm:text-[13px] text-neutral-800 hover:text-neutral-950 transition-all select-none"
              >
                <span>STROKE</span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400">
                  {settings.brushSize}
                </span>
              </button>
            </div>

            {/* 3. BREATHE (哈气起雾 - Breathe mist re-condensation) */}
            <button
              onClick={onBreatheMist}
              className="py-1 px-2 rounded-full font-mono font-bold tracking-[0.16em] uppercase text-xs sm:text-[13px] text-neutral-800 hover:text-neutral-950 active:scale-95 transition-all select-none whitespace-nowrap"
              title={isZh ? '哈气起雾 · 重新在玻璃表面凝聚水雾' : 'Exhale warm mist to re-fog the glass'}
            >
              BREATHE
            </button>

            {/* 4. BACKGROUND (更换背景与模式 - Change preset, scene mode or upload image) */}
            <button
              onClick={onOpenBackgrounds}
              className="py-1 px-2 rounded-full font-mono font-bold tracking-[0.16em] uppercase text-xs sm:text-[13px] text-neutral-800 hover:text-neutral-950 active:scale-95 transition-all select-none whitespace-nowrap"
              title={isZh ? '模式与背景 · 切换车窗/高铁/居室情境画框与壁纸' : 'Mode & Background · Switch car, train, home window frames & wallpapers'}
            >
              BACKGROUND
            </button>

            {/* 5. DOWNLOAD (保存下载作品) */}
            <button
              onClick={onExport}
              className="py-1 px-2 rounded-full font-mono font-bold tracking-[0.16em] uppercase text-xs sm:text-[13px] text-neutral-800 hover:text-neutral-950 active:scale-95 transition-all select-none whitespace-nowrap"
              title={isZh ? '保存下载高清玻璃艺术画' : 'Export high-resolution artwork'}
            >
              DOWNLOAD
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-neutral-300 mx-2 sm:mx-3 shrink-0" />

          {/* Quick Undo / Redo & Settings */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 rounded-full transition-colors ${
                canUndo ? 'text-neutral-800 hover:text-neutral-950' : 'text-neutral-300 cursor-not-allowed'
              }`}
              title={isZh ? '撤销 (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 rounded-full transition-colors ${
                canRedo ? 'text-neutral-800 hover:text-neutral-950' : 'text-neutral-300 cursor-not-allowed'
              }`}
              title={isZh ? '重做 (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1 rounded-full text-neutral-700 hover:text-neutral-950 transition-colors ml-1"
              title={isZh ? '画布比例、语言切换与系统设置' : 'Aspect ratio, language & canvas settings'}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
