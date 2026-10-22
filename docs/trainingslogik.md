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

## Ablauf (ähnlich EGYM)

Ein Durchgang an allen Geräten, etwa 30 Minuten, ohne Pausentimer und ohne Cool-down.

1. **Aufwärmen**: drei grosse Übungen (Beinpresse, Rudern, Brustpresse) mit etwa halbem
   Arbeitsgewicht und 15 Wiederholungen. Danach beginnt der Durchgang von selbst.
   Aufwärmsätze zählen weder für die Abdeckung noch für die Gewichtsvorschläge.
2. **Durchgang**: ein Arbeitssatz pro Gerät, in frei wählbarer Reihenfolge. Die App empfiehlt
   jeweils drei Geräte. Der Wechsel zum nächsten Gerät ist die Pause.
3. **Rückmeldung** direkt beim Speichern des Satzes: Leicht, Passend oder Sehr streng.

## Sätze und Wiederholungen

- **belegt** Schon ein Satz pro Übung verbessert Kraft deutlich. Mehr Sätze bringen mehr,
  aber mit abnehmendem Zusatznutzen. Für die gesundheitlichen Ziele genügt ein Satz pro Gerät
  an zwei Tagen pro Woche. Muskelkräftigung von 30–60 Minuten pro Woche ist in
  Beobachtungsstudien mit dem grössten gesundheitlichen Nutzen verbunden.
- **Faustregel** 8–12 Wiederholungen, den Satz etwa zwei bis drei Wiederholungen vor dem
  Muskelversagen beenden. Rückenstrecker und Wadenheber 10–15, Unterarmstütz 20–45 Sekunden.
- Ein **Zusatzsatz** wird bei Beinpresse, Brustpresse und Latzug angeboten, wenn alle Bereiche
  heute schon vorkamen und noch mindestens 4 Minuten der geplanten Zeit übrig sind.
- Ein Durchgang mit 7 Geräten deckt alle acht Bereiche ab (automatischer Test).

## Empfehlungen während des Trainings

Jede Übung erhält Punkte. Die drei höchsten werden empfohlen, alle anderen bleiben wählbar.
Eine Übung gilt nach ihrem Arbeitssatz als erledigt.

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
- Bei Gleichstand entscheidet die feste Reihenfolge der Bibliothek. Gleiche Daten ergeben
  immer dieselbe Empfehlung.
- **Annahme** Die Erholungszeit von 48 Stunden und die Rücksicht auf den Long Run sind
  vorsichtige Faustregeln. Für Gesunde ist die Evidenz dazu dünn, deshalb beeinflussen
  sie nur die Reihenfolge, nie das Gewicht.

## Gewichtsvorschlag (doppelte Progression)

- **Erstes Mal**: kein Vorschlag. Du wählst ein Gewicht für etwa 12 Wiederholungen
  mit zwei bis drei in Reserve.
- **Erhöhen** um eine Stufe, wenn in zwei Trainings hintereinander bei gleichem Gewicht
  der Arbeitssatz den oberen Bereich erreichte und keiner «Sehr streng» war.
- **Senken** um eine Stufe, wenn zwei Trainings hintereinander «Sehr streng» waren oder
  der Arbeitssatz unter dem unteren Bereich blieb.
- **Sonst** gleich bleiben. Nie mehr als eine Stufe pro Training.
- **Nach einer Pause** (ab 4 Wochen eine Stufe, ab 8 Wochen zwei Stufen weniger) wird ein
  vorsichtigerer Einstieg vorgeschlagen. Ist dieser Einstieg «Leicht» oder «Passend» und
  der obere Bereich erreicht, geht es schon beim nächsten Mal eine Stufe hoch.
- Keine automatischen Entlastungswochen.
- Pro Training zählt die strengste Rückmeldung einer Übung, damit die Logik vorsichtig bleibt.
- Haltezeiten steigen um 5 Sekunden, wenn das obere Ende zweimal gut erreicht wurde.
- Alle Werte sind Vorschläge und jederzeit änderbar. Gespeichert wird, was tatsächlich gemacht wurde.
