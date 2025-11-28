// react-app/src/utils/mount.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

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

// 同一个容器中挂载多个组件
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