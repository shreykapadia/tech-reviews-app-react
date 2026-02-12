// src/features/compare/ComparePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

// Helper to get query params
function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

// Tooltip descriptions
const TOOLTIP_DESCRIPTIONS = {
    'Scores': "Critics Score is an average from top tech reviewers. Audience Score is based on verified user ratings.",
    'Screen Size': "Diagonal measurement of the display in inches. Larger screens are better for media, smaller for portability.",
    'Processor': "The brain of the device. Newer and higher-tier processors (e.g., A18 Pro, Snapdragon 8 Elite) handle gaming and multitasking better.",
    'RAM': "Random Access Memory. Higher RAM (measured in GB) allows more apps to stay open in the background without reloading.",
    'Storage': "Internal space for apps, photos, and files. 128GB is standard, but 256GB+ is recommended for 4K video recording.",
    'Battery': "Measured in mAh. Generally, a higher number means longer battery life, though software optimization plays a huge role.",
    'Battery Capacity': "Measured in mAh. Generally, a higher number means longer battery life, though software optimization plays a huge role.",
    'Rated Battery Life': "Estimated hours of usage (video playback or mixed use) provided by the manufacturer.",
    'Camera': "Megapixel (MP) count gives resolution, but lens quality and software processing are more important for photo quality.",
    'Camera Specs (MP)': "Detailed breakdown of the camera sensors (Main, Ultra-wide, Telephoto). Higher MP captures more detail.",
    'OS': "The operating system (iOS or Android). Affects app ecosystem, customization, and interface feel.",
    'Resolution': "Pixel density of the screen. Higher resolution (e.g., 1440p, 4K) looks sharper than 1080p.",
    'Dxo': "DxOMark score is an independent benchmark for camera and audio quality. Higher scores indicate professional-grade performance.",
    'Retail Price': "The official launch price. Actual market price may vary based on deals and discounts."
};

const PortalTooltip = ({ activeTooltip }) => {
    if (!activeTooltip) return null;
    const { text, rect } = activeTooltip;

    // Align left of tooltip with left of icon (rect.left)
    // Position above the icon (rect.top - 8px gap)
    // Arrow is centered relative to the icon:
    // Icon width (w-4) is 16px. Center is 8px.
    // Arrow width (w-2) is 8px. Center is 4px.
    // So Arrow Left = 8px - 4px = 4px.

    return createPortal(
        <div
            className="fixed z-[9999] w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg pointer-events-none text-center"
            style={{
                left: rect.left,
                top: rect.top - 8,
                transform: 'translateY(-100%)',
                zIndex: 9999
            }}
        >
            {text}
            <div className="absolute left-1 -bottom-1 transform rotate-45 w-2 h-2 bg-gray-800"></div>
        </div>,
        document.body
    );
};

const ComparePage = ({ allProducts, calculateCriticsScore }) => {
    const query = useQuery();
    const navigate = useNavigate();
    const [comparingProducts, setComparingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTooltip, setActiveTooltip] = useState(null);

    // Close tooltip on scroll
    useEffect(() => {
        const handleScroll = () => setActiveTooltip(null);
        window.addEventListener('scroll', handleScroll, true); // true for capture to catch all scrolls
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    // Get product names from URL
    const productNames = useMemo(() => {
        return query.getAll('product[]');
    }, [query]);

    // key specs mapping for cleaner display
    const keySpecsMapping = {
        screenSize: 'Screen Size',
        processor: 'Processor',
        ram: 'RAM',
        storage: 'Storage',
        battery: 'Battery',
        camera: 'Camera',
        os: 'OS',
        resolution: 'Resolution',
        cameraSpecs_MP: 'Camera Specs (MP)',
        'Camera Specs_ MP': 'Camera Specs (MP)',
        dxo: 'Dxo',
        operatingSystem: 'OS'
    };

    useEffect(() => {
        if (allProducts.length > 0) {
            const selected = allProducts.filter(p => productNames.includes(p.productName));
            setComparingProducts(selected);
            setLoading(false);
        }
    }, [allProducts, productNames]);

    const handleRemoveProduct = (productName) => {
        const newProductNames = productNames.filter(name => name !== productName);
        if (newProductNames.length > 0) {
            const queryParams = newProductNames.map(name => `product[]=${encodeURIComponent(name)}`).join('&');
            navigate(`/compare?${queryParams}`);
        } else {
            navigate('/'); // Go home if no products left
        }
    };

    const handleMouseEnter = (e, text) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setActiveTooltip({ text, rect });
    };

    const handleMouseLeave = () => {
        setActiveTooltip(null);
    };

    // Helper to find tooltip text case-insensitively
    const getTooltipText = (key, label) => {
        // 1. Try exact match on label
        if (TOOLTIP_DESCRIPTIONS[label]) return TOOLTIP_DESCRIPTIONS[label];

        // 2. Try exact match on key
        if (TOOLTIP_DESCRIPTIONS[key]) return TOOLTIP_DESCRIPTIONS[key];

        // 3. Try case-insensitive match on keys
        const lowerLabel = label.toLowerCase();
        const lowerKey = key.toLowerCase();

        const foundKey = Object.keys(TOOLTIP_DESCRIPTIONS).find(k =>
            k.toLowerCase() === lowerLabel || k.toLowerCase() === lowerKey
        );

        return foundKey ? TOOLTIP_DESCRIPTIONS[foundKey] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (comparingProducts.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">No products selected for comparison</h2>
                <Link to="/" className="text-brand-primary hover:underline">
                    Go back to Home
                </Link>
            </div>
        );
    }

    // Extract all unique spec keys from the selected products
    const allSpecKeys = Array.from(new Set(comparingProducts.flatMap(p =>
        p.keySpecs ? Object.keys(p.keySpecs) : []
    )));

    // Sort specs or prioritize common ones if needed, for now just use the order they appear
    // We can prioritize specific keys if we want a specific order
    const orderedSpecKeys = Object.keys(keySpecsMapping).filter(k => allSpecKeys.includes(k))
        .concat(allSpecKeys.filter(k => !Object.keys(keySpecsMapping).includes(k)));


    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-brand-primary transition-colors">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
                    <div className="w-16"></div> {/* Spacer for centering if needed, or actions */}
                </div>

                <div className="overflow-x-auto pb-6">
                    <div
                        className="min-w-max grid bg-white shadow-xl rounded-xl border border-gray-100"
                        style={{ gridTemplateColumns: `200px repeat(${comparingProducts.length}, minmax(280px, 1fr))` }}
                    >

                        {/* Header Row: Product Info */}
                        <div className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-500 flex items-center sticky left-0 z-10 col-start-1">
                            Product
                        </div>
                        {comparingProducts.map(product => (
                            <div key={product.productName} className="p-6 border-b border-gray-100 flex flex-col items-center text-center relative hover:bg-gray-50 transition-colors group">
                                <button
                                    onClick={() => handleRemoveProduct(product.productName)}
                                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    title="Remove from comparison"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                                <Link to={`/product/${encodeURIComponent(product.productName)}`} className="block mb-4">
                                    <img
                                        src={product.imageURL || '/images/placeholder-image.webp'}
                                        alt={product.productName}
                                        className="h-40 object-contain hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>
                                <Link to={`/product/${encodeURIComponent(product.productName)}`}>
                                    <h3 className="font-bold text-lg text-brand-primary hover:underline mb-1">
                                        {product.productName}
                                    </h3>
                                </Link>
                                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                                {/* Add price here if available in data */}
                            </div>
                        ))}

                        {/* Info Row: Scores */}
                        <div className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10 col-start-1 flex items-center gap-1">
                            Scores
                            <div
                                className="cursor-help"
                                onMouseEnter={(e) => handleMouseEnter(e, TOOLTIP_DESCRIPTIONS['Scores'])}
                                onMouseLeave={handleMouseLeave}
                            >
                                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {comparingProducts.map(product => {
                            // Logic partially duplicated from CriticsScoreDisplay/AudienceRatingDisplay
                            // Ideally we'd reuse small components or utility functions
                            const cScore = product.preAggregatedCriticScore;
                            const aScore = product.preAggregatedAudienceScore;

                            // Color logic
                            const getRefColor = (s) => {
                                if (!s && s !== 0) return 'text-gray-400';
                                if (s >= 85) return 'text-green-600';
                                if (s >= 70) return 'text-yellow-600';
                                return 'text-red-600';
                            };

                            return (
                                <div key={product.productName} className="p-4 border-b border-gray-100 flex justify-around items-center">
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${getRefColor(cScore)}`}>
                                            {cScore || '--'}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Critics</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${getRefColor(aScore)}`}>
                                            {aScore || '--'}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Audience</div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Specs Rows */}
                        {orderedSpecKeys.map(key => {
                            const label = keySpecsMapping[key] || key.replace(/([A-Z])/g, ' $1').trim();
                            const tooltipText = getTooltipText(key, label);

                            return (
                                <React.Fragment key={key}>
                                    <div className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-700 capitalize sticky left-0 z-10 group-hover/row:bg-blue-50 transition-colors col-start-1 flex items-center gap-1">
                                        {label}
                                        {tooltipText && (
                                            <div
                                                className="cursor-help"
                                                onMouseEnter={(e) => handleMouseEnter(e, tooltipText)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {comparingProducts.map(product => {
                                        let value = product.keySpecs && product.keySpecs[key];

                                        // Handle arrays (e.g. storage options)
                                        if (Array.isArray(value)) {
                                            value = value.join(', ');
                                        } else if (typeof value === 'boolean') {
                                            value = value ? 'Yes' : 'No';
                                        } else if (!value && value !== 0) {
                                            value = '--';
                                        }

                                        return (
                                            <div key={`${product.productName}-${key}`} className="p-4 border-b border-gray-100 text-center text-gray-600 hover:bg-blue-50 transition-colors">
                                                {value}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        {/* Pros Row */}
                        <div className="p-4 border-b border-r border-gray-100 bg-gray-50 font-semibold text-gray-700 sticky left-0 align-top z-10 col-start-1">
                            Top Pros
                        </div>
                        {comparingProducts.map(product => (
                            <div key={`${product.productName}-pros`} className="p-4 border-b border-gray-100 h-full hover:bg-blue-50 transition-colors">
                                {product.aiProsCons && product.aiProsCons.pros && product.aiProsCons.pros.length > 0 ? (
                                    <ul className="text-sm text-left space-y-1">
                                        {product.aiProsCons.pros.slice(0, 3).map((pro, idx) => (
                                            <li key={idx} className="flex items-start text-green-700">
                                                <span className="mr-2">•</span> {pro}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400">--</span>
                                )}
                            </div>
                        ))}

                        {/* Cons Row */}
                        <div className="p-4 border-r border-gray-100 bg-gray-50 font-semibold text-gray-700 sticky left-0 align-top z-10 col-start-1">
                            Top Cons
                        </div>
                        {comparingProducts.map(product => (
                            <div key={`${product.productName}-cons`} className="p-4 border-gray-100 hover:bg-blue-50 transition-colors">
                                {product.aiProsCons && product.aiProsCons.cons && product.aiProsCons.cons.length > 0 ? (
                                    <ul className="text-sm text-left space-y-1">
                                        {product.aiProsCons.cons.slice(0, 3).map((con, idx) => (
                                            <li key={idx} className="flex items-start text-red-700">
                                                <span className="mr-2">•</span> {con}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400">--</span>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            </div>
            <PortalTooltip activeTooltip={activeTooltip} />
        </div>
    );
};

ComparePage.propTypes = {
    allProducts: PropTypes.array.isRequired,
    calculateCriticsScore: PropTypes.func.isRequired,
};

export default ComparePage;
