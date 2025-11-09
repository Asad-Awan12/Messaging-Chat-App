import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './AppRoutes.jsx'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import store from './redux/stote.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
    <AppRoutes />

  </BrowserRouter>
  </Provider>
  
)
