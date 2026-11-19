import './styles/styles.css';
import { initDB } from './db/database';
import { JardinView } from './views/jardinView';
import { JardinController } from './controllers/jardinController';

async function arrancar() {
  try {
    await initDB();
    new JardinController(new JardinView()).iniciar();
  } catch (e) {
    console.error(e);
    const j = document.getElementById('jardin');
    if (j) j.innerHTML = '<p class="vacio">No se pudo abrir la base de datos. Recarga la página para intentarlo de nuevo.</p>';
  }
}

arrancar();
