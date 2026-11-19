import initSqlJs, { Database } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const CLAVE = 'jardin-recuerdos-db';
let db: Database;

function aBase64(bytes: Uint8Array): string {
  let s = '';
  const trozo = 0x8000;
  for (let i = 0; i < bytes.length; i += trozo) {
    s += String.fromCharCode(...bytes.subarray(i, i + trozo));
  }
  return btoa(s);
}

function desdeBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** Abre la base SQLite (en el navegador) y la restaura desde localStorage si existe. */
export async function initDB(): Promise<Database> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });

  let guardada: string | null = null;
  try {
    guardada = localStorage.getItem(CLAVE);
  } catch {
    guardada = null;
  }

  try {
    db = guardada ? new SQL.Database(desdeBase64(guardada)) : new SQL.Database();
  } catch {
    db = new SQL.Database(); // datos corruptos: empezamos de cero
    guardada = null;
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS recuerdos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT NOT NULL,
      emocion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      creado_en TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const total = db.exec('SELECT COUNT(*) FROM recuerdos')[0].values[0][0] as number;
  if (!guardada && total === 0) {
    db.run(
      `INSERT INTO recuerdos (texto, emocion, fecha) VALUES
        ('El primer día que vi el mar con mi familia', 'alegria', '2015-07-12'),
        ('Las tardes de domingo en casa de la abuela', 'nostalgia', '2012-03-04'),
        ('Mi mejor amigo me ayudó a estudiar para el examen final', 'gratitud', '2024-11-20');`
    );
    persistir();
  }
  return db;
}

export function getDB(): Database {
  return db;
}

/** Guarda la base completa en localStorage para que sobreviva a recargas. */
export function persistir(): void {
  try {
    localStorage.setItem(CLAVE, aBase64(db.export()));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}
