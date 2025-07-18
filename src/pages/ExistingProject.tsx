import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import EmailSharingInput from '@/components/EmailSharingInput';
import VendorCard, { VendorData } from '@/components/VendorCard';
import SuccessCheckmark from '@/components/SuccessCheckmark';
import { useSuccessMessage } from '@/hooks/useSuccessMessage';
import { toast } from '@/hooks/use-toast'; // Import toast for notifications

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  // IMPORTANT: Ensure your project data also loads the user_id or owner_id from the DB
  // This is critical for RLS checks. Adjust the type based on your actual column name.
  user_id: string; // Or owner_id: string; if that's what your DB uses
}

const ExistingProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { message, show, showSuccess, hideSuccess } = useSuccessMessage();

  useEffect(() => {
    const checkAuthAndLoadProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found during initial load, navigating to login.");
        navigate('/login');
        return;
      }
      await checkSubscription();
      await loadProject();
    };

    checkAuthAndLoadProject();
  }, [projectId, navigate]); // Added navigate to dependency array

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data) {
        setIsSubscribed(data.subscribed || false);
      } else if (error) {
        console.error('Error from check-subscription function:', error);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Subscription Check Failed",
        description: "Could not verify subscription status.",
        variant: "destructive",
      });
    }
  };

  const loadProject = async () => {
    try {
      // Ensure 'user_id' (or 'owner_id') is selected here
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*, user_id') // Make sure 'user_id' is explicitly selected
        // Or if your column is named owner_id: .select('*, owner_id')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        console.error('Error loading project data:', projectError);
        showSuccess("The requested project could not be found or you don't have access.");
        navigate('/my-projects');
        return;
      }

      setProject(projectData);
      setProjectName(projectData.name);

      const { data: sharesData, error: sharesError } = await supabase
        .from('project_shares')
        .select('shared_with_email')
        .eq('project_id', projectId);

      if (sharesError) {
        console.error('Error loading shares:', sharesError);
        toast({
          title: "Error",
          description: "Failed to load project shares.",
          variant: "destructive",
        });
      } else if (sharesData) {
        setSharedEmails(sharesData.map(share => share.shared_with_email));
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*') // Select all columns, including is_favorite, and now phone_number
        .eq('project_id', projectId)
        .order('created_at');

      if (vendorError) {
        console.error('Error loading vendors:', vendorError);
        toast({
          title: "Error",
          description: "Failed to load vendor data.",
          variant: "destructive",
        });
      } else if (vendorData && vendorData.length > 0) {
        const formattedVendors = vendorData.map(vendor => ({
          id: vendor.id,
          vendorName: vendor.vendor_name,
          phoneNumber: vendor.phone_number || '', // Include phone_number
          startDate: vendor.start_date || '',
          jobDuration: vendor.job_duration || '',
          totalCost: vendor.total_cost ? `$${vendor.total_cost.toFixed(2)}` : '',
          isFavorite: vendor.is_favorite || false
        }));
        setVendors(formattedVendors);
      } else {
        // If no vendors, add an initial empty one
        addVendor();
      }
    } catch (error) {
      console.error('Caught unexpected error in loadProject:', error);
      showSuccess("Failed to load project"); // Using useSuccessMessage for top-level messages
    } finally {
      setIsLoading(false);
    }
  };

  const addVendor = () => {
    if (vendors.length >= 10) {
      showSuccess("You can only add up to 10 vendor cards.");
      return;
    }

    const newVendor: VendorData = {
      id: `new-${Date.now()}`, // Use a temporary ID for new vendors
      vendorName: '',
      phoneNumber: '',
      startDate: '',
      jobDuration: '',
      totalCost: '',
      isFavorite: false
    };
    setVendors([...vendors, newVendor]);
  };

  const updateVendor = (id: string, field: keyof VendorData, value: string | boolean) => {
    setVendors(vendors.map(vendor =>
      vendor.id === id ? { ...vendor, [field]: value } : vendor
    ));
  };

  const handleFavorite = async (id: string) => {
    const vendorToUpdate = vendors.find(vendor => vendor.id === id);
    if (!vendorToUpdate) return;

    const newFavoriteStatus = !vendorToUpdate.isFavorite;

    // Optimistically update UI
    setVendors(prevVendors => prevVendors.map(vendor =>
      vendor.id === id ? { ...vendor, isFavorite: newFavoriteStatus } : vendor
    ));

    // Persist to database
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found during handleFavorite, navigating to login.");
        navigate('/login');
        return;
      }

      // If it's a new vendor that hasn't been saved yet,
      // its favorite status will be saved when the project is saved.
      if (vendorToUpdate.id.startsWith('new-')) {
        toast({
          title: "Saving Favorite Status",
          description: "Vendor will be favorited upon project save.",
        });
        return;
      }

      const { error } = await supabase
        .from('vendors')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating favorite status in DB:', error);
        toast({
          title: "Error",
          description: "Failed to update favorite status in database.",
          variant: "destructive",
        });
        // Revert UI if DB update fails
        setVendors(prevVendors => prevVendors.map(vendor =>
          vendor.id === id ? { ...vendor, isFavorite: !newFavoriteStatus } : vendor
        ));
      } else {
        toast({
          title: "Favorite Status Updated",
          description: newFavoriteStatus ? "Vendor marked as favorite." : "Vendor removed from favorites.",
        });
      }
    } catch (error) {
      console.error('Caught unexpected error handling favorite:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating favorite status.",
        variant: "destructive",
      });
      // Revert UI if error occurs
      setVendors(prevVendors => prevVendors.map(vendor =>
        vendor.id === id ? { ...vendor, isFavorite: !newFavoriteStatus } : vendor
      ));
    }
  };

  const deleteVendor = async (id: string) => {
    if (vendors.length <= 1) {
      showSuccess("You must have at least one vendor card.");
      return;
    }

    // Optimistically remove from UI
    setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));

    // If it's an existing vendor (not a new one with temp ID), delete from DB
    if (!id.startsWith('new-')) {
      try {
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting vendor from DB:', error);
          toast({
            title: "Error",
            description: "Failed to delete vendor from database.",
            variant: "destructive",
          });
          // For a real app, you might want to re-add the vendor to state here if DB deletion fails
        } else {
          toast({
            title: "Vendor Deleted",
            description: "Vendor removed successfully.",
          });
        }
      } catch (error) {
        console.error('Caught unexpected error deleting vendor:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting vendor.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Vendor Card Removed",
        description: "Temporary vendor card removed.",
      });
    }
  };

  const saveProject = async () => {
    if (!project || !projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a project name before saving.",
        variant: "destructive",
      });
      return;
    }

    if (sharedEmails.length > 0 && !isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Project sharing is only available with a Premium subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found during saveProject, navigating to login.");
        navigate('/login');
        return;
      }

      // --- DEBUGGING LOGS START ---
      console.log("--- SAVE PROJECT DEBUGGING ---");
      console.log("Current Session User ID:", session.user.id);
      console.log("Project ID being saved:", project.id);
      // Ensure 'project.user_id' exists in your Project interface and is fetched by loadProject
      console.log("Project Owner ID (from loaded project state):", project.user_id);
      // --- DEBUGGING LOGS END ---

      // 1. Update project name
      const { error: projectError } = await supabase
        .from('projects')
        .update({ name: projectName })
        .eq('id', project.id);

      if (projectError) {
        console.error('Error updating project name:', projectError);
        toast({
          title: "Error",
          description: "Failed to update project name.",
          variant: "destructive",
        });
        return;
      }

      // 2. Prepare vendors for upsert (insert new, update existing)
      // Only save if at least one meaningful field has data or is explicitly favorited.
      const vendorsToUpsert = vendors
        .filter(v => v.vendorName || v.phoneNumber || v.startDate || v.jobDuration || v.totalCost || v.isFavorite)
        .map(vendor => {
          // Start with common fields for all vendors
          const vendorPayload: any = { // Using 'any' for flexibility, can refine the type if needed
            project_id: project.id,
            vendor_name: vendor.vendorName || 'Unnamed Vendor',
            phone_number: vendor.phoneNumber || null,
            start_date: vendor.startDate || null,
            job_duration: vendor.jobDuration || null,
            total_cost: vendor.totalCost ? parseFloat(vendor.totalCost.replace(/[^0-9.]/g, '')) : null,
            is_favorite: vendor.isFavorite || false
          };

          // ONLY add the 'id' property if it's an existing vendor
          // This prevents sending `id: undefined` for new vendors, allowing DB to auto-generate
          if (!vendor.id.startsWith('new-')) {
            vendorPayload.id = vendor.id;
          }

          return vendorPayload;
        });

      // 3. Use upsert to insert new vendors and update existing ones
      // 'onConflict: 'id'' tells Supabase to update if an ID matches, otherwise insert.
      const { error: vendorUpsertError, data: upsertedVendorData } = await supabase
        .from('vendors')
        .upsert(vendorsToUpsert, { onConflict: 'id' });

      // --- DEBUGGING LOGS START ---
      console.log("Vendor Upsert Supabase Error Object:", vendorUpsertError);
      console.log("Vendor Upsert Supabase Data Object (returned from Supabase):", upsertedVendorData);
      // --- DEBUGGING LOGS END ---

      if (vendorUpsertError) {
        console.error('Error saving vendors:', vendorUpsertError);
        toast({
          title: "Error",
          description: "Failed to save vendor data.",
          variant: "destructive",
        });
        return;
      }

      // 4. Handle project shares (delete existing, then insert current)
      if (isSubscribed) {
        await supabase
          .from('project_shares')
          .delete()
          .eq('project_id', project.id);

        if (sharedEmails.length > 0) {
          const shareInserts = sharedEmails.map(email => ({
            project_id: project.id,
            owner_id: session.user.id,
            shared_with_email: email,
            permission_level: 'view'
          }));

          const { error: shareError } = await supabase
            .from('project_shares')
            .insert(shareInserts);

          if (shareError) {
            console.error('Error saving shares:', shareError);
            toast({
              title: "Warning",
              description: "Project saved but sharing may not have worked properly.",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Project updated successfully!",
      });

      // After successful save, reload the project to get the actual IDs for new vendors
      // and ensure the local state is fully synchronized with the database.
      // This is crucial if you rely on database-generated IDs for new vendors.
      await loadProject();

    } catch (error) {
      console.error('Caught unexpected error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <BackButton />
          <div className="text-center">
            <p className="text-gray-500">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <BackButton />
          <div className="text-center">
            <p className="text-gray-500">Project not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <SuccessCheckmark message={message} show={show} onComplete={hideSuccess} />

      <div className="max-w-md mx-auto mt-8 pb-8">
        <BackButton />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Edit Project</h1>
          <p className="text-gray-600">Modify your existing project</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="project-name" className="text-black">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="mt-1"
            />
          </div>

          <EmailSharingInput
            sharedEmails={sharedEmails}
            onEmailsChange={setSharedEmails}
            isSubscribed={isSubscribed}
          />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Vendor Information</h2>

            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onUpdate={updateVendor}
                onDelete={deleteVendor}
                onFavorite={handleFavorite} // This now triggers DB update
                canDelete={vendors.length > 1}
              />
            ))}

            {vendors.length < 10 && (
              <Button
                onClick={addVendor}
                variant="outline"
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-[10px]"
              >
                <Plus size={20} className="mr-2" />
                Add Vendor Card
              </Button>
            )}

            <Button
              onClick={saveProject}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
            >
              Update Project
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExistingProject;
