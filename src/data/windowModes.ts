import { WindowMode } from '../types';

export interface WindowModeInfo {
  id: WindowMode;
  nameEn: string;
  nameZh: string;
  subtitleEn: string;
  subtitleZh: string;
  descEn: string;
  descZh: string;
  tagEn: string;
  tagZh: string;
  recommendedBgId?: string;
  badge?: string;
}

export const WINDOW_MODES: WindowModeInfo[] = [
  {
    id: 'none',
    nameEn: 'Pure Glass (Borderless)',
    nameZh: '纯净无框 (全屏画板)',
    subtitleEn: 'Seamless edge-to-edge canvas',
    subtitleZh: '满屏通透开阔，无边框遮挡',
    descEn: 'Classic edge-to-edge frosted glass without any surrounding vehicle or interior frame.',
    descZh: '经典全景通透水雾玻璃，无任何外框遮挡，最大化手绘创作视野。',
    tagEn: 'Full Screen',
    tagZh: '满屏全景',
    badge: 'DEFAULT',
  },
  {
    id: 'car',
    nameEn: 'Car Window',
    nameZh: '汽车车窗 (雨夜车旅)',
    subtitleEn: 'Automotive door trim & rubber seal',
    subtitleZh: '车门内饰皮革、橡胶密封压条与遮阳顶带',
    descEn: 'Rainy highway or city night drive. Features leatherette interior trim, rubber weatherstrip bead, upper sun-tint visor, and tempered safety glass markings.',
    descZh: '沉浸式雨夜车内视角。配备汽车真皮门饰、橡胶密封条、车窗升降按键暗纹、顶部遮阳滤光渐变带与角部钢化玻璃安全认证标识。',
    tagEn: 'Automotive',
    tagZh: '汽车情境',
    recommendedBgId: 'rainy-city',
  },
  {
    id: 'train',
    nameEn: 'High-Speed Train',
    nameZh: '动车高铁 (极速穿行)',
    subtitleEn: 'CRH aerodynamic rounded window & sill',
    subtitleZh: '流线圆角车窗、哑光内饰壳与置物窗台',
    descEn: 'High-speed rail journey gazing through rainy landscapes. Deep rounded-corner aperture, sleek composite shell, sunblind track, and utility cup ledge.',
    descZh: '疾驰高铁列车车厢视角。标志性大弧度流线圆角窗框、防眩哑光内饰面板、隐藏式遮阳卷帘导轨与经典的列车置物窗台。',
    tagEn: 'Bullet Train',
    tagZh: '动车高铁',
    recommendedBgId: 'forest-mist',
  },
  {
    id: 'home',
    nameEn: 'Cozy Home Window',
    nameZh: '家中的窗口 (温馨居室)',
    subtitleEn: 'Warm timber casing & bay windowsill',
    subtitleZh: '温润原木框体、飘窗窗台与复古窗锁',
    descEn: 'Warm indoor sanctuary looking at cold rain outside. Crafted with rich woodgrain casing, mitered joinery, antique brass sash latch, and a deep timber windowsill.',
    descZh: '温馨家中倚窗看雨情调。精工原木质感窗套、45度榫接角饰、复古黄铜旋钮窗锁，以及宽敞深厚的实木飘窗台板。',
    tagEn: 'Interior',
    tagZh: '家居飘窗',
    recommendedBgId: 'cozy-cafe',
  },
];
