<?php
/*
 * King Media: the Service Agreement a client signs online (api/sign.php).
 * Based on the Word Service Agreement. When the terms change, change them here
 * and bump KM_AGREEMENT_VERSION: every signed copy records the version and a fingerprint.
 */
if (!defined('KM_API')) { http_response_code(404); exit; }

const KM_AGREEMENT_VERSION = 'KM-SA-2026-09-25';

/** The agreement as HTML. Before signing it shows both plans; once signed, the plan they chose. */
function km_agreement_body(array $offer, array $signed = [], int $level = 2): string {
  $h2 = 'h' . $level; $h3 = 'h' . ($level + 1); // one level down when it sits inside the signing page
  $co = (array) ($offer['company'] ?? KM_COMPANY);
  $plans = km_contract_plans($offer);
  $chosen = $signed ? ($plans[$signed['plan']] ?? null) : null;
  $pages = KM_PAGE_LABELS[$offer['pages']] ?? '';
  $build = km_money((int) $offer['build_pence']);
  $monthlyText = $chosen
    ? km_money($chosen['monthly_pence']) . ' a month (' . $chosen['name'] . ')'
    : implode(', or ', array_map(fn($p) => km_money($p['monthly_pence']) . ' a month on the ' . $p['name'], $plans));
  $h = fn(string $s) => km_h($s);
  $p = fn(string $s) => '<p>' . $s . '</p>';
  $c = fn(string $n, string $s) => '<p><strong>' . $n . '</strong>&nbsp; ' . $s . '</p>';
  $li = fn(array $items) => '<ul>' . implode('', array_map(fn($i) => '<li>' . $i . '</li>', $items)) . '</ul>';
  $isCompany = ($co['type'] ?? 'company') === 'company';
  $provider = $isCompany
    ? $h($co['name']) . ', trading as ' . $h($co['trading_as']) . ', a company registered in ' . $h($co['registered_in']) . ' under company number ' . $h($co['number']) . ', whose registered office is at ' . $h($co['office'])
    : (($co['owner'] ?? '') !== '' ? $h($co['owner']) . ', trading as ' . $h($co['trading_as']) : $h($co['trading_as'])) . ', a sole trader of ' . $h($co['address']);
  $providerName = $isCompany ? $h($co['name']) . ' (' . $h($co['trading_as']) . ')' : (($co['owner'] ?? '') !== '' ? $h($co['owner']) . ', trading as ' . $h($co['trading_as']) : $h($co['trading_as']));

  $o = '<' . $h2 . '>1. Parties</' . $h2 . '>'
    . $p('This Agreement is made between:')
    . $p('(1)&nbsp; ' . $provider . ' (“Provider”, “we”, “us”); and')
    . $p('(2)&nbsp; the business named in the Order Form at Schedule 1 (“Client”, “you”), which enters into this Agreement for the purposes of its business,')
    . $p('together the “Parties”. By signing the Order Form, the Client agrees to be bound by these Terms, which together with the Order Form form the “Agreement”.')

    . '<' . $h2 . '>2. Definitions</' . $h2 . '>' . $li([
      '“Build Fee” means the one-off fee for the design and build of the Website stated on the Order Form (standard Build Fees: £494.99 for 1 page, £899.99 for 2 pages, £1,199.99 for 3 pages, or £1,449.99 for 4 or more pages). The Build Fee includes the Monthly Fee for the first month of the Plan.',
      '“Business Day” means a day other than a Saturday, Sunday or public holiday in England.',
      '“Demo Fee” means the fee of £4.99 for the Provider to prepare a working demo of the Website before the Client decides whether to go ahead.',
      '“Initial Term” means the minimum term of the Plan, beginning on the Payment Date: 12 months on the 12-Month Plan, or 60 months on the 5-Year Plan.',
      '“Monthly Fee” means the monthly fee for the Plan stated on the Order Form (standard Monthly Fees: for a Website of 1 or 2 pages, £49.99 per month on the 12-Month Plan or £39.99 per month on the 5-Year Plan; for a Website of 3 or more pages, £59.99 per month on the 12-Month Plan or £49.99 per month on the 5-Year Plan).',
      '“Payment Date” means the date the Client pays the Build Fee.',
      '“Plan” means the monthly plan chosen on the Order Form, being either: (a) the “12-Month Plan”, with an Initial Term of 12 months; or (b) the “5-Year Plan”, with an Initial Term of 60 months and a lower Monthly Fee.',
      '“Services” means the services described in Clause 3.',
      '“Start Date” means the date the Website goes live, which will be the day after the Payment Date unless the Parties agree otherwise, and which the Provider will confirm to the Client in writing.',
      '“Website” means the website designed, built and maintained by the Provider for the Client under this Agreement.',
    ])

    . '<' . $h2 . '>3. Services</' . $h2 . '>'
    . $c('3.1', 'Subject to payment of the Build Fee and the Monthly Fee, the Provider shall provide:')
    . $li(['design and build of the Website;', 'registration and ongoing management of the domain name stated on the Order Form;', 'hosting of the Website; and', 'Maintenance Services as described in Clause 3.2.'])
    . $c('3.2', '“Maintenance Services” means security and software updates, bug fixes, and up to five (5) Website Changes per calendar month. A “Website Change” is any single change to the Website requested by the Client, whether big or small, such as updating text, prices, opening hours or images, or adding or amending a section on an existing page. Maintenance Services do not include new pages, new functionality (including taking online payments, online booking systems, and e-commerce, online shop or catalogue work) or major redesigns. The Provider will provide a separate written quote for any such work, which will proceed only once the Client has accepted that quote in writing.')
    . $c('3.3', 'The Provider will use reasonable efforts to action routine maintenance requests within five (5) Business Days of the Client’s written request.')

    . '<' . $h2 . '>4. Fees &amp; Payment</' . $h2 . '>'
    . $c('4.1', 'The Demo Fee is paid before the Provider starts work on the demo. It is separate from the Build Fee and is not deducted from it.')
    . $c('4.2', 'The Client shall pay the Build Fee in full when signing the Order Form online. The Provider will make the Website live the day after the Payment Date, unless the Parties agree a later date.')
    . $c('4.3', 'The Build Fee includes the Monthly Fee for the first month of the Plan. After that, the Client shall pay the Monthly Fee monthly in advance by continuous recurring card payment, set up when paying the Build Fee, starting one month after the Payment Date and then on the same day of each month (or the last day of a shorter month).')
    . $c('4.4', 'Work quoted separately under Clause 3.2 is charged as set out in the quote the Client accepts in writing. Where quoted work is listed on the Order Form, its price is included in the Build Fee and Monthly Fee stated there.')
    . $c('4.5', 'All sums stated in this Agreement and on the Order Form are inclusive of any VAT that applies.')
    . $c('4.6', 'If any sum remains unpaid more than 14 days after its due date, the Provider may: (a) charge statutory interest and compensation under the Late Payment of Commercial Debts (Interest) Act 1998; and/or (b) suspend the Services, including taking the Website offline, until payment is made in full, without affecting any other right or remedy.')

    . '<' . $h2 . '>5. Term &amp; Renewal</' . $h2 . '>'
    . $c('5.1', 'This Agreement begins on the Payment Date, once the Client has signed the Order Form and paid the Build Fee. The Provider confirms its agreement to these Terms and the Order Form by sending the Client the link to sign them. If the Build Fee is not paid within 14 days of signing, the signed Order Form lapses and neither Party is bound by it. The Plan begins on the Payment Date.')
    . $c('5.2', 'At the end of the Initial Term, this Agreement automatically continues on a rolling monthly basis on the same terms, unless either Party gives at least 30 days’ written notice to end it, to expire at the end of the Initial Term or at the end of any later monthly period.')

    . '<' . $h2 . '>6. Early Termination by Client</' . $h2 . '>'
    . $c('6.1', 'The Monthly Fee, including the lower Monthly Fee on the 5-Year Plan, is offered by the Provider in reliance on the Client’s commitment to the Initial Term, which reflects the Provider’s set-up costs and the ongoing capacity allocated to the Client’s account.')
    . $c('6.2', 'If the Client terminates this Agreement before the end of the Initial Term for any reason other than the Provider’s uncured material breach under Clause 7.1, the Client shall pay the Provider a sum equal to 100% of the Monthly Fees that would otherwise have fallen due for the remainder of the Initial Term. This sum is agreed between the Parties as a genuine, reasonable pre-estimate of the Provider’s loss, and not as a penalty.')
    . $c('6.3', 'Sums due under Clause 6.2 are immediately due and payable on the date of termination.')
    . $c('6.4', 'This Clause 6 does not apply once the Initial Term has ended.')

    . '<' . $h2 . '>7. Termination for Breach</' . $h2 . '>'
    . $c('7.1', 'Either Party may terminate this Agreement immediately by written notice if the other Party: (a) commits a material breach of this Agreement which, if capable of remedy, is not remedied within 14 days of written notice; or (b) becomes insolvent or unable to pay its debts.')
    . $c('7.2', 'Termination under this Clause 7 does not affect either Party’s accrued rights, including the Provider’s right to sums due under Clause 6 where the Client is the terminating or breaching Party.')

    . '<' . $h2 . '>8. Website Ownership, Content &amp; Domain</' . $h2 . '>'
    . $c('8.1', 'The Client owns all text, images, logos and other material it supplies to the Provider (“Client Content”).')
    . $c('8.2', 'Unless otherwise agreed in writing, the Provider retains ownership of the underlying website code, design templates and any pre-existing tools or frameworks used to build the Website (“Provider IP”).')
    . $c('8.3', 'The Provider grants the Client a non-exclusive, non-transferable licence to use the Website and Provider IP for the Client’s own business purposes for as long as this Agreement is in force and fees are paid up to date.')
    . $c('8.4', 'On expiry or termination, the Provider will, on the Client’s written request made within 30 days and payment of any sums outstanding (including any sum due under Clause 6), export and hand over the Website files and Client Content. The Provider is not obliged to keep a copy beyond 30 days without such a request.')
    . $c('8.5', 'Unless the Order Form states that the Client’s plan includes domain ownership, the Provider registers, owns and manages the domain name used for the Website: it remains the Provider’s property and is not transferred to the Client. If the Order Form states that the Client’s plan includes domain ownership, the domain name belongs to the Client: the Provider registers and manages it for the Client while this Agreement is in force, and will transfer it to the Client within 14 days of a written request made after expiry or termination, once all sums due have been paid.')

    . '<' . $h2 . '>9. Client Obligations</' . $h2 . '>'
    . $p('The Client shall: provide Client Content, feedback and any access details reasonably required, in good time; respond to reasonable requests from the Provider without undue delay; and ensure Client Content does not infringe any third party’s rights or applicable law. Delay caused by the Client does not extend the Initial Term or suspend the Monthly Fee.')

    . '<' . $h2 . '>10. Warranties &amp; Disclaimer</' . $h2 . '>'
    . $c('10.1', 'The Provider warrants it will perform the Services with reasonable care and skill.')
    . $c('10.2', 'The Provider does not warrant that the Website will be uninterrupted or error-free, or that it will achieve any particular level of traffic, enquiries, sales or search engine ranking.')
    . $c('10.3', 'Except as set out in this Agreement, all conditions, warranties and terms implied by statute or common law are excluded to the fullest extent permitted by law.')

    . '<' . $h2 . '>11. Limitation of Liability</' . $h2 . '>'
    . $c('11.1', 'Nothing in this Agreement limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be limited or excluded by law.')
    . $c('11.2', 'Subject to Clause 11.1, the Provider’s total aggregate liability arising out of or in connection with this Agreement shall not exceed the total fees paid by the Client in the 12 months before the event giving rise to the claim.')
    . $c('11.3', 'The Provider shall not be liable for any indirect or consequential loss, or loss of profits, revenue, business, data or goodwill.')

    . '<' . $h2 . '>12. Data Protection</' . $h2 . '>'
    . $p('Each Party shall comply with UK GDPR and the Data Protection Act 2018 in respect of personal data processed under this Agreement. Where the Provider processes personal data on the Client’s behalf as a processor, the Parties shall enter into a separate data processing agreement, which shall be incorporated into this Agreement by reference.')

    . '<' . $h2 . '>13. Confidentiality</' . $h2 . '>'
    . $p('Each Party shall keep confidential the other’s non-public business information disclosed under this Agreement and use it only to perform its obligations, except where disclosure is required by law.')

    . '<' . $h2 . '>14. Force Majeure</' . $h2 . '>'
    . $p('Neither Party shall be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including internet or hosting infrastructure failures outside the Provider’s direct control, provided the affected Party notifies the other and uses reasonable efforts to resume performance.')

    . '<' . $h2 . '>15. General</' . $h2 . '>'
    . $c('15.1', 'Assignment: The Client may not assign or transfer this Agreement without the Provider’s written consent. The Provider may assign this Agreement to a successor to its business.')
    . $c('15.2', 'Entire Agreement: This Agreement constitutes the entire agreement between the Parties and supersedes all prior discussions relating to its subject matter.')
    . $c('15.3', 'Variation: Other than routine renewal under Clause 5, no variation is effective unless agreed in writing by both Parties.')
    . $c('15.4', 'Severability: If any provision of this Agreement is found unenforceable, the remaining provisions continue in full force.')
    . $c('15.5', 'No Partnership: Nothing in this Agreement creates a partnership, agency or employment relationship between the Parties.')
    . $c('15.6', 'Notices: Notices must be in writing and sent by email: to the Provider at enquiries@kingmedia.uk, and to the Client at the contact email stated on the Order Form. Notices are deemed received the next Business Day.')
    . $c('15.7', 'Electronic signature: The Parties agree that this Agreement may be signed electronically, and that the Client typing their name and confirming their agreement online is as valid as a handwritten signature.')
    . $c('15.8', 'Governing Law: This Agreement is governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction.');

  // Schedule 1: the Order Form
  $row = fn(string $k, string $v) => '<tr><th scope="row">' . $k . '</th><td>' . $v . '</td></tr>';
  $first = 'One month after the Build Fee is paid, then on the same day each month';
  $start = 'The day after the Build Fee is paid, unless agreed otherwise, confirmed by the Provider in writing';
  $o .= '<h2 id="order-form">Schedule 1: Order Form</' . $h2 . '>'
    . $p('This Order Form forms part of the ' . $h($co['trading_as']) . ' Website Design, Hosting &amp; Maintenance Service Agreement.')
    . '<' . $h3 . '>Client details</' . $h3 . '><div class="agreement__table"><table>'
    . $row('Client legal / trading name', $h($offer['business']))
    . ($offer['company_number'] !== '' ? $row('Company number', $h($offer['company_number'])) : '')
    . $row('Registered / business address', nl2br($h($offer['address'])))
    . $row('Contact name', $h($offer['contact']))
    . $row('Contact email', $h($offer['email']))
    . ($offer['phone'] !== '' ? $row('Phone', $h($offer['phone'])) : '')
    . '</table></div><' . $h3 . '>Service details</' . $h3 . '><div class="agreement__table"><table>'
    . $row('Website domain name', $h($offer['domain']))
    . $row('Domain name owned by', $offer['domain_owned'] ? 'The Client: the plan includes domain ownership. The Provider registers and manages it for the Client (Clause 8.5).' : 'The Provider (Clause 8.5)')
    . $row('Services included', 'Design and build, domain name, hosting, and Maintenance Services (up to 5 Website Changes a month)')
    . $row('Number of pages', $h($pages))
    . $row('Build Fee', '<strong>' . $h($build) . '</strong>, paid when signing. Includes the Monthly Fee for the first month.')
    . $row('Separately quoted work', $offer['quoted'] !== '' ? nl2br($h($offer['quoted'])) : 'None')
    . $row('Plan', $chosen ? '<strong>' . $h($chosen['name']) . '</strong> (Initial Term ' . $h($chosen['term']) . ' from the Payment Date)' : 'The plan you choose when signing: 12-Month Plan (Initial Term 12 months) or 5-Year Plan (Initial Term 60 months), from the Payment Date')
    . $row('Monthly Fee', $chosen ? '<strong>' . $h($monthlyText) . '</strong>' : $h($monthlyText))
    . $row('Monthly payments', $h($first))
    . $row('Start Date (go-live)', $h($start))
    . $row('Payment method', 'Card, through Stripe')
    . '</table></div>';

  $o .= '<' . $h3 . '>Signatures</' . $h3 . '><div class="agreement__table"><table>'
    . $row('For the Provider', $providerName . '. Agreed by sending this Order Form to the Client on ' . $h(date('j F Y', (int) $offer['created'])) . '.')
    . ($signed
      ? $row('For the Client', 'Signed electronically by <strong>' . $h($signed['name']) . '</strong>, ' . $h($signed['role']) . ', for ' . $h($offer['business']) . ', on ' . $h($signed['at_text']) . ', from IP address ' . $h($signed['ip']) . '.')
      : $row('For the Client', 'Sign below by typing your name.'))
    . '</table></div>'
    . '<p class="agreement__ref">Agreement ' . $h(KM_AGREEMENT_VERSION) . ' · Contract ' . $h($offer['id']) . '</p>';
  return $o;
}

/** A complete, stand-alone copy of what they signed (kept on the server and emailed to both of you). */
function km_agreement_document(array $offer, array $signed): string {
  $co = (array) ($offer['company'] ?? KM_COMPANY);
  return '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    . '<title>' . km_h($co['trading_as'] . ' Service Agreement: ' . $offer['business']) . '</title><style>'
    . 'body{margin:0;background:#f3efe4;color:#1a1a1a;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
    . 'main{max-width:760px;margin:0 auto;padding:32px 24px 48px;background:#fff}header{border-bottom:3px solid #d4af37;padding-bottom:14px;margin-bottom:18px}'
    . 'header p{margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7a5c0e;font-weight:700}h1{margin:6px 0 4px;font-size:24px;line-height:1.2}'
    . 'h2{font-size:17px;margin:26px 0 8px;color:#1f1f1f}h3{font-size:15px;margin:18px 0 6px}p{margin:8px 0}ul{margin:6px 0;padding-left:22px}li{margin:4px 0}'
    . 'table{width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:14px}th,td{text-align:left;vertical-align:top;padding:8px 10px;border:1px solid #e3dccb}'
    . 'th{width:34%;background:#faf7ef;font-weight:600}.agreement__ref{margin-top:18px;font-size:12px;color:#6e675c}@media print{body{background:#fff}main{padding:0}}'
    . '</style></head><body><main><header><p>' . km_h($co['trading_as']) . '</p><h1>Website Design, Hosting &amp; Maintenance Service Agreement</h1><div>Terms &amp; Conditions for business clients</div>'
    . '<div>' . km_h($offer['business']) . ' · ' . ($signed ? 'Signed ' . km_h($signed['at_text']) : 'Not signed yet') . '</div></header>'
    . km_agreement_body($offer, $signed) . '</main></body></html>';
}
