# Christian Núñez — Portafolio

Portafolio profesional de **Christian Francisco Núñez Vaca**, Ingeniero de Software y Magíster en Big Data y Ciencia de Datos (Ambato, Ecuador).

**Sitio:** https://cfdev-bridge.github.io

## Qué incluye

- **Grafo "segundo cerebro"** (estilo Obsidian): 44 notas y 63 enlaces entre temas, herramientas, cargos, proyectos y títulos, con simulación de fuerzas, arrastre y vista previa al pasar el cursor.
- **Pipeline de datos animado** del stack: fuentes → procesamiento → modelos → entrega.
- Impacto cuantificado, experiencia, proyectos, stack y formación.
- Tema Sistema · Claro · Oscuro, diseño adaptable y accesible (contraste WCAG AA, teclado, movimiento reducido).

## Tecnología

Sitio estático sin build ni dependencias instaladas:

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Contenido y estructura |
| `styles.css` | Tokens de diseño, temas y layout |
| `main.js` | Orquestación: navegación, tema y animaciones con [Motion](https://motion.dev) |
| `brain.js` | Grafo de conocimiento en Canvas 2D con simulación de fuerzas |
| `pipeline.js` | Diagrama del pipeline de datos en Canvas 2D |
| `theme-init.js` | Aplica el tema guardado antes del primer pintado |

Motion se carga desde jsDelivr con versión fija; si no está disponible, el sitio funciona igual sin animaciones.

## Ejecutar en local

Los módulos ES requieren un servidor HTTP (no funcionan con `file://`):

```bash
python -m http.server 8080
```

Luego abre http://127.0.0.1:8080
