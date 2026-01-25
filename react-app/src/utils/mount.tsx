// react-app/src/utils/mount.tsx
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import React from 'react';
import { createRoot } from 'react-dom/client';

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