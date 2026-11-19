import { JardinView } from '../views/jardinView';
import { actualizar, contar, crear, eliminar, listar } from '../models/recuerdo';

export class JardinController {
  private emocion = 'todas';
  private orden = 'recientes';

  constructor(private vista: JardinView) {}

  iniciar(): void {
    this.vista.enlazar({
      onGuardar: (d) => {
        const datos = { texto: d.texto, emocion: d.emocion, fecha: d.fecha };
        if (d.id === null) crear(datos);
        else actualizar(d.id, datos);
        this.refrescar();
      },
      onEliminar: (id) => {
        eliminar(id);
        this.refrescar();
      },
      onFiltro: (emocion, orden) => {
        this.emocion = emocion;
        this.orden = orden;
        this.refrescar();
      },
    });
    this.refrescar();
  }

  private refrescar(): void {
    this.vista.render(listar(this.emocion, this.orden), contar());
  }
}
