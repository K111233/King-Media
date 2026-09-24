<?php
/*
 * King Media: a quick health check for the forms, with no personal data.
 * Open https://kingmedia.uk/api/status.php to see whether everything is switched on.
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
$storage = km_storage($cfg);
$last = json_decode((string) @file_get_contents($storage . '/mail-status.json'), true) ?: null;
$waiting = 0;
foreach (km_ls($storage . '/requests') as $d) {
  $paid = is_file($d . '/paid.json') ? (json_decode((string) file_get_contents($d . '/paid.json'), true) ?: []) : [];
  if ($paid && empty($paid['emailed'])) $waiting++;
}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
echo json_encode([
  'config_found'        => (bool) $cfg,
  'form'                => (!empty($cfg['to_email']) && !empty($cfg['from_email'])) ? 'on' : 'off',
  'secret_set'          => km_secret_ok($cfg),
  'payments'            => km_stripe_on($cfg) ? 'on' : (km_stripe_configured($cfg) ? 'key set, but secret or site_url missing' : 'off'),
  'webhook_secret_set'  => !empty($cfg['stripe']['webhook_secret']),
  'ai_brief'            => (!empty($cfg['ai']['enabled']) && !empty($cfg['ai']['api_key'])) ? 'on' : 'off',
  'mail_transport'      => (string) ($cfg['mail_transport'] ?? 'mail'),
  'smtp_set'            => !empty($cfg['smtp']['host']) && !empty($cfg['smtp']['username']) && !empty($cfg['smtp']['password']),
  'storage_writable'    => $cfg ? km_ensure_dir($storage) : false,
  'last_email_ok'       => $last ? (bool) $last['ok'] : null,
  'last_email_problem'  => $last && !$last['ok'] ? (string) ($last['problem'] ?? 'failed') : '',
  'paid_waiting_to_send'=> $waiting,
  'last_payment_page_ok'      => ($pay = json_decode((string) @file_get_contents($storage . '/payment-status.json'), true)) ? (bool) $pay['ok'] : null,
  'last_payment_page_problem' => $pay && !$pay['ok'] ? (string) $pay['problem'] : '',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
