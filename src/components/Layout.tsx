
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  showLogoNavigation?: boolean;
}

const Layout = ({ children, showLogoNavigation = false }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (showLogoNavigation) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6 pb-4">
        <Logo onClick={showLogoNavigation ? handleLogoClick : undefined} />
      </div>
      <div className="px-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;
