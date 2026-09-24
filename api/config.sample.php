<?php
/*
 * King Media form + payments settings.
 * Copy this file to config.php and fill it in. Never share config.php.
 *
 * WHERE TO PUT config.php: in the km-private folder, one level ABOVE public_html
 * (…/domains/kingmedia.uk/km-private/config.php). Hostinger's Git deploys replace the
 * files inside public_html, so a config.php kept there could be wiped. api/config.php
 * also still works.
 */
if (!defined('KM_API')) { http_response_code(404); exit; }

return [
  // Your website address, with no slash at the end
  'site_url' => 'https://kingmedia.uk',
  'site_origins' => ['https://kingmedia.uk', 'https://www.kingmedia.uk'],

  // Where requests go (your inbox), and the address they're sent from. Use a mailbox
  // created in Hostinger (hPanel > Emails) as the "from" address, and make it different
  // from to_email: Hostinger won't send from an address that isn't one of its mailboxes.
  'to_email' => 'enquiries@kingmedia.uk',
  'from_email' => 'website@kingmedia.uk',
  'from_name' => 'King Media website',

  // How emails are sent. 'smtp' logs in to the mailbox below (most reliable).
  // 'mail' uses PHP mail(). 'file' saves .eml files in storage_dir/outbox (testing only).
  'mail_transport' => 'smtp',
  'smtp' => [
    'host' => 'smtp.hostinger.com',
    'port' => 465,
    'secure' => 'ssl',               // 'ssl' for port 465, or 'tls' for port 587
    'username' => 'website@kingmedia.uk', // the full mailbox address (same as from_email)
    'password' => '',                // that mailbox's password
  ],

  // A long random string (at least 32 characters) that protects payment links.
  // Make one in Terminal with:  openssl rand -hex 32
  'secret' => 'CHANGE-ME',

  // Private copies of each request and its files. Keep this OUTSIDE public_html:
  // the default is the km-private folder above it. Copies are deleted after retention_days.
  'storage_dir' => dirname(__DIR__, 2) . '/km-private',
  'retention_days' => 90,
  'rate_limit_per_hour' => 8,

  // Optional AI brief at the top of each demo request email.
  // Needs an Anthropic API key (console.anthropic.com), which is pay as you go.
  'ai' => [
    'enabled' => false,
    'api_key' => '',
    'model' => 'claude-sonnet-5',
  ],

  // Your password for the private contracts page (https://kingmedia.uk/api/contracts.php),
  // where you make "sign and pay" links for clients. 12 characters or more.
  'admin_password' => '',

  // Your company, as named in the online agreement. Links can't be made until both are filled in.
  'company' => ['number' => '', 'office' => ''],

  // Stripe, for the £4.99 demo fee. With a secret key here, demo requests must be
  // paid before they're emailed to you. Leave it empty to switch payments off.
  'stripe' => [
    'secret_key' => '',     // Developers > API keys > Secret key (sk_test_… first, then sk_live_…)
    'webhook_secret' => '', // Developers > Webhooks > your endpoint > Signing secret (whsec_…)
  ],
];
