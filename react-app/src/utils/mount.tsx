// react-app/src/utils/mount.tsx (clean rewrite)
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import AlphaTabRenderer from '../components/AlphaTabRenderer';

// 定义挂载函数的类型
export const mountComponent = (
  elementId: string,
  Component: React.ComponentType<any>
) => {
  const container = document.getElementById(elementId);

  if (container) {
    const root = createRoot(container);
    // 获取 Hugo 传递的 data-* 属性
    const props = { ...container.dataset };

    root.render(
      <React.StrictMode>
        {/* Fluent UI 必须包裹 Provider */}
        <FluentProvider theme={webLightTheme}>
          <Component {...props} />
        </FluentProvider>
      </React.StrictMode>
    );
  }
};

// Mount multiple components inside the same container.
export const mountComponents = (
  elementId: string,
  components: Array<React.ComponentType<any>>
) => {
  const container = document.getElementById(elementId);
  if (!container) return;
  const root = createRoot(container);
  const props = { ...container.dataset };
  root.render(
    <React.StrictMode>
      <FluentProvider theme={webLightTheme}>
        {components.map((Comp, idx) => (
          <Comp key={idx} {...props} />
        ))}
      </FluentProvider>
    </React.StrictMode>
  );
};

// Mount AlphaTab containers: expects each `.alphatab-container` to include
// a <script type="text/alphatex" class="alphatab-data"> with AlphaTex source.
export const mountAlphaTabs = () => {
  const containers = document.querySelectorAll<HTMLElement>('.alphatab-container');

  containers.forEach(container => {
    const script = container.querySelector<HTMLScriptElement>('script.alphatab-data, script.alphatex');
    const source = script?.textContent?.trim() || '';
    if (!source) {
      console.warn('[AlphaTab] Missing alphatex source in container', container);
      return;
    }
    const trackIndexesRaw = container.dataset.trackIndexes || '';
    const trackIndexes = trackIndexesRaw || undefined;
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <FluentProvider theme={webLightTheme}>
          <AlphaTabRenderer
            tabContent={source}
            trackIndexes={trackIndexes}
            onError={(e: unknown) => {
              console.error('[AlphaTabRenderer] Render error:', e);
              // Preserve script; remove others then show error message.
              Array.from(container.children).forEach(child => {
                if (child !== script) child.remove();
              });
              const errorEl = document.createElement('div');
              errorEl.style.color = '#c00';
              errorEl.style.fontSize = '14px';
              errorEl.textContent = '乐谱解析失败，请检查 AlphaTex 内容。';
              container.appendChild(errorEl);
            }}
          />
        </FluentProvider>
      </React.StrictMode>
    );
  });
};