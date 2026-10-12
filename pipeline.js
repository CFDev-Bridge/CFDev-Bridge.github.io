// Pipeline de datos animado: fuentes → procesamiento → modelos → entrega.
// Los nodos y sus descripciones salen del CV; el flujo de paquetes es una visualización.

const STAGES = ["Fuentes", "Procesamiento", "Modelos", "Entrega"];

export const NODES = Object.freeze([
  { id: "oracle",   stage: 0, label: "Oracle DB",     detail: "Base del sistema de recomendaciones de Contraloría" },
  { id: "postgres", stage: 0, label: "PostgreSQL",    detail: "Base de datos relacional" },
  { id: "rest",     stage: 0, label: "APIs REST",     detail: "Integración de servicios REST" },
  { id: "arcgis",   stage: 0, label: "ArcGIS Server", detail: "5 capas geoespaciales integradas al geoportal" },
  { id: "python",   stage: 1, label: "Python",        detail: "8 reportes automatizados: de 48 h a 3 min" },
  { id: "azure",    stage: 1, label: "Azure",         detail: "Arquitectura Big Data en la nube" },
  { id: "sklearn",  stage: 2, label: "Scikit-learn",  detail: "Clasificador de aprobación crediticia" },
  { id: "deep",     stage: 2, label: "Deep learning", detail: "Pronóstico de demanda e inventarios (tesis)" },
  { id: "powerbi",  stage: 3, label: "Power BI",      detail: "4 dashboards · 225 obras monitoreadas" },
  { id: "apex",     stage: 3, label: "Oracle APEX",   detail: "190 recomendaciones de 28 direcciones" },
  { id: "rasa",     stage: 3, label: "Rasa",          detail: "Chatbot de agenda por WhatsApp" },
]);

const EDGES = Object.freeze([
  ["oracle", "python"], ["postgres", "python"], ["rest", "python"], ["arcgis", "python"],
  ["oracle", "azure"], ["postgres", "azure"],
  ["python", "sklearn"], ["python", "deep"], ["azure", "deep"],
  ["python", "powerbi"], ["arcgis", "powerbi"], ["oracle", "apex"],
  ["sklearn", "powerbi"], ["deep", "powerbi"], ["deep", "rasa"], ["rest", "rasa"],
]);

const COMPACT_BREAKPOINT = 640;
const NODE_HEIGHT = 30;
const NODE_PADDING_X = 12;
const CURVE_SAMPLES = 32;
const MAX_PACKETS = 70;
const SPAWN_INTERVAL_MS = 110;
const PACKET_SPEED = 0.00042;      // fracción de arista por ms
const FLASH_DECAY = 0.0025;        // por ms
const MAX_DPR = 2;

const DEFAULT_AREA = Object.freeze({
  regular: { left: 0.1, right: 0.9, top: 0.2, bottom: 0.9 },
  compact: { left: 0.1, right: 0.9, top: 0.12, bottom: 0.88 },
});

export function createPipelineGraph(canvas, { pointerTarget, reducedMotion, onNodeHover, area = DEFAULT_AREA }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible.");

  const nodes = NODES.map((node) => ({ ...node, x: 0, y: 0, w: 0, h: NODE_HEIGHT, flash: 0 }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = EDGES.map(([from, to]) => ({ from: nodeById.get(from), to: nodeById.get(to), points: [] }));
  const outgoing = new Map(nodes.map((node) => [node, edges.filter((edge) => edge.from === node)]));
  const sources = nodes.filter((node) => node.stage === 0);

  const state = {
    width: 0,
    height: 0,
    compact: false,
    reveal: reducedMotion ? 1 : 0,
    hovered: null,
    packets: [],
    colors: readColors(canvas),
    lastTime: 0,
    spawnClock: 0,
    running: false,
    visible: true,
    rafId: 0,
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
  pointerTarget.addEventListener("pointermove", handlePointer);
  pointerTarget.addEventListener("pointerdown", handlePointer);
  pointerTarget.addEventListener("pointerleave", clearHover);

  // Las etiquetas se miden con la fuente final; se recalcula cuando termina de cargar.
  document.fonts?.ready.then(() => {
    layout();
    render();
  }).catch((error) => console.warn("No se pudo esperar la carga de fuentes:", error.message));

  layout();

  function layout() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    state.width = rect.width;
    state.height = rect.height;
    state.compact = rect.width < COMPACT_BREAKPOINT;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bounds = state.compact ? area.compact : area.regular;
    const left = bounds.left * rect.width;
    const span = (bounds.right - bounds.left) * rect.width;
    const top = bounds.top * rect.height;
    const vSpan = (bounds.bottom - bounds.top) * rect.height;

    ctx.font = labelFont();
    for (const node of nodes) {
      const column = nodes.filter((n) => n.stage === node.stage);
      const row = column.indexOf(node);
      node.x = left + (span * node.stage) / (STAGES.length - 1);
      node.y = top + (vSpan * (row + 1)) / (column.length + 1);
      node.w = state.compact ? 12 : ctx.measureText(node.label).width + NODE_PADDING_X * 2;
      node.h = state.compact ? 12 : NODE_HEIGHT;
    }

    for (const edge of edges) edge.points = sampleCurve(edge.from, edge.to);
  }

  function sampleCurve(from, to) {
    const x1 = from.x + from.w / 2;
    const x2 = to.x - to.w / 2;
    const dx = (x2 - x1) * 0.5;
    const points = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const t = i / CURVE_SAMPLES;
      points.push(cubicBezier(t, [x1, from.y], [x1 + dx, from.y], [x2 - dx, to.y], [x2, to.y]));
    }
    return points;
  }

  function handlePointer(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = nodes.find((node) => isInside(node, x, y)) ?? null;
    if (hit === state.hovered) return;
    state.hovered = hit;
    onNodeHover?.(hit ? { label: hit.label, stage: STAGES[hit.stage], detail: hit.detail } : null);
    if (!state.running) render();
  }

  function clearHover() {
    if (!state.hovered) return;
    state.hovered = null;
    onNodeHover?.(null);
    if (!state.running) render();
  }

  function isInside(node, x, y) {
    const slop = state.compact ? 14 : 4;
    return Math.abs(x - node.x) <= node.w / 2 + slop && Math.abs(y - node.y) <= node.h / 2 + slop;
  }

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
    const dt = Math.min(now - state.lastTime, 64);
    state.lastTime = now;
    if (state.reveal >= 1) updatePackets(dt);
    render();
    state.rafId = requestAnimationFrame(tick);
  }

  function updatePackets(dt) {
    state.spawnClock += dt;
    while (state.spawnClock >= SPAWN_INTERVAL_MS) {
      state.spawnClock -= SPAWN_INTERVAL_MS;
      if (state.packets.length < MAX_PACKETS) spawnPacket();
    }

    for (const node of nodes) node.flash = Math.max(0, node.flash - FLASH_DECAY * dt);

    const survivors = [];
    for (const packet of state.packets) {
      packet.t += PACKET_SPEED * packet.speed * dt;
      if (packet.t < 1) {
        survivors.push(packet);
        continue;
      }
      const arrived = packet.edge.to;
      arrived.flash = 1;
      const next = pickRandom(outgoing.get(arrived));
      if (next) survivors.push({ edge: next, t: 0, speed: packet.speed });
    }
    state.packets = survivors;
  }

  function spawnPacket() {
    const source = pickRandom(sources);
    const edge = pickRandom(outgoing.get(source));
    if (edge) state.packets.push({ edge, t: 0, speed: 0.75 + Math.random() * 0.5 });
  }

  function render() {
    const { width, height, colors, hovered } = state;
    if (width === 0 || height === 0) return;
    ctx.clearRect(0, 0, width, height);

    if (!state.compact) drawStageLabels();

    for (const edge of edges) {
      const progress = edgeReveal(edge);
      if (progress <= 0) continue;
      const related = !hovered || edge.from === hovered || edge.to === hovered;
      drawPolyline(edge.points, progress, related ? colors.edgeActive : colors.edge, related && hovered ? 1.6 : 1);
    }

    for (const packet of state.packets) {
      const related = !hovered || packet.edge.from === hovered || packet.edge.to === hovered;
      drawPacket(packet, related ? 1 : 0.2);
    }

    for (const node of nodes) {
      const alpha = nodeReveal(node);
      if (alpha <= 0) continue;
      const dimmed = hovered && hovered !== node && !isNeighbor(hovered, node);
      drawNode(node, alpha * (dimmed ? 0.35 : 1));
    }
  }

  function drawStageLabels() {
    ctx.save();
    ctx.font = labelFont(11);
    ctx.fillStyle = state.colors.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const topY = Math.min(...nodes.map((n) => n.y - n.h / 2)) - 28;
    STAGES.forEach((stage, index) => {
      const node = nodes.find((n) => n.stage === index);
      ctx.globalAlpha = clamp((state.reveal * 1.3 - index * 0.25) / 0.2);
      ctx.fillText(stage.toUpperCase(), node.x, topY);
    });
    ctx.restore();
  }

  function drawPolyline(points, progress, color, lineWidth) {
    const last = Math.max(1, Math.floor(progress * CURVE_SAMPLES));
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i <= last; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function drawPacket(packet, alpha) {
    const [x, y] = pointAt(packet.edge.points, packet.t);
    const [tx, ty] = pointAt(packet.edge.points, Math.max(0, packet.t - 0.08));
    ctx.save();
    ctx.globalAlpha = alpha;
    const trail = ctx.createLinearGradient(tx, ty, x, y);
    trail.addColorStop(0, "transparent");
    trail.addColorStop(1, state.colors.packet);
    ctx.strokeStyle = trail;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = state.colors.packet;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNode(node, alpha) {
    const { colors } = state;
    const isHovered = state.hovered === node;
    const x = node.x - node.w / 2;
    const y = node.y - node.h / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.roundRect(x, y, node.w, node.h, state.compact ? node.h / 2 : 8);
    ctx.fillStyle = colors.surface;
    ctx.fill();
    ctx.lineWidth = isHovered ? 1.6 : 1;
    ctx.strokeStyle = isHovered ? colors.accent : mixFlash(colors, node.flash);
    ctx.stroke();

    if (!state.compact) {
      ctx.font = labelFont();
      ctx.fillStyle = colors.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y + 0.5);
    }
    ctx.restore();
  }

  function mixFlash(colors, flash) {
    return flash > 0.05 ? withAlpha(colors.packet, 0.35 + flash * 0.65) : colors.nodeBorder;
  }

  function isNeighbor(a, b) {
    return edges.some((edge) => (edge.from === a && edge.to === b) || (edge.to === a && edge.from === b));
  }

  function nodeReveal(node) {
    return clamp((state.reveal * 1.3 - node.stage * 0.25) / 0.2);
  }

  function edgeReveal(edge) {
    return clamp((state.reveal * 1.3 - edge.from.stage * 0.25 - 0.12) / 0.3);
  }

  function labelFont(size = 13) {
    const family = getComputedStyle(canvas).getPropertyValue("--font-mono").trim() || "monospace";
    return `500 ${size}px ${family}`;
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
      pointerTarget.removeEventListener("pointermove", handlePointer);
      pointerTarget.removeEventListener("pointerdown", handlePointer);
      pointerTarget.removeEventListener("pointerleave", clearHover);
    },
  };
}

// ---------- Utilidades puras ----------

function cubicBezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

function pointAt(points, t) {
  const scaled = t * (points.length - 1);
  const i = Math.min(Math.floor(scaled), points.length - 2);
  const f = scaled - i;
  return [
    points[i][0] + (points[i + 1][0] - points[i][0]) * f,
    points[i][1] + (points[i + 1][1] - points[i][1]) * f,
  ];
}

function pickRandom(list) {
  return list && list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function readColors(element) {
  const styles = getComputedStyle(element);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    surface: read("--surface", "#12161D"),
    text: read("--text", "#E8EBF1"),
    muted: read("--muted", "#98A2B3"),
    accent: read("--accent", "#7C93FF"),
    packet: read("--data", "#3DD6E6"),
    edge: read("--graph-edge", "#1C222B"),
    edgeActive: read("--graph-edge-active", "#2F3846"),
    nodeBorder: read("--line-strong", "#475265"),
  };
}
