
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navigation } from "@/components/Navigation";

const Index = lazy(() => import("@/pages/Index"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Courses = lazy(() => import("@/pages/Courses"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Timer = lazy(() => import("@/pages/Timer"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-6">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Index />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Tasks />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/courses"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Courses />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Analytics />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/timer"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Timer />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <Settings />
                        </Suspense>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <NotFound />
                        </Suspense>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
