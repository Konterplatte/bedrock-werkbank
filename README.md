# Bedrock-Werkbank

Ressourcen-Lexikon, elf Baupläne (von der Eisenfarm bis zur Schmelzanlage), eigene Baupläne, eine Seed-Karte und acht Werkzeuge für **Minecraft Bedrock Edition 26.60** als Web-App fürs iPhone. Nach dem ersten Öffnen läuft sie ohne Internet; die Originalbilder brauchen beim ersten Ansehen einmal eine Verbindung.

**App öffnen:** https://konterplatte.github.io/bedrock-werkbank/

## Aufs iPhone holen

1. Den Link oben in **Safari** öffnen.
2. Unten auf **Teilen** tippen, dann **Zum Home-Bildschirm**.
3. Die App startet danach im Vollbild wie jede andere App.

Neue Versionen lädt die App von selbst, sobald sie online geöffnet wird. Unter Info lassen sich alle Originalbilder vorab laden, dann zeigt sie auch ohne Netz überall die Bilder aus dem Spiel. Dort steht auch eine Hilfe zu allen Funktionen.

## Windows-Programm

Dieselbe App als eigenes Programm für Windows 10 und 11: [Bedrock-Werkbank-Windows.zip](download/Bedrock-Werkbank-Windows.zip) herunterladen, entpacken und `Bedrock-Werkbank.exe` starten. Windows warnt beim ersten Start, weil das Programm nicht signiert ist: „Weitere Informationen“, dann „Trotzdem ausführen“.

## Inhalt

- `index.html`: Startseite mit Suche über alles, Navigation, Seed-Karte (Seed und Version je Welt; „Was suchst du?“ findet ab deinem Standort das nächste Dorf, Tempel, Schätze, Ozeanmonumente, Prüfungskammern, seltene Biome, Höhlen oder Netherfestungen; Biomkarte mit allen Bauwerken zum Wischen und Zoomen; alles auf dem Gerät berechnet, auch offline; Funde als Ort speichern; Absprung zur Online-Seed-Karte) und Werkzeuge (Sammelliste mit Packlisten-Vorlagen, Koordinaten-Notizbuch mit Wegweiser und Teilen-Links, Brau-Planer, Amboss-Planer mit Vorlagen, Nether-Portal-Rechner, Kreis- und Kuppel-Rechner, Erfahrungs-Rechner, Zeit und Redstone mit Trichter-Uhr und Ofen-Brennstoff, mehrere Welten, Favoriten, Sicherung als Datei und Datenübertragung)
- Darstellung unter Info: Design System/Hell/Dunkel und Hintergrund Klassisch, Minecraft (Titelbild aus dem Spiel, Bücherregal, Holz) oder Bewegt; die Bilder dafür werden wie alle Originalbilder erst auf dem Gerät aus Mojangs Repository geladen
- `lexikon/`: Ressourcen-Lexikon mit 1.880 Einträgen, darunter alle 42 Verzauberungen, mit Rohstoffrechner, Fundorten, Dorfbewohner-Berufen und Steckbriefen für 62 Mobs
- `bauplaene/`: elf Baupläne Block für Block, von der Eisenfarm und den XP-Farmen (Endermen im End, Zombie- oder Skelett-Spawner) bis zur Kürbisfarm, der Hühnerfarm mit Kochautomat, Lava aus Tropfstein, der Gürteltierfarm und der Schmelzanlage; mit Ansichten der ganzen Farm von allen sechs Seiten (auch als Schnitt durch eine Reihe), frei drehbarer 3D-Ansicht (mit dem Finger drehen, kippen und zoomen), Bau-Modus und Druck, fertige Ebenen lassen sich abhaken. Lava-, Gürteltierfarm und Schmelzanlage sind in der Größe einstellbar, alle Pläne lassen sich vergleichen und als „im Spiel getestet“ markieren. Mit dem Editor zeichnest du eigene Baupläne Ebene für Ebene
- `karte/`: Rechenkern der Seed-Karte als WebAssembly. Biome mit der Bibliothek cubiomes (MIT), die Lage der Bauwerke nach den Bedrock-Regeln als eigene Umsetzung, geprüft an veröffentlichten Bedrock-Koordinaten
- `sw.js`, `manifest.webmanifest`, `icons/`: Offline-Betrieb und App-Symbol
- `lizenzen.txt`: Lizenzen der Schriften und Bibliotheken sowie Herkunft der Bilder

Made by Konterplatte.

NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT. Inoffizielles Hilfsprogramm, nicht von Mojang oder Microsoft. Minecraft ist eine Marke der Mojang Synergies AB. Namen und Rezeptdaten stammen aus Mojangs öffentlichem Repository bedrock-samples. Dieses Repository enthält keine Grafiken aus dem Spiel: Die Originaltexturen (© Mojang AB) lädt die App beim Ansehen direkt aus Mojangs Repository bedrock-samples und speichert sie nur auf deinem Gerät. Ohne Verbindung zeigt sie stattdessen eigene Farbplättchen.
