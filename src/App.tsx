
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import ExistingProject from "./pages/ExistingProject";
import MyProjects from "./pages/MyProjects";
import MyFavorites from "./pages/MyFavorites";
import Subscription from "./pages/Subscription";
import ManageSubscription from "./pages/ManageSubscription";
import EncryptionCompliance from "./pages/EncryptionCompliance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/project/:projectId" element={<ExistingProject />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/manage-subscription" element={<ManageSubscription />} />
          <Route path="/encryption-compliance" element={<EncryptionCompliance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
