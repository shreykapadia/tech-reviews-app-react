// src/components/TermsOfServicePage.jsx
import React from 'react';

function TermsOfServicePage() {
  const lastUpdatedDate = "October 26, 2023"; // Replace with your actual last updated date

  // Helper components for consistent styling (can be extracted to a shared file if used in more places)
  const SectionTitle = ({ children }) => (
    <h2 className="text-2xl sm:text-3xl font-semibold text-brand-text mt-8 mb-4 font-sans">
      {children}
    </h2>
  );

  const Paragraph = ({ children }) => (
    <p className="text-brand-text mb-4 leading-relaxed text-base sm:text-lg">
      {children}
    </p>
  );

  const ListItem = ({ children }) => (
    <li className="text-brand-text mb-2 ml-4 leading-relaxed text-base sm:text-lg">
      {children}
    </li>
  );

  return (
    // Adjust pt (padding-top) to match your fixed header's height + desired spacing
    <div className="min-h-screen py-8 pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        <article className="bg-white/92 dark:bg-slate-800/92 backdrop-blur-sm shadow-[0_24px_50px_rgba(8,38,67,0.14)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.35)] rounded-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-8 md:p-10 lg:p-12">
          <header className="mb-8 md:mb-10 border-b pb-6 border-gray-200 dark:border-slate-600">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary font-serif mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Last updated: {lastUpdatedDate}
            </p>
          </header>

          <section>
            <Paragraph>
              Welcome to TechScore ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service")
              govern your use of our website located at techscore.com (together or individually "Service")
              operated by TechScore.
            </Paragraph>
            <Paragraph>
              Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and
              disclose information that results from your use of our web pages. Please read it here: {' '}
              <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>.
            </Paragraph>
            <Paragraph>
              Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that
              you have read and understood Agreements, and agree to be bound of them.
            </Paragraph>
            <Paragraph>
              If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but
              please let us know by emailing at <a href="mailto:contact@techscore.example.com" className="text-blue-600 hover:text-blue-800 underline">contact@techscore.example.com</a> so we can try to find a solution.
              These Terms apply to all visitors, users and others who wish to access or use Service.
            </Paragraph>

            <SectionTitle>1. Communications</SectionTitle>
            <Paragraph>
              By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and
              other information we may send. However, you may opt out of receiving any, or all, of these
              communications from us by following the unsubscribe link or by emailing us.
            </Paragraph>

            <SectionTitle>2. Accounts</SectionTitle>
            <Paragraph>
              When you create an account with us, you guarantee that you are above the age of 18 and that the
              information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete,
              or obsolete information may result in the immediate termination of your account on Service.
            </Paragraph>
            <Paragraph>
              You are responsible for maintaining the confidentiality of your account and password, including but not
              limited to the restriction of access to your computer and/or account. You agree to accept
              responsibility for any and all activities or actions that occur under your account and/or password.
              You must notify us immediately upon becoming aware of any breach of security or unauthorized use of
              your account.
            </Paragraph>

            <SectionTitle>3. Intellectual Property</SectionTitle>
            <Paragraph>
              Service and its original content (excluding Content provided by users), features and functionality are
              and will remain the exclusive property of TechScore and its licensors. Service is protected by
              copyright, trademark, and other laws of both the [Your Country] and foreign countries. Our trademarks
              may not be used in connection with any product or service without the prior written consent of TechScore.
            </Paragraph>

            <SectionTitle>4. Links To Other Web Sites</SectionTitle>
            <Paragraph>
              Our Service may contain links to third-party web sites or services that are not owned or controlled by
              TechScore. TechScore has no control over, and assumes no responsibility for the content, privacy policies,
              or practices of any third party web sites or services. We do not warrant the offerings of any of these
              entities/individuals or their websites.
            </Paragraph>

            <SectionTitle>5. Termination</SectionTitle>
            <Paragraph>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice
              or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
              not limited to a breach of Terms.
            </Paragraph>

            <SectionTitle>6. Limitation Of Liability</SectionTitle>
            <Paragraph>
              In no event shall TechScore, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
              access to or use of or inability to access or use the Service.
            </Paragraph>

            <SectionTitle>7. Governing Law</SectionTitle>
            <Paragraph>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction, e.g., State of California, USA],
              without regard to its conflict of law provisions.
            </Paragraph>

            <SectionTitle>8. Changes To Service</SectionTitle>
            <Paragraph>
              We reserve the right to withdraw or amend our Service, and any service or material we provide via
              Service, in our sole discretion without notice. We will not be liable if for any reason all or any
              part of Service is unavailable at any time or for any period.
            </Paragraph>

            <SectionTitle>9. Amendments To Terms</SectionTitle>
            <Paragraph>
              We may amend Terms at any time by posting the amended terms on this site. It is your responsibility
              to review these Terms periodically. Your continued use of the Platform following the posting of
              revised Terms means that you accept and agree to the changes.
            </Paragraph>

            <SectionTitle>10. Cookies and Similar Technologies</SectionTitle>
            <Paragraph>
              Our Service may use "cookies" and similar tracking technologies (like web beacons, pixels, and scripts)
              to collect and track information, to improve and analyze our Service, and to personalize your experience.
              Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies
              are sent to your browser from a website and stored on your device.
            </Paragraph>
            <Paragraph>
              We use cookies for various purposes, such as remembering your preferences (e.g., login information, language settings),
              understanding how you interact with our Service (analytics), and for marketing purposes.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              However, if you do not accept cookies, you may not be able to use some portions of our Service.
              For more detailed information on the cookies we use, why we use them, and your choices regarding cookies,
              please refer to our <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 underline">Cookie Policy</a> [Note: Create this page or integrate details into your Privacy Policy].
            </Paragraph>

            <SectionTitle>11. Contact Us</SectionTitle>
            <Paragraph>
              Please send your feedback, comments, requests for technical support by email: <a href="mailto:contact@techscore.example.com" className="text-blue-600 hover:text-blue-800 underline">contact@techscore.example.com</a>.
            </Paragraph>
          </section>
        </article>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
