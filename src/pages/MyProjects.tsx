
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Project {
  id: string;
  name: string;
  created_at: string;
}

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadProjects = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      await loadProjects();
    };

    checkAuthAndLoadProjects();
  }, [navigate]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={true}>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={true}>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">My Projects</h1>
          <p className="text-gray-600">Select a project to view or edit</p>
        </div>

        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No projects found</p>
              <Button
                onClick={() => navigate('/new-project')}
                className="bg-black text-white hover:bg-gray-800 rounded-[10px]"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                variant="outline"
                className="w-full max-w-[350px] mx-auto block h-14 text-left justify-start rounded-[10px] border-2 border-gray-200 hover:border-black hover:bg-gray-50"
              >
                <div>
                  <div className="font-semibold text-black">{project.name}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProjects;
