


interface LogoProps {
  className?: string;
  onClick?: () => void;
}

const Logo = ({ className = "", onClick }: LogoProps) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className="max-w-[200px] h-auto cursor-pointer bg-white rounded-lg p-4 flex items-center justify-center"
        onClick={onClick}
      >
        <img 
          src="/lovable-uploads/f5a0a3fb-8d3d-4c91-b307-aef12bc1be68.png" 
          alt="Bid2Bid Logo" 
          className="max-w-full h-auto max-h-24"
        />
      </div>
    </div>
  );
};

export default Logo;


