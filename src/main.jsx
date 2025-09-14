// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import InitInfoPanel from './plugins/InitInfoPanel.jsx';
import LastMessagePreview from './plugins/LastMessagePreview.jsx';
import Publisher from './plugins/Publisher.jsx'; // 선택

const plugins = [
  { id: 'init',    title: 'Init Info',            Component: InitInfoPanel },
  { id: 'preview', title: 'Last Message Preview', Component: LastMessagePreview },
  // { id: 'pub',     title: 'Publisher (optional)', Component: Publisher },
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App plugins={plugins} />
  </React.StrictMode>,
);
