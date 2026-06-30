# Stuhl Tai-Chi · 28 Tage

Eine selbst-gehostete Web-App (PWA) für **Stuhl-Tai-Chi** – sanftes Tai-Chi im
Sitzen. Gedacht als ruhiger Begleiter für mehr Beweglichkeit, Kreislauf und als
Unterstützung beim Abnehmen, besonders angenehm für Einsteiger und Männer 50+.

Statt eines teuren App-Abos läuft die App auf **deinem eigenen Server** und du
öffnest sie im Browser (Safari) auf iPhone oder iPad. Über *„Zum Home-Bildschirm
hinzufügen"* sieht und verhält sie sich wie eine echte App – inklusive
Offline-Nutzung.

## Was die App kann

- **28-Tage-Programm** in vier Wochen: Grundlagen → Aufbau → Fluss → Meisterung
- **Geführte Sessions** mit Timer, Atem-Anleitung und echten Stuhl-Tai-Chi-Übungen
  (Wolkenhände, Mähne des Wildpferds teilen, Affen abwehren, Goldener Hahn …)
- **Virtueller Trainingspartner** für den ganzen Monat, der sich täglich meldet
- **Fortschritt**: erledigte Tage, Tage-Serie (Streak), Minuten,
  geschätzter Kalorienverbrauch und ein Gewichts-Tagebuch
- **Daten auf deinem Server** in einer einzigen JSON-Datei → iPhone und iPad
  bleiben automatisch synchron
- **Keine externen Dienste, keine Tracker, keine Abhängigkeiten**

## Schnellstart

Voraussetzung: Node.js ≥ 18 (mehr nicht – keine npm-Pakete nötig).

```bash
node server.js
```

Dann im Browser öffnen: `http://<server-ip>:3000`

Port/Host lassen sich per Umgebungsvariable ändern:

```bash
PORT=8080 HOST=0.0.0.0 node server.js
```

## Auf iPhone/iPad „installieren"

1. Die Adresse deines Servers in **Safari** öffnen.
2. Teilen-Symbol → **„Zum Home-Bildschirm"**.
3. Ab jetzt startet die App im Vollbild wie eine normale App.

## Dauerhaft laufen lassen (Beispiel: systemd)

```ini
# /etc/systemd/system/stuhl-taichi.service
[Unit]
Description=Stuhl Tai-Chi
After=network.target

[Service]
WorkingDirectory=/pfad/zur/app
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now stuhl-taichi
```

Für Zugriff von unterwegs empfiehlt sich ein Reverse-Proxy mit HTTPS
(z. B. Caddy oder nginx) vor dem Node-Prozess.

## Daten & Backup

Der gesamte Fortschritt liegt in `data/state.json`. Diese Datei ist bewusst
**nicht** im Git-Repository (siehe `.gitignore`). Für ein Backup genügt es,
`data/state.json` zu sichern.

## Aufbau

```
server.js              Zero-Dependency Node-Server (statische Dateien + JSON-API)
public/
  index.html           App-Schale
  styles.css           Mobil-first Design
  app.js               Logik: Views, Session-Player, Fortschritt
  program.js           Inhalt: Übungs-Bibliothek, 28-Tage-Plan, Partner
  manifest.webmanifest PWA-Manifest
  sw.js                Service Worker (Offline)
  icon.svg             App-Icon
data/state.json        Dein Fortschritt (wird beim ersten Start angelegt)
```

## Wichtiger Hinweis

Diese App ist **kein medizinisches Produkt** und ersetzt keine ärztliche
Beratung. Stuhl-Tai-Chi ist sanft, aber bewege dich nur im schmerzfreien
Bereich. Bei gesundheitlichen Beschwerden oder Unsicherheit sprich vor
Trainingsbeginn mit deinem Arzt. Die Kalorienangaben sind grobe Schätzungen.
