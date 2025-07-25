import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import Footer from "@/components/Footer";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const MoviePage = lazy(() => import("@/pages/MoviePage"));
import VideoPlayerPage from './pages/VideoPlayerPage';
const TrendingPage = lazy(() => import("@/pages/TrendingPage"));
import PopularPage from './pages/PopularPage';
const GenrePage = lazy(() => import("@/pages/GenrePage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-netflix-black"></div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/trending" component={TrendingPage} />
        <Route path="/popular" component={PopularPage} />
        <Route path="/movie/:id" component={MoviePage} />
        <Route path="/watch/:movieId" component={VideoPlayerPage} />
        <Route path="/genre/:id" component={GenrePage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;