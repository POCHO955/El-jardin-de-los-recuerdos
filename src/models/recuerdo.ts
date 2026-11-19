import { getDB, persistir } from '../db/database';

export type Emocion = 'alegria' | 'amor' | 'nostalgia' | 'gratitud' | 'calma' | 'tristeza';

export const EMOCIONES: Record<Emocion, { flor: string; nombre: string }> = {
  alegria: { flor: '🌻', nombre: 'Alegría' },
  amor: { flor: '🌹', nombre: 'Amor' },
  nostalgia: { flor: '🪻', nombre: 'Nostalgia' },
  gratitud: { flor: '🌷', nombre: 'Gratitud' },
  calma: { flor: '🌸', nombre: 'Calma' },
  tristeza: { flor: '🥀', nombre: 'Tristeza' },
};

export interface Recuerdo {
  id: number;
  texto: string;
  emocion: Emocion;
  fecha: string; // YYYY-MM-DD
}

export interface DatosRecuerdo {
  texto: string;
  emocion: Emocion;
  fecha: string;
}

// CREATE
export function crear(d: DatosRecuerdo): void {
  getDB().run('INSERT INTO recuerdos (texto, emocion, fecha) VALUES (?, ?, ?)', [d.texto, d.emocion, d.fecha]);
  persistir();
}

// READ (con filtro por emoción y orden por fecha)
export function listar(emocion: string, orden: string): Recuerdo[] {
  const where = emocion !== 'todas' ? 'WHERE emocion = ?' : '';
  const dir = orden === 'antiguos' ? 'ASC' : 'DESC';
  const stmt = getDB().prepare(
    `SELECT id, texto, emocion, fecha FROM recuerdos ${where} ORDER BY fecha ${dir}, id ${dir}`
  );
  if (emocion !== 'todas') stmt.bind([emocion]);
  const filas: Recuerdo[] = [];
  while (stmt.step()) filas.push(stmt.getAsObject() as unknown as Recuerdo);
  stmt.free();
  return filas;
}

// UPDATE
export function actualizar(id: number, d: DatosRecuerdo): void {
  getDB().run('UPDATE recuerdos SET texto = ?, emocion = ?, fecha = ? WHERE id = ?', [d.texto, d.emocion, d.fecha, id]);
  persistir();
}

// DELETE
export function eliminar(id: number): void {
  getDB().run('DELETE FROM recuerdos WHERE id = ?', [id]);
  persistir();
}

export function contar(): number {
  return getDB().exec('SELECT COUNT(*) FROM recuerdos')[0].values[0][0] as number;
}
