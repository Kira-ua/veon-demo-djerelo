// Page behaviour without libraries: header line, mobile menu, «Написати» popovers,
// situations (accordion on phones, switcher on desktop), price tabs, mobile contact bar.
// Without JS every panel is visible and every link works (Floor: content visible with scripting off).

const root = document.documentElement;
const desktop = window.matchMedia("(min-width: 1024px)");

/* header: thin line once the page scrolls */
const header = document.querySelector<HTMLElement>("[data-header]");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 4);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* «Написати»: one open at a time, close on outside click and Escape */
const writes = Array.from(document.querySelectorAll<HTMLDetailsElement>("[data-write]"));
writes.forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open) writes.forEach((o) => { if (o !== d) o.open = false; });
  }),
);
document.addEventListener("click", (e) => {
  writes.forEach((d) => { if (d.open && !d.contains(e.target as Node)) d.open = false; });
});

/* mobile menu */
const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const menu = document.querySelector<HTMLElement>("[data-menu]");
const setMenu = (open: boolean, focusBack = true) => {
  if (!toggle || !menu) return;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".visually-hidden")!.textContent = open ? "Закрити меню" : "Меню";
  menu.hidden = !open;
  root.classList.toggle("menu-open", open);
  if (open) menu.querySelector<HTMLElement>("a, summary, button")?.focus();
  else if (focusBack) toggle.focus();
};
toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
// Anchor from the menu: unlock scrolling first, then scroll (the lock would swallow the jump).
menu?.querySelectorAll<HTMLAnchorElement>("[data-menu-link]").forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    setMenu(false, false);
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", a.hash);
    });
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (toggle?.getAttribute("aria-expanded") === "true") setMenu(false);
  writes.forEach((d) => {
    if (d.open) { d.open = false; d.querySelector("summary")?.focus(); }
  });
});
window.matchMedia("(min-width: 1200px)").addEventListener("change", (m) => { if (m.matches) setMenu(false, false); });

/* situations */
const sitButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sit]"));
const panelOf = (b: HTMLButtonElement) => document.getElementById(b.getAttribute("aria-controls")!)!;
const openSit = (btn: HTMLButtonElement, toggleable: boolean) => {
  const wasOpen = btn.getAttribute("aria-expanded") === "true";
  sitButtons.forEach((b) => {
    const on = b === btn ? (toggleable ? !wasOpen : true) : false;
    b.setAttribute("aria-expanded", String(on));
    panelOf(b).hidden = !on;
  });
};
if (sitButtons.length) {
  sitButtons.forEach((b, i) => {
    b.setAttribute("aria-expanded", String(i === 0));
    panelOf(b).hidden = i !== 0;
    b.addEventListener("click", () => openSit(b, !desktop.matches));
    b.addEventListener("keydown", (e) => {
      const k = e.key;
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(k)) return;
      e.preventDefault();
      const n = sitButtons.length;
      const j = k === "Home" ? 0 : k === "End" ? n - 1 : (i + (k === "ArrowDown" ? 1 : -1) + n) % n;
      sitButtons[j].focus();
      if (desktop.matches) openSit(sitButtons[j], false);
    });
  });
  // desktop needs one panel open at all times
  desktop.addEventListener("change", (m) => {
    if (m.matches && !sitButtons.some((b) => b.getAttribute("aria-expanded") === "true")) openSit(sitButtons[0], false);
  });
}

/* price tabs */
document.querySelectorAll<HTMLElement>("[data-tabs]").forEach((list) => {
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>("[role=tab]"));
  const ink = list.querySelector<HTMLElement>(".tabs__ink");
  const moveInk = (t: HTMLElement) => {
    if (ink) ink.style.transform = `translateX(${t.offsetLeft}px) scaleX(${t.offsetWidth})`;
  };
  const select = (t: HTMLButtonElement, focus = false) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")!)!.hidden = !on;
    });
    moveInk(t);
    if (focus) t.focus();
    t.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const n = tabs.length;
      const k = e.key;
      let j = -1;
      if (k === "ArrowRight") j = (i + 1) % n;
      else if (k === "ArrowLeft") j = (i - 1 + n) % n;
      else if (k === "Home") j = 0;
      else if (k === "End") j = n - 1;
      if (j < 0) return;
      e.preventDefault();
      select(tabs[j], true);
    });
  });
  const current = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
  tabs.forEach((x) => { document.getElementById(x.getAttribute("aria-controls")!)!.hidden = x !== current; x.tabIndex = x === current ? 0 : -1; });
  // place the indicator without a transition on first paint
  if (ink) { ink.style.transition = "none"; moveInk(current); void ink.offsetWidth; ink.style.transition = ""; }
  window.addEventListener("resize", () => moveInk(tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? current), { passive: true });
  document.fonts?.ready.then(() => moveInk(tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? current));
});

/* mobile contact bar: appears after the first screen */
const bar = document.querySelector<HTMLElement>("[data-bottom-bar]");
const hero = document.getElementById("top");
if (bar && hero && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    const shown = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
    bar.classList.toggle("is-shown", shown);
    if (!shown) bar.querySelector<HTMLDetailsElement>("details")?.removeAttribute("open");
  }, { threshold: 0 }).observe(hero.querySelector(".btn--hero") ?? hero);
} else bar?.classList.add("is-shown");
