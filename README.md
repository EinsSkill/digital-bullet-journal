# Digital Bullet Journal 2027

Ein digitales Bullet Journal als persönliches, aufgeschlagenes Buch — für iPad im Querformat,
zusätzlich für das Handy. Reiner Frontend-Prototyp mit Beispieldaten, ohne Backend.

**Öffnen:** `index.html` im Browser öffnen. Kein Build, keine Installation, keine Abhängigkeiten.

---

## Aktueller Stand

Das visuelle Design ist umgesetzt und alle Bereiche sind angelegt und bedienbar.

**Aufbau des Buches** — 79 Doppelseiten:

| Bereich | Inhalt |
|---|---|
| Deckblatt | 2027, editierbarer Name, Motto, Widmung |
| Inhaltsverzeichnis | verlinkt alle Bereiche |
| Jahresübersicht | 12 Mini-Kalender, klickbar, Termine als Punkte |
| Vorwort | Jahresmotto, Wünsche |
| Vorsätze & Ziele | Vision-Board mit eigenen Fotos, Ziele mit Schritten und Fortschritt |
| Level 10 Life | Rad mit 10 Bereichen × 10 Stufen, direkt anklickbar |
| Geburtstage | nach Monaten, erscheinen automatisch im Kalender |
| Januar–Dezember | je 6 Doppelseiten (siehe unten) |

**Jeder Monat** hat: Deckblatt · Monatskalender · Monatsziele · Rückblick · Moodtracker ·
Stimmungs-Legende · Gewohnheiten (messbar + Ja/Nein) · Top Songs · Erinnerungen · Wochenansicht.
Jeder Tag im Kalender und in der Wochenansicht öffnet eine eigene Tagesseite.

**Gestaltung:** Jeder Monat hat eine eigene Farbwelt und ein eigenes Moodtracker-Motiv
(Januar Schneeflocken, Februar Herzen, Mai Blüten, November Teebeutel, Dezember Sterne …).
Alle Illustrationen laufen durch einen SVG-Wackelfilter, damit keine Linie mathematisch glatt wirkt.

**Funktioniert bereits:** Blättern mit 3D-Effekt, Lesezeichen, Register, Reiter, Wischgesten,
Stimmung setzen, Gewohnheiten abhaken und messen, Ziele bearbeiten, Level-10-Werte setzen,
Geburtstage/Termine/To-dos anlegen, eigene Fotos einfügen, Aufkleber, Tageslicht-/Nachtlicht-Modus.
Der Kalender für 2027 wird automatisch korrekt erzeugt.

---

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst: SVG-Filter, Buch-Container, Lesezeichen, Dialog-Ebene |
| `styles.css` | komplettes Design: Farbtokens, Papier, Buch, alle Komponenten, Responsive |
| `app.js` | Daten, Illustrationen, alle Seiten, Navigation, Eingaben |

### Wo was in `app.js` steht

Die Datei ist in nummerierte Abschnitte gegliedert — die Kommentarblöcke sind Ankerpunkte:

```
 1 · Konstanten & Kalender      Datumsberechnung für 2027
 2 · Monatswelten               Farbe, Motiv und Motto je Monat
 3 · Speicher                   Datensatz + localStorage
 4 · Kleine Helfer              esc, clamp, Bildauswahl
 5 · Illustrationen             SVG-Motive und Monatsszenen
 6 · Seiten — Jahresteil        Deckblatt, Inhalt, Ziele, Level 10, Geburtstage
 7 · Seiten — Monatsteil        Deckblatt, Kalender, Mood, Gewohnheiten
 8 · Das Buch                   Seitenfolge, Blättern, Navigation
 9 · Eingaben                   zentraler setField-Dispatcher
10 · Dialoge                    Gewohnheit, Ziel, Termin, Geburtstag
11 · Klicks                     alle Interaktionen an einer Stelle
12 · Theme & Start
```

In `styles.css` gilt dasselbe — die Abschnitte heißen dort TOKENS, BOOK, BOOKMARKS,
MOOD TRACKER, HABIT TRACKER, SONGS, LEVEL 10, RESPONSIVE.

---

## Für die spätere Google-Sheets-Anbindung

Die Oberfläche ist bereits darauf vorbereitet:

- **Alle Eingabefelder tragen `data-f="<pfad>"`.** Ein einziger Dispatcher (`setField`,
  Abschnitt 9) schreibt in den zentralen Datensatz `S`. Kein Zustand liegt verstreut im HTML.
- **Speichern und Laden sind isoliert.** Nur `load()` und `save()` (Abschnitt 3) müssen gegen
  `google.script.run` getauscht werden — die gesamte Oberfläche bleibt unberührt.
- **Der Datensatz ist flach und tabellentauglich.** Schlüssel sind Datumsstrings:
  `moods["2027-05-14"]`, `habitLog["h1|2027-05-14"]`, `days["2027-05-14"]`,
  `songs["2027-05"]`. Das lässt sich direkt auf Tabellenzeilen abbilden.
- **Sync-Status ist vorhanden** (unten links) und kennt bereits die Zustände
  „wird gesichert", „alles gesichert" und „nur auf diesem Gerät".
- Zugriff auf `localStorage` ist überall in `try/catch` gekapselt, damit die App auch in
  privaten Fenstern oder eingebettet läuft.

Für die Nutzerin sind Tabellen zu keinem Zeitpunkt sichtbar.

---

## Bekannte Grenzen

- Der Blättern-Effekt klappt die Seite realistisch weg, biegt das Papier aber nicht.
- Fotos werden auf 640 px verkleinert im Browser gespeichert — bis zur Sheets-Anbindung
  liegen sie nur auf dem jeweiligen Gerät.
- Alle Inhalte sind Beispieldaten (Platzhalter wie `[Name]`, erfundene Geburtstage und Songs).

## Nächste Schritte

1. Google-Spreadsheet mit den Tabs anlegen, die dem Datensatz aus Abschnitt 3 entsprechen
2. Apps Script: `doGet`, `ladeAlles`, `speichere` — dann `load()`/`save()` umstellen
3. Offline-Puffer: lokale Änderungen sammeln und bei Verbindung nachziehen
