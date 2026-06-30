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
- **Animierte Übungs-Figur** zu jeder Übung (sitzende Person, die die Bewegung
  vormacht) – plus optionale **echte Video-Demos** für ausgewählte Übungen
  (umschaltbar im Player über „Echte Person zeigen")
- **Virtueller Trainingspartner** für den ganzen Monat, der sich täglich meldet
- **Fortschritt**: erledigte Tage, Tage-Serie (Streak), Minuten,
  geschätzter Kalorienverbrauch und ein Gewichts-Tagebuch
- **Daten auf deinem Server** in einer einzigen JSON-Datei → iPhone und iPad
  bleiben automatisch synchron
- **Keine externen Dienste, keine Tracker, keine Abhängigkeiten**

## Wohin installieren? (VPS vs. Shared Hosting)

| Umgebung | Funktioniert? | Anleitung |
|---|---|---|
| **VPS** (Root/SSH) | ✅ ideal | unten („Schnellstart" + „Dauerhaft laufen lassen") |
| **Shared Hosting mit Node** (cPanel „Setup Node.js App", Plesk Node) | ✅ | `server.js` über das Node-Panel des Hosters starten |
| **Klassisches Shared Hosting** (nur PHP/Apache, kein Node) | ✅ über PHP-Variante | siehe [`deploy-php/README.md`](deploy-php/README.md) |

Eine **Subdomain** (z. B. `taichi.deine-domain.at`) ist auf allen drei Wegen
möglich. Auf dem VPS setzt du dafür einen Reverse-Proxy davor – am einfachsten
mit **Caddy**, das HTTPS automatisch besorgt:

```caddy
# /etc/caddy/Caddyfile
taichi.deine-domain.at {
    reverse_proxy 127.0.0.1:3000
}
```

## Schnellstart (VPS / lokal)

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

## Echte Video-Demos (optional)

Für einzelne Schlüsselübungen gibt es zusätzlich zur animierten Figur ein echtes
Video. Im Auslieferungszustand verweisen diese Videos auf eine externe Adresse,
damit sie im Test sofort laufen. Für **echtes Self-Hosting** (offline, ohne
externe Abhängigkeit) lädst du sie auf deinem Server lokal herunter:

```bash
bash scripts/fetch-videos.sh
```

Das speichert die Videos in `public/videos/`. Danach in `public/figure.js` die
`MOVE_VIDEO`-Einträge auf die lokalen Pfade (`videos/<name>.mp4`) umstellen und
`cp public/videos/*.mp4 docs/videos/` ausführen. Neue Übungs-Videos lassen sich
jederzeit ergänzen.

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
