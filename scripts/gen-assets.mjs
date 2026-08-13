/**
 * 16-bit pixel art asset generator for a GitHub profile README.
 *
 * Everything is drawn with <rect> "pixels" so the art renders identically on
 * GitHub (which strips <script>, blocks web fonts, and proxies images via camo).
 * SMIL animation (<animate> / <animateTransform>) DOES survive camo, so the
 * blinking, hovering and scrolling all work inside the README.
 *
 * Run:  node github-profile/scripts/gen-assets.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

/* ------------------------------------------------------------------ *
 * EDIT ME: HUD numbers (GitHub gives no API for these inside an SVG)
 * ------------------------------------------------------------------ */
const STATS = {
  hp: { label: "HP", sub: "REPOS", value: 38, max: 50, color: "#ff4d5e" },
  mp: { label: "MP", sub: "COMMITS", value: 1240, max: 1500, color: "#4d7bff" },
  exp: { label: "EX", sub: "PULL REQ", value: 64, max: 100, color: "#ffd23f" },
}

const PLAYER = "VAIBHAV"
const PLAYER2 = "WAGHELA"

/* EDIT ME: the boss you are currently fighting (your work-in-progress) */
const BOSS = { name: "LEGACY CODEBASE", weapon: "REFACTOR HAMMER", hp: 0.22 }

/* EDIT ME: quest log. done:true renders a checkmark, false renders a pulse. */
const QUESTS = [
  { t: "SHIP LANGGRAPH AGENT SWARM", xp: "+240 XP", done: true },
  { t: "TRAIN VISION MODEL ON EDGE", xp: "+180 XP", done: true },
  { t: "DEPLOY ESP32 SENSOR MESH", xp: "+150 XP", done: true },
  { t: "MASTER CUDA KERNEL WRITING", xp: "+300 XP", done: false },
  { t: "OPEN SOURCE AN LLM TOOLKIT", xp: "+500 XP", done: false },
]

/* EDIT ME: high score table */
const SCORES = [
  { rank: "1ST", name: "NEURAL NETS", score: "982450" },
  { rank: "2ND", name: "PYTHON", score: "874100" },
  { rank: "3RD", name: "LANGGRAPH", score: "651200" },
  { rank: "4TH", name: "EMBEDDED C", score: "428900" },
  { rank: "5TH", name: "TYPESCRIPT", score: "310600" },
]

/* EDIT ME: world map stops (your journey) */
const WORLD = [
  { name: "PYTHON", year: "2021", done: true },
  { name: "ML CORE", year: "2022", done: true },
  { name: "DEEP NETS", year: "2023", done: true },
  { name: "LLM OPS", year: "2024", done: true },
  { name: "AGENTS", year: "2025", done: false },
]

/* EDIT ME: the achievement toast */
const ACHIEVEMENT = { title: "AI ENGINEER", sub: "ACHIEVEMENT UNLOCKED" }

/* EDIT ME: rotating loading tips */
const TIPS = [
  "TIP: NEURAL NETS LOVE CLEAN DATA",
  "TIP: ALWAYS SET A RANDOM SEED",
  "TIP: SHIP SMALL, ITERATE FAST",
]

/* ------------------------------------------------------------------ *
 * Palette (limited, SNES-ish)
 * ------------------------------------------------------------------ */
const C = {
  void: "#07071a",
  space: "#0b0b26",
  deep: "#141438",
  panel: "#101044",
  border: "#e8f0ff",
  white: "#e8f0ff",
  gray: "#8b95bd",
  cyan: "#4de2f0",
  magenta: "#ff4fa3",
  yellow: "#ffd23f",
  green: "#47f06e",
  red: "#ff4d5e",
  blue: "#4d7bff",
  orange: "#ff8a3d",
  brown: "#8a5a2b",
  purple: "#6a3fb5",
}

/* ------------------------------------------------------------------ *
 * 5x7 pixel font
 * ------------------------------------------------------------------ */
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10011", "01111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  3: ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "01100", "00100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  "'": ["00100", "00100", "00100", "00000", "00000", "00000", "00000"],
  "[": ["00110", "00100", "00100", "00100", "00100", "00100", "00110"],
  "]": ["01100", "00100", "00100", "00100", "00100", "00100", "01100"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
  "%": ["10001", "00010", "00100", "01000", "10000", "00001", "10001"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
}

const CHAR_W = 6 // 5px glyph + 1px letter spacing

// Keep pixel typography compact inside GitHub's narrow README column.
// Integer scales preserve crisp edges while reducing the previous oversized feel.
function displayScale(scale = 1) {
  return Math.max(1, Math.floor(scale * 0.8))
}

function textWidth(str, scale = 1) {
  const sc = displayScale(scale)
  return (str.length * CHAR_W - 1) * sc
}

function pixelText(str, x, y, scale, color, opts = {}) {
  const out = []
  const sc = displayScale(scale)
  const chars = String(str).toUpperCase().split("")
  chars.forEach((ch, i) => {
    const glyph = FONT[ch] || FONT["?"]
    glyph.forEach((row, ry) => {
      let run = 0
      for (let rx = 0; rx <= row.length; rx++) {
        if (row[rx] === "1") {
          run++
        } else if (run > 0) {
          const px = x + (i * CHAR_W + (rx - run)) * sc
          const py = y + ry * sc
          out.push(
            `<rect x="${px}" y="${py}" width="${run * sc}" height="${sc}" fill="${color}"${
              opts.extra ? " " + opts.extra : ""
            }/>`,
          )
          run = 0
        }
      }
    })
  })
  return out.join("")
}

/** Chunky text with a hard pixel drop shadow + optional outline. */
function titleText(str, x, y, scale, fill, shadow, outline) {
  let s = ""
  if (outline) {
    for (const [dx, dy] of [
      [-scale, 0],
      [scale, 0],
      [0, -scale],
      [0, scale],
    ]) {
      s += pixelText(str, x + dx, y + dy, scale, outline)
    }
  }
  // Offset by exactly one pixel-grid unit. Scaling this offset (e.g. scale*2)
  // makes the shadow read as a second overlapping word at large sizes.
  if (shadow) s += pixelText(str, x + scale, y + scale, scale, shadow)
  s += pixelText(str, x, y, scale, fill)
  return s
}

/* ------------------------------------------------------------------ *
 * Grid helper: paint a char-map with a palette
 * ------------------------------------------------------------------ */
function grid(rows, x, y, scale, palette) {
  const out = []
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const key = row[rx]
      const fill = palette[key]
      if (!fill) continue
      out.push(
        `<rect x="${x + rx * scale}" y="${y + ry * scale}" width="${scale}" height="${scale}" fill="${fill}"/>`,
      )
    }
  })
  return out.join("")
}

/* deterministic pseudo random so re-runs produce identical files */
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function starfield(seed, w, h, count, colors = [C.white, C.cyan, C.gray]) {
  const r = rng(seed)
  let out = ""
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * w)
    const y = Math.floor(r() * h)
    const size = r() > 0.85 ? 2 : 1
    const color = colors[Math.floor(r() * colors.length)]
    const dur = (1.2 + r() * 2.6).toFixed(2)
    out += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" opacity="0.9"><animate attributeName="opacity" values="0.15;1;0.35;0.9;0.15" dur="${dur}s" repeatCount="indefinite"/></rect>`
  }
  return out
}

/** Vertically scrolling star layer (drawn twice, translated for a seamless loop). */
function scrollLayer(seed, w, h, count, dur, colors) {
  const stars = starfield(seed, w, h, count, colors)
  return `<g><g>${stars}</g><g transform="translate(0,${-h})">${stars}</g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${h}" dur="${dur}s" repeatCount="indefinite"/></g>`
}

/** Pixel disc built from row widths -> a planet. */
function planet(cx, cy, r, base, shade, ring) {
  let out = ""
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y))
    out += `<rect x="${cx - w}" y="${cy + y}" width="${w * 2}" height="1" fill="${base}"/>`
    if (y % 3 === 0) {
      out += `<rect x="${cx - w}" y="${cy + y}" width="${Math.max(2, Math.floor(w * 0.8))}" height="1" fill="${shade}" opacity="0.55"/>`
    }
  }
  if (ring) {
    out += `<rect x="${cx - r - 6}" y="${cy + Math.floor(r * 0.35)}" width="${r * 2 + 12}" height="1" fill="${ring}" opacity="0.85"/>`
    out += `<rect x="${cx - r - 4}" y="${cy + Math.floor(r * 0.35) + 2}" width="${r * 2 + 8}" height="1" fill="${ring}" opacity="0.5"/>`
  }
  return out
}

function nebula(seed, cx, cy, w, h, color) {
  const r = rng(seed)
  let out = ""
  for (let i = 0; i < 70; i++) {
    const x = cx + Math.floor((r() - 0.5) * w)
    const y = cy + Math.floor((r() - 0.5) * h)
    const s = 2 + Math.floor(r() * 4)
    out += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${color}" opacity="${(0.05 + r() * 0.16).toFixed(2)}"/>`
  }
  return out
}

/** Thick JRPG-style pixel frame. */
function frame(x, y, w, h, fill, border = C.border, t = 3) {
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${border}"/>`,
    `<rect x="${x + t}" y="${y + t}" width="${w - t * 2}" height="${h - t * 2}" fill="${C.void}"/>`,
    `<rect x="${x + t + 1}" y="${y + t + 1}" width="${w - (t + 1) * 2}" height="${h - (t + 1) * 2}" fill="${fill}"/>`,
    // clipped corners for a chunkier arcade look
    `<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="${C.void}"/>`,
    `<rect x="${x + w - t}" y="${y}" width="${t}" height="${t}" fill="${C.void}"/>`,
    `<rect x="${x}" y="${y + h - t}" width="${t}" height="${t}" fill="${C.void}"/>`,
    `<rect x="${x + w - t}" y="${y + h - t}" width="${t}" height="${t}" fill="${C.void}"/>`,
  ].join("")
}

/** Faint CRT scanlines over the whole canvas. */
function scanlines(w, h, step = 3, opacity = 0.14) {
  let out = ""
  for (let y = 0; y < h; y += step) {
    out += `<rect x="0" y="${y}" width="${w}" height="1" fill="#000010" opacity="${opacity}"/>`
  }
  return out
}

/** Largest integer scale at which `str` fits in `maxW`, clamped to [1, max]. */
function fitScale(str, maxW, max = 6) {
  for (let sc = max; sc > 1; sc--) {
    if (textWidth(str, sc) <= maxW) return sc
  }
  return 1
}

/** Draw text horizontally centered inside [x, x+w], auto-shrinking to fit. */
function centerText(str, x, w, y, scale, color) {
  const sc = Math.min(scale, fitScale(str, w, scale))
  return pixelText(str, Math.round(x + (w - textWidth(str, sc)) / 2), y, sc, color)
}

function svg(w, h, body, extraAttrs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 2}" height="${h * 2}" shape-rendering="crispEdges" ${extraAttrs}>${body}</svg>`
}

/* ================================================================== *
 * 1. TITLE SCREEN
 * ================================================================== */
function buildTitle() {
  const W = 640
  const H = 220
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += nebula(7, 140, 70, 300, 140, C.purple)
  s += nebula(31, 520, 160, 220, 110, C.magenta)
  s += scrollLayer(11, W, H, 130, 26, [C.white, C.gray])
  s += scrollLayer(29, W, H, 55, 12, [C.cyan, C.white])
  s += planet(576, 46, 24, C.blue, C.purple, C.cyan)
  s += planet(58, 178, 13, C.magenta, C.purple, null)

  // shooting star
  s += `<g opacity="0"><rect x="0" y="0" width="12" height="1" fill="${C.white}"/><rect x="12" y="0" width="2" height="1" fill="${C.cyan}"/>
    <animateTransform attributeName="transform" type="translate" values="460 10;120 96" dur="1.1s" begin="2s;10s;18s" repeatCount="1" fill="freeze"/>
    <animate attributeName="opacity" values="0;1;1;0" dur="1.1s" begin="2s;10s;18s"/></g>`

  // title — two chunky glowing lines, auto-fit inside a safe inner width
  const inner = W - 200 // leaves room for the ship (left) and planet (right)
  const t = Math.min(5, fitScale(PLAYER, inner, 5), fitScale(PLAYER2, inner, 5))
  const x1 = Math.round((W - textWidth(PLAYER, t)) / 2)
  const x2 = Math.round((W - textWidth(PLAYER2, t)) / 2)
  // glyphs are 7px tall at scale t; titleText also draws a 1px-scaled drop
  // shadow below/right, so a line occupies t*8. Add t*3 of leading on top.
  const lineGap = t * 8 + t * 3
  const l1 = titleText(PLAYER, x1, 34, t, C.cyan, C.purple, C.void)
  const l2 = titleText(PLAYER2, x2, 34 + lineGap, t, C.yellow, C.magenta, C.void)
  s += `<g>${l1}${l2}<animate attributeName="opacity" values="0.84;1;0.84" dur="2.4s" repeatCount="indefinite"/></g>`

  // subtitle + blinking insert coin
  s += centerText("AI / ML ENGINEER  -  LEVEL 20", 0, W, 152, 3, C.white)
  const coin = "[ INSERT COIN TO HIRE AI ENGINEER ]"
  s += `<g>${centerText(coin, 0, W, 184, 3, C.green)}<animate attributeName="opacity" values="1;1;1;0;0" dur="1.4s" repeatCount="indefinite"/></g>`

  // galaga-style ship + lasers
  const ship = [
    "....CC....",
    "...CCCC...",
    "...CWWC...",
    "..CCWWCC..",
    ".CCCCCCCC.",
    "CCMCCCCMCC",
    "MM.CCCC.MM",
    "...OO.OO..",
    "..O.O.O.O.",
  ]
  const shipPal = { C: C.cyan, W: C.white, M: C.magenta, O: C.orange }
  s += `<g>
    <g transform="translate(0,0)">
      ${grid(ship, 0, 0, 4, shipPal)}
      <g>
        <rect x="8" y="-14" width="4" height="12" fill="${C.yellow}"/>
        <rect x="28" y="-14" width="4" height="12" fill="${C.yellow}"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -42" dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.8s" repeatCount="indefinite"/>
      </g>
    </g>
    <animateTransform attributeName="transform" type="translate" values="26 62;26 50;26 74;26 62" dur="4.6s" repeatCount="indefinite"/>
  </g>`

  // enemy invader drifting on the right
  const inv = ["..X...X..", ".XXXXXXX.", "XX.XXX.XX", "XXXXXXXXX", ".X.....X.", "..X...X.."]
  s += `<g>${grid(inv, 0, 0, 4, { X: C.green })}
    <animateTransform attributeName="transform" type="translate" values="546 104;570 104;546 104" dur="3s" repeatCount="indefinite"/></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 2. RPG DIALOGUE BOX
 * ================================================================== */
function buildDialogue() {
  const W = 640
  const H = 232
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(5, W, H, 60)
  s += frame(0, 0, W, H, C.panel)

  // portrait slot — sits below the nameplate, inset from the bottom edge
  const portY = 44
  const portH = H - portY - 20
  s += frame(14, portY, 100, portH, C.deep, C.cyan, 3)
  const astro = [
    "....WWWWWWWW....",
    "..WWWWWWWWWWWW..",
    "..WWVVVVVVVVWW..",
    "..WVVCCVVVVVVW..",
    "..WVVCCVVVVVVW..",
    "..WVVVVVVVVVVW..",
    "..WWVVVVVVVVWW..",
    "..WWWWWWWWWWWW..",
    "....WWWWWWWW....",
    "...WWWWOOWWWWG..",
    "..GWWWWOOWWWWG..",
    "..GWWWWWWWWWWG..",
    "..GWWWWWWWWWWG..",
    "...WWWW..WWWW...",
    "...GGG....GGG...",
    "...GGG....GGG...",
  ]
  s += `<g><g transform="translate(24,${portY + Math.round((portH - 16 * 5) / 2)})">${grid(astro, 0, 0, 5, {
    W: C.white,
    G: C.gray,
    V: "#0b1a3a",
    C: C.cyan,
    O: C.orange,
  })}</g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="2.6s" repeatCount="indefinite"/></g>`

  // speaker nameplate
  const nameW = textWidth("VAIBHAV", 3) + 16
  s += `<rect x="14" y="10" width="${nameW}" height="24" fill="${C.cyan}"/>`
  s += pixelText("VAIBHAV", 22, 18, 3, C.void)

  const textX = 132
  const textW = W - textX - 18
  const lines = [
    { t: "GREETINGS TRAVELER!", c: C.white },
    { t: "I AM A LEVEL 20 AI/ML ENGINEER.", c: C.white },
    { t: "MY QUEST INVOLVES TAMING NEURAL", c: C.cyan },
    { t: "NETWORKS, BUILDING LANGGRAPH", c: C.cyan },
    { t: "SYSTEMS, AND CRAFTING ESP32", c: C.cyan },
    { t: "ARTIFACTS.", c: C.yellow },
  ]

  // Typewriter reveal: ONE looping animation per line with computed keyTimes.
  // (Two <animate> elements on the same attribute fight each other and stall.)
  const typeDur = 0.9
  const step = 1.05
  const total = lines.length * step + 2.6
  // Vertically center the text block against the portrait frame.
  const pitch = 26
  const blockH = lines.length * pitch
  const topY = Math.round(portY + (portH - blockH) / 2) + 4
  lines.forEach((ln, i) => {
    const sc = Math.min(3, fitScale(ln.t, textW, 3))
    const w = textWidth(ln.t, sc)
    const y = topY + i * pitch
    const id = `tw${i}`
    const t0 = (i * step) / total
    const t1 = (i * step + typeDur) / total
    s += `<clipPath id="${id}"><rect x="${textX}" y="${y - 2}" width="0" height="22">
      <animate attributeName="width" values="0;0;${w};${w}" keyTimes="0;${t0.toFixed(4)};${t1.toFixed(4)};1" dur="${total.toFixed(2)}s" repeatCount="indefinite"/>
    </rect></clipPath>`
    s += `<g clip-path="url(#${id})">${pixelText(ln.t, textX, y, sc, ln.c)}</g>`
  })

  // bouncing continue arrow
  s += `<g><g><rect x="0" y="0" width="16" height="3" fill="${C.yellow}"/><rect x="3" y="3" width="10" height="3" fill="${C.yellow}"/><rect x="6" y="6" width="4" height="3" fill="${C.yellow}"/></g>
    <animateTransform attributeName="transform" type="translate" values="${W - 42} 168;${W - 42} 162;${W - 42} 168" dur="0.9s" repeatCount="indefinite"/></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 3. PLAYER HUD
 * ================================================================== */
function buildHud() {
  const W = 640
  const H = 262
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(17, W, H, 50)
  s += frame(0, 0, W, H, C.deep)

  s += pixelText("PLAYER STATS", 16, 16, 4, C.yellow)
  s += `<rect x="16" y="46" width="${W - 32}" height="3" fill="${C.cyan}" opacity="0.7"/>`

  const icons = {
    shield: [".XXXXX.", "XXXXXXX", "XXWWWXX", "XXWWWXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
    sword: ["......W", ".....WW", "....WW.", "...WW..", "..WW...", ".GWG...", "GG.....", "G......"],
    star: ["...Y...", "...Y...", ".YYYYY.", "..YYY..", ".YY.YY.", ".Y...Y.", ".......", "......."],
  }
  const iconPal = { X: C.gray, W: C.white, G: C.brown, Y: C.yellow }
  const order = [
    ["hp", "shield"],
    ["mp", "sword"],
    ["exp", "star"],
  ]

  // Right-hand value column is sized to the widest value so nothing overflows.
  const valScale = 3
  const valColW = Math.max(
    ...order.map(([k]) => textWidth(`${STATS[k].value}/${STATS[k].max}`, valScale)),
  )
  const labelX = 48
  const bx = 240 // wide label column so long skill names never reach the bar
  const bw = W - 16 - valColW - 14 - bx
  const bh = 18
  const cycle = 6 // seconds; bars refill on a loop instead of freezing
  const labelW = bx - labelX - 14
  const rowPitch = 50

  order.forEach(([key, icon], i) => {
    const st = STATS[key]
    const y = 64 + i * rowPitch
    s += grid(icons[icon], 16, y - 2, 3, iconPal)
    // label sits on the bar's centerline, sub-label tucks underneath it
    s += pixelText(st.label, labelX, y - 2, Math.min(3, fitScale(st.label, labelW, 3)), st.color)
    s += pixelText(st.sub, labelX, y + 22, Math.min(2, fitScale(st.sub, labelW, 2)), C.gray)

    // bar chassis
    s += `<rect x="${bx - 3}" y="${y - 3}" width="${bw + 6}" height="${bh + 6}" fill="${C.white}"/>`
    s += `<rect x="${bx}" y="${y}" width="${bw}" height="${bh}" fill="#1b1b40"/>`

    const pct = Math.max(0.06, Math.min(1, st.value / st.max))
    const fw = Math.round(bw * pct)
    const t0 = (i * 0.3) / cycle
    const t1 = (i * 0.3 + 1.4) / cycle
    const kt = `0;${t0.toFixed(4)};${t1.toFixed(4)};1`
    const grow = `<animate attributeName="width" values="0;0;${fw};${fw}" keyTimes="${kt}" dur="${cycle}s" repeatCount="indefinite"/>`
    s += `<rect x="${bx}" y="${y}" width="0" height="${bh}" fill="${st.color}">${grow}</rect>`
    s += `<rect x="${bx}" y="${y}" width="0" height="4" fill="${C.white}" opacity="0.5">${grow}</rect>`

    // segment ticks
    for (let sx = bx + 10; sx < bx + bw; sx += 10) {
      s += `<rect x="${sx}" y="${y}" width="1" height="${bh}" fill="${C.void}" opacity="0.5"/>`
    }

    const val = `${st.value}/${st.max}`
    s += pixelText(val, W - 16 - textWidth(val, valScale), y + 3, valScale, C.white)
  })

  const foot = "READY PLAYER ONE"
  const coin = "1 CREDIT"
  s += `<g>${pixelText(foot, 16, H - 32, 3, C.green)}<animate attributeName="opacity" values="1;0.15;1" dur="1.8s" repeatCount="indefinite"/></g>`
  s += pixelText(coin, W - 16 - textWidth(coin, 3), H - 32, 3, C.magenta)

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 4. SECTOR MAP HEADER (sits above the contribution graph)
 * ================================================================== */
function buildSector() {
  const W = 640
  const H = 92
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(23, W, H, 50)
  s += frame(0, 0, W, H, C.panel)

  s += pixelText("EXPLORED SECTORS", 18, 18, 4, C.green)
  s += pixelText("CONTRIBUTION SCAN IN PROGRESS", 18, 54, 2, C.gray)

  // terrain blocks = contribution mini-map, right-aligned in its own column
  const cols = 8
  const rows = 3
  const cell = 14
  const mapW = cols * cell
  const mapX = W - 20 - mapW
  const mapY = 18
  const shades = ["#123a1f", "#1f7a3a", "#2fd257", C.green]
  for (let i = 0; i < cols * rows; i++) {
    const fill = shades[(i * 5) % 4]
    const cx = mapX + (i % cols) * cell
    const cy = mapY + Math.floor(i / cols) * cell
    s += `<rect x="${cx}" y="${cy}" width="11" height="11" fill="${fill}"><animate attributeName="opacity" values="0.3;1;0.3" dur="${(1.6 + (i % 7) * 0.22).toFixed(2)}s" repeatCount="indefinite"/></rect>`
  }

  // tiny ship navigating through the sectors
  const ship = ["..C..", ".CWC.", "CCCCC", "O.O.O"]
  const px = (c) => mapX + c * cell - 2
  const py = (r) => mapY + r * cell - 2
  s += `<g>${grid(ship, 0, 0, 2, { C: C.cyan, W: C.white, O: C.orange })}
    <animateTransform attributeName="transform" type="translate" values="${px(0)} ${py(0)};${px(7)} ${py(0)};${px(7)} ${py(1)};${px(0)} ${py(1)};${px(0)} ${py(2)};${px(7)} ${py(2)};${px(0)} ${py(0)}" dur="9s" repeatCount="indefinite"/></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 5. INVENTORY
 * ================================================================== */
function buildInventory() {
  const items = [
    {
      name: "PYTHON",
      pal: { G: "#3fb950", Y: C.yellow, W: C.white, K: C.void },
      art: [
        "................",
        "...GGGG.........",
        "..GGGGGG........",
        "..GGKGGG........",
        "..GGGGGG..YYYY..",
        "...GGGGGGGYYYY..",
        ".....GGGGGYYYY..",
        "......GGGGGGYY..",
        "......YYYGGGGG..",
        "..YYYYYYY.GGGG..",
        "..YYYY.....GGG..",
        "..YYYY....GGGG..",
        "..YYYYYYYYYYGG..",
        "...YYYYYYYYYG...",
        "................",
        "................",
      ],
    },
    {
      name: "PYTORCH",
      pal: { B: C.brown, O: C.orange, Y: C.yellow, W: C.white },
      art: [
        ".......Y........",
        "......YOY.......",
        ".....YOOOY......",
        ".....YOWOY......",
        "....YOOWOOY.....",
        "....YOOOOOY.....",
        ".....YOOOY......",
        "......YOY.......",
        "....BBBBBB......",
        "....BBBBBB......",
        ".....BBBB.......",
        ".....BBBB.......",
        ".....BBBB.......",
        ".....BBBB.......",
        ".....BBBB.......",
        "................",
      ],
    },
    {
      name: "LANGCHAIN",
      pal: { G: C.gray, W: C.white, C: C.cyan },
      art: [
        "................",
        "..GGGG..........",
        ".GWWWWG.........",
        ".GW..WG.........",
        ".GW..WG.........",
        ".GWWWWG.........",
        "..GGCC..........",
        "....CC..........",
        "....CCGGGG......",
        ".....GWWWWG.....",
        ".....GW..WG.....",
        ".....GW..WG.....",
        ".....GWWWWG.....",
        "......GGGG......",
        "................",
        "................",
      ],
    },
    {
      name: "LANGGRAPH",
      pal: { C: C.cyan, W: C.white, M: C.magenta },
      art: [
        "................",
        "....CCC.........",
        "...CWWWC........",
        "....CCC.........",
        ".....C.C........",
        "......C.C.......",
        "..CCC..C.CCC....",
        ".CWWWC..CWWWC...",
        "..CCC....CCC....",
        "....C.....C.....",
        ".....C...C......",
        "......MMM.......",
        ".....MWWWM......",
        "......MMM.......",
        "................",
        "................",
      ],
    },
    {
      name: "TENSORFLW",
      pal: { O: C.orange, Y: C.yellow, W: C.white },
      art: [
        "................",
        "......OOOO......",
        ".....OOOO.......",
        "....OOOO........",
        "...OOOOOOO......",
        "....OOOOOO......",
        ".....OOOO.......",
        "....YY.OOOO.....",
        "...YYYY.OOO.....",
        "..YYYY...OO.....",
        "..YYY.....O.....",
        "..YY............",
        "..YY............",
        "..YY............",
        "................",
        "................",
      ],
    },
    {
      name: "OPENCV",
      pal: { W: C.white, C: C.cyan, K: C.void, R: C.red, G: C.green },
      art: [
        "................",
        "....WWWWWWW.....",
        "..WWCCCCCCCWW...",
        ".WWCCCKKKCCCWW..",
        ".WCCCKKKKKCCCW..",
        ".WCCCKKKKKCCCW..",
        ".WWCCCKKKCCCWW..",
        "..WWCCCCCCCWW...",
        "....WWWWWWW.....",
        "................",
        "..RRR.GGG.CCC...",
        "..RRR.GGG.CCC...",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    {
      name: "REACT",
      pal: { C: C.cyan, W: C.white },
      art: [
        "................",
        "....CCCCCCC.....",
        "..CC.......CC...",
        ".C....CCC....C..",
        "C....CWWWC....C.",
        "C....CWWWC....C.",
        ".C....CCC....C..",
        "..CC.......CC...",
        "....CCCCCCC.....",
        "................",
        "..C..........C..",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    {
      name: "NEXTJS",
      pal: { W: C.white, K: "#22243a", C: C.cyan },
      art: [
        "................",
        "....WWWWWW......",
        "..WWKKKKKKWW....",
        ".WKKWKKKKWKKW...",
        ".WKKWWKKKWKKW...",
        ".WKKWKWKKWKKW...",
        ".WKKWKKWKWKKW...",
        ".WKKWKKKWWKKW...",
        "..WWKKKKKKWW....",
        "....WWWWWW......",
        "......CC........",
        ".....CCCC.......",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    {
      name: "DOCKER",
      pal: { B: C.blue, W: C.white, C: C.cyan },
      art: [
        "................",
        "......WW........",
        ".....W..W.......",
        "......WW........",
        "..BB.BB.BB......",
        "..BB.BB.BB.CC...",
        ".BBBBBBBBBBCC...",
        ".BBBBBBBBBBBB...",
        "..BBBBBBBBBB....",
        "...BBBBBBBB.....",
        "..CC......CC....",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    {
      name: "ESP32",
      pal: { G: "#1f7a3a", Y: C.yellow, K: "#0d0d1f", W: C.white },
      art: [
        "................",
        "..YYYYYYYYYY....",
        ".GGGGGGGGGGGG...",
        ".GKKKKKKKKKKG...",
        ".GKWWWWWWWWKG...",
        ".GKWKKKKKKWKG...",
        ".GKWKWWWWKWKG...",
        ".GKWKWWWWKWKG...",
        ".GKWKKKKKKWKG...",
        ".GKWWWWWWWWKG...",
        ".GKKKKKKKKKKG...",
        ".GGGGGGGGGGGG...",
        "..YYYYYYYYYY....",
        "................",
        "................",
        "................",
      ],
    },
  ]

  const cols = 5
  // 128px keeps the longest label ("LANGGRAPH", 108px at scale 2) at full size
  const slot = 128
  const gap = 6
  const padX = 16
  const padTop = 62
  const rows = Math.ceil(items.length / cols)
  const W = padX * 2 + cols * slot + (cols - 1) * gap
  const H = padTop + rows * (slot + gap) + 44

  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += nebula(41, W / 2, H / 2, W, H, C.purple)
  s += starfield(13, W, H, 80)
  s += frame(0, 0, W, H, C.panel)

  s += pixelText("INVENTORY", 18, 18, 4, C.cyan)
  const cap = `${items.length} / ${items.length} SLOTS FILLED`
  s += pixelText(cap, W - 18 - textWidth(cap, 3), 22, 3, C.gray)
  s += `<rect x="18" y="48" width="${W - 36}" height="3" fill="${C.cyan}" opacity="0.6"/>`

  const positions = []
  items.forEach((item, i) => {
    const cx = padX + (i % cols) * (slot + gap)
    const cy = padTop + Math.floor(i / cols) * (slot + gap)
    positions.push([cx, cy])

    s += `<rect x="${cx}" y="${cy}" width="${slot}" height="${slot}" fill="${C.gray}"/>`
    s += `<rect x="${cx + 3}" y="${cy + 3}" width="${slot - 6}" height="${slot - 6}" fill="#1a1a3e"/>`
    s += `<rect x="${cx + 3}" y="${cy + 3}" width="${slot - 6}" height="3" fill="${C.void}" opacity="0.6"/>`
    // Reserve a label band at the bottom, then center 16x16 art in what's left.
    const labelBand = 24
    const artScale = 4
    const artPx = 16 * artScale
    const artOff = Math.round((slot - artPx) / 2)
    const artTop = cy + Math.round((slot - labelBand - artPx) / 2)
    s += `<g><g transform="translate(${cx + artOff},${artTop})">${grid(item.art, 0, 0, artScale, item.pal)}</g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="${(2.2 + (i % 4) * 0.4).toFixed(1)}s" repeatCount="indefinite"/></g>`
    // 8px of padding on each side so labels never touch the slot border
    s += centerText(item.name, cx + 8, slot - 16, cy + slot - labelBand + 4, 2, C.white)
  })

  // selection cursor cycling through slots
  const cursorVals = positions.map(([x, y]) => `${x - 3} ${y - 3}`).join(";")
  s += `<g><rect x="0" y="0" width="${slot + 6}" height="${slot + 6}" fill="none" stroke="${C.yellow}" stroke-width="3"/>
    <animateTransform attributeName="transform" type="translate" values="${cursorVals};${cursorVals.split(";")[0]}" calcMode="discrete" dur="${(items.length + 1) * 0.9}s" repeatCount="indefinite"/></g>`

  s += `<g>${pixelText("PRESS A TO EQUIP", 18, H - 30, 3, C.yellow)}<animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/></g>`
  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 6. GAME OVER / CONTACT FOOTER
 * ================================================================== */
function buildFooter() {
  const W = 640
  const H = 140
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(19, W, H, 70)
  s += nebula(53, 320, 80, 460, 110, C.magenta)

  const t1 = "THANKS FOR PLAYING"
  const t1s = Math.min(4, fitScale(t1, W - 60, 4))
  s += titleText(t1, Math.round((W - textWidth(t1, t1s)) / 2), 22, t1s, C.white, C.purple, null)

  const t2 = "CONTINUE?  10 . . . 9 . . . 8"
  s += `<g>${centerText(t2, 0, W, 66, 3, C.yellow)}<animate attributeName="opacity" values="1;1;0.2" dur="1.2s" repeatCount="indefinite"/></g>`
  s += centerText("LETS BUILD SOMETHING LEGENDARY", 0, W, 96, 3, C.cyan)

  // hearts, tucked into the bottom-left corner clear of the text
  const heart = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."]
  for (let i = 0; i < 3; i++) {
    s += `<g transform="translate(${18 + i * 24},${H - 26})">${grid(heart, 0, 0, 3, { X: C.red })}
      <animate attributeName="opacity" values="1;0.4;1" dur="${(1 + i * 0.3).toFixed(1)}s" repeatCount="indefinite"/></g>`
  }
  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 7. DIVIDER
 * ================================================================== */
function buildDivider() {
  const W = 640
  const H = 14
  let s = `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  for (let x = 0; x < W; x += 8) {
    s += `<rect x="${x}" y="6" width="4" height="2" fill="${C.cyan}" opacity="0.8"><animate attributeName="opacity" values="0.25;1;0.25" dur="2.4s" begin="${((x / 8) * 0.06).toFixed(2)}s" repeatCount="indefinite"/></rect>`
  }
  s += `<g><rect x="0" y="2" width="10" height="2" fill="${C.yellow}"/><rect x="0" y="8" width="10" height="2" fill="${C.magenta}"/>
    <animateTransform attributeName="transform" type="translate" values="-12 0;${W} 0" dur="5s" repeatCount="indefinite"/></g>`
  return svg(W, H, s)
}

/* shared sprites for the panels below */
const CHECK = ["......X", ".....XX", "....XX.", "X..XX..", "XX.XX..", ".XXX...", "..X...."]
const SHIP_SM = ["..C..", ".CWC.", "CCCCC", "O.O.O"]
const SHIP_PAL = { C: C.cyan, W: C.white, O: C.orange }

/* ================================================================== *
 * 8. BOSS BATTLE  (current work-in-progress)
 * ================================================================== */
function buildBoss() {
  const W = 640
  const H = 288
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += nebula(67, 320, 130, 520, 200, C.red)
  s += starfield(43, W, H, 60, [C.white, C.red, C.gray])
  s += frame(0, 0, W, H, C.deep, C.red, 3)

  // flashing warning header
  const hdr = "!! BOSS BATTLE !!"
  s += `<g>${centerText(hdr, 0, W, 16, 4, C.red)}<animate attributeName="opacity" values="1;0.25;1" dur="0.7s" repeatCount="indefinite"/></g>`

  // boss name + HP bar that drains, then resets on a loop
  s += pixelText(BOSS.name, 20, 52, 3, C.yellow)
  const bx = 20
  const bw = W - 40
  const by = 80
  const bh = 16
  s += `<rect x="${bx - 3}" y="${by - 3}" width="${bw + 6}" height="${bh + 6}" fill="${C.white}"/>`
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#2a0c14"/>`
  const lowW = Math.round(bw * BOSS.hp)
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${C.red}">
    <animate attributeName="width" values="${bw};${bw};${lowW};${lowW}" keyTimes="0;0.12;0.78;1" dur="9s" repeatCount="indefinite"/></rect>`
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="4" fill="${C.white}" opacity="0.45">
    <animate attributeName="width" values="${bw};${bw};${lowW};${lowW}" keyTimes="0;0.12;0.78;1" dur="9s" repeatCount="indefinite"/></rect>`
  for (let sx = bx + 12; sx < bx + bw; sx += 12) {
    s += `<rect x="${sx}" y="${by}" width="1" height="${bh}" fill="${C.void}" opacity="0.5"/>`
  }

  // boss sprite: a big pixel horror that lunges forward
  const boss = [
    "...M.......M...",
    "..MM.......MM..",
    ".MMMM.....MMMM.",
    ".MMMMMMMMMMMMM.",
    "MMEEMMMMMMMEEMM",
    "MMEEMMMMMMMEEMM",
    "MMMMMMMMMMMMMMM",
    "MMMWWMWMWMWWMMM",
    "MM.MMM.M.MMM.MM",
    "M...MM...MM...M",
    "....M.....M....",
  ]
  const bossScale = 8
  const bossX = Math.round((W - 15 * bossScale) / 2)
  s += `<g>
    <g>${grid(boss, 0, 0, bossScale, { M: C.purple, W: C.white, E: "#2a0c14" })}
      <g>
        <rect x="${2 * bossScale}" y="${4 * bossScale}" width="${2 * bossScale}" height="${2 * bossScale}" fill="${C.red}"/>
        <rect x="${11 * bossScale}" y="${4 * bossScale}" width="${2 * bossScale}" height="${2 * bossScale}" fill="${C.red}"/>
        <animate attributeName="opacity" values="1;0.3;1;1" dur="1.3s" repeatCount="indefinite"/>
      </g>
    </g>
    <animateTransform attributeName="transform" type="translate" values="${bossX} 106;${bossX} 98;${bossX} 112;${bossX} 106" dur="3.4s" repeatCount="indefinite"/>
  </g>`

  // Damage numbers float up the FLANKS of the boss, never across the sprite.
  const bossRight = bossX + 15 * bossScale + 14
  const flanks = [
    { d: "120", x: bossRight, c: C.yellow },
    { d: "85", x: 96, c: C.yellow },
    { d: "240", x: bossRight + 10, c: C.orange },
  ]
  flanks.forEach(({ d, x, c }, i) => {
    const begin = `${(i * 1.4).toFixed(1)}s;${(i * 1.4 + 4.8).toFixed(1)}s`
    s += `<g opacity="0">${pixelText(d, 0, 0, 3, c)}
      <animateTransform attributeName="transform" type="translate" values="${x} 196;${x} 132" dur="1.5s" begin="${begin}" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin="${begin}" repeatCount="indefinite"/></g>`
  })

  // CRITICAL HIT flash on the left flank
  s += `<g opacity="0">${pixelText("CRITICAL!", 76, 116, 3, C.red)}
    <animate attributeName="opacity" values="0;1;0;1;0" dur="1.1s" begin="2.6s;9.2s" repeatCount="indefinite"/></g>`

  // player ship strafing along the bottom, firing up at the boss
  s += `<g>
    <g>${grid(SHIP_SM, 0, 0, 4, SHIP_PAL)}
      <g><rect x="8" y="-16" width="4" height="12" fill="${C.cyan}"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -60" dur="0.55s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.55s" repeatCount="indefinite"/></g>
    </g>
    <animateTransform attributeName="transform" type="translate" values="120 218;480 218;120 218" dur="6s" repeatCount="indefinite"/>
  </g>`

  const foot = `USE: ${BOSS.weapon}`
  s += `<g>${pixelText(foot, 20, H - 34, 3, C.green)}<animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/></g>`
  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 9. QUEST LOG  (what I am working on / learning)
 * ================================================================== */
function buildQuests() {
  const W = 640
  const pitch = 36
  const top = 72
  const H = top + QUESTS.length * pitch + 46
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(59, W, H, 70)
  s += frame(0, 0, W, H, C.panel)

  s += pixelText("QUEST LOG", 18, 18, 4, C.yellow)
  const done = QUESTS.filter((q) => q.done).length
  const cnt = `${done} / ${QUESTS.length} COMPLETE`
  s += pixelText(cnt, W - 18 - textWidth(cnt, 3), 22, 3, C.gray)
  s += `<rect x="18" y="56" width="${W - 36}" height="3" fill="${C.yellow}" opacity="0.6"/>`

  const boxX = 20
  const boxSize = 24
  const labelX = 56
  const cycle = (QUESTS.length + 2) * 0.7

  QUESTS.forEach((q, i) => {
    const y = top + i * pitch
    // checkbox chassis
    s += `<rect x="${boxX}" y="${y}" width="${boxSize}" height="${boxSize}" fill="${C.white}"/>`
    s += `<rect x="${boxX + 3}" y="${y + 3}" width="${boxSize - 6}" height="${boxSize - 6}" fill="#1a1a3e"/>`

    if (q.done) {
      // checkmark pops in on a stagger, then holds for the rest of the loop
      const t0 = (i * 0.7) / cycle
      s += `<g opacity="0" transform="translate(${boxX + 2},${y + 3})">${grid(CHECK, 0, 0, 3, { X: C.green })}
        <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${t0.toFixed(4)};${Math.min(1, t0 + 0.06).toFixed(4)};1" dur="${cycle.toFixed(2)}s" repeatCount="indefinite"/></g>`
    } else {
      // in-progress: pulsing core
      s += `<rect x="${boxX + 8}" y="${y + 8}" width="8" height="8" fill="${C.cyan}">
        <animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></rect>`
    }

    const labelW = W - labelX - 130
    const sc = Math.min(3, fitScale(q.t, labelW, 3))
    s += pixelText(q.t, labelX, y + 4, sc, q.done ? C.gray : C.white)
    s += pixelText(q.xp, W - 20 - textWidth(q.xp, 2), y + 7, 2, q.done ? C.green : C.yellow)
  })

  const foot = "PRESS START TO ACCEPT QUEST"
  s += `<g>${pixelText(foot, 20, H - 32, 3, C.cyan)}<animate attributeName="opacity" values="1;0.25;1" dur="1.7s" repeatCount="indefinite"/></g>`
  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 10. WORLD MAP  (the journey / timeline)
 * ================================================================== */
function buildWorldMap() {
  const W = 640
  const H = 210
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += nebula(71, 320, 150, 560, 160, C.purple)
  s += starfield(83, W, H, 70)
  s += frame(0, 0, W, H, C.panel)

  s += pixelText("WORLD MAP", 18, 18, 4, C.green)
  s += pixelText("THE JOURNEY SO FAR", W - 18 - textWidth("THE JOURNEY SO FAR", 2), 26, 2, C.gray)

  const nodeY = 112
  const xs = WORLD.map((_, i) => Math.round(70 + i * ((W - 140) / (WORLD.length - 1))))

  // dotted travel path between the stops
  for (let i = 0; i < xs.length - 1; i++) {
    for (let x = xs[i] + 18; x < xs[i + 1] - 14; x += 10) {
      s += `<rect x="${x}" y="${nodeY - 1}" width="5" height="3" fill="${C.cyan}" opacity="0.4">
        <animate attributeName="opacity" values="0.15;0.95;0.15" dur="2.2s" begin="${((x / 10) * 0.05).toFixed(2)}s" repeatCount="indefinite"/></rect>`
    }
  }

  // stops
  WORLD.forEach((w, i) => {
    const x = xs[i]
    const col = w.done ? C.green : C.magenta
    s += planet(x, nodeY, 11, col, C.purple, null)
    if (w.done) {
      s += `<g transform="translate(${x - 3},${nodeY - 26})">${grid(CHECK, 0, 0, 2, { X: C.white })}</g>`
    } else {
      // current location marker bobbing above the planet
      s += `<g><rect x="0" y="0" width="4" height="10" fill="${C.white}"/><rect x="4" y="0" width="12" height="7" fill="${C.magenta}"/>
        <animateTransform attributeName="transform" type="translate" values="${x - 2} ${nodeY - 30};${x - 2} ${nodeY - 36};${x - 2} ${nodeY - 30}" dur="1.6s" repeatCount="indefinite"/></g>`
    }
    // 118px label slot keeps the longest name ("DEEP NETS", 108px) at scale 2
    s += centerText(w.name, x - 59, 118, nodeY + 22, 2, w.done ? C.white : C.magenta)
    s += centerText(w.year, x - 59, 118, nodeY + 40, 2, C.gray)
  })

  // Ship cruises above the flags/checkmarks so nothing collides.
  const stops = xs.map((x) => `${x - 7} ${nodeY - 54}`)
  const vals = []
  stops.forEach((p) => vals.push(p, p))
  s += `<g>${grid(SHIP_SM, 0, 0, 3, SHIP_PAL)}
    <animateTransform attributeName="transform" type="translate" values="${vals.join(";")};${stops[0]}" dur="12s" repeatCount="indefinite"/></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 11. HIGH SCORES  (top skills as an arcade leaderboard)
 * ================================================================== */
function buildHighScores() {
  const W = 640
  const pitch = 34
  const top = 76
  const H = top + SCORES.length * pitch + 54
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(97, W, H, 80)
  s += frame(0, 0, W, H, C.deep)

  const hdr = "HIGH SCORES"
  s += `<g>${centerText(hdr, 0, W, 18, 4, C.yellow)}<animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite"/></g>`
  s += `<rect x="18" y="62" width="${W - 36}" height="3" fill="${C.yellow}" opacity="0.6"/>`

  SCORES.forEach((row, i) => {
    const y = top + i * pitch
    const isTop = i === 0
    const col = isTop ? C.yellow : C.white
    const rank = pixelText(row.rank, 24, y, 3, isTop ? C.magenta : C.cyan)
    const name = pixelText(row.name, 96, y, 3, col)
    const score = pixelText(row.score, W - 24 - textWidth(row.score, 3), y, 3, col)
    if (isTop) {
      // champion row blinks like a fresh record
      s += `<g>${rank}${name}${score}<animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite"/></g>`
    } else {
      s += rank + name + score
    }
    // dotted leader line between name and score
    for (let x = 96 + textWidth(row.name, 3) + 8; x < W - 30 - textWidth(row.score, 3); x += 8) {
      s += `<rect x="${x}" y="${y + 16}" width="3" height="2" fill="${C.gray}" opacity="0.5"/>`
    }
  })

  // scrolling marquee along the bottom
  const marquee = "*** CONGRATULATIONS - YOU HAVE REACHED THE TOP OF THE STACK ***"
  const mw = textWidth(marquee, 2)
  s += `<clipPath id="mq"><rect x="18" y="${H - 34}" width="${W - 36}" height="18"/></clipPath>`
  s += `<g clip-path="url(#mq)"><g>${pixelText(marquee, 0, H - 30, 2, C.magenta)}
    <animateTransform attributeName="transform" type="translate" values="${W} 0;${-mw} 0" dur="12s" repeatCount="indefinite"/></g></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 12. ACHIEVEMENT TOAST
 * ================================================================== */
function buildAchievement() {
  const W = 640
  const H = 116
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += nebula(101, 320, 58, 520, 110, C.yellow)
  s += starfield(103, W, H, 50, [C.white, C.yellow])
  s += frame(0, 0, W, H, C.deep, C.yellow, 3)

  const trophy = [
    "GYYYYYYYYYG",
    "GYYYYYYYYYG",
    "GGYYYYYYYGG",
    ".GYYYYYYYG.",
    "..YYYYYYY..",
    "...YYYYY...",
    "....YYY....",
    "....YYY....",
    "...YYYYY...",
    "..GGGGGGG..",
    ".GGGGGGGGG.",
  ]

  // whole toast slides in from the left, then holds
  let inner = ""
  inner += `<g><g transform="translate(24,30)">${grid(trophy, 0, 0, 4, { Y: C.yellow, G: C.orange })}</g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.2s" repeatCount="indefinite"/></g>`
  inner += pixelText(ACHIEVEMENT.sub, 92, 32, 2, C.gray)
  inner += pixelText(ACHIEVEMENT.title, 92, 54, 4, C.yellow)

  // sparkles bursting around the trophy
  const spark = ["..X..", "..X..", "XXXXX", "..X..", "..X.."]
  const spots = [
    [70, 24],
    [58, 70],
    [150, 20],
    [W - 70, 34],
    [W - 110, 76],
  ]
  spots.forEach(([sx, sy], i) => {
    inner += `<g transform="translate(${sx},${sy})" opacity="0">${grid(spark, 0, 0, 3, { X: C.white })}
      <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="${(i * 0.45).toFixed(2)}s" repeatCount="indefinite"/></g>`
  })

  s += `<g>${inner}
    <animateTransform attributeName="transform" type="translate" values="${-W} 0;0 0;0 0" keyTimes="0;0.14;1" dur="7s" repeatCount="indefinite"/></g>`

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 13. NOW LOADING
 * ================================================================== */
function buildLoading() {
  const W = 640
  const H = 134
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += starfield(107, W, H, 60)
  s += frame(0, 0, W, H, C.panel)

  s += pixelText("NOW LOADING", 24, 20, 4, C.cyan)

  // 8-dot spinner in the top right
  const cxs = 8
  const spinCx = W - 52
  const spinCy = 32
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const px = Math.round(spinCx + Math.cos(a) * 16) - cxs / 2
    const py = Math.round(spinCy + Math.sin(a) * 16) - cxs / 2
    s += `<rect x="${px}" y="${py}" width="${cxs}" height="${cxs}" fill="${C.cyan}" opacity="0.2">
      <animate attributeName="opacity" values="1;0.2;0.2" dur="0.9s" begin="${((i / 8) * 0.9).toFixed(3)}s" repeatCount="indefinite"/></rect>`
  }

  // segmented progress bar that fills, holds, then restarts
  const bx = 24
  const bw = W - 48
  const by = 58
  const bh = 22
  s += `<rect x="${bx - 3}" y="${by - 3}" width="${bw + 6}" height="${bh + 6}" fill="${C.white}"/>`
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#1b1b40"/>`
  s += `<rect x="${bx}" y="${by}" width="0" height="${bh}" fill="${C.green}">
    <animate attributeName="width" values="0;${bw};${bw}" keyTimes="0;0.82;1" dur="6s" repeatCount="indefinite"/></rect>`
  s += `<rect x="${bx}" y="${by}" width="0" height="5" fill="${C.white}" opacity="0.45">
    <animate attributeName="width" values="0;${bw};${bw}" keyTimes="0;0.82;1" dur="6s" repeatCount="indefinite"/></rect>`
  for (let sx = bx + 14; sx < bx + bw; sx += 14) {
    s += `<rect x="${sx}" y="${by}" width="2" height="${bh}" fill="${C.void}" opacity="0.55"/>`
  }

  // rotating tips, cross-faded so only one is visible at a time
  const tipCycle = TIPS.length * 2.4
  TIPS.forEach((tip, i) => {
    const a = (i * 2.4) / tipCycle
    const b = (i * 2.4 + 0.25) / tipCycle
    const c = (i * 2.4 + 2.15) / tipCycle
    const d = (i * 2.4 + 2.4) / tipCycle
    s += `<g opacity="0">${centerText(tip, 0, W, 100, 3, C.yellow)}
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${a.toFixed(4)};${b.toFixed(4)};${c.toFixed(4)};${d.toFixed(4)};1" dur="${tipCycle.toFixed(2)}s" repeatCount="indefinite"/></g>`
  })

  s += scanlines(W, H)
  return svg(W, H, s)
}

/* ================================================================== *
 * 14. CRT TERMINAL  (contact / connect)
 * ================================================================== */
function buildTerminal() {
  const W = 640
  const H = 196
  let s = ""
  s += `<rect width="${W}" height="${H}" fill="${C.void}"/>`
  s += frame(0, 0, W, H, "#04160c", C.green, 3)

  // title bar
  s += `<rect x="6" y="6" width="${W - 12}" height="22" fill="${C.green}" opacity="0.85"/>`
  s += pixelText("TERMINAL - CONNECT.SH", 14, 12, 2, "#04160c")
  for (let i = 0; i < 3; i++) {
    s += `<rect x="${W - 28 - i * 14}" y="12" width="10" height="10" fill="#04160c" opacity="0.6"/>`
  }

  const lines = [
    { t: "> WHOAMI", c: C.gray },
    { t: "VAIBHAV WAGHELA / AI-ML ENGINEER", c: C.green },
    { t: "> CAT INTERESTS.TXT", c: C.gray },
    { t: "LLM AGENTS, EDGE AI, ROBOTICS", c: C.green },
    { t: "> ECHO $STATUS", c: C.gray },
    { t: "OPEN TO COLLABORATION", c: C.cyan },
  ]

  const tx = 18
  const pitch = 24
  const top = 40
  const typeDur = 0.7
  const step = 0.85
  const total = lines.length * step + 2.4

  lines.forEach((ln, i) => {
    const sc = Math.min(3, fitScale(ln.t, W - tx - 30, 3))
    const w = textWidth(ln.t, sc)
    const y = top + i * pitch
    const t0 = (i * step) / total
    const t1 = (i * step + typeDur) / total
    s += `<clipPath id="ct${i}"><rect x="${tx}" y="${y - 2}" width="0" height="22">
      <animate attributeName="width" values="0;0;${w};${w}" keyTimes="0;${t0.toFixed(4)};${t1.toFixed(4)};1" dur="${total.toFixed(2)}s" repeatCount="indefinite"/>
    </rect></clipPath>`
    s += `<g clip-path="url(#ct${i})">${pixelText(ln.t, tx, y, sc, ln.c)}</g>`
  })

  // blinking block cursor on the prompt line under the output
  const cy = top + lines.length * pitch
  s += pixelText(">", tx, cy, 3, C.gray)
  s += `<rect x="${tx + 24}" y="${cy}" width="14" height="20" fill="${C.green}">
    <animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/></rect>`

  // CRT flicker + scanlines for the tube feel
  s += scanlines(W, H, 3, 0.2)
  s += `<rect width="${W}" height="${H}" fill="${C.green}" opacity="0.03">
    <animate attributeName="opacity" values="0.02;0.07;0.02" dur="3.5s" repeatCount="indefinite"/></rect>`
  return svg(W, H, s)
}

/* ------------------------------------------------------------------ */
const OUT_DIRS = [
  resolve(process.cwd(), "github-profile/assets"),
  resolve(process.cwd(), "public/github-profile/assets"),
]

const files = {
  "title-screen.svg": buildTitle(),
  "dialogue-box.svg": buildDialogue(),
  "player-hud.svg": buildHud(),
  "sector-header.svg": buildSector(),
  "inventory.svg": buildInventory(),
  "footer.svg": buildFooter(),
  "divider.svg": buildDivider(),
  "boss-battle.svg": buildBoss(),
  "quest-log.svg": buildQuests(),
  "world-map.svg": buildWorldMap(),
  "high-scores.svg": buildHighScores(),
  "achievement.svg": buildAchievement(),
  "now-loading.svg": buildLoading(),
  "terminal.svg": buildTerminal(),
}

for (const dir of OUT_DIRS) {
  mkdirSync(dir, { recursive: true })
  for (const [name, content] of Object.entries(files)) {
    const p = resolve(dir, name)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, content)
    console.log("wrote", p, `(${(content.length / 1024).toFixed(1)} kb)`)
  }
}
