import { Switch, Route, Redirect } from "wouter";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { DatasetProvider } from "@/store/DatasetContext";
import { ProjectProvider } from "@/store/ProjectContext";
import { ThemeProvider } from "@/store/ThemeContext";
import { LocaleProvider } from "@/i18n/context";
import { Toaster as SmartToaster } from "@/components/ui/sonner";

const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ProjectWorkspace = lazy(() => import("@/pages/ProjectWorkspace"));
const RelationshipManager = lazy(() => import("@/pages/RelationshipManager"));
const LoginPage = lazy(() => import("@/pages/Login"));
const SignupPage = lazy(() => import("@/pages/Signup"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPassword"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <Switch>
        {/* ── Public landing / anonymous workspace ── */}
        <Route path="/" component={Home} />

        {/* ── Auth routes ── */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />

        {/* ── Authenticated: Dashboard ── */}
        <Route path="/dashboard">
          {user ? <Dashboard /> : <Redirect to="/login" />}
        </Route>

        {/* ── Authenticated: Project workspace ── */}
        <Route path="/projects/:projectId">
          {user ? <ProjectWorkspace /> : <Redirect to="/login" />}
        </Route>

        {/* ── Authenticated: Relationship manager ── */}
        <Route path="/projects/:projectId/relationships">
          {user ? <RelationshipManager /> : <Redirect to="/login" />}
        </Route>

        {/* Legacy /relationships redirect — send to dashboard if no project context */}
        <Route path="/relationships">
          {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>

        {/* ── 404 ── */}
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <ProjectProvider>
              <DatasetProvider>
                <AppRoutes />
                <SmartToaster />
              </DatasetProvider>
            </ProjectProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
