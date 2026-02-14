import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSearch() {
    const term = 'computer';
    const relevantCategories = ['Laptops'];

    console.log('Testing search for:', term);

    const { data: catData, error: catError } = await supabase
        .from('products')
        .select('*, categories!inner(name)')
        .in('categories.name', relevantCategories)
        .limit(1);

    if (catError) {
        console.error('Category error:', catError);
    } else {
        console.log('Sample result:', JSON.stringify(catData[0], null, 2));
    }
}

testSearch();
