import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const NewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [favoriteVendors, setFavoriteVendors] = useState<VendorData[]>([]);
  const navigate = useNavigate();
  const { message, show, showSuccess, hideSuccess } = useSuccessMessage();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      await checkSubscription();
      await loadFavoriteVendors();
    };

    checkAuthAndSubscription();

    if (vendors.length === 0) {
      addVendor();
    }
  }, [navigate]);

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

  const loadFavoriteVendors = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('id, vendor_name, phone_number')
        .eq('is_favorite', true)
        .eq('projects.user_id', session.user.id);

      if (!error && vendorData) {
        const formattedVendors = vendorData.map((vendor: any) => ({
          id: vendor.id,
          vendorName: vendor.vendor_name,
          phoneNumber: vendor.phone_number,
          startDate: '',
          jobDuration: '',
          totalCost: '',
          isFavorite: true
        }));
        setFavoriteVendors(formattedVendors);
      }
    } catch (error) {
      console.error('Error loading favorite vendors:', error);
    }
  };

  const addVendor = () => {
    if (vendors.length >= 10) {
      showSuccess("You can only add up to 10 vendor cards.");
      return;
    }

    const newVendor: VendorData = {
      id: Date.now().toString(),
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

  const handleFavorite = (id: string) => {
    setVendors(vendors.map(vendor => ({
      ...vendor,
      isFavorite: vendor.id === id ? !vendor.isFavorite : false
    })));
  };

  const deleteVendor = (id: string) => {
    if (vendors.length <= 1) {
      showSuccess("You must have at least one vendor card.");
      return;
    }
    setVendors(vendors.filter(vendor => vendor.id !== id));
  };

  const saveProject = async () => {
    if (!projectName.trim()) {
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

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          user_id: session.user.id
        })
        .select()
        .single();

      if (projectError) {
        showSuccess("Failed to save project");
        return;
      }

      const vendorsToSave = vendors.filter(v => v.vendorName || v.startDate || v.jobDuration || v.totalCost);
      if (vendorsToSave.length > 0) {
        const vendorInserts = vendorsToSave.map(vendor => ({
          project_id: projectData.id,
          vendor_name: vendor.vendorName || 'Unnamed Vendor',
          phone_number: vendor.phoneNumber || null,
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

      if (isSubscribed && sharedEmails.length > 0) {
        const shareInserts = sharedEmails.map(email => ({
          project_id: projectData.id,
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

      showSuccess("Project saved successfully!");
      
      setTimeout(() => {
        navigate('/my-projects');
      }, 2000);
    } catch (error) {
      console.error('Error saving project:', error);
      showSuccess("Failed to save project");
    }
  };

  return (
    <Layout showLogoNavigation={false}>
      <SuccessCheckmark message={message} show={show} onComplete={hideSuccess} />
      
      <div className="max-w-md mx-auto mt-8 pb-8">
        <BackButton />
        
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
                favoriteVendors={favoriteVendors}
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
              Save Project
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewProject;
