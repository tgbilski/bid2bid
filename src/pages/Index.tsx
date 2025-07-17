import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the login page on mount
    navigate("/login");
  }, [navigate]);

  // Optionally, you can return null or a loading spinner while redirecting
  return null;
};

export default Index;
