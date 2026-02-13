// src/features/techFinder/config/questionnaireData.js
export const questionnaires = {
  Smartphones: [
    {
      id: 'smartphone-performance',
      text: 'What do you mostly use your phone for?',
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Processor
      options: [
        { label: 'Basic tasks (Messaging, Web Browsing, Social Media)', value: 'everyday_multitasking_sm' },
        { label: 'Streaming, Photos, & Light Gaming', value: 'demanding_apps_sm' },
        { label: 'Heavy Gaming & High-Performance Work', value: 'top_tier_sm' },
        { label: 'No specific preference', value: 'any' },
      ],
    },
    {
      id: 'smartphone-camera-priority',
      text: 'How much do you care about photo & video quality?',
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Camera
      options: [
        { label: 'I just need to capture clear photos occasionally', value: 'camera_basics_sm' },
        { label: 'I want good looking photos for social media', value: 'camera_everyday_sm' },
        { label: 'I want professional-quality photos and videos', value: 'camera_top_notch_sm' },
        { label: 'Not a major priority', value: 'any' },
      ],
    },
    {
      id: 'smartphone-battery-life',
      text: "How often are you okay with charging your phone?",
      type: 'radio',
      // No direct productField, complex logic on keySpecs.Battery
      options: [
        { label: 'Every night is fine', value: 'battery_light_sm' },
        { label: 'Ideally once a day, but it should last comfortably', value: 'battery_moderate_sm' },
        { label: 'I need it to last more than a day on a single charge', value: 'battery_heavy_sm' },
        { label: 'Not a major concern', value: 'any' },
      ],
    },
    {
      id: 'smartphone-storage',
      text: 'Do you store a lot of photos, videos, and apps locally?',
      type: 'radio',
      // productField: 'keySpecs.Storage'
      options: [
        { label: 'No, I use cloud storage mostly (64GB-128GB)', value: 'storage_128gb_sm' },
        { label: 'A moderate amount (256GB)', value: 'storage_256gb_sm' },
        { label: 'A lot of photos and apps (512GB)', value: 'storage_512gb_sm' },
        { label: 'Everything I can download (1TB+)', value: 'storage_1tb_plus_sm' },
        { label: 'Any amount is fine', value: 'any' },
      ],
    },
    {
      id: 'smartphone-screen-size',
      text: 'Do you prefer a smaller phone or a larger screen?',
      type: 'radio',
      // productField: 'keySpecs.Screen Size'
      options: [
        { label: 'Smaller / Easier to hold (Under 6.4 inches)', value: 'screen_compact_sm' },
        { label: 'Standard size (6.4 - 6.6 inches)', value: 'screen_medium_sm' },
        { label: 'Large screen for videos/gaming (6.7 inches and above)', value: 'screen_large_sm' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      id: 'smartphone-brand-preference',
      text: 'Do you prefer a specific brand?',
      type: 'multiselect_checkbox',
      productField: 'brand',
      options: [
        { label: 'Any Brand', value: 'any' },
        { label: 'Apple (iPhone)', value: 'Apple' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Google (Pixel)', value: 'Google' },
        { label: 'OnePlus', value: 'OnePlus' },
      ],
    },
    {
      id: 'smartphone-budget',
      text: 'What is your approximate budget?',
      type: 'radio',
      options: [
        { label: 'Under $300', value: 'budget_under300_sm' },
        { label: '$300 - $600', value: 'budget_300_600_sm' },
        { label: '$600 - $900', value: 'budget_600_900_sm' },
        { label: 'Over $900', value: 'budget_over900_sm' },
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
        { label: 'Everyday things (Browsing, Youtube, Email)', value: 'general_use' },
        { label: 'Work & Productivity (Office apps, Multitasking)', value: 'productivity_work' },
        { label: 'Gaming', value: 'gaming' },
        { label: 'Creative Work (Video editing, 3D design)', value: 'creative_work' },
        { label: 'School / College (Research, Writing, Portable)', value: 'student_use' },
        { label: 'Any of the above', value: 'any' },
      ],
    },
    {
      id: 'laptop-performance-level',
      text: 'How fast do you need it to be?',
      type: 'radio',
      // No direct productField, complex logic
      options: [
        { label: 'Just basics is fine', value: 'basic_performance' },
        { label: 'Snappy and responsive', value: 'good_performance' },
        { label: 'Very fast for heavy tasks', value: 'high_performance' },
        { label: 'Maximum possible performance', value: 'max_performance' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'laptop-storage-needs',
      text: 'How much space do you need for files?',
      type: 'radio',
      // productField: 'keySpecs.Storage'
      options: [
        { label: 'Not much (I use cloud storage)', value: 'storage_256gb_less' },
        { label: 'Standard (512GB)', value: 'storage_512gb' },
        { label: 'A lot (1TB)', value: 'storage_1tb' },
        { label: 'A huge amount (2TB+)', value: 'storage_2tb_plus' },
        { label: 'Any amount', value: 'any' },
      ],
    },
    {
      id: 'laptop-portability-form-factor',
      text: "Will you be carrying this laptop around often?",
      type: 'radio',
      // productField: 'keySpecs.Screen Size'
      options: [
        { label: 'Yes, I want something very light and portable', value: 'ultra_portable' },
        { label: 'Sometimes, so a balance of size and weight is good', value: 'balanced_portability' },
        { label: 'Rarely, I prefer a larger screen', value: 'large_screen_portability' },
        { label: 'I want a 2-in-1 / Tablet hybrid', value: '2_in_1_convertible' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'laptop-brand-preference',
      text: 'Do you have a preferred laptop brand?',
      type: 'multiselect_checkbox',
      productField: 'brand',
      options: [
        { label: 'Any Brand', value: 'any' },
        { label: 'Apple', value: 'Apple' },
        { label: 'Dell', value: 'Dell' },
        { label: 'HP', value: 'HP' },
        { label: 'Lenovo', value: 'Lenovo' },
        { label: 'Microsoft', value: 'Microsoft' },
        { label: 'Asus', value: 'Asus' },
        { label: 'Acer', value: 'Acer' },
      ],
    },
    {
      id: 'laptop-budget',
      text: 'What is your approximate budget?',
      type: 'radio',
      // productField: 'retailPrice'
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
      id: 'tv-size',
      text: 'Approx. how far will you sit from the TV? (Helps pick size)',
      type: 'radio',
      // productField: 'keySpecs.Screen Size'
      options: [
        { label: 'Close (Bedroom / Small room) - 40-55 inches', value: '55-inch' },
        { label: 'Average Living Room distance - 60-70 inches', value: '65-inch' },
        { label: 'Far away / Large Home Theater - 75+ inches', value: '75-inch' },
        { label: 'Flexible on size', value: 'any' },
      ],
    },
    {
      id: 'tv-resolution',
      text: 'What resolution do you want?',
      type: 'radio',
      // productField: 'keySpecs.Resolution'
      options: [
        { label: '4K UHD (Standard best choice)', value: '4K UHD' },
        { label: '8K UHD (Premium/Future-proof)', value: '8K UHD' },
        { label: 'Full HD (Budget)', value: 'Full HD' },
        { label: 'Any resolution', value: 'any' },
      ],
    },
    {
      id: 'tv-color-vibrancy',
      text: 'How much do vibrant colors matter to you?',
      type: 'radio',
      // productField: 'keySpecs.displayPanelType'
      options: [
        { label: 'Standard is fine', value: 'standard_colors' }, //"LED/LCD"
        { label: 'I want rich, punchy colors (QLED/OLED)', value: 'rich_colors' }, //"QLED/OLED"
        { label: 'I want the absolute best color possible', value: 'most_vibrant_colors' }, //"OLED/QD-OLED"
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-contrast-level',
      text: 'How important are deep blacks (for movie nights)?',
      type: 'radio',
      // productField: 'keySpecs.displayBacklighting'
      options: [
        { label: 'Good is enough', value: 'good_contrast' },
        { label: 'Very important', value: 'excellent_contrast' },
        { label: 'Crucial (Perfect blacks)', value: 'perfect_contrast' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-viewing-environment',
      text: 'Where will you mostly watch TV?',
      type: 'radio',
      // Custom logic
      options: [
        { label: 'Bright room (Lots of windows/lights)', value: 'bright_room' },
        { label: 'Dark room (Home theater style)', value: 'dark_room' },
        { label: 'Mixed / Average lighting', value: 'any' },
      ],
    },
    {
      id: 'tv-motion-smoothness',
      text: 'Do you watch a lot of fast sports or play video games?',
      type: 'radio',
      // productField: 'keySpecs.refreshRate'
      options: [
        { label: 'Yes, smooth motion is key (120Hz+)', value: 'very_important_motion' },
        { label: 'No, standard TV watching (60Hz)', value: 'not_important_motion' },
        { label: 'No strong preference', value: 'any' },
      ],
    },
    {
      id: 'tv-brand-preference',
      text: 'Preferred TV Brand?',
      type: 'multiselect_checkbox',
      productField: 'brand',
      options: [
        { label: 'Any Brand', value: 'any' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'LG', value: 'LG' },
        { label: 'Sony', value: 'Sony' },
        { label: 'TCL', value: 'TCL' },
        { label: 'Hisense', value: 'Hisense' }
      ],
    },
    {
      id: 'tv-budget',
      text: 'What is your approximate budget?',
      type: 'radio',
      options: [
        { label: 'Under $500', value: 'under500' },
        { label: '$500 - $1000', value: '500-1000' },
        { label: '$1000 - $2000', value: '1000-2000' },
        { label: 'Over $2000', value: 'over2000' },
        { label: 'Any Budget', value: 'any' },
      ],
    },
  ],
  Smartwatches: [
    {
      id: 'smartwatch-compatibility',
      text: 'What type of phone do you have?',
      filterLabel: 'Phone Compatibility',
      type: 'radio',
      options: [
        { label: 'iPhone', value: 'iphone' },
        { label: 'Android (Samsung, Google Pixel, etc.)', value: 'android' },
      ],
    },
    {
      id: 'smartwatch-primary-use',
      text: 'What will you use the watch for most?',
      filterLabel: 'Primary Use',
      type: 'radio',
      options: [
        { label: 'Exercise & health monitoring (steps, heart rate, workouts)', value: 'fitness_health' },
        { label: 'Seeing texts, calls, and app alerts on my wrist', value: 'notifications' },
        { label: 'Hiking, swimming, or outdoor adventure', value: 'adventure' },
        { label: 'A little bit of everything', value: 'any' },
      ],
    },
    {
      id: 'smartwatch-health',
      text: 'Are advanced health features important to you?',
      filterLabel: 'Health Features',
      type: 'radio',
      options: [
        { label: 'Yes — I want heart monitoring, blood oxygen, ECG, etc.', value: 'advanced_health' },
        { label: 'Just basic step counting and heart rate is fine', value: 'basic_health' },
        { label: 'Not really important', value: 'any' },
      ],
    },
    {
      id: 'smartwatch-battery-life',
      text: 'How often are you okay with charging the watch?',
      filterLabel: 'Battery Life',
      type: 'radio',
      options: [
        { label: 'Every night is fine — I\'ll charge it while I sleep', value: 'daily_charge' },
        { label: 'Every couple of days would be ideal', value: 'multi_day' },
        { label: 'I want it to last as long as possible', value: 'long_battery' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      id: 'smartwatch-size',
      text: 'What size watch would feel most comfortable on your wrist?',
      filterLabel: 'Watch Size',
      type: 'radio',
      options: [
        { label: 'Smaller & lightweight — I have a smaller wrist', value: 'small_size' },
        { label: 'Medium — a nice balance of screen and comfort', value: 'medium_size' },
        { label: 'Large & bold — I want the biggest screen possible', value: 'large_size' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      id: 'smartwatch-budget',
      text: 'How much are you looking to spend?',
      filterLabel: 'Budget',
      type: 'radio',
      options: [
        { label: 'Under $300 — keep it affordable', value: 'under300' },
        { label: '$300 – $500 — a solid mid-range option', value: '300-500' },
        { label: '$500 – $800 — I want premium features', value: '500-800' },
        { label: 'Over $800 — I want the best of the best', value: 'over800' },
        { label: 'Show me everything', value: 'any' },
      ],
    },
  ],
  // ... other categories
};