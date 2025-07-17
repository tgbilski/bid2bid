
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';

interface Project {
  id: string;
  name: string;
  created_at: string;
  is_shared?: boolean;
  owner_email?: string;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load owned projects
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ownedError) {
        console.error('Error loading owned projects:', ownedError);
      }

      // Load shared projects with explicit typing
      const { data: sharedProjectData, error: sharedError } = await supabase
        .from('project_shares')
        .select(`
          project_id,
          projects!inner(id, name, created_at)
        `)
        .eq('shared_with_email', session.user.email);

      if (sharedError) {
        console.error('Error loading shared projects:', sharedError);
      }

      const allProjects: Project[] = [];
      
      // Add owned projects
      if (ownedProjects) {
        allProjects.push(...ownedProjects.map(project => ({
          ...project,
          is_shared: false
        })));
      }

      // Add shared projects with proper type handling
      if (sharedProjectData) {
        sharedProjectData.forEach((share: any) => {
          const project = share.projects;
          if (project && typeof project === 'object') {
            allProjects.push({
              id: project.id,
              name: project.name,
              created_at: project.created_at,
              is_shared: true
            });
          }
        });
      }

      // Sort by created_at
      allProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, projectName: string, isShared: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isShared) {
      // For shared projects, remove the user from the share
      if (!confirm(`Are you sure you want to remove yourself from the shared project "${projectName}"?`)) {
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from('project_shares')
          .delete()
          .eq('project_id', projectId)
          .eq('shared_with_email', session.user.email);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to remove yourself from shared project",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Removed from Project",
            description: `You have been removed from "${projectName}".`,
          });
          await loadProjects();
        }
      } catch (error) {
        console.error('Error removing from shared project:', error);
        toast({
          title: "Error",
          description: "Failed to remove yourself from shared project",
          variant: "destructive",
        });
      }
    } else {
      // For owned projects, delete the entire project
      if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
        return;
      }

      try {
        // Delete vendors first (foreign key constraint)
        await supabase
          .from('vendors')
          .delete()
          .eq('project_id', projectId);

        // Delete project shares
        await supabase
          .from('project_shares')
          .delete()
          .eq('project_id', projectId);

        // Then delete the project
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to delete project",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Project Deleted",
            description: `"${projectName}" has been deleted successfully.`,
          });
          await loadProjects();
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Layout showLogoNavigation={false}>
        <div className="max-w-md mx-auto mt-8">
          <BackButton />
          <div className="text-center">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showLogoNavigation={false}>
      <div className="max-w-md mx-auto mt-8">
        <BackButton />
        
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
              <div
                key={project.id}
                className="relative w-full max-w-[350px] mx-auto"
              >
                <Button
                  onClick={() => handleProjectSelect(project.id)}
                  variant="outline"
                  className="w-full block h-14 text-left justify-start rounded-[10px] border-2 border-gray-200 hover:border-black hover:bg-gray-50 pr-12"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">{project.name}</span>
                      {project.is_shared && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Shared
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
                
                <button
                  onClick={(e) => handleDeleteProject(project.id, project.name, project.is_shared || false, e)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-red-100 rounded-full transition-colors"
                  title={project.is_shared ? "Remove from shared projects" : "Delete project"}
                >
                  <X size={16} className="text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProjects;
