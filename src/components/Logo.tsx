
interface LogoProps {
  className?: string;
  onClick?: () => void;
}

const Logo = ({ className = "", onClick }: LogoProps) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className="max-w-[200px] h-auto cursor-pointer bg-gray-100 rounded-lg p-4 flex items-center justify-center"
        onClick={onClick}
      >
        <span className="text-2xl font-bold text-black">Bid2Bid</span>
      </div>
    </div>
  );
};

export default Logo;
