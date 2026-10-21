# Kraft

Persönliche Trainings-App für zwei Krafteinheiten und einen Long Run pro Woche.
Installierbare Web-App (PWA), alle Daten bleiben auf dem Gerät.

## Aufbau

```
src/config     Geräte, Regeln, Aufwärmen und Cool-down (Daten, keine Logik)
src/domain     Trainingslogik: Empfehlungen, Gewichtsvorschläge, Abdeckung
src/data       Speicherung (IndexedDB) und Sicherung
src/ui         Oberfläche
tests          Tests der Logik und der Speicherung
docs           Trainingslogik, Quellen, Designvorschau
```

## Entwickeln

```bash
npm install
npm run dev     # lokale Vorschau
npm test        # Tests
npm run build   # Build nach dist/
```

## Veröffentlichen

Jeder Push auf `main` baut die App und veröffentlicht sie über GitHub Pages
unter `https://miriamleakeller-cpu.github.io/kraft/`. Einmalig nötig:
Repository, Settings, Pages, Source auf **GitHub Actions** stellen.

## Daten

- Gespeichert in IndexedDB unter dem Namen `kraft`, getrennt von anderen Apps.
- Jeder Satz wird sofort gespeichert. Eine angefangene Session öffnet sich beim nächsten
  Start wieder, auch mitten in der Pause.
- Einstellungen, Sicherung erstellen: JSON-Datei mit allen Trainings, Läufen und
  Geräteeinstellungen. Dieselbe Datei lässt sich wieder einlesen.
- Der Browser kann lokale Daten in seltenen Fällen löschen. Die Sicherung ist der Schutz dagegen.

## Grenzen auf dem iPhone

- Bei gesperrtem Bildschirm oder im Hintergrund läuft kein Code. Der Signalton kommt nur,
  wenn die App sichtbar ist. Die Restzeit stimmt trotzdem, weil sie aus der gespeicherten
  Endzeit berechnet wird.
- Während des Trainings bleibt der Bildschirm wach, soweit iOS das erlaubt.
- Der Ton ist so eingestellt, dass er sich mit einem laufenden Podcast mischt.
