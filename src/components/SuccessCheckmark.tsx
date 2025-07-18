
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessCheckmarkProps {
  message: string;
  show: boolean;
  onComplete: () => void;
}

const SuccessCheckmark = ({ message, show, onComplete }: SuccessCheckmarkProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out to complete
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <Check size={20} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default SuccessCheckmark;
