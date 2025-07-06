
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import VendorCard, { VendorData } from '@/components/VendorCard';

const NewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
    };

    checkAuth();

    // Initialize with one empty vendor card
    if (vendors.length === 0) {
      addVendor();
    }
  }, [navigate]);

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
      totalCost: ''
    };
    setVendors([...vendors, newVendor]);
  };

  const updateVendor = (id: string, field: keyof VendorData, value: string) => {
    setVendors(vendors.map(vendor => 
      vendor.id === id ? { ...vendor, [field]: value } : vendor
    ));
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
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name before saving.",
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

      // Save project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          user_id: session.user.id
        })
        .select()
        .single();

      if (projectError) {
        toast({
          title: "Error",
          description: "Failed to save project",
          variant: "destructive",
        });
        return;
      }

      setProjectId(projectData.id);

      // Save vendors
      const vendorsToSave = vendors.filter(v => v.vendorName || v.startDate || v.jobDuration || v.totalCost);
      if (vendorsToSave.length > 0) {
        const vendorInserts = vendorsToSave.map(vendor => ({
          project_id: projectData.id,
          vendor_name: vendor.vendorName || 'Unnamed Vendor',
          start_date: vendor.startDate || null,
          job_duration: vendor.jobDuration || null,
          total_cost: vendor.totalCost ? parseFloat(vendor.totalCost.replace(/[^0-9.]/g, '')) : null
        }));

        const { error: vendorError } = await supabase
          .from('vendors')
          .insert(vendorInserts);

        if (vendorError) {
          console.error('Error saving vendors:', vendorError);
        }
      }

      toast({
        title: "Project Saved!",
        description: "Your project has been saved successfully.",
      });
      
      navigate('/my-projects');
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout showLogoNavigation={true}>
      <div className="max-w-md mx-auto mt-8 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">New Project</h1>
          <p className="text-gray-600">Create a new bidding project</p>
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

          <Button
            onClick={saveProject}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            Save Project
          </Button>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-black">Vendor Information</h2>
            
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onUpdate={updateVendor}
                onDelete={deleteVendor}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewProject;
