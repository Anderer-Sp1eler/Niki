# Wolfy Jump’n’Run – v0.6

Gegner: süßes Schäfchen und schwerfälliger Bär.

## Gegnerstruktur
- `src/entities/Sheep.ts` – Bewegungslogik des Schafs
- `src/rendering/enemies/SheepRenderer.ts` – Animation/Rendering des Schafs
- `src/entities/Bear.ts` – Bewegungs- und Verhaltenslogik des Bären
- `src/rendering/enemies/BearRenderer.ts` – Animation/Rendering des Bären
- `public/assets/images/enemy/sheep_white/` – einzelne 128x128 PNG-Frames
- `public/assets/images/enemy/bear/` – einzelne 128x128 PNG-Frames

## Schäfchen-Verhalten
- patrouilliert zwischen x=600 und x=900 auf dem Boden
- läuft hin und her
- wartet zufällig zwischen ca. 1 und 2,8 Sekunden
- läuft jeweils ca. 1,8 bis 4 Sekunden
- wechselt zwischen `idle` und `walk`
- dreht an den Patrouillengrenzen automatisch um

Die Physikbox und der sichtbare Sprite sind getrennt. Der Renderer verwendet
pro Frame einen visuellen Mittelpunkt und einen gemeinsamen Bodenanker, damit
das Schaf beim Animationswechsel nicht sichtbar springt oder schwebt.

## Start
```text
npm install
npm run dev
```


Änderung v0.5: Das Schäfchen wurde proportional verkleinert (72x72 Darstellung, kleinere Physikbox), damit es besser zu Wolfy passt.

## Bär-Verhalten
- patrouilliert langsam zwischen x=1180 und x=1700
- wirkt durch die niedrige Geschwindigkeit bewusst schwerfällig
- wartet zufällig zwischen ca. 1,2 und 3,2 Sekunden
- läuft jeweils ca. 2,2 bis 4,8 Sekunden
- erkennt Wolfy in einem Abstand von ca. 175 Pixeln
- stellt sich dann auf die Hinterbeine und fuchtelt mit den Tatzen
- richtet sich dabei zu Wolfy aus
- geht nach dem Angriff wieder in eine zufällige Warte-/Patrouillenphase über

Der Bär verursacht in dieser Version noch keinen Schaden; zunächst wird nur sein Bewegungs- und Angriffsverhalten umgesetzt.

Änderung v0.6: Bär als zweiter Gegner mit langsamer Patrouille, zufälligen Pausen und Aufrichten bei Annäherung von Wolfy.

## v0.6.3
Neue vollständige 4-Frame-Angriffsanimation für den Bären. Alle Attack-Frames sind 128x128 und vollständig sichtbar.


