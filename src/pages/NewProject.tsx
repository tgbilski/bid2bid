
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import VendorCard, { VendorData } from '@/components/VendorCard';

const NewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize with one empty vendor card
    if (vendors.length === 0) {
      addVendor();
    }
  }, []);

  useEffect(() => {
    // Auto-save functionality
    if (projectName.trim() || vendors.some(v => v.vendorName || v.startDate || v.jobDuration || v.totalCost)) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [projectName, vendors]);

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

  const saveProject = () => {
    if (!projectName.trim()) return;

    const project = {
      id: Date.now().toString(),
      name: projectName,
      vendors: vendors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingProjects = JSON.parse(localStorage.getItem('bid2bid-projects') || '[]');
    const updatedProjects = [...existingProjects, project];
    localStorage.setItem('bid2bid-projects', JSON.stringify(updatedProjects));
    localStorage.setItem(`bid2bid-project-${project.id}`, JSON.stringify(project));
  };

  const handleManualSave = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name before saving.",
        variant: "destructive",
      });
      return;
    }

    saveProject();
    toast({
      title: "Project Saved!",
      description: "Your project has been saved successfully.",
    });
    navigate('/my-projects');
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
            onClick={handleManualSave}
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
