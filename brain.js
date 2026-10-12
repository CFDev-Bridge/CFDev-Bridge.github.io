// Grafo "segundo cerebro" (estilo Obsidian): notas enlazadas con simulación de fuerzas.
// Cada nodo y su detalle salen del CV; los enlaces relacionan herramientas, cargos y proyectos.

const SECTION = Object.freeze({
  impacto: "#impacto",
  experiencia: "#experiencia",
  proyectos: "#proyectos",
  stack: "#stack",
  formacion: "#formacion",
});

const NOTES = Object.freeze([
  { id: "me", label: "Christian Núñez", kind: "center", detail: "Ingeniero de Software · Magíster en Big Data y Ciencia de Datos", href: "#inicio" },

  { id: "datos", label: "Datos y BI", kind: "hub", detail: "Analítica, automatización y dashboards", href: SECTION.stack },
  { id: "ia", label: "Inteligencia artificial", kind: "hub", detail: "Machine learning, deep learning, visión e IA conversacional", href: SECTION.stack },
  { id: "dev", label: "Desarrollo", kind: "hub", detail: "Aplicaciones web, móviles y bases de datos", href: SECTION.stack },
  { id: "gis", label: "GIS", kind: "hub", detail: "Geoportal, capas geoespaciales y dashboards de obras", href: SECTION.stack },
  { id: "gad", label: "GAD Ambato", kind: "hub", detail: "Analista desde 09/2024 · practicante de software 2022 – 2024", href: SECTION.experiencia },
  { id: "edu", label: "Formación", kind: "hub", detail: "3 títulos · doble titulación internacional", href: SECTION.formacion },

  { id: "python", label: "Python", kind: "tool", detail: "8 reportes automatizados: de 48 h a 3 min", href: SECTION.stack },
  { id: "sql", label: "SQL", kind: "tool", detail: "Consultas y modelado de datos", href: SECTION.stack },
  { id: "powerbi", label: "Power BI", kind: "tool", detail: "Dashboards de obras y reportes para 10 áreas", href: SECTION.stack },
  { id: "excel", label: "Excel avanzado", kind: "tool", detail: "Análisis y reportes", href: SECTION.stack },
  { id: "azure", label: "Azure", kind: "tool", detail: "Nube para arquitecturas de datos", href: SECTION.stack },
  { id: "bigdata", label: "Big Data", kind: "tool", detail: "Arquitectura Big Data (máster)", href: SECTION.stack },

  { id: "sklearn", label: "Scikit-learn", kind: "tool", detail: "Clasificación supervisada", href: SECTION.stack },
  { id: "series", label: "Series temporales", kind: "tool", detail: "Pronóstico de demanda e inventarios", href: SECTION.stack },
  { id: "deep", label: "Deep learning", kind: "tool", detail: "Modelos de pronóstico (tesis de maestría)", href: SECTION.stack },
  { id: "opencv", label: "OpenCV", kind: "tool", detail: "Visión por computadora", href: SECTION.stack },
  { id: "mediapipe", label: "MediaPipe", kind: "tool", detail: "Seguimiento de manos en tiempo real", href: SECTION.stack },
  { id: "rasa", label: "Rasa", kind: "tool", detail: "IA conversacional (NLU)", href: SECTION.stack },

  { id: "apex", label: "Oracle APEX", kind: "tool", detail: "Sistema de seguimiento de recomendaciones de Contraloría", href: SECTION.stack },
  { id: "oracle", label: "Oracle Database", kind: "tool", detail: "Base de datos de sistemas institucionales", href: SECTION.stack },
  { id: "postgres", label: "PostgreSQL", kind: "tool", detail: "Base de datos relacional", href: SECTION.stack },
  { id: "mysql", label: "MySQL", kind: "tool", detail: "Base de datos relacional", href: SECTION.stack },
  { id: "angular", label: "Angular", kind: "tool", detail: "Desarrollo web", href: SECTION.stack },
  { id: "react", label: "React", kind: "tool", detail: "Desarrollo web", href: SECTION.stack },
  { id: "js", label: "JavaScript", kind: "tool", detail: "Sistemas web internos y visión por computadora", href: SECTION.stack },
  { id: "php", label: "PHP", kind: "tool", detail: "Sistemas web internos", href: SECTION.stack },
  { id: "java", label: "Java", kind: "tool", detail: "Sistemas internos y simulador de amortización", href: SECTION.stack },
  { id: "git", label: "Git", kind: "tool", detail: "Control de versiones", href: SECTION.stack },
  { id: "rest", label: "APIs REST", kind: "tool", detail: "Integración de servicios", href: SECTION.stack },

  { id: "arcgis-server", label: "ArcGIS Server", kind: "tool", detail: "5 capas integradas al geoportal municipal", href: SECTION.stack },
  { id: "arcgis-online", label: "ArcGIS Online", kind: "tool", detail: "Publicación de mapas", href: SECTION.stack },
  { id: "arcgis-dash", label: "ArcGIS Dashboards", kind: "tool", detail: "Monitoreo de 225 obras públicas", href: SECTION.stack },

  { id: "analista", label: "Analista de Planeación", kind: "role", detail: "09/2024 — hoy · 122 KPI del POA para 28 direcciones", href: SECTION.experiencia },
  { id: "practicante", label: "Practicante de Software", kind: "role", detail: "08/2022 — 04/2024 · 6 sistemas web y móviles", href: SECTION.experiencia },

  { id: "chatbot", label: "Chatbot de agenda", kind: "project", detail: "Agenda citas por WhatsApp con soporte multicliente", href: SECTION.proyectos },
  { id: "credito", label: "Modelo crediticio", kind: "project", detail: "Clasificador de aprobación de crédito", href: SECTION.proyectos },
  { id: "gestos", label: "Control por gestos", kind: "project", detail: "Ratón virtual controlado con la mano", href: SECTION.proyectos },
  { id: "amortizacion", label: "Simulador de amortización", kind: "project", detail: "Métodos francés y alemán", href: SECTION.proyectos },

  { id: "magister", label: "Magíster Big Data", kind: "edu", detail: "Universidad del Pacífico · 05/2025 — 05/2026", href: SECTION.formacion },
  { id: "master", label: "Máster Arquitectura Big Data", kind: "edu", detail: "Universidad Europea del Principado de Andorra", href: SECTION.formacion },
  { id: "ingenieria", label: "Ingeniería de Software", kind: "edu", detail: "Universidad Técnica de Ambato · 2019 — 2024", href: SECTION.formacion },
]);

const LINKS = Object.freeze([
  ["me", "datos"], ["me", "ia"], ["me", "dev"], ["me", "gis"], ["me", "gad"], ["me", "edu"],
  ["datos", "python"], ["datos", "sql"], ["datos", "powerbi"], ["datos", "excel"], ["datos", "azure"], ["datos", "bigdata"],
  ["ia", "sklearn"], ["ia", "series"], ["ia", "deep"], ["ia", "opencv"], ["ia", "mediapipe"], ["ia", "rasa"],
  ["dev", "apex"], ["dev", "oracle"], ["dev", "postgres"], ["dev", "mysql"], ["dev", "angular"], ["dev", "react"],
  ["dev", "js"], ["dev", "php"], ["dev", "java"], ["dev", "git"], ["dev", "rest"],
  ["gis", "arcgis-server"], ["gis", "arcgis-online"], ["gis", "arcgis-dash"],
  ["gad", "analista"], ["gad", "practicante"],
  ["edu", "magister"], ["edu", "master"], ["edu", "ingenieria"],
  ["analista", "powerbi"], ["analista", "arcgis-dash"], ["analista", "python"],
  ["practicante", "apex"], ["practicante", "arcgis-server"], ["practicante", "java"],
  ["practicante", "js"], ["practicante", "php"], ["practicante", "powerbi"],
  ["apex", "oracle"], ["arcgis-server", "rest"],
  ["chatbot", "rasa"], ["chatbot", "python"],
  ["credito", "sklearn"], ["credito", "python"],
  ["gestos", "mediapipe"], ["gestos", "opencv"], ["gestos", "js"],
  ["amortizacion", "java"],
  ["magister", "series"], ["magister", "deep"], ["magister", "bigdata"],
  ["master", "bigdata"],
]);

const KIND_LABEL = Object.freeze({
  center: "Persona", hub: "Tema", tool: "Herramienta", role: "Cargo", project: "Proyecto", edu: "Título",
});

const COMPACT_BREAKPOINT = 640;
const MAX_DPR = 2;
const DAMPING = 0.82;
const ALPHA_DECAY = 0.985;
const ALPHA_MIN = 0.001;
const DRAG_THRESHOLD_PX = 4;
const PRESETTLE_STEPS = 320;

export const NOTE_COUNT = NOTES.length;
export const LINK_COUNT = LINKS.length;

export function createBrainGraph(canvas, { pointerTarget, reducedMotion, onNodeHover, onNodeSelect }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible.");

  const nodes = NOTES.map((note) => ({ ...note, x: 0, y: 0, vx: 0, vy: 0, r: 0, depth: 0, phase: Math.random() * Math.PI * 2, degree: 0, pinned: false }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links = LINKS.map(([a, b]) => {
    const source = byId.get(a);
    const target = byId.get(b);
    if (!source || !target) throw new Error(`Enlace inválido: ${a} → ${b}`);
    source.degree++;
    target.degree++;
    return { source, target };
  });
  const neighbors = new Map(nodes.map((node) => [node, new Set()]));
  for (const { source, target } of links) {
    neighbors.get(source).add(target);
    neighbors.get(target).add(source);
  }
  assignDepths();

  const state = {
    width: 0,
    height: 0,
    compact: false,
    region: { cx: 0, cy: 0, w: 0, h: 0 },
    base: 60,
    alpha: 1,
    reveal: reducedMotion ? 1 : 0,
    hovered: null,
    drag: null,
    colors: readColors(canvas),
    time: 0,
    running: false,
    visible: true,
    rafId: 0,
    lastTime: 0,
    initialized: false,
  };

  const resizeObserver = new ResizeObserver(() => {
    layout();
    render();
  });
  resizeObserver.observe(canvas);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    syncLoop();
  });
  visibilityObserver.observe(canvas);

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const contrast = window.matchMedia("(prefers-contrast: more)");
  const refreshColors = () => {
    state.colors = readColors(canvas);
    render();
  };
  colorScheme.addEventListener("change", refreshColors);
  contrast.addEventListener("change", refreshColors);
  document.addEventListener("themechange", refreshColors);
  document.addEventListener("visibilitychange", syncLoop);
  pointerTarget.addEventListener("pointerdown", handlePointerDown);
  pointerTarget.addEventListener("pointermove", handlePointerMove);
  pointerTarget.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("pointerup", handlePointerUp);

  document.fonts?.ready.then(render).catch((error) => console.warn("No se pudo esperar la carga de fuentes:", error.message));

  layout();

  // ---------- Geometría ----------

  function assignDepths() {
    const center = nodes.find((node) => node.kind === "center");
    const queue = [center];
    const seen = new Set([center]);
    while (queue.length) {
      const node = queue.shift();
      for (const next of neighbors.get(node)) {
        if (seen.has(next)) continue;
        seen.add(next);
        next.depth = node.depth + 1;
        queue.push(next);
      }
    }
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const previous = { ...state.region };

    state.width = rect.width;
    state.height = rect.height;
    state.compact = rect.width < COMPACT_BREAKPOINT;
    // El CSS decide si el grafo va al lado del texto o encima; así CSS y JS no se desincronizan.
    const stacked = getComputedStyle(canvas).getPropertyValue("--graph-mode").trim() === "top";
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.region = stacked
      ? { cx: rect.width * 0.5, cy: 175, w: Math.min(rect.width * 0.84, 760), h: 200 }
      : { cx: rect.width * 0.72, cy: rect.height * 0.5, w: rect.width * 0.4, h: rect.height * 0.74 };
    state.base = Math.min(state.region.w, state.region.h) / 5.2;

    for (const node of nodes) {
      node.r = radiusFor(node);
    }

    if (!state.initialized) {
      seedPositions();
      state.initialized = true;
      if (reducedMotion) presettle();
    } else if (previous.w > 0) {
      // Reescala posiciones existentes a la nueva región sin reiniciar la simulación.
      const sx = state.region.w / previous.w;
      const sy = state.region.h / previous.h;
      for (const node of nodes) {
        node.x = state.region.cx + (node.x - previous.cx) * sx;
        node.y = state.region.cy + (node.y - previous.cy) * sy;
      }
      state.alpha = Math.max(state.alpha, 0.3);
      if (reducedMotion) presettle();
    }
  }

  function radiusFor(node) {
    const scale = state.compact ? 0.8 : 1;
    if (node.kind === "center") return 9 * scale;
    if (node.kind === "hub") return 6.5 * scale;
    return (2.6 + Math.sqrt(node.degree) * 0.9) * scale;
  }

  function seedPositions() {
    const hubs = nodes.filter((node) => node.kind === "hub");
    const { cx, cy } = state.region;
    nodes.forEach((node) => {
      if (node.kind === "center") {
        node.x = cx;
        node.y = cy;
        return;
      }
      const hub = node.kind === "hub" ? node : [...neighbors.get(node)].find((n) => n.kind === "hub") ?? hubs[0];
      const angle = (hubs.indexOf(hub) / hubs.length) * Math.PI * 2;
      const distance = node.kind === "hub" ? state.base : state.base * 2;
      node.x = cx + Math.cos(angle) * distance + (Math.random() - 0.5) * 20;
      node.y = cy + Math.sin(angle) * distance + (Math.random() - 0.5) * 20;
    });
  }

  function presettle() {
    state.alpha = 1;
    for (let i = 0; i < PRESETTLE_STEPS; i++) step();
    for (const node of nodes) {
      node.vx = 0;
      node.vy = 0;
    }
  }

  // ---------- Física ----------

  function step() {
    const { alpha, base, region } = state;
    const repulsion = base * base * 0.75;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = 1;
        }
        const force = (repulsion * charge(a) * charge(b) * alpha) / d2;
        const d = Math.sqrt(d2);
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    for (const { source, target } of links) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const length = linkLength(source, target);
      const k = ((d - length) / d) * 0.06 * alpha;
      source.vx += dx * k; source.vy += dy * k;
      target.vx -= dx * k; target.vy -= dy * k;
    }

    for (const node of nodes) {
      const gravity = node.kind === "center" ? 0.08 : 0.012;
      node.vx += (region.cx - node.x) * gravity * alpha;
      node.vy += (region.cy - node.y) * gravity * alpha * (region.w / region.h);

      if (node.pinned) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;
      constrain(node);
    }

    state.alpha = Math.max(ALPHA_MIN, state.alpha * ALPHA_DECAY);
  }

  // Los temas repelen más para separar los grupos y evitar que sus etiquetas se encimen.
  function charge(node) {
    if (node.kind === "hub") return 2.4;
    if (node.kind === "center") return 1.8;
    return 1;
  }

  function linkLength(a, b) {
    const kinds = [a.kind, b.kind];
    if (kinds.includes("center")) return state.base * 1.45;
    if (a.kind === "hub" || b.kind === "hub") return state.base * 0.7;
    return state.base * 0.95;
  }

  // Mantiene cada nota dentro de la región del grafo para no invadir el texto.
  function constrain(node) {
    const { cx, cy, w, h } = state.region;
    node.x = Math.min(Math.max(node.x, cx - w / 2), cx + w / 2);
    node.y = Math.min(Math.max(node.y, cy - h / 2), cy + h / 2);
  }

  // ---------- Interacción ----------

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hitTest({ x, y }) {
    let best = null;
    let bestDistance = Infinity;
    for (const node of nodes) {
      const { x: nx, y: ny } = drawPosition(node);
      const distance = Math.hypot(nx - x, ny - y);
      const slop = state.compact ? 14 : 8;
      if (distance <= node.r + slop && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  function handlePointerDown(event) {
    const point = localPoint(event);
    const node = hitTest(point);
    if (!node) {
      if (event.pointerType === "touch") setHovered(null);
      return;
    }

    setHovered(node);
    // En pantallas táctiles el toque solo muestra la nota para no bloquear el scroll.
    if (event.pointerType === "touch") return;

    state.drag = { node, startX: point.x, startY: point.y, moved: false };
    node.pinned = true;
    pointerTarget.style.cursor = "grabbing";
  }

  function handlePointerMove(event) {
    const point = localPoint(event);

    if (state.drag) {
      const { node, startX, startY } = state.drag;
      if (Math.hypot(point.x - startX, point.y - startY) > DRAG_THRESHOLD_PX) state.drag.moved = true;
      node.x = point.x;
      node.y = point.y;
      state.alpha = Math.max(state.alpha, 0.25);
      if (!state.running) {
        if (reducedMotion) step();
        render();
      }
      return;
    }

    if (event.pointerType === "touch") return;
    const node = hitTest(point);
    pointerTarget.style.cursor = node ? "pointer" : "";
    setHovered(node);
  }

  function handlePointerUp() {
    if (!state.drag) return;
    const { node, moved } = state.drag;
    node.pinned = false;
    state.drag = null;
    pointerTarget.style.cursor = "pointer";
    if (!moved) onNodeSelect?.(node.href);
  }

  function handlePointerLeave(event) {
    if (state.drag || event.pointerType === "touch") return;
    pointerTarget.style.cursor = "";
    setHovered(null);
  }

  function setHovered(node) {
    if (node === state.hovered) return;
    state.hovered = node;
    onNodeHover?.(node ? describe(node) : null);
    if (!state.running) render();
  }

  function describe(node) {
    const { x, y } = drawPosition(node);
    return {
      x,
      y,
      radius: node.r,
      label: node.label,
      kind: KIND_LABEL[node.kind],
      detail: node.detail,
      links: neighbors.get(node).size,
      href: node.href,
    };
  }

  // ---------- Bucle y dibujo ----------

  function syncLoop() {
    const shouldRun = !reducedMotion && state.visible && document.visibilityState === "visible";
    if (shouldRun && !state.running) {
      state.running = true;
      state.lastTime = performance.now();
      state.rafId = requestAnimationFrame(tick);
    } else if (!shouldRun && state.running) {
      state.running = false;
      cancelAnimationFrame(state.rafId);
    }
  }

  function tick(now) {
    if (!state.running) return;
    state.time += Math.min(now - state.lastTime, 64);
    state.lastTime = now;
    step();
    render();
    state.rafId = requestAnimationFrame(tick);
  }

  // Leve "respiración" visual que no altera la física.
  function drawPosition(node) {
    if (reducedMotion || node.pinned) return { x: node.x, y: node.y };
    const t = state.time * 0.0006 + node.phase;
    return { x: node.x + Math.sin(t) * 1.6, y: node.y + Math.cos(t * 0.8) * 1.6 };
  }

  function render() {
    const { width, height, colors, hovered } = state;
    if (width === 0 || height === 0) return;
    ctx.clearRect(0, 0, width, height);

    const focus = hovered ? neighbors.get(hovered) : null;
    const positions = new Map(nodes.map((node) => [node, drawPosition(node)]));

    ctx.lineWidth = 1;
    for (const { source, target } of links) {
      const alpha = Math.min(nodeReveal(source), nodeReveal(target));
      if (alpha <= 0) continue;
      const active = hovered && (source === hovered || target === hovered);
      const p = positions.get(source);
      const q = positions.get(target);
      ctx.globalAlpha = alpha * (hovered && !active ? 0.25 : 1);
      ctx.strokeStyle = active ? colors.highlight : colors.edge;
      ctx.lineWidth = active ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }

    for (const node of nodes) {
      const alpha = nodeReveal(node);
      if (alpha <= 0) continue;
      const { x, y } = positions.get(node);
      const isFocus = node === hovered;
      const isNeighbor = focus?.has(node);
      const dimmed = hovered && !isFocus && !isNeighbor;

      ctx.globalAlpha = alpha * (dimmed ? 0.25 : 1);
      ctx.beginPath();
      ctx.arc(x, y, node.r + (isFocus ? 2 : 0), 0, Math.PI * 2);
      ctx.fillStyle = isFocus || isNeighbor ? colors.highlight : nodeColor(node);
      ctx.fill();

      if (node.kind === "center") {
        ctx.beginPath();
        ctx.arc(x, y, node.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = colors.highlight;
        ctx.globalAlpha = alpha * 0.45 * (dimmed ? 0.4 : 1);
        ctx.stroke();
      }

      drawLabel(node, x, y, alpha, { isFocus, isNeighbor, dimmed });
    }
    ctx.globalAlpha = 1;
  }

  function drawLabel(node, x, y, alpha, { isFocus, isNeighbor, dimmed }) {
    const { colors, compact } = state;
    const isMajor = node.kind === "center" || node.kind === "hub";
    // Como en Obsidian: solo temas rotulados por defecto; los vecinos se rotulan al enfocar una nota.
    const visible = isFocus || isNeighbor || (compact ? node.kind === "center" : isMajor);
    if (!visible) return;

    const size = node.kind === "center" ? 14 : isMajor ? 12.5 : 11;
    const weight = isMajor ? 600 : 500;
    ctx.font = `${weight} ${size}px ${fontFamily()}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = isFocus || isNeighbor || isMajor ? colors.text : colors.muted;
    const labelAlpha = isFocus || isNeighbor ? 1 : isMajor ? 0.95 : 0.6;
    ctx.globalAlpha = alpha * labelAlpha * (dimmed ? 0.3 : 1);
    ctx.fillText(node.label, x, y + node.r + 5);
  }

  function nodeColor(node) {
    const { colors } = state;
    if (node.kind === "center") return colors.highlight;
    if (node.kind === "hub") return colors.text;
    return colors.node;
  }

  function nodeReveal(node) {
    return clamp((state.reveal * 1.6 - node.depth * 0.3) / 0.35);
  }

  function fontFamily() {
    return getComputedStyle(canvas).getPropertyValue("--font-mono").trim() || "monospace";
  }

  return {
    start() {
      render();
      syncLoop();
    },
    setReveal(value) {
      state.reveal = clamp(value);
      if (!state.running) render();
    },
    destroy() {
      state.running = false;
      cancelAnimationFrame(state.rafId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      colorScheme.removeEventListener("change", refreshColors);
      contrast.removeEventListener("change", refreshColors);
      document.removeEventListener("themechange", refreshColors);
      document.removeEventListener("visibilitychange", syncLoop);
      pointerTarget.removeEventListener("pointerdown", handlePointerDown);
      pointerTarget.removeEventListener("pointermove", handlePointerMove);
      pointerTarget.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerup", handlePointerUp);
    },
  };
}

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

function readColors(element) {
  const styles = getComputedStyle(element);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    text: read("--text", "#E8EBF1"),
    muted: read("--muted", "#98A2B3"),
    node: read("--graph-node", "#5B6575"),
    edge: read("--graph-edge-active", "#2E3745"),
    highlight: read("--data", "#3DD6E6"),
  };
}
