(() => {
"use strict";

/* ============================================================
   1 · KONSTANTEN & KALENDER
   ============================================================ */
const YEAR = 2027;
const MN = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const MS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const WD = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WS = ["Mo","Di","Mi","Do","Fr","Sa","So"];

const dim = m => new Date(YEAR, m + 1, 0).getDate();
const fwd = m => (new Date(YEAR, m, 1).getDay() + 6) % 7;          // Montag = 0
const key = (m, d) => `${YEAR}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const mkey = m => `${YEAR}-${String(m+1).padStart(2,"0")}`;
const wdOf = (m, d) => (new Date(YEAR, m, d).getDay() + 6) % 7;

/** Kalenderwochen eines Monats als Mo–So-Blöcke (auch angeschnittene). */
function weeksOf(m){
  const out = [], n = dim(m);
  let start = 1 - fwd(m);
  while (start <= n){
    out.push(Array.from({length:7}, (_, i) => {
      const d = start + i;
      return d >= 1 && d <= n ? d : null;
    }));
    start += 7;
  }
  return out;
}

/* ============================================================
   2 · MONATSWELTEN
   ============================================================ */
const MONTHS = [
  {n:"Januar",    ac:"#7C9BB5", motif:"snow",   art:"jan", motto:"Leise anfangen."},
  {n:"Februar",   ac:"#C4788B", motif:"heart",  art:"feb", motto:"Sei gut zu dir."},
  {n:"März",      ac:"#88A078", motif:"bud",    art:"mar", motto:"Es wird wieder hell."},
  {n:"April",     ac:"#6B9F9C", motif:"drop",   art:"apr", motto:"Regen gehört dazu."},
  {n:"Mai",       ac:"#AE6A92", motif:"bloom",  art:"may", motto:"Alles blüht auf."},
  {n:"Juni",      ac:"#CF9A3C", motif:"sun",    art:"jun", motto:"Lange, helle Abende."},
  {n:"Juli",      ac:"#3D9698", motif:"wave",   art:"jul", motto:"Barfuß und ohne Plan."},
  {n:"August",    ac:"#C06E3E", motif:"flower", art:"aug", motto:"Warm bis in die Nacht."},
  {n:"September", ac:"#8A8455", motif:"leaf",   art:"sep", motto:"Sammeln und ordnen."},
  {n:"Oktober",   ac:"#B25A2E", motif:"acorn",  art:"oct", motto:"Bunt und kühl."},
  {n:"November",  ac:"#7A5C52", motif:"tea",    art:"nov", motto:"Tee, Decke, Ruhe."},
  {n:"Dezember",  ac:"#4E6B55", motif:"star",   art:"dec", motto:"Lichter anzünden."}
];
const PALETTE = ["#7C9BB5","#C4788B","#88A078","#6B9F9C","#AE6A92","#CF9A3C","#3D9698","#C06E3E","#8A8455","#B25A2E","#7A5C52","#4E6B55"];

/* ============================================================
   3 · SPEICHER  (localStorage → später Google Sheets)
   ============================================================ */
const LS_KEY = "bujo2027.v1";

function seed(){
  return {
    meta:{ name:"[Name]", motto:"[Motto]", dedication:"[Persönliche Widmung]", title:"Mein Jahr" },
    moodLabels:[
      {t:"Wunderbar", c:"#7FA86A"},
      {t:"Gut",       c:"#9FC0D4"},
      {t:"Geht so",   c:"#E0C070"},
      {t:"Müde",      c:"#C79B84"},
      {t:"Schwer",    c:"#9B8195"}
    ],
    moods:{},                       // "2027-03-04" -> 0..4
    habits:[
      {id:"h1", type:"num",  name:"Schlaf",     unit:"h",   goal:8,   c:"#7C9BB5", ic:"🌙"},
      {id:"h2", type:"num",  name:"Trinken",    unit:"L",   goal:2,   c:"#6B9F9C", ic:"💧"},
      {id:"h3", type:"num",  name:"Handyzeit",  unit:"min", goal:120, c:"#AE6A92", ic:"📱", lower:true},
      {id:"h4", type:"bool", name:"Sport gemacht",        c:"#C06E3E", ic:"🤸"},
      {id:"h5", type:"bool", name:"Gesund gegessen",      c:"#88A078", ic:"🥗"},
      {id:"h6", type:"bool", name:"Journal benutzt",      c:"#CF9A3C", ic:"✏️"}
    ],
    habitLog:{},                    // "h1|2027-03-04" -> Zahl / true
    days:{},                        // "2027-03-04" -> {events,gratitude,todos,note,mood,energy,summary,photo,stickers}
    songs:{},                       // "2027-03" -> {count:5|10, list:[…]}
    monthNote:{}, monthMotto:{}, monthGoals:{},
    goals:[
      {id:"g1", t:"Endlich wieder regelmäßig tanzen", d:"Einmal die Woche Kurs, dazu zuhause üben.", p:35, s:"läuft",
       steps:[{t:"Kurs suchen",done:true},{t:"Probestunde",done:true},{t:"Anmelden",done:false}], habit:"h4"},
      {id:"g2", t:"3.000 € Notgroschen", d:"Jeden Monat automatisch etwas zur Seite legen.", p:60, s:"läuft",
       steps:[{t:"Dauerauftrag einrichten",done:true},{t:"Abos durchgehen",done:false}], habit:""},
      {id:"g3", t:"12 Bücher lesen", d:"Eins pro Monat – lieber kurz als gar nicht.", p:15, s:"neu",
       steps:[{t:"Stapel sortieren",done:true}], habit:"h6"}
    ],
    vision:[],                      // {i:index, img|emoji, cap}
    level10:[
      {t:"Familie",      now:7, goal:9,  why:"Sonntage sind mir heilig.",        act:"Einmal im Monat Besuch planen."},
      {t:"Freunde",      now:5, goal:8,  why:"Zu selten gemeldet.",              act:"Freitags fester Anruf."},
      {t:"Liebe",        now:8, goal:9,  why:"Läuft gut, will es halten.",       act:"Ein Date pro Monat."},
      {t:"Gesundheit",   now:4, goal:8,  why:"Rücken zwickt, zu wenig Bewegung.",act:"3× Woche 20 Min."},
      {t:"Fitness",      now:4, goal:7,  why:"Kondition ist weg.",               act:"Kurs am Dienstag."},
      {t:"Finanzen",     now:5, goal:8,  why:"Kein Überblick.",                  act:"Monatlicher Kassensturz."},
      {t:"Beruf",        now:6, goal:8,  why:"Solide, aber ohne Richtung.",      act:"Weiterbildung suchen."},
      {t:"Entwicklung",  now:6, goal:9,  why:"Lese wieder mehr.",                act:"Abends 20 Seiten."},
      {t:"Zuhause",      now:7, goal:9,  why:"Fast fertig eingerichtet.",        act:"Balkon im Frühjahr."},
      {t:"Freizeit",     now:5, goal:8,  why:"Zu viel Bildschirm.",              act:"Sonntags raus."}
    ],
    birthdays:[
      {m:0,  d:14, n:"Mama",     no:"ruft gern morgens an"},
      {m:1,  d:3,  n:"Lena",     no:""},
      {m:2,  d:22, n:"Opa",      no:"Kuchen mitbringen"},
      {m:4,  d:9,  n:"Jonas",    no:""},
      {m:5,  d:30, n:"Papa",     no:""},
      {m:7,  d:17, n:"Marie",    no:"mag Bücher"},
      {m:9,  d:5,  n:"Sofie",    no:""},
      {m:11, d:24, n:"Oma",      no:"Heiligabend!"}
    ],
    events:{}                       // "2027-03-04" -> [{t:"…"}]
  };
}

let S = seed();
let dirty = false;

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (raw) S = Object.assign(seed(), JSON.parse(raw));
  }catch(e){ /* privates Fenster o. Ä. – wir arbeiten einfach im Speicher weiter */ }
}
function save(){
  dirty = true; setSync("pending");
  clearTimeout(save._t);
  save._t = setTimeout(() => {
    try{
      localStorage.setItem(LS_KEY, JSON.stringify(S));
      dirty = false; setSync("ok");
    }catch(e){ setSync("local"); }
  }, 320);
}
function setSync(state){
  const el = document.getElementById("sync"), t = document.getElementById("syncTxt");
  if (!el) return;
  el.classList.toggle("pending", state !== "ok");
  t.textContent = state === "ok" ? "Alles gesichert"
                : state === "local" ? "Nur auf diesem Gerät"
                : "Wird gesichert …";
}

/* ============================================================
   4 · KLEINE HELFER
   ============================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Monatsfarbe fürs Nachtlicht aufhellen (--lift ist tagsüber 0 %). */
const lift = c => `color-mix(in oklab, ${c}, var(--lift-color) var(--lift))`;

function toast(msg){
  const t = $("#toast");
  t.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg><span>${esc(msg)}</span>`;
  t.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("on"), 1500);
}

/** Tagesobjekt holen/anlegen. */
function day(k){
  if (!S.days[k]) S.days[k] = {gratitude:["","",""], todos:[], note:"", mood:null, energy:null, summary:"", photo:"", stickers:[]};
  const d = S.days[k];
  if (!Array.isArray(d.gratitude)) d.gratitude = ["","",""];
  if (!Array.isArray(d.todos)) d.todos = [];
  if (!Array.isArray(d.stickers)) d.stickers = [];
  return d;
}
const evOf = k => (S.events[k] ||= []);
const bdOf = (m, d) => S.birthdays.filter(b => b.m === m && b.d === d);

/** Bild aus Datei → verkleinerter DataURL (spart Speicherplatz). */
function pickImage(cb){
  const inp = $("#filePick");
  inp.value = "";
  inp.onchange = () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 640, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL("image/jpeg", 0.82));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  };
  inp.click();
}

/* ============================================================
   5 · ILLUSTRATIONEN
   Alles handgezeichnet: jede Form läuft durch den Wackel-Filter,
   damit keine Linie mathematisch glatt bleibt.
   ============================================================ */

/** Motive für die Moodtracker – ein Pfad zum Füllen, einer als Kontur. */
const MOTIF = {
  snow:  `<path d="M20 4v32M6.2 11.5 33.8 28.5M33.8 11.5 6.2 28.5M20 11l-4.6-4M20 11l4.6-4M20 29l-4.6 4M20 29l4.6-4M12 15l-6-.6M12 25l-6 .6M28 15l6-.6M28 25l6 .6"/>`,
  heart: `<path d="M20 34C9 26.5 5 21 5 15.6 5 11 8.4 7.7 12.6 7.7c2.9 0 5.6 1.6 7.4 4.4 1.8-2.8 4.5-4.4 7.4-4.4C31.6 7.7 35 11 35 15.6 35 21 31 26.5 20 34Z"/>`,
  bud:   `<path d="M20 36V17M20 17c-5.6 0-9-3.4-9-8 0-3.4 2-6 4.4-6 3 0 4.6 3 4.6 6.4 0-3.4 1.6-6.4 4.6-6.4 2.4 0 4.4 2.6 4.4 6 0 4.6-3.4 8-9 8ZM20 27c-3.4-1-5-3-5.4-6"/>`,
  drop:  `<path d="M20 4c6.4 8 10.5 13.6 10.5 18.6A10.5 10.5 0 0 1 20 33 10.5 10.5 0 0 1 9.5 22.6C9.5 17.6 13.6 12 20 4Z"/>`,
  bloom: `<path d="M20 20c0-5 2.4-8 5.4-8s4.6 2.4 4.6 5c0 3-2.6 5-6 5M20 20c5 0 8 2.4 8 5.4s-2.4 4.6-5 4.6c-3 0-5-2.6-5-6M20 20c0 5-2.4 8-5.4 8S10 25.6 10 23c0-3 2.6-5 6-5M20 20c-5 0-8-2.4-8-5.4S14.4 10 17 10c3 0 5 2.6 5 6"/><circle cx="20" cy="20" r="3.4"/>`,
  sun:   `<circle cx="20" cy="20" r="8.6"/><path d="M20 3.5v5M20 31.5v5M3.5 20h5M31.5 20h5M8.3 8.3l3.6 3.6M28.1 28.1l3.6 3.6M31.7 8.3l-3.6 3.6M11.9 28.1l-3.6 3.6"/>`,
  wave:  `<path d="M4 24c4-5 8-5 12 0s8 5 12 0 6-3.6 8-1.6M4 31c4-5 8-5 12 0s8 5 12 0 6-3.6 8-1.6M11 15c0-4 3.6-7.6 9-7.6s9 3.6 9 7.6"/>`,
  flower:`<path d="M20 22.5V36M20 22.5c-4.6 0-7.6-2.6-7.6-6s3-6 7.6-6 7.6 2.6 7.6 6-3 6-7.6 6Z"/><path d="M20 10.5c0-3.6 1.6-6 4-6M20 10.5c0-3.6-1.6-6-4-6M12.4 16.5c-3.4-1-5.6-3-5-5.4M27.6 16.5c3.4-1 5.6-3 5-5.4M16 30c-3.6-.6-5.6-2.6-6-5"/>`,
  leaf:  `<path d="M9 32C6 22 11 9.5 31.5 6.5 33 22 24 32.5 12 32M12 32C15 24 20 17 29 10"/>`,
  acorn: `<path d="M12 17.5c0 8 3.4 15.5 8 15.5s8-7.5 8-15.5ZM10 17.5c0-4.4 4.4-8 10-8s10 3.6 10 8ZM20 9.5V4.5"/>`,
  tea:   `<path d="M13 15h14l-2 17.5H15Z"/><path d="M20 15V8.5c0-2 1.4-3 3.4-3H27"/><path d="M15.5 22.5h9M16 27h8"/>`,
  star:  `<path d="M20 4.5 24.4 15l11.1.9-8.4 7.3 2.6 10.8L20 28.3l-9.7 5.7 2.6-10.8-8.4-7.3 11.1-.9Z"/>`
};

const MOTIF_SOLID = {heart:1, drop:1, star:1, leaf:1, acorn:1, tea:1, snow:0, bud:0, bloom:0, sun:0, wave:0, flower:0};

/** Ein Moodtracker-Element. `fill` = Farbe der gewählten Stimmung (oder null). */
function motifSVG(name, fill, stroke){
  const solid = MOTIF_SOLID[name];
  const f = fill || "none";
  return `<svg viewBox="0 0 40 40" fill="none" stroke="${stroke}" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" filter="url(#rough2)">
    ${solid
      ? `<g class="fillp-g" fill="${f}" fill-opacity="${fill?1:0}">${MOTIF[name]}</g>`
      : `<g fill="none">${MOTIF[name]}</g>
         ${fill ? `<circle class="fillp" cx="20" cy="20" r="7.2" fill="${f}" fill-opacity=".62" stroke="none"/>` : ""}`}
  </svg>`;
}

/* --- Bausteine für die Monatsdeckblätter --------------------- */
const PART = {
  sprig:  `<path d="M0 0C2 -14 6 -26 12 -36" /><path d="M2.4 -8c-6 -1.4-8.6-5-8-9.4 4.6-.4 8 2 9 6.6M4.4 -16c-5.6-2.4-7.4-6.4-6-10.6 4.4.6 7.2 3.6 7.4 8M7 -24c-4.6-3-5.6-7-3.6-10.6 3.8 1.4 5.6 4.8 5 9M3.6 -11c5.4-3 9-2.4 11.4 1.2-3 3.4-7 3.8-10.8 1.4M6 -19.6c5-3.6 8.6-3.4 11.4 0-2.6 3.6-6.4 4.4-10.4 2.4"/>`,
  branch: `<path d="M0 0C10 -3 22 -6 34 -6"/><path d="M8 -1.6c-1-4 .4-7 3.6-8.6 1.8 3.6 1.2 6.8-1.6 9M16 -3.4c-1.2-4 0-7.2 3.2-9 2 3.4 1.6 6.8-1 9.2M24 -4.8c-1.2-4 .2-7.2 3.4-8.8 1.8 3.4 1.2 6.8-1.4 9M12 -2.6c-.6 4-3 6.4-6.6 6.6-.2-3.8 1.8-6.4 5.4-7.4M20 -4c-.6 4-3 6.4-6.6 6.6-.2-3.8 1.8-6.4 5.4-7.4"/>`,
  flowerB:`<circle cx="0" cy="0" r="3.4"/><path d="M0-3.4c-1.8-4.4-.8-7.6 2.4-8.8 2.4 3 2.2 6.2-.4 8.8M3.4 0c4.4-1.8 7.6-.8 8.8 2.4-3 2.4-6.2 2.2-8.8-.4M0 3.4c1.8 4.4.8 7.6-2.4 8.8-2.4-3-2.2-6.2.4-8.8M-3.4 0c-4.4 1.8-7.6.8-8.8-2.4 3-2.4 6.2-2.2 8.8.4"/>`,
  leafB:  `<path d="M0 0C-2 -8 2 -15 10 -18 11 -10 7 -3 0 0Z"/><path d="M0 0C2.6-5 5.6-9 9.4-12"/>`,
  cup:    `<path d="M-9 -8h18l-2 15H-7Z"/><path d="M9 -5c3.4 0 5 1.6 5 4s-1.6 4-5 4"/><path d="M-11 7h22"/><path d="M-3 -13c0-2.4 2-3 2-5M3 -13c0-2.4 2-3 2-5"/>`,
  candle: `<path d="M-5 -2h10v16h-10Z"/><path d="M0 -2c-3.4-4 0-7.4 0-10 0 2.6 3.4 6 0 10Z"/><path d="M0 -12v-3"/>`,
  moonS:  `<path d="M6 -12A11 11 0 1 0 6 10 13.5 13.5 0 0 1 6 -12Z"/>`,
  pumpkin:`<path d="M0 -8c-7 0-12 4-12 9.5S-7 12 0 12s12-5 12-10.5S7 -8 0 -8Z"/><path d="M-5 -7c-3 3.6-3 12 0 17M5 -7c3 3.6 3 12 0 17"/><path d="M0 -8v-5c0-2.4 2.6-3.6 5-3"/>`,
  tree:   `<path d="M0 -20 -9 -6h5l-7 10h7l-6 9h20l-6-9h7l-7-10h5Z"/><path d="M0 -7v20"/>`,
  shell:  `<path d="M0 10C-9 10-14 3-14-4c0-6 6-11 14-11S14-10 14-4c0 7-5 14-14 14Z"/><path d="M0 10V-15M-6.5 8.6C-8-1-6.6-9-3.6-14M6.5 8.6C8-1 6.6-9 3.6-14"/>`,
  seed:   `<path d="M0 12V-2"/><path d="M0 -2c-4.4 0-7-3-7-6.6 0-2.6 1.6-4.6 3.6-4.6 2.4 0 3.4 2.4 3.4 5 0-2.6 1-5 3.4-5 2 0 3.6 2 3.6 4.6C7 -5 4.4-2 0-2Z"/><path d="M0 6c-3-.8-4.4-2.4-4.8-5.2"/>`,
  rain:   `<path d="M-14 0c-3.4 0-6-2.6-6-6s2.6-6 6-6c.4-4.4 4-7.6 8.4-7.6 3.6 0 6.8 2.2 8 5.4 1-.6 2.2-1 3.6-1 4 0 7.2 3.2 7.2 7.2S9-.4 5-.4Z"/><path d="M-9 6l-2.6 6M-1 6l-2.6 6M7 6l-2.6 6"/>`,
  wreath: `<circle cx="0" cy="0" r="30" stroke-dasharray="0.1 7.6" stroke-linecap="round"/>`
};

/** Monatsdeckblatt-Szenen: Position/Rotation/Größe je Baustein. */
const SCENE = {
  jan:[["moonS",78,20,1.5,10],["snowflake",22,26,1,0],["sprig",24,86,1.15,-8],["sprig",76,84,1.05,12]],
  feb:[["flowerB",20,24,1.5,0],["flowerB",82,30,1.2,20],["branch",14,80,1.1,-6],["flowerB",78,80,1.35,-14]],
  mar:[["seed",22,74,1.5,-6],["seed",34,80,1.15,8],["sprig",78,80,1.25,10],["branch",70,22,.95,4]],
  apr:[["rain",26,22,1.25,0],["flowerB",76,78,1.3,12],["seed",18,80,1.2,-8],["rain",78,28,.85,6]],
  may:[["flowerB",18,28,1.6,-10],["flowerB",30,20,1.1,18],["flowerB",80,74,1.5,8],["branch",72,26,1,-4]],
  jun:[["sunB",76,22,1,0],["flowerB",20,78,1.45,-8],["leafB",30,84,1.3,14],["flowerB",84,80,1.05,10]],
  jul:[["shell",78,78,1.15,-8],["waveB",20,80,1,0],["sunB",24,22,.85,0],["shell",16,72,.8,14]],
  aug:[["flowerB",22,26,1.5,6],["leafB",80,26,1.3,-12],["shell",80,80,1,10],["sprig",20,84,1.1,-6]],
  sep:[["leafB",22,24,1.5,-14],["seed",78,78,1.3,8],["branch",16,80,1.05,2],["leafB",82,30,1.15,22]],
  oct:[["pumpkin",78,76,1.15,-6],["leafB",20,26,1.5,10],["leafB",26,80,1.2,-24],["branch",76,24,1,-8]],
  nov:[["cup",76,78,1.3,-4],["rain",24,24,1.1,0],["leafB",18,80,1.15,16],["candle",84,26,1,0]],
  dec:[["tree",78,76,1.1,0],["star",22,24,1,0],["candle",20,80,1.2,0],["sprig",80,26,1.05,-14]]
};

/** Nicht jeder Baustein ist um den Nullpunkt gezeichnet – hier gerade rücken. */
const OFF = {sprig:"-4,17", branch:"-17,2", leafB:"-5,8", seed:"0,-4",
             candle:"0,-5", tree:"0,4", rain:"0,-3", moonS:"-3,1"};

/** Zusatzformen, die als Szenenteil per Name auflösen. */
function partPath(name){
  const wrap = p => OFF[name] ? `<g transform="translate(${OFF[name]})">${p}</g>` : p;
  if (PART[name]) return wrap(PART[name]);
  if (name === "snowflake") return MOTIF.snow.replace(/^<path d="/, '<path transform="translate(-20,-20)" d="');
  if (name === "star")      return MOTIF.star.replace(/^<path d="/, '<path transform="translate(-20,-20)" d="');
  if (name === "sunB")      return `<circle cx="0" cy="0" r="9"/><path d="M0-16v5M0 11v5M-16 0h5M11 0h5M-11.3-11.3l3.5 3.5M7.8 7.8l3.5 3.5M11.3-11.3l-3.5 3.5M-7.8 7.8l-3.5 3.5"/>`;
  if (name === "waveB")     return `<path d="M-16 0c4-5 8-5 12 0s8 5 12 0M-16 8c4-5 8-5 12 0s8 5 12 0"/>`;
  return "";
}

/** Deckblatt-Illustration: jedes Element ein eigenes, unverzerrtes SVG. */
function monthScene(m, opt = {}){
  const s = SCENE[MONTHS[m].art] || [];
  const base = opt.size ?? 82;
  const parts = s.map(([n, x, y, sc, rot]) =>
    `<svg viewBox="-40 -40 80 80" fill="none" stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"
      style="left:${x}%;top:${y}%;width:${Math.round(base * sc)}px;height:${Math.round(base * sc)}px;
             transform:translate(-50%,-50%) rotate(${rot}deg)">${partPath(n)}</svg>`).join("");
  return `<div class="scene" aria-hidden="true" style="opacity:${opt.op ?? .5}">${parts}</div>`;
}

/* --- Zierstriche & Rahmen ------------------------------------ */
const STROKE_SVG = `<svg class="stroke" viewBox="0 0 300 9" fill="none" stroke="currentColor"
  stroke-width="2.2" stroke-linecap="round" preserveAspectRatio="none" filter="url(#rough2)">
  <path d="M2 5.5c46-3.4 92-4 138-2.4 44 1.6 88 2 158-.6"/></svg>`;

const FRAME_SVG = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor"
  stroke-width=".4" filter="url(#rough)" style="position:absolute;inset:0;width:100%;height:100%"
  vector-effect="non-scaling-stroke">
  <path d="M2.4 2.6h95.2v94.8H2.4Z"/><path d="M4 4.2h92v91.6H4Z" stroke-width=".22"/></svg>`;

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
  stroke-linecap="round" stroke-linejoin="round" filter="url(#rough2)"><path d="m4 12.5 5.2 5.4L20 6.2"/></svg>`;

const HEART_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21C5.4 16.5 3 13.2 3 9.9 3 7.2 5 5.2 7.5 5.2c1.7 0 3.3 1 4.5 2.6 1.2-1.6 2.8-2.6 4.5-2.6C19 5.2 21 7.2 21 9.9c0 3.3-2.4 6.6-9 11.1Z"/></svg>`;

const PLUS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" filter="url(#rough2)"><path d="M12 5.5v13M5.5 12h13"/></svg>`;

const X_SVG = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
  stroke-width="2.4" stroke-linecap="round" filter="url(#rough2)"><path d="M6 6l12 12M18 6 6 18"/></svg>`;

const PEN_SVG = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
  stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.6 2.6 0 0 0-3.7-3.7L4 16.3Z"/></svg>`;

const CAM_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough2)">
  <path d="M3 8.5h4l1.6-2.4h6.8L17 8.5h4v11H3Z"/><circle cx="12" cy="13.6" r="3.7"/></svg>`;

const NOTE_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough2)">
  <path d="M9 18V5.5l10-2V16"/><ellipse cx="6.6" cy="18.4" rx="3" ry="2.4"/><ellipse cx="16.6" cy="16.4" rx="3" ry="2.4"/></svg>`;

/** Deko-Sticker fürs Journal (Emoji – bewusst klein gehalten). */
const STICKERS = ["✿","❀","☘","✧","★","☾","☕","✈","♡","☂","❄","☀","🍂","🎂","🎧","📖","🕯","🌿"];

/* ============================================================
   6 · SEITEN — JAHRESTEIL
   Jede Seite gibt HTML zurück. Alle Eingabefelder tragen
   data-f="<pfad>" und werden zentral verdrahtet (§9).
   ============================================================ */

const head = (title, sub) => `
  <div class="title-row">
    <h2 class="page-title">${esc(title)}</h2>
  </div>
  ${STROKE_SVG}
  ${sub ? `<p class="page-sub">${esc(sub)}</p>` : ""}`;

/* --- Deckblatt ---------------------------------------------- */
function pgCover(){
  return `<div class="cover" style="--accent:#8A8455">
    ${FRAME_SVG}
    <div class="scene" style="opacity:.3">
      ${[["sprig",9,80,1.1,-14],["sprig",91,82,1,16],["leafB",13,17,.85,-30],
         ["leafB",88,15,.8,34],["flowerB",6,50,.7,0],["flowerB",94,48,.65,0]]
        .map(([n,x,y,sc,r]) => `<svg viewBox="-40 -40 80 80" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"
          style="left:${x}%;top:${y}%;width:${Math.round(76*sc)}px;height:${Math.round(76*sc)}px;
                 transform:translate(-50%,-50%) rotate(${r}deg)">${partPath(n)}</svg>`).join("")}
    </div>
    <div class="cover-art" style="top:9%;left:50%;transform:translateX(-50%);width:min(58%,300px)">
      <svg viewBox="-40 -40 80 80" fill="none" stroke="currentColor" stroke-width="1" filter="url(#rough)">
        ${PART.wreath}
        <g transform="translate(-30 6) rotate(-30) scale(.9)">${PART.leafB}</g>
        <g transform="translate(30 6) rotate(30) scale(-.9 .9)">${PART.leafB}</g>
        <g transform="translate(0 -30) scale(.8)">${PART.flowerB}</g>
      </svg>
    </div>
    <p class="kicker">Ein Buch für dich</p>
    <div class="yr">2027</div>
    <p class="for">Für</p>
    <div class="who"><input class="w plain" data-f="meta.name" value="${esc(S.meta.name)}" aria-label="Name"></div>
    <div class="motto"><input class="w" data-f="meta.motto" value="${esc(S.meta.motto)}" aria-label="Motto des Jahres" style="text-align:center"></div>
    <div class="ded"><textarea class="w" data-f="meta.dedication" rows="3" aria-label="Widmung"
      style="text-align:center">${esc(S.meta.dedication)}</textarea></div>
    <div class="open"><button class="btn" id="openBook">Buch aufschlagen</button></div>
  </div>`;
}

/* --- Inhaltsverzeichnis ------------------------------------- */
function pgToc(){
  const row = (t, sw, go, p) =>
    `<button class="toc-row" data-go="${go}">
       <span class="sw" style="background:${sw}"></span>
       <span class="t">${esc(t)}</span><span class="dots"></span><span class="p num">${p}</span>
     </button>`;
  const year = [
    ["Jahresübersicht 2027", "#8A8455", "s:1", "3"],
    ["Vorsätze &amp; Ziele",  "#AE6A92", "s:3", "6"],
    ["Level 10 Life",         "#6B9F9C", "s:4", "8"],
    ["Geburtstage",           "#C4788B", "s:5", "10"]
  ].map(a => row(...a)).join("");
  const months = MONTHS.map((m, i) =>
    row(m.n, m.ac, `m:${i}:0`, String(12 + i * 12))).join("");
  return `${head("Inhalt", "Wo alles zu finden ist")}
    <div class="toc-group"><p class="label">Das Jahr</p><div class="toc-list">${year}</div></div>
    <div class="toc-group"><p class="label">Die Monate</p><div class="toc-list">${months}</div></div>`;
}

/* --- Jahresübersicht ---------------------------------------- */
function miniCal(m){
  const n = dim(m), f = fwd(m);
  let cells = "";
  for (let i = 0; i < f; i++) cells += "<td></td>";
  for (let d = 1; d <= n; d++){
    const k = key(m, d), we = wdOf(m, d) >= 5;
    const has = (S.events[k] && S.events[k].length) || bdOf(m, d).length;
    if ((f + d - 1) % 7 === 0 && d > 1) cells += "</tr><tr>";
    cells += `<td class="${we ? "we" : ""}${has ? " has" : ""}">${d}</td>`;
  }
  return `<button class="mini" data-go="m:${m}:1" style="--mc:${lift(MONTHS[m].ac)}">
    <h4>${MONTHS[m].n}</h4>
    <table><thead><tr>${WS.map(w => `<th>${w}</th>`).join("")}</tr></thead>
    <tbody><tr>${cells}</tr></tbody></table></button>`;
}
function pgYearL(){
  return `${head("2027", "Das ganze Jahr auf einen Blick")}
    <div class="year-grid">${[0,1,2,3,4,5].map(miniCal).join("")}</div>`;
}
function pgYearR(){
  const bd = S.birthdays.slice().sort((a,b) => a.m - b.m || a.d - b.d).slice(0, 6)
    .map(b => `<div class="bd-row"><span class="dt num">${b.d}.${b.m+1}.</span><span class="nm">${esc(b.n)}</span></div>`).join("");
  const gl = S.goals.slice(0, 3)
    .map(g => `<div class="step"><span style="color:var(--accent)">✦</span><span>${esc(g.t)}</span></div>`).join("");
  return `<div class="year-grid" style="margin-top:0">${[6,7,8,9,10,11].map(miniCal).join("")}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
      <div class="box soft" style="--mc:#C4788B">
        <p class="label" style="margin-bottom:4px">Bald Geburtstag</p>${bd}
      </div>
      <div class="box soft" style="--accent:#AE6A92">
        <p class="label" style="margin-bottom:4px">Worauf es dieses Jahr ankommt</p>${gl}
      </div>
    </div>
    <p class="micro" style="margin-top:12px">Punkt unter einem Tag = Termin oder Geburtstag eingetragen.</p>`;
}

/* --- Vorsätze & Vision Board -------------------------------- */
function pgVision(){
  const slots = Array.from({length: 6}, (_, i) => {
    const v = S.vision.find(x => String(x.i) === String(i));
    if (!v) return `<button class="vslot${i === 0 ? " tall" : ""}" data-vis="${i}">
        ${CAM_SVG}<span class="cap">Bild oder Sticker</span></button>`;
    return `<div class="vslot filled${i === 0 ? " tall" : ""}">
        ${v.img ? `<img src="${v.img}" alt="${esc(v.cap || "Erinnerung")}">`
                : `<span class="stk">${esc(v.emoji)}</span>`}
        ${v.cap ? `<span class="cap">${esc(v.cap)}</span>` : ""}
        <button class="rm" data-visrm="${i}" aria-label="Entfernen">${X_SVG}</button></div>`;
  }).join("");
  return `${head("Mein 2027", "Wovon ich mehr will")}
    <div class="vision">${slots}</div>
    <div class="box tint" style="--accent:#AE6A92;margin-top:14px;position:relative">
      <span class="tape tl"></span>
      <p class="label" style="margin-bottom:3px">Jahresmotto</p>
      <input class="w plain" data-f="meta.motto" value="${esc(S.meta.motto)}"
        style="font-size:24px;font-family:'Kaushan Script',cursive;color:#AE6A92">
    </div>`;
}
function pgGoals(){
  const items = S.goals.map(g => {
    const hb = S.habits.find(h => h.id === g.habit);
    return `<div class="goal" data-goal="${g.id}">
      <div class="gt">
        <input class="w plain" data-f="goal.${g.id}.t" value="${esc(g.t)}">
        <button class="icon-btn" data-goaledit="${g.id}" aria-label="Ziel bearbeiten">${PEN_SVG}</button>
      </div>
      <div class="gd">${esc(g.d)}</div>
      <div class="prog-row">
        <div class="prog"><i style="--p:${g.p}%"></i></div>
        <span class="pct num">${g.p}%</span>
      </div>
      <div class="steps">${g.steps.map((s, i) => `
        <div class="step${s.done ? " done" : ""}">
          <button class="tick" data-step="${g.id}:${i}" aria-pressed="${s.done}"
            aria-label="Schritt erledigt">${CHECK_SVG}</button>
          <span>${esc(s.t)}</span>
        </div>`).join("")}</div>
      ${hb ? `<span class="linkchip" style="margin-top:6px">↳ ${esc(hb.ic)} ${esc(hb.name)}</span>` : ""}
    </div>`;
  }).join("");
  return `${head("Ziele", "Klein anfangen, dranbleiben")}
    ${items}
    <button class="btn ghost sm" id="addGoal" style="margin-top:11px">+ Ziel hinzufügen</button>`;
}

/* --- Level 10 Life ------------------------------------------ */
let l10sel = 0;
function wheelSVG(){
  const N = S.level10.length, R = 128, cx = 0, cy = 0, step = 360 / N;
  const pol = (r, a) => [r * Math.cos((a - 90) * Math.PI / 180), r * Math.sin((a - 90) * Math.PI / 180)];
  let segs = "", grid = "", labels = "";

  for (let i = 0; i < N; i++){
    const a0 = i * step, a1 = a0 + step, c = PALETTE[i % PALETTE.length];
    for (let lv = 1; lv <= 10; lv++){
      const r0 = R * (lv - 1) / 10, r1 = R * lv / 10;
      const [x0,y0] = pol(r0,a0), [x1,y1] = pol(r1,a0), [x2,y2] = pol(r1,a1), [x3,y3] = pol(r0,a1);
      const on = S.level10[i].now >= lv;
      const goalRing = S.level10[i].goal === lv;
      segs += `<path class="seg" data-l10="${i}:${lv}" d="M${x0} ${y0}L${x1} ${y1}A${r1} ${r1} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r0} ${r0} 0 0 0 ${x0} ${y0}Z"
        fill="${on ? c : "transparent"}" fill-opacity="${on ? (0.32 + lv * 0.055) : 0}"
        stroke="${goalRing ? c : "currentColor"}" stroke-width="${goalRing ? 1.5 : .5}"
        stroke-opacity="${goalRing ? .95 : .3}"
        stroke-dasharray="${goalRing && !on ? "3 2.4" : "none"}"><title>${esc(S.level10[i].t)} – Stufe ${lv}</title></path>`;
    }
    const [lx,ly] = pol(R + 20, a0 + step / 2);
    labels += `<text class="lbl" x="${lx}" y="${ly}" text-anchor="${Math.abs(lx) < 12 ? "middle" : (lx > 0 ? "start" : "end")}"
      dominant-baseline="middle">${esc(S.level10[i].t)}</text>`;
    const [gx,gy] = pol(R + 4, a0);
    grid += `<line x1="0" y1="0" x2="${gx}" y2="${gy}" stroke="currentColor" stroke-opacity=".28" stroke-width=".7"/>`;
  }
  const avg = (S.level10.reduce((a,b) => a + b.now, 0) / N).toFixed(1);
  return `<svg class="wheel" viewBox="-176 -170 352 340" filter="url(#rough2)" role="img"
    aria-label="Level 10 Life Rad, Durchschnitt ${avg} von 10">
    <g color="var(--ink-soft)">${segs}${grid}${labels}</g>
    <circle r="16" fill="var(--paper)" stroke="currentColor" stroke-opacity=".3" stroke-width=".8"/>
    <text class="val" y="1" text-anchor="middle" dominant-baseline="middle"
      style="font-size:17px;fill:var(--ink)">${avg}</text>
  </svg>`;
}
function pgL10wheel(){
  return `${head("Level 10 Life", "Zehn Bereiche, ehrlich bewertet")}
    <div class="wheel-wrap">${wheelSVG()}</div>
    <p class="micro" style="text-align:center;margin-top:4px">
      Auf einen Ring tippen, um den Wert zu setzen · gestrichelt = dein Ziel</p>`;
}
function pgL10list(){
  const rows = S.level10.map((l, i) => `
    <div class="l10-row${i === l10sel ? " sel" : ""}" data-l10row="${i}" style="--lc:${lift(PALETTE[i % PALETTE.length])}">
      <span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="nm"><input class="w plain" data-f="l10.${i}.t" value="${esc(l.t)}"></span>
      <span class="l10-score"><b>${l.now}</b>/10 <span style="opacity:.6">→ ${l.goal}</span></span>
    </div>`).join("");
  const l = S.level10[l10sel], c = PALETTE[l10sel % PALETTE.length];
  const link = S.goals.filter(g => g.t.length).slice(0, 3);
  return `<div class="l10-list">${rows}</div>
    <div class="box l10-detail" style="--accent:${c};position:relative">
      <span class="tape tr"></span>
      <p class="label" style="color:${c}">${esc(l.t)}</p>
      <div style="display:flex;gap:14px;align-items:center;margin:7px 0 9px;flex-wrap:wrap">
        <span class="label" style="letter-spacing:.1em">Jetzt</span>
        <span class="stepper"><button data-l10step="now:-1">−</button>
          <span class="v num">${l.now}</span><button data-l10step="now:1">+</button></span>
        <span class="label" style="letter-spacing:.1em">Ziel</span>
        <span class="stepper"><button data-l10step="goal:-1">−</button>
          <span class="v num">${l.goal}</span><button data-l10step="goal:1">+</button></span>
      </div>
      <p class="label" style="margin-bottom:2px">Warum diese Zahl?</p>
      <textarea class="w" data-f="l10.${l10sel}.why" rows="2">${esc(l.why)}</textarea>
      <p class="label" style="margin:7px 0 2px">Was ich konkret tue</p>
      <textarea class="w" data-f="l10.${l10sel}.act" rows="2">${esc(l.act)}</textarea>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:9px">
        ${link.map(g => `<button class="linkchip" data-go="s:2">↳ ${esc(g.t)}</button>`).join("")}
      </div>
    </div>`;
}

/* --- Geburtstage -------------------------------------------- */
function bdBlock(m){
  const list = S.birthdays.filter(b => b.m === m).sort((a,b) => a.d - b.d);
  return `<div class="bd-month" style="--mc:${lift(MONTHS[m].ac)}">
    <h4>${MONTHS[m].n}</h4>
    ${list.map(b => `<div class="bd-row">
      <span class="dt num">${b.d}.</span>
      <span class="nm"><input class="w plain" data-f="bd.${S.birthdays.indexOf(b)}.n" value="${esc(b.n)}"></span>
      <span class="no"><input class="w plain" data-f="bd.${S.birthdays.indexOf(b)}.no"
        value="${esc(b.no)}" placeholder="Notiz"></span>
      <button class="icon-btn rm" data-bdrm="${S.birthdays.indexOf(b)}" aria-label="Löschen">${X_SVG}</button>
    </div>`).join("") || `<p class="micro" style="padding-left:6px">—</p>`}
  </div>`;
}
function pgBdL(){
  return `${head("Geburtstage", "Damit ich es nie vergesse")}
    <div style="position:absolute;right:5%;top:4%;width:74px;color:#C4788B;opacity:.5;pointer-events:none">
      <svg viewBox="-30 -30 60 60" fill="none" stroke="currentColor" stroke-width="1.2" filter="url(#rough)">
        <g transform="translate(0 6)">${PART.candle}</g><g transform="translate(-16 -4) scale(.6)">${PART.flowerB}</g>
      </svg></div>
    ${[0,1,2,3,4,5].map(bdBlock).join("")}`;
}
function pgBdR(){
  return `${[6,7,8,9,10,11].map(bdBlock).join("")}
    <button class="btn ghost sm" id="addBd" style="margin-top:8px">+ Geburtstag hinzufügen</button>
    <p class="micro" style="margin-top:10px">Geburtstage erscheinen automatisch im Kalender und in der Jahresübersicht.</p>`;
}

/* ============================================================
   7 · SEITEN — MONATSTEIL
   ============================================================ */

/** Reiter innerhalb eines Monats. */
function mtabs(m, active){
  const t = [["Kalender",1],["Ziele",7],["Stimmung",2],["Gewohnheiten",3],["Songs",4],["Erinnerungen",5],["Wochen",6]];
  return `<div class="mtabs">${t.map(([n,i]) =>
    `<button class="mtab" data-go="m:${m}:${i}" aria-current="${i === active}">${n}</button>`).join("")}</div>`;
}

/* --- Monatsdeckblatt ---------------------------------------- */
function pgMcover(m){
  const M = MONTHS[m], mk = mkey(m);
  const motto = S.monthMotto[mk] ?? M.motto;
  const v = S.vision.find(x => x.i === `m${m}`);
  return `<div style="height:100%;display:flex;flex-direction:column;justify-content:center;
      align-items:center;text-align:center;position:relative;padding:2% 6%">
    ${monthScene(m, {op:.42})}
    <p class="label" style="letter-spacing:.4em;padding-left:.4em">${YEAR}</p>
    <h2 style="font-family:'Kaushan Script',cursive;font-size:clamp(46px,9.5vh,86px);
      line-height:.95;color:var(--accent);margin:.6vh 0 0">${M.n}</h2>
    <svg viewBox="0 0 300 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      preserveAspectRatio="none" filter="url(#rough2)"
      style="width:min(56%,240px);height:9px;color:var(--accent);opacity:.7;margin-top:4px">
      <path d="M2 5.5c46-3.4 92-4 138-2.4 44 1.6 88 2 158-.6"/></svg>
    <div style="margin-top:2.2vh;width:min(90%,34ch)">
      <input class="w" data-f="mmotto.${mk}" value="${esc(motto)}" aria-label="Monatsmotto"
        style="text-align:center;font-size:clamp(17px,2.4vh,21px);color:var(--ink-soft)">
    </div>
    <div style="margin-top:2.6vh;width:min(64%,220px);position:relative;flex:0 0 auto">
      <span class="tape tl" style="left:50%;margin-left:-39px"></span>
      ${v
        ? `<div class="photo-slot filled"><img src="${v.img}" alt="Foto des Monats">
             <button class="rm" data-visrm="m${m}" aria-label="Foto entfernen"
               style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;
               background:var(--paper);border:1.3px solid var(--rule);display:grid;place-items:center">${X_SVG}</button></div>`
        : `<button class="photo-slot" data-vis="m${m}">${CAM_SVG}
             <span class="cap">Foto des Monats</span></button>`}
    </div>
    <div style="margin-top:2.4vh;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <button class="btn" data-go="m:${m}:1">Kalender</button>
      <button class="btn ghost" data-go="m:${m}:2">Stimmung</button>
      <button class="btn ghost" data-go="m:${m}:6">Wochen</button>
    </div>
  </div>`;
}

/* --- Monatsübersicht ---------------------------------------- */
function pgMcal(m){
  const n = dim(m), f = fwd(m), mk = mkey(m);
  const weeks = weeksOf(m);
  const rows = weeks.map(w => `<tr>${w.map(d => {
    if (d === null) return `<td class="out"></td>`;
    const k = key(m, d), ev = S.events[k] || [], bd = bdOf(m, d), dd = S.days[k];
    const mood = S.moods[k];
    return `<td><button class="cell" data-day="${k}">
      <span class="d num">${d}</span>
      ${ev.slice(0,1).map(e => `<span class="ev">${esc(e.t)}</span>`).join("")}
      ${bd.map(b => `<span class="bday">♥ ${esc(b.n)}</span>`).join("")}
      <span class="mk">
        ${mood != null ? `<i style="background:${S.moodLabels[mood].c}"></i>` : ""}
        ${dd && (dd.note || dd.summary) ? `<i style="background:var(--pencil)"></i>` : ""}
      </span></button></td>`;
  }).join("")}</tr>`).join("");

  return `${head(MONTHS[m].n, `${n} Tage · ${YEAR}`)}
    ${mtabs(m, 1)}
    <table class="cal"><thead><tr>${WS.map(w => `<th>${w}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody></table>
    <p class="micro" style="margin-top:6px">Auf einen Tag tippen öffnet die Tagesseite.</p>`;
}
function pgMside(m){
  const mk = mkey(m), n = dim(m);
  const moods = Object.entries(S.moods).filter(([k]) => k.startsWith(mk));
  const done = moods.length;
  const top = (() => {
    const c = {}; moods.forEach(([,v]) => c[v] = (c[v] || 0) + 1);
    const best = Object.entries(c).sort((a,b) => b[1] - a[1])[0];
    return best ? S.moodLabels[best[0]] : null;
  })();
  const evs = Object.entries(S.events).filter(([k,v]) => k.startsWith(mk) && v.length)
    .sort().slice(0, 5);
  const bds = S.birthdays.filter(b => b.m === m).sort((a,b) => a.d - b.d);
  const goals = S.monthGoals[mk] ?? "";

  return `${head("Ziele", `${MONTHS[m].n} ${YEAR}`)}
    ${mtabs(m, 7)}
    <div class="box tint" style="position:relative;margin-top:12px">
      <span class="tape tr"></span>
      <p class="label" style="margin-bottom:4px">Was ich diesen Monat schaffen will</p>
      <textarea class="w" data-f="mgoals.${mk}" rows="4"
        placeholder="Drei Dinge reichen völlig …">${esc(goals)}</textarea>
    </div>

    <div class="sec"><p class="label">Wichtige Tage</p>
      ${bds.map(b => `<div class="bd-row"><span class="dt num">${b.d}.</span>
        <span class="nm">${esc(b.n)} hat Geburtstag</span></div>`).join("")}
      ${evs.map(([k,v]) => `<button class="bd-row" data-day="${k}" style="width:100%;text-align:left">
        <span class="dt num">${+k.slice(-2)}.</span><span class="nm">${esc(v[0].t)}</span></button>`).join("")}
      ${!bds.length && !evs.length ? `<p class="micro">Noch nichts eingetragen — tippe im Kalender auf einen Tag.</p>` : ""}
      <button class="btn ghost sm" data-addev="${m}" style="margin-top:8px">+ Termin eintragen</button>
    </div>

    <div class="sec"><p class="label">Der Monat in Zahlen</p>
      <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:4px">
        <span class="mood-stats"><span class="s"><b>${done}</b><span class="label">von ${n} Tagen gefüllt</span></span></span>
      </div>
      ${top ? `<p style="margin-top:5px;font-size:17px;color:var(--ink-soft)">
        Meistens: <span style="color:${top.c}">${esc(top.t)}</span></p>` : ""}
    </div>

    <div class="sec"><p class="label">Notizen</p>
      <textarea class="w" data-f="mnote.${mk}" rows="5"
        placeholder="Gedanken, Listen, was auch immer …">${esc(S.monthNote[mk] ?? "")}</textarea>
    </div>`;
}

/* --- Moodtracker -------------------------------------------- */
function pgMood(m){
  const n = dim(m), ac = MONTHS[m].ac, motif = MONTHS[m].motif;
  const cells = Array.from({length: 31}, (_, i) => {
    const d = i + 1;
    if (d > n) return `<div class="mood-cell void" aria-hidden="true">
      ${motifSVG(motif, null, "var(--pencil)")}</div>`;
    const k = key(m, d), v = S.moods[k];
    const c = v != null ? S.moodLabels[v].c : null;
    return `<button class="mood-cell" data-mood="${k}"
      aria-label="${d}. ${MONTHS[m].n}${v != null ? ": " + S.moodLabels[v].t : ", keine Stimmung"}">
      ${motifSVG(motif, c, c ? `color-mix(in oklab,${c},var(--sink-color) 22%)` : "var(--pencil)")}
      <span class="mnum num">${d}</span></button>`;
  }).join("");
  return `${head("Stimmung", MONTHS[m].n)}
    ${mtabs(m, 2)}
    <div class="mood-field">${cells}</div>
    <p class="micro" style="margin-top:9px">Antippen und Stimmung wählen · nochmal auf dieselbe tippen löscht sie.</p>`;
}
function pgMoodKey(m){
  const mk = mkey(m), n = dim(m);
  const counts = S.moodLabels.map((_, i) =>
    Object.entries(S.moods).filter(([k,v]) => k.startsWith(mk) && v === i).length);
  const total = counts.reduce((a,b) => a + b, 0);
  return `<div class="pagecol" style="position:relative">
    ${monthScene(m, {op:.13})}
    <p class="label">Meine fünf Stimmungen</p>
    <p class="micro" style="margin-top:2px">Namen und Farben kannst du ändern.</p>
    <div class="mood-key" style="flex-direction:column;gap:7px;align-items:stretch">
      ${S.moodLabels.map((l, i) => `
        <div class="k" style="gap:9px">
          <button class="sw" style="background:${l.c}" data-moodcolor="${i}"
            aria-label="Farbe ändern"></button>
          <input class="w" data-f="mood.${i}.t" value="${esc(l.t)}" style="flex:1">
          <span class="micro num" style="min-width:52px;text-align:right">${counts[i]}×</span>
        </div>`).join("")}
    </div>

    <div class="sec"><p class="label">Verteilung</p>
      <div style="display:flex;height:26px;border:1.6px solid var(--rule);border-radius:99px;
        overflow:hidden;margin-top:5px;background:color-mix(in oklab,var(--paper),var(--accent) 4%)">
        ${total ? S.moodLabels.map((l, i) => counts[i]
          ? `<span title="${esc(l.t)}: ${counts[i]}" style="flex:${counts[i]};background:${l.c};opacity:.85"></span>`
          : "").join("") : `<span style="flex:1"></span>`}
      </div>
      <p class="micro" style="margin-top:5px">${total} von ${n} Tagen erfasst</p>
    </div>

    <div class="box soft push" style="position:relative">
      <p class="label" style="margin-bottom:3px">Was mir dieses Jahr auffällt</p>
      <textarea class="w" data-f="mnote2.${mk}" rows="3"
        placeholder="Zum Beispiel: an welchen Tagen geht es mir gut?">${esc(S.monthNote[mk + ".mood"] ?? "")}</textarea>
    </div>
  </div>`;
}

/* --- Habittracker ------------------------------------------- */
function habitBlock(h, m){
  const n = dim(m);
  const days = Array.from({length: 31}, (_, i) => i + 1);
  if (h.type === "num"){
    const vals = days.map(d => d <= n ? (S.habitLog[`${h.id}|${key(m,d)}`] ?? 0) : null);
    const peak = Math.max(h.goal * 1.25, ...vals.map(v => v || 0));
    return `<div class="habit" data-habit="${h.id}" style="--hc:${h.c}">
      <div class="habit-head">
        <span class="dotc" style="background:${h.c}"></span>
        <span class="hn">${esc(h.ic)} ${esc(h.name)}</span>
        <span class="goal num">Ziel ${h.goal} ${esc(h.unit)}${h.lower ? " oder weniger" : ""}</span>
        <span class="tools"><button class="icon-btn" data-hedit="${h.id}" aria-label="Gewohnheit bearbeiten">${PEN_SVG}</button></span>
      </div>
      <div class="bars">${vals.map((v, i) => v === null
        ? `<span class="bar" style="opacity:.14" aria-hidden="true"><i style="--v:0%"></i></span>`
        : `<button class="bar${!h.lower && v > h.goal ? " over" : ""}" data-num="${h.id}|${key(m,i+1)}"
             aria-label="${i+1}. — ${v} ${esc(h.unit)}"><i style="--v:${clamp(v / peak * 100, 0, 100)}%"></i></button>`
      ).join("")}</div>
      <div class="bar-axis"><span>1.</span><span class="num">${Math.ceil(n/2)}.</span><span class="num">${n}.</span></div>
    </div>`;
  }
  const done = days.filter(d => d <= n && S.habitLog[`${h.id}|${key(m,d)}`]).length;
  let streak = 0, best = 0;
  for (let d = 1; d <= n; d++){
    if (S.habitLog[`${h.id}|${key(m,d)}`]){ streak++; best = Math.max(best, streak); } else streak = 0;
  }
  return `<div class="habit" data-habit="${h.id}" style="--hc:${h.c}">
    <div class="habit-head">
      <span class="dotc" style="background:${h.c}"></span>
      <span class="hn">${esc(h.ic)} ${esc(h.name)}</span>
      <span class="goal num">${done}/${n}</span>
      <span class="tools"><button class="icon-btn" data-hedit="${h.id}" aria-label="Gewohnheit bearbeiten">${PEN_SVG}</button></span>
    </div>
    <div class="ticks">${days.map(d => d > n
      ? `<button class="void" tabindex="-1" aria-hidden="true"></button>`
      : `<button data-bool="${h.id}|${key(m,d)}" aria-pressed="${!!S.habitLog[`${h.id}|${key(m,d)}`]}"
           aria-label="${esc(h.name)} am ${d}.">${CHECK_SVG}</button>`).join("")}</div>
    <div class="ticks-rule">${days.map(d => `<span class="num">${d <= n ? d : ""}</span>`).join("")}</div>
    ${best > 1 ? `<p class="streak">🔥 längste Serie: ${best} Tage</p>` : ""}
  </div>`;
}
function pgHabitsL(m){
  const nums = S.habits.filter(h => h.type === "num");
  return `${head("Gewohnheiten", MONTHS[m].n)}
    ${mtabs(m, 3)}
    <p class="label" style="margin-top:12px">Was ich messe</p>
    ${nums.map(h => habitBlock(h, m)).join("") || `<p class="micro">Noch nichts angelegt.</p>`}
    <button class="btn ghost sm" data-addhabit="num" style="margin-top:12px">+ Messbare Gewohnheit</button>`;
}
function pgHabitsR(m){
  const bools = S.habits.filter(h => h.type === "bool");
  const n = dim(m);
  const total = bools.reduce((a,h) =>
    a + Array.from({length:n},(_,i)=>i+1).filter(d => S.habitLog[`${h.id}|${key(m,d)}`]).length, 0);
  const max = bools.length * n;
  return `<p class="label">Was ich einfach abhake</p>
    ${bools.map(h => habitBlock(h, m)).join("") || `<p class="micro">Noch nichts angelegt.</p>`}
    <button class="btn ghost sm" data-addhabit="bool" style="margin-top:12px">+ Ja/Nein-Gewohnheit</button>
    <div class="box soft" style="margin-top:16px">
      <p class="label" style="margin-bottom:5px">Monatsbilanz</p>
      <div class="prog"><i style="--p:${max ? Math.round(total / max * 100) : 0}%"></i></div>
      <p class="micro" style="margin-top:5px">${total} von ${max} möglichen Häkchen — und das ist völlig okay so.</p>
    </div>`;
}

/* --- Top Songs ---------------------------------------------- */
const SEED_SONGS = [
  {t:"Wenn Worte meine Sprache wären", a:"Tim Bendzko", n:"lief auf der Fahrt nach Hause", h:3},
  {t:"Golden Hour",                    a:"JVKE",        n:"", h:2},
  {t:"Zeit",                           a:"AnnenMayKantereit", n:"Ohrwurm der Woche", h:3},
  {t:"Ribs",                           a:"Lorde",       n:"", h:2},
  {t:"Alles neu",                      a:"Peter Fox",   n:"Putzmusik", h:1}
];
function songsOf(mk){
  if (!S.songs[mk]) S.songs[mk] = {count:5, list: SEED_SONGS.map(s => ({...s}))};
  const o = S.songs[mk];
  while (o.list.length < o.count) o.list.push({t:"", a:"", n:"", h:0});
  return o;
}
function pgSongs(m){
  const mk = mkey(m), o = songsOf(mk);
  const rows = o.list.slice(0, o.count).map((s, i) => `
    <div class="song" data-song="${mk}:${i}">
      <span class="rank num">${i + 1}</span>
      <button class="cov" data-songcov="${mk}:${i}" aria-label="Cover wählen">
        ${s.cov ? `<img src="${s.cov}" alt="">` : NOTE_SVG}</button>
      <span class="meta">
        <input class="w plain ti" data-f="song.${mk}.${i}.t" value="${esc(s.t)}" placeholder="Titel">
        <input class="w plain ar" data-f="song.${mk}.${i}.a" value="${esc(s.a)}" placeholder="Künstler">
        <input class="w plain no" data-f="song.${mk}.${i}.n" value="${esc(s.n)}" placeholder="Warum dieser Song?">
      </span>
      <span class="side">
        <span class="hearts">${[1,2,3].map(h =>
          `<button class="${s.h >= h ? "on" : ""}" data-songheart="${mk}:${i}:${h}"
            aria-label="${h} von 3">${HEART_SVG}</button>`).join("")}</span>
      </span>
    </div>`).join("");
  return `${head("Top Songs", MONTHS[m].n)}
    ${mtabs(m, 4)}
    <div class="count-toggle" style="margin-top:10px">
      <span class="label" style="margin-right:4px">Wie viele?</span>
      <button data-songcount="${mk}:5"  aria-pressed="${o.count === 5}">5 Songs</button>
      <button data-songcount="${mk}:10" aria-pressed="${o.count === 10}">10 Songs</button>
    </div>
    <div class="songs">${rows}</div>`;
}

/* --- Erinnerungen des Monats -------------------------------- */
function pgMemories(m){
  const mk = mkey(m);
  const slots = Array.from({length: 4}, (_, i) => {
    const id = `mem${m}_${i}`, v = S.vision.find(x => x.i === id);
    return v
      ? `<div class="vslot filled">
           ${v.img ? `<img src="${v.img}" alt="Erinnerung">` : `<span class="stk">${esc(v.emoji)}</span>`}
           <span class="cap">${esc(v.cap || "")}</span>
           <button class="rm" data-visrm="${id}" aria-label="Entfernen">${X_SVG}</button></div>`
      : `<button class="vslot" data-vis="${id}">${CAM_SVG}<span class="cap">Foto</span></button>`;
  }).join("");
  return `<div class="pagecol" style="position:relative">
    ${monthScene(m, {op:.14})}
    <p class="label">Erinnerungen</p>
    <div class="vision" style="grid-template-columns:1fr 1fr;margin-top:8px">${slots}</div>
    <div class="sec"><p class="label">Aufkleber</p>
      <div class="sticker-bar">${STICKERS.slice(0,12).map(s =>
        `<button data-stickadd="${mk}">${s}</button>`).join("")}</div>
    </div>
    <div class="box soft" style="margin-top:12px;flex:1;display:flex;flex-direction:column">
      <p class="label" style="margin-bottom:3px">Das nehme ich aus diesem Monat mit</p>
      <textarea class="w" data-f="mnote3.${mk}" rows="6" style="flex:1"
        placeholder="Ein Satz reicht.">${esc(S.monthNote[mk + ".mem"] ?? "")}</textarea>
    </div>
  </div>`;
}

/* --- Wochenansicht ------------------------------------------ */
let weekIdx = {};
function dayCard(m, d){
  if (d === null) return `<div class="daycard" style="opacity:.25;pointer-events:none">
    <span class="micro">gehört zum Nachbarmonat</span></div>`;
  const k = key(m, d), dd = S.days[k], ev = S.events[k] || [], bd = bdOf(m, d);
  const mood = S.moods[k], we = wdOf(m, d) >= 5;
  const hb = S.habits.filter(h => h.type === "bool").slice(0, 3);
  return `<button class="daycard${we ? " we" : ""}" data-day="${k}">
    <span class="dh">
      <span class="dw">${WS[wdOf(m,d)]}</span>
      <span class="dn num">${d}</span>
      <span class="mini-mood">
        ${mood != null ? `<i style="background:${S.moodLabels[mood].c}"></i>` : ""}
        ${bd.length ? `<span class="micro">♥ ${esc(bd[0].n)}</span>` : ""}
      </span>
    </span>
    ${ev.map(e => `<span class="ev">${esc(e.t)}</span>`).join("")}
    ${dd && dd.summary ? `<span class="ev" style="border-color:var(--pencil)">${esc(dd.summary)}</span>` : ""}
    ${!ev.length && !(dd && dd.summary) ? `<span class="lines"></span>` : ""}
    <span class="hb">${hb.map(h =>
      `<i style="${S.habitLog[`${h.id}|${k}`] ? `background:${h.c};border-color:${h.c}` : ""}"></i>`).join("")}</span>
  </button>`;
}
function pgWeekL(m){
  const ws = weeksOf(m);
  const wi = clamp(weekIdx[m] ?? 0, 0, ws.length - 1);
  const w = ws[wi];
  const first = w.find(d => d !== null), last = [...w].reverse().find(d => d !== null);
  return `${head("Woche", `${first}.–${last}. ${MONTHS[m].n}`)}
    ${mtabs(m, 6)}
    <div class="week-nav">${ws.map((_, i) =>
      `<button data-week="${m}:${i}" aria-pressed="${i === wi}">KW ${i + 1}</button>`).join("")}</div>
    <div class="daycards">${w.slice(0, 4).map(d => dayCard(m, d)).join("")}</div>`;
}
function pgWeekR(m){
  const ws = weeksOf(m);
  const wi = clamp(weekIdx[m] ?? 0, 0, ws.length - 1);
  const w = ws[wi], mk = `${mkey(m)}.w${wi}`;
  return `<div class="daycards" style="margin-top:0">${w.slice(4).map(d => dayCard(m, d)).join("")}</div>
    <div class="box tint" style="margin-top:12px;position:relative">
      <span class="tape tl"></span>
      <p class="label" style="margin-bottom:3px">Notizen zur Woche</p>
      <textarea class="w" data-f="mnote4.${mk}" rows="4"
        placeholder="Was war gut, was nehme ich mit?">${esc(S.monthNote[mk] ?? "")}</textarea>
    </div>
    <p class="micro" style="margin-top:8px">Die Kästchen unten auf jeder Karte zeigen deine Gewohnheiten.
      Tippe auf einen Tag für die ganze Seite.</p>`;
}

/* --- Tagesdetail -------------------------------------------- */
function pgDayL(k){
  const [ , mm, ddn ] = k.split("-").map(Number);
  const m = mm - 1, d = ddn, dd = day(k), ev = S.events[k] || [], bd = bdOf(m, d);
  return `<div style="position:relative">
    ${monthScene(m, {op:.12})}
    <div class="day-head">
      <span class="big num">${d}</span>
      <div style="padding-bottom:6px">
        <p class="wd">${WD[wdOf(m,d)]}</p>
        <p class="label" style="letter-spacing:.1em">${MONTHS[m].n} ${YEAR}</p>
      </div>
    </div>
    ${STROKE_SVG}
    ${bd.length ? `<p style="margin-top:6px;color:var(--accent);font-size:18px">
      ♥ ${bd.map(b => esc(b.n)).join(", ")} hat heute Geburtstag</p>` : ""}

    <div class="sec"><p class="label">Termine</p>
      ${ev.map((e, i) => `<div class="todo">
        <span style="color:var(--accent)">•</span>
        <input class="w plain" data-f="ev.${k}.${i}" value="${esc(e.t)}" style="flex:1">
        <button class="icon-btn" data-evrm="${k}:${i}" aria-label="Termin löschen">${X_SVG}</button>
      </div>`).join("")}
      <button class="btn ghost sm" data-addev2="${k}" style="margin-top:5px">+ Termin</button>
    </div>

    <div class="sec"><p class="label">Dankbar für</p>
      <div class="grat">${[0,1,2].map(i => `<div class="g">
        <span class="n">${i + 1}</span>
        <input class="w" data-f="day.${k}.gratitude.${i}" value="${esc(dd.gratitude[i] || "")}"
          placeholder="${["etwas Kleines","etwas von heute","jemanden"][i]}">
      </div>`).join("")}</div>
    </div>

    <div class="sec"><p class="label">To-dos</p>
      <div class="todos">${dd.todos.map((t, i) => `
        <div class="todo${t.done ? " done" : ""}">
          <button class="tick" data-todo="${k}:${i}" aria-pressed="${t.done}"
            aria-label="Erledigt">${CHECK_SVG}</button>
          <input class="w plain" data-f="day.${k}.todos.${i}.t" value="${esc(t.t)}" style="flex:1">
          <button class="icon-btn" data-todorm="${k}:${i}" aria-label="Löschen">${X_SVG}</button>
        </div>`).join("")}</div>
      <button class="btn ghost sm" data-addtodo="${k}" style="margin-top:5px">+ Aufgabe</button>
    </div>
  </div>`;
}
function pgDayR(k){
  const [ , mm, ddn ] = k.split("-").map(Number);
  const m = mm - 1, dd = day(k), mood = S.moods[k];
  return `<div class="pagecol">
    <div class="sec" style="margin-top:0"><p class="label">Wie war der Tag?</p>
      <div class="mood-key" style="gap:5px 10px">
        ${S.moodLabels.map((l, i) => `
          <button class="k" data-daymood="${k}:${i}" style="opacity:${mood === i ? 1 : .45}">
            <span class="sw" style="background:${l.c};${mood === i ? "box-shadow:0 0 0 2px var(--paper),0 0 0 3.4px " + l.c : ""}"></span>
            <span style="font-size:16px">${esc(l.t)}</span>
          </button>`).join("")}
      </div>
    </div>

    <div class="sec"><p class="label">Energie</p>
      <div class="scale">${[1,2,3,4,5].map(v =>
        `<button data-energy="${k}:${v}" aria-pressed="${dd.energy === v}" class="num">${v}</button>`).join("")}
        <span class="micro" style="margin-left:6px">1 = leer · 5 = voll</span></div>
    </div>

    <div class="sec"><p class="label">Notiz</p>
      <textarea class="w" data-f="day.${k}.note" rows="4"
        placeholder="Einfach draufloschreiben.">${esc(dd.note)}</textarea>
    </div>

    <div class="sec" style="display:grid;grid-template-columns:1.1fr 1fr;gap:12px;align-items:start">
      <div>
        <p class="label" style="margin-bottom:5px">Foto</p>
        ${dd.photo
          ? `<div class="photo-slot filled" style="position:relative"><span class="tape"></span>
               <img src="${dd.photo}" alt="Foto des Tages">
               <button class="rm" data-photorm="${k}" aria-label="Foto entfernen"
                 style="position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;
                 background:var(--paper);border:1.3px solid var(--rule);display:grid;place-items:center;z-index:3">${X_SVG}</button></div>`
          : `<button class="photo-slot" data-photo="${k}">${CAM_SVG}<span class="cap">Bild hinzufügen</span></button>`}
      </div>
      <div>
        <p class="label" style="margin-bottom:5px">Aufkleber</p>
        <div class="sticker-bar">${STICKERS.slice(0, 8).map(s =>
          `<button data-daysticker="${k}|${s}">${s}</button>`).join("")}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;min-height:26px">
          ${dd.stickers.map((s, i) => `<button data-stickrm="${k}:${i}" title="Entfernen"
            style="font-size:22px;line-height:1">${esc(s)}</button>`).join("")}
        </div>
      </div>
    </div>

    <div class="box tint push">
      <p class="label" style="margin-bottom:3px">Fazit des Tages</p>
      <input class="w plain" data-f="day.${k}.summary" value="${esc(dd.summary)}"
        placeholder="In einem Satz …" style="font-size:20px">
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn ghost sm" data-go="m:${m}:6">← Zur Woche</button>
      <button class="btn ghost sm" data-go="m:${m}:1">Zum Kalender</button>
    </div>
  </div>`;
}

/* ============================================================
   8 · DAS BUCH — Seitenfolge, Blättern, Navigation
   ============================================================ */

/** Feste Reihenfolge aller Doppelseiten. */
function buildSpreads(){
  const sp = [
    {id:"cover", t:"Deckblatt",       solo:true, ac:"#8A8455", R:pgCover},
    {id:"toc",   t:"Inhalt",          ac:"#8A8455", L:pgToc,      R:pgYearL},
    {id:"year",  t:"Jahresübersicht", ac:"#8A8455", L:pgYearR,    R:pgYearNote},
    {id:"goals", t:"Vorsätze & Ziele",ac:"#AE6A92", L:pgVision,   R:pgGoals},
    {id:"l10",   t:"Level 10 Life",   ac:"#6B9F9C", L:pgL10wheel, R:pgL10list},
    {id:"bd",    t:"Geburtstage",     ac:"#C4788B", L:pgBdL,      R:pgBdR}
  ];
  // Jeder Monat beginnt mit seinem eigenen Deckblatt — sechs Doppelseiten.
  MONTHS.forEach((M, m) => {
    sp.push(
      {id:`m${m}a`, t:`${M.n}`,               m, ac:M.ac, L:() => pgMcover(m),  R:() => pgMcal(m)},
      {id:`m${m}b`, t:`${M.n} · Ziele`,       m, ac:M.ac, L:() => pgMside(m),   R:() => pgMonthEnd(m)},
      {id:`m${m}c`, t:`${M.n} · Stimmung`,    m, ac:M.ac, L:() => pgMood(m),    R:() => pgMoodKey(m)},
      {id:`m${m}d`, t:`${M.n} · Gewohnheiten`,m, ac:M.ac, L:() => pgHabitsL(m), R:() => pgHabitsR(m)},
      {id:`m${m}e`, t:`${M.n} · Songs`,       m, ac:M.ac, L:() => pgSongs(m),   R:() => pgMemories(m)},
      {id:`m${m}f`, t:`${M.n} · Wochen`,      m, ac:M.ac, L:() => pgWeekL(m),   R:() => pgWeekR(m)}
    );
  });
  sp.push({id:"end", t:"Ende", solo:true, ac:"#4E6B55", R:pgClosing});
  return sp;
}

function pgYearNote(){
  return `<div class="pagecol" style="position:relative">
    <p class="label">Bevor es losgeht</p>
    ${STROKE_SVG}
    <p style="font-size:19px;color:var(--ink-soft);margin-top:10px;max-width:40ch;line-height:1.5">
      Dieses Buch muss nicht vollständig werden. Kein Tag muss ausgefüllt sein,
      keine Gewohnheit jeden Tag abgehakt. Es ist ein Ort zum Festhalten —
      nicht zum Abarbeiten.</p>
    <div class="box tint" style="margin-top:16px;position:relative">
      <span class="tape tl"></span>
      <p class="label" style="margin-bottom:3px">Ein Wort für dieses Jahr</p>
      <input class="w plain" data-f="meta.motto" value="${esc(S.meta.motto)}"
        style="font-size:26px;font-family:'Kaushan Script',cursive;color:var(--accent)">
    </div>
    <div class="box soft" style="margin-top:12px">
      <p class="label" style="margin-bottom:3px">Was ich mir für 2027 wünsche</p>
      <textarea class="w" data-f="mnote.wunsch" rows="4">${esc(S.monthNote["wunsch"] ?? "")}</textarea>
    </div>
    <p class="micro push">Auf der nächsten Seite: deine Vorsätze →</p>
  </div>`;
}

function pgMonthEnd(m){
  const mk = mkey(m);
  return `<div class="pagecol" style="position:relative">
    ${monthScene(m, {op:.16})}
    <p class="label">${MONTHS[m].n} — Rückblick</p>
    ${STROKE_SVG}
    <div class="box soft" style="margin-top:10px">
      <p class="label" style="margin-bottom:3px">Das lief gut</p>
      <textarea class="w" data-f="mnote5.${mk}.gut" rows="3">${esc(S.monthNote[mk + ".gut"] ?? "")}</textarea>
    </div>
    <div class="box soft" style="margin-top:10px">
      <p class="label" style="margin-bottom:3px">Das nehme ich mir vor</p>
      <textarea class="w" data-f="mnote5.${mk}.next" rows="3">${esc(S.monthNote[mk + ".next"] ?? "")}</textarea>
    </div>
    <div class="box tint push" style="position:relative">
      <span class="tape tr"></span>
      <p style="font-size:19px;color:var(--ink-soft)">
        ${m < 11 ? `Weiter geht's im ${MONTHS[m+1].n}.` : "Und damit war das Jahr voll."}</p>
    </div>
  </div>`;
}
function pgClosing(){
  return `<div class="cover" style="--accent:#4E6B55">
    ${FRAME_SVG}
    <div class="cover-art" style="top:16%;left:50%;transform:translateX(-50%);width:min(46%,220px);opacity:.6">
      <svg viewBox="-40 -40 80 80" fill="none" stroke="currentColor" stroke-width="1" filter="url(#rough)">
        ${PART.wreath}<g transform="translate(0 8) scale(.9)">${PART.tree}</g>
      </svg></div>
    <p class="kicker">Das war</p>
    <div class="yr" style="font-size:clamp(56px,13vh,120px)">2027</div>
    <p class="motto" style="margin-top:3vh">Ein ganzes Jahr, aufgeschrieben.<br>Das nächste liegt schon bereit.</p>
    <div class="open"><button class="btn" data-go="s:0">Von vorne beginnen</button></div>
  </div>`;
}

const SPREADS = buildSpreads();
const idxOfMonth = m => SPREADS.findIndex(s => s.id === `m${m}a`);

/* --- Zustand ------------------------------------------------- */
let cur = 0;            // aktueller Spread-Index
let dayView = null;     // "2027-03-04" wenn Tagesseite offen
let side = 0;           // Handy: 0 = linke Seite, 1 = rechte Seite

const isPhone = () => window.matchMedia("(max-width:860px)").matches
                   || (window.matchMedia("(orientation:portrait)").matches && window.innerWidth <= 1100);

/* --- Rendern ------------------------------------------------- */
function currentPages(){
  if (dayView){
    const m = +dayView.slice(5,7) - 1;
    return {L:() => pgDayL(dayView), R:() => pgDayR(dayView), ac:MONTHS[m].ac,
            t:"Tagesseite", solo:false, m};
  }
  return SPREADS[cur];
}

function render(){
  const sp = currentPages();
  const book = $("#book"), L = $(".page.left"), R = $(".page.right");
  book.classList.toggle("cover-mode", !!sp.solo);

  [L, R].forEach(p => { p.style.setProperty("--accent", lift(sp.ac)); });
  $("#pgL").innerHTML = sp.L ? sp.L() : "";
  $("#pgR").innerHTML = sp.R ? sp.R() : "";

  // Handy: nur eine Seite zeigen
  if (isPhone()){
    const showLeft = side === 0 && sp.L;
    L.classList.toggle("solo", !!showLeft);
    R.style.display = showLeft ? "none" : "";
    $("#pLabel").textContent = sp.t;
    $("#pPrev").disabled = cur === 0 && side === 0 && !dayView;
    $("#pNext").disabled = cur === SPREADS.length - 1 && side === 1;
  } else {
    L.classList.remove("solo"); R.style.display = "";
  }

  const n = dayView ? "" : String(cur * 2);
  $$(".folio")[0].textContent = sp.solo ? "" : n;
  $$(".folio")[1].textContent = sp.solo ? "" : String(+n + 1);

  paintMarks();
  wire();
  restoreScroll();
}

/* --- Lesezeichen & Register ---------------------------------- */
function paintMarks(){
  const marks = $("#marks"), tabs = $("#ytabs");
  const sp = currentPages(), activeM = sp.m;

  if (!marks.dataset.built){
    marks.innerHTML = MONTHS.map((M, i) =>
      `<button class="mark" data-go="m:${i}:0" style="--mc:${M.ac}"
        role="tab" aria-label="${M.n}"><span>${MS[i]}</span></button>`).join("");
    tabs.innerHTML = [["Inhalt","s:1"],["Jahr","s:2"],["Ziele","s:3"],["Level 10","s:4"],["Geburtstage","s:5"]]
      .map(([n, g]) => `<button class="ytab" data-go="${g}" role="tab"><span>${n}</span></button>`).join("");
    marks.dataset.built = "1";
  }
  $$(".mark", marks).forEach((b, i) => b.setAttribute("aria-current", String(i === activeM)));
  const yIdx = [1,2,3,4,5].indexOf(cur);
  $$(".ytab", tabs).forEach((b, i) => b.setAttribute("aria-current", String(i === yIdx && !dayView)));
}

/* --- Scrollposition je Seite merken -------------------------- */
const scrollMem = {};
function memoScroll(){
  const k = dayView || cur;
  scrollMem[k] = [$("#pgL").scrollTop, $("#pgR").scrollTop];
}
function restoreScroll(){
  const k = dayView || cur, v = scrollMem[k];
  $("#pgL").scrollTop = v ? v[0] : 0;
  $("#pgR").scrollTop = v ? v[1] : 0;
}

/* --- Blättern mit 3D-Effekt ---------------------------------- */
let flipTimer = 0;
const reduced = () => window.matchMedia("(prefers-reduced-motion:reduce)").matches;

/** Blätter-Ebene restlos aufräumen. Mehrfach aufrufbar. */
function endFlip(){
  const flip = $("#flip");
  clearTimeout(flipTimer);
  flip.querySelectorAll("*").forEach(el => el.getAnimations?.().forEach(a => a.cancel()));
  flip.classList.remove("on");
  flip.innerHTML = "";
}

function goto(i, opts = {}){
  i = clamp(i, 0, SPREADS.length - 1);
  const back = opts.back ?? (i < cur);
  if (i === cur && !dayView && !opts.force) return;
  memoScroll();
  if (isPhone() || reduced()){
    endFlip();
    dayView = null; cur = i; side = 0; render();
    if (isPhone()) window.scrollTo({top:0, behavior:"instant"});
    return;
  }
  animateTurn(() => { dayView = null; cur = i; }, back);
}

function openDay(k){
  memoScroll();
  if (isPhone() || reduced()){ endFlip(); dayView = k; side = 0; render(); window.scrollTo({top:0}); return; }
  animateTurn(() => { dayView = k; }, false);
}

/** Klont die aufliegende Seite und klappt sie um die Bundsteg-Achse weg. */
function animateTurn(mutate, back){
  endFlip();                       // eine noch laufende Umblätterung sauber beenden
  const flip = $("#flip"), src = back ? $(".page.left") : $(".page.right");
  const sheet = document.createElement("div");
  sheet.className = "flip-sheet";
  sheet.style.left = back ? "0" : "50%";
  sheet.style.transformOrigin = back ? "right center" : "left center";
  sheet.innerHTML = `<div style="position:absolute;inset:0;padding:var(--page-pad) clamp(20px,3.4%,42px)">
      ${src.querySelector(".page-inner").innerHTML}</div>
    <div class="shade"></div>`;
  // Interaktion auf dem Klon abschalten
  sheet.querySelectorAll("input,textarea,button,select").forEach(el => el.setAttribute("tabindex","-1"));
  flip.appendChild(sheet);
  flip.classList.add("on");

  mutate();
  render();

  const dir = back ? 1 : -1;
  const shade = sheet.querySelector(".shade");
  const anim = sheet.animate(
    [{transform:"rotateY(0deg)"}, {transform:`rotateY(${dir * 168}deg)`}],
    {duration:520, easing:"cubic-bezier(.42,0,.3,1)", fill:"forwards"});
  shade.animate(
    [{background:`linear-gradient(to ${back ? "right" : "left"}, rgba(0,0,0,0), rgba(0,0,0,.02))`, opacity:0},
     {background:`linear-gradient(to ${back ? "right" : "left"}, rgba(0,0,0,.02), rgba(0,0,0,.34))`, opacity:1, offset:.55},
     {opacity:0}],
    {duration:520, easing:"ease-in-out", fill:"forwards"});
  // Doppelt abgesichert: das Promise räumt normal auf, der Timer fängt Abbrüche ab.
  anim.finished.then(endFlip).catch(() => {});
  flipTimer = setTimeout(endFlip, 640);
}

function next(){
  if (isPhone()){
    const sp = currentPages();
    if (side === 0 && sp.L && sp.R){ side = 1; render(); window.scrollTo({top:0}); return; }
    if (dayView){ dayView = null; side = 0; render(); return; }
    if (cur < SPREADS.length - 1){ memoScroll(); cur++; side = 0; render(); window.scrollTo({top:0}); }
    return;
  }
  if (dayView){ goto(cur, {force:true, back:false}); return; }
  goto(cur + 1, {back:false});
}
function prev(){
  if (isPhone()){
    if (side === 1){ side = 0; render(); window.scrollTo({top:0}); return; }
    if (dayView){ dayView = null; side = 0; render(); return; }
    if (cur > 0){ memoScroll(); cur--; side = 0; render(); window.scrollTo({top:0}); }
    return;
  }
  if (dayView){ goto(cur, {force:true, back:true}); return; }
  goto(cur - 1, {back:true});
}

/** Ziel-Strings: "s:<index>" oder "m:<monat>:<tab>" */
const TAB_SPREAD = {0:0, 1:0, 7:1, 2:2, 3:3, 4:4, 5:4, 6:5};  // Reiter → Spread-Versatz
const TAB_RIGHT  = {1:1, 5:1};                                 // Reiter, die rechts liegen

function navigate(go){
  if (go.startsWith("s:")) return goto(+go.slice(2));
  const [, m, tab] = go.split(":").map(Number);
  goto(idxOfMonth(m) + (TAB_SPREAD[tab] ?? 0));
  if (isPhone()){ side = TAB_RIGHT[tab] ? 1 : 0; render(); }
}

/* ============================================================
   9 · EINGABEN
   Alle Felder tragen data-f="<pfad>". Beim Tippen wird nur der
   Datensatz aktualisiert (kein Neu-Rendern → Cursor bleibt stehen).
   ============================================================ */
function setField(path, val){
  const p = path.split(".");
  switch (p[0]){
    case "meta":   S.meta[p[1]] = val; break;
    case "goal": { const g = S.goals.find(x => x.id === p[1]); if (g) g[p[2]] = val; break; }
    case "l10":    S.level10[+p[1]][p[2]] = val; break;
    case "bd":     S.birthdays[+p[1]][p[2]] = val; break;
    case "mood":   S.moodLabels[+p[1]].t = val; break;
    case "mmotto": S.monthMotto[p[1]] = val; break;
    case "mgoals": S.monthGoals[p[1]] = val; break;
    case "mnote":  S.monthNote[p[1]] = val; break;
    case "mnote2": S.monthNote[p[1] + ".mood"] = val; break;
    case "mnote3": S.monthNote[p[1] + ".mem"]  = val; break;
    case "mnote4": S.monthNote[p.slice(1).join(".")] = val; break;
    case "mnote5": S.monthNote[p[1] + "." + p[2]] = val; break;
    case "song": { const o = songsOf(p[1]); o.list[+p[2]][p[3]] = val; break; }
    case "ev": { const a = evOf(p[1]); if (a[+p[2]]) a[+p[2]].t = val; break; }
    case "day": {
      const d = day(p[1]);
      if (p[2] === "gratitude") d.gratitude[+p[3]] = val;
      else if (p[2] === "todos") d.todos[+p[3]].t = val;
      else d[p[2]] = val;
      break;
    }
  }
  save();
}

document.addEventListener("input", e => {
  const f = e.target.closest("[data-f]");
  if (!f) return;
  setField(f.dataset.f, f.value);
  if (f.tagName === "TEXTAREA") autosize(f);
});
function autosize(t){ t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }
function wire(){ $$("textarea.w").forEach(autosize); }

/* ============================================================
   10 · DIALOGE
   ============================================================ */
function modal({title, body, onSave, onDelete, saveLabel = "Speichern"}){
  const veil = $("#veil");
  veil.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <h3>${esc(title)}</h3>${body}
    <div class="acts">
      ${onDelete ? `<button class="btn sm del" data-mdel>Löschen</button>` : ""}
      <button class="btn ghost sm" data-mcancel>Abbrechen</button>
      <button class="btn sm" data-mok>${esc(saveLabel)}</button>
    </div></div>`;
  veil.classList.add("on");
  const close = () => { veil.classList.remove("on"); veil.innerHTML = ""; };
  veil.onclick = ev => { if (ev.target === veil) close(); };
  $("[data-mcancel]", veil).onclick = close;
  $("[data-mok]", veil).onclick = () => { if (onSave($(".sheet", veil)) !== false){ close(); render(); toast("Gespeichert"); } };
  if (onDelete) $("[data-mdel]", veil).onclick = () => { onDelete(); close(); render(); toast("Gelöscht"); };
  const first = veil.querySelector("input,textarea,select");
  if (first){ first.focus(); first.select?.(); }
  document.addEventListener("keydown", function esc2(ev){
    if (ev.key === "Escape"){ close(); document.removeEventListener("keydown", esc2); }
  });
}
const fld = (label, html) => `<div class="fld"><span class="label">${label}</span>${html}</div>`;

function habitDialog(h, type){
  const isNew = !h;
  h = h || {id:"h" + Date.now(), type: type || "bool", name:"", unit:"",
            goal:1, c:PALETTE[S.habits.length % PALETTE.length], ic:"✦"};
  modal({
    title: isNew ? "Neue Gewohnheit" : "Gewohnheit bearbeiten",
    body:
      fld("Name", `<input class="w" id="hn" value="${esc(h.name)}" placeholder="z. B. Spazieren gehen">`) +
      fld("Art", `<select class="w" id="ht">
          <option value="bool"${h.type==="bool"?" selected":""}>Abhaken (ja / nein)</option>
          <option value="num"${h.type==="num"?" selected":""}>Zahl messen</option></select>`) +
      `<div class="row" id="numrow" style="${h.type==="num"?"":"display:none"}">
        ${fld("Einheit", `<input class="w" id="hu" value="${esc(h.unit)}" placeholder="h, L, min">`)}
        ${fld("Tagesziel", `<input class="w num" id="hg" type="number" step="0.5" value="${h.goal}">`)}
      </div>` +
      fld("Farbe", `<div class="swatches" id="hc">${PALETTE.map(c =>
        `<button style="background:${c}" data-c="${c}" aria-pressed="${c===h.c}"></button>`).join("")}</div>`) +
      fld("Symbol", `<div class="iconpick" id="hi">${["🌙","💧","📱","🤸","🥗","✏️","📖","☕","🧘","🚶","🎧","🌿"].map(i =>
        `<button data-i="${i}" aria-pressed="${i===h.ic}">${i}</button>`).join("")}</div>`),
    onSave: sheet => {
      const name = $("#hn", sheet).value.trim();
      if (!name){ $("#hn", sheet).focus(); return false; }
      h.name = name;
      h.type = $("#ht", sheet).value;
      h.unit = $("#hu", sheet).value.trim();
      h.goal = parseFloat($("#hg", sheet).value) || 1;
      const c = $("[data-c][aria-pressed=true]", sheet), i = $("[data-i][aria-pressed=true]", sheet);
      if (c) h.c = c.dataset.c;
      if (i) h.ic = i.dataset.i;
      if (isNew) S.habits.push(h);
      save();
    },
    onDelete: isNew ? null : () => {
      S.habits = S.habits.filter(x => x.id !== h.id);
      Object.keys(S.habitLog).forEach(k => { if (k.startsWith(h.id + "|")) delete S.habitLog[k]; });
      save();
    }
  });
  const sheet = $(".sheet");
  $("#ht", sheet).onchange = e => $("#numrow", sheet).style.display = e.target.value === "num" ? "" : "none";
  sheet.addEventListener("click", e => {
    const b = e.target.closest("[data-c],[data-i]");
    if (!b) return;
    const grp = b.dataset.c ? "[data-c]" : "[data-i]";
    $$(grp, sheet).forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
  });
}

function goalDialog(g){
  const isNew = !g;
  g = g || {id:"g" + Date.now(), t:"", d:"", p:0, s:"neu", steps:[], habit:""};
  modal({
    title: isNew ? "Neues Ziel" : "Ziel bearbeiten",
    body:
      fld("Ziel", `<input class="w" id="gt" value="${esc(g.t)}" placeholder="Was willst du erreichen?">`) +
      fld("Beschreibung", `<textarea class="w" id="gd" rows="2">${esc(g.d)}</textarea>`) +
      `<div class="row">
        ${fld("Fortschritt %", `<input class="w num" id="gp" type="number" min="0" max="100" value="${g.p}">`)}
        ${fld("Status", `<select class="w" id="gs">${["neu","läuft","geschafft","pausiert"].map(s =>
          `<option${s===g.s?" selected":""}>${s}</option>`).join("")}</select>`)}
      </div>` +
      fld("Schritte (einer pro Zeile)",
        `<textarea class="w" id="gst" rows="3">${esc(g.steps.map(s => s.t).join("\n"))}</textarea>`) +
      fld("Passende Gewohnheit", `<select class="w" id="gh"><option value="">— keine —</option>${
        S.habits.map(h => `<option value="${h.id}"${h.id===g.habit?" selected":""}>${esc(h.ic)} ${esc(h.name)}</option>`).join("")
      }</select>`),
    onSave: sheet => {
      const t = $("#gt", sheet).value.trim();
      if (!t){ $("#gt", sheet).focus(); return false; }
      const olds = g.steps;
      g.t = t;
      g.d = $("#gd", sheet).value.trim();
      g.p = clamp(parseInt($("#gp", sheet).value) || 0, 0, 100);
      g.s = $("#gs", sheet).value;
      g.habit = $("#gh", sheet).value;
      g.steps = $("#gst", sheet).value.split("\n").map(s => s.trim()).filter(Boolean)
        .map(t2 => ({t:t2, done: olds.find(o => o.t === t2)?.done || false}));
      if (isNew) S.goals.push(g);
      save();
    },
    onDelete: isNew ? null : () => { S.goals = S.goals.filter(x => x.id !== g.id); save(); }
  });
}

function numDialog(hid, k){
  const h = S.habits.find(x => x.id === hid);
  const cur2 = S.habitLog[`${hid}|${k}`] ?? "";
  const d = +k.slice(-2), m = +k.slice(5,7) - 1;
  modal({
    title: `${h.ic} ${h.name}`,
    body: `<p class="micro" style="margin-bottom:6px">${d}. ${MONTHS[m].n} · Ziel ${h.goal} ${esc(h.unit)}</p>` +
      fld(`Wert in ${esc(h.unit)}`,
        `<input class="w num" id="nv" type="number" step="0.25" value="${cur2}" placeholder="0">`) +
      `<div class="swatches" style="margin-top:8px">${[h.goal*0.5, h.goal*0.75, h.goal, h.goal*1.25].map(v =>
        `<button class="btn sm" data-quick="${v}" style="width:auto;height:auto;border-radius:99px">${+v.toFixed(2)}</button>`).join("")}</div>`,
    onSave: sheet => {
      const v = parseFloat($("#nv", sheet).value);
      if (isNaN(v) || v <= 0) delete S.habitLog[`${hid}|${k}`];
      else S.habitLog[`${hid}|${k}`] = v;
      save();
    },
    onDelete: cur2 !== "" ? () => { delete S.habitLog[`${hid}|${k}`]; save(); } : null
  });
  $(".sheet").addEventListener("click", e => {
    const b = e.target.closest("[data-quick]");
    if (b) $("#nv").value = +parseFloat(b.dataset.quick).toFixed(2);
  });
}

function eventDialog(k){
  modal({
    title: "Termin eintragen",
    body: fld("Was?", `<input class="w" id="et" placeholder="z. B. Zahnarzt um 15 Uhr">`) +
          fld("Tag", `<input class="w" id="ed" type="date" value="${k}" min="${YEAR}-01-01" max="${YEAR}-12-31">`),
    onSave: sheet => {
      const t = $("#et", sheet).value.trim();
      if (!t){ $("#et", sheet).focus(); return false; }
      evOf($("#ed", sheet).value || k).push({t});
      save();
    }
  });
}

function bdDialog(){
  modal({
    title: "Geburtstag hinzufügen",
    body: fld("Name", `<input class="w" id="bn" placeholder="Wer?">`) +
      `<div class="row">
        ${fld("Monat", `<select class="w" id="bm">${MN.map((n,i) => `<option value="${i}">${n}</option>`).join("")}</select>`)}
        ${fld("Tag", `<input class="w num" id="bd" type="number" min="1" max="31" value="1">`)}
      </div>` + fld("Notiz", `<input class="w" id="bo" placeholder="optional">`),
    onSave: sheet => {
      const n = $("#bn", sheet).value.trim();
      if (!n){ $("#bn", sheet).focus(); return false; }
      S.birthdays.push({m:+$("#bm", sheet).value, d:clamp(+$("#bd", sheet).value, 1, 31),
                        n, no:$("#bo", sheet).value.trim()});
      save();
    }
  });
}

/** Stimmungs-Popover am angeklickten Element. */
function moodPopover(el, k){
  closePop();
  const p = document.createElement("div");
  p.className = "pop"; p.id = "pop";
  p.innerHTML = S.moodLabels.map((l, i) =>
    `<button data-pick="${i}"><span class="sw" style="background:${l.c}"></span>${esc(l.t)}</button>`).join("")
    + `<div class="sep"></div><button data-pick="-1"><span class="sw"
       style="background:transparent;border:1.4px dashed var(--pencil)"></span>Löschen</button>`;
  document.body.appendChild(p);
  const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
  p.style.left = clamp(r.left + r.width / 2 - pr.width / 2, 8, innerWidth - pr.width - 8) + "px";
  p.style.top  = (r.bottom + pr.height + 8 > innerHeight ? r.top - pr.height - 6 : r.bottom + 6) + "px";
  p.addEventListener("click", e => {
    const b = e.target.closest("[data-pick]");
    if (!b) return;
    const v = +b.dataset.pick;
    if (v < 0) delete S.moods[k]; else S.moods[k] = v;
    save(); closePop(); render(); toast(v < 0 ? "Gelöscht" : S.moodLabels[v].t);
  });
  setTimeout(() => document.addEventListener("click", closePopOnce, {once:true}), 0);
}
function closePop(){ $("#pop")?.remove(); }
function closePopOnce(e){ if (!e.target.closest("#pop")) closePop(); }

/* ============================================================
   11 · KLICKS
   ============================================================ */
document.addEventListener("click", e => {
  const t = e.target;
  const hit = sel => t.closest(sel);
  let el;

  if ((el = hit("[data-go]")))       return navigate(el.dataset.go);
  if ((el = hit("[data-day]")))      return openDay(el.dataset.day);
  if (hit("#openBook"))              return goto(1);
  if (hit("#btnToc"))                return goto(1);
  if (hit("#btnTheme"))              return toggleTheme();
  if (hit("#pPrev"))                 return prev();
  if (hit("#pNext"))                 return next();
  if (hit("#tPrev"))                 return prev();
  if (hit("#tNext"))                 return next();

  if ((el = hit("[data-mood]")))     return moodPopover(el, el.dataset.mood);
  if ((el = hit("[data-daymood]"))){
    const [k, i] = el.dataset.daymood.split(":");
    if (S.moods[k] === +i) delete S.moods[k]; else S.moods[k] = +i;
    save(); return render();
  }
  if ((el = hit("[data-moodcolor]"))){
    const i = +el.dataset.moodcolor;
    const cyc = ["#7FA86A","#9FC0D4","#E0C070","#C79B84","#9B8195","#C4788B","#6B9F9C","#AE6A92"];
    S.moodLabels[i].c = cyc[(cyc.indexOf(S.moodLabels[i].c) + 1) % cyc.length];
    save(); return render();
  }

  if ((el = hit("[data-bool]"))){
    const k = el.dataset.bool;
    if (S.habitLog[k]) delete S.habitLog[k]; else S.habitLog[k] = true;
    save(); return render();
  }
  if ((el = hit("[data-num]"))){
    const [h, k] = el.dataset.num.split("|");
    return numDialog(h, k);
  }
  if ((el = hit("[data-hedit]")))    return habitDialog(S.habits.find(h => h.id === el.dataset.hedit));
  if ((el = hit("[data-addhabit]"))) return habitDialog(null, el.dataset.addhabit);

  if ((el = hit("[data-step]"))){
    const [gid, i] = el.dataset.step.split(":");
    const g = S.goals.find(x => x.id === gid);
    g.steps[+i].done = !g.steps[+i].done;
    const dn = g.steps.filter(s => s.done).length;
    g.p = Math.round(dn / g.steps.length * 100);
    save(); return render();
  }
  if ((el = hit("[data-goaledit]"))) return goalDialog(S.goals.find(g => g.id === el.dataset.goaledit));
  if (hit("#addGoal"))               return goalDialog(null);

  if ((el = hit("[data-l10]"))){
    const [i, lv] = el.dataset.l10.split(":").map(Number);
    S.level10[i].now = S.level10[i].now === lv ? lv - 1 : lv;
    l10sel = i; save(); return render();
  }
  if ((el = hit("[data-l10row]"))){ l10sel = +el.dataset.l10row; return render(); }
  if ((el = hit("[data-l10step]"))){
    const [f, d] = el.dataset.l10step.split(":");
    S.level10[l10sel][f] = clamp(S.level10[l10sel][f] + (+d), 0, 10);
    save(); return render();
  }

  if ((el = hit("[data-week]"))){
    const [m, i] = el.dataset.week.split(":").map(Number);
    weekIdx[m] = i; return render();
  }

  if ((el = hit("[data-songcount]"))){
    const [mk, c] = el.dataset.songcount.split(":");
    const o = songsOf(mk); o.count = +c;
    while (o.list.length < o.count) o.list.push({t:"", a:"", n:"", h:0});
    save(); return render();
  }
  if ((el = hit("[data-songheart]"))){
    const [mk, i, h] = el.dataset.songheart.split(":").map((v,n) => n ? +v : v);
    const s = songsOf(mk).list[i];
    s.h = s.h === h ? 0 : h;
    save(); return render();
  }
  if ((el = hit("[data-songcov]"))){
    const [mk, i] = el.dataset.songcov.split(":");
    return pickImage(url => { songsOf(mk).list[+i].cov = url; save(); render(); toast("Cover hinzugefügt"); });
  }

  if ((el = hit("[data-vis]"))){
    const id = el.dataset.vis;
    return pickImage(url => {
      S.vision = S.vision.filter(v => v.i !== id);
      S.vision.push({i:id, img:url, cap:""});
      save(); render(); toast("Bild eingeklebt");
    });
  }
  if ((el = hit("[data-visrm]"))){
    S.vision = S.vision.filter(v => String(v.i) !== el.dataset.visrm);
    save(); return render();
  }
  if ((el = hit("[data-photo]"))){
    const k = el.dataset.photo;
    return pickImage(url => { day(k).photo = url; save(); render(); toast("Foto hinzugefügt"); });
  }
  if ((el = hit("[data-photorm]"))){ day(el.dataset.photorm).photo = ""; save(); return render(); }

  if ((el = hit("[data-daysticker]"))){
    const [k, s] = el.dataset.daysticker.split("|");
    day(k).stickers.push(s); save(); return render();
  }
  if ((el = hit("[data-stickrm]"))){
    const [k, i] = el.dataset.stickrm.split(":");
    day(k).stickers.splice(+i, 1); save(); return render();
  }
  if ((el = hit("[data-stickadd]"))){
    const mk = el.dataset.stickadd, id = `mem${mk}_${Date.now() % 1000}`;
    const free = [0,1,2,3].map(i => `mem${+mk.slice(5,7) - 1}_${i}`).find(x => !S.vision.some(v => v.i === x));
    if (!free) return toast("Alle Felder belegt");
    S.vision.push({i:free, emoji:el.textContent.trim(), cap:""});
    save(); return render();
  }

  if ((el = hit("[data-addev]")))    return eventDialog(key(+el.dataset.addev, 1));
  if ((el = hit("[data-addev2]")))   return eventDialog(el.dataset.addev2);
  if ((el = hit("[data-evrm]"))){
    const [k, i] = el.dataset.evrm.split(":");
    evOf(k).splice(+i, 1); save(); return render();
  }

  if ((el = hit("[data-todo]"))){
    const [k, i] = el.dataset.todo.split(":");
    const td = day(k).todos[+i]; td.done = !td.done; save(); return render();
  }
  if ((el = hit("[data-todorm]"))){
    const [k, i] = el.dataset.todorm.split(":");
    day(k).todos.splice(+i, 1); save(); return render();
  }
  if ((el = hit("[data-addtodo]"))){
    day(el.dataset.addtodo).todos.push({t:"", done:false});
    save(); render();
    const inps = $$(`[data-f^="day.${el.dataset.addtodo}.todos"]`);
    inps[inps.length - 1]?.focus();
    return;
  }
  if ((el = hit("[data-energy]"))){
    const [k, v] = el.dataset.energy.split(":");
    const d = day(k); d.energy = d.energy === +v ? null : +v; save(); return render();
  }
  if ((el = hit("[data-bdrm]"))){
    S.birthdays.splice(+el.dataset.bdrm, 1); save(); return render();
  }
  if (hit("#addBd")) return bdDialog();
});

/* Tastatur: blättern mit Pfeiltasten (außer beim Schreiben) */
document.addEventListener("keydown", e => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if ($("#veil").classList.contains("on")) return;
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft")  prev();
});

/* ============================================================
   12 · THEME & START
   ============================================================ */
function toggleTheme(){
  const r = document.documentElement;
  const dark = r.getAttribute("data-theme") === "dark"
    || (!r.getAttribute("data-theme") && matchMedia("(prefers-color-scheme:dark)").matches);
  r.setAttribute("data-theme", dark ? "light" : "dark");
  $("#btnTheme").textContent = dark ? "Nachtlicht" : "Tageslicht";
  try{ localStorage.setItem("bujo2027.theme", r.getAttribute("data-theme")); }catch(e){}
}
try{
  const th = localStorage.getItem("bujo2027.theme");
  if (th) document.documentElement.setAttribute("data-theme", th);
}catch(e){}

let rz;
addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 180); });

/* Wischgesten auf dem Handy */
let tx = 0, ty = 0;
addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
addEventListener("touchend", e => {
  if (!isPhone() || $("#veil").classList.contains("on")) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2){ dx < 0 ? next() : prev(); }
}, {passive:true});

load();
setSync("ok");
render();
$("#btnTheme").textContent =
  document.documentElement.getAttribute("data-theme") === "dark" ? "Tageslicht" : "Nachtlicht";

})();
