import { Trophy, Music, ArrowUpRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const songs = [
  { rank: 1, title: "Suave", artist: "Seu Jorge", url: "https://www.youtube.com/results?search_query=seu+jorge+suave" },
  { rank: 2, title: "Evidências", artist: "Chitãozinho & Xororó", url: "https://www.youtube.com/results?search_query=chitaozinho+e+xororo+evidencias" },
  { rank: 3, title: "Asa Branca", artist: "Luiz Gonzaga", url: "https://www.youtube.com/results?search_query=luiz+gonzaga+asa+branca" },
];

const TopSongs = () => {
  const theme = useTheme();

  return (
    <section className="radio-top-songs w-full py-14 md:py-16 border-y border-gray-100 dark:border-slate-700">
      <div className="container mx-auto max-w-7xl px-5 md:px-8">
        <div className="w-full">
          <div className="mb-8 md:mb-10 flex flex-col items-start gap-2 text-left">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[.22em] text-amber-700 dark:text-amber-300">
              <Trophy className="h-4 w-4" />
              AS MAIS PEDIDAS
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[#002e5d] dark:text-white">
              {theme.labels.topSongsTitle}{" "}
              <span className="underline decoration-[#ffdf4d] decoration-4 underline-offset-4 text-[#b77900] dark:text-amber-300">
                {theme.labels.topSongsSubtitle}
              </span>
            </h2>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {songs.map((song) => (
              <a
                key={song.rank}
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-h-[190px] flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border p-5 md:p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
                  song.rank === 1
                    ? "border-[#0757a6] bg-gradient-to-br from-[#002e5d] to-[#0757a6] text-white"
                    : song.rank === 2
                    ? "border-amber-300 bg-gradient-to-br from-[#fffdf0] to-[#fff0a8] text-[#002e5d] dark:border-amber-700 dark:from-[#45402a] dark:to-[#514526] dark:text-white"
                    : "border-blue-200 bg-gradient-to-br from-[#f1f6fc] to-[#dce9f8] text-[#002e5d] dark:border-slate-600 dark:from-[#263b55] dark:to-[#304d70] dark:text-white"
                }`}
                aria-label={`Ouvir ${song.title}, de ${song.artist}, em uma nova aba`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-black shadow-md ${
                  song.rank === 2
                    ? "bg-[#002e5d] text-white"
                    : song.rank === 3
                    ? "bg-[#f3a712] text-[#002e5d]"
                    : "bg-[#ffdf4d] text-[#002e5d]"
                }`}>
                  {String(song.rank).padStart(2, "0")}
                </span>

                <div className="min-w-0 w-full">
                  <p className="text-xl md:text-2xl font-black leading-tight tracking-tight line-clamp-2">{song.title}</p>
                  <p className={`mt-2 text-xs font-extrabold uppercase tracking-[.12em] ${
                    song.rank === 1 ? "text-blue-100" : "text-slate-600 dark:text-slate-200"
                  }`}>{song.artist}</p>
                </div>

                <span className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.1em] ${
                  song.rank === 1 ? "text-[#ffdf4d]" : "text-[#002e5d] dark:text-amber-200"
                }`}>
                  <Music className="h-4 w-4" />
                  Ouvir música
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSongs;
