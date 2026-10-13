import React, { useRef } from 'react';
import { BACKGROUND_PRESETS } from '../data/presets';
import { X, Upload, Check, Sparkles } from 'lucide-react';

interface BackgroundPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl: string;
  onSelectPreset: (url: string) => void;
  onCustomImageUpload: (dataUrl: string) => void;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  isOpen,
  onClose,
  currentBgUrl,
  onSelectPreset,
  onCustomImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG / PNG / WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onCustomImageUpload(result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl p-6 text-neutral-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-mono font-bold tracking-wider">WINDOW BACKGROUND</h2>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Choose curated atmospheric presets or upload your own custom photo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Custom Image Area */}
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-white/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-white/5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-neutral-300 group-hover:scale-105 group-hover:text-white transition-all mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-mono font-bold text-neutral-200 group-hover:text-white">
              CLICK OR DROP CUSTOM PHOTO
            </span>
            <span className="text-xs font-mono text-neutral-400 mt-1">
              Supports JPG, PNG, WebP · High-speed client-side rendering
            </span>
          </div>
        </div>

        {/* Preset Gallery */}
        <div className="mt-6">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ATMOSPHERIC PRESETS</span>
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
      </div>
    </div>
  );
};
