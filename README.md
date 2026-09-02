# BrainForge 🧠⚡ – modulares Lernspiel

Trainiere dein Gehirn wie ein neuronales Netz: Jede richtige Antwort senkt den **Loss** (Live-Kurve), jede falsche kostet ein Herz. Aufgaben werden **zufällig generiert** – es gibt also praktisch unendlich viele Varianten.

## Starten

`index.html` doppelklicken – läuft komplett offline im Browser, kein Server nötig.
(Fortschritt/Highscores werden im Browser-LocalStorage gespeichert.)

Direktlinks: `index.html#topic=dl1` (Themenmenü) · `index.html#topic=dl1&mode=campaign` · `…&mode=practice&cat=z-berechnen`

## Spielmodi

| Modus | Was passiert |
|---|---|
| 🏔️ **Kampagne** | 12 Aufgaben mit steigender Stufe, am Ende ein Boss. 3 Herzen. Ziel: Loss < 0,1 = „Konvergiert“. |
| ♾️ **Endlos** | Bis die Herzen weg sind – Highscore-Jagd, Schwierigkeit steigt. |
| 🎯 **Üben** | Eine Kategorie gezielt trainieren, ohne Herzen, mit Erklärung nach jeder Aufgabe. |

Punkte = Basis (100 × Stufe) × Streak-Multiplikator (bis 3×) + Zeitbonus. Bei Mehrschritt-Aufgaben gibt es Teilpunkte.

**📋 Formelblatt:** Jedes Thema hat ein eingebautes Formelblatt (Button im Themenmenü) – so formatiert, dass man es fürs erlaubte handschriftliche Klausur-Formelblatt abschreiben kann. **💡 Formeln-Button** in jeder Aufgabe öffnet es direkt beim passenden Abschnitt: im Üben-Modus kostenlos, in Kampagne/Endlos kostet es 50 % der Punkte der aktuellen Aufgabe. **Schwächen-Training:** Kategorien mit niedriger Trefferquote erscheinen automatisch häufiger (ab 3 gespielten Aufgaben pro Kategorie).

Themen definieren ihr Formelblatt über `sheet: [{id, title, rows: [{f, d}]}]` im Topic-Objekt, Kategorien verweisen mit `sheetRef: '<sektions-id>'` auf ihren Abschnitt.
Tastatur: `1`–`4` wählt Optionen, `Enter` prüft/weiter.

## Struktur

```
BrainForge/
├── index.html            ← hier neue Themen-Dateien eintragen
├── css/style.css
├── js/
│   ├── engine.js         ← Spiel-Logik, Screens, Scoring, Speicherung
│   ├── lib/utils.js      ← Zufall, Zahlenformat, Notation (w_ji^(l) …), Aktivierungsfunktionen
│   ├── lib/figures.js    ← SVG-Abbildungen: Netz, Neuron, Funktionsgraph, Tabelle
│   ├── lib/audio.js      ← Sounds (WebAudio), Mute-Button
│   ├── modes/            ← Aufgabentypen: numeric (Zahl), choice (Auswahl), multi (Schritte)
│   └── topics/           ← ein Themenpaket pro Datei
│       ├── dl1-neuron.js ← Deep Learning I: Neuron, Aktivierung, Notation, Forward-Pass
│       └── _template.js  ← Vorlage für neue Themen (nicht eingebunden)
```

## Neues Thema hinzufügen

1. `js/topics/_template.js` kopieren → z.B. `js/topics/dl2-training.js`
2. `id`, `title`, `emoji`, `color` setzen und Kategorien mit `generate()`-Funktionen füllen
3. In `index.html` eine Zeile ergänzen: `<script src="js/topics/dl2-training.js"></script>`

Fertig – das Thema erscheint auf der Startseite mit allen drei Spielmodi.

### Aufgabenformate

```js
// Zahl eingeben
{ type:'numeric', prompt:'…', figure?:'<svg…>', given?:['x = 2'], answer: 3.5, tol?: 0.011, hint?:'', explain:'…' }
// Auswahl (genau eine richtig, wird gemischt)
{ type:'choice', prompt:'…', options:[{html:'richtig', correct:true}, {html:'falsch'}, …], explain:'…' }
// Mehrschrittig (Forward-Pass o.ä.), Schritte mit answer oder options
{ type:'multi', prompt:'…', steps:[{label:'Schritt', varLabel:'z', answer: 2, explain:'…'}, …], explain:'…' }
```

Kategorie: `{ id, title, desc, tier: 1|2|3, boss?: true, weight?: 1, generate: () => aufgabe }`
– `tier` steuert, wann die Kategorie in Kampagne/Endlos auftaucht, `boss` ist der Endgegner, `weight` die Häufigkeit.

### Nützliche Helfer

- `BrainForge.utils`: `rnd(a,b)`, `pick(arr)`, `shuffle(arr)`, `fmt(x)` (Komma-Format), `W(j,i,l)`/`A(j,l)`/`Z(j,l)`/`B(j,l)`/`X(i)` (HTML-Notation), `ACTS` (4 Aktivierungsfunktionen mit `fn`, `formula`, `desc`), `sigmoid`, `relu`, `step`
- `BrainForge.figures`: `network({inputs, layers, highlight:{l,j,i}})`, `neuron({inputs:[{label,value,w}], bias, act})`, `plot({fn})`, `table(head, rows)`

## Thema 3: Deep Learning III – Linear & Nichtlinear (FSTI-107)

9 Kategorien: Gerade durch 2 Punkte · Nichtlinearität verstehen · φ(z) = z² erkunden · Funktion pro Neuron aus Wertepaaren · Diagonalmatrix lesen · Off-Diagonal-Einträge · lineare Schichten verketten · Funktion → Matrixzeile · **Boss:** Transferaufgabe (Funktionen → W, b → ŷ = Wx + b, 5 Schritte).

## Thema 2: Deep Learning II – Matrix & Forward Pass (FSTI-107)

10 Kategorien: Skalar/Vektor/Matrix-Schreibweise · Forward Pass verstehen · elementweise Aktivierung · Dimensionen von W/b/z · Matrixzeile rechnen · Forward Pass im Python-Code · ganze Schicht z = Wa + b · Zusammenhang aus x/ŷ-Paaren erkennen · Funktion → Gewichte (y = mx + c) · **Boss:** Schicht komplett in Matrixform mit ReLU.

## Thema 1: Deep Learning I (FSTI-107)

14 Kategorien: ML vs. DL · Symbole/Formelsammlung · Voraktivierung z · Aktivierungsfunktion anwenden/erkennen · Neuron verstehen · Neuron komplett · Gewicht im Netz benennen · Notation lesen · Formel mit Indizes · Neuron in Schicht 2 · Aktivierungen vergleichen · **Boss:** Neuronen-Kette · **Boss:** Netz 2-2-1 (kompletter Forward-Pass).
