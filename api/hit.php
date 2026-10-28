<?php
/*
 * KWM Systems: counts visits for the website's own statistics.
 * No cookies, no IP addresses, nothing shared. Each day is one small file of totals: pages viewed,
 * the website people came from, phone/tablet/computer, and how many quotes, demos and payments.
 * Read them at /api/stats.php (log in on contracts.php first). The privacy notice explains this.
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$done = function (): void { http_response_code(204); exit; };
$cfg = km_config();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !$cfg || !km_origin_ok($cfg)) $done();
// Robots and link previews aren't visitors
if (preg_match('/bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''))) $done();

$event = in_array($_POST['e'] ?? '', ['quote', 'demo', 'paid'], true) ? (string) $_POST['e'] : '';
$path = (string) ($_POST['p'] ?? '');
if ($event === '' && !preg_match('~^/[A-Za-z0-9/._-]{0,120}$~', $path)) $done();
$from = strtolower((string) ($_POST['r'] ?? ''));
if (!preg_match('/^[a-z0-9.-]{1,80}$/', $from)) $from = '';
$device = in_array($_POST['d'] ?? '', ['phone', 'tablet', 'computer'], true) ? (string) $_POST['d'] : '';

$dir = km_storage($cfg) . '/analytics';
if (!km_ensure_dir($dir)) $done();
$fh = @fopen($dir . '/' . date('Y-m-d') . '.json', 'c+');
if ($fh && flock($fh, LOCK_EX)) {
  $day = json_decode((string) stream_get_contents($fh), true);
  if (!is_array($day)) $day = [];
  $day += ['views' => 0, 'pages' => [], 'from' => [], 'devices' => [], 'events' => []];
  $add = function (array $list, string $key): array {
    if (!isset($list[$key]) && count($list) >= 300) $key = '(other)'; // keeps each day's file small
    $list[$key] = (int) ($list[$key] ?? 0) + 1;
    return $list;
  };
  if ($event !== '') {
    $day['events'] = $add((array) $day['events'], $event);
  } else {
    $day['views'] = (int) $day['views'] + 1;
    $day['pages'] = $add((array) $day['pages'], $path);
    if ($from !== '') $day['from'] = $add((array) $day['from'], $from);
    if ($device !== '') $day['devices'] = $add((array) $day['devices'], $device);
  }
  ftruncate($fh, 0);
  rewind($fh);
  fwrite($fh, (string) json_encode($day, JSON_UNESCAPED_SLASHES));
  fflush($fh);
  flock($fh, LOCK_UN);
}
if ($fh) fclose($fh);

// Totals older than 13 months aren't needed
if (random_int(1, 200) === 1) {
  foreach (glob($dir . '/*.json') ?: [] as $old) {
    if (filemtime($old) < time() - 400 * 86400) @unlink($old);
  }
}
$done();
