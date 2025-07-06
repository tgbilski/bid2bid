
interface LogoProps {
  className?: string;
  onClick?: () => void;
}

const Logo = ({ className = "", onClick }: LogoProps) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <img 
        src="/placeholder.svg" 
        alt="Bid2Bid Logo" 
        className="max-w-[200px] h-auto cursor-pointer"
        onClick={onClick}
      />
    </div>
  );
};

export default Logo;
