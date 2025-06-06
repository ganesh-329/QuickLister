import { createRoot } from 'react-dom/client';
import AppWithAuth from './App';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <AppWithAuth />
);
