# Kraft

Persönliche Trainings-App für zwei Krafteinheiten und einen Long Run pro Woche.
Das Krafttraining funktioniert wie ein persönlicher EGYM-Zirkel: kurz aufwärmen,
dann ein Satz an jedem Gerät, etwa 30 Minuten. Installierbare Web-App (PWA),
alle Daten bleiben auf dem Gerät.

## Aufbau

```
src/config     Geräte und Regeln (Daten, keine Logik)
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
- Jeder Satz wird sofort gespeichert. Ein angefangenes Training öffnet sich beim nächsten
  Start wieder.
- Einstellungen, Sicherung erstellen: JSON-Datei mit allen Trainings, Läufen und
  Geräteeinstellungen. Dieselbe Datei lässt sich wieder einlesen.
- Der Browser kann lokale Daten in seltenen Fällen löschen. Die Sicherung ist der Schutz dagegen.

## Grenzen auf dem iPhone

- Während des Trainings bleibt der Bildschirm wach, soweit iOS das erlaubt.
- Wird die App im Hintergrund vom System beendet, geht nichts verloren: Jeder Satz ist bereits gespeichert.
