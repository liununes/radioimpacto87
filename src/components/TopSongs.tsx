import { Trophy, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

const songs = [
  { rank: 1, title: "Suave", artist: "Seu Jorge", url: "https://www.youtube.com/results?search_query=seu+jorge+suave" },
  { rank: 2, title: "Evidências", artist: "Chitãozinho & Xororó", url: "https://www.youtube.com/results?search_query=chitaozinho+e+xororo+evidencias" },
  { rank: 3, title: "Asa Branca", artist: "Luiz Gonzaga", url: "https://www.youtube.com/results?search_query=luiz+gonzaga+asa+branca" },
];

const rankColors = [
  "bg-accent",
  "bg-gray-400",
  "bg-gray-300",
];

const TopSongs = () => {
  const theme = useTheme();

  const alignment = theme.topSongsAlignment || 'center';
  const alignClass = alignment === 'left' ? 'mr-auto items-start' : alignment === 'right' ? 'ml-auto items-end' : 'mx-auto items-center';
  const textClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';


  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6">
        <div className={`max-w-4xl flex flex-col ${alignClass}`}>
          <div className={`flex flex-col gap-2 mb-12 ${textClass}`}>
             <span className="text-accent font-black uppercase tracking-[0.5em] text-[10px]">AS MAIS PEDIDAS</span>
             <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-none">
                {theme.labels.topSongsTitle} <span className="text-accent underline decoration-[var(--clube-yellow)]">{theme.labels.topSongsSubtitle}</span>
              </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            {songs.map((song, i) => (
              <div
                key={song.rank}
                className="flex items-center gap-6 p-6 md:p-8 group hover:bg-gray-50 transition-all duration-300 border border-gray-100 rounded-3xl"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${rankColors[i]} flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg`}>
                  {song.rank}°
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl md:text-2xl font-black text-primary group-hover:text-accent transition-colors line-clamp-1 uppercase tracking-tight">
                    {song.title}
                  </p>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-[0.1em] text-gray-400 mt-1">{song.artist}</p>
                </div>
                <a 
                  href={song.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden md:flex w-12 h-12 rounded-full border border-gray-200 items-center justify-center group-hover:border-accent group-hover:bg-accent transition-all"
                >
                   <Music className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSongs;