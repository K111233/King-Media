<?php
/*
 * King Media form handler: shared helpers for api/submit.php.
 *
 * Turns a demo request (form answers + dropped files) into one email with
 * everything needed to build the demo, plus an optional AI-written brief.
 * Prices here must match TIERS in js/main.js.
 */
if (!defined('KM_API')) { http_response_code(404); exit; }

const KM_DEMO_FEE = '£4.99';
const KM_TIERS = [
  '1'  => ['label' => '1 page',   'build' => '£495',   'monthly' => '£49.99 a month on the 12-Month Plan, or £39.99 a month on the 5-Year Plan'],
  '2'  => ['label' => '2 pages',  'build' => '£899',   'monthly' => '£49.99 a month on the 12-Month Plan, or £39.99 a month on the 5-Year Plan'],
  '3'  => ['label' => '3 pages',  'build' => '£1,199', 'monthly' => '£59.99 a month on the 12-Month Plan, or £49.99 a month on the 5-Year Plan'],
  '4+' => ['label' => '4+ pages', 'build' => '£1,449', 'monthly' => '£59.99 a month on the 12-Month Plan, or £49.99 a month on the 5-Year Plan'],
];
const KM_CHOICES = [
  'pages'    => ['1', '2', '3', '4+', 'unsure'],
  'need'     => ['A new website', 'A redesign', 'Online shop', 'Not sure yet'],
  'booking'  => ['none', 'booking', 'booking-payments'],
  'bookWhat' => ['Appointments', 'Tables', 'Classes or events', 'Rooms or stays', 'Call-outs or visits', 'Something else'],
  'payWhen'  => ['A deposit when they book', 'The full amount when they book', 'Let them choose', 'Not sure yet'],
  'products' => ['1–20', '21–100', '100+', 'Not sure'],
];

// Files: same limits as the drop box in js/main.js
const KM_MAX_FILES = 10;
const KM_MAX_FILE_BYTES = 10 * 1024 * 1024;
const KM_MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const KM_ATTACH_BUDGET = 18 * 1024 * 1024; // keeps the email under ~25MB once encoded
const KM_ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'svg', 'pdf', 'ai', 'eps', 'psd', 'doc', 'docx', 'txt', 'zip'];
const KM_RASTER = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/* ---------------------------------------------------------------------------
   Config, responses, input
   --------------------------------------------------------------------------- */
function km_config(): array {
  $file = __DIR__ . '/config.php';
  if (!is_file($file)) return [];
  $cfg = require $file;
  return is_array($cfg) ? $cfg : [];
}

function km_respond(int $status, array $data): void {
  if (!headers_sent()) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
  }
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function km_fail(int $status, string $error, string $message, array $fields = []): void {
  $data = ['ok' => false, 'error' => $error, 'message' => $message];
  if ($fields) $data['fields'] = $fields;
  km_respond($status, $data);
  exit;
}

/** Plain text from the visitor: valid UTF-8, no control characters, trimmed to $max characters. */
function km_clean(string $s, int $max, bool $multiline = false): string {
  $s = mb_convert_encoding($s, 'UTF-8', 'UTF-8');
  $s = str_replace(["\r\n", "\r"], "\n", $s);
  $s = preg_replace($multiline ? '/[^\P{Cc}\n\t]/u' : '/\p{Cc}/u', '', $s) ?? '';
  $s = $multiline ? preg_replace("/\n{3,}/", "\n\n", $s) : preg_replace('/\s+/u', ' ', $s);
  return mb_substr(trim((string) $s), 0, $max);
}

function km_post(string $key, int $max, bool $multiline = false): string {
  $v = $_POST[$key] ?? '';
  return is_string($v) ? km_clean($v, $max, $multiline) : '';
}

function km_choice(string $key, array $allowed, string $default = ''): string {
  $v = $_POST[$key] ?? '';
  return (is_string($v) && in_array($v, $allowed, true)) ? $v : $default;
}

function km_choices(string $key, array $allowed): array {
  $v = $_POST[$key] ?? [];
  if (is_string($v)) $v = [$v];
  if (!is_array($v)) return [];
  return array_values(array_intersect($allowed, array_filter($v, 'is_string')));
}

function km_email_ok(string $e): bool {
  return strlen($e) <= 254 && filter_var($e, FILTER_VALIDATE_EMAIL) !== false;
}

function km_h(string $s): string {
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function km_size(int $b): string {
  return $b < 1048576 ? max(1, (int) round($b / 1024)) . 'KB' : number_format($b / 1048576, 1) . 'MB';
}

function km_slug(string $s, int $max = 40): string {
  $s = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower($s)), '-');
  return substr($s, 0, $max) ?: 'file';
}

/* ---------------------------------------------------------------------------
   Request checks: size, origin, rate limit
   --------------------------------------------------------------------------- */
function km_ini_bytes(string $v): int {
  $v = trim($v);
  $n = (int) $v;
  switch (strtolower(substr($v, -1))) {
    case 'g': $n *= 1024; // fall through
    case 'm': $n *= 1024; // fall through
    case 'k': $n *= 1024;
  }
  return $n;
}

/** PHP silently empties $_POST and $_FILES when a request is over post_max_size. */
function km_post_too_large(): bool {
  $max = km_ini_bytes((string) ini_get('post_max_size'));
  return $max > 0 && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $max;
}

function km_origin_ok(array $cfg): bool {
  $origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
  if ($origin === '') return true; // not every browser sends it
  if (in_array($origin, $cfg['site_origins'] ?? [], true)) return true;
  $p = parse_url($origin);
  $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
  return isset($p['host']) && $host !== ''
    && strcasecmp($p['host'] . (isset($p['port']) ? ':' . $p['port'] : ''), $host) === 0;
}

function km_ensure_dir(string $dir): bool {
  if (is_dir($dir)) return is_writable($dir);
  if (!@mkdir($dir, 0750, true)) return false;
  @file_put_contents($dir . '/.htaccess', "Require all denied\n"); // in case it ends up inside public_html
  return true;
}

function km_rate_ok(string $storage, int $max): bool {
  if ($max <= 0 || !km_ensure_dir($storage)) return true;
  $fh = @fopen($storage . '/ratelimit.json', 'c+');
  if (!$fh) return true;
  flock($fh, LOCK_EX);
  $now = time();
  $key = hash('sha256', 'km|' . ($_SERVER['REMOTE_ADDR'] ?? '')); // never store the raw IP
  $data = json_decode((string) stream_get_contents($fh), true) ?: [];
  foreach ($data as $k => $times) {
    $data[$k] = array_values(array_filter((array) $times, fn($t) => $t > $now - 3600));
    if (!$data[$k]) unset($data[$k]);
  }
  $ok = count($data[$key] ?? []) < $max;
  if ($ok) $data[$key][] = $now;
  ftruncate($fh, 0);
  rewind($fh);
  fwrite($fh, (string) json_encode($data));
  flock($fh, LOCK_UN);
  fclose($fh);
  return $ok;
}

/* ---------------------------------------------------------------------------
   Uploaded files
   --------------------------------------------------------------------------- */
/** @return array{0: array, 1: string} [files, error message] */
function km_uploaded_files(): array {
  $f = $_FILES['files'] ?? null;
  if (!$f || !is_array($f['name'] ?? null)) return [[], ''];
  $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : false;
  $out = [];
  $total = 0;
  foreach ($f['name'] as $i => $raw) {
    $err = (int) ($f['error'][$i] ?? UPLOAD_ERR_NO_FILE);
    if ($err === UPLOAD_ERR_NO_FILE) continue;
    $name = km_clean((string) $raw, 120) ?: 'file';
    if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) return [[], "“{$name}” is too big. Files can be up to 10MB each."];
    $tmp = (string) ($f['tmp_name'][$i] ?? '');
    if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) return [[], 'One of your files didn’t upload properly. Please try again.'];
    if (count($out) >= KM_MAX_FILES) return [[], 'Please send up to 10 files at a time.'];
    $size = (int) filesize($tmp);
    if ($size > KM_MAX_FILE_BYTES) return [[], "“{$name}” is too big. Files can be up to 10MB each."];
    $total += $size;
    if ($total > KM_MAX_TOTAL_BYTES) return [[], 'Your files come to more than 25MB. Please send fewer or smaller files.'];
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $mime = $finfo ? (string) finfo_file($finfo, $tmp) : 'application/octet-stream';
    $bad = !in_array($ext, KM_ALLOWED_EXT, true)
      || preg_match('/php|x-executable|x-dosexec|x-msdownload|x-mach|x-sh|x-shellscript|javascript|x-httpd/i', $mime)
      || (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true) && !in_array($mime, KM_RASTER, true))
      || ($ext === 'pdf' && $mime !== 'application/pdf');
    if ($bad) return [[], "We can’t accept “{$name}”. Please send images, PDFs, Word documents or design files."];
    if (!preg_match('~^[\w.+-]+/[\w.+-]+$~', $mime)) $mime = 'application/octet-stream';
    $out[] = ['name' => $name, 'ext' => $ext, 'mime' => $mime, 'size' => $size, 'path' => $tmp, 'saved' => false];
  }
  return [$out, ''];
}

/** Keeps a private copy of the request (brief.json + files) outside the web root. */
function km_store(string $storage, array $brief, array &$files): string {
  $dir = $storage . '/requests/' . date('Y-m-d_Hi') . '_' . km_slug($brief['business'], 30) . '_' . strtolower(substr($brief['id'], -4));
  if (!km_ensure_dir($dir)) return '';
  foreach ($files as $i => &$file) {
    $base = km_slug(pathinfo($file['name'], PATHINFO_FILENAME), 50);
    $dest = sprintf('%s/%02d-%s.%s', $dir, $i + 1, $base, $file['ext'] ?: 'bin');
    if (@move_uploaded_file($file['path'], $dest)) { $file['path'] = $dest; $file['saved'] = true; }
  }
  unset($file);
  @file_put_contents($dir . '/brief.json', json_encode($brief, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  return $dir;
}

/** Main colours in an image (logos especially), as hex codes with their share. Needs GD. */
function km_palette(string $path): array {
  if (!function_exists('imagecreatefromstring') || filesize($path) > 12 * 1024 * 1024) return [];
  $im = @imagecreatefromstring((string) file_get_contents($path));
  if (!$im) return [];
  $w = imagesx($im);
  $h = imagesy($im);
  $sw = 80;
  $sh = max(1, (int) round($h * $sw / max(1, $w)));
  $sm = imagecreatetruecolor($sw, $sh);
  imagealphablending($sm, false);
  imagesavealpha($sm, true);
  imagefill($sm, 0, 0, imagecolorallocatealpha($sm, 0, 0, 0, 127));
  imagecopyresampled($sm, $im, 0, 0, 0, 0, $sw, $sh, $w, $h);
  $buckets = [];
  $n = 0;
  for ($y = 0; $y < $sh; $y++) {
    for ($x = 0; $x < $sw; $x++) {
      $c = imagecolorat($sm, $x, $y);
      if ((($c >> 24) & 0x7F) > 90) continue; // mostly transparent
      $r = ($c >> 16) & 255; $g = ($c >> 8) & 255; $b = $c & 255;
      $k = (($r >> 5) << 6) | (($g >> 5) << 3) | ($b >> 5);
      $buckets[$k] = isset($buckets[$k]) ? [$buckets[$k][0] + 1, $buckets[$k][1] + $r, $buckets[$k][2] + $g, $buckets[$k][3] + $b] : [1, $r, $g, $b];
      $n++;
    }
  }
  if (!$n) return [];
  usort($buckets, fn($a, $b) => $b[0] <=> $a[0]);
  $out = [];
  foreach (array_slice($buckets, 0, 6) as [$count, $r, $g, $b]) {
    $share = (int) round($count * 100 / $n);
    if ($share < 4) break;
    $out[] = ['hex' => sprintf('#%02X%02X%02X', (int) round($r / $count), (int) round($g / $count), (int) round($b / $count)), 'share' => $share];
  }
  return $out;
}

/* ---------------------------------------------------------------------------
   The brief: one structured record of the request, used for the email and AI
   --------------------------------------------------------------------------- */
function km_collect_demo(): array {
  $booking = km_choice('booking', KM_CHOICES['booking'], 'none');
  $needs = km_choices('need', KM_CHOICES['need']);
  $b = [
    'name'        => km_post('name', 100),
    'business'    => km_post('business', 120),
    'email'       => km_post('email', 254),
    'phone'       => km_post('phone', 40),
    'pages'       => km_choice('pages', KM_CHOICES['pages'], 'unsure'),
    'needs'       => $needs,
    'booking'     => $booking,
    'book_what'   => $booking === 'none' ? [] : km_choices('bookWhat', KM_CHOICES['bookWhat']),
    'pay_when'    => $booking === 'booking-payments' ? km_choice('payWhen', KM_CHOICES['payWhen']) : '',
    'shop'        => in_array('Online shop', $needs, true),
    'products'    => in_array('Online shop', $needs, true) ? km_choice('products', KM_CHOICES['products']) : '',
    'quote_notes' => km_post('quoteNeeds', 3000, true),
    'message'     => km_post('message', 5000, true),
  ];
  $b['package'] = KM_TIERS[$b['pages']] ?? null;
  $q = [];
  if ($booking === 'booking') $q[] = 'Online booking system';
  if ($booking === 'booking-payments') $q[] = 'Online booking + taking payments' . ($b['pay_when'] ? ' (' . mb_strtolower($b['pay_when']) . ')' : '');
  if ($b['book_what']) $q[] = 'Customers book: ' . mb_strtolower(implode(', ', $b['book_what']));
  if ($b['shop']) $q[] = 'Online shop' . ($b['products'] ? ($b['products'] === 'Not sure' ? ' (number of products not sure yet)' : " ({$b['products']} products)") : '');
  $b['quote_items'] = $q;
  return $b;
}

function km_demo_errors(array $b): array {
  $e = [];
  if ($b['name'] === '') $e['name'] = 'Please tell us your name.';
  if ($b['business'] === '') $e['business'] = 'Please add your business name.';
  if ($b['email'] === '') $e['email'] = 'We need an email address to send your demo to.';
  elseif (!km_email_ok($b['email'])) $e['email'] = 'That email doesn’t look quite right. Please check it and try again.';
  if (($b['booking'] !== 'none' || $b['shop']) && $b['quote_notes'] === '') $e['quoteNeeds'] = 'Please tell us what you need so we can quote for it.';
  return $e;
}

function km_pages_label(array $b): string {
  return $b['package'] ? $b['package']['label'] : 'Not sure yet';
}

/** Plain-text version of the request: the email's text part and the AI's input. */
function km_brief_text(array $b): string {
  $p = $b['package'];
  $lines = [
    'Name: ' . $b['name'],
    'Business: ' . $b['business'],
    'Email: ' . $b['email'],
    'Phone: ' . ($b['phone'] ?: 'not given'),
    'Pages: ' . ($p ? "{$p['label']} (build {$p['build']}, then {$p['monthly']})" : 'not sure yet, wants help deciding'),
    'What they need: ' . ($b['needs'] ? implode(', ', $b['needs']) : 'not stated'),
  ];
  if ($b['quote_items']) $lines[] = 'Needs a separate quote: ' . implode('; ', $b['quote_items']);
  if ($b['quote_notes'] !== '') $lines[] = "Their notes for the quote:\n" . $b['quote_notes'];
  $lines[] = $b['message'] !== '' ? "Their message:\n" . $b['message'] : 'Their message: none';
  return implode("\n", $lines);
}

/* ---------------------------------------------------------------------------
   Optional AI brief (Anthropic Claude API). Off until an API key is added.
   --------------------------------------------------------------------------- */
const KM_AI_SYSTEM = <<<'TXT'
You help King Media, a UK web design business, prepare £4.99 demo websites for small businesses. You get one demo request: the customer's answers from the website form, plus any files they attached (logo, photos, menus, price lists).

Write a practical brief for building their demo, then record it with the demo_brief tool.

Rules:
- Use UK English. Keep every item short and easy to scan.
- Only state facts that appear in the form or the files. Never invent phone numbers, addresses, prices, opening hours, awards or reviews. If something useful is missing, add a question for it.
- Colours: if a logo or brand image is attached, give its main colours as hex codes from what you can see. If there is no logo, suggest a palette that suits the trade and say it is a suggestion.
- Pages: if the customer chose a number of pages, plan exactly that many. If they are not sure, recommend 1, 2, 3 or 4+ pages and give the reason in one sentence.
- Booking systems, taking payments and online shops are always quoted separately. List them under quote_items and never give prices for them.
- The draft reply is an email from King Media to the customer: friendly, plain English, under 120 words, suggests a quick call to talk through their demo, signed "King Media". Don't mention AI and don't promise dates.
TXT;

function km_ai_tool(): array {
  $list = fn(string $d) => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => $d];
  return [
    'name' => 'demo_brief',
    'description' => 'Record the demo brief for King Media.',
    'input_schema' => [
      'type' => 'object',
      'properties' => [
        'summary'       => ['type' => 'string', 'description' => 'Two or three sentences: who they are and what they want.'],
        'business_type' => ['type' => 'string', 'description' => 'Their trade, e.g. "Mobile dog groomer".'],
        'location'      => ['type' => 'string', 'description' => 'Town or area if stated, otherwise an empty string.'],
        'page_advice'   => ['type' => 'string', 'description' => 'One sentence on the number of pages.'],
        'pages'         => ['type' => 'array', 'description' => 'Each page of the demo and its sections, in order.', 'items' => [
          'type' => 'object',
          'properties' => ['name' => ['type' => 'string'], 'sections' => ['type' => 'array', 'items' => ['type' => 'string']]],
          'required' => ['name', 'sections'],
        ]],
        'colours'       => ['type' => 'array', 'description' => 'Brand colours to use.', 'items' => [
          'type' => 'object',
          'properties' => ['hex' => ['type' => 'string', 'description' => 'e.g. #1E3A2A'], 'use' => ['type' => 'string', 'description' => 'Where to use it, e.g. "buttons".']],
          'required' => ['hex', 'use'],
        ]],
        'style'         => ['type' => 'string', 'description' => 'The look and tone to aim for, in one or two sentences.'],
        'content_found' => $list('Useful facts found in their files, e.g. services, prices, opening hours. Empty if none.'),
        'quote_items'   => $list('Anything needing a separate quote. Empty if none.'),
        'questions'     => $list('What to ask them on the call.'),
        'checklist'     => $list('Steps to build the demo, in order.'),
        'draft_reply'   => ['type' => 'string'],
      ],
      'required' => ['summary', 'business_type', 'location', 'page_advice', 'pages', 'colours', 'style', 'content_found', 'quote_items', 'questions', 'checklist', 'draft_reply'],
    ],
  ];
}

/** Image bytes small enough for the API (long edge 1568px, as Anthropic recommends). */
function km_ai_image(string $path, string $mime): ?array {
  $bytes = (string) @file_get_contents($path);
  if ($bytes === '') return null;
  $info = @getimagesizefromstring($bytes);
  if (function_exists('imagecreatefromstring') && $info && max($info[0], $info[1]) > 1568) {
    $im = @imagecreatefromstring($bytes);
    if ($im) {
      $scaled = imagescale($im, $info[0] >= $info[1] ? 1568 : (int) round($info[0] * 1568 / $info[1]));
      if ($scaled) {
        ob_start();
        if ($mime === 'image/png') { imagesavealpha($scaled, true); imagepng($scaled, null, 6); }
        else { imagejpeg($scaled, null, 85); $mime = 'image/jpeg'; }
        $bytes = (string) ob_get_clean();
      }
    }
  }
  return strlen($bytes) <= 3.6 * 1024 * 1024 ? [$mime, $bytes] : null;
}

function km_ai_content(array $b, array $files): array {
  $blocks = [['type' => 'text', 'text' => "Demo request\n\n" . km_brief_text($b)]];
  $images = 0;
  $pdfs = 0;
  foreach ($files as $i => $f) {
    $label = 'Attached file ' . ($i + 1) . ': ' . $f['name'];
    if (in_array($f['mime'], KM_RASTER, true) && $images < 6 && ($img = km_ai_image($f['path'], $f['mime']))) {
      $blocks[] = ['type' => 'text', 'text' => $label];
      $blocks[] = ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $img[0], 'data' => base64_encode($img[1])]];
      $images++;
    } elseif ($f['mime'] === 'application/pdf' && $pdfs < 2 && $f['size'] <= 8 * 1024 * 1024) {
      $blocks[] = ['type' => 'text', 'text' => $label];
      $blocks[] = ['type' => 'document', 'source' => ['type' => 'base64', 'media_type' => 'application/pdf', 'data' => base64_encode((string) file_get_contents($f['path']))]];
      $pdfs++;
    } elseif (in_array($f['ext'], ['svg', 'txt'], true) && $f['size'] <= 60 * 1024) {
      $blocks[] = ['type' => 'text', 'text' => $label . " (contents below)\n" . mb_substr(km_clean((string) file_get_contents($f['path']), 20000, true), 0, 20000)];
    } else {
      $blocks[] = ['type' => 'text', 'text' => $label . ' (not shown: this file type can’t be read here)'];
    }
  }
  return $blocks;
}

/** @return array{0: ?array, 1: string} [brief from the tool call, error] */
function km_ai_brief(array $cfg, array $b, array $files, int $timeout): array {
  $ai = $cfg['ai'] ?? [];
  if (empty($ai['enabled']) || empty($ai['api_key'])) return [null, ''];
  if (!function_exists('curl_init')) return [null, 'curl is not available'];
  $payload = [
    'model' => $ai['model'] ?? 'claude-sonnet-5',
    'max_tokens' => 3000,
    'system' => KM_AI_SYSTEM,
    'tools' => [km_ai_tool()],
    'tool_choice' => ['type' => 'tool', 'name' => 'demo_brief'],
    'messages' => [['role' => 'user', 'content' => km_ai_content($b, $files)]],
  ];
  $ch = curl_init($ai['api_url'] ?? 'https://api.anthropic.com/v1/messages');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => $timeout,
    CURLOPT_HTTPHEADER => ['content-type: application/json', 'anthropic-version: 2023-06-01', 'x-api-key: ' . $ai['api_key']],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
  ]);
  $raw = curl_exec($ch);
  $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $err = curl_error($ch);
  if ($raw === false) return [null, 'request failed: ' . $err];
  $res = json_decode((string) $raw, true);
  if ($status !== 200 || !is_array($res)) return [null, 'HTTP ' . $status . ': ' . substr((string) ($res['error']['message'] ?? $raw), 0, 300)];
  foreach ($res['content'] ?? [] as $block) {
    if (($block['type'] ?? '') === 'tool_use' && ($block['name'] ?? '') === 'demo_brief' && is_array($block['input'] ?? null)) {
      return [km_ai_tidy($block['input']), ''];
    }
  }
  return [null, 'no brief in the response (stop reason: ' . ($res['stop_reason'] ?? '?') . ')'];
}

/** Keep only well-formed fields, so a surprising response can't break the email. */
function km_ai_tidy(array $in): array {
  $s = fn($k) => is_string($in[$k] ?? null) ? trim($in[$k]) : '';
  $l = fn($k) => array_values(array_filter(array_map(fn($x) => is_string($x) ? trim($x) : '', is_array($in[$k] ?? null) ? $in[$k] : [])));
  $pages = [];
  foreach (is_array($in['pages'] ?? null) ? $in['pages'] : [] as $p) {
    if (!is_array($p) || !is_string($p['name'] ?? null)) continue;
    $pages[] = ['name' => trim($p['name']), 'sections' => array_values(array_filter(is_array($p['sections'] ?? null) ? $p['sections'] : [], 'is_string'))];
  }
  $colours = [];
  foreach (is_array($in['colours'] ?? null) ? $in['colours'] : [] as $c) {
    $hex = is_array($c) && is_string($c['hex'] ?? null) ? strtoupper(ltrim(trim($c['hex']), '#')) : '';
    if (preg_match('/^[0-9A-F]{6}$/', $hex)) $colours[] = ['hex' => '#' . $hex, 'use' => is_string($c['use'] ?? null) ? trim($c['use']) : ''];
  }
  return [
    'summary' => $s('summary'), 'business_type' => $s('business_type'), 'location' => $s('location'),
    'page_advice' => $s('page_advice'), 'pages' => $pages, 'colours' => $colours, 'style' => $s('style'),
    'content_found' => $l('content_found'), 'quote_items' => $l('quote_items'), 'questions' => $l('questions'),
    'checklist' => $l('checklist'), 'draft_reply' => $s('draft_reply'),
  ];
}

/* ---------------------------------------------------------------------------
   The email
   --------------------------------------------------------------------------- */
function km_swatch(string $hex): string {
  return '<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:' . $hex . ';border:1px solid rgba(0,0,0,.18);vertical-align:-2px;margin-right:6px"></span>';
}

function km_section(string $title, string $inner, string $tag = ''): string {
  $t = $tag ? ' <span style="display:inline-block;margin-left:6px;padding:2px 7px;border-radius:99px;background:#F3EFE4;color:#7A5C0E;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;vertical-align:1px">' . km_h($tag) . '</span>' : '';
  return '<tr><td style="padding:22px 28px 0"><h2 style="margin:0 0 10px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7A5C0E">' . km_h($title) . $t . '</h2>' . $inner . '</td></tr>';
}

function km_rows(array $rows): string {
  $html = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px">';
  foreach ($rows as [$k, $v]) {
    $html .= '<tr><td style="padding:7px 12px 7px 0;border-top:1px solid #EEE9DD;color:#6E675C;width:34%;vertical-align:top">' . km_h($k) . '</td><td style="padding:7px 0;border-top:1px solid #EEE9DD;vertical-align:top">' . $v . '</td></tr>';
  }
  return $html . '</table>';
}

function km_list(array $items, bool $ordered = false): string {
  if (!$items) return '';
  $tag = $ordered ? 'ol' : 'ul';
  return "<{$tag} style=\"margin:0;padding-left:20px;font-size:15px;line-height:1.5\">" . implode('', array_map(fn($i) => '<li style="margin:3px 0">' . km_h($i) . '</li>', $items)) . "</{$tag}>";
}

function km_quote(string $text): string {
  return '<div style="padding:12px 14px;border-left:3px solid #D4AF37;background:#FAF7EF;font-size:15px;line-height:1.55;white-space:pre-wrap">' . km_h($text) . '</div>';
}

function km_demo_email(array $cfg, array $b, ?array $ai, string $aiError, array $files, string $savedDir, string $payUrl = ''): array {
  $p = $b['package'];
  $first = explode(' ', $b['name'])[0];
  $subject = 'Demo request: ' . $b['business'] . ' (' . km_pages_label($b) . ($b['quote_items'] ? ', needs a quote' : '') . ')';
  $folder = $savedDir ? basename($savedDir) : '';

  $h = '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . km_h($subject) . '</title></head>'
    . '<body style="margin:0;padding:0;background:#F3EFE4"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EFE4"><tr><td align="center" style="padding:24px 12px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A">'
    . '<tr><td style="background:#080806;padding:24px 28px"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D4AF37;font-weight:700">King Media · New demo request</p>'
    . '<h1 style="margin:0;font-size:26px;line-height:1.2;color:#F3EEE4">' . km_h($b['business']) . '</h1>'
    . '<p style="margin:6px 0 0;font-size:13px;color:#A9A294">' . km_h($b['received']) . ' · ' . km_h($b['id']) . '</p></td></tr>';

  if ($ai && $ai['summary'] !== '') {
    $meta = implode(' · ', array_filter([$ai['business_type'], $ai['location']]));
    $h .= '<tr><td style="padding:22px 28px 0"><div style="padding:16px 18px;border-radius:12px;background:#FAF7EF;border:1px solid #EADFB8">'
      . '<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7A5C0E;font-weight:700">At a glance' . ($meta ? ' · ' . km_h($meta) : '') . '</p>'
      . '<p style="margin:0;font-size:16px;line-height:1.55">' . km_h($ai['summary']) . '</p></div></td></tr>';
  }

  $email = '<a href="mailto:' . km_h($b['email']) . '" style="color:#7A5C0E">' . km_h($b['email']) . '</a>';
  $phone = $b['phone'] !== '' ? '<a href="tel:' . km_h(preg_replace('/[^\d+]/', '', $b['phone'])) . '" style="color:#7A5C0E">' . km_h($b['phone']) . '</a>' : '<span style="color:#6E675C">Not given</span>';
  $h .= km_section('Contact', km_rows([['Name', km_h($b['name'])], ['Business', km_h($b['business'])], ['Email', $email], ['Phone', $phone]]));

  $h .= km_section('Package', km_rows([
    ['Pages', $p ? '<strong>' . km_h($p['label']) . '</strong>' : '<strong>Not sure yet</strong> (they want help deciding)'],
    ['Build', $p ? km_h($p['build'] . ' one-off, less the ' . KM_DEMO_FEE . ' demo fee') : 'From £495, depending on pages'],
    ['Monthly', $p ? km_h($p['monthly']) : 'From £39.99 a month, depending on pages and plan'],
    ['Demo fee', km_h(KM_DEMO_FEE . ', taken off the build price if they go ahead') . ($payUrl !== '' ? '<br><span style="font-size:13px;color:#6E675C">Not paid yet. They were offered Stripe checkout straight after sending this; you’ll get a separate “Demo fee paid” email if they pay. Their payment link: <a href="' . km_h($payUrl) . '" style="color:#7A5C0E;word-break:break-all">' . km_h($payUrl) . '</a></span>' : '')],
    ['They need', km_h($b['needs'] ? implode(', ', $b['needs']) : 'Not stated')],
  ]));

  if ($b['quote_items']) {
    $h .= '<tr><td style="padding:22px 28px 0"><div style="padding:16px 18px;border-radius:12px;background:#FFF6DB;border:1px solid #E6C25E">'
      . '<p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7A5C0E;font-weight:700">Needs a separate quote</p>'
      . km_list($b['quote_items'])
      . ($b['quote_notes'] !== '' ? '<p style="margin:12px 0 6px;font-size:13px;color:#6E675C">Their notes:</p>' . km_quote($b['quote_notes']) : '')
      . '</div></td></tr>';
  }

  $h .= km_section('Their message', $b['message'] !== '' ? km_quote($b['message']) : '<p style="margin:0;color:#6E675C;font-size:15px">No message.</p>');

  if ($files) {
    $rows = '';
    foreach ($files as $f) {
      $status = $f['attached'] ? 'Attached' : ($f['saved'] ? 'Too big for email: saved on your server in ' . $folder : 'Couldn’t be attached');
      $pal = '';
      if (!empty($f['palette'])) {
        $pal = '<div style="margin-top:6px;font-size:12px;color:#6E675C">' . implode(' ', array_map(fn($c) => '<span style="white-space:nowrap;margin-right:8px">' . km_swatch($c['hex']) . km_h($c['hex']) . ' ' . $c['share'] . '%</span>', $f['palette'])) . '</div>';
      }
      $rows .= '<tr><td style="padding:8px 0;border-top:1px solid #EEE9DD;font-size:15px"><strong>' . km_h($f['name']) . '</strong> <span style="color:#6E675C;font-size:13px">' . km_size($f['size']) . ' · ' . km_h($status) . '</span>' . $pal . '</td></tr>';
    }
    $h .= km_section('Their files (' . count($files) . ')', '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' . $rows . '</table>'
      . (array_filter($files, fn($f) => !empty($f['palette'])) ? '<p style="margin:8px 0 0;font-size:12px;color:#6E675C">Colours are measured from the images and show how much of each image they cover.</p>' : ''));
  }

  if ($ai) {
    $plan = '';
    if ($ai['page_advice'] !== '') $plan .= '<p style="margin:0 0 10px;font-size:15px;line-height:1.5">' . km_h($ai['page_advice']) . '</p>';
    foreach ($ai['pages'] as $pg) {
      $plan .= '<p style="margin:12px 0 4px;font-size:15px;font-weight:700">' . km_h($pg['name']) . '</p>' . km_list($pg['sections']);
    }
    $h .= km_section('Demo plan', $plan, 'AI');
    $look = '';
    if ($ai['colours']) {
      $look .= '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;margin-bottom:8px">';
      foreach ($ai['colours'] as $c) $look .= '<tr><td style="padding:4px 12px 4px 0;white-space:nowrap">' . km_swatch($c['hex']) . '<code style="font-size:13px">' . km_h($c['hex']) . '</code></td><td style="padding:4px 0;color:#3A362F">' . km_h($c['use']) . '</td></tr>';
      $look .= '</table>';
    }
    if ($ai['style'] !== '') $look .= '<p style="margin:0;font-size:15px;line-height:1.5">' . km_h($ai['style']) . '</p>';
    if ($look !== '') $h .= km_section('Look and feel', $look, 'AI');
    if ($ai['content_found']) $h .= km_section('Found in their files', km_list($ai['content_found']), 'AI');
    if ($ai['questions']) $h .= km_section('Ask them on the call', km_list($ai['questions']), 'AI');
    if ($ai['checklist']) $h .= km_section('Build checklist', km_list($ai['checklist'], true), 'AI');
    if ($ai['draft_reply'] !== '') {
      $draft = $ai['draft_reply'] . ($payUrl !== '' ? "\n\nIf you haven’t paid the £4.99 demo fee yet, you can pay securely here:\n" . $payUrl : '');
      $mailto = 'mailto:' . rawurlencode($b['email']) . '?subject=' . rawurlencode('Your King Media demo') . '&body=' . rawurlencode($draft);
      $btn = strlen($mailto) < 1900 ? '<p style="margin:12px 0 0"><a href="' . km_h($mailto) . '" style="display:inline-block;padding:10px 18px;border-radius:99px;background:#080806;color:#F3EEE4;text-decoration:none;font-size:14px;font-weight:600">Reply to ' . km_h($first) . ' with this draft</a></p>' : '';
      $h .= km_section('Draft reply', km_quote($ai['draft_reply']) . $btn, 'AI');
    }
    $h .= '<tr><td style="padding:14px 28px 0;font-size:12px;color:#6E675C">Sections marked AI were written by AI from the form and their files. Check them before relying on them.</td></tr>';
  } elseif ($aiError !== '') {
    $h .= '<tr><td style="padding:14px 28px 0;font-size:12px;color:#6E675C">The AI brief couldn’t be written this time, so this email has the form answers only.</td></tr>';
  }

  $h .= '<tr><td style="padding:24px 28px 26px"><p style="margin:0;padding-top:16px;border-top:1px solid #EEE9DD;font-size:13px;line-height:1.5;color:#6E675C">Hit reply to email ' . km_h($first) . ' directly.'
    . ($folder ? ' A copy of this request and their files is kept on your server in <code>' . km_h($folder) . '</code> for ' . (int) ($cfg['retention_days'] ?? 90) . ' days.' : '')
    . '</p></td></tr></table></td></tr></table></body></html>';

  // Plain-text part
  $t = "NEW DEMO REQUEST: {$b['business']}\n{$b['received']} · {$b['id']}\n\n";
  if ($ai && $ai['summary'] !== '') $t .= "AT A GLANCE (AI)\n{$ai['summary']}\n\n";
  $t .= km_brief_text($b) . "\n";
  if ($payUrl !== '') $t .= "Demo fee: not paid yet. Their payment link: {$payUrl}\n";
  if ($files) {
    $t .= "\nFILES\n";
    foreach ($files as $f) $t .= '- ' . $f['name'] . ' (' . km_size($f['size']) . ', ' . ($f['attached'] ? 'attached' : 'saved on your server') . ")\n";
  }
  if ($ai) {
    $t .= "\nDEMO PLAN (AI)\n" . ($ai['page_advice'] ? $ai['page_advice'] . "\n" : '');
    foreach ($ai['pages'] as $pg) $t .= $pg['name'] . ': ' . implode('; ', $pg['sections']) . "\n";
    if ($ai['colours']) $t .= "\nCOLOURS (AI)\n" . implode("\n", array_map(fn($c) => $c['hex'] . '  ' . $c['use'], $ai['colours'])) . "\n";
    if ($ai['style']) $t .= "\nLOOK AND FEEL (AI)\n{$ai['style']}\n";
    if ($ai['content_found']) $t .= "\nFOUND IN THEIR FILES (AI)\n- " . implode("\n- ", $ai['content_found']) . "\n";
    if ($ai['questions']) $t .= "\nASK THEM ON THE CALL (AI)\n- " . implode("\n- ", $ai['questions']) . "\n";
    if ($ai['checklist']) $t .= "\nBUILD CHECKLIST (AI)\n" . implode("\n", array_map(fn($i, $s) => ($i + 1) . '. ' . $s, array_keys($ai['checklist']), $ai['checklist'])) . "\n";
    if ($ai['draft_reply']) $t .= "\nDRAFT REPLY (AI)\n{$ai['draft_reply']}\n";
  }
  $t .= "\nHit reply to email {$first} directly.\n";
  return [$subject, $h, $t];
}

function km_question_email(array $q): array {
  $subject = 'Question from ' . $q['name'];
  $h = '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>' . km_h($subject) . '</title></head><body style="margin:0;padding:0;background:#F3EFE4">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EFE4"><tr><td align="center" style="padding:24px 12px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A">'
    . '<tr><td style="background:#080806;padding:22px 28px"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D4AF37;font-weight:700">King Media · New question</p>'
    . '<h1 style="margin:0;font-size:22px;color:#F3EEE4">' . km_h($q['name']) . '</h1><p style="margin:6px 0 0;font-size:13px;color:#A9A294">' . km_h($q['received']) . '</p></td></tr>'
    . km_section('Their question', km_quote($q['text']))
    . km_section('Reply to', '<a href="mailto:' . km_h($q['email']) . '" style="color:#7A5C0E;font-size:15px">' . km_h($q['email']) . '</a>')
    . '<tr><td style="padding:22px 28px 26px;font-size:13px;color:#6E675C">Hit reply to answer ' . km_h(explode(' ', $q['name'])[0]) . ' directly.</td></tr></table></td></tr></table></body></html>';
  $t = "NEW QUESTION from {$q['name']} ({$q['email']})\n{$q['received']}\n\n{$q['text']}\n\nHit reply to answer directly.\n";
  return [$subject, $h, $t];
}

/* ---------------------------------------------------------------------------
   Sending: PHP mail() on Hostinger, or .eml files for testing
   --------------------------------------------------------------------------- */
function km_header_text(string $s): string {
  return preg_match('/[^\x20-\x7E]/', $s) ? mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n") : $s;
}

function km_addr(string $email, string $name): string {
  $name = trim(str_replace(['"', '\\', "\r", "\n", '<', '>'], '', $name));
  return $name === '' ? $email : (preg_match('/[^\x20-\x7E]/', $name) ? km_header_text($name) : '"' . $name . '"') . ' <' . $email . '>';
}

function km_send(array $cfg, string $subject, string $html, string $text, array $attachments, string $replyTo, string $replyName): bool {
  $from = (string) $cfg['from_email'];
  $mixed = 'km-mixed-' . bin2hex(random_bytes(8));
  $alt = 'km-alt-' . bin2hex(random_bytes(8));
  $headers = [
    'From: ' . km_addr($from, (string) ($cfg['from_name'] ?? 'King Media website')),
    'Reply-To: ' . km_addr($replyTo, $replyName),
    'Date: ' . date('r'),
    'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . (explode('@', $from)[1] ?? 'localhost') . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $mixed . '"',
  ];
  $body = "--{$mixed}\r\nContent-Type: multipart/alternative; boundary=\"{$alt}\"\r\n\r\n"
    . "--{$alt}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text), 76, "\r\n")
    . "--{$alt}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html), 76, "\r\n")
    . "--{$alt}--\r\n";
  foreach ($attachments as $a) {
    $ascii = preg_replace('/[^A-Za-z0-9._ -]/', '_', $a['name']);
    $body .= "--{$mixed}\r\nContent-Type: {$a['mime']}; name=\"{$ascii}\"\r\nContent-Transfer-Encoding: base64\r\n"
      . "Content-Disposition: attachment; filename=\"{$ascii}\"; filename*=UTF-8''" . rawurlencode($a['name']) . "\r\n\r\n"
      . chunk_split(base64_encode((string) file_get_contents($a['path'])), 76, "\r\n");
  }
  $body .= "--{$mixed}--\r\n";
  $to = (string) $cfg['to_email'];
  $subjectHeader = km_header_text($subject);

  if (($cfg['mail_transport'] ?? 'mail') === 'file') {
    $dir = rtrim((string) $cfg['storage_dir'], '/') . '/outbox';
    if (!km_ensure_dir($dir)) return false;
    $eml = "To: {$to}\r\nSubject: {$subjectHeader}\r\n" . implode("\r\n", $headers) . "\r\n\r\n" . $body;
    return (bool) file_put_contents($dir . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml', $eml);
  }
  $ok = @mail($to, $subjectHeader, $body, implode("\r\n", $headers), '-f' . $from);
  return $ok ?: @mail($to, $subjectHeader, $body, implode("\r\n", $headers));
}

/* ---------------------------------------------------------------------------
   Housekeeping: delete saved requests after the retention period
   --------------------------------------------------------------------------- */
function km_ls(string $dir): array {
  $names = is_dir($dir) ? (scandir($dir) ?: []) : [];
  return array_map(fn($n) => $dir . '/' . $n, array_values(array_diff($names, ['.', '..'])));
}

function km_rmdir(string $dir): void {
  foreach (km_ls($dir) as $f) is_dir($f) ? km_rmdir($f) : @unlink($f);
  @rmdir($dir);
}

function km_purge(array $cfg, string $storage): void {
  $days = (int) ($cfg['retention_days'] ?? 90);
  if ($days <= 0) return;
  $cutoff = time() - $days * 86400;
  foreach (km_ls($storage . '/requests') as $d) if (is_dir($d) && filemtime($d) < $cutoff) km_rmdir($d);
  foreach (km_ls($storage . '/outbox') as $f) if (is_file($f) && filemtime($f) < $cutoff) @unlink($f);
}

/** The saved folder for a request ID, if it's still on the server. */
function km_find_request(string $storage, string $id): string {
  if (!preg_match('/^KM-\d{6}-[0-9A-F]{4}$/', $id)) return '';
  foreach (km_ls($storage . '/requests') as $d) {
    if (!str_ends_with($d, '_' . strtolower(substr($id, -4))) || !is_file($d . '/brief.json')) continue;
    $brief = json_decode((string) file_get_contents($d . '/brief.json'), true);
    if (($brief['id'] ?? '') === $id) return $d;
  }
  return '';
}

/* ---------------------------------------------------------------------------
   Handlers
   --------------------------------------------------------------------------- */
function km_received(): string {
  return date('l j F Y, H:i');
}

function km_handle_question(array $cfg): void {
  $q = ['name' => km_post('qName', 100), 'email' => km_post('qEmail', 254), 'text' => km_post('qText', 3000, true), 'received' => km_received()];
  $e = [];
  if ($q['name'] === '') $e['qName'] = 'Please tell us your name.';
  if ($q['email'] === '') $e['qEmail'] = 'We need an email address to reply to.';
  elseif (!km_email_ok($q['email'])) $e['qEmail'] = 'That email doesn’t look quite right. Please check it.';
  if ($q['text'] === '') $e['qText'] = 'Please type your question.';
  if ($e) km_fail(422, 'invalid', 'Please fix the highlighted fields.', $e);
  [$subject, $html, $text] = km_question_email($q);
  if (!km_send($cfg, $subject, $html, $text, [], $q['email'], $q['name'])) {
    error_log('[King Media] question email failed to send');
    km_fail(502, 'send', 'Sorry, your question didn’t send.');
  }
  km_respond(200, ['ok' => true]);
}

function km_handle_demo(array $cfg, string $storage): void {
  $b = km_collect_demo();
  $errors = km_demo_errors($b);
  if ($errors) km_fail(422, 'invalid', count($errors) === 1 ? 'One thing to fix, highlighted above.' : count($errors) . ' things to fix, highlighted above.', $errors);
  [$files, $fileError] = km_uploaded_files();
  if ($fileError !== '') km_fail(422, 'files', $fileError, ['files' => $fileError]);

  $b['id'] = 'KM-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));
  $b['received'] = km_received();
  $b['files'] = array_map(fn($f) => ['name' => $f['name'], 'size' => $f['size'], 'type' => $f['mime']], $files);
  $dir = km_store($storage, $b, $files);

  $used = 0;
  $shown = 0;
  foreach ($files as &$f) {
    $f['attached'] = $used + $f['size'] <= KM_ATTACH_BUDGET;
    if ($f['attached']) $used += $f['size'];
    $f['palette'] = (in_array($f['mime'], KM_RASTER, true) && $shown++ < 4) ? km_palette($f['path']) : [];
  }
  unset($f);

  $payUrl = ($dir !== '' && km_stripe_on($cfg)) ? km_pay_url($cfg, $b['id']) : '';
  $work = function (int $aiTimeout) use ($cfg, $b, $files, $dir, $storage, $payUrl): bool {
    [$ai, $aiError] = km_ai_brief($cfg, $b, $files, $aiTimeout);
    if ($aiError !== '') error_log('[King Media] AI brief skipped: ' . $aiError);
    if ($ai && $dir) @file_put_contents($dir . '/ai-brief.json', json_encode($ai, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    [$subject, $html, $text] = km_demo_email($cfg, $b, $ai, $aiError, $files, $dir, $payUrl);
    $sent = km_send($cfg, $subject, $html, $text, array_filter($files, fn($f) => $f['attached']), $b['email'], $b['name']);
    if (!$sent) {
      error_log('[King Media] demo request email failed to send: ' . $b['id']);
      if ($dir) @file_put_contents($dir . '/EMAIL-NOT-SENT.txt', "The email for this request failed to send. Everything is saved in this folder.\n");
    }
    km_purge($cfg, $storage);
    return $sent;
  };

  // Reply to the visitor straight away where the server allows, then write the
  // AI brief and send the email without keeping them waiting.
  $finish = function_exists('litespeed_finish_request') ? 'litespeed_finish_request' : (function_exists('fastcgi_finish_request') ? 'fastcgi_finish_request' : '');
  if ($finish !== '' && $dir !== '') {
    ignore_user_abort(true);
    @set_time_limit(150);
    km_respond(200, ['ok' => true, 'id' => $b['id'], 'pay_url' => $payUrl]);
    $finish();
    $work(90);
    return;
  }
  @set_time_limit(90);
  if (!$work(30)) km_fail(502, 'send', 'Sorry, your request didn’t send.');
  km_respond(200, ['ok' => true, 'id' => $b['id'], 'pay_url' => $payUrl]);
}

/* ---------------------------------------------------------------------------
   Stripe: the £4.99 demo fee through Stripe Checkout (plain HTTPS, no SDK)
   --------------------------------------------------------------------------- */
const KM_DEMO_FEE_PENCE = 499;

function km_storage(array $cfg): string {
  return rtrim((string) ($cfg['storage_dir'] ?? (__DIR__ . '/storage')), '/');
}

function km_secret_ok(array $cfg): bool {
  $s = (string) ($cfg['secret'] ?? '');
  return strlen($s) >= 32 && stripos($s, 'change') !== 0;
}

function km_stripe_on(array $cfg): bool {
  return !empty($cfg['stripe']['secret_key']) && !empty($cfg['site_url']) && km_secret_ok($cfg);
}

/** Unguessable key, so a payment link only opens for the request it was made for. */
function km_pay_key(array $cfg, string $id): string {
  return substr(hash_hmac('sha256', 'pay|' . $id, (string) $cfg['secret']), 0, 24);
}

function km_pay_url(array $cfg, string $id): string {
  return rtrim((string) $cfg['site_url'], '/') . '/api/pay.php?r=' . rawurlencode($id) . '&k=' . km_pay_key($cfg, $id);
}

/** @return array{0: int, 1: array} [HTTP status, decoded JSON] */
function km_stripe(array $cfg, string $method, string $path, array $params = []): array {
  if (!function_exists('curl_init')) return [0, ['error' => ['message' => 'curl is not available']]];
  $url = rtrim((string) ($cfg['stripe']['api_base'] ?? 'https://api.stripe.com'), '/') . $path;
  if ($method === 'GET' && $params) $url .= '?' . http_build_query($params);
  $ch = curl_init($url);
  $opts = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_USERPWD => $cfg['stripe']['secret_key'] . ':',
    CURLOPT_CUSTOMREQUEST => $method,
  ];
  if ($method === 'POST') $opts[CURLOPT_POSTFIELDS] = http_build_query($params);
  curl_setopt_array($ch, $opts);
  $raw = curl_exec($ch);
  $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  if ($raw === false) return [0, ['error' => ['message' => curl_error($ch)]]];
  return [$status, json_decode((string) $raw, true) ?: []];
}

/** @return array{0: string, 1: string} [Checkout URL, error] */
function km_checkout_session(array $cfg, array $brief): array {
  $site = rtrim((string) $cfg['site_url'], '/');
  $back = fn(string $state) => $site . '/?payment=' . $state . '&r=' . rawurlencode($brief['id']) . '#contact';
  $price = (string) ($cfg['stripe']['demo_price'] ?? '');
  $params = [
    'mode' => 'payment',
    'line_items' => [$price !== '' ? ['price' => $price, 'quantity' => 1] : [
      'quantity' => 1,
      'price_data' => [
        'currency' => 'gbp',
        'unit_amount' => KM_DEMO_FEE_PENCE,
        'product_data' => ['name' => 'Demo website', 'description' => 'Your King Media demo website. The £4.99 is taken off your build price if you go ahead.'],
      ],
    ]],
    'client_reference_id' => $brief['id'],
    'customer_email' => $brief['email'],
    'metadata' => ['request_id' => $brief['id'], 'business' => mb_substr((string) $brief['business'], 0, 400)],
    'payment_intent_data' => [
      'description' => mb_substr('Demo website: ' . $brief['business'] . ' (' . $brief['id'] . ')', 0, 900),
      'metadata' => ['request_id' => $brief['id']],
    ],
    'locale' => 'en-GB',
    'success_url' => $back('success'),
    'cancel_url' => $back('cancelled'),
  ];
  [$status, $res] = km_stripe($cfg, 'POST', '/v1/checkout/sessions', $params);
  if ($status === 200 && is_string($res['url'] ?? null)) return [$res['url'], ''];
  return ['', 'HTTP ' . $status . ': ' . substr((string) ($res['error']['message'] ?? 'no Checkout URL returned'), 0, 300)];
}

/** Checks the Stripe-Signature header (HMAC-SHA256 of "timestamp.payload"), as Stripe documents. */
function km_stripe_signature_ok(string $payload, string $header, string $secret, int $tolerance = 300): bool {
  $t = 0;
  $sigs = [];
  foreach (explode(',', $header) as $part) {
    [$k, $v] = array_pad(explode('=', trim($part), 2), 2, '');
    if ($k === 't') $t = (int) $v;
    elseif ($k === 'v1') $sigs[] = $v;
  }
  if (!$t || !$sigs || abs(time() - $t) > $tolerance) return false;
  $expected = hash_hmac('sha256', $t . '.' . $payload, $secret);
  foreach ($sigs as $sig) if (hash_equals($expected, $sig)) return true;
  return false;
}

/** Records a paid demo fee and emails you. False means "ask Stripe to retry". */
function km_record_payment(array $cfg, array $s): bool {
  $id = (string) ($s['client_reference_id'] ?? ($s['metadata']['request_id'] ?? ''));
  $dir = km_find_request(km_storage($cfg), $id);
  $marker = $dir ? $dir . '/paid.json' : '';
  if ($marker && is_file($marker)) {
    $prev = json_decode((string) file_get_contents($marker), true);
    if (($prev['session'] ?? '') === ($s['id'] ?? '')) return true; // Stripe sent this one before
  }
  $brief = $dir ? (json_decode((string) file_get_contents($dir . '/brief.json'), true) ?: []) : [];
  $paid = [
    'session'  => (string) ($s['id'] ?? ''),
    'amount'   => '£' . number_format(((int) ($s['amount_total'] ?? 0)) / 100, 2),
    'email'    => (string) ($s['customer_details']['email'] ?? ($s['customer_email'] ?? '')),
    'name'     => (string) ($s['customer_details']['name'] ?? ''),
    'paid_at'  => km_received(),
    'livemode' => !empty($s['livemode']),
  ];
  $business = (string) ($brief['business'] ?? ($s['metadata']['business'] ?? 'Unknown business'));
  $subject = ($paid['livemode'] ? '' : '[TEST] ') . 'Demo fee paid: ' . $business . ' (' . $paid['amount'] . ')';
  $rows = [
    ['Business', km_h($business)],
    ['Amount', '<strong>' . km_h($paid['amount']) . '</strong>' . ($paid['livemode'] ? '' : ' <span style="color:#B3261E">(test payment, no real money)</span>')],
    ['Paid by', km_h(trim($paid['name'] . ' ' . ($paid['email'] ? '<' . $paid['email'] . '>' : '')))],
    ['Request', km_h($id ?: 'Not linked to a request') . ($dir ? '' : ' <span style="color:#6E675C">(request folder not found)</span>')],
    ['Stripe', '<code style="font-size:13px">' . km_h($paid['session']) . '</code>'],
  ];
  $html = '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>' . km_h($subject) . '</title></head><body style="margin:0;padding:0;background:#F3EFE4">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EFE4"><tr><td align="center" style="padding:24px 12px">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A">'
    . '<tr><td style="background:#080806;padding:22px 28px"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D4AF37;font-weight:700">King Media · Demo fee paid</p>'
    . '<h1 style="margin:0;font-size:22px;color:#F3EEE4">' . km_h($business) . '</h1><p style="margin:6px 0 0;font-size:13px;color:#A9A294">' . km_h($paid['paid_at']) . '</p></td></tr>'
    . km_section('Payment', km_rows($rows))
    . '<tr><td style="padding:22px 28px 26px;font-size:13px;color:#6E675C">Remember to take this ' . km_h($paid['amount']) . ' off their build invoice (use the “Demo fee already paid” coupon in Stripe).</td></tr></table></td></tr></table></body></html>';
  $text = "DEMO FEE PAID: {$business}\n{$paid['paid_at']}\n\nAmount: {$paid['amount']}" . ($paid['livemode'] ? '' : ' (TEST payment)') . "\nPaid by: {$paid['name']} {$paid['email']}\nRequest: {$id}\nStripe: {$paid['session']}\n\nTake this off their build invoice.\n";
  if (!km_send($cfg, $subject, $html, $text, [], $paid['email'] ?: (string) $cfg['to_email'], $paid['name'])) return false;
  if ($marker) @file_put_contents($marker, json_encode($paid, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  return true;
}
