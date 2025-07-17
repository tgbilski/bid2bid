
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
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

  useEffect(() => {
    const checkAuthAndLoadProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      await checkSubscription();
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

  const loadProject = async () => {
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
      } else if (vendorData && vendorData.length > 0) {
        const formattedVendors = vendorData.map(vendor => ({
          id: vendor.id,
          vendorName: vendor.vendor_name,
          startDate: vendor.start_date || '',
          jobDuration: vendor.job_duration || '',
          totalCost: vendor.total_cost ? `$${vendor.total_cost.toFixed(2)}` : '',
          isFavorite: vendor.is_favorite || false
        }));
        setVendors(formattedVendors);
      } else {
        // If no vendors, add one empty card
        addVendor();
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVendor = () => {
    if (vendors.length >= 10) {
      toast({
        title: "Maximum Reached",
        description: "You can only add up to 10 vendor cards.",
        variant: "destructive",
      });
      return;
    }

    const newVendor: VendorData = {
      id: Date.now().toString(),
      vendorName: '',
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

  const handleFavorite = (id: string) => {
    setVendors(vendors.map(vendor => ({
      ...vendor,
      isFavorite: vendor.id === id ? !vendor.isFavorite : false
    })));
  };

  const deleteVendor = (id: string) => {
    if (vendors.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one vendor card.",
        variant: "destructive",
      });
      return;
    }
    setVendors(vendors.filter(vendor => vendor.id !== id));
  };

  const saveProject = async () => {
    if (!project || !projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name before saving.",
        variant: "destructive",
      });
      return;
    }

    if (sharedEmails.length > 0 && !isSubscribed) {
      toast({
        title: "Premium Feature",
        description: "Project sharing is only available with a Premium subscription.",
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
        return;
      }

      // Delete existing vendors
      await supabase
        .from('vendors')
        .delete()
        .eq('project_id', project.id);

      // Insert updated vendors
      const vendorsToSave = vendors.filter(v => v.vendorName || v.startDate || v.jobDuration || v.totalCost);
      if (vendorsToSave.length > 0) {
        const vendorInserts = vendorsToSave.map(vendor => ({
          project_id: project.id,
          vendor_name: vendor.vendorName || 'Unnamed Vendor',
          start_date: vendor.startDate || null,
          job_duration: vendor.jobDuration || null,
          total_cost: vendor.totalCost ? parseFloat(vendor.totalCost.replace(/[^0-9.]/g, '')) : null,
          is_favorite: vendor.isFavorite || false
        }));

        const { error: vendorError } = await supabase
          .from('vendors')
          .insert(vendorInserts);

        if (vendorError) {
          console.error('Error saving vendors:', vendorError);
        }
      }

      // Handle project sharing
      if (isSubscribed) {
        // Delete existing shares
        await supabase
          .from('project_shares')
          .delete()
          .eq('project_id', project.id);

        // Insert new shares
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
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Project Updated!",
        description: "Your project has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating project:', error);
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
                onFavorite={handleFavorite}
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
