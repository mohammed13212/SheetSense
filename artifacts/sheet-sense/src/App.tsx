import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import RelationshipManager from "@/pages/RelationshipManager";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import { LocaleProvider } from "@/i18n/context";
import { DatasetProvider } from "@/store/DatasetContext";
import { ThemeProvider } from "@/store/ThemeContext";
import { AuthProvider } from "@/store/AuthContext";
import { ProjectProvider } from "@/store/ProjectContext";
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/relationships" component={RelationshipManager} />

      {/* Guest-only: redirect authenticated users to /dashboard */}
      <Route path="/login">
        <GuestRoute>
          <Login />
        </GuestRoute>
      </Route>
      <Route path="/signup">
        <GuestRoute>
          <Signup />
        </GuestRoute>
      </Route>
      <Route path="/forgot-password">
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      </Route>

      {/* Protected: redirect unauthenticated users to /login */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ProjectProvider>
            {/* DatasetProvider is mounted above the router so all routes share
                the same dataset store without prop drilling. */}
            <DatasetProvider>
              <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <Router />
                  </WouterRouter>
                  <Toaster />
                </TooltipProvider>
              </QueryClientProvider>
            </DatasetProvider>
          </ProjectProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
