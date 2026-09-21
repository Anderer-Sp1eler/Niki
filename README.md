# Wolfy Jump’n’Run – v0.5

Erster Gegner: süßes Schäfchen.

## Gegnerstruktur
- `src/entities/Sheep.ts` – Bewegungslogik
- `src/rendering/enemies/SheepRenderer.ts` – Animation/Rendering
- `assets/images/enemy/sheep_white/` – einzelne 128x128 PNG-Frames

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
