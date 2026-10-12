import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AspectRatioType, 
  ToolType, 
  CanvasSettings 
} from './types';
import { BACKGROUND_PRESETS } from './data/presets';
import { MistyCanvas } from './components/MistyCanvas';
import { Toolbar } from './components/Toolbar';
import { SettingsModal } from './components/SettingsModal';
import { BackgroundPicker } from './components/BackgroundPicker';
import { ReferenceViewerModal } from './components/ReferenceViewerModal';
import { soundFX } from './utils/audio';
import { 
  Droplets, 
  Download, 
  ImageIcon, 
  Sliders, 
  Wind, 
  X, 
  Check, 
  Share2 
} from 'lucide-react';

export default function App() {
  // Screen ratio state: default 16:9 on desktop, auto-detect mobile for 9:16
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');

  // Background image state (default to romantic rose bouquet matching reference photo)
  const [currentBgUrl, setCurrentBgUrl] = useState<string>(BACKGROUND_PRESETS[0].url);

  // Active tool
  const [activeTool, setActiveTool] = useState<ToolType>('wipe');

  // Settings
  const [settings, setSettings] = useState<CanvasSettings>({
    brushSize: 26,
    backgroundBlur: 16,
    mistDensity: 0.76,
    smoothingLevel: 'natural',
    condensationTexture: true,
    glassRefraction: true,
    dripAutoTrickle: true,
    dripSpeed: 2.5,
    dewdropColor: 'ruby',
    soundEnabled: false,
  });

  // History states
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);

  // Export Preview Modal
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  // Registered canvas actions
  const canvasActionsRef = useRef<{
    undo: () => void;
    redo: () => void;
    clearToGlass: () => void;
    breatheMist: () => void;
    addRandomDrip: () => void;
    exportImage: () => string | null;
  } | null>(null);

  // Responsive auto-detect initial aspect ratio
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setAspectRatio('9:16');
    }
  }, []);

  // Update settings handler
  const handleUpdateSettings = useCallback((newPartial: Partial<CanvasSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newPartial };
      if ('soundEnabled' in newPartial) {
        soundFX.setMuted(!newPartial.soundEnabled);
      }
      return next;
    });
  }, []);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Space for breathe)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          canvasActionsRef.current?.redo();
        } else {
          canvasActionsRef.current?.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        canvasActionsRef.current?.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stable callbacks for canvas
  const handleUndoRedoChange = useCallback((undo: boolean, redo: boolean) => {
    setCanUndo(undo);
    setCanRedo(redo);
  }, []);

  const handleRegisterActions = useCallback((actions: {
    undo: () => void;
    redo: () => void;
    clearToGlass: () => void;
    breatheMist: () => void;
    addRandomDrip: () => void;
    exportImage: () => string | null;
  }) => {
    canvasActionsRef.current = actions;
  }, []);

  // Trigger export
  const handleExport = () => {
    if (canvasActionsRef.current) {
      const dataUrl = canvasActionsRef.current.exportImage();
      if (dataUrl) {
        setExportedImageUrl(dataUrl);
      }
    }
  };

  // Download export image
  const downloadImage = (format: 'png' | 'jpg' = 'png') => {
    if (!exportedImageUrl) return;
    const a = document.createElement('a');
    a.href = exportedImageUrl;
    a.download = `misty-glass-artwork-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-screen overflow-hidden flex flex-col bg-neutral-950 font-sans text-neutral-100">
      {/* 1. Header (Following Top Bar Contract: 3 zones, gap-8) */}
      <header className="flex items-center justify-between gap-8 px-4 md:px-8 py-3.5 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <Droplets className="w-5 h-5 text-sky-400" />
          <span className="text-base md:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            MistyGlass
          </span>
          <span className="text-xs text-neutral-400 font-normal hidden sm:inline">
            起雾玻璃水滴擦画
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation & aspect indicators */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectRatio === '16:9' ? 'bg-white text-neutral-950 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              16:9 横屏 (电脑)
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectRatio === '9:16' ? 'bg-white text-neutral-950 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              9:16 竖屏 (手机)
            </button>
            <button
              onClick={() => setAspectRatio('1:2')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectRatio === '1:2' ? 'bg-white text-neutral-950 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              1:2 竖屏 (全屏手机)
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectRatio === '1:1' ? 'bg-white text-neutral-950 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              1:1 方形
            </button>
          </div>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsBgPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-white/10 hover:bg-white/15 rounded-xl transition-colors whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
            <span>更换背景</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 rounded-xl transition-all shadow-md whitespace-nowrap active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold">保存作品</span>
          </button>
        </div>
      </header>

      {/* 2. Main Interactive Canvas Area */}
      <main className="relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center p-2 pb-24 md:pb-28">
        <MistyCanvas
          backgroundImageUrl={currentBgUrl}
          aspectRatio={aspectRatio}
          settings={settings}
          activeTool={activeTool}
          onUndoRedoChange={handleUndoRedoChange}
          registerActions={handleRegisterActions}
        />

        {/* Ambient Subtle Instructions when starting */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/10 text-[11px] text-neutral-300 transition-opacity">
          <span>用手指或鼠标在水雾玻璃上写字划线 · 自动圆滑防抖</span>
        </div>
      </main>

      {/* 3. Ergonomic Bottom Floating Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        settings={settings}
        updateSettings={handleUpdateSettings}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => canvasActionsRef.current?.undo()}
        onRedo={() => canvasActionsRef.current?.redo()}
        onBreatheMist={() => canvasActionsRef.current?.breatheMist()}
        onAddDrip={() => canvasActionsRef.current?.addRandomDrip()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBackgrounds={() => setIsBgPickerOpen(true)}
        onExport={handleExport}
        onOpenReference={() => setIsReferenceOpen(true)}
      />

      {/* 4. Detailed Settings Modal (Aspect Ratio, Blur, Smoothing, Mist) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        settings={settings}
        updateSettings={handleUpdateSettings}
        onClearToGlass={() => canvasActionsRef.current?.clearToGlass()}
        onBreatheMist={() => canvasActionsRef.current?.breatheMist()}
      />

      {/* 5. Background Picker & Local Upload Modal */}
      <BackgroundPicker
        isOpen={isBgPickerOpen}
        onClose={() => setIsBgPickerOpen(false)}
        currentBgUrl={currentBgUrl}
        onSelectPreset={(url) => setCurrentBgUrl(url)}
        onCustomImageUpload={(dataUrl) => setCurrentBgUrl(dataUrl)}
      />

      {/* 6. Reference Art Inspiration Modal */}
      <ReferenceViewerModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* 7. Image Export & Download Modal */}
      {exportedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="relative w-full max-w-xl bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl p-6 text-neutral-100 flex flex-col items-center max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-semibold">保存你的起雾玻璃作品</h3>
              <button
                onClick={() => setExportedImageUrl(null)}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-black mb-5">
              <img
                src={exportedImageUrl}
                alt="Artwork Preview"
                className="w-full h-auto max-h-[50vh] object-contain mx-auto"
              />
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                高清成图包含擦拭水痕、流淌水珠与背景光晕
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadImage('jpg')}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors"
                >
                  下载 JPG
                </button>
                <button
                  onClick={() => downloadImage('png')}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>下载高清 PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
