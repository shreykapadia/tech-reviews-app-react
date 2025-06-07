# TechScore - Product Review Aggregator

## Description

TechScore is a React-based web application designed to help users make informed decisions about tech products. It aggregates reviews, displays critic and audience scores, and provides detailed product information including specifications, image galleries, and where to buy. The application features a dynamic search, filtering capabilities, and a responsive design for a seamless experience across devices.

## Features

*   **Product Listings & Search:** Easily search for tech products.
*   **Detailed Product Pages:**
    *   Comprehensive product information (name, brand, description).
    *   Image and video gallery with zoom-on-click functionality.
    *   Color-coded Critic Scores (0-100) with informational tooltips.
    *   Color-coded Audience Ratings (0-100) with informational tooltips.
    *   AI-generated Pros & Cons summary.
    *   Product specifications.
    *   "Where to Buy" links and social sharing.
    *   Sections for critic reviews and audience reviews.
    *   Feature-specific insights.
*   **Advanced Filtering on Search Results:**
    *   Filter by category.
    *   Filter by brand.
    *   Filter by price range.
    *   Responsive filter sidebar (collapsible on mobile, fixed on desktop).
*   **Responsive Design:** Optimized for various screen sizes, including specific mobile layout adjustments (e.g., title above gallery on product pages, compact horizontal product cards on search results).
*   **SEO Friendly:** Uses `react-helmet-async` for dynamic meta tags and includes Schema.org markup for products.
*   **Interactive UI:** Smooth transitions, loading states, and user feedback.

## Tech Stack

*   **Frontend:**
    *   React (using Hooks, `useMemo`, `useEffect`, `useState`, `useRef`)
    *   React Router for navigation
    *   Tailwind CSS for styling (including `@tailwindcss/line-clamp` for text truncation)
    *   Heroicons for iconography
    *   `react-helmet-async` for SEO
    *   PropTypes for component prop validation
*   **Data:** Product data managed via JSON (e.g., `public/products.json`)
*   **Build Tool:** Vite (as per original README context)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v16.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd tech-reviews-app-react
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev # If using Vite
# or
npm start # If using Create React App (adjust if necessary)
```

This will run the app in development mode. Open the URL provided in your terminal (usually http://localhost:5173 for Vite or http://localhost:3000 for CRA) to view it in your browser. The page will reload if you make edits.

## Project Structure (Key Directories)

```
tech-reviews-app-react/
├── public/
│   ├── images/             # Static images, placeholders
│   └── products.json       # Main product data source
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ProductCard.jsx
│   │   ├── SearchResultsPage.jsx
│   │   ├── ProductPage/      # Components specific to the Product Page
│   │   │   ├── ProductImageGallery.jsx
│   │   │   ├── CriticsScoreDisplay.jsx
│   │   │   ├── AudienceRatingDisplay.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── ProductTitleBrand.jsx
│   │   │   ├── ProsConsSummary.jsx
│   │   │   ├── WhereToBuyShare.jsx
│   │   │   ├── ProductSpecifications.jsx
│   │   │   ├── CriticsReviewSection.jsx
│   │   │   ├── AudienceReviewSection.jsx
│   │   │   ├── FeatureSpecificInsights.jsx
│   │   │   ├── CompareSimilarProducts.jsx
│   │   │   └── RelatedArticles.jsx
│   │   └── ...
│   ├── utils/              # Utility functions (e.g., scoreCalculations.js)
│   ├── App.jsx             # Main application component, routing setup
│   ├── main.jsx            # Entry point of the React application (for Vite)
│   └── ...
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md
```

## Key Components & Functionality Highlights

*   **`ProductPage.jsx`**: Manages the layout and data for individual product detail views. It orchestrates various sub-components like `ProductImageGallery`, `CriticsScoreDisplay`, `AudienceRatingDisplay`, etc.
*   **`ProductCard.jsx`**: Renders a compact, horizontal summary of a product for listings (e.g., search results). Displays image, name, brand, truncated description, and color-coded scores.
*   **`SearchResultsPage.jsx`**: Handles the display of search results. Integrates a responsive filter sidebar for categories, brands, and price ranges. Filter sections are collapsible.
*   **Score Calculation & Display**:
    *   Critic scores are calculated (via `calculateCriticsScore`) and normalized.
    *   Audience ratings are parsed from strings (e.g., "4.5/5") and converted to a 0-100 scale.
    *   Both scores are color-coded (Green for high, Yellow for medium, Red for low) for quick visual assessment on product cards and product pages. Tooltips provide more context on how scores are derived.
*   **`ProductImageGallery.jsx`**: Supports multiple images and YouTube videos with thumbnail navigation. The main image zooms on click, with zoom position following the mouse.
*   **Responsive Layouts**: Product cards use a compact horizontal layout. On the product page, the title is above the gallery on mobile. The filter sidebar on search results is collapsible on mobile and fixed on desktop.

## Data Source

Product information is primarily sourced from `public/products.json`.

## Available Scripts (Vite)

*   `npm run dev` / `yarn dev`: Runs the app in development mode.
*   `npm run build` / `yarn build`: Builds the app for production.
*   `npm run lint` / `yarn lint`: Lints the codebase (if ESLint is configured).
*   `npm run preview` / `yarn preview`: Serves the production build locally.

## License

*(Specify your license, e.g., MIT License)*

---

Generated by TechScore Team
