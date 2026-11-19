import { EMOCIONES, Emocion, Recuerdo } from '../models/recuerdo';

export interface Manejadores {
  onGuardar(datos: { id: number | null; texto: string; emocion: Emocion; fecha: string }): void;
  onEliminar(id: number): void;
  onFiltro(emocion: string, orden: string): void;
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapar(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function hoy(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fechaLarga(f: string, corta = false): string {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-SV', {
    day: 'numeric',
    month: corta ? 'short' : 'long',
    year: 'numeric',
  });
}

export class JardinView {
  private datos: Recuerdo[] = [];
  private emocionActiva = 'todas';
  private seleccionado: Recuerdo | null = null;
  private h!: Manejadores;

  constructor() {
    const claves = Object.keys(EMOCIONES) as Emocion[];
    $('f-emocion').innerHTML = claves
      .map((k) => `<option value="${k}">${EMOCIONES[k].flor} ${EMOCIONES[k].nombre}</option>`)
      .join('');
    const chips: [string, string][] = [['todas', '🌿 Todas'], ...claves.map((k): [string, string] => [k, `${EMOCIONES[k].flor} ${EMOCIONES[k].nombre}`])];
    $('chips').innerHTML = chips
      .map(([k, t]) => `<button type="button" class="chip" data-emocion="${k}" aria-pressed="${k === 'todas'}">${t}</button>`)
      .join('');
  }

  enlazar(h: Manejadores): void {
    this.h = h;

    $('chips').addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.chip');
      if (!b) return;
      this.emocionActiva = b.dataset.emocion!;
      document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      this.h.onFiltro(this.emocionActiva, $<HTMLSelectElement>('orden').value);
    });

    $('orden').addEventListener('change', () => this.h.onFiltro(this.emocionActiva, $<HTMLSelectElement>('orden').value));
    $('btn-plantar').addEventListener('click', () => this.abrirForm(null));

    $('jardin').addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.flor');
      if (!b) return;
      const r = this.datos.find((x) => x.id === Number(b.dataset.id));
      if (r) this.abrirDetalle(r);
    });

    $('f-cancelar').addEventListener('click', () => $<HTMLDialogElement>('dlg-form').close());
    $('d-cerrar').addEventListener('click', () => $<HTMLDialogElement>('dlg-detalle').close());
    $('d-editar').addEventListener('click', () => {
      const r = this.seleccionado;
      $<HTMLDialogElement>('dlg-detalle').close();
      if (r) this.abrirForm(r);
    });
    $('d-eliminar').addEventListener('click', () => {
      const r = this.seleccionado;
      if (r && confirm('¿Arrancar esta flor? El recuerdo se borrará para siempre.')) {
        $<HTMLDialogElement>('dlg-detalle').close();
        this.h.onEliminar(r.id);
      }
    });

    $('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = $<HTMLTextAreaElement>('f-texto').value.trim();
      const err = $('f-error');
      if (!texto) {
        err.textContent = 'Escribe algo para plantar tu recuerdo.';
        err.hidden = false;
        return;
      }
      err.hidden = true;
      const id = $<HTMLInputElement>('f-id').value;
      this.h.onGuardar({
        id: id ? Number(id) : null,
        texto,
        emocion: $<HTMLSelectElement>('f-emocion').value as Emocion,
        fecha: $<HTMLInputElement>('f-fecha').value,
      });
      $<HTMLDialogElement>('dlg-form').close();
    });
  }

  private abrirForm(r: Recuerdo | null): void {
    $('form-titulo').textContent = r ? 'Editar recuerdo' : 'Plantar un recuerdo';
    $('f-guardar').textContent = r ? 'Guardar cambios' : 'Plantar';
    $<HTMLInputElement>('f-id').value = r ? String(r.id) : '';
    $<HTMLTextAreaElement>('f-texto').value = r ? r.texto : '';
    $<HTMLSelectElement>('f-emocion').value = r ? r.emocion : 'alegria';
    $<HTMLInputElement>('f-fecha').value = r ? r.fecha : hoy();
    $<HTMLInputElement>('f-fecha').max = hoy();
    $('f-error').hidden = true;
    $<HTMLDialogElement>('dlg-form').showModal();
  }

  private abrirDetalle(r: Recuerdo): void {
    this.seleccionado = r;
    $('d-flor').textContent = EMOCIONES[r.emocion].flor;
    $('d-texto').textContent = r.texto;
    $('d-meta').textContent = `${EMOCIONES[r.emocion].nombre}, ${fechaLarga(r.fecha)}`;
    $<HTMLDialogElement>('dlg-detalle').showModal();
  }

  render(lista: Recuerdo[], total: number): void {
    this.datos = lista;
    const jardin = $('jardin');

    if (total === 0) {
      $('conteo').textContent = '';
      jardin.innerHTML = '<p class="vacio">Tu jardín está vacío. Pulsa «Plantar un recuerdo» para sembrar el primero.</p>';
      return;
    }
    $('conteo').textContent =
      lista.length === total
        ? `Tu jardín tiene ${total} ${total === 1 ? 'flor' : 'flores'}.`
        : `Mostrando ${lista.length} de ${total} flores.`;

    if (lista.length === 0) {
      jardin.innerHTML = '<p class="vacio">No hay flores con esa emoción. Prueba con otra o planta un recuerdo nuevo.</p>';
      return;
    }

    jardin.innerHTML = lista
      .map((r, i) => {
        const alto = 40 + ((r.id * 37) % 60);
        return `<button type="button" class="flor" data-id="${r.id}" style="--alto:${alto}px;--retraso:${i * 70}ms"
          aria-label="${escapar(EMOCIONES[r.emocion].nombre)}, ${escapar(fechaLarga(r.fecha))}. Abrir recuerdo">
          <span class="cabeza">${EMOCIONES[r.emocion].flor}</span>
          <span class="tallo"></span>
          <span class="fecha">${escapar(fechaLarga(r.fecha, true))}</span>
        </button>`;
      })
      .join('');
  }
}
