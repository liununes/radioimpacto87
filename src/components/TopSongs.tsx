import { Trophy, MessageCircle } from "lucide-react";

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
  return (
    <section className="py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-display font-bold">
                Top 3 <span className="text-secondary">Mais Tocadas</span>
              </h2>
            </div>

            <div className="space-y-3">
              {songs.map((song, i) => (
                <div
                  key={song.rank}
                  className="card-glass flex items-center gap-4 p-4 hover:border-primary/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rankColors[i]} flex items-center justify-center text-sm font-bold text-foreground`}>
                    {song.rank}°
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {song.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Music Button */}
          <a
            href="https://wa.me/5500000000000?text=Olá! Gostaria de pedir uma música na Impacto FM 87.9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-foreground font-semibold transition-all hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Pedir Música
          </a>
        </div>
      </div>
    </section>
  );
};

export default TopSongs;