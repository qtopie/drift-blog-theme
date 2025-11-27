// react-app/src/pages/home.tsx
import { mountComponent } from '../utils/mount';
import { ThreeHero } from '../components/ThreeHero';

// 挂载到 ID 为 'react-home-root' 的 div
mountComponent('react-home-root', ThreeHero);