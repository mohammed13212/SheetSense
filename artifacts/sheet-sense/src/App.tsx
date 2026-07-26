import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import RelationshipManager from "@/pages/RelationshipManager";
import { LocaleProvider } from "@/i18n/context";
import { DatasetProvider } from "@/store/DatasetContext";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/relationships" component={RelationshipManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LocaleProvider>
      {/* DatasetProvider is mounted above the router so all routes can access
          the dataset store. Future pages (e.g. a RelationshipsPage) will use
          the same useDatasets() hook without any prop drilling. */}
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
    </LocaleProvider>
  );
}

export default App;
