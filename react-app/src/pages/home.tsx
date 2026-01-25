// react-app/src/pages/home.tsx
import { mountComponents } from '../utils/mount';
import { C60 } from '../components/C60';

// 挂载到 ID 为 'react-home-root' 的 div
mountComponents('react-home-root', [C60]);