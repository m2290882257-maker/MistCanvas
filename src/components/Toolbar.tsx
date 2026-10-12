import React from 'react';
import { 
  ToolType, 
  DewdropColor, 
  CanvasSettings 
} from '../types';
import { 
  Eraser, 
  Droplets, 
  Sparkles, 
  Heart, 
  Feather, 
  RotateCcw, 
  RotateCw, 
  Wind, 
  Sliders, 
  Image as ImageIcon, 
  Download,
  Flame,
  Volume2,
  VolumeX,
  HelpCircle
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  settings: CanvasSettings;
  updateSettings: (newSettings: Partial<CanvasSettings>) => void;
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
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBreatheMist,
  onAddDrip,
  onOpenSettings,
  onOpenBackgrounds,
  onExport,
  onOpenReference,
}) => {
  return (
    <div className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-4xl">
      <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl md:rounded-3xl p-2 md:p-3 text-neutral-200 transition-all">
        {/* Top Mini Controls: Brush size quick slider & tool sub-options */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 mb-1.5 border-b border-white/10 text-xs text-neutral-400">
          {/* Quick Brush Size Adjuster */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-neutral-300 whitespace-nowrap">笔触粗细</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="75"
                value={settings.brushSize}
                onChange={(e) => updateSettings({ brushSize: Number(e.target.value) })}
                className="w-24 md:w-36 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <span className="font-mono tabular-nums text-neutral-200 text-[11px] w-8">
                {settings.brushSize}px
              </span>
              {/* Visual preview dot of brush size */}
              <div 
                className="rounded-full bg-white shadow-sm transition-all"
                style={{
                  width: Math.min(22, Math.max(4, settings.brushSize * 0.45)),
                  height: Math.min(22, Math.max(4, settings.brushSize * 0.45)),
                }}
              />
            </div>
          </div>

          {/* Quick Color Picker for Dewdrop tool if active */}
          {activeTool === 'dewdrop' && (
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-300">水珠颜色:</span>
              {(['crystal', 'ruby', 'amber', 'cyan'] as DewdropColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => updateSettings({ dewdropColor: c })}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    settings.dewdropColor === c ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                  } ${
                    c === 'crystal' ? 'bg-sky-200/90 border-sky-300' :
                    c === 'ruby' ? 'bg-rose-500 border-rose-400' :
                    c === 'amber' ? 'bg-amber-400 border-amber-300' :
                    'bg-cyan-400 border-cyan-300'
                  }`}
                  title={c}
                />
              ))}
            </div>
          )}

          {/* Quick action buttons on top right */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Sound toggle */}
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.soundEnabled ? 'text-white bg-white/10' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title={settings.soundEnabled ? '音效已开启' : '音效已静音'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Inspiration Reference Modal */}
            <button
              onClick={onOpenReference}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors text-[11px]"
              title="查看写字灵感与参考"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">灵感参考</span>
            </button>
          </div>
        </div>

        {/* Primary Functional Bar: Tools & Actions */}
        <div className="flex items-center justify-between gap-1 md:gap-2">
          {/* Main Drawing Tools Group */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
            {/* 1. Wipe Tool (擦拭写字笔) */}
            <button
              onClick={() => setActiveTool('wipe')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'wipe'
                  ? 'bg-white text-neutral-950 shadow-md font-semibold'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="擦拭水雾写字/画画"
            >
              <Eraser className="w-4 h-4" />
              <span>指尖擦拭</span>
            </button>

            {/* 2. Drip Tool (水滴流淌笔) */}
            <button
              onClick={() => setActiveTool('drip')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'drip'
                  ? 'bg-white text-neutral-950 shadow-md font-semibold'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="写字时附带流淌水痕"
            >
              <Droplets className="w-4 h-4" />
              <span>泪痕流淌</span>
            </button>

            {/* 3. Dewdrop Stamp (晶莹水珠点缀) */}
            <button
              onClick={() => setActiveTool('dewdrop')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'dewdrop'
                  ? 'bg-white text-neutral-950 shadow-md font-semibold'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="盖上晶莹露珠 (支持红/黄/蓝彩色凝露)"
            >
              <span className="text-base leading-none">💧</span>
              <span>水珠印章</span>
            </button>

            {/* 4. Wing Stamp (翅膀涂鸦 - 参考图同款) */}
            <button
              onClick={() => setActiveTool('wing')}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'wing'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="天使羽翼涂鸦 (参考图同款)"
            >
              <Feather className="w-4 h-4" />
              <span className="hidden sm:inline">羽翼</span>
            </button>

            {/* 5. Sparkle Stamp (四角星涂鸦 - 参考图同款) */}
            <button
              onClick={() => setActiveTool('sparkle')}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'sparkle'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="闪烁星星涂鸦 (参考图同款)"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">星芒</span>
            </button>

            {/* 6. Heart Stamp (爱心) */}
            <button
              onClick={() => setActiveTool('heart')}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'heart'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="爱心涂鸦"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* 7. Steam Tool (补雾笔) */}
            <button
              onClick={() => setActiveTool('steam')}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[42px] shrink-0 ${
                activeTool === 'steam'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
              title="哈气笔刷 (在擦掉的地方重新补上水雾)"
            >
              <Flame className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">补雾</span>
            </button>
          </div>

          <div className="h-6 w-px bg-white/15 mx-1 hidden sm:block shrink-0" />

          {/* Action Operations */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-xl min-h-[42px] min-w-[38px] flex items-center justify-center transition-colors ${
                canUndo ? 'text-neutral-200 hover:bg-white/10' : 'text-neutral-600 cursor-not-allowed'
              }`}
              title="撤销 (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Redo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-xl min-h-[42px] min-w-[38px] flex items-center justify-center transition-colors ${
                canRedo ? 'text-neutral-200 hover:bg-white/10' : 'text-neutral-600 cursor-not-allowed'
              }`}
              title="重做 (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Breathe Mist (哈气起雾) */}
            <button
              onClick={onBreatheMist}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-all min-h-[42px] active:scale-95"
              title="哈一口温热的水汽重新起雾"
            >
              <Wind className="w-4 h-4 text-sky-300 animate-pulse" />
              <span className="whitespace-nowrap">哈气起雾</span>
            </button>

            {/* Background picker button */}
            <button
              onClick={onOpenBackgrounds}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-neutral-200 transition-all min-h-[42px]"
              title="更换或上传背景图"
            >
              <ImageIcon className="w-4 h-4 text-rose-300" />
              <span className="hidden md:inline">换背景</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl min-h-[42px] min-w-[42px] flex items-center justify-center bg-white/10 hover:bg-white/20 text-neutral-200 transition-all"
              title="画布设置与效果调节 (虚化、平滑、比例)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Export image button */}
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-lg transition-all min-h-[42px] active:scale-95"
              title="导出高清成图"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
