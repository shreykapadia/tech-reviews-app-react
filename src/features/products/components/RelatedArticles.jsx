// src/components/ProductPage/RelatedArticles.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Placeholder article data - in a real app, this would come from a CMS or JSON file
const allArticlesData = [
  {
    id: 'best-smartphones-2025',
    title: 'Best Smartphones of 2025: Our Top Picks',
    summary: 'Discover the latest and greatest smartphones hitting the market this year, with in-depth analysis and comparisons.',
    thumbnailUrl: '/images/articles/smartphones_2025_thumb.webp', // Placeholder path
    categoryRelevance: ['Smartphone'],
    link: '/blog/best-smartphones-2025', // Placeholder link
  },
  {
    id: 'smartphone-camera-comparison',
    title: 'Ultimate Smartphone Camera Shootout',
    summary: 'We put the top smartphone cameras to the test. See which device captures the best photos and videos.',
    thumbnailUrl: '/images/articles/camera_shootout_thumb.webp',
    categoryRelevance: ['Smartphone'],
    link: '/blog/smartphone-camera-shootout',
  },
  {
    id: 'laptop-buying-guide',
    title: 'Laptop Buying Guide: How to Choose the Right One',
    summary: 'Navigating the world of laptops can be tricky. Our guide helps you understand key specs and find the perfect match.',
    thumbnailUrl: '/images/articles/laptop_guide_thumb.webp',
    categoryRelevance: ['Laptop'],
    link: '/blog/laptop-buying-guide',
  },
  {
    id: 'best-gaming-laptops',
    title: 'Top Gaming Laptops for Every Budget',
    summary: 'Unleash your gaming potential with our roundup of the best gaming laptops, from entry-level to high-end rigs.',
    thumbnailUrl: '/images/articles/gaming_laptops_thumb.webp',
    categoryRelevance: ['Laptop'],
    link: '/blog/best-gaming-laptops',
  },
  {
    id: '4k-tv-explained',
    title: '4K TVs Explained: Everything You Need to Know',
    summary: 'Thinking of upgrading your TV? Understand what 4K means and why it might be time to make the switch.',
    thumbnailUrl: '/images/articles/4k_tv_thumb.webp',
    categoryRelevance: ['TV'],
    link: '/blog/4k-tv-explained',
  },
  {
    id: 'oled-vs-qled',
    title: 'OLED vs. QLED: Which TV Technology is Better?',
    summary: 'Dive deep into the differences between OLED and QLED display technologies to choose the best TV for your home.',
    thumbnailUrl: '/images/articles/oled_qled_thumb.webp',
    categoryRelevance: ['TV'],
    link: '/blog/oled-vs-qled',
  },
];

const ArticleCard = ({ article }) => (
  <Link to={article.link} className="block bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/10 transition-all duration-300 overflow-hidden group">
    {article.thumbnailUrl && (
      <img src={article.thumbnailUrl} alt={article.title} className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
    )}
    <div className="p-4">
      <h4 className="text-md font-semibold text-brand-primary group-hover:text-blue-700 mb-1.5 leading-tight">{article.title}</h4>
      <p className="text-xs text-gray-600 mb-2 leading-relaxed line-clamp-2">{article.summary}</p>
      <span className="text-xs text-brand-primary group-hover:text-blue-700 font-medium inline-flex items-center">
        Read More <ArrowRightIcon className="h-3 w-3 ml-1" />
      </span>
    </div>
  </Link>
);

const RelatedArticles = ({ currentProduct }) => {
  const [relevantArticles, setRelevantArticles] = useState([]);

  useEffect(() => {
    if (currentProduct && currentProduct.category) {
      const filtered = allArticlesData
        .filter(article => article.categoryRelevance.includes(currentProduct.category))
        .slice(0, 3); // Show up to 3 relevant articles
      setRelevantArticles(filtered);
    }
  }, [currentProduct]);

  if (!currentProduct || relevantArticles.length === 0) {
    return null;
  }

  return (
    <div className="py-8 sm:py-10 bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 animate-fade-in-up mt-6 sm:mt-8 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center">
          Further Reading
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {relevantArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

RelatedArticles.propTypes = {
  currentProduct: PropTypes.shape({
    category: PropTypes.string,
  }).isRequired,
};

export default RelatedArticles;