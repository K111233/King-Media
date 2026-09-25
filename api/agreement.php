<?php
/*
 * King Media: the Service Agreement a client signs online (api/sign.php).
 * When the terms change, change them here and bump KM_AGREEMENT_VERSION:
 * every signed copy records the version and a fingerprint, and keeps the wording it was signed on.
 */
if (!defined('KM_API')) { http_response_code(404); exit; }

const KM_AGREEMENT_VERSION = 'KM-SA-2026-09-25.2';

/** How the domain is held: 'provider' (new, owned by King Media), 'existing' (the client already owns it) or 'client' (registered in the client's name). */
function km_domain_status(array $offer): string {
  $s = (string) ($offer['domain_status'] ?? '');
  if (in_array($s, ['provider', 'existing', 'client'], true)) return $s;
  return !empty($offer['domain_owned']) ? 'client' : 'provider';
}

/** Who the Provider is, in one line. */
function km_provider_text(array $co, bool $full = true): string {
  if (($co['type'] ?? 'company') === 'company') {
    return km_h($co['name']) . ', trading as ' . km_h($co['trading_as'])
      . ($full ? ', a company registered in ' . km_h($co['registered_in']) . ' under company number ' . km_h($co['number']) . ', whose registered office is at ' . km_h($co['office']) : '');
  }
  $who = ($co['owner'] ?? '') !== '' ? km_h($co['owner']) . ', trading as ' . km_h($co['trading_as']) : km_h($co['trading_as']);
  return $who . ($full ? ', a sole trader whose address for service is ' . km_h($co['address']) : '');
}

/** The agreement as HTML. Before signing it shows both plans; once signed, the plan they chose. */
function km_agreement_body(array $offer, array $signed = [], int $level = 2): string {
  $h2 = 'h' . $level; $h3 = 'h' . ($level + 1); // one level down when it sits inside the signing page
  $co = (array) ($offer['company'] ?? KM_COMPANY);
  $plans = km_contract_plans($offer);
  $chosen = $signed ? ($plans[$signed['plan']] ?? null) : null;
  $pages = KM_PAGE_LABELS[$offer['pages']] ?? '';
  $build = km_money((int) $offer['build_pence']);
  $twelve = (int) ($plans['12m']['monthly_pence'] ?? 0);
  $monthlyText = $chosen
    ? km_money($chosen['monthly_pence']) . ' a month (' . $chosen['name'] . ')'
    : implode(', or ', array_map(fn($p) => km_money($p['monthly_pence']) . ' a month on the ' . $p['name'], $plans));
  $h = fn(string $s) => km_h($s);
  $head = fn(string $s, string $id = '') => '<' . $h2 . ($id ? ' id="' . $id . '"' : '') . '>' . $s . '</' . $h2 . '>';
  $p = fn(string $s) => '<p>' . $s . '</p>';
  $c = fn(string $n, string $s) => '<p><strong>' . $n . '</strong>&nbsp; ' . $s . '</p>';
  $li = fn(array $items) => '<ul>' . implode('', array_map(fn($i) => '<li>' . $i . '</li>', $items)) . '</ul>';

  $o = $head('1. Parties')
    . $p('This Agreement is made between:')
    . $p('(1)&nbsp; ' . km_provider_text($co) . ' (“Provider”, “we”, “us”); and')
    . $p('(2)&nbsp; the person or business named in the Order Form at Schedule 1 (“Client”, “you”), which confirms it enters into this Agreement wholly or mainly for the purposes of its trade or business and not as a consumer,')
    . $p('together the “Parties”. These Terms, the Order Form (Schedule 1) and the processing details (Schedule 2) together form the “Agreement”.')

    . $head('2. Definitions') . $li([
      '“Approved Demo” means the demo of the Website the Client reviewed and approved before signing.',
      '“Build Fee” means the one-off fee for the design and build of the Website stated on the Order Form (standard Build Fees: £494.99 for 1 page, £899.99 for 2 pages, £1,199.99 for 3 pages, or £1,449.99 for 4 to 6 pages; websites of more than 6 pages are quoted). The Build Fee includes the Monthly Fee for the first month of the Plan.',
      '“Business Day” means a day other than a Saturday, Sunday or public holiday in England.',
      '“Demo Fee” means any fee the Client paid for the Provider to prepare a demo of the Website.',
      '“Early Exit Fee” has the meaning in Clause 6.3.',
      '“Fees” means the Build Fee, the Monthly Fee and any other sums payable under this Agreement.',
      '“Initial Term” means the minimum term of the Plan, beginning on the Payment Date: 12 months on the 12-Month Plan, or 60 months on the 5-Year Plan.',
      '“Monthly Fee” means the monthly fee for the Plan stated on the Order Form (standard Monthly Fees: for a Website of 1 or 2 pages, £49.99 on the 12-Month Plan or £39.99 on the 5-Year Plan; for 3 or more pages, £59.99 or £49.99).',
      '“Payment Date” means the date the Client pays the Build Fee.',
      '“Plan” means the monthly plan chosen on the Order Form: the “12-Month Plan” (Initial Term 12 months) or the “5-Year Plan” (Initial Term 60 months, with a lower Monthly Fee).',
      '“Plan Saving” means the difference between the 12-Month Plan and 5-Year Plan Monthly Fees for the Website shown on the Order Form.',
      '“Services” means the services described in Clause 3.',
      '“Start Date” means the date the Provider confirms in writing that the Website is live.',
      '“Website” means the website based on the Approved Demo (with any changes agreed in writing before the Payment Date), with the number of pages stated on the Order Form, designed, built and maintained by the Provider under this Agreement.',
    ])

    . $head('3. Services')
    . $c('3.1', 'Subject to payment of the Fees, the Provider shall provide: (a) design and build of the Website; (b) management of the domain name stated on the Order Form and, where the Provider registers it, its registration and on-time renewal (see Clause 8.5); (c) hosting of the Website with an SSL certificate (the padlock); and (d) Maintenance Services.')
    . $c('3.2', '“Maintenance Services” means security and software updates, fixing faults under Clause 3.5, daily backups under Clause 3.6, and up to five (5) Website Changes a month under Clause 3.3. Maintenance Services do not include new pages, new functionality (including taking online payments, online booking systems, and e-commerce, online shop or catalogue work) or major redesigns. The Provider will provide a separate written quote for any such work under Clause 4.4, which will proceed only once the Client has accepted that quote.')
    . $c('3.3', 'Website Changes. In each month of the Plan (running from the monthly payment date in Clause 4.3), the Client may ask for up to five (5) Website Changes, big or small. A Website Change is one request about one thing on an existing page, for example new prices or a new price list, new opening hours, swapping the photos in a gallery, or adding or changing one section. Unused Website Changes do not carry over. A “major redesign” means changing the overall look or layout of a whole page or of the whole Website (such as new colours, fonts or page structure). If a request is really a new page, new functionality or a major redesign, or counts as more than one Website Change, the Provider will say so before starting. Requests beyond five in a month will be done the next month, or quoted if the Client wants them sooner.')
    . $c('3.4', 'How to ask. The Client can ask for Website Changes by text or WhatsApp to the business number the Provider gives the Client, or by email to enquiries@kingmedia.uk. Requests sent anywhere else, including to a salesperson’s own phone, count only once they reach one of these. The Provider will use reasonable efforts to make each Website Change within five (5) Business Days of receiving everything it needs, and will tell the Client when it is live. The Client should check each change, especially prices, allergen and other legal information.')
    . $c('3.5', 'Faults. If the Website is offline or not working properly, the Client should tell the Provider by text, WhatsApp or email. The Provider will start work on it within one Business Day and fix faults within its control as soon as reasonably possible. Fixing a fault does not count as a Website Change. The Provider deals with requests on Business Days, and will give at least 7 days’ notice of any absence longer than 5 Business Days, during which it will still deal with faults that take the Website offline.')
    . $c('3.6', 'Backups. The Provider backs up the Website at least once a day, keeps backups for at least 7 days, and stores them separately from the live Website. If the Website is lost or damaged, the Provider will restore it from the most recent backup at no charge.')
    . $c('3.7', 'Not included. The Fees do not include: (a) email accounts: if the Client wants email on the domain name, the Provider will connect the Client’s own email service (such as Microsoft 365 or Google Workspace), which the Client pays for directly; (b) premium domain names, or domain endings other than .co.uk, .uk or .com, which are charged at cost; (c) third-party services the Client chooses, such as booking, shop or payment platforms, which the Client signs up to and pays for directly; or (d) paid images, fonts or tools the Client asks for. The Provider will get the Client’s agreement before any such cost is incurred. Hosting is for a normal small-business website: videos should be hosted on a video platform (such as YouTube) and embedded as set out in Clause 12.3.')
    . $c('3.8', 'By signing, the Client confirms it has reviewed and approved the Approved Demo. Changes asked for after the Payment Date are Website Changes or separately quoted work.')

    . $head('4. Fees &amp; Payment')
    . $c('4.1', 'Any Demo Fee the Client has paid is separate from the Build Fee and is not deducted from it.')
    . $c('4.2', 'The Client shall pay the Build Fee online by card when signing, or within 14 days afterwards (see Clause 5.1). The Provider aims to make the Website live on the day after the Payment Date (or the next Business Day), or as soon as the domain name is ready if an existing domain name has to be transferred or pointed to the Provider, unless the Parties agree a later date. If, for reasons within the Provider’s control, the Website is not live within 10 Business Days of the Payment Date, the Client may end this Agreement by written notice before it goes live, and the Provider will refund everything paid under this Agreement (not including any Demo Fee).')
    . $c('4.3', 'The Build Fee includes the Monthly Fee for the first month of the Plan. After that, the Client shall pay the Monthly Fee monthly in advance by continuous recurring card payment, set up when paying the Build Fee, starting one month after the Payment Date and then on or about the same day of each month (or the last day of a shorter month).')
    . $c('4.4', 'Quotes for work under Clause 3.2 are free, and the Provider aims to send them within 24 hours. Each quote will state the price, which is payable in full before work starts, and any change to the Monthly Fee (for example, if a new page moves the Website into the 3-or-more-pages price band). The Client accepts a quote in writing; a text, WhatsApp or email is enough. Accepting a quote also agrees any new Monthly Fee, which applies from the first monthly payment after the work goes live. Accepting a quote never restarts or extends the Initial Term. Where quoted work is listed on the Order Form, its price is included in the Build Fee and Monthly Fee stated there.')
    . $c('4.5', 'VAT. All Fees include VAT at the rate in force when this Agreement is signed. If the rate of VAT changes, the Fees may change to reflect the new rate from the date it takes effect, and the Provider will tell the Client in writing. The Provider will provide a VAT invoice on request.')
    . $c('4.6', 'Late payment. If a payment fails, the Provider will tell the Client by email and may retry it. Sums not paid on time carry interest and fixed compensation under the Late Payment of Commercial Debts (Interest) Act 1998, which the Provider may choose not to claim. If any sum is still unpaid 14 days after its due date, the Provider may, after giving the Client at least 7 days’ further written notice, suspend the Services, including taking the Website offline, until everything overdue has been paid. Monthly Fees continue to fall due during a suspension. The Provider will restore the Website within one Business Day of receiving payment in full. This does not affect any other right or remedy.')
    . $c('4.7', 'Card payments. The Client will keep a valid payment card set up for the Monthly Fee for as long as this Agreement lasts, and will give the Provider a working card (or pay by bank transfer against an invoice) within 7 days of being asked. Cancelling or blocking the recurring card payment, or the card expiring or being declined, does not end this Agreement or the Client’s duty to pay; only a notice to end it given under this Agreement does.')
    . $c('4.8', 'Chargebacks. Disputing a card payment with the Client’s bank for a sum that was properly due is a material breach. The Client must repay that sum, plus any dispute fee charged by the Provider’s payment provider.')

    . $head('5. Start, Term &amp; Renewal')
    . $c('5.1', 'The Provider offers this Agreement by sending the Client the signing link. The offer stays open for 30 days, and the Provider may withdraw it at any time until the Build Fee is paid. Signing alone does not bind either Party: this Agreement, the Plan and the Initial Term begin on the Payment Date, once the Client has signed and paid the Build Fee. If the Build Fee is not paid within 14 days of signing, the signature lapses. If the Provider nevertheless accepts a later payment, this Agreement begins on that Payment Date.')
    . $c('5.2', 'At the end of the Initial Term, this Agreement continues month to month on the same terms. Either Party can end it by giving at least 30 days’ written notice, to end on the last day of the Initial Term or of any later monthly period (each monthly period runs from the monthly payment date in Clause 4.3). The Provider will remind the Client by email at least 30 days before the Initial Term ends.')
    . $c('5.3', 'The Provider will confirm any notice to end this Agreement by email within 2 Business Days, and will cancel the recurring card payment so that nothing is taken after the end date except sums already due. If the Client does not receive that confirmation, it should call or text the Provider.')

    . $head('6. Ending the Plan early')
    . $c('6.1', 'The Monthly Fees, and the lower Monthly Fee on the 5-Year Plan in particular, are offered in return for the Client’s commitment to the whole Initial Term. The Provider fixes the Client’s price and plans its time and capacity on that basis.')
    . $c('6.2', 'The Client may end this Agreement before the end of the Initial Term by giving at least 30 days’ notice under Clause 15.6 and paying the Early Exit Fee. Using this right is not a breach of this Agreement. The Client keeps paying the Monthly Fee, and receiving the Services, during the notice period.')
    . $c('6.3', 'The Early Exit Fee is: (a) on the 12-Month Plan: the Monthly Fees that would have fallen due after the end of the notice period, up to the end of the Initial Term; and (b) on the 5-Year Plan: whichever is lower of (i) the Monthly Fees that would have fallen due after the end of the notice period, up to the end of the Initial Term, and (ii) twelve times the 12-Month Plan Monthly Fee for the Website, plus the Plan Saving multiplied by the number of months of the Initial Term that have started before this Agreement ends.')
    . $c('6.4', 'The Early Exit Fee is due on the date this Agreement ends.')
    . $c('6.5', 'If the Provider ends this Agreement under Clause 7.1 because of the Client’s breach (including non-payment), the Client shall pay any unpaid sums plus the Early Exit Fee, calculated as if the notice period under Clause 6.2 had ended on the date the Provider ends this Agreement. This is instead of damages for the loss of the rest of the Initial Term.')
    . $c('6.6', 'No Early Exit Fee is payable if this Agreement ends under Clause 7.1 because of the Provider’s breach or insolvency, or under Clause 4.2, 12.2(d), 14, 15.12 or 16.')
    . $c('6.7', 'This Clause 6 does not apply once the Initial Term has ended.')
    . $c('6.8', 'If the Client permanently stops trading (other than by selling its business, where Clause 15.1(a) applies) and gives the Provider reasonable evidence (for example from Companies House or HMRC), the Early Exit Fee is limited to 3 Monthly Fees. If the Client, or someone connected with it, starts a similar business within 12 months, the rest of the Early Exit Fee becomes payable.')
    . $c('6.9', 'If the Client is a sole trader who dies, or who becomes permanently unable to work and gives the Provider reasonable evidence of it, this Agreement ends with no Early Exit Fee.')
    . $c('6.10', 'The Client may choose to pay the Early Exit Fee in up to 6 equal monthly instalments by the same card payment.')

    . $head('7. Ending the Agreement for breach')
    . $c('7.1', 'Either Party may end this Agreement immediately by written notice if the other Party: (a) commits a material breach of this Agreement which, if it can be put right, is not put right within 14 days of written notice; or (b) becomes insolvent, to the extent the law allows this Agreement to be ended for that reason. Paying the Fees on time is an essential term of this Agreement. If any sum properly due is still unpaid 30 days after its due date, the Provider may end this Agreement straight away by written notice, without giving a further 14 days.')
    . $c('7.2', 'If the Provider ends this Agreement under Clause 7.1 because of the Client’s breach, Clause 6.5 applies. If the Client ends it under Clause 7.1 because of the Provider’s breach or insolvency: no Early Exit Fee is payable; the Provider will refund any Monthly Fee paid for any period after the end date; and the Provider will provide the handover in Clauses 8.4 and 8.5 free of charge, whether or not any sum is disputed.')
    . $c('7.3', 'Ending this Agreement does not affect rights and remedies that have already arisen. Clauses 4 (for sums already due), 6, 8.4, 8.5, 9.5, 11, 12 (for as long as the Provider holds personal data for the Client), 13, 15 and 16 continue after it ends.')

    . $head('8. Website Ownership, Content &amp; Domain')
    . $c('8.1', 'The Client owns, or has permission to use, all text, images, logos, reviews and other material it supplies to the Provider or asks the Provider to take from the Client’s own online profiles, such as its Google Business Profile or Facebook page (“Client Content”). The Client gives the Provider permission to use Client Content to build and run the Website.')
    . $c('8.2', 'The Provider owns the code, layouts and design it creates for the Website, any text and images it creates for the Website (other than Client Content), and its own reusable code, components, tools and frameworks (together, “Provider IP”). Images, fonts and other material the Provider licenses from third parties (such as stock photos) are used under those licences.')
    . $c('8.3', 'While this Agreement is in force, the Provider grants the Client a non-exclusive, non-transferable licence to use the Website, and the Provider IP in it, for the Client’s own business. Non-payment is dealt with under Clause 4.6.')
    . $c('8.4', 'When this Agreement ends: (a) the Provider will send the Client a copy of its Client Content within 10 Business Days of a written request made within 30 days, whatever the reason this Agreement ended and even if any sum is unpaid or disputed; (b) once all sums due (including any Early Exit Fee) have been paid, the Provider will send the Client a copy of the Website files within 14 days of a written request made within 30 days. From then on the Client may keep using, changing and hosting that copy of the Website for its own business, free of charge and without time limit, but may not sell it or reuse the Provider IP for another business. Third-party material is included only where its licence allows; otherwise the Provider will list it so the Client can license or replace it; and (c) the Provider will remind the Client of these rights by email when this Agreement ends, and may delete its copies 30 days after the end date unless a request has been made. Personal data the Provider holds for the Client is returned or deleted under Clause 12.2(h).')
    . $c('8.5', 'Domain name. (a) New domain names: unless the Order Form says otherwise, the Provider registers the domain name in its own name, pays for it and manages it, and it is the Provider’s property. While this Agreement is in force, the Provider will renew it on time and use it only for the Client’s Website and, if the Client uses it, the Client’s email. (b) Domain names the Client already owns: a domain name the Client owned before this Agreement stays the Client’s property and is never transferred to the Provider. The Client will keep it registered and point it to the Provider’s hosting, or give the Provider the access needed to manage it in the Client’s name. (c) Client-owned domain names: if the Order Form says the Client owns the domain name, the Provider registers it in the Client’s name, manages it for the Client while this Agreement is in force, and will hand over control within 14 days of a written request made after this Agreement ends, once all sums due have been paid. (d) After this Agreement ends and all sums due have been paid, the Provider will transfer a Provider-owned domain name to the Client, or to a provider the Client names, within 14 days of a written request made within 12 months of the end date, for a one-off fee of no more than the Provider’s actual costs of transferring it. If no request is made within those 12 months, the Provider will let the domain name lapse at the end of its registration period. The Provider will never use a domain name containing the Client’s business name for any other business, sell it to anyone other than the Client, or point it at anyone else’s website. (e) Email: if the Client uses email addresses on the domain name, the Provider will keep the domain’s email settings working while this Agreement is in force (including during any suspension under Clause 4.6) and for 60 days after it ends, so the Client can move its email.')

    . $head('9. Client Obligations')
    . $c('9.1', 'The Client shall: provide Client Content, feedback and any access details reasonably required, in good time; respond to reasonable requests from the Provider without undue delay; and ensure Client Content does not infringe any third party’s rights or applicable law. Delay caused by the Client does not extend the Initial Term or suspend the Monthly Fee.')
    . $c('9.2', 'The Client confirms that it has the right to use all Client Content, including photos and customer reviews, and that anyone recognisable in a photo has agreed to it being used. The Provider will show reviews without changing their wording, with the reviewer’s first name and initial only unless the reviewer has agreed otherwise, and will remove any review or photo if its owner or the platform asks.')
    . $c('9.3', 'The Client is responsible for checking that everything on the Website about its business is accurate and lawful, even where the Provider wrote the words, including prices, opening hours, allergen and product information, and any qualifications, memberships or insurance claims. Approving the demo or a Website Change counts as the Client’s confirmation.')
    . $c('9.4', 'The Client must not ask the Provider to publish anything unlawful, defamatory, misleading, discriminatory or obscene, anything that infringes anyone’s rights, or anything that breaks the rules of the Provider’s hosting or payment providers. The Provider may refuse to publish, or may remove, anything it reasonably believes breaks this clause or that is the subject of a complaint, and will tell the Client promptly.')
    . $c('9.5', 'The Client will reimburse the Provider for reasonable losses, costs and damages arising from a claim that Client Content, or anything published on the Client’s instructions, infringes anyone’s rights or breaks the law, as long as the Provider tells the Client about the claim promptly and does not settle it without consulting the Client. The Provider will only use images, fonts and code it has the right to use.')

    . $head('10. Warranties &amp; Disclaimer')
    . $c('10.1', 'The Provider warrants it will perform the Services with reasonable care and skill.')
    . $c('10.2', 'The Provider does not warrant that the Website will be uninterrupted or error-free, or that it will achieve any particular level of traffic, enquiries, sales or search engine ranking.')
    . $c('10.3', 'Except as set out in this Agreement, all conditions, warranties and terms implied by statute or common law are excluded to the fullest extent permitted by law.')

    . $head('11. Limitation of Liability')
    . $c('11.1', 'Nothing in this Agreement limits or excludes liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else the law does not allow to be limited or excluded.')
    . $c('11.2', 'Subject to Clause 11.1, the Provider’s total liability arising out of or in connection with this Agreement, whether in contract, negligence or otherwise (including claims relating to Clause 12), shall not exceed the greater of £2,500 and the total Fees paid by the Client in the 12 months before the event giving rise to the claim.')
    . $c('11.3', 'Subject to Clause 11.1, the Provider shall not be liable for any indirect or consequential loss, or for loss of profits, revenue, business or goodwill.')
    . $c('11.4', 'Clause 3.6 applies to lost or damaged Website data and Client Content; any further liability for it is subject to Clause 11.2.')
    . $c('11.5', 'The Client accepts that the Fees reflect these limits and that it can insure its own business against loss of trade.')

    . $head('12. Data Protection')
    . $c('12.1', 'Each Party will comply with the UK GDPR and the Data Protection Act 2018. Each Party is a separate controller of the contact details it holds about the other’s people, and uses them only to run this Agreement.')
    . $c('12.2', 'For personal data the Provider handles for the Client in hosting and running the Website (such as messages sent through website forms, booking or order details, visitor server logs, and personal data in Client Content), the Client is the controller and the Provider is its processor. Schedule 2 sets out the details. The Provider will: (a) process that data only to provide the Services and on the Client’s documented instructions (this Agreement is the Client’s main instruction; further instructions may be given in writing, including about transfers outside the UK), unless UK law requires otherwise, in which case it will tell the Client first unless the law forbids that; and tell the Client straight away if it thinks an instruction breaks data protection law; (b) make sure anyone it allows to access that data is bound by a duty of confidentiality; (c) keep appropriate technical and organisational security measures in place, as required by Article 32 of the UK GDPR, including secure (HTTPS) connections, prompt security updates, strong unique passwords with two-step verification on its hosting, domain and email accounts, and the backups in Clause 3.6; (d) use only the sub-processors described in Schedule 2, which the Client authorises. The Provider will email the Client at least 30 days before adding or replacing one. If the Client reasonably objects on data protection grounds and the Parties cannot agree a solution, the Client may end this Agreement by written notice with no Early Exit Fee. Each sub-processor will be bound by written terms giving at least the same protection, and the Provider remains responsible to the Client for them; (e) only allow the data to be processed outside the UK where UK data protection law permits it; (f) taking into account the nature of the processing, help the Client respond to people exercising their data protection rights (passing on any request it receives within 5 Business Days), and help the Client meet its obligations on security, personal data breaches, data protection impact assessments and consulting the ICO; (g) tell the Client without undue delay, and in any case within 48 hours, after becoming aware of a personal data breach affecting that data, with the information it has at the time, and keep the Client updated; (h) when this Agreement ends, at the Client’s choice, return or delete that data, whether or not any sum is outstanding, and delete any remaining copies within 30 days (backups within 35 days) unless the law requires them to be kept; and (i) make available the information reasonably needed to show compliance with this Clause 12, and allow for and contribute to audits, including inspections, by the Client or an auditor it appoints, on at least 14 days’ notice and normally no more than once a year, with each Party paying its own costs.')
    . $c('12.3', 'The Client is responsible for having a lawful basis for the personal data collected through its Website, for its Website’s privacy notice, and for any consent needed for cookies and similar technology on its Website. The Provider will add a standard privacy notice to the Website based on information the Client gives it. Unless agreed in writing, the Provider will not: (a) add analytics, advertising or other tracking tools; (b) add third-party content that sets cookies, such as embedded maps or videos, except in a form that loads only after the visitor agrees; or (c) collect health or other special category data (such as allergy details) through the Website.')

    . $head('13. Confidentiality')
    . $p('Each Party shall keep confidential the other’s non-public business information disclosed under this Agreement and use it only to perform its obligations, except where disclosure is required by law.')

    . $head('14. Events outside a Party’s control')
    . $p('Neither Party is liable for failure or delay caused by circumstances beyond its reasonable control, as long as it tells the other Party promptly and uses reasonable efforts to resume. A failure by the Provider’s own hosting, domain or email suppliers counts, unless the Provider caused it (for example by not paying the supplier or breaking its rules). This clause does not excuse any payment. If the Services are prevented for more than 30 days in a row, either Party may end this Agreement by written notice, with no Early Exit Fee, and the Provider will then refund any Monthly Fee paid for the period in which the Services were prevented.')

    . $head('15. General')
    . $c('15.1', 'Transfers. (a) The Client may not transfer this Agreement without the Provider’s written consent. The Provider will not unreasonably refuse or delay consent if the Client sells its business and the buyer takes this Agreement over on the same terms; once the buyer has agreed in writing, no Early Exit Fee is payable. (b) The Provider may transfer this Agreement, including all its rights and obligations (including its role as the Client’s processor under Clause 12), to a company it owns or controls (such as KING WEB MEDIA LTD) or to a buyer of its business, by giving the Client at least 30 days’ written notice. The Client agrees now to any such transfer. The Fees, Plan, Initial Term and these Terms will not change as a result, the new provider will be bound by them, and the Client’s card payments may be moved to the new provider’s payment account. The Client will sign anything reasonably needed to confirm the transfer.')
    . $c('15.2', 'Entire agreement. This Agreement (these Terms, the Order Form and any quote the Client accepts in writing) is the whole agreement between the Parties about its subject matter. It replaces anything said or written before it, including on calls, in texts, in sales material and on the Provider’s website. The Client confirms it has not relied on any statement or promise that is not written in this Agreement; anything else the Client was promised must be written on the Order Form under “Anything else agreed” before signing. People who make sales calls for the Provider cannot change these Terms or agree anything on the Provider’s behalf. Nothing in this clause limits liability for fraud or fraudulent misrepresentation.')
    . $c('15.3', 'Variation. Other than routine renewal under Clause 5, changes to the Monthly Fee agreed by accepting a quote under Clause 4.4, VAT changes under Clause 4.5 and updates under Clause 15.12, no variation is effective unless agreed in writing by both Parties.')
    . $c('15.4', 'Severability. If any provision of this Agreement is found unenforceable, the remaining provisions continue in full force.')
    . $c('15.5', 'No partnership. Nothing in this Agreement creates a partnership, agency or employment relationship between the Parties.')
    . $c('15.6', 'Notices. Notices under this Agreement, including notice to end it or about a breach, must be in writing and sent by email: to the Provider at enquiries@kingmedia.uk, and to the Client at the contact email on the Order Form, or to any new address a Party gives by notice. An email notice is treated as received on the next Business Day after it is sent, unless the sender receives a message that it was not delivered. Texts and WhatsApp messages can be used for Website Change requests, quotes and day-to-day contact, but not for notices. Each Party will keep its email address up to date. “Writing” and “written” include email.')
    . $c('15.7', 'Electronic signature. The Parties agree that this Agreement may be signed electronically, and that the Client typing their name and confirming their agreement online is as valid as a handwritten signature. The Provider keeps a record of the signing: the name and position typed, the plan chosen, the date and time, the IP address and browser used, and a SHA-256 fingerprint of the signed document. A copy of the signed document is emailed to both Parties. The Parties agree that this record may be used as evidence of this Agreement.')
    . $c('15.8', 'Third parties. No one other than the Parties (and anyone this Agreement is transferred to under Clause 15.1) has any right to enforce it under the Contracts (Rights of Third Parties) Act 1999.')
    . $c('15.9', 'Waiver. If a Party delays in enforcing, or does not enforce, a right, it can still enforce it later.')
    . $c('15.10', 'Precedence. If the Order Form and these Terms conflict, the Order Form applies. This Agreement applies over the Provider’s website terms.')
    . $c('15.11', 'Disputes. If a dispute arises, either Party can set it out in writing and the Parties will try in good faith to settle it within 30 days, including by talking it through. This does not stop the Provider claiming unpaid Fees, or either Party asking a court for urgent relief.')
    . $c('15.12', 'Updates to these Terms. The Provider may update these Terms by giving at least 30 days’ written notice, for example to reflect a change in the law, in its suppliers or in how it provides the Services. An update cannot change the Fees, the Plan or the Initial Term, which change only as set out in Clauses 4.4 and 4.5. If an update is materially worse for the Client, the Client may end this Agreement by notice before it takes effect, with no Early Exit Fee.')
    . $c('15.13', 'Governing law. This Agreement is governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction.')

    . $head('16. If the Provider can’t continue')
    . $c('16.1', 'The Provider may use trusted subcontractors and suppliers to help provide the Services, and may change them, but remains responsible for their work. Anyone who handles the Client’s information must keep to the same confidentiality and data protection duties as the Provider.')
    . $c('16.2', 'If the Website is offline, or the Provider does not deal with Website Change requests or fault reports, for more than 30 days in a row for any reason (including the Provider’s illness or death), or the Provider stops trading, the Client may end this Agreement by written notice. No Early Exit Fee or further Monthly Fees are then payable. Within 14 days of the Client’s request, the Provider (or its personal representatives) will, free of charge, send the Client the Website files and Client Content, transfer the domain name to the Client or to a provider it names, and allow the Client to keep using the Website as set out in Clause 8.4(b).')
    . $c('16.3', 'The Provider may end this Agreement by giving at least 3 months’ written notice if it is closing its business or stopping these Services for all its clients. Clause 16.2’s handover then applies, and no Early Exit Fee is payable.');

  // Schedule 1: the Order Form
  $row = fn(string $k, string $v) => '<tr><th scope="row">' . $k . '</th><td>' . $v . '</td></tr>';
  $domain = ['provider' => 'New: registered to and owned by the Provider (Clause 8.5(a))', 'existing' => 'Already owned by the Client, and stays the Client’s (Clause 8.5(b))',
    'client' => 'Registered in the Client’s name, and the Client owns it (Clause 8.5(c))'][km_domain_status($offer)];
  $o .= $head('Schedule 1: Order Form', 'order-form')
    . $p('This Order Form forms part of the ' . $h($co['trading_as']) . ' Website Design, Hosting &amp; Maintenance Service Agreement.')
    . '<' . $h3 . '>Client details</' . $h3 . '><div class="agreement__table"><table>'
    . $row('Client (legal name, and trading name if different)', $h($offer['business']))
    . (($offer['company_number'] ?? '') !== '' ? $row('Company number', $h($offer['company_number'])) : '')
    . $row('Registered / business address', nl2br($h($offer['address'])))
    . $row('Contact name', $h($offer['contact']))
    . $row('Contact email (for notices)', $h($offer['email']))
    . (($offer['phone'] ?? '') !== '' ? $row('Phone', $h($offer['phone'])) : '')
    . '</table></div><' . $h3 . '>Service details</' . $h3 . '><div class="agreement__table"><table>'
    . (($offer['demo'] ?? '') !== '' ? $row('Approved Demo', $h($offer['demo'])) : '')
    . $row('Website domain name', $h($offer['domain']))
    . $row('Domain name', $domain)
    . $row('Services included', 'Design and build, domain name (managed, and registered and renewed by the Provider unless the Client already owns it), hosting with SSL, security updates, fault fixing, daily backups, and up to 5 Website Changes a month')
    . $row('Number of pages', $h($pages))
    . $row('Build Fee', '<strong>' . $h($build) . '</strong>, paid when signing. Includes the Monthly Fee for the first month.')
    . $row('Separately quoted work', ($offer['quoted'] ?? '') !== '' ? nl2br($h($offer['quoted'])) : 'None')
    . $row('Plan', $chosen ? '<strong>' . $h($chosen['name']) . '</strong> (Initial Term ' . $h($chosen['term']) . ' from the Payment Date)' : 'The plan the Client chooses when signing: 12-Month Plan (Initial Term 12 months) or 5-Year Plan (Initial Term 60 months), from the Payment Date')
    . $row('Monthly Fee', $chosen ? '<strong>' . $h($monthlyText) . '</strong>' : $h($monthlyText))
    . ($twelve ? $row('12-Month Plan Monthly Fee for this Website (used in Clause 6.3)', $h(km_money($twelve))) : '')
    . $row('Monthly payments', 'One month after the Build Fee is paid, then on or about the same day each month, by card')
    . $row('Change requests', 'Text or WhatsApp the business number we give you, or email enquiries@kingmedia.uk (Clause 3.4)')
    . $row('Anything else agreed', ($offer['agreed'] ?? '') !== '' ? nl2br($h($offer['agreed'])) : 'Nothing')
    . '</table></div>';

  $o .= '<' . $h3 . '>Signatures</' . $h3 . '><div class="agreement__table"><table>'
    . $row('For the Provider', km_provider_text($co, false) . '. Agreed by sending this Order Form to the Client on ' . $h(date('j F Y', (int) $offer['created'])) . '.')
    . ($signed
      ? $row('For the Client', 'Signed electronically by <strong>' . $h($signed['name']) . '</strong>, ' . $h($signed['role']) . ', for ' . $h($offer['business']) . ', on ' . $h($signed['at_text']) . ', from IP address ' . $h($signed['ip']) . '. Confirmed the key points, including the minimum term, the Early Exit Fee and domain ownership.')
      : $row('For the Client', 'Sign below by typing your name.'))
    . '</table></div>';

  // Schedule 2: processing details (Clause 12)
  $o .= $head('Schedule 2: Processing details', 'processing')
    . $li([
      '<strong>Subject matter and purpose:</strong> hosting, maintaining, backing up and changing the Website, and passing on messages sent through it.',
      '<strong>Duration:</strong> the term of this Agreement, plus the return or deletion period in Clause 12.2(h).',
      '<strong>Nature of processing:</strong> storing, hosting, backing up, transmitting (for example emailing form messages to the Client), editing and deleting.',
      '<strong>Types of personal data:</strong> names; contact details; messages and enquiry details; booking or order details; IP addresses and technical data in server logs; personal data in Client Content (such as staff names and photos, and customer reviews).',
      '<strong>Special category data:</strong> none, unless agreed in writing.',
      '<strong>Data subjects:</strong> the Client’s customers and enquirers, visitors to the Website, the Client’s staff, and people named or shown in Client Content.',
      '<strong>Authorised sub-processors:</strong> the Provider’s website hosting provider (hosting, backups and sending form emails) and its business email provider (receiving form messages), whose names and locations the Provider will give the Client on request.',
      '<strong>The Client’s obligations and rights as controller:</strong> as set out in Clause 12.',
    ])
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

/** Plain-English key points shown right above the signature. Plan-specific lines carry data-plan-show so the page can show the chosen one. */
function km_agreement_keypoints(array $offer): string {
  $co = (array) ($offer['company'] ?? KM_COMPANY);
  $plans = km_contract_plans($offer);
  $build = (int) $offer['build_pence'];
  $saving = isset($plans['12m'], $plans['5y']) ? $plans['12m']['monthly_pence'] - $plans['5y']['monthly_pence'] : 0;
  $both = fn(callable $f) => implode(' ', array_map(fn($k, $p) => '<span data-plan-show="' . $k . '">' . $f($p, $k) . '</span>', array_keys($plans), $plans));
  $domain = ['provider' => 'we register it, renew it and own it (clause 8.5). If you leave and everything’s paid, you can take it with you for no more than our cost.',
    'existing' => 'you already own it, and it stays yours (clause 8.5).', 'client' => 'it’s registered in your name and it’s yours (clause 8.5).'][km_domain_status($offer)];
  $items = [
    '<strong>Who you’re dealing with:</strong> ' . km_provider_text($co) . '. enquiries@kingmedia.uk',
    '<strong>Today:</strong> ' . km_money($build) . ' for your website build, including your first month.',
    '<strong>Then:</strong> ' . $both(fn($p) => '<em>' . $p['name'] . ':</em> ' . km_money($p['monthly_pence']) . ' a month by card, starting a month after you pay, for at least ' . ($p['months'] - 1) . ' more payments. Minimum total ' . km_money($build + ($p['months'] - 1) * $p['monthly_pence']) . '.'),
    '<strong>Minimum term:</strong> ' . $both(fn($p) => '<em>' . $p['name'] . ':</em> ' . $p['term'] . ' from the day you pay, then month to month.') . ' We’ll email you before it ends.',
    '<strong>Leaving early</strong> costs an Early Exit Fee (clause 6). ' . $both(fn($p, $k) => $k === '12m' ? '<em>12-Month Plan:</em> the monthly fees left in your minimum term.' : '<em>5-Year Plan:</em> at most a year’s fees at the 12-Month price plus the ' . km_money($saving) . ' a month discount you’ve had, or the fees left if that’s less.') . ' Fairer rules apply if you close your business or can’t carry on (clauses 6.8–6.10).',
    '<strong>Your web address:</strong> ' . $domain,
    '<strong>Your website:</strong> your words, photos and logo are always yours. Once everything’s paid, you can keep your website if you leave (clause 8.4).',
    '<strong>Missed payments:</strong> we’ll warn you before your website is taken offline (clause 4.6).',
    '<strong>Our liability to you is limited</strong> (clause 11).',
    '<strong>This is a business contract</strong>, so consumer cooling-off rights don’t apply. All prices include VAT.',
  ];
  return '<ul>' . implode('', array_map(fn($i) => '<li>' . $i . '</li>', $items)) . '</ul>';
}
