import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgtsbxweivwwfytqllbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHNieHdlaXZ3d2Z5dHFsbGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk5MDUsImV4cCI6MjA2NDk3NTkwNX0.Ql-_jaBe9MnRLspUfNPg7NLwU19m-Lag7yb4LKh7xrY';
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
