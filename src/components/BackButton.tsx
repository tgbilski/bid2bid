
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/home')}
      variant="ghost"
      size="sm"
      className="mb-4 text-black hover:bg-gray-100"
    >
      <Home size={16} className="mr-2" />
      Back to Home
    </Button>
  );
};

export default BackButton;
