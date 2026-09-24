<?php
/*
 * King Media: sends a customer to Stripe Checkout to pay their £4.99 demo fee.
 * Link format (made by the form handler): /api/pay.php?r=KM-260924-4F7A&k=<key>
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
$site = rtrim((string) ($cfg['site_url'] ?? ''), '/');
$id = is_string($_GET['r'] ?? null) ? $_GET['r'] : '';
$key = is_string($_GET['k'] ?? null) ? $_GET['k'] : '';
$back = function (string $state) use ($site, $id): void {
  header('Cache-Control: no-store');
  header('Location: ' . $site . '/?payment=' . $state . (preg_match('/^KM-\d{6}-[0-9A-F]{4}$/', $id) ? '&r=' . $id : '') . '#contact', true, 303);
  exit;
};

if (!km_stripe_on($cfg)) $back('unavailable');
if ($id === '' || !hash_equals(km_pay_key($cfg, $id), $key)) $back('error');
$dir = km_find_request(km_storage($cfg), $id);
if ($dir === '') $back('expired');
if (is_file($dir . '/paid.json')) $back('already');

$brief = json_decode((string) file_get_contents($dir . '/brief.json'), true) ?: [];
[$url, $err] = km_checkout_session($cfg, $brief);
if ($url === '') {
  error_log('[King Media] Stripe Checkout failed for ' . $id . ': ' . $err);
  $back('error');
}
header('Cache-Control: no-store');
header('Location: ' . $url, true, 303);
