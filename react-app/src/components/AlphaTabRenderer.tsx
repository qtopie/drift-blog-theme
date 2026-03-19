// AlphaTabRenderer.tsx (修正后的版本)
import { useEffect, useRef } from 'react';
import { AlphaTabApi } from '@coderline/alphatab';

interface AlphaTabRendererProps {
  tabContent: string; // AlphaTex 源或 URL
  trackIndexes?: string | number[];
  onError?: (err: unknown) => void;
}

const AlphaTabRenderer = ({ tabContent, trackIndexes, onError }: AlphaTabRendererProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const decoded = decodeHtmlEntities(tabContent);

  function decodeHtmlEntities(str: string) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  function sanitizeAlphaTex(raw: string) {
    let tex = raw.trim();
    
    // 1. Remove lines starting with // (comments)
    tex = tex.replace(/^\/\/.*$/gm, '');

    // 2. Convert {key: value} to \key "value" for supported keys
    // Only convert standard AlphaTex metadata tags.
    tex = tex.replace(/^\{(title|subtitle|artist|album|music|words|copyright):\s*(.+)\}$/gmi, '\\$1 "$2"');
    
    // Handle tempo: {tempo: 120} -> \tempo 120
    tex = tex.replace(/^\{tempo:\s*(\d+)\}$/gmi, '\\tempo $1');

    // Remove unsupported {key: value} lines (like {text: ...}) to prevent errors
    tex = tex.replace(/^\{\w+:\s*.+\}$/gm, '');

    // 3. Remove lines that are just '!' or '%'
    tex = tex.replace(/^[!%]\s*$/gm, '');

    // 4. Remove empty lines (optional, but cleaner)
    tex = tex
      .split(/\r?\n/)
      .filter(l => l.trim() !== '')
      .join('\n');

    tex = tex.replace(/note-fret:\s*null/gi, 'note-fret: 0');
    return tex;
  }

  useEffect(() => {
    if (containerRef.current && decoded) {

      let finalTrackIndexes: number[] | undefined;
      if (trackIndexes) {
        if (Array.isArray(trackIndexes)) {
          finalTrackIndexes = trackIndexes.filter(n => Number.isFinite(n));
        } else if (typeof trackIndexes === 'string') {
          finalTrackIndexes = trackIndexes
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => Number.isFinite(n));
        }
        if (!finalTrackIndexes || finalTrackIndexes.length === 0) finalTrackIndexes = undefined;
      }

      // 1. **初始化 AlphaTab 并传入配置**
      // 注意：配置对象作为第二个参数传给构造函数
      const settings = {
        core: { tex: true },
        display: {
          layout: { staffMode: 2, trackPadding: 8 }
        },
        player: { enablePlayer: false }
      } as any;
      const api = new AlphaTabApi(containerRef.current, settings);

      // 2. **加载内容**
      // Fix: 增加换行符检查。AlphaTex 代码通常包含换行，而 URL 不会。
      // 另外，AlphaTex 注释 // 开头会被误判为 protocol-relative URL，所以必须排除多行文本。
      const hasNewlines = decoded.includes('\n') || decoded.includes('\r');
      const isUrl = !hasNewlines && !decoded.includes(' ') && (
        /^(https?:)?\/\//i.test(decoded) || 
        decoded.startsWith('/') || 
        decoded.startsWith('./') || 
        decoded.startsWith('../')
      );

      let success = true;
      if (isUrl) {
        console.log('[AlphaTab] Loading from URL:', decoded);
        success = api.load(decoded, finalTrackIndexes);
      } else {
        try {
          const cleaned = sanitizeAlphaTex(decoded);
          console.log('[AlphaTab] Rendering AlphaTex:', cleaned);
          // api.tex() renders the score from string
          api.tex(cleaned, finalTrackIndexes);
        } catch (e) {
          console.error('[AlphaTab] Failed to parse AlphaTex:', e);
          onError?.(e);
          success = false;
        }
      }

      if (!success) {
        console.error("AlphaTab: Score data format not supported.");
      }

      // 3. 清理函数
      return () => {
        api.destroy();
      };
    }
  }, [decoded, trackIndexes, onError]);

  return <div ref={containerRef} className="alphatab-viewer"></div>;
};

export default AlphaTabRenderer;