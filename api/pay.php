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
$keyOk = false;
$back = function (string $state) use ($site, $id, $key, &$keyOk): void {
  $again = $keyOk ? '&r=' . $id . '&k=' . $key : ''; // lets the site offer "try again"
  header('Cache-Control: no-store');
  header('Location: ' . $site . '/?payment=' . $state . $again . '#contact', true, 303);
  exit;
};

if (!km_stripe_on($cfg)) $back('unavailable');
if ($id === '' || !hash_equals(km_pay_key($cfg, $id), $key)) $back('error');
$keyOk = true;
$dir = km_find_request(km_storage($cfg), $id);
if ($dir === '') $back('expired');
if (is_file($dir . '/paid.json')) $back('already');

$brief = json_decode((string) file_get_contents($dir . '/brief.json'), true) ?: [];
[$url, $err] = km_checkout_session($cfg, $brief);
if ($url === '') {
  km_log($cfg, $id . ' | Stripe Checkout FAILED: ' . $err);
  km_save_json(km_storage($cfg) . '/payment-status.json', ['at' => date('Y-m-d H:i'), 'ok' => false, 'problem' => km_hide_keys($err)]);
  $back('error');
}
km_save_json(km_storage($cfg) . '/payment-status.json', ['at' => date('Y-m-d H:i'), 'ok' => true, 'problem' => '']);
header('Cache-Control: no-store');
header('Location: ' . $url, true, 303);
