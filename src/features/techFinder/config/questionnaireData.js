// src/features/techFinder/config/questionnaireData.js
export const questionnaires = {
  Smartphones: [
    {
      id: 'smartphone-performance',
      text: 'How important is raw speed and performance?',
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Processor
      options: [
        { label: 'Everyday Multitasking (smooth general use, some gaming)', value: 'everyday_multitasking_sm' },
        { label: 'Demanding Apps/Gaming (heavy gaming, video editing)', value: 'demanding_apps_sm' },
        { label: 'Absolute Top-Tier (future proofing, maximum power)', value: 'top_tier_sm' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      id: 'smartphone-camera-priority',
      text: 'What kind of photos and videos do you primarily want to capture?',
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Camera, productName
      options: [
        { label: 'Just the basics (QR codes, occasional snaps)', value: 'camera_basics_sm' },
        { label: 'Good quality for everyday memories', value: 'camera_everyday_sm' },
        { label: 'Top-notch photography/videography (pro-level features)', value: 'camera_top_notch_sm' },
        { label: 'Not a major concern', value: 'any' },
      ],
    },
    {
      id: 'smartphone-battery-life',
      text: "How long do you need your smartphone's battery to last?",
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Battery or keySpecs.ratedBatteryLife
      options: [
        { label: 'Light Use (charge every night is fine, ~10-14 hours)', value: 'battery_light_sm' },
        { label: 'Moderate Use (get through a full day, ~15-20 hours)', value: 'battery_moderate_sm' },
        { label: 'Heavy Use (power user, need it to last, 20+ hours)', value: 'battery_heavy_sm' },
        { label: 'Not a major concern', value: 'any' },
      ],
    },
    {
      id: 'smartphone-storage',
      text: 'How much internal storage do you need?',
      type: 'radio',
      // productField: 'keySpecs.Storage' (custom parsing, use existing parseStorage)
      options: [
        { label: 'Basic (64GB-128GB - for light users, cloud storage)', value: 'storage_128gb_sm' },
        { label: 'Standard (256GB - good for most users)', value: 'storage_256gb_sm' },
        { label: 'Large (512GB - for many apps, photos, videos)', value: 'storage_512gb_sm' },
        { label: 'Very Large (1TB+ - for power users, extensive media)', value: 'storage_1tb_plus_sm' },
        { label: 'Any amount is fine', value: 'any' },
      ],
    },
    {
      id: 'smartphone-screen-size',
      text: 'What is your preferred screen size for the smartphone?',
      type: 'radio',
      // productField: 'keySpecs.Screen Size' (custom parsing, use existing parseScreenSize)
      options: [
        { label: 'Compact (Under 6.0 inches - easier one-handed use)', value: 'screen_compact_sm' },
        { label: 'Medium (6.0 to 6.4 inches - balanced size)', value: 'screen_medium_sm' },
        { label: 'Large (6.5 inches and above - immersive viewing)', value: 'screen_large_sm' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'smartphone-brand-preference',
      text: 'Do you have a preferred smartphone brand?',
      type: 'multiselect_checkbox',
      productField: 'brand',
      options: [
        { label: 'Any Brand', value: 'any' },
        { label: 'Apple', value: 'Apple' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Google', value: 'Google' },
        { label: 'OnePlus', value: 'OnePlus' },
      ],
    },
    {
      id: 'smartphone-budget',
      text: 'What is your approximate budget for a new smartphone?',
      type: 'radio',
      options: [
        { label: 'Under $300 (Budget-friendly)', value: 'budget_under300_sm' },
        { label: '$300 - $600 (Mid-range)', value: 'budget_300_600_sm' },
        { label: '$600 - $900 (Upper Mid-range / Older Flagship)', value: 'budget_600_900_sm' },
        { label: 'Over $900 (Premium / Latest Flagship)', value: 'budget_over900_sm' },
        { label: 'Any Budget', value: 'any' },
      ],
    },
  ],
  Laptops: [
    {
      id: 'laptop-primary-use',
      text: 'What will you primarily use this laptop for?',
      type: 'radio',
      // No direct productField, complex logic
      options: [
        { label: 'General Use (web, email, office)', value: 'general_use' },
        { label: 'Productivity/Work (demanding office apps, multitasking)', value: 'productivity_work' },
        { label: 'Gaming', value: 'gaming' },
        { label: 'Creative Work (design, video editing)', value: 'creative_work' },
        { label: 'Student Use (notes, research, portability)', value: 'student_use' },
        { label: 'Any of the above / Not sure', value: 'any' },
      ],
    },
    {
      id: 'laptop-performance-level',
      text: 'How powerful do you need your laptop to be for smooth performance?',
      type: 'radio',
      // No direct productField, complex logic
      options: [
        { label: 'Basic (web browsing, email, light document editing)', value: 'basic_performance' },
        { label: 'Good (smooth multitasking, office applications, some photo editing)', value: 'good_performance' },
        { label: 'High (demanding applications, moderate gaming, video editing)', value: 'high_performance' },
        { label: 'Max Performance (heavy gaming, professional creative work, complex tasks)', value: 'max_performance' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'laptop-storage-needs',
      text: 'How much space do you need for files, photos, and software?',
      type: 'radio',
      // productField: 'keySpecs.Storage' (custom parsing)
      options: [
        { label: 'Light (256GB or less - for cloud users or minimal local storage)', value: 'storage_256gb_less' },
        { label: 'Medium (512GB - good for most users)', value: 'storage_512gb' },
        { label: 'Large (1TB - for large media files, many apps)', value: 'storage_1tb' },
        { label: 'Very Large (2TB+ - for professionals, extensive libraries)', value: 'storage_2tb_plus' },
        { label: 'Any amount is fine', value: 'any' },
      ],
    },
    {
      id: 'laptop-portability-form-factor',
      text: "What's most important for portability and versatility?",
      type: 'radio',
      // productField: 'keySpecs.Screen Size', 'keySpecs.Design', etc. (custom parsing)
      options: [
        { label: 'Ultra-Portable (Thin & light, typically <14" screen)', value: 'ultra_portable' },
        { label: 'Balanced (Good mix of screen size and portability, 14"-15" screen)', value: 'balanced_portability' },
        { label: 'Large Screen (More immersive, desktop replacement style, >15" screen)', value: 'large_screen_portability' },
        { label: '2-in-1 / Tablet Mode (Versatile, often with touchscreen)', value: '2_in_1_convertible' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'laptop-brand-preference',
      text: 'Do you have a preferred laptop brand?',
      type: 'multiselect_checkbox',
      productField: 'brand',
      options: [ // These could be dynamically populated from available laptop brands
        { label: 'Any Brand', value: 'any' },
        { label: 'Apple', value: 'Apple' },
        { label: 'Dell', value: 'Dell' },
        { label: 'HP', value: 'HP' },
        { label: 'Lenovo', value: 'Lenovo' },
        { label: 'Microsoft', value: 'Microsoft' },
        { label: 'Asus', value: 'Asus' },
        { label: 'Acer', value: 'Acer' },
        // Add other common brands
      ],
    },
    {
      id: 'laptop-budget',
      text: 'What is your approximate budget for a new laptop?',
      type: 'radio',
      // productField: 'retailPrice' (custom parsing)
      options: [
        { label: 'Under $500', value: 'under500' },
        { label: '$500 - $800', value: '500-800' },
        { label: '$800 - $1200', value: '800-1200' },
        { label: '$1200 - $1800', value: '1200-1800' },
        { label: 'Over $1800', value: 'over1800' },
        { label: 'Any Budget', value: 'any' },
      ],
    },
  ],
  TVs: [
    {
      id: 'tv-size', // Existing
      text: 'What screen size are you considering for your TV?',
      type: 'radio',
      // productField: 'keySpecs.Screen Size', // Custom logic in useEffect
      options: [
        { label: 'Medium (40-55 inch)', value: '55-inch' }, // Value might need to be more flexible for matching
        { label: 'Large (60-70 inch)', value: '65-inch' },
        { label: 'Extra Large (75+ inch)', value: '75-inch' },
        { label: 'Flexible on size', value: 'any' },
      ],
    },
    {
      id: 'tv-resolution', // Existing
      text: 'Which display resolution are you looking for?',
      type: 'radio',
      // productField: 'keySpecs.Resolution', // Custom logic in useEffect
      options: [
        { label: '4K UHD (Great for most content)', value: '4K UHD' },
        { label: '8K UHD (Future-proof, premium)', value: '8K UHD' },
        { label: 'HD/Full HD (Budget options)', value: 'Full HD' },
        { label: 'Any resolution', value: 'any' },
      ],
    },
    {
      id: 'tv-color-vibrancy',
      text: 'How colorful and vibrant do you want your TV\'s display to be?',
      type: 'radio',
      // productField: 'keySpecs.displayPanelType', // Custom logic
      options: [
        { label: 'Standard Colors', value: 'standard_colors' }, // "LED/LCD"
        { label: 'Rich Colors', value: 'rich_colors' }, // "QLED" or "OLED"
        { label: 'Most Vibrant Colors', value: 'most_vibrant_colors' }, // "OLED (QD-OLED)"
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-contrast-level',
      text: 'How important are deep blacks and bright whites for dynamic contrast?',
      type: 'radio',
      // productField: 'keySpecs.displayBacklighting', // Custom logic
      options: [
        { label: 'Good Contrast', value: 'good_contrast' }, // "Direct Lit" or "Edge Lit"
        { label: 'Excellent Contrast', value: 'excellent_contrast' }, // "Full Array Local Dimming"
        { label: 'Perfect Contrast', value: 'perfect_contrast' }, // "OLED" or "Mini-LED"
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-viewing-environment',
      text: 'Where will you be watching your TV mostly?',
      type: 'radio',
      // Custom logic using peakBrightness_nits, displayPanelType, displayBacklighting
      options: [
        { label: 'Bright Room (e.g., living room with windows)', value: 'bright_room' },
        { label: 'Dim/Dark Room (e.g., dedicated home theater)', value: 'dark_room' },
        { label: 'Mixed Lighting Conditions', value: 'any' },
      ],
    },
    {
      id: 'tv-motion-smoothness',
      text: 'How important is smooth motion for sports or gaming?',
      type: 'radio',
      // productField: 'keySpecs.refreshRate', // Custom logic
      options: [
        { label: 'Very Important (120Hz+ for ultra-smoothness)', value: 'very_important_motion' }, // >= 120Hz
        { label: 'Not Important (Standard 60Hz or less is fine)', value: 'not_important_motion' }, // <= 60Hz
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-brand-preference',
      text: 'Do you have a preferred TV brand?',
      type: 'multiselect_checkbox', // Or 'select' if many brands
      productField: 'brand', // Can use generic logic if options are direct brand names
      options: [ // These should ideally be populated dynamically from available TV brands
        { label: 'Any Brand', value: 'any' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'LG', value: 'LG' },
        { label: 'Sony', value: 'Sony' },
        // Add other common TV brands
      ],
    },
    {
      id: 'tv-budget',
      text: 'What is your approximate budget for a new TV?',
      type: 'radio', // Simplified to radio for now, could be range input
      // productField: 'retailPrice', // Custom logic
      options: [
        { label: 'Under $500', value: 'under500' },
        { label: '$500 - $1000', value: '500-1000' },
        { label: '$1000 - $2000', value: '1000-2000' },
        { label: 'Over $2000', value: 'over2000' },
        { label: 'Any Budget', value: 'any' },
      ],
    },
  ],
  // ... other categories
};