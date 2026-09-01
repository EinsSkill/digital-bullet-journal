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

/** Relative Helligkeit einer Hex-Farbe (WCAG). */
function lumOf(hex){
  const v = hex.replace('#','');
  const c = [0,2,4].map(i => parseInt(v.substr(i,2),16)/255)
    .map(x => x <= .03928 ? x/12.92 : Math.pow((x+.055)/1.055, 2.4));
  return .2126*c[0] + .7152*c[1] + .0722*c[2];
}
/** Lesbare Schriftfarbe auf einer Monatsfarbe — hell oder dunkel, je nachdem was trägt. */
// Umschlagpunkt rechnerisch: ab Helligkeit ~0.21 trägt dunkle Schrift besser als weiße.
const fgOn = hex => lumOf(hex) > .21 ? '#241F1A' : '#FFF8EE';

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
   Jedes Motiv ist bewusst gezeichnet: eine kräftigere Außenlinie,
   darin feinere Binnenzeichnung. Alle Motive sind um (0,0)
   zentriert und rund 32 Einheiten groß — dadurch lassen sie sich
   frei skalieren, drehen und kombinieren.
   Konvention je Motiv: { d: Kontur, i: Details, f: Füllfläche }
   ============================================================ */

const ART = {
  /* --- Winter ------------------------------------------------ */
  snowflake:{
    d:`M0-16V16M-13.9-8 13.9 8M13.9-8-13.9 8`,
    i:`M0-11l-4.2-4.2M0-11l4.2-4.2M0 11l-4.2 4.2M0 11l4.2 4.2
       M-9.5-5.5l-5.8-.6M-9.5 5.5l-5.8.6M9.5-5.5l5.8-.6M9.5 5.5l5.8.6
       M0-5.5l-2.6-2.6M0-5.5l2.6-2.6M0 5.5l-2.6 2.6M0 5.5l2.6 2.6`},
  firSprig:{
    d:`M0 16C0 4 1-8 3-17`,
    i:`M.4 10c-5 .4-8-2-9-6.6 4.6-1.6 8.2 0 9.6 4.4M1 2.6c-4.6.4-7.6-1.8-8.6-6 4.4-1.6 7.8 0 9 4
       M2-5c-4.2.4-7-1.6-8-5.4 4-1.4 7.2 0 8.4 3.6M1.2 8c4.8-1.6 8-.4 9.6 3.6-4.2 2.4-7.8 1.6-9.8-1.4
       M1.8.6c4.4-1.6 7.4-.6 9 3-4 2.2-7.2 1.4-9.2-1.2M2.6-6.8c4-1.4 6.8-.6 8.4 2.6-3.6 2.2-6.6 1.4-8.6-1`},
  mug:{
    d:`M-10-6h17c.4 6.6-.4 12-2.4 16.4H-7.6C-9.6 6-10.4.6-10-6Z`,
    i:`M7 -3.4c3.6-.6 5.6.8 5.8 3.6.2 2.8-1.6 4.4-5.2 4.6M-11.6 12.4h20
       M-3.4-9.6c-.4-2.4 1.4-3.2 1.2-5.4M2.6-9.6c-.4-2.4 1.4-3.2 1.2-5.4`,
    f:`M-9.4-5h15.6c.2 5.8-.6 10.6-2.2 14.4H-7C-8.6 5.6-9.4.8-9.4-5Z`},
  starFive:{
    d:`M0-16 4.4-4.6 16.4-3.8 7.2 4.2 10 16 0 9.6-10 16l2.8-11.8-9.2-8 12-.8Z`,
    i:`M0-9.6 2.2-4l5.8.4-4.4 3.8`},
  mitten:{
    d:`M-7-13c5-1.4 9.4-1 12.4 1.2 1 4.8 1 10.4 0 16.8-4.6 1.6-9 1.6-13.2 0-1.6-6-1.4-11.8.8-18Z`,
    i:`M-7.6 8.6c4.2 1.4 8.4 1.4 12.6 0M-6.6-5.4c-3.6-1.6-5.8-1-6.6 1.8-.8 2.8.6 4.8 4.2 6`,
    f:`M-6-11.6c4.2-1 7.8-.6 10.4 1.2.8 4.2.8 9 0 14.4-4 1.4-7.8 1.4-11.4 0-1.4-5.2-1.2-10.4 1-15.6Z`},

  /* --- Frühling ---------------------------------------------- */
  bud:{
    d:`M0 16V-1`,
    i:`M0-1c-5.6 0-9.2-3.4-9.2-8.2 0-3.4 2-6 4.4-6 3 0 4.8 3 4.8 6.6 0-3.6 1.8-6.6 4.8-6.6 2.4 0 4.4 2.6 4.4 6C9.2-4.4 5.6-1 0-1Z
       M0 8c-3.6-1-5.4-3.2-5.8-6.4M0 3.4c3.4-.8 5.2-2.6 5.8-5.4`},
  tulip:{
    d:`M0 16V0`,
    i:`M-7.4-9.4c0-3.4 3.2-6.2 7.4-6.2s7.4 2.8 7.4 6.2c0 5.4-3.2 9.4-7.4 9.4S-7.4-4-7.4-9.4Z
       M-2.6-14.8c-.6 4.8-.6 9.6 0 14.4M2.6-14.8c.6 4.8.6 9.6 0 14.4
       M0 9c-4.4-.8-7-3-8-6.6 4-.6 6.8 1.4 8.4 5.6`,
    f:`M-6-9.2c0-2.8 2.6-5 6-5s6 2.2 6 5c0 4.6-2.6 8-6 8s-6-3.4-6-8Z`},
  birdling:{
    d:`M-9.6 2.2c0-5.4 4.2-9.6 9.6-9.6 4.8 0 8.4 3 9.4 7.2l6.6 2.4-6.6 2.2c-1 4-4.6 6.8-9.4 6.8-5.4 0-9.6-4-9.6-9Z`,
    i:`M-3.6-1.4a1.5 1.5 0 1 0 .1 0M-9.6 1.4c-3.4-.6-5.4-2.2-6-4.8 3.4-.8 5.8.4 7 3.4
       M-2-7.2c-.4-3 .6-5 3-6M-6.6 9.6l-1.6 5M0 11l-1 4.6`},
  umbrella:{
    d:`M-16 0c0-8.4 7.2-15 16-15S16-8.4 16 0Z`,
    i:`M-16 0c2.6-8.4 5.2-13.4 8-15 2.8 1.6 5.4 6.6 8 15M0-15v-2.6
       M0 0v11.6c0 2.6-1.6 4-4 4s-4-1.4-4-3.4`,
    f:`M-14.4 0c0-7.4 6.4-13.4 14.4-13.4S14.4-7.4 14.4 0Z`},
  raincloud:{
    d:`M-13 2.6c-3.6 0-6.4-2.8-6.4-6.4 0-3.4 2.6-6.2 6-6.4.6-4.6 4.4-8 9-8 3.8 0 7 2.4 8.4 5.8 1-.6 2.2-.8 3.4-.8 4 0 7.4 3.2 7.4 7.2 0 4.2-3.4 7.6-7.6 7.6Z`,
    i:`M-8.6 6.4l-2.4 6.4M-1 6.4l-2.4 6.4M6.6 6.4l-2.4 6.4`,
    f:`M-12.4 1.4c-2.8 0-5-2.2-5-5s2.2-5 5-5.2c.6-3.8 3.8-6.6 7.6-6.6 3.2 0 6 2 7.2 4.8.8-.4 1.8-.6 2.8-.6 3.4 0 6.2 2.8 6.2 6.2S8.6 1.4 5.2 1.4Z`},

  /* --- Sommer ------------------------------------------------ */
  sunFace:{
    d:`M0-9.4A9.4 9.4 0 1 1 0 9.4 9.4 9.4 0 1 1 0-9.4Z`,
    i:`M0-16.4v4.4M0 12v4.4M-16.4 0h4.4M12 0h4.4
       M-11.6-11.6l3.2 3.2M8.4 8.4l3.2 3.2M11.6-11.6l-3.2 3.2M-8.4 8.4l-3.2 3.2
       M-3.4-1.6a1 1 0 1 0 .1 0M3.4-1.6a1 1 0 1 0 .1 0M-3 3c1.8 1.8 4.2 1.8 6 0`,
    f:`M0-8A8 8 0 1 1 0 8 8 8 0 1 1 0-8Z`},
  lemon:{
    d:`M-13-4.6C-9.6-11-4.4-14 2-14c7.4 0 12.6 4.4 12.6 10.6 0 6.8-5.6 11.8-13.4 11.8-8 0-13.8-4-13.8-9.6 0-.9.2-2 .6-3.4Z`,
    i:`M12.6-8.6c2.2-1.4 3.6-3.2 4-5.4M-4 0c3.6-2.4 7.6-3 12-1.8M-2.4 5c3-2 6.4-2.6 10-1.6`,
    f:`M-11.4-4.4C-8.4-10-3.8-12.6 2-12.6c6.6 0 11.2 3.8 11.2 9.2 0 6-5 10.4-11.8 10.4-7 0-12.2-3.4-12.2-8.4 0-.8.2-1.8.6-3Z`},
  butterfly:{
    d:`M0-8c-2.6-4.4-6.4-6.6-10.4-5.8-4 .8-6 4-5.2 8 .8 4 4 6.4 8.4 6.6-3.6 1.6-5.4 4.2-4.8 7.4.6 3 3.2 4.6 6.4 4 3.2-.6 5.2-3.2 5.6-7.2
       M0-8c2.6-4.4 6.4-6.6 10.4-5.8 4 .8 6 4 5.2 8-.8 4-4 6.4-8.4 6.6 3.6 1.6 5.4 4.2 4.8 7.4-.6 3-3.2 4.6-6.4 4-3.2-.6-5.2-3.2-5.6-7.2Z`,
    i:`M0-8v18M0-9.6c-.6-2.6-1.8-4.2-3.6-5M0-9.6c.6-2.6 1.8-4.2 3.6-5
       M-8-6.6c-1.6 1.4-2.2 3-1.8 4.8M8-6.6c1.6 1.4 2.2 3 1.8 4.8`},
  shell:{
    d:`M0 12C-9.6 12-15 4.4-15-3.4c0-6.6 6.4-12.2 15-12.2S15-10 15-3.4C15 4.4 9.6 12 0 12Z`,
    i:`M0 12V-15M-7 10.6C-8.6.4-7-8-3.8-13.6M7 10.6C8.6.4 7-8 3.8-13.6
       M-12.4 4.2C-11.4-3.6-9-9.6-5.4-13M12.4 4.2C11.4-3.6 9-9.6 5.4-13`},
  iceCream:{
    d:`M-8-4 0 16l8-20Z`,
    i:`M-5.6 1.4 3 4.6M-3.6 6 2 8M-8-4c0-5 3.6-8.6 8-8.6s8 3.6 8 8.6
       M-4.6-6.6c0-3.4 2-5.6 4.6-5.6M0-12.6c-.4-2.4.8-3.8 3-4`,
    f:`M-7.6-4.6c0-4.6 3.4-8 7.6-8s7.6 3.4 7.6 8Z`},
  daisy:{
    d:`M0 16V4`,
    i:`M0 4c-2 0-3.6-1.6-3.6-3.6S-2-3.2 0-3.2s3.6 1.6 3.6 3.6S2 4 0 4Z
       M0-3.4c-1.6-4.4-.8-7.6 2.4-9.2 2.6 3 2.4 6.4-.4 9.2M3.6 0c4.4-1.8 7.6-1 9.2 2.2-3 2.6-6.4 2.4-9.2-.4
       M0 3.4c1.6 4.4.8 7.6-2.4 9.2-2.6-3-2.4-6.4.4-9.2M-3.6 0c-4.4 1.8-7.6 1-9.2-2.2 3-2.6 6.4-2.4 9.2.4
       M0 12c-3.4-1-5.2-3-5.8-6`},
  wave:{
    d:`M-16-2c4.4-5.6 8.8-5.6 13.2 0S6-2 10.4-7.6c2.2-2.8 4-3.4 5.6-1.8`,
    i:`M-16 6c4.4-5.6 8.8-5.6 13.2 0S6 6 10.4.4c2.2-2.8 4-3.4 5.6-1.8
       M-16 14c4.4-5.6 8.8-5.6 13.2 0S6 14 10.4 8.4c2.2-2.8 4-3.4 5.6-1.8`},

  /* --- Herbst ------------------------------------------------ */
  leafOak:{
    d:`M0 16V-2`,
    i:`M0-2c-5.6-1-8.6-4-9-9 4.6-1.6 8 0 10 4.8-2.4-4.8-2-8.6 1-11.4 3.2 2.6 3.8 6.4 1.6 11.4 2.2-4.8 5.6-6.4 10-4.6-.4 5-3.4 8-9 9
       M0 8c-3.2-.8-5-2.6-5.4-5.4`},
  // Fünf breite Lappen mit weichen Buchten — gleichmäßige Zacken hätten
  // aus dem Blatt einen Stern gemacht.
  leafMaple:{
    d:`M0 16V2.5`,
    i:`M0 2.5Q-2.2.6-5.8 1.6Q-4.6-1.4-5.6-2.9Q-9.2-2.3-11.4-1.8Q-8.8-5.1-7.2-7.7
       Q-8.7-9.2-9.2-11.3Q-6.1-10.2-3.4-9.7Q-1.9-12.7 0-15.8Q1.9-12.7 3.4-9.7
       Q6.1-10.2 9.2-11.3Q8.7-9.2 7.2-7.7Q8.8-5.1 11.4-1.8Q9.2-2.3 5.6-2.9
       Q4.6-1.4 5.8 1.6Q2.2.6 0 2.5Z
       M0 1.2V-9M0-6.4-4.6-9.2M0-6.4 4.6-9.2M0-2.2-6.2-4.4M0-2.2 6.2-4.4`,
    f:`M0 2.2Q-2 .5-5.2 1.4Q-4.2-1.2-5-2.6Q-8.3-2-10.3-1.6Q-8-4.6-6.5-7
       Q-7.8-8.3-8.3-10.2Q-5.5-9.2-3.1-8.7Q-1.7-11.4 0-14.2Q1.7-11.4 3.1-8.7
       Q5.5-9.2 8.3-10.2Q7.8-8.3 6.5-7Q8-4.6 10.3-1.6Q8.3-2 5-2.6
       Q4.2-1.2 5.2 1.4Q2 .5 0 2.2Z`},
  acorn:{
    d:`M-8-2c0 8.6 3.6 16.4 8 16.4S8 6.6 8-2Z`,
    i:`M-10.4-2c0-4.4 4.6-8 10.4-8s10.4 3.6 10.4 8ZM0-10v-5.6
       M-7-4.6c4.6-1 9.4-1 14 0M-5.6-8.2c3.6-.8 7.6-.8 11.2 0`,
    f:`M-7-1c0 7.4 3.2 14 7 14s7-6.6 7-14Z`},
  pumpkin:{
    d:`M0-8c-7.8 0-13.4 4.4-13.4 10.6S-7.8 14 0 14s13.4-5.2 13.4-11.4S7.8-8 0-8Z`,
    i:`M-5.6-6.8c-3.2 4-3.2 13.4 0 19M5.6-6.8c3.2 4 3.2 13.4 0 19M0-7.4v20.8
       M0-8v-5.4c0-2.6 2.8-4 5.6-3.2`,
    f:`M0-6.6c-6.6 0-11.4 3.8-11.4 9.2S-6.6 12.6 0 12.6s11.4-4.6 11.4-10S6.6-6.6 0-6.6Z`},
  book:{
    d:`M-14-10.4c4.6-2 9.2-2 14 0 4.8-2 9.4-2 14 0v18.8c-4.6-2-9.2-2-14 0-4.8-2-9.4-2-14 0Z`,
    i:`M0-10.4V8.4M-10.6-6.2c2.6-1 5.2-1.2 8-.6M-10.6-1.4c2.6-1 5.2-1.2 8-.6
       M2.6-6.8c2.8-.6 5.4-.4 8 .6M2.6-2c2.8-.6 5.4-.4 8 .6`},
  candle:{
    d:`M-6 0h12v13.4c0 1.6-1.2 2.6-6 2.6s-6-1-6-2.6Z`,
    i:`M0 0c-4-4.6 0-8.4 0-11.6 0 3.2 4 7 0 11.6ZM0-11.6v-3.4M-6 4.4h12`,
    f:`M-4.8 1.2h9.6v12.2c0 1.2-1 2-4.8 2s-4.8-.8-4.8-2Z`},
  coffee:{
    d:`M-9.6-2h16.4c.4 6.4-.6 11.4-3 15H-6.6c-2.4-3.6-3.4-8.6-3-15Z`,
    i:`M6.8.6c3.4-.6 5.2.6 5.4 3.2.2 2.6-1.4 4.2-5 4.4
       M-3.4-5.6c-1.4-2.6.6-4 .2-6.6M2.6-5.6c-1.4-2.6.6-4 .2-6.6`,
    f:`M-8.4-.8h14c.4 5.6-.4 10-2.6 13.2H-5.8c-2.2-3.2-3-7.6-2.6-13.2Z`},

  /* --- Spätherbst & Winter ----------------------------------- */
  teabag:{
    d:`M-7 0h14v13.4h-14Z`,
    i:`M0 0v-6.4c0-3.6-2.6-5.6-6.6-6.2M-6.6-13.6a1.8 1.8 0 1 0 .1 0
       M-4.4 4.6h8.8M-4.4 8.4h6`,
    f:`M-5.8 1.2h11.6v11h-11.6Z`},
  blanket:{
    d:`M-15-6c5-2.6 10-2.6 15 0 5-2.6 10-2.6 15 0v9c-5 2.6-10 2.6-15 0-5 2.6-10 2.6-15 0Z`,
    i:`M-15-1.4c5-2.6 10-2.6 15 0 5-2.6 10-2.6 15 0M-8-4.4v9M0-6v9M8-4.4v9
       M-15 3c-.4 2.6-.4 4.6 0 6M15 3c.4 2.6.4 4.6 0 6`},
  bow:{
    d:`M0 0c-3.6-5-7.4-7-11.4-6-3.4.8-4.8 3.6-3.6 6.8 1.2 3.2 5.2 4.6 11 3.8
       M0 0c3.6-5 7.4-7 11.4-6 3.4.8 4.8 3.6 3.6 6.8-1.2 3.2-5.2 4.6-11 3.8Z`,
    i:`M0 0a2.6 2.6 0 1 0 .1 0M-1.6 2.6-5.6 14M1.6 2.6 5.6 14
       M-9.6-3.2c-1.6.6-2.2 1.8-1.8 3.4M9.6-3.2c1.6.6 2.2 1.8 1.8 3.4`},
  ornament:{
    d:`M0-6A11 11 0 1 1 0 16 11 11 0 1 1 0-6Z`,
    i:`M-3.4-7.6h6.8v-3.4h-6.8ZM0-11v-3.4c0-1.4 1.4-2 3-1.4
       M-9.6 1c5-2.6 9.6-2.6 14.4 0M-10.4 6.4c6-2.6 11.6-2.6 17 0`,
    f:`M0-4.6A9.6 9.6 0 1 1 0 14.6 9.6 9.6 0 1 1 0-4.6Z`},
  pineBranch:{
    d:`M-15 6C-6 3 4 0 15-6`,
    i:`M-10.6 4.4c-1.4-3.6-.6-6.4 2.4-8.4 2 3 1.8 5.8-.6 8.4M-4.6 2.4c-1.4-3.6-.6-6.4 2.4-8.4 2 3 1.8 5.8-.6 8.4
       M1.4.2c-1.4-3.6-.6-6.4 2.4-8.4 2 3 1.8 5.8-.6 8.4M7.4-2.2c-1.4-3.6-.6-6.4 2.4-8.4 2 3 1.8 5.8-.6 8.4
       M-8.6 5.4c1.4 3.4.8 6-1.8 7.8-1.8-2.8-1.6-5.4.4-7.8M-1.6 3c1.4 3.4.8 6-1.8 7.8-1.8-2.8-1.6-5.4.4-7.8
       M4.4.6c1.4 3.4.8 6-1.8 7.8-1.8-2.8-1.6-5.4.4-7.8`},

  /* --- Universell -------------------------------------------- */
  heart:{
    d:`M0 14.6C-10.6 7.4-15 2-15-3.6-15-8.4-11.4-12-6.8-12-4 -12-1.4-10.4 0-8c1.4-2.4 4-4 6.8-4C11.4-12 15-8.4 15-3.6 15 2 10.6 7.4 0 14.6Z`,
    i:`M-9.6-7.4c-1.6.8-2.4 2.2-2.4 4.2`,
    f:`M0 12.6C-9.4 6-13.4 1.2-13.4-3.6c0-4 3-7 7-7 2.4 0 4.8 1.4 6.4 3.6 1.6-2.2 4-3.6 6.4-3.6 4 0 7 3 7 7 0 4.8-4 9.6-13.4 16.2Z`},
  moonSlim:{
    d:`M5-13.6A14 14 0 1 0 5 13.6 17 17 0 0 1 5-13.6Z`,
    i:`M-2.4-6.6a1.4 1.4 0 1 0 .1 0M-5.4 2a1.2 1.2 0 1 0 .1 0`,
    f:`M4.4-11.6A12 12 0 1 0 4.4 11.6 14.6 14.6 0 0 1 4.4-11.6Z`},
  sparkle:{
    d:`M0-14c1.4 8.2 4.4 12.6 12 14-7.6 1.4-10.6 5.8-12 14-1.4-8.2-4.4-12.6-12-14 7.6-1.4 10.6-5.8 12-14Z`,
    i:``,
    f:`M0-12c1.2 7 3.8 10.8 10.2 12C3.8 1.2 1.2 5 0 12c-1.2-7-3.8-10.8-10.2-12C-3.8-1.2-1.2-5 0-12Z`}
};

/** Ein Motiv als SVG. `fill` füllt die Fläche (Moodtracker), sonst nur Kontur. */
function motif(name, opt = {}){
  const a = ART[name];
  if (!a) return "";
  const w = opt.w ?? 1;
  return `<svg viewBox="-20 -20 40 40" fill="none" stroke="${opt.stroke || "currentColor"}"
    stroke-width="${1.55 * w}" stroke-linecap="round" stroke-linejoin="round"
    ${opt.cls ? `class="${opt.cls}"` : ""} ${opt.filter === false ? "" : `filter="url(#ink)"`}>
    ${opt.fill && a.f ? `<path class="fillp" d="${a.f}" fill="${opt.fill}" fill-opacity="${opt.fo ?? .9}" stroke="none"/>` : ""}
    ${opt.fill && !a.f ? `<circle class="fillp" r="6.4" fill="${opt.fill}" fill-opacity=".55" stroke="none"/>` : ""}
    <path d="${a.d}" stroke-width="${1.85 * w}"/>
    ${a.i ? `<path d="${a.i}" stroke-width="${1.15 * w}" stroke-opacity=".88"/>` : ""}
  </svg>`;
}

/* ============================================================
   MONATSKAPITEL
   Fünf Kompositionsfamilien geben dem Buch seinen Rhythmus.
   Innerhalb einer Familie ist jeder Monat einzeln gesetzt:
   die Punktlisten unten sind von Hand gelegt, nicht gerechnet.

   fam    Grundhaltung der Seite
   cover  Komposition des Monatsdeckblatts   [motiv, x%, y%, größe, drehung]
   rand   sehr sparsame Deko für Innenseiten
   ecke   ein einzelnes Motiv für Textseiten
   ============================================================ */

/* Die fünf Familien steuern über eine Klasse am Seitencontainer, wie viel
   Luft eine Seite bekommt, wie groß der Titel steht und wie präsent die
   Deko sein darf — siehe Abschnitt KAPITELFAMILIEN in styles.css:

     still  Jan, Feb   klar und leer, großer Titel, Deko nur oben und unten
     ranke  Mär–Mai    organisch aufsteigend, Deko wächst von unten links
     offen  Jun–Aug    luftig, Mitte bewusst frei, Deko am Rand
     dicht  Sep–Nov    warm geschichtet, enger gesetzt, mehr Ebenen
     fest   Dez        gefasst und feierlich, symmetrischer Aufbau         */

const THEME = [
  /* --- Januar · still ------------------------------------- */
  { mood:"snowflake", layout:"drift", thema:"Stille", fam:"still", ecke:"firSprig",
    cover:[["firSprig",17,70,1.5,-13],["moonSlim",83,25,1.15,0],["starFive",73,13,.42,0],
           ["snowflake",26,24,.62,0],["starFive",30,15,.3,0]],
    rand:[["snowflake",90,12,.5,0],["firSprig",8,86,.7,-10]] },

  /* --- Februar · still ------------------------------------ */
  { mood:"heart", layout:"rows", thema:"Wärme", fam:"still", ecke:"bow",
    cover:[["bow",78,72,1.25,7],["heart",22,26,.8,-11],["daisy",84,22,.62,14],
           ["heart",29,80,.5,9],["sparkle",70,13,.34,0]],
    rand:[["heart",91,14,.45,-8],["bow",9,88,.6,5]] },

  /* --- März · ranke --------------------------------------- */
  { mood:"bud", layout:"rows", thema:"Anfang", fam:"ranke", ecke:"bud",
    cover:[["bud",13,84,1.35,-4],["bud",19,68,1.05,7],["tulip",27,54,.85,-9],
           ["birdling",79,27,1.05,0],["bud",34,41,.6,12],["sparkle",71,16,.32,0]],
    rand:[["bud",7,90,.7,-6]] },

  /* --- April · ranke -------------------------------------- */
  { mood:"raincloud", layout:"drift", thema:"Geduld", fam:"ranke", ecke:"umbrella",
    cover:[["umbrella",80,24,1.3,7],["raincloud",21,19,.95,0],["tulip",12,83,1.2,-7],
           ["bud",21,70,.85,10],["birdling",73,80,.7,0],["tulip",30,57,.55,-14]],
    rand:[["raincloud",90,13,.5,0]] },

  /* --- Mai · ranke ---------------------------------------- */
  { mood:"daisy", layout:"scatter", thema:"Aufblühen", fam:"ranke", ecke:"daisy",
    cover:[["daisy",14,80,1.4,-12],["daisy",22,64,1,9],["butterfly",78,24,1.1,13],
           ["tulip",30,49,.7,-6],["daisy",86,76,.75,7],["butterfly",36,36,.45,-18]],
    rand:[["daisy",92,15,.5,10]] },

  /* --- Juni · offen --------------------------------------- */
  { mood:"sunFace", layout:"arc", thema:"Leichtigkeit", fam:"offen", ecke:"lemon",
    cover:[["sunFace",84,19,1.3,0],["lemon",13,79,1.2,-11],["daisy",90,79,.62,8],
           ["lemon",8,60,.5,15]],
    rand:[["sunFace",92,11,.45,0]] },

  /* --- Juli · offen --------------------------------------- */
  { mood:"wave", layout:"tide", thema:"Freiheit", fam:"offen", ecke:"shell",
    cover:[["sunFace",17,20,1.05,0],["shell",85,79,1.2,-9],["wave",50,93,1.5,0],
           ["iceCream",88,22,.85,7]],
    rand:[["wave",50,95,1.1,0]] },

  /* --- August · offen ------------------------------------- */
  { mood:"lemon", layout:"scatter", thema:"Fülle", fam:"offen", ecke:"leafOak",
    cover:[["lemon",15,23,1.25,-7],["leafOak",84,25,1.1,15],["daisy",19,80,.8,-5],
           ["shell",87,78,.7,11]],
    rand:[["leafOak",91,14,.5,18]] },

  /* --- September · dicht ---------------------------------- */
  { mood:"leafOak", layout:"rows", thema:"Sammeln", fam:"dicht", ecke:"book",
    cover:[["book",79,76,1.25,-5],["leafOak",15,22,1.15,-17],["coffee",16,76,1,5],
           ["acorn",70,86,.7,-9],["leafOak",86,20,.85,21],["acorn",25,88,.5,13]],
    rand:[["leafOak",92,13,.5,-14],["acorn",7,89,.55,10]] },

  /* --- Oktober · dicht ------------------------------------ */
  { mood:"leafMaple", layout:"scatter", thema:"Gemütlich", fam:"dicht", ecke:"pumpkin",
    cover:[["pumpkin",81,75,1.2,-5],["leafMaple",15,21,1.2,11],["leafMaple",24,81,.95,-21],
           ["candle",85,21,.95,0],["acorn",70,87,.65,9],["leafMaple",90,50,.5,-13],
           ["acorn",9,62,.45,17]],
    rand:[["leafMaple",92,14,.55,12],["acorn",8,88,.5,-8]] },

  /* --- November · dicht ----------------------------------- */
  { mood:"teabag", layout:"hang", thema:"Ruhe", fam:"dicht", ecke:"mug",
    cover:[["mug",80,77,1.3,-4],["raincloud",19,18,1.05,0],["blanket",16,81,1.1,3],
           ["candle",86,20,.9,0],["teabag",70,88,.6,7],["leafMaple",27,87,.5,-15]],
    rand:[["mug",91,14,.55,-5],["teabag",8,88,.5,6]] },

  /* --- Dezember · fest ------------------------------------ */
  { mood:"starFive", layout:"drift", thema:"Licht", fam:"fest", ecke:"pineBranch",
    cover:[["pineBranch",17,76,1.4,-7],["pineBranch",83,76,1.4,7],["ornament",84,22,1.1,4],
           ["starFive",24,20,.62,0],["candle",50,88,.85,0],["starFive",68,12,.36,0],
           ["bow",34,86,.5,-8]],
    rand:[["starFive",91,12,.45,0],["pineBranch",8,88,.6,-8]] }
];

/* --- Kompositionen ------------------------------------------ */

/** Eine von Hand gelegte Motivgruppe. Keine Rechnung, nur Platzierung. */
function group(punkte, opt = {}){
  const base = opt.size ?? 78;
  return `<div class="scene" aria-hidden="true" style="opacity:${opt.op ?? .42}">
    ${punkte.map(([n, x, y, sc, rot]) => `
      <span class="deco" style="left:${x}%;top:${y}%;width:${Math.round(base * sc)}px;
        transform:translate(-50%,-50%) rotate(${rot}deg)">${motif(n, {w:.9})}</span>`).join("")}
  </div>`;
}

/** Deckblatt-Komposition eines Monats. */
const coverArt = m => group(THEME[m].cover, {op:.46, size:86});

/** Sehr sparsame Deko für Innenseiten — nie hinter Eingabefeldern. */
const edgeArt = m => group(THEME[m].rand, {op:.2, size:70});

/** Einzelnes Eckmotiv für Textseiten. */
const cornerArt = m => `<span class="page-corner">${motif(THEME[m].ecke, {w:.85})}</span>`;



/** Girlande für die beiden Buchdeckel.
    Winkel, Motiv, Größe und Drehung stehen einzeln in der Liste — dadurch
    entsteht keine sichtbare Wiederholung wie bei einer Modulo-Verteilung. */
function garland(punkte, opt = {}){
  const r = opt.r ?? 47;
  const teile = punkte.map(([nm, deg, sc, rot]) => {
    const a = (deg - 90) * Math.PI / 180;
    const x = (Math.cos(a) * r).toFixed(1), y = (Math.sin(a) * r).toFixed(1);
    return `<g transform="translate(${x} ${y}) rotate(${deg + (rot || 0)}) scale(${sc})">
      <path d="${ART[nm].d}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
      ${ART[nm].i ? `<path d="${ART[nm].i}" stroke-width="1" stroke-opacity=".75"
        vector-effect="non-scaling-stroke"/>` : ""}
    </g>`;
  }).join("");
  return `<svg viewBox="-58 -58 116 116" fill="none" stroke="currentColor"
    stroke-linecap="round" stroke-linejoin="round" filter="url(#ink)" aria-hidden="true">${teile}</svg>`;
}

/* Beide Girlanden sind von Hand gelegt: die Abstände sind bewusst ungleich,
   unten dichter als oben, und die Lücke oben lässt den Titel frei atmen. */
const KRANZ_START = [
  ["daisy",34,.34,-8],["leafOak",52,.28,12],["bud",68,.3,-4],["daisy",86,.36,6],
  ["leafMaple",104,.3,-14],["sparkle",118,.2,0],["leafOak",132,.32,8],["daisy",148,.3,-6],
  ["bud",163,.26,10],["leafMaple",178,.34,0],["daisy",193,.28,-9],["leafOak",208,.31,14],
  ["sparkle",222,.19,0],["bud",236,.29,-5],["daisy",252,.33,7],["leafMaple",270,.28,-12],
  ["leafOak",290,.3,4],["daisy",310,.26,-7],["sparkle",326,.18,0]
];
const KRANZ_ENDE = [
  ["pineBranch",36,.32,-10],["starFive",54,.22,0],["ornament",72,.3,6],["pineBranch",92,.34,-6],
  ["sparkle",108,.19,0],["starFive",124,.24,0],["pineBranch",142,.31,9],["ornament",160,.28,-5],
  ["starFive",176,.21,0],["pineBranch",196,.33,7],["sparkle",212,.18,0],["ornament",228,.29,-8],
  ["pineBranch",248,.32,5],["starFive",266,.23,0],["pineBranch",288,.3,-9],["ornament",308,.27,4],
  ["sparkle",324,.18,0]
];

/* --- Gezeichnete Linien & Rahmen ----------------------------- */

/** Zierstrich unter einer Überschrift — leicht ungleichmäßig geführt. */
const RULE = `<svg class="stroke" viewBox="0 0 300 10" fill="none" stroke="currentColor"
  stroke-linecap="round" preserveAspectRatio="none" filter="url(#ink)" aria-hidden="true">
  <path d="M3 6.2c48-3.8 96-4.6 144-2.6 46 1.8 92 2.4 150-.8" stroke-width="2.4"/>
  <path d="M8 8.6c44-2.4 88-3 132-1.6" stroke-width="1" stroke-opacity=".45"/></svg>`;

/** Doppelter Papierrahmen fürs Deckblatt. */
const FRAME = `<svg class="frame" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none"
  stroke="currentColor" filter="url(#ink)" vector-effect="non-scaling-stroke" aria-hidden="true">
  <path d="M2.2 2.4h95.6v95.2H2.2Z" stroke-width=".45"/>
  <path d="M3.6 4h92.8v92" stroke-width=".2"/>
  <path d="M3.6 4v92h92.8" stroke-width=".2"/></svg>`;

/** Handgezogene Trennlinie zwischen zwei Bereichen. */
const DIV = `<svg class="divider" viewBox="0 0 200 6" fill="none" stroke="currentColor"
  stroke-width="1.4" stroke-linecap="round" preserveAspectRatio="none" filter="url(#ink)" aria-hidden="true">
  <path d="M2 3.4c32-2 64-2.4 96-1.2 30 1.2 60 1.6 100-.4"/></svg>`;

/* --- Kleine UI-Zeichen --------------------------------------- */
const ic = (p, o = {}) => `<svg viewBox="0 0 24 24" width="${o.s || 16}" height="${o.s || 16}"
  fill="none" stroke="currentColor" stroke-width="${o.w || 1.9}" stroke-linecap="round"
  stroke-linejoin="round" ${o.f === false ? "" : 'filter="url(#ink)"'} aria-hidden="true">${p}</svg>`;

const CHECK_SVG = ic(`<path d="M4 12.8c2.2 1.4 3.8 3 4.8 5C11.4 12.4 15 7.8 20 4.6"/>`, {w:2.7, s:24});
const X_SVG     = ic(`<path d="M6.4 6.2 17.6 17.8M17.6 6.2 6.4 17.8"/>`, {w:2.2, s:12});
const PEN_SVG   = ic(`<path d="M4 20.2c.6-2 1-3.4 1.2-4.2L17 4.4c1-1 2.4-1 3.4 0s1 2.4 0 3.4L8.6 19.4c-.8.2-2.2.6-4.6.8Z"/><path d="m15.4 6.6 3 3" stroke-width="1.2"/>`, {s:13});
const CAM_SVG   = ic(`<path d="M3.2 8.8c3-.4 4.4-.4 4.6-.6.4-.4 1-1.4 1.6-2.2h5.2c.6.8 1.2 1.8 1.6 2.2.2.2 1.6.2 4.6.6.4 3.6.4 7.2 0 10.8-6.2.6-11.4.6-17.6 0-.4-3.6-.4-7.2 0-10.8Z"/><path d="M12 10.2c2 0 3.6 1.6 3.6 3.6S14 17.4 12 17.4s-3.6-1.6-3.6-3.6S10 10.2 12 10.2Z" stroke-width="1.3"/>`, {s:22, w:1.6});
const NOTE_SVG  = ic(`<path d="M9.4 17.6V5.2l9.6-1.8v12"/><path d="M9.4 8.4 19 6.6" stroke-width="1.2"/><path d="M9.4 17.6c0 1.4-1.4 2.4-3.2 2.4S3 19 3 17.6s1.4-2.4 3.2-2.4 3.2 1 3.2 2.4ZM19 15.2c0 1.4-1.4 2.4-3.2 2.4s-3.2-1-3.2-2.4 1.4-2.4 3.2-2.4 3.2 1 3.2 2.4Z"/>`, {s:20, w:1.6});
const PLUS_SVG  = ic(`<path d="M12 5.2v13.6M5.2 12h13.6"/>`, {w:2.1});
const ARROW_SVG = ic(`<path d="M4 12.2c5.6-.4 11-.4 16 0M14.4 7.2c1.8 2 3.6 3.6 5.6 5-2 1.4-3.8 3-5.6 5"/>`, {w:1.8});

/** Herz für die Song-Bewertung — gefüllt oder offen. */
const HEART_SVG = `<svg viewBox="-16 -16 32 32" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linejoin="round" filter="url(#ink)" aria-hidden="true">
  <path class="hf" d="${ART.heart.f}" fill="currentColor" stroke="none"/>
  <path d="${ART.heart.d}"/></svg>`;

/* --- Aufkleber ----------------------------------------------
   Gezeichnet statt Emoji: jeder Sticker ist ein Motiv mit
   eigener Farbe, das sich ins Papier einfügt.
   ------------------------------------------------------------ */
const STICKERS = [
  {id:"heart",     n:"Herz",         c:"#C4788B"},
  {id:"starFive",  n:"Stern",        c:"#CF9A3C"},
  {id:"daisy",     n:"Blume",        c:"#AE6A92"},
  {id:"leafOak",   n:"Blatt",        c:"#8A8455"},
  {id:"mug",       n:"Tasse",        c:"#7A5C52"},
  {id:"sparkle",   n:"Funkeln",      c:"#CF9A3C"},
  {id:"butterfly", n:"Schmetterling",c:"#6B9F9C"},
  {id:"moonSlim",  n:"Mond",         c:"#7C9BB5"},
  {id:"snowflake", n:"Schneeflocke", c:"#7C9BB5"},
  {id:"lemon",     n:"Zitrone",      c:"#CF9A3C"},
  {id:"pumpkin",   n:"Kürbis",       c:"#B25A2E"},
  {id:"bow",       n:"Schleife",     c:"#C4788B"},
  {id:"shell",     n:"Muschel",      c:"#3D9698"},
  {id:"candle",    n:"Kerze",        c:"#B25A2E"},
  {id:"book",      n:"Buch",         c:"#4E6B55"},
  {id:"teabag",    n:"Teebeutel",    c:"#7A5C52"},
  {id:"birdling",  n:"Vogel",        c:"#6B9F9C"},
  {id:"pineBranch",n:"Tannenzweig",  c:"#4E6B55"}
];

/** Ein Aufkleber, wie er auf der Seite klebt. */
function sticker(id, opt = {}){
  const s = STICKERS.find(x => x.id === id) || STICKERS[0];
  return `<span class="stickr" style="--sc:${s.c};${opt.style || ""}"
    title="${esc(s.n)}">${motif(s.id, {w:1.05})}</span>`;
}

/** Die zur Jahreszeit passenden Aufkleber zuerst. */
function stickersFor(m){
  const t = THEME[m];
  const nah = new Set([t.mood, t.ecke, ...t.cover.map(d => d[0])]);
  return [...STICKERS].sort((a, b) => (nah.has(b.id) ? 1 : 0) - (nah.has(a.id) ? 1 : 0));
}


/* ============================================================
   6 · SEITEN — JAHRESTEIL
   Jede Seite gibt HTML zurück. Alle Eingabefelder tragen
   data-f="<pfad>" und werden zentral verdrahtet (§9).
   ============================================================ */

const head = (title, sub) => `
  <div class="title-row">
    <h2 class="page-title">${esc(title)}</h2>
  </div>
  ${RULE}
  ${sub ? `<p class="page-sub">${esc(sub)}</p>` : ""}`;

/* --- Deckblatt ---------------------------------------------- */
function pgCover(){
  return `<div class="cover" style="--accent:#7E7A4E">
    ${FRAME}
    <div class="cover-wreath">${garland(KRANZ_START, {r:46})}</div>
    <div class="cover-inner">
      <p class="kicker">Ein Buch für dich</p>
      <div class="yr">2027</div>
      <p class="for">Für</p>
      <div class="who"><input class="w plain" data-f="meta.name" value="${esc(S.meta.name)}" aria-label="Name"></div>
      <div class="motto"><input class="w" data-f="meta.motto" value="${esc(S.meta.motto)}"
        aria-label="Motto des Jahres"></div>
      <div class="ded"><textarea class="w" data-f="meta.dedication" rows="3"
        aria-label="Widmung">${esc(S.meta.dedication)}</textarea></div>
      <div class="open"><button class="btn big" id="openBook">Buch aufschlagen ${ARROW_SVG}</button></div>
    </div>
    <span class="cover-corner tl">${motif("firSprig", {w:.85})}</span>
    <span class="cover-corner br">${motif("daisy", {w:.85})}</span>
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
    ["Vorsätze & Ziele",      "#AE6A92", "s:3", "6"],
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
        style="font-size:24px;font-family:var(--f-display);color:#AE6A92">
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
/** Kleine, aber feste Unregelmäßigkeit — dieselbe Stelle wackelt immer gleich,
    damit das Rad beim Neuzeichnen nicht zappelt. */
function wobble(i, lv, amp = 2.6){
  const h = Math.sin(i * 12.9898 + lv * 78.233) * 43758.5453;
  return (h - Math.floor(h) - .5) * amp;
}

function wheelSVG(){
  const N = S.level10.length, R = 128, step = 360 / N;
  // Jeder Radius bekommt seinen eigenen kleinen Versatz: keine perfekten Kreise.
  const pol = (r, a, i, lv) => {
    const rr = r + wobble(i, lv);
    const ar = (a - 90) * Math.PI / 180;
    return [rr * Math.cos(ar), rr * Math.sin(ar)];
  };
  let segs = "", spokes = "", labels = "";

  for (let i = 0; i < N; i++){
    const a0 = i * step, a1 = a0 + step, c = PALETTE[i % PALETTE.length];
    for (let lv = 1; lv <= 10; lv++){
      const r0 = R * (lv - 1) / 10, r1 = R * lv / 10;
      const [x0,y0] = pol(r0,a0,i,lv),   [x1,y1] = pol(r1,a0,i,lv+1);
      const [x2,y2] = pol(r1,a1,i+1,lv), [x3,y3] = pol(r0,a1,i+1,lv-1);
      const on = S.level10[i].now >= lv;
      const ziel = S.level10[i].goal === lv;
      // Bogen leicht überzogen (sweep über die Ecke hinaus wirkt wie Buntstift)
      segs += `<path class="seg" data-l10="${i}:${lv}"
        d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}
           A${r1.toFixed(1)} ${(r1+wobble(i,lv,1.6)).toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}
           L${x3.toFixed(1)} ${y3.toFixed(1)}
           A${r0.toFixed(1)} ${(r0+wobble(i,lv,1.2)).toFixed(1)} 0 0 0 ${x0.toFixed(1)} ${y0.toFixed(1)}Z"
        fill="${on ? c : "transparent"}" fill-opacity="${on ? (0.3 + lv * 0.05) : 0}"
        stroke="${ziel ? c : "currentColor"}" stroke-width="${ziel ? 1.7 : .55}"
        stroke-opacity="${ziel ? .95 : .26}"
        stroke-dasharray="${ziel && !on ? "4 3" : "none"}"
        stroke-linejoin="round"><title>${esc(S.level10[i].t)} – Stufe ${lv}</title></path>`;
    }
    // Speiche als leicht krumme Handlinie statt gerader Achse
    const [sx,sy] = pol(R + 5, a0, i, 11), [mx,my] = pol(R * .55, a0, i, 5);
    spokes += `<path d="M0 0Q${mx.toFixed(1)} ${my.toFixed(1)} ${sx.toFixed(1)} ${sy.toFixed(1)}"
      stroke="currentColor" stroke-opacity=".22" stroke-width=".7" fill="none"/>`;

    const [lx,ly] = pol(R + 21, a0 + step / 2, i, 12);
    labels += `<text class="lbl" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
      text-anchor="${Math.abs(lx) < 12 ? "middle" : (lx > 0 ? "start" : "end")}"
      dominant-baseline="middle" transform="rotate(${wobble(i,3,3).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})"
      >${esc(S.level10[i].t)}</text>`;
  }
  const avg = (S.level10.reduce((a,b) => a + b.now, 0) / N).toFixed(1);
  return `<svg class="wheel" viewBox="-178 -172 356 344" filter="url(#ink)" role="img"
    aria-label="Level 10 Life, Durchschnitt ${avg} von 10">
    <g color="var(--ink-soft)">${segs}${spokes}${labels}</g>
    <path d="M-15.6 1.2a15.6 14.8 0 1 1 31.2-2.4 15.2 15.6 0 1 1-31.2 2.4Z"
      fill="var(--paper)" stroke="currentColor" stroke-opacity=".26" stroke-width=".9"/>
    <text class="val" y="1.5" text-anchor="middle" dominant-baseline="middle">${avg}</text>
  </svg>`;
}

function pgL10wheel(){
  const N = S.level10.length;
  const avg = (S.level10.reduce((a,b) => a + b.now, 0) / N);
  const luecke = S.level10.reduce((a,b) => a + (b.goal - b.now), 0);
  const groesste = [...S.level10].sort((a,b) => (b.goal-b.now) - (a.goal-a.now))[0];
  return `${head("Level 10 Life", "Zehn Bereiche, ehrlich angeschaut")}
    <div class="wheel-wrap">${wheelSVG()}</div>
    <div class="wheel-note">
      <p>Im Schnitt <b>${avg.toFixed(1)}</b> — bis zu deinen Zielen fehlen
        noch <b>${luecke}</b> Stufen.</p>
      <p class="hint">Der größte Sprung wartet bei <em>${esc(groesste.t)}</em>.
        Auf einen Ring tippen setzt den Wert · gestrichelt ist dein Ziel.</p>
    </div>`;
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
    </div>`).join("") || `<p class="bd-empty">noch keiner</p>`}
  </div>`;
}
function pgBdL(){
  return `${head("Geburtstage", "Damit ich es nie vergesse")}
    <span class="page-corner" style="color:#C4788B">${motif("candle", {w:.85})}</span>
    <div class="bd-cols">${[0,1,2,3,4,5].map(bdBlock).join("")}</div>`;
}
function pgBdR(){
  return `<div class="bd-cols">${[6,7,8,9,10,11].map(bdBlock).join("")}</div>
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
  const t = THEME[m];
  // Die Kapitelfamilie steuert per Klasse Weißraum, Titelgröße und Deko-Präsenz.
  return `<div class="mcover fam-${t.fam}">
    ${coverArt(m)}
    <div class="mcover-inner">
      <p class="kicker">${YEAR} · ${t.thema}</p>
      <h2 class="mname">${M.n}</h2>
      ${RULE}
      <input class="w mmotto" data-f="mmotto.${mk}" value="${esc(motto)}" aria-label="Monatsmotto">
      <div class="mphoto">
        ${v
          ? `<div class="photo-slot filled polaroid"><span class="tape mid"></span>
               <img src="${v.img}" alt="Foto des Monats">
               <button class="rm" data-visrm="m${m}" aria-label="Foto entfernen">${X_SVG}</button></div>`
          : `<button class="photo-slot polaroid" data-vis="m${m}"><span class="tape mid"></span>
               ${CAM_SVG}<span class="cap">Foto des Monats</span></button>`}
      </div>
      <div class="mcover-go">
        <button class="btn" data-go="m:${m}:1">Kalender</button>
        <button class="btn ghost" data-go="m:${m}:2">Stimmung</button>
        <button class="btn ghost" data-go="m:${m}:6">Wochen</button>
      </div>
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
      <textarea class="w" data-f="mnote.${mk}" rows="3"
        placeholder="Gedanken, Listen, was auch immer …">${esc(S.monthNote[mk] ?? "")}</textarea>
    </div>`;
}

/* --- Moodtracker --------------------------------------------
   Jeder Monat bekommt ein eigenes Motiv UND eine eigene
   Anordnung. So sieht keine Trackerseite aus wie die davor.
   ------------------------------------------------------------ */

/** Verschiebt eine Zelle je nach Anordnung — ergibt gezeichnete statt tabellarische Felder. */
function moodPose(layout, i){
  const col = i % 6, row = Math.floor(i / 6);
  switch (layout){
    case "drift":                                  // treibend wie Schneeflocken
      return {dx:[0,7,-5,4,-7,3][i % 6], dy:[0,-6,4,-3,6,-4][(i + row) % 6], rot:[-8,5,-3,9,-6,2][i % 6]};
    case "scatter":                                // gestreute Wiese
      return {dx:[-6,5,-3,7,-5,2][i % 6], dy:[5,-4,7,-6,3,-5][(i + 2) % 6], rot:[12,-9,4,-14,7,-4][i % 6]};
    case "hang":                                   // hängend wie Teebeutel
      return {dx:[0,2,-2,1,-1,3][i % 6], dy:row % 2 ? 9 : 0, rot:[-4,3,-2,5,-3,2][i % 6]};
    case "tide":                                   // wellenförmig
      return {dx:0, dy:Math.round(Math.sin(i * 0.9) * 8), rot:Math.round(Math.sin(i * 0.7) * 8)};
    case "arc":                                    // leichter Bogen je Reihe
      return {dx:0, dy:Math.round(Math.abs(col - 2.5) * -2.6 + 4), rot:Math.round((col - 2.5) * 3)};
    default:                                       // ruhige Reihen mit leichtem Versatz
      return {dx:0, dy:0, rot:[-3,2,-1,3,-2,1][i % 6]};
  }
}

function pgMood(m){
  const n = dim(m), t = THEME[m];
  const cells = Array.from({length: 31}, (_, i) => {
    const d = i + 1, p = moodPose(t.layout, i);
    const pose = `--dx:${p.dx}px;--dy:${p.dy}px;--rot:${p.rot}deg`;
    if (d > n) return `<span class="mood-cell void" style="${pose}" aria-hidden="true">
      ${motif(t.mood, {stroke:"var(--pencil)", w:.8})}</span>`;
    const k = key(m, d), v = S.moods[k];
    const c = v != null ? S.moodLabels[v].c : null;
    return `<button class="mood-cell${c ? " set" : ""}" data-mood="${k}" style="${pose}"
      aria-label="${d}. ${MONTHS[m].n}${v != null ? ": " + S.moodLabels[v].t : ", noch nichts eingetragen"}">
      ${motif(t.mood, {fill:c, fo:.85,
        stroke:c ? `color-mix(in oklab,${c},var(--sink-color) 30%)` : "var(--pencil)"})}
      <span class="mnum num">${d}</span></button>`;
  }).join("");
  return `${head("Stimmung", `${MONTHS[m].n} · ${t.thema}`)}
    ${mtabs(m, 2)}
    <div class="mood-field ly-${t.layout}">${cells}</div>
    <p class="hint">Antippen und Stimmung wählen · nochmal dieselbe tippen löscht sie</p>`;
}
function pgMoodKey(m){
  const mk = mkey(m), n = dim(m);
  const counts = S.moodLabels.map((_, i) =>
    Object.entries(S.moods).filter(([k,v]) => k.startsWith(mk) && v === i).length);
  const total = counts.reduce((a,b) => a + b, 0);
  return `<div class="pagecol" style="position:relative">
    ${cornerArt(m)}
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
    return `<div class="habit" data-habit="${h.id}" style="--hc:${h.c};--gp:${(h.goal / peak * 100).toFixed(1)}%">
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
      : `<button data-bool="${h.id}|${key(m,d)}" data-d="${d}"
           class="${d % 5 === 0 || d === 1 ? "mark5" : ""}"
           aria-pressed="${!!S.habitLog[`${h.id}|${key(m,d)}`]}"
           aria-label="${esc(h.name)} am ${d}.">${CHECK_SVG}</button>`).join("")}</div>
    ${best > 1 ? `<p class="streak">längste Serie: ${best} Tage am Stück</p>` : ""}
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
           ${v.img ? `<img src="${v.img}" alt="Erinnerung">` : `<span class="stk">${sticker(v.emoji)}</span>`}
           <span class="cap">${esc(v.cap || "")}</span>
           <button class="rm" data-visrm="${id}" aria-label="Entfernen">${X_SVG}</button></div>`
      : `<button class="vslot" data-vis="${id}">${CAM_SVG}<span class="cap">Foto</span></button>`;
  }).join("");
  return `<div class="pagecol" style="position:relative">
    ${cornerArt(m)}
    <p class="label">Erinnerungen</p>
    <div class="vision" style="grid-template-columns:1fr 1fr;margin-top:8px">${slots}</div>
    <div class="sec"><p class="label">Aufkleber</p>
      <div class="sticker-bar">${stickersFor(m).slice(0, 10).map(s =>
        `<button data-stickadd="${mk}|${s.id}" style="--sc:${s.c}"
          aria-label="${esc(s.n)} aufkleben">${motif(s.id, {w:1.05})}</button>`).join("")}</div>
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
  // Tage des Nachbarmonats: auf dem iPad halten sie die Woche in Form,
  // auf dem Handy waeren sie nur zwei leere Karten — dort ausgeblendet.
  if (d === null) return `<div class="daycard ghost" aria-hidden="true">
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
  return `${edgeArt(m)}
    <div class="daycards" style="margin-top:0">${w.slice(4).map(d => dayCard(m, d)).join("")}</div>
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
    ${cornerArt(m)}
    <div class="day-head">
      <span class="big num">${d}</span>
      <div style="padding-bottom:6px">
        <p class="wd">${WD[wdOf(m,d)]}</p>
        <p class="label" style="letter-spacing:.1em">${MONTHS[m].n} ${YEAR}</p>
      </div>
    </div>
    ${RULE}
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
        <div class="sticker-bar">${stickersFor(m).slice(0, 8).map(s =>
          `<button data-daysticker="${k}|${s.id}" style="--sc:${s.c}"
            aria-label="${esc(s.n)} aufkleben">${motif(s.id, {w:1.05})}</button>`).join("")}</div>
        <div class="stuck">
          ${dd.stickers.map((s, i) => `<button data-stickrm="${k}:${i}"
            aria-label="Aufkleber entfernen">${sticker(s)}</button>`).join("")}
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
    ${RULE}
    <p style="font-size:19px;color:var(--ink-soft);margin-top:10px;max-width:40ch;line-height:1.5">
      Dieses Buch muss nicht vollständig werden. Kein Tag muss ausgefüllt sein,
      keine Gewohnheit jeden Tag abgehakt. Es ist ein Ort zum Festhalten —
      nicht zum Abarbeiten.</p>
    <div class="box tint" style="margin-top:16px;position:relative">
      <span class="tape tl"></span>
      <p class="label" style="margin-bottom:3px">Ein Wort für dieses Jahr</p>
      <input class="w plain" data-f="meta.motto" value="${esc(S.meta.motto)}"
        style="font-size:26px;font-family:var(--f-display);color:var(--accent)">
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
    ${cornerArt(m)}
    <p class="label">${MONTHS[m].n} — Rückblick</p>
    ${RULE}
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
    ${FRAME}
    <div class="cover-wreath">${garland(KRANZ_ENDE, {r:46})}</div>
    <div class="cover-inner">
      <p class="kicker">Das war</p>
      <div class="yr">2027</div>
      <p class="motto plain">Ein ganzes Jahr, aufgeschrieben.<br>Das nächste liegt schon bereit.</p>
      <div class="open"><button class="btn big" data-go="s:0">Von vorne beginnen</button></div>
    </div>
    <span class="cover-corner tl">${motif("pineBranch", {w:.85})}</span>
    <span class="cover-corner br">${motif("starFive", {w:.85})}</span>
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

  // Seitenstapel: vorne im Buch liegt links wenig und rechts viel,
  // hinten umgekehrt. 0…1, das CSS skaliert die Kante danach.
  const fort = SPREADS.length > 1 ? cur / (SPREADS.length - 1) : 0;
  book.style.setProperty("--stack-l", (0.08 + fort * 0.86).toFixed(3));
  book.style.setProperty("--stack-r", (0.94 - fort * 0.86).toFixed(3));

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
      `<button class="mark" data-go="m:${i}:0" style="--mc:${M.ac};--mfg:${fgOn(M.ac)}"
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

/* --- Blättern: gebogenes Blatt ------------------------------
   Das Blatt wird in Streifen zerlegt. Jeder Streifen ist ein
   GESCHWISTER-Element in einer einzigen 3D-Ebene; seine Lage auf
   dem Bogen rechnen wir selbst aus. Verschachtelte preserve-3d-
   Ketten (die Safari schwer fallen) entstehen so gar nicht erst.
   ------------------------------------------------------------ */

let flipTimer = 0, flipRAF = 0, flipEls = null;
const reduced = () => window.matchMedia("(prefers-reduced-motion:reduce)").matches;

/** Wie viele Streifen sich lohnen — auf schwachen Geräten weniger. */
function stripCount(){
  if (reduced()) return 1;
  const kerne = navigator.hardwareConcurrency || 4;
  if (isPhone()) return kerne <= 4 ? 6 : 8;
  return kerne <= 4 ? 8 : 10;
}

/** Blätter-Ebene restlos aufräumen. Mehrfach aufrufbar. */
function endFlip(){
  const flip = $("#flip");
  clearTimeout(flipTimer);
  cancelAnimationFrame(flipRAF);
  flip.querySelectorAll("*").forEach(el => el.getAnimations?.().forEach(a => a.cancel()));
  flip.getAnimations?.().forEach(a => a.cancel());
  flip.classList.remove("on");
  flip.style.willChange = "";
  flip.innerHTML = "";
  flipEls = null;
}

/** Krümmung über den Verlauf: schwach – stark – schwach. */
const curveAt = t => Math.sin(Math.PI * Math.min(1, Math.max(0, t)));

/**
 * Legt die Streifen entlang eines Bogens ab.
 * Der Bogen beginnt am Bundsteg und rollt sich mit t auf.
 *   grad  – Grunddrehung des Blattes (0 … 180)
 *   bend  – zusätzlicher Winkel, der sich über die Blattbreite verteilt
 */
function poseStrips(els, w, grad, bend, dir){
  let x = 0, z = 0;
  for (let i = 0; i < els.length; i++){
    const s = els[i];
    // Anteil dieses Streifens am Gesamtwinkel
    const a = dir * (grad + bend * (i / Math.max(1, els.length - 1)));
    const rad = a * Math.PI / 180;
    s.el.style.transform =
      `translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${a.toFixed(2)}deg)`;
    // Licht: je steiler der Streifen steht, desto dunkler
    const dunkel = Math.min(.46, Math.abs(Math.sin(rad)) * .42);
    s.sh.style.opacity = dunkel.toFixed(3);
    // Ende dieses Streifens ist der Anfang des nächsten.
    // Bei rotateY(θ) zeigt die lokale X-Achse auf (cos θ, 0, −sin θ) —
    // deshalb hebt sich das Blatt zum Betrachter statt hinter die Seite.
    x += w * Math.cos(rad);
    z -= w * Math.sin(rad);
  }
}

/**
 * Baut das umblätternde Blatt aus Streifen.
 * Jeder Streifen hat zwei Flächen, wie echtes Papier:
 *   vorne  – die Seite, die gerade oben liegt
 *   hinten – die Seite, die nach dem Blättern erscheint
 * Beim Vorwärtsblättern wird aus der rechten Seite die neue LINKE —
 * genau die klebt auf der Rückseite. Der Punkt, der vorne x von der
 * Falz entfernt liegt, sitzt hinten ebenso weit von der Falz, nur
 * von der anderen Kante gezählt.
 */
function buildStrips(vorneHTML, hintenHTML, back){
  const flip = $("#flip");
  const N = stripCount();
  const halb = $("#spread").getBoundingClientRect().width / 2;
  const w = halb / N;

  const wrap = document.createElement("div");
  wrap.style.cssText = `position:absolute;top:0;height:100%;left:50%;width:${halb}px;
    transform-style:preserve-3d;${back ? "transform:scaleX(-1);transform-origin:left center;" : ""}`;

  const els = [];
  for (let i = 0; i < N; i++){
    const s = document.createElement("div");
    s.className = "strip" + (i === N - 1 ? " edge" : "");
    // 0.6px Überlappung, damit zwischen den Streifen keine Fuge aufblitzt
    s.style.cssText = `width:${(w + .6).toFixed(2)}px;left:0;`;

    const vorne = document.createElement("div");
    vorne.className = "face front";
    vorne.style.cssText = `width:${(w + .6).toFixed(2)}px;left:0;`;
    const fv = document.createElement("div");
    fv.className = "fc";
    fv.style.cssText = `width:${halb}px;left:${(-i * w).toFixed(2)}px;`;
    fv.innerHTML = vorneHTML;
    vorne.appendChild(fv);

    const hinten = document.createElement("div");
    hinten.className = "face back";
    hinten.style.cssText = `width:${(w + .6).toFixed(2)}px;left:0;`;
    const fh = document.createElement("div");
    fh.className = "fc";
    // Von der Falz aus gleich weit — auf der Rückseite von der anderen Kante
    fh.style.cssText = `width:${halb}px;left:${((i + 1) * w - halb).toFixed(2)}px;`;
    fh.innerHTML = hintenHTML;
    hinten.appendChild(fh);

    const sh = document.createElement("div");
    sh.className = "sh";
    s.append(vorne, hinten, sh);
    wrap.appendChild(s);
    els.push({el:s, sh});
  }

  // Wanderschatten auf der Seite darunter
  const under = document.createElement("div");
  under.className = "under-shade";
  under.style.cssText += back ? "right:50%;transform:scaleX(-1);" : "left:50%;";

  flip.append(under, wrap);
  flip.classList.add("on");
  flip.style.willChange = "transform";
  // Nichts im Klon darf Fokus oder Klicks bekommen
  flip.querySelectorAll("input,textarea,button,select,a")
      .forEach(el => { el.setAttribute("tabindex","-1"); el.setAttribute("aria-hidden","true"); });
  return {els, under, w, N};
}

/** Klappt die aufliegende Seite um den Bundsteg weg. */
function animateTurn(mutate, back){
  endFlip();
  if (reduced()){ mutate(); render(); return; }

  // Vorderseite ist die Seite, die jetzt oben liegt …
  const vorne = (back ? $(".page.left") : $(".page.right"))
                  .querySelector(".page-inner").innerHTML;
  mutate();
  render();
  // … und die Rückseite die, die nach dem Blättern an ihrer Stelle steht:
  // vorwärts wird aus der rechten Seite die neue linke.
  const hinten = (back ? $(".page.right") : $(".page.left"))
                  .querySelector(".page-inner").innerHTML;

  const bau = buildStrips(vorne, hinten, back);
  flipEls = bau;

  const D = 700;
  const start = performance.now();
  let frames = 0;
  const dir = -1;                      // Blatt dreht immer vom Betrachter weg

  const schritt = (now) => {
    const t = Math.min(1, (now - start) / D);
    // weiches Ein- und Ausschwingen
    const e = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    const grad = e * 174;
    const bend = curveAt(t) * 22;      // Biegung, am stärksten in der Mitte
    poseStrips(bau.els, bau.w, grad, bend, dir);
    bau.under.style.opacity = (curveAt(t) * .72).toFixed(3);
    frames++;
    if (t < 1) flipRAF = requestAnimationFrame(schritt);
    else {
      lastFlipFPS = Math.round(frames / ((now - start) / 1000));
      // Diagnosewert, damit die Bildrate von aussen ablesbar ist
      try{ window.__flipFPS = lastFlipFPS; }catch(e){}
      endFlip();
    }
  };
  flipRAF = requestAnimationFrame(schritt);
  flipTimer = setTimeout(endFlip, D + 260);   // Sicherheitsnetz
}

/** Zuletzt gemessene Bildrate beim Blättern (für Diagnose). */
let lastFlipFPS = 0;

/** Vorsatzpapier: die Innenseite des Buchdeckels. */
function endpaper(){
  return `<div class="endpaper">
    <span class="ep-line"></span>
    <p class="ep-note">Dieses Buch gehört</p>
    <p class="ep-name">${esc(S.meta.name)}</p>
  </div>`;
}

/* --- Buch auf- und zuklappen -------------------------------- */

/** Der Deckel ist steif: er biegt sich nicht, er schwingt auf. */
function openBook(){
  const book = $("#book");
  if (!book.classList.contains("cover-mode")) return goto(1);
  if (reduced()){ book.classList.remove("cover-mode"); goto(1); return; }

  endFlip();
  const flip = $("#flip");
  const deckel = document.createElement("div");
  deckel.className = "cover-leaf";
  // Vorne der Deckel, hinten das Vorsatzpapier — beim Aufklappen sieht
  // man die Innenseite, nicht den seitenverkehrten Deckel.
  deckel.innerHTML = `<div class="leaf-face front">${$(".page.right").innerHTML}</div>
    <div class="leaf-face back">${endpaper()}</div>
    <div class="leaf-shade"></div>`;
  deckel.querySelectorAll("input,textarea,button,select,a")
        .forEach(el => { el.setAttribute("tabindex","-1"); el.setAttribute("aria-hidden","true"); });
  flip.appendChild(deckel);
  flip.classList.add("on");

  // Erst die Doppelseite dahinter aufbauen, dann den Deckel wegklappen
  book.classList.remove("cover-mode");
  memoScroll();
  cur = 1; dayView = null; side = 0;
  render();

  const D = 860;
  deckel.animate([
      {transform:"rotateY(0deg)", opacity:1},
      {transform:"rotateY(-100deg)", opacity:1, offset:.52},
      {transform:"rotateY(-168deg)", opacity:1, offset:.86},
      {transform:"rotateY(-179deg)", opacity:0}
    ], {duration:D, easing:"cubic-bezier(.32,.03,.18,1)", fill:"forwards"});
  deckel.querySelector(".leaf-shade").animate(
      [{opacity:0}, {opacity:.34, offset:.5}, {opacity:.14}],
      {duration:D, easing:"ease-in-out", fill:"forwards"});
  flipTimer = setTimeout(endFlip, D + 60);
}

/** Zurück zum Deckblatt — die Umkehrung. */
function closeBook(){
  const book = $("#book");
  if (book.classList.contains("cover-mode")) return;
  if (reduced()){ book.classList.add("cover-mode"); cur = 0; render(); return; }

  endFlip();
  memoScroll();
  cur = 0; dayView = null; side = 0;
  render();                                  // rendert das Deckblatt rechts
  book.classList.add("cover-mode");

  const flip = $("#flip");
  const deckel = document.createElement("div");
  deckel.className = "cover-leaf";
  deckel.innerHTML = `<div class="leaf-face front">${$(".page.right").innerHTML}</div>
    <div class="leaf-face back">${endpaper()}</div>
    <div class="leaf-shade"></div>`;
  deckel.querySelectorAll("input,textarea,button,select,a")
        .forEach(el => { el.setAttribute("tabindex","-1"); el.setAttribute("aria-hidden","true"); });
  flip.appendChild(deckel);
  flip.classList.add("on");

  const D = 780;
  deckel.animate([
      {transform:"rotateY(-179deg)", opacity:0},
      {transform:"rotateY(-166deg)", opacity:1, offset:.14},
      {transform:"rotateY(-70deg)", opacity:1, offset:.52},
      {transform:"rotateY(0deg)", opacity:1}
    ], {duration:D, easing:"cubic-bezier(.32,.03,.18,1)", fill:"forwards"});
  deckel.querySelector(".leaf-shade").animate(
      [{opacity:.2}, {opacity:.3, offset:.45}, {opacity:0}],
      {duration:D, easing:"ease-in-out", fill:"forwards"});
  flipTimer = setTimeout(endFlip, D + 60);
}

function goto(i, opts = {}){
  i = clamp(i, 0, SPREADS.length - 1);
  const back = opts.back ?? (i < cur);
  const zu = $("#book").classList.contains("cover-mode");
  // Der Wechsel über das Deckblatt hinweg ist ein Auf- oder Zuklappen,
  // kein Umblättern — sonst klappt eine Seite, wo ein Deckel gehört.
  if (i === 0 && !zu && !dayView) return closeBook();
  if (i > 0 && zu){
    openBook();
    if (i !== 1) setTimeout(() => goto(i, {back:false}), 90);
    return;
  }
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

  if (hit("#openBook"))              return openBook();
  if ((el = hit("[data-go]")))       return navigate(el.dataset.go);
  if ((el = hit("[data-day]")))      return openDay(el.dataset.day);
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
    day(k).stickers.push(s); save(); render(); return toast("Aufgeklebt");
  }
  if ((el = hit("[data-stickrm]"))){
    const [k, i] = el.dataset.stickrm.split(":");
    day(k).stickers.splice(+i, 1); save(); return render();
  }
  if ((el = hit("[data-stickadd]"))){
    const [mk, sid] = el.dataset.stickadd.split("|");
    const free = [0,1,2,3].map(i => `mem${+mk.slice(5,7) - 1}_${i}`).find(x => !S.vision.some(v => v.i === x));
    if (!free) return toast("Alle Felder sind belegt");
    S.vision.push({i:free, emoji:sid, cap:""});
    save(); render(); return toast("Aufgeklebt");
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

/* Wird der Tab im Hintergrund gedrosselt, kann eine Blätter-Animation
   mitten drin einfrieren. Beim Zurückkommen deshalb immer aufräumen. */
document.addEventListener("visibilitychange", () => { if (!document.hidden) endFlip(); });
addEventListener("pageshow", endFlip);

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
