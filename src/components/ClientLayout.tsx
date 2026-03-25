import Navigation from "./Navigation";
import Footer from "./Footer";
import RadioPlayer from "./RadioPlayer";
import BackToTop from "./BackToTop";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const ClientLayout = () => {
  const theme = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 dark:text-white overflow-x-hidden transition-colors duration-500">
      <Navigation />
      <main className="relative z-10 min-h-[60vh]">
        <Outlet />
      </main>
      <BackToTop />
      <Footer />
      <RadioPlayer />
    </div>
  );
};

export default ClientLayout;
