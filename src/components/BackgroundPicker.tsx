import React, { useRef, useState, useEffect } from 'react';
import { BACKGROUND_PRESETS } from '../data/presets';
import { WINDOW_MODES } from '../data/windowModes';
import { WindowMode, Language } from '../types';
import { 
  X, 
  Upload, 
  Check, 
  Sparkles, 
  Car, 
  Train, 
  Home, 
  Maximize2, 
  Layers, 
  ImageIcon, 
  ArrowRight,
  Trash2,
  Images
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  timestamp: number;
}

const GALLERY_STORAGE_KEY = 'mist_canvas_custom_gallery';
const DELETE_REMEMBER_KEY = 'mist_canvas_gallery_delete_remember';

const loadSavedPhotos = (): GalleryPhoto[] => {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load saved gallery photos:', e);
  }
  return [];
};

interface BackgroundPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl: string;
  onSelectPreset: (url: string) => void;
  onCustomImageUpload: (dataUrl: string) => void;
  windowMode: WindowMode;
  onSelectWindowMode: (mode: WindowMode) => void;
  language?: Language;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  isOpen,
  onClose,
  currentBgUrl,
  onSelectPreset,
  onCustomImageUpload,
  windowMode,
  onSelectWindowMode,
  language = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'mode' | 'background'>('background');
  const [customPhotos, setCustomPhotos] = useState<GalleryPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom gallery photos & preferences from localStorage on mount
  useEffect(() => {
    setCustomPhotos(loadSavedPhotos());
    const remembered = localStorage.getItem(DELETE_REMEMBER_KEY) === 'true';
    setDontAskAgain(remembered);
  }, []);

  if (!isOpen) return null;

  const isZh = language === 'zh';

  const saveGalleryToStorage = (photos: GalleryPhoto[]) => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.warn('LocalStorage quota reached, trimming gallery:', e);
      try {
        // Fallback: keep most recent 6 photos
        const trimmed = photos.slice(0, 6);
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(trimmed));
      } catch (err) {
        console.error('Unable to persist gallery to storage:', err);
      }
    }
  };

  const compressImageForStorage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1920;
          const maxHeight = 1080;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessFiles = async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isZh ? '请选择有效的图片文件 (JPG / PNG / WebP)' : 'Please select a valid image file (JPG / PNG / WebP)');
      return;
    }

    try {
      const dataUrl = await compressImageForStorage(file);
      const newPhoto: GalleryPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: dataUrl,
        name: file.name ? file.name.replace(/\.[^/.]+$/, '') : (isZh ? `自选相片 ${customPhotos.length + 1}` : `Photo ${customPhotos.length + 1}`),
        timestamp: Date.now(),
      };

      const updated = [newPhoto, ...customPhotos];
      setCustomPhotos(updated);
      saveGalleryToStorage(updated);

      // Apply as current background
      onCustomImageUpload(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleRequestDeletePhoto = (photo: GalleryPhoto) => {
    const remembered = localStorage.getItem(DELETE_REMEMBER_KEY) === 'true';
    if (remembered || dontAskAgain) {
      executeDelete(photo);
    } else {
      setPhotoToDelete(photo);
      setRememberChoice(false);
    }
  };

  const executeDelete = (photo: GalleryPhoto) => {
    const updated = customPhotos.filter((p) => p.id !== photo.id);
    setCustomPhotos(updated);
    saveGalleryToStorage(updated);

    // If currently selected background is deleted, fallback to default preset
    if (currentBgUrl === photo.url) {
      const fallbackUrl = BACKGROUND_PRESETS.find((p) => p.id === 'rainy-city')?.url || BACKGROUND_PRESETS[1].url;
      onSelectPreset(fallbackUrl);
    }
  };

  const handleConfirmDelete = () => {
    if (!photoToDelete) return;
    if (rememberChoice) {
      try {
        localStorage.setItem(DELETE_REMEMBER_KEY, 'true');
        setDontAskAgain(true);
      } catch (e) {
        console.warn('Failed to save delete preference:', e);
      }
    }
    executeDelete(photoToDelete);
    setPhotoToDelete(null);
  };

  const getModeIcon = (modeId: WindowMode) => {
    switch (modeId) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'none':
      default:
        return <Maximize2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl p-5 sm:p-6 text-neutral-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider">
                {isZh ? '场景模式与背景设置' : 'SCENE MODE & BACKGROUND'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                {isZh ? '情境画框' : 'IMMERSIVE FRAMES'}
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              {isZh 
                ? '切换车窗、高铁动车窗或居室木窗情境，营造不同场景的起雾体验' 
                : 'Switch between car, high-speed train, or home window frames'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: MODE (窗框情境) vs BACKGROUND (窗外壁纸) */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-black/40 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('mode')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all duration-200 ${
              activeTab === 'mode'
                ? 'bg-white text-neutral-950 shadow-md shadow-white/10 scale-[1.01]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isZh ? 'MODE · 窗框情境模式' : 'MODE · SCENE FRAME'}</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all duration-200 ${
              activeTab === 'background'
                ? 'bg-white text-neutral-950 shadow-md shadow-white/10 scale-[1.01]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isZh ? 'WALLPAPER · 窗外景观背景' : 'WALLPAPER · BACKGROUND'}</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="mt-4 overflow-y-auto pr-1 space-y-5 flex-1">
          {/* ======================================================== */}
          {/* TAB 1: WINDOW MODE SECTION                                */}
          {/* ======================================================== */}
          {activeTab === 'mode' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
                <span>{isZh ? '选择真实视窗情境画框：' : 'SELECT SCENIC WINDOW FRAME:'}</span>
                <span className="text-[11px] text-amber-300">
                  {isZh ? '即点即换 · 带入真实场景' : 'Real-time immersive overlay'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {WINDOW_MODES.map((mode) => {
                  const isSelected = windowMode === mode.id;
                  const recPreset = mode.recommendedBgId 
                    ? BACKGROUND_PRESETS.find(p => p.id === mode.recommendedBgId) 
                    : null;

                  return (
                    <div
                      key={mode.id}
                      onClick={() => onSelectWindowMode(mode.id)}
                      className={`group relative rounded-2xl p-4 border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white/10 border-white ring-2 ring-white/50 shadow-xl scale-[1.02]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06] hover:scale-[1.01]'
                      }`}
                    >
                      {/* Top Row: Icon + Title + Selected Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl border ${
                            isSelected 
                              ? 'bg-white text-neutral-950 border-white' 
                              : 'bg-white/10 text-neutral-200 border-white/10 group-hover:bg-white/20'
                          }`}>
                            {getModeIcon(mode.id)}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{isZh ? mode.nameZh : mode.nameEn}</span>
                            </div>
                            <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 border border-white/5 inline-block mt-0.5">
                              {isZh ? mode.tagZh : mode.tagEn}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-md shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Mini Visual Silhouette Preview */}
                      <div className="mt-3.5 mb-2.5 w-full h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 relative flex items-center justify-center">
                        {mode.id === 'none' && (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-neutral-400 border border-dashed border-white/20 m-1.5 rounded-lg">
                            <span>{isZh ? '纯净通透 · 无外框遮挡' : 'PURE BORDERLESS GLASS'}</span>
                          </div>
                        )}

                        {mode.id === 'car' && (
                          <div className="w-full h-full p-1.5 flex flex-col justify-between bg-gradient-to-b from-[#101115] to-[#181920]">
                            {/* Car frame header */}
                            <div className="w-full h-2 bg-[#22242c] rounded-t border-b border-black/50" />
                            <div className="flex-1 border-x-4 border-[#0c0d10] mx-1 rounded-sm flex items-center justify-center bg-black/30">
                              <span className="text-[9px] font-mono text-neutral-400">
                                ◬ AUTO GLASS TEMPERED
                              </span>
                            </div>
                            {/* Car armrest */}
                            <div className="w-full h-3 bg-[#131418] rounded-b border-t border-[#292b34] flex items-center justify-center gap-2">
                              <div className="w-4 h-1 bg-[#282a32] rounded-full" />
                            </div>
                          </div>
                        )}

                        {mode.id === 'train' && (
                          <div className="w-full h-full p-1.5 flex flex-col justify-between bg-[#d6dbe3]">
                            {/* Train shell */}
                            <div className="w-full h-1.5 bg-[#bcc2cc] rounded-t flex items-center justify-center">
                              <div className="w-8 h-0.5 bg-neutral-600 rounded-full" />
                            </div>
                            <div className="flex-1 border-[3px] border-[#a9afba] mx-2 my-0.5 rounded-2xl flex items-center justify-center bg-black/40">
                              <span className="text-[9px] font-mono font-bold text-neutral-200">
                                CRH · 08F
                              </span>
                            </div>
                            {/* Train sill */}
                            <div className="w-full h-2.5 bg-[#c5cbd4] rounded-b border-t border-white/50 flex items-center justify-between px-2">
                              <div className="w-2 h-2 rounded-full bg-[#9aa1ad]" />
                              <div className="w-10 h-1 bg-[#9aa1ad] rounded-full" />
                            </div>
                          </div>
                        )}

                        {mode.id === 'home' && (
                          <div className="w-full h-full p-1.5 flex flex-col justify-between bg-[#382317]">
                            {/* Wooden casing */}
                            <div className="w-full h-2 bg-[#4a3020] rounded-t border-b border-black/40" />
                            <div className="flex-1 border-4 border-[#2c190f] mx-1 rounded-sm flex items-center justify-center bg-black/30 relative">
                              <span className="text-[9px] font-serif italic text-amber-200/80">
                                Cozy Sanctuary
                              </span>
                              <div className="absolute right-1 w-1.5 h-3 rounded-sm bg-amber-400/80" />
                            </div>
                            {/* Timber sill */}
                            <div className="w-full h-3 bg-[#523522] rounded-b border-t border-[#6d4830] flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400/30" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Subtitle / Description */}
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        {isZh ? mode.subtitleZh : mode.subtitleEn}
                      </p>

                      {/* Recommended Pairing Quick Apply */}
                      {recPreset && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span className="truncate">
                            {isZh ? `推荐背景: ${recPreset.name}` : `Best with: ${recPreset.name}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectWindowMode(mode.id);
                              onSelectPreset(recPreset.url);
                              onClose();
                            }}
                            className="shrink-0 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center gap-1"
                            title={isZh ? '同时应用该窗框模式与推荐景观壁纸' : 'Apply both mode and wallpaper'}
                          >
                            <span>{isZh ? '搭配应用' : 'Apply Pair'}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: BACKGROUND WALLPAPERS & CUSTOM UPLOAD              */}
          {/* ======================================================== */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              {/* Upload Custom Image Area */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleProcessFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                    isDragging 
                      ? 'border-sky-400 bg-sky-500/15 scale-[1.01]' 
                      : 'border-white/20 hover:border-white/50 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center transition-all mb-2 ${
                    isDragging ? 'bg-sky-500 text-white scale-110' : 'bg-white/10 text-neutral-300 group-hover:scale-105 group-hover:text-white'
                  }`}>
                    <Upload className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-neutral-200 group-hover:text-white uppercase tracking-wider">
                    {isDragging
                      ? (isZh ? '松开鼠标立即上传相片' : 'DROP PHOTO TO UPLOAD')
                      : (isZh ? '点击或拖拽上传自定义背景相片' : 'CLICK OR DROP CUSTOM PHOTO')}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 mt-1">
                    {isZh ? '支持 JPG / PNG / WebP · 自动加入下方画廊暂存' : 'Supports JPG, PNG, WebP · Staged in gallery below'}
                  </span>
                </div>
              </div>

              {/* Preset Gallery (Default 4 Presets) */}
              <div>
                <div className="flex items-center gap-1.5 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isZh ? '精选氛围景观壁纸' : 'ATMOSPHERIC PRESETS'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {BACKGROUND_PRESETS.map((preset) => {
                    const isSelected = currentBgUrl === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          onSelectPreset(preset.url);
                          onClose();
                        }}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-white ring-2 ring-white/50 shadow-xl scale-[1.02]'
                            : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Active Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Caption Overlays */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-left">
                            <div className="text-sm font-semibold text-white drop-shadow-sm flex items-center gap-1.5">
                              {preset.name}
                            </div>
                            <div className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 opacity-90">
                              {preset.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHOTO GALLERY (用户上传自定义相片暂存区) */}
              {customPhotos.length > 0 && (
                <div className="pt-2 animate-fade-in">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    <div className="flex items-center gap-1.5 text-neutral-200">
                      <Images className="w-4 h-4 text-sky-400" />
                      <span>PHOTO GALLERY</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/20 ml-1">
                        {customPhotos.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {dontAskAgain && (
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem(DELETE_REMEMBER_KEY);
                            setDontAskAgain(false);
                          }}
                          className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 underline"
                          title={isZh ? '恢复删除确认弹窗提示' : 'Restore delete confirmation prompt'}
                        >
                          {isZh ? '恢复删除提示' : 'Reset prompt'}
                        </button>
                      )}
                      <span className="text-[11px] text-neutral-400 font-normal hidden sm:inline">
                        {isZh ? '点击照片可重新编辑' : 'Click to select and edit'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {customPhotos.map((photo) => {
                      const isSelected = currentBgUrl === photo.url;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => {
                            onSelectPreset(photo.url);
                            onClose();
                          }}
                          className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-white ring-2 ring-white/50 shadow-xl scale-[1.02]'
                              : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                          }`}
                        >
                          {/* Thumbnail Image */}
                          <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Active Checkmark Badge on Top-Left */}
                            {isSelected && (
                              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-md z-10">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}

                            {/* Small Delete Button on Top-Right */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDeletePhoto(photo);
                              }}
                              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-neutral-300 hover:text-white flex items-center justify-center shadow-md backdrop-blur-sm transition-all border border-white/20 hover:border-rose-500 z-10 active:scale-90"
                              title={isZh ? '从 PHOTO GALLERY 删除此照片' : 'Delete photo from gallery'}
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            {/* Caption Overlays */}
                            <div className="absolute bottom-2.5 left-3 right-10 text-left">
                              <div className="text-sm font-semibold text-white drop-shadow-sm truncate">
                                {photo.name}
                              </div>
                              <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                                {new Date(photo.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-neutral-400">
            {isZh 
              ? `当前模式: ${WINDOW_MODES.find(m => m.id === windowMode)?.nameZh || '纯净'}` 
              : `Active Mode: ${WINDOW_MODES.find(m => m.id === windowMode)?.nameEn || 'Pure'}`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md"
          >
            {isZh ? '完成设置' : 'DONE'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal with '保持默认选择' Checkbox */}
      {photoToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPhotoToDelete(null)}
        >
          <div 
            className="relative w-full max-w-sm bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl p-5 text-neutral-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-sm text-white tracking-wide">
                  {isZh ? '确认删除照片？' : 'DELETE PHOTO?'}
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  {isZh ? '从 PHOTO GALLERY 移除' : 'Remove from PHOTO GALLERY'}
                </span>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 my-2.5 bg-black/60">
              <img 
                src={photoToDelete.url} 
                alt={photoToDelete.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-2 right-2 text-[11px] font-mono text-white/90 truncate bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                {photoToDelete.name}
              </div>
            </div>

            <p className="text-xs font-mono text-neutral-300 leading-relaxed mb-3">
              {isZh 
                ? '确认从 PHOTO GALLERY 中删除该照片吗？此操作无法撤销。' 
                : 'Are you sure you want to remove this photo from your gallery? This cannot be undone.'}
            </p>

            {/* Checkbox: 保持默认选择 */}
            <label className="flex items-center gap-2.5 mb-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer select-none transition-colors group">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-black/50 text-sky-500 accent-sky-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-neutral-300 group-hover:text-white transition-colors">
                {isZh ? '保持默认选择（后续直接删除，不再提示）' : 'Remember choice (do not ask again)'}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white transition-colors"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-colors"
              >
                {isZh ? '确认删除' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
