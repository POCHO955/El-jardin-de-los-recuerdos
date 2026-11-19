# El Jardín de los Recuerdos

Sitio web donde plantas recuerdos y los ves crecer como flores. Cada emoción tiene su propia flor (alegría, amor, nostalgia, gratitud, calma, tristeza).

**Sitio en vivo:** _pega aquí tu URL de Vercel_

## Qué puedes hacer

- **Plantar** un recuerdo con texto, emoción y fecha (crear).
- **Ver** tu jardín de flores (leer).
- **Filtrar** por emoción y **ordenar** por fecha.
- **Editar** un recuerdo desde su flor (actualizar).
- **Arrancar** una flor para borrar el recuerdo (eliminar).

Los recuerdos se guardan en una base SQLite y siguen ahí al recargar la página.

## Tecnologías

- Vite + TypeScript
- SQLite en el navegador con [sql.js](https://github.com/sql-js/sql.js)
- Persistencia: la base se exporta a `localStorage` tras cada cambio
- Arquitectura MVC (`models`, `views`, `controllers`)
- Despliegue en Vercel

## Estructura

```
src/
├── main.ts                    # Punto de entrada
├── db/database.ts             # Conexión SQLite y persistencia
├── models/recuerdo.ts         # CRUD de recuerdos
├── views/jardinView.ts        # Interfaz
├── controllers/jardinController.ts
└── styles/styles.css
```

## Cómo ejecutarlo

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # compilación para producción
npm run preview  # probar la compilación
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel: **Add New → Project** e importa el repositorio.
3. Framework: Vite (se detecta solo). Build command `npm run build`, output `dist`.
4. Pulsa **Deploy**.

## Nota

Como Vercel es serverless y de solo lectura, la base SQLite vive en el navegador de cada persona. Por eso cada visitante ve su propio jardín.
# El-jardin-de-los-recuerdos
