// src/components/PrivacyPolicyPage.jsx
import React from 'react';

function PrivacyPolicyPage() {
  const lastUpdatedDate = "October 26, 2023"; // Replace with your actual last updated date

  // Helper components for consistent styling
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
    <li className="text-brand-text mb-2 leading-relaxed text-base sm:text-lg">
      {children}
    </li>
  );

  return (
    // Adjust pt (padding-top) to match your fixed header's height + desired spacing
    <div className="bg-brand-light-gray min-h-screen py-8 pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        <article className="bg-white shadow-xl rounded-lg p-6 sm:p-8 md:p-10 lg:p-12">
          <header className="mb-8 md:mb-10 border-b pb-6 border-gray-200">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary font-serif mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: June 6, 2025
            </p>
          </header>

          <section>
            <Paragraph>
              Welcome to TechScore ("we," "us," or "our"). We are committed to protecting your personal
              information and your right to privacy. If you have any questions or concerns about this
              privacy notice, or our practices with regards to your personal information, please contact
              us at <a href="mailto:privacy@techscore.com" className="text-blue-600 hover:text-blue-800 underline">privacy@techscore.example.com</a>.
            </Paragraph>
            <Paragraph>
              This Privacy Policy applies to all information collected through our website
              (techscore.com), and/or any related services, sales, marketing or events
              (we refer to them collectively in this privacy notice as the "Services").
            </Paragraph>

            <SectionTitle>1. Information We Collect</SectionTitle>
            <Paragraph>
              We collect personal information that you voluntarily provide to us when you register on the
              Services, express an interest in obtaining information about us or our products and
              Services, when you participate in activities on the Services or otherwise when you contact us.
            </Paragraph>
            <Paragraph>
              The personal information that we collect depends on the context of your interactions with us
              and the Services, the choices you make and the products and features you use. The personal
              information we collect may include names, email addresses, usernames, passwords, contact preferences, and other similar information.
            </Paragraph>

            <SectionTitle>2. How We Use Your Information</SectionTitle>
            <Paragraph>
              We use personal information collected via our Services for a variety of business purposes
              described below. We process your personal information for these purposes in reliance on our
              legitimate business interests, in order to enter into or perform a contract with you,
              with your consent, and/or for compliance with our legal obligations.
            </Paragraph>
            <ul className="list-disc pl-6 sm:pl-8 space-y-1 mb-4">
              <ListItem>To facilitate account creation and logon process.</ListItem>
              <ListItem>To post testimonials with your consent.</ListItem>
              <ListItem>Request feedback and to contact you about your use of our Services.</ListItem>
              <ListItem>To enable user-to-user communications with each user's consent.</ListItem>
              <ListItem>To manage user accounts.</ListItem>
              <ListItem>To send administrative information to you.</ListItem>
            </ul>

            <SectionTitle>3. Will Your Information Be Shared With Anyone?</SectionTitle>
            <Paragraph>
              We only share information with your consent, to comply with laws, to provide you with
              services, to protect your rights, or to fulfill business obligations.
            </Paragraph>

            <SectionTitle>4. Cookies and Other Tracking Technologies</SectionTitle>
            <Paragraph>
              We may use cookies and similar tracking technologies (like web beacons and pixels) to access
              or store information. You can find out more about this in our Cookie Policy (if available) or manage your browser settings.
            </Paragraph>

            <SectionTitle>5. How Long Do We Keep Your Information?</SectionTitle>
            <Paragraph>
              We keep your information for as long as necessary to fulfill the purposes outlined in this
              privacy notice unless otherwise required by law.
            </Paragraph>

            <SectionTitle>6. How Do We Keep Your Information Safe?</SectionTitle>
            <Paragraph>
              We aim to protect your personal information through a system of organizational and technical
              security measures. However, no electronic transmission over the Internet or information storage
              technology can be guaranteed to be 100% secure.
            </Paragraph>

            <SectionTitle>7. Your Privacy Rights</SectionTitle>
            <Paragraph>
              Depending on your location, you may have certain rights regarding your personal information,
              such as the right to access, correct, or delete your data. Please contact us to exercise your rights.
            </Paragraph>

            <SectionTitle>8. Updates to This Notice</SectionTitle>
            <Paragraph>
              We may update this privacy notice from time to time. The updated version will be indicated
              by an updated "Last updated" date.
            </Paragraph>

            <SectionTitle>9. How Can You Contact Us About This Notice?</SectionTitle>
            <Paragraph>
              If you have questions or comments about this notice, you may email us at
              {' '}<a href="mailto:privacy@techscore.example.com" className="text-blue-600 hover:text-blue-800 underline">privacy@techscore.example.com</a> or by post to:
            </Paragraph>
            <Paragraph>
              TechScore<br />
              [Your Company Address Line 1]<br />
              [City, State, Zip Code]<br />
              [Country]
            </Paragraph>
          </section>
        </article>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;