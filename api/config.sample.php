<?php
/*
 * King Media form + payments settings.
 * Copy this file to config.php (same folder) and fill it in. Never share config.php.
 */
if (!defined('KM_API')) { http_response_code(404); exit; }

return [
  // Your website address, with no slash at the end
  'site_url' => 'https://kingmedia.uk',
  'site_origins' => ['https://kingmedia.uk', 'https://www.kingmedia.uk'],

  // Where requests go, and who they come from. The "from" address should be a
  // mailbox on your own domain (in Hostinger: Emails), or mail may go to spam.
  'to_email' => 'enquiries@kingmedia.uk',
  'from_email' => 'enquiries@kingmedia.uk',
  'from_name' => 'King Media website',

  // A long random string (at least 32 characters) used to protect payment links.
  // Make one at https://www.random.org/strings/ or by mashing the keyboard.
  'secret' => 'CHANGE-ME',

  // Private copies of each request and its files. Keep this OUTSIDE public_html:
  // the default is the folder above it. Copies are deleted after retention_days.
  'storage_dir' => dirname(__DIR__, 2) . '/km-private',
  'retention_days' => 90,
  'rate_limit_per_hour' => 8,

  // 'mail' sends with Hostinger's PHP mail(). 'file' saves .eml files in
  // storage_dir/outbox instead (for testing without sending anything).
  'mail_transport' => 'mail',

  // Optional AI brief at the top of each demo request email.
  // Needs an Anthropic API key (console.anthropic.com), which is pay as you go.
  'ai' => [
    'enabled' => false,
    'api_key' => '',
    'model' => 'claude-sonnet-5',
  ],

  // Stripe, for the £4.99 demo fee. Leave secret_key empty to switch payments off.
  // Use a restricted key with "Checkout Sessions: Write" permission (Developers > API keys).
  'stripe' => [
    'secret_key' => '',
    'webhook_secret' => '',
  ],
];
