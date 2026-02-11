
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugProduct() {
    console.log("Checking for ANY Apple Watch products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, product_name, pre_aggregated_critic_score, total_critic_review_count')
        .ilike('product_name', '%Apple Watch%');

    if (error) {
        console.error(error);
    } else {
        console.log("Found products:");
        console.table(products);
    }

    console.log("\nSample Critic Reviews:");
    const { data: reviews, error: reviewError } = await supabase
        .from('critic_reviews')
        .select('id, product_id, publication, score')
        .limit(10);

    if (reviewError) {
        console.error(reviewError);
    } else {
        console.table(reviews);
    }
}

debugProduct();
