import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react'; // Added Loader2 for loading state
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import EmailSharingInput from '@/components/EmailSharingInput';
import VendorCard, { VendorData } from '@/components/VendorCard';

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string; // Add user_id to Project interface for ownership checks
}

const ExistingProject = () => {
  const { projectId } = useParams<{ projectId: string }>(); // Ensure projectId is typed as string
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // New state for individual save operations
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        toast({
          title: "Authentication Required",
          description: "Please log in to view project details.",
          variant: "destructive",
        });
        return;
      }

      // Check for projectId existence
      if (!projectId) {
        toast({
          title: "Error",
          description: "No project ID provided in URL.",
          variant: "destructive",
        });
        navigate('/my-projects');
        return;
      }
      
      await checkSubscription();
      await loadProjectData(); // Renamed to avoid confusion with internal 'project' state
    };

    checkAuthAndLoadProject();
  }, [projectId, navigate]); // Add projectId to dependencies to re-run if URL param changes

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

  const loadProjectData = async () => { // Renamed this function
    setIsLoading(true);
    try {
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        toast({
          title: "Project Not Found",
          description: "The requested project could not be found.",
          variant: "destructive",
        });
        navigate('/my-projects');
        return;
      }

      setProject(projectData);
      setProjectName(projectData.name);

      // Load existing shares
      const { data: sharesData, error: sharesError } = await supabase
        .from('project_shares')
        .select('shared_with_email')
        .eq('project_id', projectId);

      if (sharesError) {
        console.error('Error loading shares:', sharesError);
      } else if (sharesData) {
        setSharedEmails(sharesData.map(share => share.shared_with_email));
      }

      // Load vendors
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (vendorError) {
        console.error('Error loading vendors:', vendorError);
        setVendors([]); // Ensure vendors array is empty on error
      } else if (vendorData && vendorData.length > 0) {
        const formattedVendors = vendorData.map(vendor => ({
          id: vendor.id,
          vendorName: vendor.vendor_name,
          startDate: vendor.start_date || '',
          jobDuration: vendor.job_duration || '',
          totalCost: vendor.total_cost !== null ? `$${vendor.total_cost.toFixed(2)}` : '',
          isFavorite: vendor.is_favorite || false
        }));
        setVendors(formattedVendors);
      } else {
        // If no vendors, initialize with one empty card, but *don't save to DB yet*
        // This mirrors NewProject's initial local state behavior
        setVendors([{
            id: Date.now().toString(), // Use client-side ID for new unsaved vendor
            vendorName: '',
            startDate: '',
            jobDuration: '',
            totalCost: '',
            isFavorite: false
        }]);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive",
      });
      navigate('/my-projects');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Vendor CRUD Operations (NOW Directly to Supabase) ---

  const addVendor = async () => {
    if (!project) {
        toast({ title: "Error", description: "Project not loaded yet.", variant: "destructive" });
        return;
    }
    if (!isSubscribed && vendors.length >= 10) {
      toast({
        title: "Maximum Reached",
        description: "Free users can only add up to 10 vendor cards. Upgrade to Premium for unlimited vendors.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
        const newVendorDataForDB = {
            project_id: project.id, // Link new vendor to current project
            vendor_name: '', // Empty values
            start_date: null,
            job_duration: null,
            total_cost: null,
            is_favorite: false
        };

        const { data: insertedVendor, error } = await supabase
            .from('vendors')
            .insert([newVendorDataForDB])
            .select() // Get the actual ID generated by Supabase
            .single();

        if (error) throw error;

        // Add the newly created vendor to local state with its real Supabase ID
        if (insertedVendor) {
            setVendors(prev => [...prev, {
                id: insertedVendor.id, // Use the actual ID from Supabase
                vendorName: insertedVendor.vendor_name,
                startDate: insertedVendor.start_date || '',
                jobDuration: insertedVendor.job_duration || '',
                totalCost: insertedVendor.total_cost !== null ? `$${insertedVendor.total_cost.toFixed(2)}` : '',
                isFavorite: insertedVendor.is_favorite || false
            }]);
            toast({ title: "Vendor Added", description: "New vendor card created." });
        }
    } catch (error) {
        console.error("Error adding vendor:", error);
        toast({ title: "Error", description: "Failed to add vendor.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const updateVendor = async (id: string, field: keyof VendorData, value: string | boolean) => {
    // Optimistically update local state for immediate UI feedback
    setVendors(prevVendors => prevVendors.map(vendor =>
        vendor.id === id ? { ...vendor, [field]: value } : vendor
    ));

    // Prepare data for Supabase update
    let supabaseValue: any = value;
    let supabaseField: string = field;

    if (field === 'vendorName') supabaseField = 'vendor_name';
    if (field === 'startDate') supabaseField = 'start_date';
    if (field === 'jobDuration') supabaseField = 'job_duration';
    if (field === 'totalCost') {
        supabaseField = 'total_cost';
        supabaseValue = value ? parseFloat(value.toString().replace(/[^0-9.]/g, '')) : null;
        if (isNaN(supabaseValue)) supabaseValue = null;
    }
    if (field === 'isFavorite') supabaseField = 'is_favorite';
    
    // Perform the database update
    try {
        const { error } = await supabase
            .from('vendors')
            .update({ [supabaseField]: supabaseValue })
            .eq('id', id); // Update the specific vendor by its Supabase ID

        if (error) throw error;
        // Optionally show a silent success or no toast for minor updates
    } catch (error) {
        console.error("Error updating vendor:", error);
        toast({ title: "Error", description: "Failed to update vendor.", variant: "destructive" });
        // Consider reverting local state on error if necessary
    }
    // No setIsSaving here, as updates are frequent and non-blocking
  };

  const handleDeleteVendor = async (id: string) => { // Renamed for clarity
    if (vendors.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one vendor card.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this vendor card?")) {
        return;
    }

    setIsSaving(true); // Indicate a save operation is in progress
    try {
        const { error } = await supabase
            .from('vendors')
            .delete()
            .eq('id', id); // Delete the specific vendor by its Supabase ID

        if (error) throw error;

        // Update local state after successful deletion
        setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));
        toast({ title: "Vendor Deleted", description: "Vendor card removed." });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        toast({ title: "Error", description: "Failed to delete vendor.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleFavorite = async (id: string) => { // Renamed for clarity and to match onDelete
    // Optimistically update local state
    setVendors(prevVendors => prevVendors.map(vendor => {
        if (vendor.id === id) {
            return { ...vendor, isFavorite: !vendor.isFavorite };
        }
        return vendor;
    }));

    // Find the current status to send to DB
    const vendorToUpdate = vendors.find(v => v.id === id);
    if (!vendorToUpdate) return;
    const newFavoriteStatus = !vendorToUpdate.isFavorite; // Based on prior state

    try {
        const { error } = await supabase
            .from('vendors')
            .update({ is_favorite: newFavoriteStatus })
            .eq('id', id);

        if (error) throw error;
        toast({ title: "Favorite Updated", description: "Vendor favorite status changed." });
    } catch (error) {
        console.error("Error updating favorite status:", error);
        toast({ title: "Error", description: "Failed to update favorite status.", variant: "destructive" });
        // Revert local state if error
        setVendors(prevVendors => prevVendors.map(vendor => {
            if (vendor.id === id) {
                return { ...vendor, isFavorite: !vendor.isFavorite }; // Flip it back
            }
            return vendor;
        }));
    }
  };

  // --- Project Name Update ---
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const saveProjectName = async () => {
    if (!project || !projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }
    if (projectName === project.name) { // No change, no save
        return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: projectName, updated_at: new Date().toISOString() })
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { ...prev, name: projectName } : null); // Update local project state
      toast({ title: "Project Name Saved", description: "Project name updated successfully." });
    } catch (error) {
      console.error('Error updating project name:', error);
      toast({
        title: "Error",
        description: "Failed to update project name.",
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };

  // --- Project Sharing Update ---
  const saveProjectShares = async () => {
    if (!project) return; // Project must be loaded
    if (sharedEmails.length > 0 && !isSubscribed) {
      toast({
        title: "Premium Feature",
        description: "Project sharing is only available with a Premium subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get current shares from DB to compare (optional, but robust)
      const { data: existingShares, error: fetchError } = await supabase
        .from('project_shares')
        .select('shared_with_email')
        .eq('project_id', project.id);
      if (fetchError) throw fetchError;
      const existingSharedEmails = new Set(existingShares?.map(s => s.shared_with_email) || []);

      const emailsToAdd = sharedEmails.filter(email => !existingSharedEmails.has(email));
      const emailsToRemove = Array.from(existingSharedEmails).filter(email => !sharedEmails.includes(email));

      // Delete shares no longer present
      if (emailsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('project_shares')
          .delete()
          .eq('project_id', project.id)
          .in('shared_with_email', emailsToRemove);
        if (deleteError) throw deleteError;
      }

      // Insert new shares
      if (emailsToAdd.length > 0) {
        const shareInserts = emailsToAdd.map(email => ({
          project_id: project.id,
          owner_id: project.user_id, // Use project's actual owner ID
          shared_with_email: email,
          permission_level: 'view'
        }));

        const { error: insertError } = await supabase
          .from('project_shares')
          .insert(shareInserts);
        if (insertError) throw insertError;
      }
      toast({ title: "Sharing Updated", description: "Project sharing settings saved." });
    } catch (error) {
      console.error('Error saving shares:', error);
      toast({
        title: "Error",
        description: "Failed to update project sharing.",
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading project...</p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-red-500">Project not found or accessible.</p>
          <Button onClick={() => navigate('/my-projects')} className="mt-4">Go to My Projects</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
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
              onChange={handleProjectNameChange}
              onBlur={saveProjectName} // Save on blur
              placeholder="Enter project name"
              className="mt-1"
              disabled={isSaving}
            />
          </div>

          <EmailSharingInput
            sharedEmails={sharedEmails}
            onEmailsChange={setSharedEmails}
            isSubscribed={isSubscribed}
            onSave={saveProjectShares} // Trigger save when emails are changed and finalized
            disabled={isSaving}
          />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Vendor Information</h2>
            
            {vendors.length === 0 && !isLoading ? (
                <div className="text-center text-gray-500 py-4">No vendors found for this project. Add one below!</div>
            ) : (
                vendors.map((vendor) => (
                    <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        onUpdate={updateVendor} // Calls Supabase directly
                        onDelete={handleDeleteVendor} // Calls Supabase directly
                        onFavorite={handleFavorite} // Calls Supabase directly
                        canDelete={vendors.length > 1}
                        disabled={isSaving} // Disable card during saving operations
                    />
                ))
            )}

            {(isSubscribed || vendors.length < 10) && (
              <Button
                onClick={addVendor}
                variant="outline"
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-[10px]"
                disabled={isSaving} // Disable during save operations
              >
                {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                    <Plus size={20} className="mr-2" />
                )}
                Add Vendor Card
              </Button>
            )}

            {/* Removed the 'Update Project' button for vendors and shares
                because changes are now saved live/on blur. If there are other
                project-level fields that require a single save, you can reintroduce
                a save button for those specific fields.
            */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExistingProject;
