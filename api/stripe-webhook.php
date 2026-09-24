<?php
/*
 * King Media: Stripe calls this when a demo fee has been paid.
 * Add it in Stripe (Developers > Webhooks) with the event checkout.session.completed
 * and checkout.session.async_payment_succeeded, then put its signing secret in config.php.
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
$secret = (string) ($cfg['stripe']['webhook_secret'] ?? '');
$payload = (string) file_get_contents('php://input');
if ($secret === '' || !km_stripe_signature_ok($payload, (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? ''), $secret)) {
  http_response_code(400);
  echo 'Invalid signature';
  exit;
}
$event = json_decode($payload, true) ?: [];
$session = $event['data']['object'] ?? [];
$paidEvent = in_array($event['type'] ?? '', ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true);
if ($paidEvent && ($session['payment_status'] ?? '') === 'paid' && !km_record_payment($cfg, $session)) {
  http_response_code(500); // Stripe will try again later
  echo 'Could not record payment';
  exit;
}
http_response_code(200);
echo 'ok';
