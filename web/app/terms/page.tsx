import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-sh-surface-light dark:bg-sh-surface-dark py-20 px-4 md:px-0">
            <div className="max-w-4xl mx-auto bg-white dark:bg-sh-surface-dark-brighter rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                <div className="mb-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sh-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Terms of Service</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated March 04, 2026</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 antialiased">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-4">AGREEMENT TO OUR LEGAL TERMS</h2>
                    <p>
                        We are <strong>SkillHire</strong> ("<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," "<strong>our</strong>").
                    </p>
                    <p>
                        We operate the website <a href="https://www.skillhire.in" className="text-sh-primary hover:underline">https://www.skillhire.in</a> (the "<strong>Site</strong>"), as well as any other related products and services that refer or link to these legal terms (the "<strong>Legal Terms</strong>") (collectively, the "<strong>Services</strong>").
                    </p>
                    <p>
                        You can contact us by email at <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a> or by mail to India.
                    </p>
                    <p>
                        These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("<strong>you</strong>"), and SkillHire, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                    </p>
                    <p>
                        Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
                    </p>
                    <p>
                        The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
                    </p>
                    <p>
                        We recommend that you print a copy of these Legal Terms for your records.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">TABLE OF CONTENTS</h2>
                    <ol className="list-decimal pl-6 space-y-1">
                        <li><a href="#services" className="text-sh-primary hover:underline">OUR SERVICES</a></li>
                        <li><a href="#ip" className="text-sh-primary hover:underline">INTELLECTUAL PROPERTY RIGHTS</a></li>
                        <li><a href="#userreps" className="text-sh-primary hover:underline">USER REPRESENTATIONS</a></li>
                        <li><a href="#userreg" className="text-sh-primary hover:underline">USER REGISTRATION</a></li>
                        <li><a href="#purchases" className="text-sh-primary hover:underline">PURCHASES AND PAYMENT</a></li>
                        <li><a href="#subscriptions" className="text-sh-primary hover:underline">SUBSCRIPTIONS</a></li>
                        <li><a href="#prohibited" className="text-sh-primary hover:underline">PROHIBITED ACTIVITIES</a></li>
                        <li><a href="#ugc" className="text-sh-primary hover:underline">USER GENERATED CONTRIBUTIONS</a></li>
                        <li><a href="#license" className="text-sh-primary hover:underline">CONTRIBUTION LICENSE</a></li>
                        <li><a href="#thirdparty" className="text-sh-primary hover:underline">THIRD-PARTY WEBSITES AND CONTENT</a></li>
                        <li><a href="#advertisers" className="text-sh-primary hover:underline">ADVERTISERS</a></li>
                        <li><a href="#sitemanage" className="text-sh-primary hover:underline">SERVICES MANAGEMENT</a></li>
                        <li><a href="#ppyes" className="text-sh-primary hover:underline">PRIVACY POLICY</a></li>
                        <li><a href="#terms" className="text-sh-primary hover:underline">TERM AND TERMINATION</a></li>
                        <li><a href="#modifications" className="text-sh-primary hover:underline">MODIFICATIONS AND INTERRUPTIONS</a></li>
                        <li><a href="#law" className="text-sh-primary hover:underline">GOVERNING LAW</a></li>
                        <li><a href="#disputes" className="text-sh-primary hover:underline">DISPUTE RESOLUTION</a></li>
                        <li><a href="#corrections" className="text-sh-primary hover:underline">CORRECTIONS</a></li>
                        <li><a href="#disclaimer" className="text-sh-primary hover:underline">DISCLAIMER</a></li>
                        <li><a href="#liability" className="text-sh-primary hover:underline">LIMITATIONS OF LIABILITY</a></li>
                        <li><a href="#indemnification" className="text-sh-primary hover:underline">INDEMNIFICATION</a></li>
                        <li><a href="#userdata" className="text-sh-primary hover:underline">USER DATA</a></li>
                        <li><a href="#electronic" className="text-sh-primary hover:underline">ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></li>
                        <li><a href="#misc" className="text-sh-primary hover:underline">MISCELLANEOUS</a></li>
                        <li><a href="#contact" className="text-sh-primary hover:underline">CONTACT US</a></li>
                    </ol>

                    <div id="services" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. OUR SERVICES</h2>
                        <p>
                            The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                        </p>
                    </div>

                    <div id="ip" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. INTELLECTUAL PROPERTY RIGHTS</h2>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Our intellectual property</h3>
                        <p>
                            We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "<strong>Content</strong>"), as well as the trademarks, service marks, and logos contained therein (the "<strong>Marks</strong>").
                        </p>
                        <p>
                            Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
                        </p>
                        <p>
                            The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use only.
                        </p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Your use of our Services</h3>
                        <p>
                            Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>access the Services; and</li>
                            <li>download or print a copy of any portion of the Content to which you have properly gained access,</li>
                        </ul>
                        <p>
                            solely for your personal, non-commercial use.
                        </p>
                        <p>
                            Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                        </p>
                        <p>
                            If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a>. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
                        </p>
                        <p>
                            We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
                        </p>
                        <p>
                            Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
                        </p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Your submissions</h3>
                        <p>
                            Please review this section and the "PROHIBITED ACTIVITIES" section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
                        </p>
                        <p>
                            <strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                        </p>
                        <p>
                            <strong>You are responsible for what you post or upload:</strong> By sending us Submissions through any part of the Services you:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>confirm that you have read and agree with our "PROHIBITED ACTIVITIES" and will not post, send, publish, upload, or transmit through the Services any Submission that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;</li>
                            <li>to the extent permissible by applicable law, waive any and all moral rights to any such Submission;</li>
                            <li>warrant that any such Submission are original to you or that you have the necessary rights and licenses to submit such Submissions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions; and</li>
                            <li>warrant and represent that your Submissions do not constitute confidential information.</li>
                        </ul>
                        <p>
                            You are solely responsible for your Submissions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.
                        </p>
                    </div>

                    <div id="userreps" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. USER REPRESENTATIONS</h2>
                        <p>
                            By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.
                        </p>
                        <p>
                            If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
                        </p>
                    </div>

                    <div id="userreg" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. USER REGISTRATION</h2>
                        <p>
                            You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                        </p>
                    </div>

                    <div id="purchases" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. PURCHASES AND PAYMENT</h2>
                        <p>
                            We accept the following forms of payment:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>UPI</li>
                            <li>Credit Card/Debit Card</li>
                        </ul>
                        <p>
                            You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in <strong>INR</strong>.
                        </p>
                        <p>
                            You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
                        </p>
                        <p>
                            We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.
                        </p>
                    </div>

                    <div id="subscriptions" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. SUBSCRIPTIONS</h2>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Billing and Renewal</h3>
                        <p>
                            Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle will depend on the type of subscription plan you choose when you subscribed to the Services.
                        </p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Cancellation</h3>
                        <p>
                            All purchases are non-refundable. You can cancel your subscription at any time by contacting us using the contact information provided below. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a>.
                        </p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Fee Changes</h3>
                        <p>
                            We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
                        </p>
                    </div>

                    <div id="prohibited" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. PROHIBITED ACTIVITIES</h2>
                        <p>
                            You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                        </p>
                        <p>
                            As a user of the Services, you agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                            <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                            <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
                            <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                            <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                            <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                            <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                            <li>Engage in unauthorized framing of or linking to the Services.</li>
                            <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
                            <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                            <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                            <li>Attempt to impersonate another user or person or use the username of another user.</li>
                            <li>Upload or transmit any material that acts as a passive or active information collection or transmission mechanism.</li>
                            <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
                            <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                            <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
                            <li>Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                            <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
                            <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system.</li>
                            <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
                            <li>Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users or creating user accounts by automated means or under false pretenses.</li>
                            <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
                            <li>Use the Services to advertise or offer to sell goods and services.</li>
                        </ul>
                    </div>

                    <div id="ugc" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. USER GENERATED CONTRIBUTIONS</h2>
                        <p>
                            The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services (collectively, "<strong>Contributions</strong>"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated in accordance with the Services' Privacy Policy. When you create or make available any Contributions, you thereby represent and warrant that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your Contributions do not and will not infringe the proprietary rights of any third party.</li>
                            <li>You are the creator and owner of or have the necessary licenses and permissions to use and to authorize us to use your Contributions.</li>
                            <li>You have the written consent of each identifiable individual person in your Contributions.</li>
                            <li>Your Contributions are not false, inaccurate, or misleading.</li>
                            <li>Your Contributions are not unauthorized advertising or solicitation.</li>
                            <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, atau objectionable.</li>
                            <li>Your Contributions do not ridicule, mock, or abuse anyone.</li>
                            <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
                            <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
                        </ul>
                        <p>
                            Any use of the Services in violation of the foregoing violates these Legal Terms and may result in termination or suspension of your rights to use the Services.
                        </p>
                    </div>

                    <div id="license" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. CONTRIBUTION LICENSE</h2>
                        <p>
                            You and Services agree that we may access, store, process, and use any information and personal data that you provide following the terms of the Privacy Policy and your choices.
                        </p>
                        <p>
                            By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.
                        </p>
                        <p>
                            We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services.
                        </p>
                    </div>

                    <div id="thirdparty" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. THIRD-PARTY WEBSITES AND CONTENT</h2>
                        <p>
                            The Services may contain links to other websites ("Third-Party Websites") as well as articles, photographs, and other content belonging to third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated or checked for accuracy by us, and we are not responsible for any Third-Party Websites accessed through the Services. Inclusion of, linking to, or permitting the use of any Third-Party Websites or Content does not imply approval or endorsement thereof by us.
                        </p>
                    </div>

                    <div id="advertisers" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. ADVERTISERS</h2>
                        <p>
                            We allow advertisers to display their advertisements and other information in certain areas of the Services. We simply provide the space to place such advertisements, and we have no other relationship with advertisers.
                        </p>
                    </div>

                    <div id="sitemanage" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. SERVICES MANAGEMENT</h2>
                        <p>
                            We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms; (3) refuse, restrict access to, or disable any of your Contributions; (4) remove from the Services all files and content that are excessive in size; and (5) otherwise manage the Services in a manner designed to protect our rights and property.
                        </p>
                    </div>

                    <div id="ppyes" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. PRIVACY POLICY</h2>
                        <p>
                            We care about data privacy and security. Please review our Privacy Policy: <strong><a href="http://www.skillhire.in/privacy" className="text-sh-primary hover:underline">http://www.skillhire.in/privacy</a></strong>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in <strong>India</strong>.
                        </p>
                    </div>

                    <div id="terms" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. TERM AND TERMINATION</h2>
                        <p>
                            These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO DENY ACCESS TO AND USE OF THE SERVICES TO ANY PERSON FOR ANY REASON OR FOR NO REASON. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AT ANY TIME, WITHOUT WARNING.
                        </p>
                        <p>
                            If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name or a fake name.
                        </p>
                    </div>

                    <div id="modifications" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. MODIFICATIONS AND INTERRUPTIONS</h2>
                        <p>
                            We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors.
                        </p>
                    </div>

                    <div id="law" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. GOVERNING LAW</h2>
                        <p>
                            These Legal Terms shall be governed by and defined following the laws of <strong>India</strong>. SkillHire and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
                        </p>
                    </div>

                    <div id="disputes" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">17. DISPUTE RESOLUTION</h2>
                        <p>
                            You agree to irrevocably submit all disputes related to these Legal Terms to the jurisdiction of the <strong>India</strong> courts. SkillHire shall also maintain the right to bring proceedings in the courts of the country where you reside.
                        </p>
                    </div>

                    <div id="corrections" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">18. CORRECTIONS</h2>
                        <p>
                            There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
                        </p>
                    </div>

                    <div id="disclaimer" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">19. DISCLAIMER</h2>
                        <p>
                            THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.
                        </p>
                    </div>

                    <div id="liability" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">20. LIMITATIONS OF LIABILITY</h2>
                        <p>
                            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
                        </p>
                    </div>

                    <div id="indemnification" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">21. INDEMNIFICATION</h2>
                        <p>
                            You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) breach of your representations and warranties; (4) your violation of the rights of a third party; or (5) any overt harmful act toward any other user of the Services.
                        </p>
                    </div>

                    <div id="userdata" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">22. USER DATA</h2>
                        <p>
                            We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.
                        </p>
                    </div>

                    <div id="electronic" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">23. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
                        <p>
                            Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.
                        </p>
                    </div>

                    <div id="misc" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">24. MISCELLANEOUS</h2>
                        <p>
                            These Legal Terms and any policies or operating rules posted by us constitute the entire agreement between you and us. Our failure to exercise or enforce any right or provision shall not operate as a waiver. If any provision is determined to be unlawful, void, or unenforceable, that provision is deemed severable and does not affect the validity of remaining provisions.
                        </p>
                    </div>

                    <div id="contact" className="pt-10 border-t border-slate-100 dark:border-slate-800 mt-12 pb-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">25. CONTACT US</h2>
                        <p>
                            In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
                        </p>
                        <p>
                            <strong>SkillHire</strong><br />
                            India<br />
                            Email: <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
