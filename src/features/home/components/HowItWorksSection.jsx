// src/components/HowItWorksSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, UserGroupIcon, LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const HowItWorksSection = () => {
  // Helper component for consistent sub-section titles with icons
  const SectionSubTitle = ({ children, icon: IconComponent }) => (
    <div className="flex items-center mb-4">
      {IconComponent && <IconComponent className="h-7 w-7 text-brand-primary dark:text-blue-400 mr-3 flex-shrink-0" aria-hidden="true" />}
      <h3 className="text-xl sm:text-2xl font-semibold text-brand-text font-sans">
        {children}
      </h3>
    </div>
  );

  // Helper component for consistent paragraph styling
  const Paragraph = ({ children, className = "" }) => (
    <p className={`text-brand-text mb-4 leading-relaxed text-base ${className}`}>
      {children}
    </p>
  );

  // Helper component for consistent list item styling
  const ListItem = ({ children }) => (
    <li className="text-brand-text mb-3 leading-relaxed text-base flex items-start">
      <CheckCircleIcon className="h-5 w-5 text-brand-primary dark:text-blue-400 mr-2.5 mt-1 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );

  return (
    <section className="py-12 sm:py-16 bg-transparent animate-fade-in-up">
      <div className="container mx-auto px-4">
        {/* Main Title - Criterion 1.1, 1.2 */}
        <h2 className="text-3xl font-bold text-brand-primary dark:text-blue-400 mb-10 sm:mb-12 text-center font-serif">
          Understanding Our Ratings
        </h2>

        {/* Introduction - Criterion 2.1, 2.2 */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
          <Paragraph>
            TechScore is designed to simplify your tech decisions. We provide a unified "Critics Score" and "Audience Rating" for a wide range of tech products, cutting through the noise of fragmented reviews and information overload. Our platform aims to address concerns about review authenticity by offering transparent and reliable insights.
          </Paragraph>
        </div>

        {/* Grid for Critics Score and Audience Rating - Criterion 7.1, 9.1 */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-10 sm:mb-16">
          {/* Critics Score Section - Criterion 3.x */}
          <div className="bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-300">
            <SectionSubTitle icon={ShieldCheckIcon}>Critics Score</SectionSubTitle>
            <Paragraph>
              The Critics Score is a single, aggregated numerical score on a <strong>0-100 scale</strong>. It represents the consensus of professional tech reviewers from top publications.
            </Paragraph>
            <Paragraph>
              Our methodology uses a <strong>weighted average model</strong>:
            </Paragraph>
            <ul className="space-y-2 mb-4">
              <ListItem>
                <strong>Publication Weighting:</strong> Each publication is assigned a credibility weight based on their track record of rigorous, independent testing. Well-established sources carry more influence than lesser-known outlets.
              </ListItem>
              <ListItem>
                <strong>Score Normalization:</strong> Different reviewers use different rating scales, like 5-star, out of 10, or a percentage. We convert every score to a 0-100 scale before averaging so that all reviews are compared fairly.
              </ListItem>
              <ListItem>
                <strong>AI-Estimated Score Discount:</strong> When a publication writes a review but doesn't give an explicit numeric score, we estimate one based on the review's sentiment. These estimated scores are automatically discounted to reflect the lower confidence compared to an official rating.
              </ListItem>
            </ul>
            <Paragraph>
              The final Critics Score is the weighted average of all normalized review scores, where each score's influence is determined by its publication's credibility weight.
            </Paragraph>
            <Paragraph className="text-sm text-gray-600 dark:text-slate-400 italic">
              For example, a 4.5 out of 5 review is first normalized to 90 out of 100, then factored into the average based on that publication's weight. A review from a top-tier source will naturally contribute more to the final score than one from a lesser-known outlet.
            </Paragraph>
          </div>

          {/* Audience Rating Section - Criterion 4.x */}
          <div className="bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-300">
            <SectionSubTitle icon={UserGroupIcon}>Audience Rating</SectionSubTitle>
            <Paragraph>
              The Audience Rating is a separate numerical score, also on a <strong>0-100 scale</strong>, reflecting the collective sentiment of everyday users and consumers.
            </Paragraph>
            <Paragraph>
              Data sources for the Audience Rating include:
            </Paragraph>
            <ul className="space-y-2 mb-4">
              <ListItem>
                User-submitted reviews directly on the TechScore platform.
              </ListItem>
              <ListItem>
                Aggregated user ratings and reviews from major e-commerce sites (e.g., Amazon, Best Buy), app stores, and relevant discussion forums or social media platforms.
              </ListItem>
            </ul>
            <Paragraph>
              To ensure authenticity and prevent score manipulation (e.g., "fan-skewed" or "review-bombed" scores), we implement <strong>robust outlier detection and handling mechanisms</strong>.
            </Paragraph>
            <Paragraph>
              We are continuously exploring strategies to maintain the integrity of audience ratings, such as systems for verifying user reviews (e.g., through proof of purchase where feasible).
            </Paragraph>
          </div>
        </div>

        {/* Bias Mitigation Statement - Criterion 5.x */}
        <div className="bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-300 mb-10 sm:mb-16">
          <SectionSubTitle icon={LightBulbIcon}>Our Commitment to Mitigating Bias</SectionSubTitle>
          <Paragraph>
            TechScore is deeply committed to fairness and objectivity. We actively work to mitigate potential biases that can arise in both AI-driven aggregation models and human-led review processes.
          </Paragraph>
          <Paragraph>
            Our key strategies include:
          </Paragraph>
          <ul className="space-y-2 mb-4">
            <ListItem><strong>Diverse Data Sourcing:</strong> Aggregating reviews from a wide spectrum of sources to ensure a balanced perspective.</ListItem>
            <ListItem><strong>Algorithmic Design & Auditing:</strong> Continuously refining our algorithms to identify and reduce systemic biases, with regular audits.</ListItem>
            <ListItem><strong>Human Oversight:</strong> Employing a team of experts to oversee the aggregation process and address nuanced situations that algorithms might miss.</ListItem>
            <ListItem><strong>Continuous Monitoring:</strong> Regularly evaluating our scoring system for fairness and accuracy, making adjustments as needed.</ListItem>
          </ul>
          <Paragraph>
            We believe in transparency regarding our AI methodologies and will strive to provide clear explanations of how our system works.
          </Paragraph>
        </div>

        {/* Call to Action - Criterion 6.x */}
        <div className="text-center">
          <Link
            to="/about-methodology" // You can update this link when the page is ready
            className="inline-block px-8 py-3 sm:px-10 sm:py-4 bg-brand-primary text-white text-base sm:text-lg font-medium rounded-full hover:bg-brand-primary-dark focus:outline-none focus:ring-4 focus:ring-sky-200 shadow-lg shadow-brand-primary/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label="Learn more about our scoring methodology"
          >
            Learn More About Our Methodology
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
