import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuctionProvider } from "@/context/AuctionContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Players from "./pages/Players";
import Teams, { TeamDashboard } from "./pages/Teams";
import Admin from "./pages/Admin";
import Display from "./pages/Display";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuctionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/players" element={<Players />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/team/:slug" element={<TeamDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/display" element={<Display />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuctionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
