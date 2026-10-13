import React from 'react';
import { 
  AspectRatioType, 
  CanvasSettings, 
  SmoothingLevel 
} from '../types';
import { 
  X, 
  Monitor, 
  Smartphone, 
  Maximize2, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Trash2,
  Droplet
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatioType;
  setAspectRatio: (ratio: AspectRatioType) => void;
  settings: CanvasSettings;
  updateSettings: (newSettings: Partial<CanvasSettings>) => void;
  onClearToGlass: () => void;
  onBreatheMist: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  setAspectRatio,
  settings,
  updateSettings,
  onClearToGlass,
  onBreatheMist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl p-6 text-neutral-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-mono font-bold tracking-wider">CANVAS & MIST SETTINGS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Aspect Ratio */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
              CANVAS ASPECT RATIO (DESKTOP & MOBILE ADAPTATION)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
              <button
                onClick={() => setAspectRatio('auto')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                  aspectRatio === 'auto'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Maximize2 className="w-5 h-5 text-sky-400" />
                <span>FULL MAIN</span>
                <span className="text-[10px] opacity-70">Expand to Page</span>
              </button>

              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                  aspectRatio === '16:9'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>16:9 LANDSCAPE</span>
                <span className="text-[10px] opacity-70">Desktop Standard</span>
              </button>

              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                  aspectRatio === '9:16'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>9:16 PORTRAIT</span>
                <span className="text-[10px] opacity-70">Mobile Fullscreen</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:2')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                  aspectRatio === '1:2'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5 scale-y-110" />
                <span>1:2 TALL</span>
                <span className="text-[10px] opacity-70">Ultrawide Mobile</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                  aspectRatio === '1:1'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Maximize2 className="w-5 h-5" />
                <span>1:1 SQUARE</span>
                <span className="text-[10px] opacity-70">Social & Avatar</span>
              </button>
            </div>
          </div>

          {/* 2. Line Smoothing */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                STROKE JITTER SMOOTHING
              </label>
              <span className="text-xs font-mono text-sky-400 font-bold">ANTI-TREMOR</span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-2.5">
              Eliminates micro hand-tremor on mouse or touch gestures with smooth Bezier curve reconstruction.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'LIGHT', desc: 'Raw handwriting details' },
                  { id: 'natural', label: 'NATURAL', desc: 'Optimal cursive balance' },
                  { id: 'high', label: 'HIGH', desc: 'Maximum anti-jitter' },
                ] as { id: SmoothingLevel; label: string; desc: string }[]
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => updateSettings({ smoothingLevel: lvl.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.smoothingLevel === lvl.id
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{lvl.label}</div>
                  <div className="text-[10px] font-mono text-neutral-400">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Background Blur Degree */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                BACKGROUND BLUR
              </label>
              <span className="text-xs font-mono tabular-nums text-neutral-200">
                {settings.backgroundBlur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={settings.backgroundBlur}
              onChange={(e) => updateSettings({ backgroundBlur: Number(e.target.value) })}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
              <span>SHARP (0px)</span>
              <span>SOFT FOCUS (16px)</span>
              <span>DREAMY BOKEH (35px)</span>
            </div>
          </div>

          {/* 4. Mist Density */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                MIST DENSITY
              </label>
              <span className="text-xs font-mono tabular-nums text-neutral-200">
                {Math.round(settings.mistDensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={settings.mistDensity}
              onChange={(e) => updateSettings({ mistDensity: Number(e.target.value) })}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
              <span>CLEAR MIST (30%)</span>
              <span>HEAVY STEAM (95%)</span>
            </div>
          </div>

          {/* 5. Physical water drips options */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
              REALISTIC CONDENSATION & DROPLETS
            </label>

            {/* Condensation Texture Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-300" />
                <div>
                  <div className="text-xs font-mono font-bold">MICRO CONDENSATION TEXTURE</div>
                  <div className="text-[10px] font-mono text-neutral-400">Tiny dew beads clinging to cold window glass</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.condensationTexture}
                onChange={(e) => updateSettings({ condensationTexture: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Glass Refraction Sheen */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-amber-300" />
                <div>
                  <div className="text-xs font-mono font-bold">WIPED EDGE WATER REFRACTION</div>
                  <div className="text-[10px] font-mono text-neutral-400">Glistening specular meniscus rim on stroke boundaries</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.glassRefraction}
                onChange={(e) => updateSettings({ glassRefraction: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Auto Trickle Drips */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-rose-300" />
                <div>
                  <div className="text-xs font-mono font-bold">AUTO TRICKLE WATER DRIPS</div>
                  <div className="text-[10px] font-mono text-neutral-400">Gravity droplets slide down vertically on stroke pauses</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dripAutoTrickle}
                onChange={(e) => updateSettings({ dripAutoTrickle: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Actions at bottom */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 font-mono">
            <button
              onClick={() => {
                onClearToGlass();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors uppercase"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>CLEAR ALL MIST</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md"
            >
              APPLY & CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
