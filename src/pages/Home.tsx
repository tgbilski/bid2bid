
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">Easy-to-use bid comparison tool for projects!</p>
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
