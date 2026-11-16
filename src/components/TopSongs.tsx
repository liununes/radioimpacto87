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
    <section className="radio-top-songs py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-6">
        <div className="radio-top-songs-inner max-w-4xl flex flex-col mx-auto">
          <div className="radio-top-songs-heading flex flex-col gap-2 mb-12">
            <span className="radio-top-songs-kicker">
              <Trophy className="w-4 h-4" />
              AS MAIS PEDIDAS
            </span>
            <h2>
              {theme.labels.topSongsTitle}{" "}
              <span className="underline decoration-[var(--clube-yellow)]" style={{ color: "var(--text-detail)" }}>
                {theme.labels.topSongsSubtitle}
              </span>
            </h2>
          </div>

          <div className="radio-top-songs-grid">
            {songs.map((song) => (
              <a
                key={song.rank}
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="radio-song-card group"
                aria-label={`Ouvir ${song.title}, de ${song.artist}, em uma nova aba`}
              >
                <span className="radio-song-rank">{String(song.rank).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="radio-song-title line-clamp-2">{song.title}</p>
                  <p className="radio-song-artist">{song.artist}</p>
                </div>
                <span className="radio-song-link">
                  <Music className="w-4 h-4" />
                  Ouvir música
                  <ArrowUpRight className="w-4 h-4" />
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
