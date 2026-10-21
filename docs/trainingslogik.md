# Trainingslogik

Wie Kraft Empfehlungen und Gewichtsvorschläge ableitet. Die Parameter stehen in
`src/config/rules.ts`, die Geräte in `src/config/library.ts`.

Kennzeichnung: **belegt** = gestützt auf Leitlinien oder Metaanalysen,
**Faustregel** = übliche Praxis ohne harte Evidenz für genau diese Zahl,
**Annahme** = persönliche Festlegung für diese App.

## Grundlage

- **belegt** WHO 2020: muskelkräftigende Aktivität mit allen grossen Muskelgruppen
  an mindestens zwei Tagen pro Woche.
- **belegt** ACSM 2026: regelmässig zu trainieren ist wichtiger als die genauen Variablen.
  Bei ausreichender Anstrengung sind leichte bis schwere Lasten für den Muskelaufbau gleichwertig.
- **Annahme** Acht Bereiche gelten als «grosse Muskelgruppen»: Beine vorne, Beine hinten,
  Gesäss, Rücken oben, Rücken unten, Brust, Schultern, Rumpf. Waden sind optional,
  Arme werden über Drücken und Ziehen mittrainiert.

## Geräte

Beinpresse, Beinbeuger, Brustpresse, Latzug, Rudern sitzend, Schulterpresse,
Rückenstrecker, Dead Bug (Matte), Unterarmstütz (Matte), Wadenheber (optional).
Jeder Bereich hat mindestens eine Übung mit Hauptbelastung.

## Sätze und Wiederholungen

- **Faustregel** 2 Sätze pro Übung, 8–12 Wiederholungen. Rückenstrecker und Wadenheber 10–15,
  Unterarmstütz 20–45 Sekunden.
- **Faustregel** Einen Satz etwa zwei bis drei Wiederholungen vor dem Muskelversagen beenden.
- Ein dritter Satz wird nur bei Beinpresse, Brustpresse und Latzug angeboten, und nur,
  wenn alle Bereiche heute schon vorkamen und noch mindestens 8 Minuten bleiben.
- **Faustregel** Pausen: 2 Minuten bei der Beinpresse, 90 Sekunden an den übrigen Geräten,
  60–75 Sekunden auf der Matte.

## Empfehlungen während des Trainings

Jede Übung erhält Punkte. Die drei höchsten werden empfohlen, alle anderen bleiben wählbar.

| Grund | Wirkung |
| --- | --- |
| Bereich kommt heute noch nicht vor | +3 je Hauptbereich, +1,5 je Mitbeteiligung |
| Bereich fehlt diese Woche noch (Ziel: 2 Tage in 7 Tagen) | +1 je fehlendem Tag |
| Bereich in den letzten 48 Stunden trainiert | −2 |
| Long Run in den letzten 24 Stunden, Beingeräte | −1 |
| Gleiches Bewegungsmuster wie die Übung davor | −1 |
| Optionale Übung | −0,5, zusätzlich −1, wenn sie beim letzten Besuch dran war |

- Die drei Vorschläge ergänzen sich: Ist ein Bereich schon durch einen Vorschlag abgedeckt,
  zählt er für die übrigen weniger.
- Eine Übung verlässt die Empfehlungen, sobald ihre Sätze erledigt sind.
- Angefangene Übungen stehen in «Alle Geräte» zuoberst.
- Bei Gleichstand entscheidet die feste Reihenfolge der Bibliothek. Gleiche Daten ergeben
  immer dieselbe Empfehlung.
- **Annahme** Die Erholungszeit von 48 Stunden und die Rücksicht auf den Long Run sind
  vorsichtige Faustregeln. Für Gesunde ist die Evidenz dazu dünn, deshalb beeinflussen
  sie nur die Reihenfolge, nie das Gewicht.

## Gewichtsvorschlag (doppelte Progression)

- **Erstes Mal**: kein Vorschlag. Du wählst ein Gewicht für etwa 12 Wiederholungen
  mit zwei bis drei in Reserve.
- **Erhöhen** um eine Stufe, wenn in zwei Trainings hintereinander bei gleichem Gewicht
  alle Sätze den oberen Bereich erreichten und keiner «Sehr streng» war.
- **Senken** um eine Stufe, wenn zwei Trainings hintereinander «Sehr streng» waren oder
  alle Sätze unter dem unteren Bereich blieben.
- **Sonst** gleich bleiben. Nie mehr als eine Stufe pro Training.
- **Nach einer Pause** (ab 4 Wochen eine Stufe, ab 8 Wochen zwei Stufen weniger) wird ein
  vorsichtigerer Einstieg vorgeschlagen. Ist dieser Einstieg «Leicht» oder «Passend» und
  der obere Bereich erreicht, geht es schon beim nächsten Mal eine Stufe hoch.
- Keine automatischen Entlastungswochen.
- Pro Training zählt die strengste Rückmeldung einer Übung, damit die Logik vorsichtig bleibt.
- Haltezeiten steigen um 5 Sekunden, wenn das obere Ende zweimal gut erreicht wurde.
- Alle Werte sind Vorschläge und jederzeit änderbar. Gespeichert wird, was tatsächlich gemacht wurde.
