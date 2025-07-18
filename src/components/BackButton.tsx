
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
        size="lg"
        className="text-black hover:bg-gray-100 p-4 h-16 w-16"
      >
        <Home size={32} />
      </Button>
    </div>
  );
};

export default BackButton;
