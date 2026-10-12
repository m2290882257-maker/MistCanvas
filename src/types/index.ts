export type AspectRatioType = '16:9' | '9:16' | '1:2' | '1:1' | 'auto';

export type ToolType = 
  | 'wipe'        // 正常手指/鼠标擦除水雾
  | 'drip'        // 水滴流淌笔 (自动沿重力下落留痕)
  | 'dewdrop'     // 露珠/水滴点缀 (透明凝水珠、红/黄点缀)
  | 'wing'        // 翅膀涂鸦印章 (参考图右上角)
  | 'sparkle'     // 四角星涂鸦印章 (参考图左下角)
  | 'heart'       // 爱心印章
  | 'steam'       // 局部重新哈气起雾 (反向擦除，补雾笔)

export type DewdropColor = 'crystal' | 'ruby' | 'amber' | 'cyan';

export type SmoothingLevel = 'light' | 'natural' | 'high';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
}

export interface CanvasSettings {
  brushSize: number;           // 笔触粗细 (8px - 80px)
  backgroundBlur: number;      // 背景虚化程度 (0px - 35px)
  mistDensity: number;         // 水雾浓度 (0.3 - 0.95)
  smoothingLevel: SmoothingLevel; // 平滑处理强度
  condensationTexture: boolean; // 是否开启微细水珠冷凝噪点
  glassRefraction: boolean;     // 擦拭边缘水光/折射高光
  dripAutoTrickle: boolean;    // 写字停留时是否产生下淌泪痕
  dripSpeed: number;           // 下淌速度 (1 - 5)
  dewdropColor: DewdropColor;  // 点缀水珠颜色
  soundEnabled: boolean;       // 是否开启触感音效
}

export interface Point {
  x: number;
  y: number;
  time: number;
  pressure?: number;
  speed?: number;
}

export interface WaterDrip {
  id: string;
  x: number;
  y: number;
  vy: number;
  length: number;
  size: number;
  maxDistance: number;
  distanceTraveled: number;
  opacity: number;
  trailPoints: { x: number; y: number; width: number }[];
  isFinished: boolean;
  color?: string;
}

export interface DewdropStamp {
  x: number;
  y: number;
  radius: number;
  color: DewdropColor;
}
