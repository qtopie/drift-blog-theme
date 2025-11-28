// react-app/src/pages/single.tsx
import { LikeButton } from '../components/LikeButton';
import ScrollToTop from '../components/ScrollToTop';
import { mountComponents } from '../utils/mount';

// 挂载
// 推荐：一次性在同一容器挂载多个组件
mountComponents('react-single-actions', [ScrollToTop, LikeButton]);