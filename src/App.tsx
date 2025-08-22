import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MoodProvider } from "./contexts/MoodContext";
import { ChatProvider } from "./contexts/ChatContext";
import { AppProvider } from "./contexts/AppContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Journal from "./pages/Journal";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Playlist from "./pages/Playlist";
import MoodDetector from "./pages/MoodDetector";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <MoodProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/playlist" element={<Playlist />} />
                  <Route path="/mood-detector" element={<MoodDetector />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ChatProvider>
        </MoodProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
