
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import VendorCard, { VendorData } from '@/components/VendorCard';

interface Project {
  id: string;
  name: string;
  vendors: VendorData[];
  createdAt: string;
  updatedAt: string;
}

const ExistingProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [vendors, setVendors] = useState<VendorData[]>([]);

  useEffect(() => {
    // Load project from localStorage
    const savedProject = localStorage.getItem(`bid2bid-project-${projectId}`);
    if (savedProject) {
      const projectData = JSON.parse(savedProject);
      setProject(projectData);
      setProjectName(projectData.name);
      setVendors(projectData.vendors || []);
    } else {
      toast({
        title: "Project Not Found",
        description: "The requested project could not be found.",
        variant: "destructive",
      });
      navigate('/my-projects');
    }
  }, [projectId, navigate]);

  useEffect(() => {
    // Auto-save functionality
    if (project && (projectName.trim() || vendors.some(v => v.vendorName || v.startDate || v.jobDuration || v.totalCost))) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [projectName, vendors, project]);

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
    if (!project || !projectName.trim()) return;

    const updatedProject = {
      ...project,
      name: projectName,
      vendors: vendors,
      updatedAt: new Date().toISOString()
    };

    // Update individual project
    localStorage.setItem(`bid2bid-project-${project.id}`, JSON.stringify(updatedProject));

    // Update project list
    const existingProjects = JSON.parse(localStorage.getItem('bid2bid-projects') || '[]');
    const updatedProjects = existingProjects.map((p: Project) => 
      p.id === project.id ? { ...p, name: projectName, updatedAt: updatedProject.updatedAt } : p
    );
    localStorage.setItem('bid2bid-projects', JSON.stringify(updatedProjects));
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
      title: "Project Updated!",
      description: "Your project has been updated successfully.",
    });
  };

  if (!project) {
    return (
      <Layout showLogoNavigation={true}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={true}>
      <div className="max-w-md mx-auto mt-8 pb-8">
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

          <Button
            onClick={handleManualSave}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            Update Project
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

export default ExistingProject;
