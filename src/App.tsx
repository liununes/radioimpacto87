import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ThemeLoader from "@/components/ThemeLoader";
import Index from "./pages/Index";
import ProgramacaoPage from "./pages/ProgramacaoPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminStreaming from "./pages/admin/AdminStreaming";
import AdminAparencia from "./pages/admin/AdminAparencia";
import AdminLocutores from "./pages/admin/AdminLocutores";
import AdminProgramacao from "./pages/admin/AdminProgramacao";
import AdminSlides from "./pages/admin/AdminSlides";
import AdminFotos from "./pages/admin/AdminFotos";
import AdminNoticias from "./pages/admin/AdminNoticias";
import AdminSobre from "./pages/admin/AdminSobre";
import AdminEstatisticas from "./pages/admin/AdminEstatisticas";
import AdminUsuarios from "./pages/admin/AdminUsuarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeLoader />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/programacao" element={<ProgramacaoPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="streaming" element={<AdminStreaming />} />
              <Route path="aparencia" element={<AdminAparencia />} />
              <Route path="locutores" element={<AdminLocutores />} />
              <Route path="programacao" element={<AdminProgramacao />} />
              <Route path="slides" element={<AdminSlides />} />
              <Route path="fotos" element={<AdminFotos />} />
              <Route path="noticias" element={<AdminNoticias />} />
              <Route path="sobre" element={<AdminSobre />} />
              <Route path="estatisticas" element={<AdminEstatisticas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
