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
    <section className="py-12 border-t border-border/10">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8 text-center">
            <Trophy className="w-8 h-8 text-secondary" />
            <h2 className="text-3xl font-display font-bold">
              Top 3 <span className="text-secondary">Mais Tocadas</span>
            </h2>
          </div>

          <div className="space-y-4 w-full">
            {songs.map((song, i) => (
              <div
                key={song.rank}
                className="card-glass flex items-center gap-6 p-5 hover:border-primary/30 transition-all group scale-100 hover:scale-[1.02] transform duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rankColors[i]} flex items-center justify-center text-xl font-bold text-foreground shadow-lg shrink-0`}>
                  {song.rank}°
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {song.title}
                  </p>
                  <p className="text-muted-foreground">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Request Music Button */}
          <div className="mt-10">
            <a
              href="https://wa.me/5500000000000?text=Olá! Gostaria de pedir uma música na Impacto FM 87.9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-green-600 hover:bg-green-700 text-foreground font-bold transition-all hover:scale-110 shadow-xl active:scale-95"
            >
              <MessageCircle className="w-6 h-6" />
              Pedir Música no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSongs;