<?php
/*
 * King Media: receives the demo request and question forms and emails them to you.
 * Settings live in config.php (copy config.sample.php and fill it in).
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
if (empty($cfg['to_email']) || empty($cfg['from_email'])) km_fail(503, 'not_configured', 'Our form isn’t switched on yet.');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') km_fail(405, 'method', 'Please use the form on our website.');
if (km_post_too_large()) km_fail(413, 'too_large', 'Your files are too big to send in one go. Please send fewer or smaller files.', ['files' => 'Your files are too big to send in one go.']);
if (!km_origin_ok($cfg)) km_fail(403, 'origin', 'Please use the form on our website.');

// Spam bots fill the hidden field or post instantly: tell them it worked and send nothing
if (km_post('km_extra', 200) !== '' || (int) ($_POST['t'] ?? 0) < 3) {
  km_respond(200, ['ok' => true]);
  exit;
}

$storage = km_storage($cfg);
if (!km_rate_ok($storage, (int) ($cfg['rate_limit_per_hour'] ?? 8))) km_fail(429, 'rate', 'You’ve sent a few requests already. Please try again in an hour, or email us.');

switch (km_choice('form', ['demo', 'question'])) {
  case 'demo': km_handle_demo($cfg, $storage); break;
  case 'question': km_handle_question($cfg); break;
  default: km_fail(400, 'form', 'Please use the form on our website.');
}
