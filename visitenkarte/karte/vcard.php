<?php
/*
 * Digitale Visitenkarte – liefert die vCard (Version 3.0) inkl. Profilfoto aus.
 * iPhone (Safari) zeigt direkt "Kontakt erstellen", Android öffnet die Datei in Kontakte.
 * Das Foto wird aus der bestehenden Website gelesen; fehlt es, geht die vCard ohne Foto raus.
 */

$photoPath = __DIR__ . '/../assets/img/neu/mark-rund.jpg';

$lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Gerngroß;Mark;;;',
    'FN:Mark Gerngroß',
    'ORG:Mark Gerngross KI-Beratung',
    'TITLE:KI-Experte für Hotellerie & Gastronomie',
    'TEL;TYPE=CELL,VOICE:+49 178 4411778',
    'EMAIL;TYPE=INTERNET,WORK:anfrage@markgerngross.com',
    'ADR;TYPE=WORK:;;;Sonthofen;Bayern;87527;Deutschland',
    'URL;TYPE=WORK:https://markgerngross.com',
    'item1.URL:https://termine.markgerngross.com/b/erstgespraech',
    'item1.X-ABLabel:Termin buchen',
    'item2.URL:https://wa.me/491758997115',
    'item2.X-ABLabel:WhatsApp Julia (KI)',
    'item3.URL:https://launchmyagent.de',
    'item3.X-ABLabel:LaunchMyAgent',
    'item4.URL:https://www.linkedin.com/in/mark-gerngro%C3%9F/',
    'item4.X-ABLabel:LinkedIn',
    'item5.URL:https://www.instagram.com/markgerngross.de/',
    'item5.X-ABLabel:Instagram',
    'X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/mark-gerngro%C3%9F/',
    'X-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/markgerngross.de/',
    'NOTE:KI für Hotellerie & Gastronomie aus dem Allgäu. IHK-zertifizierter KI-Manager. '
        . 'Digitaler Empfang mit LaunchMyAgent. Julia (KI-Assistentin) antwortet sofort per WhatsApp: +49 175 8997115',
];

$photo = is_readable($photoPath) ? file_get_contents($photoPath) : false;
if ($photo === false) {
    // Fallback: Foto direkt von der Website laden
    $ctx = stream_context_create(['http' => ['timeout' => 4]]);
    $photo = @file_get_contents('https://markgerngross.com/assets/img/neu/mark-rund.jpg', false, $ctx);
}
if ($photo !== false && $photo !== '') {
    $lines[] = 'PHOTO;ENCODING=b;TYPE=JPEG:' . base64_encode($photo);
}

$lines[] = 'REV:' . gmdate('Ymd\THis\Z');
$lines[] = 'END:VCARD';

// Zeilen nach RFC 2426 auf 75 Bytes falten (Folgezeilen beginnen mit Leerzeichen)
function fold_line($line) {
    $out = '';
    $len = 0;
    $chars = preg_split('//u', $line, -1, PREG_SPLIT_NO_EMPTY);
    foreach ($chars as $ch) {
        $b = strlen($ch);
        if ($len + $b > 75) {
            $out .= "\r\n ";
            $len = 1;
        }
        $out .= $ch;
        $len += $b;
    }
    return $out;
}

$vcard = implode("\r\n", array_map('fold_line', $lines)) . "\r\n";

header('Content-Type: text/vcard; charset=utf-8');
header('Content-Disposition: attachment; filename="Mark-Gerngross.vcf"');
header('Content-Length: ' . strlen($vcard));
header('Cache-Control: no-cache');
echo $vcard;
