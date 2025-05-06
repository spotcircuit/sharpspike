
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import RaceResultsPage from "./pages/RaceResultsPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";
import DataDashboardPage from "./pages/DataDashboardPage";
import QuantumRankingsPage from "./pages/QuantumRankingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/" 
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <RequireAuth requireAdmin={true}>
                  <AdminPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/results/:trackName" 
              element={
                <RequireAuth>
                  <RaceResultsPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/results" 
              element={
                <RequireAuth>
                  <RaceResultsPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/data-dashboard" 
              element={
                <RequireAuth>
                  <DataDashboardPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/quantum-rankings" 
              element={
                <RequireAuth>
                  <QuantumRankingsPage />
                </RequireAuth>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
