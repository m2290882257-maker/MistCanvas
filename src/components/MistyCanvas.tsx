import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  AspectRatioType, 
  CanvasSettings, 
  ToolType, 
  Point, 
  WaterDrip, 
  DewdropStamp,
  RainSettings,
  DEFAULT_RAIN_SETTINGS
} from '../types';
import { smoothPoints, drawSmoothStroke } from '../utils/smoothing';
import { createWaterDrip, updateWaterDrips, drawDripTrailOnMask, drawDripHighlights, drawDewdropDot, drawDoodleStamp } from '../utils/drips';
import { soundFX } from '../utils/audio';
import { WindowFrameOverlay, drawWindowFrameOnCanvas } from './WindowFrameOverlay';
import { RainCanvas, RainCanvasRef } from './RainCanvas';

interface MistyCanvasProps {
  backgroundImageUrl: string;
  aspectRatio: AspectRatioType;
  settings: CanvasSettings;
  activeTool: ToolType;
  rainSettings?: RainSettings;
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void;
  onStartDrawing?: () => void;
  registerActions?: (actions: {
    undo: () => void;
    redo: () => void;
    clearToGlass: () => void;
    breatheMist: () => void;
    addRandomDrip: () => void;
    exportImage: () => string | null;
  }) => void;
}

export const MistyCanvas: React.FC<MistyCanvasProps> = ({
  backgroundImageUrl,
  aspectRatio,
  settings,
  activeTool,
  rainSettings,
  onUndoRedoChange,
  onStartDrawing,
  registerActions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rainCanvasRef = useRef<RainCanvasRef>(null);
  
  // Canvases
  const sharpCanvasRef = useRef<HTMLCanvasElement>(null);
  const mistCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenBlurCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Loaded background image element
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  // Drawing state
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<Point[]>([]);
  const lastSoundTimeRef = useRef<number>(0);

  // History Snapshot interface for complete undo / redo fidelity
  interface HistorySnapshot {
    mist: ImageData;
    overlay: ImageData;
    dewdrops: DewdropStamp[];
  }

  // Undo / Redo history stored with full layer states
  const historyRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const maxHistory = 20;

  // Active water drips
  const activeDripsRef = useRef<WaterDrip[]>([]);
  const dewdropsRef = useRef<DewdropStamp[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Breathing fog animation state
  const [isBreathing, setIsBreathing] = useState(false);

  // Display dimension in CSS pixels
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  // Dynamic internal canvas dimension based on selected aspect ratio
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1920,
    height: 1080,
  });

  // Track sharp background rendering revision for WebGL texture sync
  const [bgVersion, setBgVersion] = useState<number>(0);

  // Calculate pixel dimensions to fill container or match aspect ratio
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availableW = Math.max(300, Math.floor(rect.width || window.innerWidth));
    const availableH = Math.max(200, Math.floor(rect.height || window.innerHeight));

    let finalW = availableW;
    let finalH = availableH;

    if (aspectRatio === 'auto') {
      finalW = availableW;
      finalH = availableH;
    } else {
      let targetRatio = 16 / 9;
      if (aspectRatio === '16:9') targetRatio = 16 / 9;
      else if (aspectRatio === '9:16') targetRatio = 9 / 16;
      else if (aspectRatio === '1:2') targetRatio = 1 / 2;
      else if (aspectRatio === '1:1') targetRatio = 1;

      let dw = availableW;
      let dh = availableW / targetRatio;

      if (dh > availableH) {
        dh = availableH;
        dw = availableH * targetRatio;
      }

      finalW = Math.max(200, Math.round(dw));
      finalH = Math.max(200, Math.round(dh));
    }

    setDisplaySize({
      width: finalW,
      height: finalH,
    });

    // High-res internal canvas
    const dpr = Math.min(window.devicePixelRatio || 1.5, 2);
    setDimensions({
      width: Math.round(finalW * dpr),
      height: Math.round(finalH * dpr),
    });
  }, [aspectRatio]);

  // Handle container resizing via ResizeObserver
  useEffect(() => {
    calculateDimensions();
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      calculateDimensions();
    });
    ro.observe(container);

    const handleResize = () => calculateDimensions();
    window.addEventListener('resize', handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateDimensions]);

  // Load Background Image with robust fallback
  useEffect(() => {
    let isMounted = true;
    const img = new Image();

    const applyLoadedImg = (loaded: HTMLImageElement) => {
      if (!isMounted) return;
      bgImgRef.current = loaded;
      renderAllLayers(true);
    };

    if (!backgroundImageUrl.startsWith('data:') && !backgroundImageUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      applyLoadedImg(img);
    };

    img.onerror = () => {
      // If anonymous CORS failed, try without crossOrigin
      if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => applyLoadedImg(retryImg);
        retryImg.onerror = () => {
          // If all failed, render procedural fallback
          if (isMounted) renderAllLayers(true);
        };
        retryImg.src = backgroundImageUrl;
      } else {
        if (isMounted) renderAllLayers(true);
      }
    };

    img.src = backgroundImageUrl;

    if (img.complete && img.naturalWidth > 0) {
      applyLoadedImg(img);
    } else {
      // Immediately render mist with placeholder so canvas is never blank
      renderAllLayers(true);
    }

    return () => {
      isMounted = false;
    };
  }, [backgroundImageUrl]);

  // Stable refs to prevent unwanted re-renders from resetting the canvas
  const settingsRef = useRef<CanvasSettings>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const onUndoRedoChangeRef = useRef(onUndoRedoChange);
  useEffect(() => {
    onUndoRedoChangeRef.current = onUndoRedoChange;
  }, [onUndoRedoChange]);

  const activeToolRef = useRef<ToolType>(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Track if canvas has been initialized at least once
  const isInitializedRef = useRef<boolean>(false);

  // Render sharp background on base canvas
  const drawSharpBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const img = bgImgRef.current;
    if (!img) {
      // Procedural aesthetic floral bouquet gradient fallback so screen is NEVER blank
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.45, 10, width * 0.5, height * 0.5, width * 0.7);
      grad.addColorStop(0, '#fda4af');
      grad.addColorStop(0.25, '#e11d48');
      grad.addColorStop(0.55, '#881337');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Soft painterly petal glows
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(width * 0.45, height * 0.42, width * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
      ctx.beginPath();
      ctx.arc(width * 0.56, height * 0.48, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Cover scale
    const imgRatio = (img.naturalWidth || width) / (img.naturalHeight || height);
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawH = height;
      drawW = height * imgRatio;
      offsetX = (width - drawW) / 2;
    } else {
      drawW = width;
      drawH = width / imgRatio;
      offsetY = (height - drawH) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  // Initialize mist layer only when explicitly requested
  const initMistLayer = useCallback((resetHistory = false) => {
    const mistCanvas = mistCanvasRef.current;
    if (!mistCanvas) return;

    const ctx = mistCanvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    mistCanvas.width = width;
    mistCanvas.height = height;

    const currentSettings = settingsRef.current;

    // 1. Draw blurred version of the background image
    ctx.save();
    ctx.filter = `blur(${Math.max(1, currentSettings.backgroundBlur)}px)`;
    drawSharpBackground(ctx, width, height);
    ctx.restore();

    // 2. Add milky frosted glass tint veil
    ctx.save();
    ctx.fillStyle = `rgba(240, 245, 250, ${currentSettings.mistDensity})`;
    ctx.fillRect(0, 0, width, height);

    // 3. Add fine micro-condensation water droplets / noise texture
    if (currentSettings.condensationTexture) {
      const dropCount = Math.floor((width * height) / 1200);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let i = 0; i < dropCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 0.6 + Math.random() * 1.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add soft tiny shadows for micro-droplets
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let i = 0; i < dropCount / 2; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 0.5 + Math.random() * 1.2;
        ctx.beginPath();
        ctx.arc(x, y + 1, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Reset drips & dewdrops and clear overlay canvas
    activeDripsRef.current = [];
    dewdropsRef.current = [];
    const overlayCanvas = overlayCanvasRef.current;
    if (overlayCanvas) {
      const octx = overlayCanvas.getContext('2d');
      if (octx) {
        octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
    }

    // Push initial state to history
    if (resetHistory) {
      const initialMist = ctx.getImageData(0, 0, width, height);
      const initialOverlay = overlayCanvas 
        ? overlayCanvas.getContext('2d')?.getImageData(0, 0, width, height) || new ImageData(width, height)
        : new ImageData(width, height);

      historyRef.current = [{
        mist: initialMist,
        overlay: initialOverlay,
        dewdrops: [],
      }];
      historyIndexRef.current = 0;
      onUndoRedoChangeRef.current?.(false, false);
    }
  }, [dimensions, drawSharpBackground]);

  // Full re-render of sharp background + mist layer (ONLY on aspect ratio or bg image changes)
  const renderAllLayers = useCallback((resetHistory = false) => {
    const sharpCanvas = sharpCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!sharpCanvas || !overlayCanvas) return;

    const { width, height } = dimensions;
    sharpCanvas.width = width;
    sharpCanvas.height = height;
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    const sharpCtx = sharpCanvas.getContext('2d');
    if (sharpCtx) {
      drawSharpBackground(sharpCtx, width, height);
      setBgVersion((v) => v + 1);
    }

    initMistLayer(resetHistory);
    isInitializedRef.current = true;
  }, [dimensions, drawSharpBackground, initMistLayer]);

  // Re-render when aspect ratio or dimensions change
  useEffect(() => {
    renderAllLayers(true);
  }, [dimensions.width, dimensions.height]); // ONLY when pixel dimensions change, never on re-render

  // History management: save current mist and overlay state
  const saveHistoryState = useCallback(() => {
    const mistCanvas = mistCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mistCanvas || !overlayCanvas) return;
    const mctx = mistCanvas.getContext('2d');
    const octx = overlayCanvas.getContext('2d');
    if (!mctx || !octx) return;

    const snapshot = {
      mist: mctx.getImageData(0, 0, mistCanvas.width, mistCanvas.height),
      overlay: octx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height),
      dewdrops: [...dewdropsRef.current],
    };

    // Slice off any redo branch
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;

    onUndoRedoChangeRef.current?.(historyIndexRef.current > 0, false);
  }, []);

  // Undo Action: cleanly restore mist, overlay, and dewdrops; kill running drips immediately
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const mistCanvas = mistCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mistCanvas || !overlayCanvas) return;
    const mctx = mistCanvas.getContext('2d');
    const octx = overlayCanvas.getContext('2d');
    if (!mctx || !octx) return;

    // Immediately stop and cancel any running drips so trails cannot reappear!
    activeDripsRef.current = [];

    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    mctx.putImageData(snapshot.mist, 0, 0);
    octx.putImageData(snapshot.overlay, 0, 0);
    dewdropsRef.current = [...snapshot.dewdrops];

    onUndoRedoChangeRef.current?.(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1
    );
  }, []);

  // Redo Action: cleanly advance state; stop running drips
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const mistCanvas = mistCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mistCanvas || !overlayCanvas) return;
    const mctx = mistCanvas.getContext('2d');
    const octx = overlayCanvas.getContext('2d');
    if (!mctx || !octx) return;

    activeDripsRef.current = [];

    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    mctx.putImageData(snapshot.mist, 0, 0);
    octx.putImageData(snapshot.overlay, 0, 0);
    dewdropsRef.current = [...snapshot.dewdrops];

    onUndoRedoChangeRef.current?.(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1
    );
  }, []);

  // Clear all to crystal clear glass
  const handleClearToGlass = useCallback(() => {
    const mistCanvas = mistCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mistCanvas || !overlayCanvas) return;
    const mctx = mistCanvas.getContext('2d');
    const octx = overlayCanvas.getContext('2d');
    if (!mctx || !octx) return;

    activeDripsRef.current = [];
    dewdropsRef.current = [];
    mctx.clearRect(0, 0, mistCanvas.width, mistCanvas.height);
    octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    saveHistoryState();
  }, [saveHistoryState]);

  // "Breathe Mist" (哈气重新起雾) action with steam condensation animation
  const handleBreatheMist = useCallback(() => {
    soundFX.playBreathSound();
    setIsBreathing(true);

    setTimeout(() => {
      // Clear overlay completely (remove all dewdrops/drip marks)
      const overlayCanvas = overlayCanvasRef.current;
      if (overlayCanvas) {
        const octx = overlayCanvas.getContext('2d');
        if (octx) {
          octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
      }
      activeDripsRef.current = [];
      dewdropsRef.current = [];

      initMistLayer(false);
      saveHistoryState();
      setIsBreathing(false);
    }, 500);
  }, [initMistLayer, saveHistoryState]);

  // Add random trickling water drip
  const handleAddRandomDrip = useCallback(() => {
    const { width, height } = dimensions;
    const rx = width * 0.15 + Math.random() * width * 0.7;
    const ry = height * 0.2 + Math.random() * height * 0.35;
    const newDrip = createWaterDrip(rx, ry, settings.brushSize * 0.35, height * 0.4);
    activeDripsRef.current.push(newDrip);
    soundFX.playDripSound();
  }, [dimensions, settings.brushSize]);

  // Export merged high-res image
  const handleExportImage = useCallback((): string | null => {
    const sharp = sharpCanvasRef.current;
    const mist = mistCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!sharp || !mist || !overlay) return null;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dimensions.width;
    exportCanvas.height = dimensions.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return null;

    // 1. Draw sharp background
    expCtx.drawImage(sharp, 0, 0);
    // 2. Draw mist layer with wiped cutouts
    expCtx.drawImage(mist, 0, 0);
    // 3. Draw water highlights & dewdrops
    expCtx.drawImage(overlay, 0, 0);

    // 4. Draw Rain shader layer if active
    if (rainSettings?.enabled && rainCanvasRef.current) {
      const rainCanvas = rainCanvasRef.current.getCanvas();
      if (rainCanvas) {
        expCtx.drawImage(rainCanvas, 0, 0);
      }
    }

    // 5. Draw realistic window scene frame if mode is active
    if (settings.windowMode && settings.windowMode !== 'none') {
      drawWindowFrameOnCanvas(expCtx, dimensions.width, dimensions.height, settings.windowMode);
    }

    return exportCanvas.toDataURL('image/png', 0.95);
  }, [dimensions, settings.windowMode, rainSettings?.enabled]);

  // Register parent actions
  useEffect(() => {
    if (registerActions) {
      registerActions({
        undo: handleUndo,
        redo: handleRedo,
        clearToGlass: handleClearToGlass,
        breatheMist: handleBreatheMist,
        addRandomDrip: handleAddRandomDrip,
        exportImage: handleExportImage,
      });
    }
  }, [registerActions, handleUndo, handleRedo, handleClearToGlass, handleBreatheMist, handleAddRandomDrip, handleExportImage]);

  // Physics animation loop for drips & highlights
  useEffect(() => {
    const updatePhysics = () => {
      const mistCanvas = mistCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;

      if (mistCanvas && overlayCanvas && activeDripsRef.current.length > 0) {
        const mistCtx = mistCanvas.getContext('2d');
        const overlayCtx = overlayCanvas.getContext('2d');

        if (mistCtx && overlayCtx) {
          // Update positions
          activeDripsRef.current = updateWaterDrips(
            activeDripsRef.current,
            mistCanvas.height,
            settingsRef.current.dripSpeed * 0.8
          );

          // Carve trails onto mistCanvas
          activeDripsRef.current.forEach(drip => {
            drawDripTrailOnMask(mistCtx, drip);
          });

          // Draw highlights onto overlay canvas
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          
          // Re-draw saved dewdrops
          dewdropsRef.current.forEach(dew => {
            drawDewdropDot(overlayCtx, dew.x, dew.y, dew.radius, dew.color);
          });

          // Draw active drip beads
          activeDripsRef.current.forEach(drip => {
            drawDripHighlights(overlayCtx, drip);
          });

          // Check if all drips finished trickling
          const stillRunning = activeDripsRef.current.some(d => !d.isFinished);
          if (!stillRunning && activeDripsRef.current.length > 0) {
            activeDripsRef.current = [];
            // Save state once drips finish trickling so undo will cleanly revert the entire drip trail
            saveHistoryState();
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [saveHistoryState]);

  // Map pointer client coordinate to canvas coordinate
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = mistCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      time: Date.now(),
      pressure: e.pressure || 0.5,
    };
  };

  // Erase stroke onto mist layer with smoothed path and water edge
  const applyStrokeToMist = (points: Point[], isFinal: boolean = false) => {
    const mistCanvas = mistCanvasRef.current;
    if (!mistCanvas || points.length === 0) return;
    const ctx = mistCanvas.getContext('2d');
    if (!ctx) return;

    const currentSettings = settingsRef.current;
    const currentTool = activeToolRef.current;

    // Apply smoothing filter on coordinates
    const smoothed = smoothPoints(points, currentSettings.smoothingLevel);

    ctx.save();
    // In wipe or drip mode: erase mist to reveal sharp photo
    if (currentTool === 'wipe' || currentTool === 'drip') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      
      const width = currentTool === 'drip' 
        ? Math.max(6, currentSettings.brushSize * 0.5) 
        : currentSettings.brushSize;
      drawSmoothStroke(ctx, smoothed, width);

      // In WIPE mode: ALSO erase any dewdrops, droplets, and highlights on overlayCanvas!
      if (currentTool === 'wipe') {
        const overlayCanvas = overlayCanvasRef.current;
        if (overlayCanvas) {
          const octx = overlayCanvas.getContext('2d');
          if (octx) {
            octx.save();
            octx.globalCompositeOperation = 'destination-out';
            octx.fillStyle = 'rgba(0,0,0,1)';
            octx.strokeStyle = 'rgba(0,0,0,1)';
            drawSmoothStroke(octx, smoothed, width);
            octx.restore();
          }
        }

        // Filter out any dewdrops inside the wiped path
        if (dewdropsRef.current.length > 0) {
          const wipeRadius = width * 0.8;
          dewdropsRef.current = dewdropsRef.current.filter(dew => {
            return !smoothed.some(p => Math.hypot(p.x - dew.x, p.y - dew.y) < wipeRadius);
          });
        }
      }

      // Water meniscus edge sheen (only on wipe)
      if (currentTool === 'wipe' && currentSettings.glassRefraction && isFinal) {
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        drawSmoothStroke(ctx, smoothed, width + 4);
      }
    } else if (currentTool === 'steam') {
      // Re-mist / steam brush
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(240, 245, 250, ${currentSettings.mistDensity * 0.8})`;
      ctx.strokeStyle = `rgba(240, 245, 250, ${currentSettings.mistDensity * 0.8})`;
      drawSmoothStroke(ctx, smoothed, currentSettings.brushSize * 1.5);
    }

    ctx.restore();
  };

  // POINTER DOWN
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    onStartDrawing?.();

    const pt = getCanvasPoint(e);
    isDrawingRef.current = true;
    currentPointsRef.current = [pt];

    const currentTool = activeToolRef.current;
    const currentSettings = settingsRef.current;

    // Tool: Stamp Dewdrop (decorative colored bead like reference photo)
    if (currentTool === 'dewdrop') {
      const radius = currentSettings.brushSize * 0.45;
      dewdropsRef.current.push({
        x: pt.x,
        y: pt.y,
        radius,
        color: currentSettings.dewdropColor,
      });

      // Clear small spot in mist
      const mistCanvas = mistCanvasRef.current;
      if (mistCanvas) {
        const mctx = mistCanvas.getContext('2d');
        if (mctx) {
          mctx.save();
          mctx.globalCompositeOperation = 'destination-out';
          mctx.beginPath();
          mctx.arc(pt.x, pt.y, radius * 0.8, 0, Math.PI * 2);
          mctx.fill();
          mctx.restore();
        }
      }

      // Draw dewdrop on overlay
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const octx = overlay.getContext('2d');
        if (octx) {
          drawDewdropDot(octx, pt.x, pt.y, radius, currentSettings.dewdropColor);
        }
      }
      soundFX.playDripSound();
      saveHistoryState();
      return;
    }

    // Tool: Doodles (wing, sparkle, heart)
    if (currentTool === 'wing' || currentTool === 'sparkle' || currentTool === 'heart') {
      const mistCanvas = mistCanvasRef.current;
      if (mistCanvas) {
        const mctx = mistCanvas.getContext('2d');
        if (mctx) {
          mctx.save();
          mctx.globalCompositeOperation = 'destination-out';
          drawDoodleStamp(mctx, pt.x, pt.y, currentTool, currentSettings.brushSize * 2.2);
          mctx.restore();
        }
      }
      soundFX.playWipeSound(1.2);
      saveHistoryState();
      return;
    }

    // Tool: Drip Pen
    if (currentTool === 'drip') {
      const dripSize = Math.max(6, currentSettings.brushSize * 0.42);
      const newDrip = createWaterDrip(
        pt.x,
        pt.y,
        dripSize,
        Math.min(dimensions.height - pt.y, 80 + Math.random() * 140)
      );
      activeDripsRef.current.push(newDrip);
      soundFX.playDripSound();
      applyStrokeToMist([pt]);
      return;
    }

    // Tool: Wipe (Normal pure wipe start)
    applyStrokeToMist([pt]);
    soundFX.playWipeSound(0.8);
  };

  // POINTER MOVE
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const currentTool = activeToolRef.current;
    if (currentTool === 'dewdrop' || currentTool === 'wing' || currentTool === 'sparkle' || currentTool === 'heart') return;

    const pt = getCanvasPoint(e);
    const pts = currentPointsRef.current;
    const lastPt = pts[pts.length - 1];

    // Distance threshold to avoid zero-length points
    if (lastPt) {
      const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
      if (dist < 3) return;
    }

    pts.push(pt);

    if (currentTool === 'drip') {
      applyStrokeToMist(pts);
      // Spawn trickling water drops along the path as user drags, regulated by dripDensity
      const currentSettings = settingsRef.current;
      const density = currentSettings.dripDensity ?? 0.45;
      
      // Calculate dynamic spacing step based on density (lower density = higher stride/gap)
      // High density (1.0) -> step = 3 points
      // Default density (0.45) -> step = 7 points
      // Low density (0.1) -> step = 16 points
      const stepInterval = Math.max(3, Math.round(18 - density * 15));
      
      // Also apply a probability check so sparse trails don't spawn uniformly
      if (pts.length % stepInterval === 0 && Math.random() < Math.min(1, 0.35 + density * 0.65)) {
        const newDrip = createWaterDrip(
          pt.x,
          pt.y,
          Math.max(5, currentSettings.brushSize * 0.36),
          Math.min(dimensions.height - pt.y, (50 + Math.random() * 90) * (0.6 + density * 0.8))
        );
        activeDripsRef.current.push(newDrip);
        soundFX.playDripSound();
      }
    } else {
      // Pure WIPE or STEAM
      applyStrokeToMist(pts);

      // Audio feedback throttling
      const now = Date.now();
      if (now - lastSoundTimeRef.current > 110) {
        soundFX.playWipeSound(1.0);
        lastSoundTimeRef.current = now;
      }
    }
  };

  // POINTER UP
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const pts = currentPointsRef.current;
    const currentTool = activeToolRef.current;
    const currentSettings = settingsRef.current;

    if (pts.length > 0) {
      if (currentTool === 'wipe') {
        // PURE WIPE: Never spawn drips!
        applyStrokeToMist(pts, true);
        saveHistoryState();
      } else if (currentTool === 'drip') {
        // DRIP TOOL: Add final drip at finish point according to density probability
        const density = currentSettings.dripDensity ?? 0.45;
        // At high/medium density always add finish drip; at very low density (<= 0.2) add only with chance
        if (density > 0.2 || Math.random() < density * 3) {
          const lastPt = pts[pts.length - 1];
          const newDrip = createWaterDrip(
            lastPt.x, 
            lastPt.y, 
            Math.max(6, currentSettings.brushSize * 0.4), 
            Math.min(dimensions.height - lastPt.y, (60 + Math.random() * 110) * (0.6 + density * 0.8))
          );
          activeDripsRef.current.push(newDrip);
          soundFX.playDripSound();
        }
        saveHistoryState();
      } else {
        applyStrokeToMist(pts, true);
        saveHistoryState();
      }
    }
    currentPointsRef.current = [];
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-0 m-0 overflow-hidden select-none"
    >
      {/* Canvas Frame Container filling the entire main page */}
      <div 
        className="relative overflow-hidden bg-neutral-900 mx-auto select-none w-full h-full flex items-center justify-center"
        style={{
          width: `${displaySize.width}px`,
          height: `${displaySize.height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Layer 1: Sharp crisp original image underneath */}
        <canvas
          ref={sharpCanvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />

        {/* Layer 2: Blurred & Misty frosted glass layer (wiped away by user) */}
        <canvas
          ref={mistCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full block touch-none cursor-crosshair z-10"
        />

        {/* Layer 3: Overlay for glossy dewdrops, trickling water highlights & sparkles */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none z-20"
        />

        {/* Layer 3.5: Independent WebGL Rain Shader Layer (Rain on Glass Effect) */}
        <RainCanvas
          ref={rainCanvasRef}
          rainSettings={rainSettings || DEFAULT_RAIN_SETTINGS}
          width={displaySize.width}
          height={displaySize.height}
          internalWidth={dimensions.width}
          internalHeight={dimensions.height}
          backgroundCanvas={sharpCanvasRef.current}
          bgVersion={bgVersion}
        />

        {/* Layer 4: Immersive Window Frame Overlay (Car, Train, Home scene modes) */}
        <WindowFrameOverlay mode={settings.windowMode || 'none'} />

        {/* Breathing fog steam animation overlay */}
        {isBreathing && (
          <div 
            className="absolute inset-0 z-30 pointer-events-none bg-white/40 backdrop-blur-md animate-pulse transition-opacity duration-700 ease-out flex items-center justify-center"
          >
            <div className="text-white/90 text-sm font-mono tracking-widest font-semibold drop-shadow-md">
              BREATHING STEAM...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
