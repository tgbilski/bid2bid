import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import SuccessCheckmark from '@/components/SuccessCheckmark'; // Added for user feedback
import { useSuccessMessage } from '@/hooks/useSuccessMessage'; // Added for user feedback

interface FavoriteVendor {
  id: string;
  vendor_name: string;
  phone_number?: string;
  project_name: string; // This comes from the joined 'projects' table
  created_at: string;
}

const MyFavorites = () => {
  const [favoriteVendors, setFavoriteVendors] = useState<FavoriteVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { message, show, showSuccess, hideSuccess } = useSuccessMessage(); // Initialize success message hook

  useEffect(() => {
    const checkAuthAndLoadFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      await loadFavoriteVendors(session.user.id); // Pass user ID for the query
    };

    checkAuthAndLoadFavorites();
  }, [navigate]);

  const loadFavoriteVendors = async (userId: string) => {
    try {
      // Fetch favorite vendors for the current user, joining with projects to get project name
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select(`
          id,
          vendor_name,
          phone_number,
          created_at,
          projects!inner (
            name
          )
        `)
        .eq('is_favorite', true)
        .eq('projects.user_id', userId) // Filter by the current user's projects
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading favorite vendors:', error);
        showSuccess("Failed to load favorite vendors."); // Show error message
      } else if (vendorData) {
        const formattedVendors = vendorData.map((vendor: any) => ({
          id: vendor.id,
          vendor_name: vendor.vendor_name,
          phone_number: vendor.phone_number,
          project_name: vendor.projects.name, // Access the name from the joined projects object
          created_at: vendor.created_at
        }));
        setFavoriteVendors(formattedVendors);
      }
    } catch (error) {
      console.error('Error loading favorite vendors:', error);
      showSuccess("An unexpected error occurred while loading favorites."); // Show generic error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleRemoveFavorite = async (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers from firing

    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_favorite: false })
        .eq('id', vendorId);

      if (error) {
        console.error('Error removing favorite:', error);
        showSuccess("Failed to remove vendor from favorites.");
      } else {
        // Update local state immediately to reflect the change
        setFavoriteVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== vendorId));
        showSuccess("Vendor removed from favorites!");
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      showSuccess("An unexpected error occurred while removing favorite.");
    }
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <BackButton />
          <div className="text-center">
            <p className="text-gray-500">Loading favorite vendors...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <SuccessCheckmark message={message} show={show} onComplete={hideSuccess} />

      <div className="max-w-md mx-auto mt-8">
        <BackButton />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">My Favorites</h1>
          <p className="text-gray-600">Your favorite vendors</p>
        </div>

        <div className="space-y-3">
          {favoriteVendors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No favorite vendors found</p>
              <Button
                onClick={() => navigate('/new-project')}
                className="bg-black text-white hover:bg-gray-800 rounded-[10px]"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            favoriteVendors.map((vendor) => (
              <div
                key={vendor.id} // Added key to the outer div for proper list rendering
                className="relative w-full max-w-[350px] mx-auto"
              >
                <div className="w-full block h-auto text-left rounded-[10px] border-2 border-gray-200 hover:border-black hover:bg-gray-50 p-4 pr-16">
                  <div>
                    <div className="font-semibold text-black mb-1">{vendor.vendor_name}</div>
                    {vendor.phone_number && (
                      <div className="text-sm text-gray-600 mb-1">{vendor.phone_number}</div>
                    )}
                    <div className="text-sm text-gray-600 mb-1">Project: {vendor.project_name}</div>
                    <div className="text-sm text-gray-500">
                      Added: {new Date(vendor.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  {vendor.phone_number && (
                    <button
                      onClick={() => handleCall(vendor.phone_number!)}
                      className="p-2 hover:bg-green-100 rounded-full transition-colors"
                      title="Call vendor"
                    >
                      <Phone size={16} className="text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleRemoveFavorite(vendor.id, e)}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    title="Remove from favorites"
                  >
                    <X size={16} className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyFavorites;
