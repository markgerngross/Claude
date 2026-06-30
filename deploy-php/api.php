<?php
/*
 * Stuhl-Tai-Chi – PHP-Backend fuer klassisches Shared Hosting (Apache + PHP).
 *
 * Ersetzt server.js, wenn auf dem Hoster KEIN Node.js laeuft. Es erfuellt
 * denselben Vertrag wie die Node-API:
 *   GET  /api/state    -> aktueller Stand (Standard, falls noch keiner)
 *   PUT  /api/state    -> Stand speichern (wird zusammengefuehrt)
 *   GET  /api/health   -> { ok: true }
 *
 * Das mitgelieferte .htaccess leitet /api/* auf diese Datei um, sodass das
 * Frontend unveraendert bleibt.
 *
 * Speicherort der Daten: ein Unterordner "app-data" neben dieser Datei, der
 * per .htaccess vor direktem Zugriff geschuetzt ist.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$DATA_DIR  = __DIR__ . '/app-data';
$STATE_FILE = $DATA_DIR . '/state.json';

function default_state() {
    return [
        'version' => 1,
        'profile' => ['name' => '', 'weightKg' => null, 'startDate' => null, 'partner' => null],
        'days' => (object)[],
        'weightLog' => [],
        'updatedAt' => null,
    ];
}

function read_state($file) {
    if (!is_file($file)) return default_state();
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    if (!is_array($data)) return default_state();
    return array_merge(default_state(), $data);
}

function write_state($dir, $file, $state) {
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $state['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
    // Atomar schreiben: temp + rename, damit die Datei nie halb beschrieben ist.
    $tmp = $file . '.tmp';
    file_put_contents($tmp, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    rename($tmp, $file);
    return $state;
}

// Endpunkt + Methode bestimmen (robust ueber PATH_INFO oder REQUEST_URI).
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if (strpos($uri, '/api/health') !== false && $method === 'GET') {
    echo json_encode(['ok' => true, 'time' => gmdate('Y-m-d\TH:i:s\Z')]);
    exit;
}

if (strpos($uri, '/api/state') !== false) {
    if ($method === 'GET') {
        echo json_encode(read_state($STATE_FILE));
        exit;
    }
    if ($method === 'PUT' || $method === 'POST') {
        $body = file_get_contents('php://input');
        if (strlen($body) > 1000000) {
            http_response_code(413);
            echo json_encode(['error' => 'payload too large']);
            exit;
        }
        $incoming = json_decode($body ?: '{}', true);
        if (!is_array($incoming)) $incoming = [];
        $merged = array_merge(read_state($STATE_FILE), $incoming);
        echo json_encode(write_state($DATA_DIR, $STATE_FILE, $merged));
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'unknown endpoint']);
