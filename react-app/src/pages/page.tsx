// react-app/src/pages/single.tsx
import ScrollToTop from '../components/ScrollToTop';
import MermaidLoader from '../components/Mermaid';
import { mountComponents } from '../utils/mount';

// Mount a Fluent-styled composite component
mountComponents('react-app-components', [ScrollToTop, MermaidLoader]);