import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DashboardPage from "@/pages/DashboardPage";
import TrainingPage from "@/pages/TrainingPage";
import GalleryPage from "@/pages/GalleryPage";
import AdminPage from "@/pages/AdminPage";
import UserProfilePage from "@/pages/UserProfilePage";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";
import AISupport from "@/components/AISupport";

function AuthenticatedApp() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/training" component={TrainingPage} />
          <Route path="/gallery" component={GalleryPage} />
          <Route path="/profile" component={UserProfilePage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <AISupport />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <TooltipProvider>
            <AuthenticatedApp />
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
