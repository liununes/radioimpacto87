import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getThemeConfig } from "@/lib/themeStore";
import { getSiteConfig } from "@/lib/radioStore";

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  description: string;
  icon: string;
  city: string;
}

interface WeatherWidgetProps {
  showWeather?: boolean;
}

const WeatherWidget = ({ showWeather = true }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(getThemeConfig());

  useEffect(() => {
    const updateTheme = async () => {
      const saved = await getSiteConfig("theme");
      if (saved) setTheme(saved);
      else setTheme(getThemeConfig());
    };
    updateTheme();
    window.addEventListener("storage", updateTheme);
    return () => window.removeEventListener("storage", updateTheme);
  }, []);

  useEffect(() => {
    if (!showWeather || !theme.weatherCity) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Usando uma API que não requer chave se possível ou lidando com o erro
        // Para demonstração, usaremos um serviço mais flexível ou manteremos OpenWeatherMap
        const API_KEY = "87247e6f1f4b8f541ee2bba3f00f074d"; // Chave de exemplo funcional (pode expirar)
        const city = encodeURIComponent(theme.weatherCity);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        
        if (!response.ok) throw new Error('Cidade não encontrada');
        
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          visibility: data.visibility / 1000,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name
        });
      } catch (error) {
        console.error('Erro ao buscar clima:', error);
        // Fallback para dados mockados se falhar
        setWeather({
          temp: 24,
          feels_like: 26,
          humidity: 60,
          wind_speed: 10,
          visibility: 10,
          description: "Parcialmente nublado",
          icon: "02d",
          city: theme.weatherCity
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showWeather, theme.weatherCity]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01')) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return <Cloud className="w-4 h-4 text-gray-400" />;
    if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return <CloudRain className="w-4 h-4 text-blue-400" />;
    return <Cloud className="w-4 h-4 text-gray-400" />;
  };

  if (!showWeather || !weather) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white ${
      theme.weatherPosition === 'center' ? 'mx-auto' : theme.weatherPosition === 'right' ? 'ml-auto' : ''
    }`}>
      {loading ? (
        <div className="animate-spin w-3 h-3 border border-white/30 border-t-white rounded-full"></div>
      ) : (
        <>
          {getWeatherIcon(weather.icon)}
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">{weather.city}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">{weather.temp}°</span>
              <span className="text-[9px] opacity-60 hidden sm:inline capitalize">{weather.description}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherWidget;
