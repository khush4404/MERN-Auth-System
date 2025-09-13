// Initialize theme (dark mode is handled in the store)
import { useThemeStore } from './store/themeStore';
useThemeStore.getState().initTheme();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import createRoutes from './routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {createRoutes()}
  </StrictMode>,
)
