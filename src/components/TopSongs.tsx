import { Trophy, Music } from "lucide-react";
import { getThemeConfig } from "@/lib/themeStore";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/radioStore";

const songs = [
  { rank: 1, title: "Suave", artist: "Seu Jorge" },
  { rank: 2, title: "Evidências", artist: "Chitãozinho & Xororó" },
  { rank: 3, title: "Asa Branca", artist: "Luiz Gonzaga" },
];

const rankColors = [
  "from-yellow-500 to-amber-600",
  "from-gray-400 to-gray-500",
  "from-amber-700 to-amber-800",
];

const TopSongs = () => {
  const [theme, setTheme] = useState(getThemeConfig());

  useEffect(() => {
    const syncTheme = async () => {
      const saved = await getSiteConfig("theme");
      if (saved) setTheme(saved);
    };
    syncTheme();
  }, []);

  const alignment = theme.topSongsAlignment || 'center';
  const alignClass = alignment === 'left' ? 'mr-auto items-start' : alignment === 'right' ? 'ml-auto items-end' : 'mx-auto items-center';
  const textClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

  return (
    <section className="py-24 border-t border-white/5 bg-black/20">
      <div className="container mx-auto px-6">
        <div className={`max-w-4xl flex flex-col ${alignClass}`}>
          <div className={`flex flex-col gap-2 mb-16 ${textClass}`}>
             <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">As Favoritas</span>
            <div className={`flex items-center gap-4 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : ''}`}>
               <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_10px_#ff1e1e]" />
               <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                Top 3 <span className="text-primary italic">Explosão</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 w-full">
            {songs.map((song, i) => (
              <div
                key={song.rank}
                className="card-premium flex items-center gap-8 p-8 group hover:-translate-y-1 transition-all duration-500 bg-white/5 border-white/5 hover:border-primary/20"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br ${rankColors[i]} flex items-center justify-center text-3xl font-black italic text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                  {song.rank}°
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl md:text-3xl font-black italic text-white group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tighter">
                    {song.title}
                  </p>
                  <p className="text-sm md:text-lg font-black uppercase tracking-[0.2em] text-foreground/40 mt-1">{song.artist}</p>
                </div>
                <div className="hidden md:block">
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors">
                      <Music className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSongs;