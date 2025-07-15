
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mb-2">
      <Button
        onClick={() => navigate('/home')}
        variant="ghost"
        size="sm"
        className="text-black hover:bg-gray-100 p-2"
      >
        <Home size={20} />
      </Button>
    </div>
  );
};

export default BackButton;
