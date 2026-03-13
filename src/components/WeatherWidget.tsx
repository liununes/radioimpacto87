import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getThemeConfig } from "@/lib/themeStore";

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
    const updateTheme = () => setTheme(getThemeConfig());
    window.addEventListener("storage", updateTheme);
    return () => window.removeEventListener("storage", updateTheme);
  }, []);

  useEffect(() => {
    if (!showWeather || !theme.weatherCity) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Usando OpenWeatherMap API (gratuita para uso básico)
        const API_KEY = "YOUR_API_KEY"; // Você precisará adicionar uma chave
        const city = encodeURIComponent(theme.weatherCity);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        
        if (!response.ok) {
          throw new Error('Cidade não encontrada');
        }
        
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          visibility: data.visibility / 1000, // Convert to km
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name
        });
      } catch (error) {
        console.error('Erro ao buscar clima:', error);
        // Dados mock para demonstração
        setWeather({
          temp: 28,
          feels_like: 30,
          humidity: 65,
          wind_speed: 12,
          visibility: 10,
          description: "céu limpo",
          icon: "01d",
          city: theme.weatherCity
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showWeather, theme.weatherCity]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01')) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return <Cloud className="w-6 h-6 text-gray-400" />;
    if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return <CloudRain className="w-6 h-6 text-blue-400" />;
    return <Cloud className="w-6 h-6 text-gray-400" />;
  };

  if (!showWeather) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-400/20 to-blue-600/20 border-blue-300/30">
      <CardContent className="p-3">
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : weather ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.icon)}
              <div>
                <h3 className="text-sm font-semibold text-foreground">{weather.city}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{weather.temp}°C</span>
                  <span className="text-xs text-muted-foreground capitalize">{weather.description}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-gray-500" />
                <span>{weather.wind_speed}km/h</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-16 flex items-center justify-center">
            <Cloud className="w-6 h-6 mx-auto mr-2 opacity-50" />
            <p className="text-xs">Clima indisponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
