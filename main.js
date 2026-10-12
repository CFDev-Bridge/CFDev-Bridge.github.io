// Orquestación del portafolio: grafo "segundo cerebro" del hero, pipeline del stack,
// navegación de la bóveda y animaciones con Motion.
// Mejora progresiva: sin Motion o con movimiento reducido, todo queda visible y estático.

import { createBrainGraph, NOTE_COUNT, LINK_COUNT } from "./brain.js";
import { createPipelineGraph } from "./pipeline.js";

const MOTION_URL = "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";
const MOTION_TIMEOUT_MS = 4000;
const EASE_OUT = [0.22, 1, 0.36, 1];

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

setCurrentYear();
initThemeSwitch();
fillGraphCounts();
initScrollSpy();
const brain = initBrain();
const pipeline = initPipeline();

if (prefersReducedMotion) {
  revealAllGraphs();
} else {
  // Se oculta el contenido animable de inmediato para evitar parpadeo;
  // si Motion no llega a tiempo, se muestra todo sin animación.
  root.classList.add("motion-ready");
  loadMotion()
    .then(initAnimations)
    .catch((error) => {
      root.classList.remove("motion-ready");
      revealAllGraphs();
      console.warn("Animaciones desactivadas:", error.message);
    });
}

// ---------- Contenido ----------

function setCurrentYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function fillGraphCounts() {
  document.querySelectorAll("[data-note-count]").forEach((el) => { el.textContent = String(NOTE_COUNT); });
  document.querySelectorAll("[data-link-count]").forEach((el) => { el.textContent = String(LINK_COUNT); });
}

function revealAllGraphs() {
  brain?.setReveal(1);
  pipeline?.setReveal(1);
}

function scrollToSection(href) {
  const target = href ? document.querySelector(href) : null;
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", href);
}

// ---------- Tema: Sistema · Claro · Oscuro ----------

const THEME_STORAGE_KEY = "theme";
const THEMES = new Set(["system", "light", "dark"]);

function initThemeSwitch() {
  const inputs = Array.from(document.querySelectorAll(".theme-switch input[name='theme']"));
  if (!inputs.length) return;

  const metas = Array.from(document.querySelectorAll("meta[name='theme-color']"));
  const originalMeta = metas.map((meta) => meta.getAttribute("content"));
  const current = root.getAttribute("data-theme") ?? "system";
  inputs.forEach((input) => { input.checked = input.value === current; });
  syncThemeColor(current);

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked || !THEMES.has(input.value)) return;
      const apply = () => applyTheme(input.value);
      if (document.startViewTransition && !prefersReducedMotion) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  });

  function applyTheme(theme) {
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    storeTheme(theme);
    syncThemeColor(theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  // La barra del navegador móvil sigue al tema elegido; con "Sistema" vuelven los valores por media query.
  function syncThemeColor(theme) {
    const background = getComputedStyle(root).getPropertyValue("--bg").trim();
    metas.forEach((meta, index) => {
      meta.setAttribute("content", theme === "system" ? originalMeta[index] : background);
    });
  }
}

function storeTheme(theme) {
  try {
    if (theme === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("No se pudo guardar el tema:", error.message);
  }
}

// ---------- Navegación: sección activa, indicador deslizante y atajos 1–7 ----------

function initScrollSpy() {
  const nav = document.querySelector(".side-nav");
  if (!nav) return;
  const indicator = nav.querySelector(".nav-indicator");
  const links = new Map(
    Array.from(nav.querySelectorAll("a[href^='#']")).map((link) => [link.getAttribute("href").slice(1), link])
  );
  const sections = Array.from(links.keys()).map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const moveIndicator = (link) => {
    if (!indicator || !link) return;
    indicator.style.transform = `translateY(${link.offsetTop}px)`;
    indicator.style.height = `${link.offsetHeight}px`;
    indicator.classList.add("is-visible");
  };

  const setActive = (id) => {
    links.forEach((link) => link.removeAttribute("aria-current"));
    const active = links.get(id);
    active?.setAttribute("aria-current", "location");
    moveIndicator(active);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));

  window.addEventListener("resize", () => moveIndicator(nav.querySelector("[aria-current='location']")));
  initKeyboardShortcuts(Array.from(links.values()));
}

function initKeyboardShortcuts(links) {
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable]")) return;
    const index = Number.parseInt(event.key, 10) - 1;
    const link = links[index];
    if (!link) return;
    event.preventDefault();
    scrollToSection(link.getAttribute("href"));
  });
}

// ---------- Grafos ----------

function bindReadout(container) {
  const fields = {};
  container?.querySelectorAll("[data-field]").forEach((el) => { fields[el.dataset.field] = el; });
  const defaults = Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.textContent]));
  const link = container?.querySelector("[data-field-link]");

  return (data) => {
    const values = data ?? defaults;
    for (const [key, el] of Object.entries(fields)) {
      el.textContent = values[key] !== undefined ? String(values[key]) : defaults[key];
    }
    if (link) {
      link.hidden = !data?.href;
      if (data?.href) link.setAttribute("href", data.href);
    }
    container?.classList.toggle("is-active", Boolean(data));
  };
}

function initBrain() {
  const canvas = document.querySelector(".brain-canvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return null;

  const card = document.querySelector("[data-readout='brain']");
  const updateReadout = bindReadout(card);

  try {
    const graph = createBrainGraph(canvas, {
      pointerTarget: hero,
      reducedMotion: prefersReducedMotion,
      onNodeHover: (node) => {
        updateReadout(node);
        if (node) positionCard(card, hero, node);
      },
      onNodeSelect: scrollToSection,
    });
    graph.start();
    return graph;
  } catch (error) {
    canvas.hidden = true;
    console.warn("Grafo desactivado:", error.message);
    return null;
  }
}

// Coloca la tarjeta junto al nodo, del lado que tenga espacio, sin salirse del hero.
function positionCard(card, container, { x, y, radius }) {
  if (!card) return;
  const gap = radius + 14;
  const bounds = container.getBoundingClientRect();
  const { width, height } = card.getBoundingClientRect();
  const margin = 12;

  let left = x + gap;
  if (left + width > bounds.width - margin) left = x - gap - width;
  let top = y + gap;
  if (top + height > bounds.height - margin) top = y - gap - height;

  left = Math.min(Math.max(left, margin), bounds.width - width - margin);
  top = Math.min(Math.max(top, margin), bounds.height - height - margin);
  card.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

function initPipeline() {
  const canvas = document.querySelector(".pipeline-canvas");
  const frame = document.querySelector(".pipeline-frame");
  if (!canvas || !frame) return null;

  const updateReadout = bindReadout(document.querySelector("[data-readout='pipeline']"));

  try {
    const graph = createPipelineGraph(canvas, {
      pointerTarget: frame,
      reducedMotion: prefersReducedMotion,
      onNodeHover: (node) => updateReadout(node ? { label: node.label, stage: node.stage, detail: node.detail } : null),
    });
    graph.start();
    return graph;
  } catch (error) {
    canvas.hidden = true;
    console.warn("Pipeline desactivado:", error.message);
    return null;
  }
}

// ---------- Motion ----------

function loadMotion() {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Motion tardó demasiado en cargar.")), MOTION_TIMEOUT_MS)
  );
  return Promise.race([import(MOTION_URL), timeout]);
}

function initAnimations({ animate, scroll, inView, stagger }) {
  animateHeroEntrance(animate, stagger);
  animatePipelineOnView(animate, inView);
  animateTimeline(animate, scroll);
  revealOnScroll(animate, inView);
  countUpOnScroll(animate, inView);
}

// Único momento orquestado: las notas aparecen del centro hacia afuera mientras entra el texto.
function animateHeroEntrance(animate, stagger) {
  if (brain) {
    animate(0, 1, {
      duration: 2.2,
      delay: 0.2,
      ease: EASE_OUT,
      onUpdate: (value) => brain.setReveal(value),
    });
  }

  animate(
    "[data-hero]",
    { opacity: [0, 1], y: [16, 0] },
    { duration: 0.6, delay: stagger(0.07, { startDelay: 0.15 }), ease: EASE_OUT }
  );
}

function animatePipelineOnView(animate, inView) {
  const frame = document.querySelector(".pipeline-frame");
  if (!frame || !pipeline) return;

  const stop = inView(frame, () => {
    animate(0, 1, {
      duration: 2,
      ease: EASE_OUT,
      onUpdate: (value) => pipeline.setReveal(value),
    });
    stop?.();
  }, { amount: 0.35 });
}

function animateTimeline(animate, scroll) {
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;

  scroll(
    animate(".timeline-fill", { scaleY: [0, 1] }, { ease: "linear" }),
    { target: timeline, offset: ["start 75%", "end 55%"] }
  );
}

function revealOnScroll(animate, inView) {
  inView(
    ".reveal",
    (entryOrElement) => {
      const element = resolveElement(entryOrElement);
      animate(
        element,
        { opacity: [0, 1], y: [14, 0] },
        { duration: 0.5, delay: siblingIndex(element) * 0.06, ease: EASE_OUT }
      );
    },
    { amount: 0.2 }
  );
}

function countUpOnScroll(animate, inView) {
  inView(
    "[data-count]",
    (entryOrElement) => {
      const element = resolveElement(entryOrElement);
      const target = Number.parseInt(element.dataset.count, 10);
      if (!Number.isFinite(target)) return;

      animate(0, target, {
        duration: 1.2,
        ease: EASE_OUT,
        onUpdate: (value) => {
          element.textContent = String(Math.round(value));
        },
      });
    },
    { amount: 0.6 }
  );
}

// Motion 11 entrega un IntersectionObserverEntry; Motion 12 entrega el elemento.
function resolveElement(entryOrElement) {
  return entryOrElement instanceof Element ? entryOrElement : entryOrElement.target;
}

function siblingIndex(element) {
  const parent = element.parentElement;
  if (!parent) return 0;
  const siblings = Array.from(parent.children).filter((child) => child.classList.contains("reveal"));
  return Math.min(siblings.indexOf(element), 4);
}
