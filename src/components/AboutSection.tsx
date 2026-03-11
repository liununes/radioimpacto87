import { MapPin, Phone, Mail, Info } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "radio_sobre";

const AboutSection = () => {
  const [data, setData] = useState<any>({
    titulo: "Impacto FM 87.9",
    descricao: "A sua rádio favorita, levando música e informação de qualidade para toda a região.",
    endereco: "",
    telefone: "",
    email: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          setData(parsed);
        }
      } catch (e) {
        console.error("Error parsing about data", e);
      }
    }
  }, []);

  if (!data) return null;

  return (
    <section id="sobre" className="py-16 bg-card/30">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground">
                Sobre a <span className="text-primary">{data.titulo || "Rádio"}</span>
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {data.descricao || "Bem-vindo à nossa rádio online. Levando a melhor programação até você!"}
            </p>
          </div>

          <div id="contato" className="space-y-8 bg-card p-8 rounded-2xl border border-border/50 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Informações de Contato</h3>
            
            <div className="space-y-6">
              {data.endereco && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Endereço</p>
                    <p className="text-muted-foreground">{data.endereco}</p>
                  </div>
                </div>
              )}

              {data.telefone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Telefone</p>
                    <p className="text-muted-foreground">{data.telefone}</p>
                  </div>
                </div>
              )}

              {data.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">E-mail</p>
                    <p className="text-muted-foreground">{data.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
