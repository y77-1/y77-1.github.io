import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// 获取 DOM 节点
const container = document.getElementById('app');
// 创建根
const root = createRoot(container);

// 渲染 React 组件
root.render(<App />);
