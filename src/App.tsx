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
  Download, 
  X 
} from 'lucide-react';

export default function App() {
  // Screen ratio state: default 'auto' to expand canvas to the entire main page
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('auto');

  // Background image state (default to romantic rose bouquet matching reference photo)
  const [currentBgUrl, setCurrentBgUrl] = useState<string>(BACKGROUND_PRESETS[0].url);

  // Active tool: 'wipe' by default
  const [activeTool, setActiveTool] = useState<ToolType>('wipe');

  // Settings
  const [settings, setSettings] = useState<CanvasSettings>({
    brushSize: 26,
    backgroundBlur: 16,
    mistDensity: 0.76,
    smoothingLevel: 'natural',
    condensationTexture: true,
    glassRefraction: true,
    dripAutoTrickle: false,
    dripSpeed: 2.5,
    dripDensity: 0.45,
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
      {/* 1. Top Bar: Title & Aspect Ratio Navigator (Float over full main canvas) */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-4 md:px-8 py-3 pointer-events-none">
        {/* Left: Brand Title */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <span 
            style={{ fontFamily: 'Courier New' }} 
            className="font-bold tracking-wider text-base text-white/95 drop-shadow-md select-none"
          >
            MistyGlass
          </span>
          <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15 backdrop-blur-sm uppercase select-none">
            CANVAS
          </span>
        </div>

        {/* Center: Aspect Ratio Navigator (顶部比例导航器) */}
        <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/15 shadow-xl font-mono text-[11px] sm:text-xs pointer-events-auto">
          {(['auto', '16:9', '9:16', '1:1', '1:2'] as AspectRatioType[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase transition-all duration-200 ${
                aspectRatio === ratio
                  ? 'bg-white text-neutral-950 font-bold shadow-md shadow-white/20 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title={`Switch canvas aspect ratio to ${ratio}`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Right Spacer for balanced centering */}
        <div className="w-[120px] hidden md:block pointer-events-none" />
      </header>

      {/* Main Interactive Canvas Area (Full Main / Full Screen) */}
      <main className="relative flex-1 min-h-0 w-full h-full overflow-hidden flex items-center justify-center p-0 m-0">
        <MistyCanvas
          backgroundImageUrl={currentBgUrl}
          aspectRatio={aspectRatio}
          settings={settings}
          activeTool={activeTool}
          onUndoRedoChange={handleUndoRedoChange}
          registerActions={handleRegisterActions}
        />

        {/* Ambient Subtle Instructions when starting */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-neutral-300/80 transition-opacity">
          <span>Swipe cursor or fingertip across steamy glass · Smooth jitter dampening</span>
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
              <h3 className="text-base font-mono font-bold tracking-wider">SAVE ARTWORK</h3>
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
              <span className="text-xs font-mono text-neutral-400">
                High-resolution export with wiped mist, water drips & bokeh
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadImage('jpg')}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors"
                >
                  JPG
                </button>
                <button
                  onClick={() => downloadImage('png')}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
