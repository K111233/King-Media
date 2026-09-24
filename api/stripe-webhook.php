<?php
/*
 * King Media: Stripe calls this when a demo fee has been paid. That's when the
 * full demo request (with files and AI brief) is emailed to you.
 * Signed contracts (api/sign.php) are recorded here too, and you're emailed when they're paid.
 * Add it in Stripe (Developers > Webhooks) with the events checkout.session.completed
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

// A signed contract's build fee and monthly plan (from api/sign.php)
if (($session['metadata']['kind'] ?? '') === 'contract') {
  $ok = !($paidEvent && ($session['payment_status'] ?? '') === 'paid') || km_contract_paid($cfg, $session);
  km_contract_retry($cfg, km_storage($cfg));
  http_response_code($ok ? 200 : 500); // 500: your email didn't go, so Stripe tries again later
  echo $ok ? 'ok' : 'Could not send the email';
  exit;
}
$job = ($paidEvent && ($session['payment_status'] ?? '') === 'paid') ? km_record_payment($cfg, $session) : [];

if ($job) {
  // Tell Stripe "got it" straight away, then write the AI brief and send the email
  $finish = km_finish_fn();
  if ($finish !== '') {
    ignore_user_abort(true);
    @set_time_limit(150);
    http_response_code(200);
    echo 'ok';
    $finish();
    km_email_paid($cfg, $job, 90);
    km_retry_unsent($cfg, km_storage($cfg));
    km_purge($cfg, km_storage($cfg));
    exit;
  }
  @set_time_limit(90);
  if (!km_email_paid($cfg, $job, 20)) {
    http_response_code(500); // Stripe will try again later
    echo 'Could not send the email';
    exit;
  }
}
http_response_code(200);
echo 'ok';
