
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('bid2bid-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleProjectSelect = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

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
                    Created: {new Date(project.createdAt).toLocaleDateString()}
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
