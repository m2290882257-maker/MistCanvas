import { BackgroundPreset } from '../types';

import roseBouquetImg from '../assets/images/misty_rose_bouquet_1791732719105.jpg';
import rainyCityImg from '../assets/images/rainy_city_neon_1791732731966.jpg';
import cozyCafeImg from '../assets/images/cozy_cafe_window_1791732745056.jpg';
import forestMistImg from '../assets/images/forest_mountain_mist_1791732757678.jpg';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'rose-bouquet',
    name: '浪漫花束 (参考图同款)',
    category: '花卉与艺术',
    url: roseBouquetImg,
    description: '浓郁粉红与勃艮第玫瑰郁金香花艺，柔和暖调与微光，擦拭效果最惊艳',
  },
  {
    id: 'rainy-city',
    name: '雨夜都市霓虹',
    category: '雨夜与街景',
    url: rainyCityImg,
    description: '湿润街道与流光溢彩的霓虹光斑，透出城市夜色浪漫',
  },
  {
    id: 'cozy-cafe',
    name: '温暖街角咖啡馆',
    category: '室内与氛围',
    url: cozyCafeImg,
    description: '隔着雨幕玻璃望向温热的爱迪生灯光、木质桌椅与冒热气的咖啡',
  },
  {
    id: 'forest-mist',
    name: '晨曦松林晨雾',
    category: '自然与风光',
    url: forestMistImg,
    description: '静谧山峦与湖畔雾气，初升朝阳穿透杉树林投下金色光束',
  },
];
