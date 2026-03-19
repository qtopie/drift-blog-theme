// react-app/src/pages/page.tsx
import ScrollToTop from '../components/ScrollToTop';
import D2Lightbox from '../components/D2Lightbox';
import { mountComponents } from '../utils/mount';

// Mount a Fluent-styled composite component
mountComponents('react-app-components', [ScrollToTop, D2Lightbox]);
