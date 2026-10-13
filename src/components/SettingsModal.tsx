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
  Droplet,
  Languages
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

  const isZh = settings.language === 'zh';

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
            <h2 className="text-lg font-mono font-bold tracking-wider">
              {isZh ? '画布与水雾设置' : 'CANVAS & MIST SETTINGS'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 0. Language Switcher (语言切换 - 支持默认英文与中文) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2.5">
              <Languages className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-neutral-200">
                  {isZh ? '界面语言 / LANGUAGE' : 'INTERFACE LANGUAGE'}
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  {isZh ? '当前语言: 中文 (可随时切回英文)' : 'English (Default) & 中文 (Chinese)'}
                </div>
              </div>
            </div>

            {/* Language Switch Buttons */}
            <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl font-mono text-xs shadow-inner">
              <button
                onClick={() => updateSettings({ language: 'en' })}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  settings.language === 'en'
                    ? 'bg-white text-neutral-950 shadow-md scale-[1.02]'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Switch to English (Default)"
              >
                English
              </button>
              <button
                onClick={() => updateSettings({ language: 'zh' })}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  settings.language === 'zh'
                    ? 'bg-white text-neutral-950 shadow-md scale-[1.02]'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="切换至中文"
              >
                中文
              </button>
            </div>
          </div>
          {/* 1. Aspect Ratio */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
              {isZh ? '画布比例 (桌面与移动端适配)' : 'CANVAS ASPECT RATIO (DESKTOP & MOBILE ADAPTATION)'}
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
                <span>{isZh ? '全屏画布' : 'FULL MAIN'}</span>
                <span className="text-[10px] opacity-70">{isZh ? '撑满页面' : 'Expand to Page'}</span>
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
                <span>{isZh ? '16:9 横屏' : '16:9 LANDSCAPE'}</span>
                <span className="text-[10px] opacity-70">{isZh ? '桌面宽屏标准' : 'Desktop Standard'}</span>
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
                <span>{isZh ? '9:16 竖屏' : '9:16 PORTRAIT'}</span>
                <span className="text-[10px] opacity-70">{isZh ? '手机全屏' : 'Mobile Fullscreen'}</span>
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
                <span>{isZh ? '1:2 超高' : '1:2 TALL'}</span>
                <span className="text-[10px] opacity-70">{isZh ? '超长手机屏幕' : 'Ultrawide Mobile'}</span>
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
                <span>{isZh ? '1:1 方形' : '1:1 SQUARE'}</span>
                <span className="text-[10px] opacity-70">{isZh ? '社交与头像' : 'Social & Avatar'}</span>
              </button>
            </div>
          </div>

          {/* 2. Line Smoothing */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                {isZh ? '笔触抖动平滑' : 'STROKE JITTER SMOOTHING'}
              </label>
              <span className="text-xs font-mono text-sky-400 font-bold">
                {isZh ? '防抖优化' : 'ANTI-TREMOR'}
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-2.5">
              {isZh 
                ? '基于贝塞尔曲线算法消除指尖或鼠标手抖微颤，让擦拭轨迹圆润顺滑。'
                : 'Eliminates micro hand-tremor on mouse or touch gestures with smooth Bezier curve reconstruction.'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { 
                    id: 'light' as SmoothingLevel, 
                    label: isZh ? '轻微' : 'LIGHT', 
                    desc: isZh ? '保留原生笔迹细节' : 'Raw handwriting details' 
                  },
                  { 
                    id: 'natural' as SmoothingLevel, 
                    label: isZh ? '自然' : 'NATURAL', 
                    desc: isZh ? '流畅书写最佳平衡' : 'Optimal cursive balance' 
                  },
                  { 
                    id: 'high' as SmoothingLevel, 
                    label: isZh ? '强力' : 'HIGH', 
                    desc: isZh ? '极致顺滑防抖效果' : 'Maximum anti-jitter' 
                  },
                ]
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
                {isZh ? '背景虚化程度' : 'BACKGROUND BLUR'}
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
              <span>{isZh ? '清晰 (0px)' : 'SHARP (0px)'}</span>
              <span>{isZh ? '柔焦 (16px)' : 'SOFT FOCUS (16px)'}</span>
              <span>{isZh ? '梦幻散景 (35px)' : 'DREAMY BOKEH (35px)'}</span>
            </div>
          </div>

          {/* 4. Mist Density */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                {isZh ? '水雾浓度' : 'MIST DENSITY'}
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
              <span>{isZh ? '轻薄水雾 (30%)' : 'CLEAR MIST (30%)'}</span>
              <span>{isZh ? '浓厚蒸汽 (95%)' : 'HEAVY STEAM (95%)'}</span>
            </div>
          </div>

          {/* 5. Physical water drips options */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
              {isZh ? '真实冷凝水与水珠物理效果' : 'REALISTIC CONDENSATION & DROPLETS'}
            </label>

            {/* Condensation Texture Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-300" />
                <div>
                  <div className="text-xs font-mono font-bold">
                    {isZh ? '微观冷凝水珠噪点' : 'MICRO CONDENSATION TEXTURE'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {isZh ? '细密真实小水珠紧密附着在冰冷窗户玻璃表面' : 'Tiny dew beads clinging to cold window glass'}
                  </div>
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
                  <div className="text-xs font-mono font-bold">
                    {isZh ? '擦拭边缘水光折射高光' : 'WIPED EDGE WATER REFRACTION'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {isZh ? '笔画擦拭轮廓边缘的晶莹弯月面高光水痕' : 'Glistening specular meniscus rim on stroke boundaries'}
                  </div>
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
                  <div className="text-xs font-mono font-bold">
                    {isZh ? '停顿时自动下淌泪痕' : 'AUTO TRICKLE WATER DRIPS'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {isZh ? '手写停留或画完时沿重力下落的滑落水珠' : 'Gravity droplets slide down vertically on stroke pauses'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dripAutoTrickle}
                onChange={(e) => updateSettings({ dripAutoTrickle: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Drip Water Trail Density Slider (流向水痕密度) */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-cyan-300" />
                  <span className="text-xs font-mono font-bold">
                    {isZh ? 'DRIP 笔刷流向水痕密度' : 'DRIP WATER TRAIL DENSITY'}
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums text-neutral-200">
                  {isZh 
                    ? (settings.dripDensity <= 0.25 ? '低密度' : settings.dripDensity >= 0.75 ? '高密度' : '中密度')
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
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>{isZh ? '稀疏细微 (10%)' : 'SUBTLE & SPARSE (10%)'}</span>
                <span>{isZh ? '充沛密集 (100%)' : 'DENSE & FREQUENT (100%)'}</span>
              </div>
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
              <span>{isZh ? '擦净全部水雾' : 'CLEAR ALL MIST'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md"
            >
              {isZh ? '应用并返回' : 'APPLY & CONTINUE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
