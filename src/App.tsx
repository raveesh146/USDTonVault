import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import TraderOnboarding from "./pages/TraderOnboarding";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const queryClient = new QueryClient();

const App = () => {
  const setDemoMode = useStore((s) => s.setDemoMode);

  useEffect(() => {
    setDemoMode(false);
  }, [setDemoMode]);

  const manifestUrl = (import.meta as any).env?.VITE_TONCONNECT_MANIFEST || `${window.location.origin}/tonconnect-manifest.json`;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/onboarding" element={<TraderOnboarding />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
};

export default App;
