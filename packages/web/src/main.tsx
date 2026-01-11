// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';  // 使用 createRoot 从 react-dom/client 导入
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// 创建根容器
const root = ReactDOM.createRoot(document.getElementById('root')!);

// 渲染应用
root.render(
  <Router>  {/* 确保应用被 Router 包裹 */}
    <App />
  </Router>
);
