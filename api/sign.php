<?php
/*
 * KWM Systems: the private page where a client signs their agreement and pays.
 * Only opens from a link made on api/contracts.php (…/api/sign.php?c=KMC-…&k=…).
 * Anyone without a valid link sees the normal "page not found".
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin'); // the private link never leaks to other sites (Stripe, email apps), but our own forms still say where they came from

$id = is_string($_REQUEST['c'] ?? null) ? $_REQUEST['c'] : '';
$key = is_string($_REQUEST['k'] ?? null) ? $_REQUEST['k'] : '';
if (!$cfg || !km_secret_ok($cfg) || $id === '' || !hash_equals(km_contract_key($cfg, $id), $key) || !($c = km_contract_load($cfg, $id))['dir']) {
  http_response_code(404);
  $page = @file_get_contents(dirname(__DIR__) . '/404.html');
  echo $page !== false ? $page : 'Page not found';
  exit;
}
$link = km_contract_url($cfg, $id);

// Their signed copy, to save or print
if (isset($_GET['copy']) && is_file($c['dir'] . '/agreement-signed.html')) {
  header('Content-Type: text/html; charset=utf-8');
  header('Content-Disposition: inline; filename="KWM Systems agreement - ' . km_slug($c['offer']['business'], 60) . '.html"');
  readfile($c['dir'] . '/agreement-signed.html');
  exit;
}

$errors = [];
$state = km_contract_state($c);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = (string) ($_POST['action'] ?? '');
  if (!km_origin_ok($cfg)) {
    $errors['form'] = 'Please reload the page and try again.';
  } elseif (!km_rate_ok(km_storage($cfg) . '/contract-rate', 30)) {
    $errors['form'] = 'Too many tries. Please wait a few minutes and try again.';
  } elseif ($action === 'sign' && $state === 'open') {
    [$ok, $errors] = km_contract_sign($cfg, $c, $_POST);
    if ($ok) { $c = km_contract_load($cfg, $id); $state = km_contract_state($c); }
  }
  if (!$errors && $state === 'signed' && in_array($action, ['sign', 'pay'], true)) {
    [$url, $err] = km_contract_checkout($cfg, $c);
    if ($url !== '') { header('Location: ' . $url, true, 303); exit; }
    if ($err === 'paid') { $c = km_contract_load($cfg, $id); $state = km_contract_state($c); }
    else {
      km_log($cfg, $id . ' | contract Checkout FAILED: ' . km_hide_keys($err));
      $errors['form'] = 'We couldn’t open the payment page just now. Please try again, or email info@kwmsystems.com.';
    }
  }
}
// Back from Stripe: confirm with Stripe straight away, in case its webhook is a moment behind
if (isset($_GET['paid']) && $state === 'signed' && !empty($c['checkout']['session'])) {
  [$st, $s] = km_stripe($cfg, 'GET', '/v1/checkout/sessions/' . rawurlencode((string) $c['checkout']['session']));
  if ($st === 200 && ($s['payment_status'] ?? '') === 'paid' && ($s['metadata']['contract_id'] ?? '') === $id && ($s['id'] ?? '') === $c['checkout']['session']) {
    km_contract_paid($cfg, $s);
    $c = km_contract_load($cfg, $id);
    $state = km_contract_state($c);
  }
}

$o = $c['offer'];
$plans = km_contract_plans($o);
$h = 'km_h';
$build = km_money((int) $o['build_pence']);
$nextCharge = !empty($c['paid']['next_charge']) ? date('j F Y', (int) $c['paid']['next_charge']) : '';
$emailedCopy = !empty($c['signed']['emails']['client']);
$checks = max(1, min(6, (int) ($_GET['paid'] ?? 1))); // how many times we've looked for Stripe's confirmation
$chosen = $c['signed'] ? ($plans[$c['signed']['plan']] ?? null) : null;
$posted = fn(string $k) => km_h((string) ($_POST[$k] ?? ''));
$err = fn(string $k) => isset($errors[$k]) ? '<p class="field__error" id="' . $k . 'Err">' . km_h($errors[$k]) . '</p>' : '<p class="field__error" id="' . $k . 'Err"></p>';
$bad = fn(string $k) => isset($errors[$k]) ? ' aria-invalid="true"' : '';
$saving = isset($plans['12m'], $plans['5y']) ? ($plans['12m']['monthly_pence'] - $plans['5y']['monthly_pence']) * 59 : 0; // month 1 is in the build fee on both plans
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Your agreement | KWM Systems</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0B0A08">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/mona-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/mona-text.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css?v=20260928a">
<style>
  .sign__lede { margin-top: 12px; max-width: 46ch; font-size: var(--fs-lede); line-height: 1.5; color: var(--fg-2); }
  .sign__box { --field-bg: var(--bg); margin-top: 32px; padding: clamp(20px, 3vw, 32px); background: var(--bg-raised); border: 1px solid var(--line); }
  .sign__box h2, .keypoints h2, .agreement > h2 { margin-top: 0; }
  .sign__notice { margin-top: 24px; padding: 16px 20px; background: var(--bg-raised); border: 1px solid var(--gold-rule); color: var(--fg); }
  .sign__notice--err { border-color: var(--err); border-left-width: 2px; }
  .plans { border: 0; padding: 0; margin: 0; display: grid; gap: 12px; }
  @media (min-width: 640px) { .plans { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }
  .plans legend { margin-bottom: 16px; padding: 0; font-size: 1.375rem; font-weight: 600; line-height: 1.25; letter-spacing: -.01em; color: var(--fg); }
  .plan { position: relative; display: grid; gap: 4px; padding: 16px 20px 20px 52px; border: 1px solid var(--line-ui); border-radius: var(--r-1); background: var(--bg); cursor: pointer; }
  .plan input { position: absolute; left: 20px; top: 20px; width: 20px; height: 20px; margin: 0; accent-color: var(--gold); }
  .plan:has(input:checked) { border-color: var(--gold); background: var(--bg-hover); }
  .plan:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
  .plan__name { font-weight: 600; color: var(--fg); }
  .plan__price { font-family: var(--f-display); font-weight: 760; font-size: 2rem; line-height: 1.1; letter-spacing: -.02em; color: var(--fg); font-variant-numeric: tabular-nums lining-nums; }
  .plan__price small { font-family: var(--f-text); font-weight: 400; font-size: var(--fs-small); letter-spacing: 0; color: var(--fg-2); }
  .plan__meta { font-size: var(--fs-small); color: var(--fg-2); }
  .pay-rows { display: grid; margin-top: 24px; border-top: 1px solid var(--line); }
  .pay-rows div { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .pay-rows dt { color: var(--fg-2); }
  .pay-rows dd { margin: 0; text-align: right; font-weight: 600; color: var(--fg); font-variant-numeric: tabular-nums lining-nums; }
  .agreement { margin-top: 48px; }
  .agreement h3 { margin-top: 32px; font-size: 1.0625rem; color: var(--fg); }
  .agreement h4 { font-size: 1rem; }
  .agreement p, .agreement li { font-size: var(--fs-small); }
  .agreement__table { overflow-x: auto; margin-block: 16px; }
  .agreement th { width: 38%; font-size: var(--fs-small); letter-spacing: 0; text-transform: none; color: var(--fg-2); font-weight: 600; }
  .agreement td { color: var(--fg); }
  .agreement__ref { font-size: var(--fs-small); color: var(--fg-3); }
  .sign-form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .sign-form > *, .plans > * { min-width: 0; }
  .agreement td, .agreement th, .pay-rows dd, .sign__lede { overflow-wrap: anywhere; }
  .sign__errors { margin: 0 0 16px; padding: 16px 20px; background: var(--bg); border: 1px solid var(--err); border-left-width: 2px; color: var(--fg); }
  .sign__errors ul { margin: 8px 0 0; padding-left: 20px; }
  .legal .sign__errors a { color: var(--fg); text-decoration-color: var(--err); }
  .sign-form .check { display: flex; gap: 12px; align-items: flex-start; color: var(--fg); }
  .sign-form .check input { margin-top: 3px; width: 20px; height: 20px; flex-shrink: 0; accent-color: var(--gold); }
  .sign-form .small { font-size: var(--fs-small); color: var(--fg-2); }
  .sign-form .btn { justify-self: start; }
  .field__error:empty { display: none; }
  .sign__sig { display: grid; gap: 4px; margin-top: 8px; padding: 8px 4px 10px; border-bottom: 1px solid var(--gold-rule); min-height: 4.2rem; }
  .sign__sig-label { font-size: var(--fs-label); font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--fg-3); }
  .sign__sig-name { font-family: var(--f-serif); font-style: italic; font-weight: 400; font-size: clamp(1.8rem, 6vw, 2.4rem); line-height: 1.1; color: var(--fg); overflow-wrap: anywhere; }
  .no-js .sign__sig, .sign__sig:not(.is-on) { display: none; }
  [data-plan-show][hidden] { display: none !important; }
  .keypoints { margin-top: 48px; padding: clamp(20px, 3vw, 32px); background: var(--bg-raised); border: 1px solid var(--gold-rule); }
  .keypoints h2 { font-size: 1.375rem; }
  .keypoints ul { display: grid; gap: 8px; padding-left: 20px; margin-top: 12px; }
  .keypoints li { color: var(--fg); font-size: var(--fs-small); overflow-wrap: anywhere; }
  .keypoints [data-plan-show] { display: block; }
</style>
</head>
<body class="legal-page">
<a class="skip-link" href="#main">Skip to main content</a>
<header class="legal-bar">
  <div class="container">
    <span class="brand" aria-label="KWM Systems">
      <svg class="brand__mark" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path class="mark-caret" d="M5 6H12V42H5Z"/><path class="mark-bracket" d="M33 6H43L25 24L43 42H33L15 24Z"/></svg>
      <span class="brand__word" aria-hidden="true">KWM <em>Systems</em></span>
    </span>
  </div>
</header>

<main id="main" class="legal">
  <div class="container legal__inner">
    <p class="section-tag"><span aria-hidden="true">(—)</span> Your agreement</p>
<?php if ($state === 'paid'): ?>
    <h1>All done. <em>Thank you!</em></h1>
<?php $paidTs = (int) ($c['paid']['paid_ts'] ?? 0); $paidToday = $paidTs && date('Y-m-d', $paidTs) === date('Y-m-d'); ?>
    <p class="sign__lede">Your agreement is signed and paid. <?= $paidToday ? $h($o['business']) . '’s website goes live tomorrow, and we’ll confirm the day it’s live.' : 'We’ll be in touch about your website.' ?></p>
    <div class="sign__box">
      <dl class="pay-rows">
        <div><dt>Paid</dt><dd><?= $h($c['paid']['amount'] ?? $build) ?><?= $paidTs ? ' on ' . $h(date('j F Y', $paidTs)) : '' ?></dd></div>
        <div><dt>Your plan</dt><dd><?= $h($chosen['name'] ?? '') ?></dd></div>
        <div><dt>Monthly payments</dt><dd><?= $h(km_money((int) ($chosen['monthly_pence'] ?? 0))) ?><?= $nextCharge ? ' from ' . $h($nextCharge) : ' a month' ?></dd></div>
      </dl>
      <p class="small" style="margin-top:16px"><?= $emailedCopy ? 'We’ve emailed you a copy of your signed agreement. You can also' : 'You can' ?> <a href="<?= $h($link) ?>&amp;copy=1" target="_blank" rel="noopener">open your signed copy<span class="visually-hidden"> (opens in a new tab)</span></a>.</p>
    </div>
<?php elseif ($state === 'withdrawn' || $state === 'expired'): ?>
    <h1>This link has <em>expired</em></h1>
    <p class="sign__lede">This agreement link is no longer active. Please email <a href="mailto:info@kwmsystems.com">info@kwmsystems.com</a> and we’ll send you a new one.</p>
<?php elseif ($state === 'signed'): ?>
    <h1>One step <em>left</em></h1>
    <p class="sign__lede">You’ve signed your agreement, <?= $h(explode(' ', (string) $c['signed']['name'])[0]) ?>. Now pay the build fee on Stripe’s secure page to get your website live.</p>
<?php if (isset($_GET['cancelled'])): ?>
    <p class="sign__notice" role="status">Payment not completed. No money has been taken. You can pay whenever you’re ready.</p>
<?php elseif (isset($_GET['paid']) && $checks < 6): ?>
    <meta http-equiv="refresh" content="3;url=<?= $h($link) ?>&amp;paid=<?= $checks + 1 ?>">
    <p class="sign__notice" role="status">Thanks! We’re confirming your payment with Stripe. This page updates by itself in a few seconds. Please don’t pay again.</p>
<?php elseif (isset($_GET['paid'])): ?>
    <p class="sign__notice" role="status">We haven’t had Stripe’s confirmation yet. If you’ve paid, there’s nothing more to do: we’ll email you as soon as it comes through. If you didn’t finish paying, you can pay below.</p>
<?php endif; ?>
<?php if (isset($errors['form'])): ?><p class="sign__notice sign__notice--err" role="alert"><?= $h($errors['form']) ?></p><?php endif; ?>
    <div class="sign__box">
      <dl class="pay-rows">
        <div><dt>Today</dt><dd><?= $h($build) ?></dd></div>
        <div><dt>Your plan</dt><dd><?= $h($chosen['name'] ?? '') ?></dd></div>
        <div><dt>Then</dt><dd><?= $h(km_money((int) ($chosen['monthly_pence'] ?? 0))) ?> a month, starting a month after you pay</dd></div>
      </dl>
<?php if (!(isset($_GET['paid']) && $checks < 6)): ?>
      <form method="post" action="<?= $h($link) ?>" style="margin-top:24px">
        <input type="hidden" name="action" value="pay">
        <button type="submit" class="btn btn--primary"><span class="btn__label">Pay <?= $h($build) ?> securely</span></button>
      </form>
<?php endif; ?>
      <p class="small" style="margin-top:16px"><?= $emailedCopy ? 'Your signed copy has been emailed to you. ' : '' ?><a href="<?= $h($link) ?>&amp;copy=1" target="_blank" rel="noopener">Open your signed copy<span class="visually-hidden"> (opens in a new tab)</span></a>. Your agreement starts once the build fee is paid.</p>
    </div>
<?php else: ?>
    <h1>Sign &amp; <em>pay</em></h1>
    <p class="sign__lede">For <?= $h($o['business']) ?>. Choose your plan, read your agreement, then sign and pay securely with Stripe. It takes about five minutes.</p>
    <form class="sign-form" method="post" action="<?= $h($link) ?>#sign" novalidate>
      <input type="hidden" name="action" value="sign">
      <div class="sign__box">
        <fieldset class="plans" id="plans" aria-describedby="planErr">
          <legend>1. Choose your plan</legend>
<?php foreach ($plans as $pk => $pl): ?>
          <label class="plan">
            <input type="radio" name="plan" value="<?= $h($pk) ?>" data-price="<?= $h(km_money($pl['monthly_pence'])) ?>" data-term="<?= $h($pl['term']) ?>"<?= (($_POST['plan'] ?? '') === $pk) ? ' checked' : '' ?> required>
            <span class="plan__name"><?= $h($pl['name']) ?></span>
            <span class="plan__price"><?= $h(km_money($pl['monthly_pence'])) ?> <small>a month</small></span>
            <span class="plan__meta"><?= $h(ucfirst(km_changes_text($pl))) ?> a month. <?= $pk === '5y' ? '5-year minimum' . ($saving > 0 ? ', and you save ' . $h(km_money($saving)) . ' over the 5 years (your first month is in the build fee)' : '') : '12-month minimum, then month to month' ?></span>
          </label>
<?php endforeach; ?>
        </fieldset>
        <?= $err('plan') ?>
        <dl class="pay-rows">
          <div><dt>Today</dt><dd><?= $h($build) ?> <span class="small" style="font-weight:400">(build, including your first month)</span></dd></div>
          <div><dt>Then</dt><dd><span data-plan-price><?= $h(implode(' or ', array_map(fn($p) => km_money($p['monthly_pence']), $plans))) ?></span> a month, starting a month after you pay</dd></div>
          <div><dt>Minimum term</dt><dd data-plan-term><?= $h(implode(' or ', array_map(fn($p) => $p['term'], $plans))) ?></dd></div>
        </dl>
      </div>

      <section class="agreement" aria-labelledby="agreementTitle">
        <h2 id="agreementTitle">2. Read your agreement</h2>
        <p class="small">KWM Systems Website Design, Hosting &amp; Maintenance Service Agreement, with your Order Form at the end. All prices include VAT. <a href="#keypoints">Jump to the key points</a></p>
        <?= km_agreement_body($o, [], 3) ?>
      </section>

      <section class="keypoints" id="keypoints" aria-labelledby="keyTitle">
        <h2 id="keyTitle">Key points: please read before you sign</h2>
        <p class="small">A plain-English summary. The full agreement above is what counts.</p>
        <?= km_agreement_keypoints($o) ?>
        <p class="small" style="margin-top:16px">Anything you were promised on the phone should be in this agreement. If it isn’t, email us at info@kwmsystems.com before you sign.</p>
      </section>

      <div class="sign__box" id="sign">
        <h2>3. Sign</h2>
<?php if ($errors): $to = ['plan' => '#plans', 'sign_name' => '#signName', 'sign_role' => '#signRole', 'agree' => '#agree', 'agree_terms' => '#agreeTerms']; ?>
        <div class="sign__errors" role="alert"><strong>Please check:</strong><ul>
<?php foreach ($errors as $ek => $em): ?>
          <li><?= isset($to[$ek]) ? '<a href="' . $to[$ek] . '">' . $h($em) . '</a>' : $h($em) ?></li>
<?php endforeach; ?>
        </ul></div>
<?php endif; ?>
        <div class="sign-form">
          <div class="field">
            <label for="signName">Type your full name to sign <span class="req" aria-hidden="true">*</span></label>
            <input id="signName" name="sign_name" type="text" autocomplete="off" autocorrect="off" spellcheck="false" autocapitalize="words" data-lpignore="true" data-1p-ignore required value="<?= $posted('sign_name') ?>" aria-describedby="signHelp sign_nameErr"<?= $bad('sign_name') ?>>
            <p class="small" id="signHelp">First and last name. Typing it counts as your signature.</p>
            <p class="sign__sig" aria-hidden="true"><span class="sign__sig-label">Your signature</span><span class="sign__sig-name" data-sig></span></p>
            <?= $err('sign_name') ?>
          </div>
          <div class="field">
            <label for="signRole">Your position <span class="req" aria-hidden="true">*</span></label>
            <input id="signRole" name="sign_role" type="text" autocapitalize="words" placeholder="For example Owner or Director" required value="<?= $posted('sign_role') ?>" aria-describedby="sign_roleErr"<?= $bad('sign_role') ?>>
            <?= $err('sign_role') ?>
          </div>
          <label class="check"><input type="checkbox" id="agree" name="agree" value="1" required aria-describedby="agreeErr"<?= !empty($_POST['agree']) ? ' checked' : '' ?><?= $bad('agree') ?>> <span>I’ve read and agree to the Service Agreement and Order Form above. <?= $h($o['business']) ?> is buying these services for its business, not as a consumer, and I’m authorised to sign for it. Typing my name counts as my signature.</span></label>
          <?= $err('agree') ?>
          <label class="check"><input type="checkbox" id="agreeTerms" name="agree_terms" value="1" required aria-describedby="agree_termsErr"<?= !empty($_POST['agree_terms']) ? ' checked' : '' ?><?= $bad('agree_terms') ?>> <span>I understand I’m committing to the minimum term of the plan I’ve chosen, that leaving early means paying an Early Exit Fee (clause 6), and how the domain name is owned (clause 8.5).</span></label>
          <?= $err('agree_terms') ?>
          <button type="submit" class="btn btn--primary"><span class="btn__label">Sign and pay <?= $h($build) ?></span></button>
          <p class="small">Next you’ll pay on Stripe’s secure page and set up your monthly payment. We’ll email you a copy of what you signed.</p>
        </div>
      </div>
    </form>
<?php endif; ?>
  </div>
</main>

<footer class="legal-foot">
  <div class="container">
    <p>© <?= date('Y') ?> KWM Systems</p>
    <p class="legal-foot__company"><?= km_h(KM_DISCLOSURE) ?></p>
    <p><a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy &amp; cookies</a> · <a href="mailto:info@kwmsystems.com">info@kwmsystems.com</a></p>
  </div>
</footer>
<script>
  // Their typed name, shown as a signature
  var sigIn = document.getElementById('signName'), sig = document.querySelector('.sign__sig'), sigName = document.querySelector('[data-sig]');
  if (sigIn && sig) {
    var drawSig = function () { sigName.textContent = sigIn.value.trim(); sig.classList.toggle('is-on', sigIn.value.trim() !== ''); };
    sigIn.addEventListener('input', drawSig); drawSig();
  }
  // Show the chosen plan's price and term in the summary, and only its lines in the key points
  document.querySelectorAll('input[name="plan"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var p = document.querySelector('[data-plan-price]'), t = document.querySelector('[data-plan-term]');
      if (p) p.textContent = r.dataset.price;
      if (t) t.textContent = r.dataset.term;
      document.querySelectorAll('[data-plan-show]').forEach(function (el) { el.hidden = el.dataset.planShow !== r.value; });
    });
    if (r.checked) r.dispatchEvent(new Event('change'));
  });
</script>
</body>
</html>
