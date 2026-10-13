import { BackgroundPreset } from '../types';

import roseBouquetImg from '../assets/images/misty_rose_bouquet_1791732719105.jpg';
import rainyCityImg from '../assets/images/rainy_city_neon_1791732731966.jpg';
import cozyCafeImg from '../assets/images/cozy_cafe_window_1791732745056.jpg';
import forestMistImg from '../assets/images/forest_mountain_mist_1791732757678.jpg';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'rose-bouquet',
    name: 'Romantic Floral Bouquet',
    category: 'Botanical & Art',
    url: roseBouquetImg,
    description: 'Pink roses and burgundy tulips with soft moody lighting, matching the reference photo',
  },
  {
    id: 'rainy-city',
    name: 'Rainy Tokyo Neon Lights',
    category: 'City & Rain',
    url: rainyCityImg,
    description: 'Glistening wet street bokeh and vibrant neon reflections through rain glass',
  },
  {
    id: 'cozy-cafe',
    name: 'Cozy Warm Parisian Cafe',
    category: 'Interior & Warmth',
    url: cozyCafeImg,
    description: 'Amber Edison lamps, wooden tables and steaming cappuccino seen from rainy window',
  },
  {
    id: 'forest-mist',
    name: 'Misty Alpine Lake Sunrise',
    category: 'Nature & Landscape',
    url: forestMistImg,
    description: 'Morning fog rising over tranquil mountain lake with golden sun rays filtering through evergreens',
  },
];
