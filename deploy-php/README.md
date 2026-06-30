# Stuhl Tai-Chi auf klassischem Shared Hosting (PHP, ohne Node)

Wenn dein Hoster **kein Node.js** anbietet (reines PHP/Apache, z. B. die meisten
Webhosting-Tarife), nutzt du diese PHP-Variante statt `server.js`. Das Frontend
bleibt identisch, nur das Speichern läuft über `api.php` statt über Node.

## Was hochladen?

In den Wurzelordner deiner (Sub-)Domain – z. B. `taichi.deine-domain.at`:

```
taichi.deine-domain.at/        <- Document-Root der Subdomain
├── index.html                 \
├── styles.css                  |
├── app.js                      |  >> Inhalt des Ordners  public/
├── program.js                  |
├── manifest.webmanifest        |
├── sw.js                       |
├── icon.svg                   /
├── api.php                    <- aus deploy-php/
├── .htaccess                  <- aus deploy-php/
└── app-data/                  <- aus deploy-php/ (muss beschreibbar sein)
    └── .htaccess
```

Kurz: **alles aus `public/`** plus **`api.php`, `.htaccess` und der Ordner
`app-data/`** aus `deploy-php/`.

## Schritt für Schritt

1. **Subdomain anlegen** im Hosting-Panel (z. B. `taichi.deine-domain.at`) und
   den Document-Root notieren (oft `/httpdocs/taichi` oder `/public_html/taichi`).
2. Per **FTP/SFTP** die oben genannten Dateien in diesen Ordner laden.
3. Sicherstellen, dass `app-data/` **schreibbar** ist (Rechte `755` oder `775`).
   Bei Problemen `chmod 775 app-data` setzen.
4. **HTTPS** für die Subdomain aktivieren (bei fast allen Hostern per Klick,
   meist „Let’s Encrypt"). Wichtig, weil eine PWA nur über HTTPS installierbar ist.
5. Im **Safari** auf `https://taichi.deine-domain.at` öffnen → läuft.

## Voraussetzungen beim Hoster

- **PHP 7.4+** (praktisch überall vorhanden).
- **Apache mit `mod_rewrite`** (Standard). Läuft dein Hoster auf **nginx** statt
  Apache, wird `.htaccess` ignoriert – dann melde dich, ich gebe dir die passende
  nginx-Regel (zwei Zeilen).

## Funktioniert es?

Test im Browser: `https://taichi.deine-domain.at/api/health`
→ muss `{"ok":true,...}` zurückgeben. Dann stimmt die Umleitung auf `api.php`.

## Datensicherung

Dein kompletter Fortschritt liegt in `app-data/state.json`. Für ein Backup
einfach diese Datei herunterladen.
