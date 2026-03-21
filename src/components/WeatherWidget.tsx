import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

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
  const theme = useTheme();

  useEffect(() => {
    if (!showWeather || !theme.weatherCity) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const city = encodeURIComponent(theme.weatherCity);
        
        // Step 1: Geocoding
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`
        );
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) throw new Error('Cidade não encontrada');
        
        const { latitude, longitude, name } = geoData.results[0];

        // Step 2: Forecast
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await weatherRes.json();
        const current = data.current;

        // WMO Weather interpretation
        const getDesc = (code: number) => {
          if (code === 0) return "Céu limpo";
          if (code >= 1 && code <= 3) return "Parcialmente nublado";
          if (code >= 45 && code <= 48) return "Nevoeiro";
          if (code >= 51 && code <= 67) return "Chuva leve";
          if (code >= 71 && code <= 82) return "Chuva forte";
          if (code >= 95) return "Tempestade";
          return "Limpo";
        };

        setWeather({
          temp: Math.round(current.temperature_2m),
          feels_like: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          wind_speed: current.wind_speed_10m,
          visibility: 10,
          description: getDesc(current.weather_code),
          icon: current.weather_code.toString(),
          city: name
        });
      } catch (error) {
        console.error('Erro ao buscar clima:', error);
        setWeather({
          temp: 24,
          feels_like: 26,
          humidity: 60,
          wind_speed: 10,
          visibility: 10,
          description: "Parcialmente nublado",
          icon: "0",
          city: theme.weatherCity
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showWeather, theme.weatherCity]);

  const getWeatherIcon = (codeStr: string) => {
    const code = parseInt(codeStr);
    if (code === 0) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-gray-400" />;
    if (code >= 51 && code <= 99) return <CloudRain className="w-4 h-4 text-blue-400" />;
    return <Sun className="w-4 h-4 text-yellow-400" />;
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
