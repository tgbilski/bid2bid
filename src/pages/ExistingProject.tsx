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

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
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
  // Removed favoriteVendors state as it's not directly managed on this page
  // The `isFavorite` status is now part of each vendor in the `vendors` state.
  const { message, show, showSuccess, hideSuccess } = useSuccessMessage();

  useEffect(() => {
    const checkAuthAndLoadProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      await checkSubscription();
      // Removed loadFavoriteVendors() call from here
      await loadProject();
    };

    checkAuthAndLoadProject();
  }, [projectId, navigate]);

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
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Removed loadFavoriteVendors function as it's not needed on this page.
  // The `isFavorite` status for each vendor is loaded with the project itself.

  const loadProject = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        showSuccess("The requested project could not be found.");
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
      } else if (sharesData) {
        setSharedEmails(sharesData.map(share => share.shared_with_email));
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*') // Select all columns, including is_favorite
        .eq('project_id', projectId)
        .order('created_at');

      if (vendorError) {
        console.error('Error loading vendors:', vendorError);
      } else if (vendorData && vendorData.length > 0) {
        const formattedVendors = vendorData.map(vendor => ({
          id: vendor.id,
          vendorName: vendor.vendor_name,
          phoneNumber: vendor.phone_number || '',
          startDate: vendor.start_date || '',
          jobDuration: vendor.job_duration || '',
          totalCost: vendor.total_cost ? `$${vendor.total_cost.toFixed(2)}` : '',
          isFavorite: vendor.is_favorite || false // Ensure is_favorite is loaded
        }));
        setVendors(formattedVendors);
      } else {
        // If no vendors, add an initial empty one
        addVendor();
      }
    } catch (error) {
      console.error('Error loading project:', error);
      showSuccess("Failed to load project");
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
    setVendors(vendors.map(vendor =>
      vendor.id === id ? { ...vendor, isFavorite: newFavoriteStatus } : vendor
    ));

    // Persist to database
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // If it's a new vendor that hasn't been saved yet, we can't favorite it in DB immediately.
      // It will be saved with its favorite status when saveProject is called.
      if (vendorToUpdate.id.startsWith('new-')) {
        showSuccess("Vendor will be favorited upon project save.");
        return;
      }

      const { error } = await supabase
        .from('vendors')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating favorite status:', error);
        showSuccess("Failed to update favorite status.");
        // Revert UI if DB update fails
        setVendors(vendors.map(vendor =>
          vendor.id === id ? { ...vendor, isFavorite: !newFavoriteStatus } : vendor
        ));
      } else {
        showSuccess(newFavoriteStatus ? "Vendor favorited!" : "Vendor unfavorited!");
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      showSuccess("Failed to update favorite status.");
      // Revert UI if error occurs
      setVendors(vendors.map(vendor =>
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
    setVendors(vendors.filter(vendor => vendor.id !== id));

    // If it's an existing vendor (not a new one with temp ID), delete from DB
    if (!id.startsWith('new-')) {
      try {
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting vendor from DB:', error);
          showSuccess("Failed to delete vendor from database.");
          // You might want to re-add the vendor to state if DB deletion fails
          // For simplicity, we'll just log the error here.
        } else {
          showSuccess("Vendor deleted successfully!");
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        showSuccess("Failed to delete vendor.");
      }
    } else {
      showSuccess("Vendor card removed.");
    }
  };

  const saveProject = async () => {
    if (!project || !projectName.trim()) {
      showSuccess("Please enter a project name before saving.");
      return;
    }

    if (sharedEmails.length > 0 && !isSubscribed) {
      showSuccess("Project sharing is only available with a Premium subscription.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Update project name
      const { error: projectError } = await supabase
        .from('projects')
        .update({ name: projectName })
        .eq('id', project.id);

      if (projectError) {
        showSuccess("Failed to update project name.");
        return;
      }

      // Prepare vendors for upsert (insert new, update existing)
      const vendorsToUpsert = vendors.map(vendor => ({
        id: vendor.id.startsWith('new-') ? undefined : vendor.id, // Supabase will generate ID for new rows
        project_id: project.id,
        vendor_name: vendor.vendorName || 'Unnamed Vendor',
        phone_number: vendor.phoneNumber || null,
        start_date: vendor.startDate || null,
        job_duration: vendor.jobDuration || null,
        total_cost: vendor.totalCost ? parseFloat(vendor.totalCost.replace(/[^0-9.]/g, '')) : null,
        is_favorite: vendor.isFavorite || false // isFavorite status is now correctly passed
      }));

      // Use upsert to insert new vendors and update existing ones
      const { error: vendorUpsertError } = await supabase
        .from('vendors')
        .upsert(vendorsToUpsert, { onConflict: 'id' }); // Conflict on 'id' to update existing

      if (vendorUpsertError) {
        console.error('Error saving vendors:', vendorUpsertError);
        showSuccess("Failed to save vendor data.");
        return;
      }

      // Handle project shares (delete existing, then insert current)
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
            showSuccess("Project saved but sharing may not have worked properly.");
          }
        }
      }

      showSuccess("Project updated successfully!");
    } catch (error) {
      console.error('Error updating project:', error);
      showSuccess("Failed to update project");
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
                // favoriteVendors prop is no longer needed here as isFavorite is on the vendor object itself
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
