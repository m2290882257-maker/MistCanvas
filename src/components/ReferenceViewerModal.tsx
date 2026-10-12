import React from 'react';
import { X, Sparkles, Droplets, Feather } from 'lucide-react';

interface ReferenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceViewerModal: React.FC<ReferenceViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl p-6 text-neutral-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>参考图艺术效果解析</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              模拟在雾蒙蒙的玻璃上写字与涂鸦的唯美氛围
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Tips */}
        <div className="mt-4 space-y-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              ✨ 创作小贴士 (与参考图保持一致)
            </h3>
            <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">1.</span>
                <span><strong>背景选择：</strong> 选用默认预设中的第一张「浪漫花束」，与参考图的郁金香与玫瑰背景一致。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">2.</span>
                <span><strong>连笔手写：</strong> 用手指或鼠标写出英文花体或连笔字，系统会自动对颤抖线条做圆滑处理，使线条圆润流畅。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">3.</span>
                <span><strong>泪痕流淌效果：</strong> 切换为「泪痕流淌」笔或点击「生成水滴」，即可在笔画末端生成如参考图中垂落的真实水痕。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">4.</span>
                <span><strong>彩色凝水珠点缀：</strong> 使用「水珠印章」工具，并在工具栏上方挑选红色或黄色水珠，点缀在文字边缘。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">5.</span>
                <span><strong>边角涂鸦：</strong> 顶部工具栏备有参考图同款的天使翅膀、四角星芒与爱心印章，一键盖印。</span>
              </li>
            </ul>
          </div>

          {/* Inspirational quotes */}
          <div>
            <h4 className="text-xs font-medium text-neutral-400 mb-2">
              📝 经典参考词句推荐：
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-serif italic text-rose-200">
                “We're close together like a bouquet of flowers”
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-serif italic text-sky-200">
                “Rainy days with warm memories ☕”
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-serif italic text-amber-200">
                “窗外是雨，心里有你 ♡”
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-md"
            >
              我知道了，开始创作
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
