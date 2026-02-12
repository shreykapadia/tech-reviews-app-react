// src/components/CategoryBrowse.jsx
import React from 'react';
import PropTypes from 'prop-types';

// CategoryBrowse now receives categoriesData as a prop
const CategoryBrowse = React.memo(function CategoryBrowse({ categoriesData, isLoading, error }) {
  // isLoading and error can also be passed as props if App.jsx manages global loading/error states
  // For this example, we'll derive them based on categoriesData prop.
  const effectiveIsLoading = isLoading === undefined ? !categoriesData || categoriesData.length === 0 : isLoading;
  const effectiveError = error;

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-transparent animate-fade-in-up">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-slate-100 mb-6 sm:mb-10 text-center font-serif">
          Browse by Product Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {effectiveIsLoading && !effectiveError && <p className="col-span-full text-center text-gray-500 dark:text-slate-400">Loading categories...</p>}
          {effectiveError && <p className="col-span-full text-center text-red-500">Error loading categories: {String(effectiveError)}</p>}
          {!effectiveIsLoading && !effectiveError && categoriesData.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-slate-400">No categories found.</p>
          )}
          {!effectiveIsLoading && !effectiveError && categoriesData.length > 0 && (
            categoriesData.map((category) => (
              <a
                key={category.id || category.slug} // Prefer category.id if available, fallback to slug
                href={`/category/${category.slug}`} // Updated URL to match CategoryPage route
                aria-label={category.ariaLabel}
                className="group bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-2xl shadow-[0_18px_35px_rgba(6,39,70,0.12)] dark:shadow-[0_18px_35px_rgba(0,0,0,0.3)] p-4 sm:p-6 transform hover:scale-[1.02] hover:shadow-[0_22px_44px_rgba(6,39,70,0.16)] dark:hover:shadow-[0_22px_44px_rgba(0,0,0,0.4)] transition-all duration-300 border border-white/70 dark:border-slate-700/70 hover:border-brand-accent/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary flex flex-col items-center justify-center text-center aspect-square"
              // aspect-square ensures the card is a square, good for consistent tap targets
              >
                {category.iconImageUrl ? (
                  <img
                    src={category.iconImageUrl}
                    alt="" // Alt text is empty as the link's aria-label describes the purpose.
                    // If the icon conveys unique info, provide descriptive alt text here.
                    aria-hidden="true"
                    className="h-24 w-24 sm:h-32 sm:w-32 object-contain mb-3 sm:mb-4 group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div aria-hidden="true" className="h-24 w-24 sm:h-32 sm:w-32 bg-gray-200 dark:bg-slate-700 rounded-md mb-3 sm:mb-4 flex items-center justify-center text-gray-400 dark:text-slate-500 text-4xl">?</div>
                )}
                <span className="text-lg sm:text-xl md:text-2xl font-semibold text-brand-text dark:text-slate-100 group-hover:text-brand-primary">
                  {category.name}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
});

CategoryBrowse.propTypes = {
  categoriesData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Add id prop type
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    iconImageUrl: PropTypes.string,
    ariaLabel: PropTypes.string,
  })),
  isLoading: PropTypes.bool, // Optional: if App.jsx passes its loading state
  error: PropTypes.any,     // Optional: if App.jsx passes its error state
};
CategoryBrowse.defaultProps = {
  // id will be required by the shape, so no default needed here for it
  categoriesData: [],
};
export default CategoryBrowse;

/*
  Further Icon/Image Implementation Notes:

  1. SVG Icons (Recommended for scalability and crispness):
     - You can create individual SVG files (e.g., smartphone.svg, laptop.svg) and place them in `public/images/icons/`.
     - Then use an <img> tag: `<img src={`/images/icons/${category.slug}.svg`} alt="" className="h-12 w-12 ..."/>`
     - Or, import SVGs as React components if your build setup (like Vite with svgr plugin) supports it:
       `import { ReactComponent as SmartphoneIcon } from './icons/smartphone.svg';`
       And then use `<SmartphoneIcon className="h-12 w-12 ..." />`
     - Ensure SVGs are monochrome or use `fill="currentColor"` or `stroke="currentColor"` to be styled by Tailwind's text color utilities.

  2. Image Files (PNG, WebP):
     - Place them in `public/images/categories/` (e.g., `public/images/categories/smartphones.png`).
     - Use: `<img src={`/images/categories/${category.slug}.png`} alt="" className="h-12 w-12 object-contain ..."/>`
     - Ensure images are optimized for the web and have a consistent style.

  3. Icon Font Library (e.g., Heroicons, Font Awesome):
     - Install the library.
     - Import and use the icons as components.
     - Example with Heroicons (assuming you have it installed and configured):
       `import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';`
       `<DevicePhoneMobileIcon className="h-12 w-12 text-blue-500 ..."/>`

  Choosing the right icon size:
  - `h-12 w-12 sm:h-16 sm:w-16` (48px/64px) is a good starting point. Adjust as needed for visual balance.

  Color:
  - `text-blue-500` matches your button's primary color, providing a consistent accent.
  - `group-hover:text-blue-600` provides a subtle hover feedback on the icon color.

  Accessibility for Icons:
  - If the icon is purely decorative and the text label clearly describes the link's purpose, use `alt=""` for `<img>` or `aria-hidden="true"` for SVG/icon font components.
  - If the icon itself conveys information not present in the text, provide a descriptive `alt` text or ensure the SVG has a `<title>` element.

  Styling the placeholder:
  The current `div` with `category.iconPlaceholder` is a simple text emoji. For a more "icon-like" placeholder, you could style it differently, e.g.,
  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 text-blue-500 text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
    {category.name.substring(0,1)} // e.g., "S" for Smartphones
  </div>
  This would give a circular background with the first letter.

  Final Polish:
  - Ensure the `container mx-auto px-4` class provides appropriate horizontal padding consistent with other sections on your homepage.
  - The `py-8 sm:py-12 md:py-16` provides vertical spacing for the section. Adjust if needed to match your site's rhythm.
  - The `bg-gray-50` gives a very subtle background to differentiate the section. You can remove it or change it to `bg-white` if preferred.
  - The `animate-fade-in-up` class is used for a subtle entrance animation, assuming it's defined in your `index.css` and you want this effect.
*/
