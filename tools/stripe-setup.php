<?php
/*
 * One-off Stripe setup for King Media. Creates the products and prices, so build
 * invoices (Stripe Invoicing) and monthly plans (Stripe Billing) can be made from
 * the Dashboard in a few clicks.
 * Safe to run again: anything that already exists is left alone.
 *
 *   php tools/stripe-setup.php sk_test_...    (then again with sk_live_... when you go live)
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('KM_API', true);
require __DIR__ . '/../api/lib.php';

$key = (string) ($argv[1] ?? getenv('STRIPE_SECRET_KEY'));
if (!preg_match('/^(sk|rk)_(test|live)_\w+$/', $key)) {
  fwrite(STDERR, "Usage: php tools/stripe-setup.php sk_test_...\n");
  exit(1);
}
$cfg = ['stripe' => ['secret_key' => $key, 'api_base' => getenv('STRIPE_API_BASE') ?: 'https://api.stripe.com']];
echo 'Stripe ' . (str_contains($key, '_live_') ? 'LIVE' : 'test') . " mode\n\n";

$stop = function (string $what, int $status, array $res): void {
  fwrite(STDERR, "Couldn't {$what} (HTTP {$status}): " . ($res['error']['message'] ?? 'no details') . "\n");
  exit(1);
};

$products = [
  'km_build'      => ['Website design & build', 'One-off design and build of your website.'],
  'km_management' => ['Website management', 'Hosting, domain, SSL, security updates, daily backups and up to 5 website changes a month.'],
];
foreach ($products as $id => [$name, $desc]) {
  [$st] = km_stripe($cfg, 'GET', '/v1/products/' . $id);
  if ($st === 200) { echo "✓ Product already there: {$name}\n"; continue; }
  [$st, $res] = km_stripe($cfg, 'POST', '/v1/products', ['id' => $id, 'name' => $name, 'description' => $desc]);
  if ($st !== 200) $stop("create the product {$name}", $st, $res);
  echo "+ Created product: {$name}\n";
}

// lookup_key => [product, pence, nickname, monthly?]
$prices = [
  'km_build_1'         => ['km_build', 49499, '1 page', false],
  'km_build_2'         => ['km_build', 89999, '2 pages', false],
  'km_build_3'         => ['km_build', 119999, '3 pages', false],
  'km_build_4plus'     => ['km_build', 144999, '4+ pages', false],
  'km_monthly_small_12' => ['km_management', 4999, '1–2 pages, 12-Month Plan', true],
  'km_monthly_small_5y' => ['km_management', 3999, '1–2 pages, 5-Year Plan', true],
  'km_monthly_large_12' => ['km_management', 5999, '3+ pages, 12-Month Plan', true],
  'km_monthly_large_5y' => ['km_management', 4999, '3+ pages, 5-Year Plan', true],
];
[$st, $res] = km_stripe($cfg, 'GET', '/v1/prices', ['lookup_keys' => array_keys($prices), 'limit' => 100]);
if ($st !== 200) $stop('list prices', $st, $res);
$have = array_column($res['data'] ?? [], 'id', 'lookup_key');
foreach ($prices as $lookup => [$product, $pence, $nick, $monthly]) {
  $label = sprintf('£%s%s  %s', number_format($pence / 100, 2), $monthly ? '/month' : '', $nick);
  if (isset($have[$lookup])) { echo "✓ Price already there: {$label}\n"; continue; }
  $params = ['product' => $product, 'currency' => 'gbp', 'unit_amount' => $pence, 'nickname' => $nick, 'lookup_key' => $lookup];
  if ($monthly) $params['recurring'] = ['interval' => 'month'];
  [$st, $res] = km_stripe($cfg, 'POST', '/v1/prices', $params);
  if ($st !== 200) $stop("create the price {$label}", $st, $res);
  echo "+ Created price: {$label}\n";
}

echo "\nAll set.\n";
