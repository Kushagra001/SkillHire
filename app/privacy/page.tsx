import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Privacy Policy</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated March 04, 2026</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 antialiased">
                    <p>
                        This Privacy Notice for <strong>SkillHire</strong> describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you visit our website at <a href="https://www.skillhire.in/" className="text-sh-primary hover:underline">https://www.skillhire.in/</a> or any website of ours that links to this Privacy Notice.
                    </p>

                    <p>
                        <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a>.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">SUMMARY OF KEY POINTS</h2>
                    <p className="italic">
                        This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by using our table of contents below to find the section you are looking for.
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</li>
                        <li><strong>Do we process any sensitive personal information?</strong> We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law.</li>
                        <li><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</li>
                        <li><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</li>
                        <li><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</li>
                        <li><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information.</li>
                        <li><strong>What are your rights?</strong> Depending on where you are located, you may have certain rights regarding your personal information.</li>
                        <li><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">TABLE OF CONTENTS</h2>
                    <ol className="list-decimal pl-6 space-y-1">
                        <li><a href="#infocollect" className="text-sh-primary hover:underline">WHAT INFORMATION DO WE COLLECT?</a></li>
                        <li><a href="#infouse" className="text-sh-primary hover:underline">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
                        <li><a href="#whoshare" className="text-sh-primary hover:underline">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
                        <li><a href="#3pwebsites" className="text-sh-primary hover:underline">WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</a></li>
                        <li><a href="#cookies" className="text-sh-primary hover:underline">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
                        <li><a href="#ai" className="text-sh-primary hover:underline">DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</a></li>
                        <li><a href="#sociallogins" className="text-sh-primary hover:underline">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
                        <li><a href="#inforetain" className="text-sh-primary hover:underline">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
                        <li><a href="#infosafe" className="text-sh-primary hover:underline">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
                        <li><a href="#infominors" className="text-sh-primary hover:underline">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
                        <li><a href="#privacyrights" className="text-sh-primary hover:underline">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
                        <li><a href="#DNT" className="text-sh-primary hover:underline">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
                        <li><a href="#policyupdates" className="text-sh-primary hover:underline">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
                        <li><a href="#contact" className="text-sh-primary hover:underline">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
                        <li><a href="#request" className="text-sh-primary hover:underline">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
                    </ol>

                    <div id="infocollect" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Personal information you disclose to us</h3>
                        <p>
                            <em><strong>In Short:</strong> We collect personal information that you provide to us.</em>
                        </p>
                        <p>
                            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                        </p>
                        <p>
                            <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services. The personal information we collect may include names, phone numbers, email addresses, mailing addresses, job titles, usernames, passwords, contact preferences, authentication data, billing addresses, and debit/credit card numbers.
                        </p>
                        <p>
                            <strong>Sensitive Information.</strong> When necessary, with your consent or as otherwise permitted by applicable law, we process sensitive information such as student data.
                        </p>
                        <p>
                            <strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases. All payment data is handled and stored by <strong>Razorpay</strong>.
                        </p>
                    </div>

                    <div id="infouse" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                        <p>
                            <em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em>
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>To facilitate account creation and authentication</strong> and otherwise manage user accounts.</li>
                            <li><strong>To respond to user inquiries/offer support to users</strong> and solve any potential issues you might have.</li>
                        </ul>
                    </div>

                    <div id="whoshare" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
                        <p>
                            <em><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.</em>
                        </p>
                        <p>
                            We may need to share your personal information in the following situations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition.</li>
                            <li><strong>Affiliates.</strong> We may share your information with our affiliates, requiring them to honor this Privacy Notice.</li>
                            <li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products or services.</li>
                        </ul>
                    </div>

                    <div id="3pwebsites" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</h2>
                        <p>
                            <em><strong>In Short:</strong> We are not responsible for the safety of any information that you share with third parties that we may link to.</em>
                        </p>
                        <p>
                            The Services may link to third-party websites or applications that are not affiliated with us. We cannot guarantee the safety and privacy of data you provide to any third parties. Any data collected by third parties is not covered by this Privacy Notice.
                        </p>
                    </div>

                    <div id="cookies" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
                        <p>
                            <em><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</em>
                        </p>
                        <p>
                            We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
                        </p>
                    </div>

                    <div id="ai" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
                        <p>
                            <em><strong>In Short:</strong> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em>
                        </p>
                        <p>
                            Our AI Products use technologies from providers like <strong>Groq</strong> to enable functions such as Natural language processing and Text analysis. All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties.
                        </p>
                    </div>

                    <div id="sociallogins" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
                        <p>
                            <em><strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em>
                        </p>
                        <p>
                            Our Services offer you the ability to register and log in using third-party social media details. We will use the information received only for the purposes described in this Privacy Notice.
                        </p>
                    </div>

                    <div id="inforetain" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
                        <p>
                            <em><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this notice unless otherwise required by law.</em>
                        </p>
                        <p>
                            We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, typically for the duration of your account with us.
                        </p>
                    </div>

                    <div id="infosafe" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
                        <p>
                            <em><strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.</em>
                        </p>
                        <p>
                            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                        </p>
                    </div>

                    <div id="infominors" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. DO WE COLLECT INFORMATION FROM MINORS?</h2>
                        <p>
                            <em><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</em>
                        </p>
                        <p>
                            We do not knowingly collect, solicit data from, or market to children under 18 years of age. By using the Services, you represent that you are at least 18 years of age.
                        </p>
                    </div>

                    <div id="privacyrights" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
                        <p>
                            <em><strong>In Short:</strong> You may review, change, or terminate your account at any time.</em>
                        </p>
                        <p>
                            <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time.
                        </p>
                        <p>
                            <strong>Account Information:</strong> If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account.
                        </p>
                    </div>

                    <div id="DNT" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
                        <p>
                            Most web browsers include a Do-Not-Track ("DNT") feature. We do not currently respond to DNT browser signals as no uniform technology standard has been finalized.
                        </p>
                    </div>

                    <div id="policyupdates" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
                        <p>
                            <em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em>
                        </p>
                        <p>
                            We may update this Privacy Notice from time to time. The updated version will be indicated by a revised date at the top.
                        </p>
                    </div>

                    <div id="contact" className="pt-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
                        <p>
                            If you have questions or comments about this notice, you may email us at <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a> or contact us by post at:
                        </p>
                        <p>
                            <strong>SkillHire</strong><br />
                            India
                        </p>
                    </div>

                    <div id="request" className="pt-10 border-t border-slate-100 dark:border-slate-800 mt-12 pb-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
                        <p>
                            Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. To request to review, update, or delete your personal information, please contact us at <a href="mailto:hello@skillhire.in" className="text-sh-primary hover:underline">hello@skillhire.in</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
