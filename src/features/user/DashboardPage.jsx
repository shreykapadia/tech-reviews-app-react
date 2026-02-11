// src/features/user/DashboardPage.jsx
import { processProduct } from "../../services/productService";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import ProductCard from '../../components/ProductCard';

function DashboardPage({ calculateCriticsScore }) {
  const { user, userProfile, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [favoritedProducts, setFavoritedProducts] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (authLoading) return;
      if (!user) {
        setFavoritedProducts([]);
        setFavoritesLoading(false);
        return;
      }

      setFavoritesLoading(true);
      setFavoritesError(null);

      try {
        const { data: favoriteEntries, error: fetchFavoritesError } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id);

        if (fetchFavoritesError) {
          console.error('Error fetching user favorites:', fetchFavoritesError);
          setFavoritesError(fetchFavoritesError.message);
          setFavoritedProducts([]);
          return;
        }

        if (favoriteEntries && favoriteEntries.length > 0) {
          const productIds = favoriteEntries.map(entry => entry.product_id);
          const { data: productsData, error: fetchProductsError } = await supabase
            .from('products')
            .select(`
              *,
              categories ( name ), 
              critic_reviews ( * )
            `)
            .in('id', productIds);

          if (fetchProductsError) {
            console.error('Error fetching product details for favorites:', fetchProductsError);
            setFavoritesError(fetchProductsError.message);
            setFavoritedProducts([]);
          } else {
            setFavoritedProducts((productsData || []).map(processProduct));
          }
        } else {
          setFavoritedProducts([]);
        }
      } catch (err) {
        console.error('Unexpected error in fetchUserFavorites:', err);
        setFavoritesError('An unexpected error occurred while fetching favorites.');
        setFavoritedProducts([]);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchUserFavorites();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-lg text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 md:pt-28">
      <div className="mx-auto bg-white/92 backdrop-blur-sm shadow-[0_24px_50px_rgba(8,38,67,0.14)] rounded-2xl border border-white/80 p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Welcome, <span className="text-brand-primary break-all">{userProfile?.username || user?.email || 'User'}</span>!
        </h1>
        <p className="text-gray-700 mb-4">
          This is your personal dashboard. You can manage your profile and settings here.
        </p>
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Your Account</h2>
            <p className="text-gray-600 mt-1">More profile features coming soon!</p>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Your Favorited Products</h2>
            {favoritesLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
                <p className="ml-3 text-gray-600">Loading your favorites...</p>
              </div>
            )}
            {favoritesError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{favoritesError}</span>
              </div>
            )}
            {!favoritesLoading && !favoritesError && favoritedProducts.length === 0 && (
              <p className="text-gray-600 text-center py-10">You haven't favorited any products yet. Start exploring!</p>
            )}
            {!favoritesLoading && !favoritesError && favoritedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    calculateCriticsScore={calculateCriticsScore}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-150 ease-in-out shadow-md shadow-brand-primary/25"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
