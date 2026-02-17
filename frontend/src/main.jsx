import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Swal from 'sweetalert2';

// Solo configuramos que no bloquee el foco, sin crear "mixins" complejos
// que puedan afectar el renderizado inicial.
const originalFire = Swal.fire;
Swal.fire = function(...args) {
  return originalFire.apply(this, args).then((result) => {
    document.getElementById('root')?.removeAttribute('aria-hidden');
    return result;
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)