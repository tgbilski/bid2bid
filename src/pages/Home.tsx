
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Settings } from 'lucide-react';
import Layout from '@/components/Layout';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Welcome to Bid2Bid</h1>
          <p className="text-gray-600">Compare vendor pricing and manage your projects</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/new-project')}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            <Plus size={20} className="mr-2" />
            New Project
          </Button>

          <Button
            onClick={() => navigate('/my-projects')}
            variant="outline"
            className="w-full rounded-[10px] h-12 border-2 border-gray-200 hover:border-black"
          >
            <FolderOpen size={20} className="mr-2" />
            My Projects
          </Button>

          <Button
            onClick={() => navigate('/manage-subscription')}
            variant="outline"
            className="w-full rounded-[10px] h-12 border-2 border-gray-200 hover:border-black"
          >
            <Settings size={20} className="mr-2" />
            Manage
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
