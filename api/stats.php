<?php
/*
 * KWM Systems: your private website statistics (from api/hit.php).
 * Log in on https://kwmsystems.com/api/contracts.php with the admin_password from config.php,
 * then open https://kwmsystems.com/api/stats.php. Add ?days=7 or ?days=90 to change the period.
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Content-Type: text/html; charset=utf-8');

// The same login as contracts.php: its signed admin cookie
$password = (string) ($cfg['admin_password'] ?? '');
$ready = $cfg && km_secret_ok($cfg) && strlen($password) >= 12;
$loggedIn = false;
if ($ready && is_string($_COOKIE['km_admin'] ?? null)) {
  $cookieKey = hash('sha256', (string) $cfg['secret'] . '|' . $password);
  [$exp] = explode('.', $_COOKIE['km_admin'] . '.', 2);
  $loggedIn = ctype_digit($exp) && (int) $exp > time()
    && hash_equals((int) $exp . '.' . hash_hmac('sha256', 'admin|' . (int) $exp, $cookieKey), $_COOKIE['km_admin']);
}

$days = max(1, min(400, (int) ($_GET['days'] ?? 30)));
$total = ['views' => 0, 'pages' => [], 'from' => [], 'devices' => [], 'events' => []];
$daily = [];
if ($loggedIn) {
  $dir = km_storage($cfg) . '/analytics';
  for ($i = $days - 1; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-{$i} days"));
    $file = $dir . '/' . $date . '.json';
    $day = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    $views = is_array($day) ? (int) ($day['views'] ?? 0) : 0;
    $daily[$date] = $views;
    $total['views'] += $views;
    if (!is_array($day)) continue;
    foreach (['pages', 'from', 'devices', 'events'] as $k) {
      foreach ((array) ($day[$k] ?? []) as $key => $n) $total[$k][(string) $key] = ($total[$k][(string) $key] ?? 0) + (int) $n;
    }
  }
  foreach (['pages', 'from', 'devices', 'events'] as $k) arsort($total[$k]);
}
$peak = max(1, ...array_values($daily ?: [0]));
$table = function (string $title, array $rows, string $empty): string {
  if (!$rows) return '<h2>' . km_h($title) . '</h2><p class="muted">' . km_h($empty) . '</p>';
  $out = '<h2>' . km_h($title) . '</h2><table><tbody>';
  foreach (array_slice($rows, 0, 25, true) as $key => $n) $out .= '<tr><th scope="row">' . km_h((string) $key) . '</th><td>' . number_format((int) $n) . '</td></tr>';
  return $out . '</tbody></table>';
};
$events = $total['events'];
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Website statistics | KWM Systems</title>
<style>
  body { margin: 0; background: #F2F4F8; color: #0B1B3A; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  main { max-width: 960px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { margin: 0 0 4px; font-size: 1.75rem; letter-spacing: -0.02em; }
  h2 { margin: 32px 0 10px; font-size: 1.125rem; }
  .muted { color: #5E6A82; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 24px; }
  .card { padding: 16px 18px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
  .card b { display: block; font-size: 1.6rem; letter-spacing: -0.02em; }
  .card span { color: #5E6A82; font-size: .9rem; }
  .bars { display: grid; gap: 4px; padding: 16px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
  .bar { display: grid; grid-template-columns: 92px 1fr 48px; gap: 10px; align-items: center; font-size: .85rem; }
  .bar i { display: block; height: 10px; border-radius: 5px; background: #D1A84E; min-width: 2px; }
  .bar span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #E3E7EF; border-radius: 14px; overflow: hidden; }
  th, td { padding: 9px 14px; border-bottom: 1px solid #E3E7EF; text-align: left; font-weight: 400; overflow-wrap: anywhere; }
  td { text-align: right; font-variant-numeric: tabular-nums; width: 90px; }
  nav a { margin-right: 14px; color: #2B4F94; }
  .note { margin-top: 32px; font-size: .875rem; color: #5E6A82; }
</style>
</head>
<body>
<main>
<?php if (!$ready): ?>
  <h1>Website statistics</h1>
  <p>This page is switched off. Add an <code>admin_password</code> (12 characters or more) and a <code>secret</code> to config.php, then reload.</p>
<?php elseif (!$loggedIn): ?>
  <h1>Website statistics</h1>
  <p>Please <a href="contracts.php">log in on the contracts page</a> first, then come back here.</p>
<?php else: ?>
  <h1>Website statistics</h1>
  <p class="muted">The last <?= $days ?> days. Counted on our own server: no cookies, no IP addresses, totals only.</p>
  <nav aria-label="Period"><a href="?days=7">7 days</a><a href="?days=30">30 days</a><a href="?days=90">90 days</a><a href="?days=365">12 months</a></nav>
  <div class="cards">
    <div class="card"><b><?= number_format($total['views']) ?></b><span>page views</span></div>
    <div class="card"><b><?= number_format((int) ($events['quote'] ?? 0)) ?></b><span>free quote requests sent</span></div>
    <div class="card"><b><?= number_format((int) ($events['demo'] ?? 0)) ?></b><span>demo requests started</span></div>
    <div class="card"><b><?= number_format((int) ($events['paid'] ?? 0)) ?></b><span>demo fees paid</span></div>
  </div>
  <h2>Page views by day</h2>
  <div class="bars">
<?php foreach ($daily as $date => $views): ?>
    <div class="bar"><span><?= km_h(date('D j M', strtotime($date))) ?></span><i style="width: <?= round($views / $peak * 100, 1) ?>%"></i><span><?= number_format($views) ?></span></div>
<?php endforeach; ?>
  </div>
  <?= $table('Pages', $total['pages'], 'No page views yet.') ?>
  <?= $table('Where visitors came from', $total['from'], 'No visits from other websites yet. Visits typed in directly, or from apps, don’t show a website.') ?>
  <?= $table('Devices', $total['devices'], 'No visits yet.') ?>
  <p class="note">Visitors who switch counting off, or whose browser asks sites not to track them, aren’t counted. Daily totals are kept for 13 months.</p>
<?php endif; ?>
</main>
</body>
</html>
