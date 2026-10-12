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
            <h2 className="text-lg font-semibold tracking-tight">水雾画布效果调节</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Aspect Ratio (界面画幅比例) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
              展示画幅比例 (适配电脑横屏与手机竖屏)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium gap-1.5 ${
                  aspectRatio === '16:9'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>16:9 横屏</span>
                <span className="text-[10px] opacity-70">电脑标准网页</span>
              </button>

              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium gap-1.5 ${
                  aspectRatio === '9:16'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>9:16 竖屏</span>
                <span className="text-[10px] opacity-70">手机全屏/短视频</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:2')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium gap-1.5 ${
                  aspectRatio === '1:2'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5 scale-y-110" />
                <span>1:2 竖屏</span>
                <span className="text-[10px] opacity-70">修长全面屏手机</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium gap-1.5 ${
                  aspectRatio === '1:1'
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <Maximize2 className="w-5 h-5" />
                <span>1:1 方形</span>
                <span className="text-[10px] opacity-70">社交贴图/头像</span>
              </button>
            </div>
          </div>

          {/* 2. Line Smoothing (线条平滑圆滑处理) */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                颤抖线条圆滑平滑处理
              </label>
              <span className="text-xs text-sky-400 font-medium">防抖流畅曲线</span>
            </div>
            <p className="text-xs text-neutral-400 mb-2.5">
              消除鼠标或手指快速滑动时的微小颤抖，智能贝塞尔曲线重构，使字迹更加圆润优雅。
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: '轻度平滑', desc: '保留手写细节' },
                  { id: 'natural', label: '自然流畅', desc: '推荐最佳手感' },
                  { id: 'high', label: '高度圆滑', desc: '强力消除抖动' },
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
                  <div className="text-xs font-semibold">{lvl.label}</div>
                  <div className="text-[10px] text-neutral-400">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Background Blur Degree (背景虚化程度) */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                背景虚化程度 (毛玻璃景深)
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
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>清晰可见 (0px)</span>
              <span>默认柔焦 (16px)</span>
              <span>梦幻光斑 (35px)</span>
            </div>
          </div>

          {/* 4. Mist Density (水雾厚度与白雾浓度) */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                水雾浓度 (白雾冷凝厚度)
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
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>薄雾清透 (30%)</span>
              <span>温热浓雾 (95%)</span>
            </div>
          </div>

          {/* 5. Physical water drips options */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              真实玻璃水滴与冷凝质感
            </label>

            {/* Condensation Texture Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-300" />
                <div>
                  <div className="text-xs font-medium">微细冷凝水滴纹理</div>
                  <div className="text-[10px] text-neutral-400">模拟附着在玻璃表面的晶莹微小冷凝水珠</div>
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
                  <div className="text-xs font-medium">擦拭边沿水光折射</div>
                  <div className="text-[10px] text-neutral-400">手指划过边沿堆积的水膜高光光晕</div>
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
                  <div className="text-xs font-medium">笔触停留自动下淌泪痕</div>
                  <div className="text-[10px] text-neutral-400">笔画末梢随机生成顺着玻璃重力缓缓滑落的水痕</div>
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
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClearToGlass();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>擦亮整块玻璃</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md"
            >
              完成并继续写字
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
