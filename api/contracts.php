<?php
/*
 * King Media: your private page for making "sign and pay" links.
 * Open https://kingmedia.uk/api/contracts.php and log in with the admin_password from config.php.
 */
define('KM_API', true);
require __DIR__ . '/lib.php';

date_default_timezone_set('Europe/London');
$cfg = km_config();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin'); // the private link never leaks to other sites (Stripe, email apps), but our own forms still say where they came from
header('X-Frame-Options: DENY');

$password = (string) ($cfg['admin_password'] ?? '');
$ready = $cfg && km_secret_ok($cfg) && strlen($password) >= 12;
$https = (($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
$cookieKey = $ready ? hash('sha256', (string) $cfg['secret'] . '|' . $password) : '';
$signCookie = fn(int $exp) => $exp . '.' . hash_hmac('sha256', 'admin|' . $exp, $cookieKey);
$loggedIn = false;
if ($ready && is_string($_COOKIE['km_admin'] ?? null)) {
  [$exp] = explode('.', $_COOKIE['km_admin'] . '.', 2);
  $loggedIn = ctype_digit($exp) && (int) $exp > time() && hash_equals($signCookie((int) $exp), $_COOKIE['km_admin']);
}
$csrf = $loggedIn ? hash_hmac('sha256', 'csrf|' . $_COOKIE['km_admin'], $cookieKey) : '';
$setCookie = fn(string $value, int $exp) => setcookie('km_admin', $value, ['expires' => $exp, 'path' => '/api/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);

$errors = [];
$made = '';
$notice = '';
if ($ready && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = (string) ($_POST['action'] ?? '');
  if ($action === 'login') {
    $site = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin');
    if (!km_origin_ok($cfg) || !in_array($site, ['same-origin', 'none'], true)) $errors['login'] = 'Please reload the page and try again.'; // other websites can't use up your tries
    elseif (!km_ensure_dir(km_storage($cfg))) $errors['login'] = 'The private storage folder isn’t writable, so logging in is switched off. Check storage_dir in config.php.';
    elseif (!km_rate_ok(km_storage($cfg) . '/admin-rate', 8, true, false)) $errors['login'] = 'Too many wrong passwords. Wait an hour and try again.';
    elseif (!hash_equals($password, (string) ($_POST['password'] ?? ''))) { km_rate_ok(km_storage($cfg) . '/admin-rate', 8, true); $errors['login'] = 'That password isn’t right.'; km_log($cfg, 'contracts page: wrong password'); }
    else { $exp = time() + 12 * 3600; $setCookie($signCookie($exp), $exp); header('Location: contracts.php', true, 303); exit; }
  } elseif ($loggedIn && hash_equals($csrf, (string) ($_POST['csrf'] ?? ''))) {
    if ($action === 'logout') { $setCookie('', time() - 3600); header('Location: contracts.php', true, 303); exit; }
    if ($action === 'create') {
      if (($problem = km_contracts_problem($cfg)) !== '') $errors['form'] = $problem;
      else {
        [$id, $errors] = km_contract_create($cfg, $_POST);
        if ($id !== '') { header('Location: contracts.php?made=' . rawurlencode($id), true, 303); exit; }
      }
    }
    if ($action === 'withdraw') {
      $c = km_contract_load($cfg, (string) ($_POST['id'] ?? ''));
      if ($c['dir'] && in_array(km_contract_state($c), ['open', 'signed', 'expired'], true)) {
        $c['offer']['withdrawn'] = true;
        km_save_json($c['dir'] . '/offer.json', $c['offer']);
        if (!empty($c['checkout']['session'])) km_stripe($cfg, 'POST', '/v1/checkout/sessions/' . rawurlencode((string) $c['checkout']['session']) . '/expire'); // close any open payment page
        km_log($cfg, $c['offer']['id'] . ' | contract link withdrawn');
        header('Location: contracts.php?withdrawn=' . rawurlencode($c['offer']['id']), true, 303);
        exit;
      }
    }
  } elseif ($loggedIn) {
    $errors['form'] = 'That form was out of date. Please try again.';
  }
}
if ($loggedIn && is_string($_GET['made'] ?? null) && km_contract_dir($cfg, $_GET['made']) !== '' && km_contract_state(km_contract_load($cfg, $_GET['made'])) === 'open') $made = $_GET['made'];
if ($loggedIn && is_string($_GET['withdrawn'] ?? null) && ($wc = km_contract_load($cfg, $_GET['withdrawn']))['dir']) $notice = 'Link withdrawn for ' . $wc['offer']['business'] . '. It no longer opens.';
$problem = $ready ? km_contracts_problem($cfg) : '';
$h = 'km_h';
$v = fn(string $k) => km_h((string) ($_POST[$k] ?? ''));
$err = fn(string $k) => isset($errors[$k]) ? '<p class="field__error">' . km_h($errors[$k]) . '</p>' : '';
$labels = ['open' => 'Sent, not signed yet', 'signed' => 'Signed, not paid yet', 'paid' => 'Signed and paid', 'withdrawn' => 'Withdrawn', 'expired' => 'Expired'];
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Contract links | King Media</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="stylesheet" href="/css/style.css?v=20260925a">
<style>
  .admin__box { margin-top: 1.5rem; padding: clamp(1.1rem, 3vw, 1.6rem); border-radius: 20px; background: var(--ink-850); border: 1px solid var(--line); }
  .admin__box h2 { margin-top: 0; }
  .admin__grid { display: grid; gap: 1rem; }
  @media (min-width: 700px) { .admin__grid { grid-template-columns: 1fr 1fr; } .admin__grid .wide { grid-column: 1 / -1; } }
  .admin__note { margin-top: 1.25rem; padding: 1rem 1.2rem; border-radius: 14px; border: 1px solid rgba(212, 175, 55, .45); background: rgba(212, 175, 55, .08); color: var(--bone-100); }
  .admin__note--err { border-color: #E5746A; background: rgba(229, 116, 106, .1); }
  .admin__link { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .75rem; }
  .admin__link input { flex: 1 1 18rem; min-width: 0; font-family: var(--f-mono); font-size: .8rem; }
  .small { font-size: .875rem; color: var(--bone-300); }
  .check { display: flex; gap: .6rem; align-items: flex-start; color: var(--bone-100); }
  .check input { margin-top: .25rem; width: 1.15rem; height: 1.15rem; accent-color: var(--acc-500); }
  .admin table td .btn { min-height: 36px; }
  .field select { width: 100%; }
</style>
</head>
<body class="legal-page">
<header class="legal-bar">
  <div class="container">
    <span class="brand"><svg class="brand__mark" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path class="mark-caret" d="M5 6H12V42H5Z"/><path class="mark-bracket" d="M33 6H43L25 24L43 42H33L15 24Z"/></svg><span class="brand__word">King <em>Media</em></span></span>
<?php if ($loggedIn): ?>
    <form method="post"><input type="hidden" name="action" value="logout"><input type="hidden" name="csrf" value="<?= $h($csrf) ?>"><button class="btn btn--ghost btn--sm" type="submit"><span class="btn__label">Log out</span></button></form>
<?php endif; ?>
  </div>
</header>
<main id="main" class="legal admin">
  <div class="container legal__inner" style="max-width:56rem">
    <p class="section-tag"><span aria-hidden="true">(—)</span> Private</p>
    <h1>Contract <em>links</em></h1>
<?php if (!$ready): ?>
    <p class="admin__note">This page is switched off. Add a line like <code>'admin_password' =&gt; 'a long password you'll remember',</code> (12 characters or more) to config.php, then reload.</p>
<?php elseif (!$loggedIn): ?>
    <form method="post" class="admin__box" style="max-width:26rem">
      <input type="hidden" name="action" value="login">
      <div class="field">
        <label for="pw">Password</label>
        <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
        <?= $err('login') ?>
      </div>
      <button type="submit" class="btn btn--primary" style="margin-top:1rem"><span class="btn__label">Log in</span></button>
    </form>
<?php else: ?>
<?php if ($problem): ?><p class="admin__note admin__note--err" role="alert"><?= $h($problem) ?> Links can’t be made until this is sorted.</p><?php endif; ?>
<?php if ($notice): ?><p class="admin__note" role="status"><?= $h($notice) ?></p><?php endif; ?>
<?php if ($made): $mc = km_contract_load($cfg, $made); ?>
    <div class="admin__note" role="status">
      <strong>Link ready for <?= $h($mc['offer']['business']) ?>.</strong> Send it to <?= $h($mc['offer']['email']) ?> by email or text. It works for <?= KM_CONTRACT_DAYS ?> days.
      <div class="admin__link"><input type="text" readonly value="<?= $h(km_contract_url($cfg, $made)) ?>" id="madeLink" aria-label="The link to send"><button type="button" class="btn btn--primary btn--sm" data-copy="#madeLink"><span class="btn__label">Copy link</span></button><a class="btn btn--ghost btn--sm" href="<?= $h(km_contract_url($cfg, $made)) ?>" target="_blank" rel="noopener"><span class="btn__label">Preview</span></a></div>
    </div>
<?php endif; ?>
    <form method="post" class="admin__box" novalidate>
      <h2>Make a new link</h2>
      <p class="small">The client picks the 12-Month or 5-Year Plan themselves. Leave the price boxes empty to use your standard prices.</p>
      <?= $err('form') ?>
      <input type="hidden" name="action" value="create"><input type="hidden" name="csrf" value="<?= $h($csrf) ?>">
      <div class="admin__grid" style="margin-top:1rem">
        <div class="field"><label for="business">Business legal / trading name *</label><input id="business" name="business" required value="<?= $v('business') ?>"><?= $err('business') ?></div>
        <div class="field"><label for="company_number">Their company number (if a company)</label><input id="company_number" name="company_number" value="<?= $v('company_number') ?>"></div>
        <div class="field wide"><label for="address">Business address *</label><textarea id="address" name="address" rows="2" required><?= $v('address') ?></textarea><?= $err('address') ?></div>
        <div class="field"><label for="contact">Contact name *</label><input id="contact" name="contact" required autocapitalize="words" value="<?= $v('contact') ?>"><?= $err('contact') ?></div>
        <div class="field"><label for="email">Contact email *</label><input id="email" name="email" type="email" inputmode="email" required value="<?= $v('email') ?>"><?= $err('email') ?></div>
        <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" value="<?= $v('phone') ?>"></div>
        <div class="field"><label for="domain">Website address *</label><input id="domain" name="domain" placeholder="theirbusiness.co.uk" required value="<?= $v('domain') ?>"><?= $err('domain') ?></div>
        <div class="field"><label for="pages">Number of pages *</label>
          <select id="pages" name="pages" required><option value="">Choose…</option>
<?php foreach (KM_PAGE_LABELS as $pk => $pl): ?>
            <option value="<?= $h($pk) ?>"<?= (($_POST['pages'] ?? '') === $pk) ? ' selected' : '' ?>><?= $h($pl) ?> (<?= $h(km_money(KM_BUILD_PENCE[$pk])) ?>, then <?= $h(km_money(KM_PLANS['12m']['pence'][$pk])) ?> or <?= $h(km_money(KM_PLANS['5y']['pence'][$pk])) ?> a month)</option>
<?php endforeach; ?>
          </select><?= $err('pages') ?></div>
        <div class="field"><label for="build">Build fee, if not standard (£)</label><input id="build" name="build" inputmode="decimal" placeholder="Standard" value="<?= $v('build') ?>"><?= $err('build') ?></div>
        <div class="field"><label for="monthly_12m">12-Month Plan monthly, if not standard (£)</label><input id="monthly_12m" name="monthly_12m" inputmode="decimal" placeholder="Standard" value="<?= $v('monthly_12m') ?>"><?= $err('monthly_12m') ?></div>
        <div class="field"><label for="monthly_5y">5-Year Plan monthly, if not standard (£)</label><input id="monthly_5y" name="monthly_5y" inputmode="decimal" placeholder="Standard" value="<?= $v('monthly_5y') ?>"><?= $err('monthly_5y') ?></div>
        <div class="field wide"><label for="quoted">Separately quoted work included (optional)</label><textarea id="quoted" name="quoted" rows="2" placeholder="For example: online booking system, as quoted on 20 September"><?= $v('quoted') ?></textarea></div>
        <div class="field"><label for="domain_status">Domain name</label>
          <select id="domain_status" name="domain_status">
<?php foreach (['provider' => 'New: we register it and own it (standard)', 'existing' => 'They already own it (it stays theirs)', 'client' => 'Premium: registered in their name, they own it'] as $dk => $dl): ?>
            <option value="<?= $dk ?>"<?= (($_POST['domain_status'] ?? 'provider') === $dk) ? ' selected' : '' ?>><?= $h($dl) ?></option>
<?php endforeach; ?>
          </select></div>
        <div class="field"><label for="demo">Approved demo (link or short description)</label><input id="demo" name="demo" placeholder="The demo link they approved" value="<?= $v('demo') ?>"></div>
        <div class="field wide"><label for="agreed">Anything else agreed on the phone (optional)</label><textarea id="agreed" name="agreed" rows="2" placeholder="Anything you promised that isn't in the standard agreement. Leave empty if nothing."><?= $v('agreed') ?></textarea></div>
      </div>
      <button type="submit" class="btn btn--primary" style="margin-top:1.25rem"<?= $problem ? ' disabled' : '' ?>><span class="btn__label">Make the link</span></button>
    </form>

    <div class="admin__box">
      <h2>Your links</h2>
<?php $list = km_contract_list($cfg); if (!$list): ?>
      <p class="small">No links yet.</p>
<?php else: ?>
      <div class="legal__table"><table>
        <thead><tr><th scope="col">Business</th><th scope="col">Made</th><th scope="col">Status</th><th scope="col">Link</th></tr></thead>
        <tbody>
<?php foreach ($list as $row): $o = $row['offer']; ?>
          <tr>
            <td><?= $h($o['business']) ?><br><span class="small"><?= $h(km_money((int) $o['build_pence'])) ?><?= $row['signed'] ? ' · ' . $h(KM_PLANS[$row['signed']['plan']]['name'] ?? '') : '' ?></span></td>
            <td><?= $h(date('j M Y', (int) $o['created'])) ?></td>
            <td><?= $h($labels[$row['state']] ?? $row['state']) ?></td>
            <td>
<?php if (in_array($row['state'], ['open', 'signed'], true)): ?>
              <input type="text" readonly value="<?= $h(km_contract_url($cfg, $row['id'])) ?>" id="l<?= $h($row['id']) ?>" aria-label="Link for <?= $h($o['business']) ?>" style="position:absolute;left:-9999px">
              <button type="button" class="btn btn--ghost btn--sm" data-copy="#l<?= $h($row['id']) ?>"><span class="btn__label">Copy link</span></button>
<?php endif; ?>
<?php if (in_array($row['state'], ['open', 'signed'], true)): ?>
              <form method="post" action="contracts.php" style="display:inline"><input type="hidden" name="action" value="withdraw"><input type="hidden" name="csrf" value="<?= $h($csrf) ?>"><input type="hidden" name="id" value="<?= $h($row['id']) ?>"><button type="submit" class="btn btn--ghost btn--sm"><span class="btn__label">Withdraw</span></button></form>
<?php endif; ?>
            </td>
          </tr>
<?php endforeach; ?>
        </tbody>
      </table></div>
<?php endif; ?>
    </div>
<?php endif; ?>
  </div>
</main>
<script>
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var input = document.querySelector(b.dataset.copy), label = b.querySelector('.btn__label');
      var done = function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy link'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, function () { input.select(); document.execCommand('copy'); done(); });
      else { input.select(); document.execCommand('copy'); done(); }
    });
  });
</script>
</body>
</html>
