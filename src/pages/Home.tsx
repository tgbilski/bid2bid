
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout showLogoNavigation={true}>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your bidding projects</p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          <Button
            onClick={() => navigate('/my-projects')}
            className="w-full max-w-[200px] bg-black text-white hover:bg-gray-800 rounded-[10px] h-12"
          >
            My Projects
          </Button>

          <Button
            onClick={() => navigate('/new-project')}
            className="w-full max-w-[200px] bg-gray-600 text-white hover:bg-gray-700 rounded-[10px] h-12"
          >
            New Project
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
