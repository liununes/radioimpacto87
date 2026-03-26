import { useState, useEffect } from "react";
import { Music, MessageCircle, X, Send, User, Mic2, Heart, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWhatsApp } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PedidoSectionProps {
  position?: 'left' | 'center' | 'right';
}

const PedidoSection = ({ position = 'center' }: PedidoSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [nome, setNome] = useState("");
  const [musica, setMusica] = useState("");
  const [artista, setArtista] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const whatsappNum = await getWhatsApp();
      setWhatsapp(whatsappNum);
    };
    fetchWhatsApp();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !musica) {
      toast.error("Por favor, preencha pelo menos seu nome e a música!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("pedidos").insert([
      {
        nome,
        musica,
        artista,
        mensagem
      }
    ]);

    if (error) {
      toast.error("Erro ao enviar pedido. Tente novamente mais tarde.");
      console.error(error);
    } else {
      setSent(true);
      toast.success("Pedido enviado com sucesso! Fique ligado na programação.");
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        resetForm();
      }, 3000);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setNome(""); setMusica(""); setArtista(""); setMensagem("");
  };

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Sou o ${nome}. Quero pedir a música "${musica}" do artista "${artista}". ${mensagem}`)}`
    : "";

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`w-full flex ${positionClasses[position]} p-4`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="clube-btn-yellow flex items-center gap-3 h-14 px-8 rounded-none group hover:scale-105 transition-all"
        >
          <Music className="w-5 h-5 group-hover:animate-bounce" />
          <span className="font-black uppercase tracking-widest text-xs">Fazer Pedido Musical</span>
        </Button>
      ) : (
        <Card className="w-full max-w-lg rounded-none border-none shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
          <CardHeader className="bg-primary text-white p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-secondary p-2 rounded-none">
                 <Music className="w-6 h-6 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">O QUE VOCÊ <span className="text-secondary">QUER OUVIR?</span></CardTitle>
            <CardDescription className="text-white/60 font-medium uppercase text-[10px] tracking-widest">Peça agora e o DJ toca na sequência!</CardDescription>
          </CardHeader>
          <CardContent className="p-8 bg-white text-slate-900">
            {sent ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in slide-in-from-top-4">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Send className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic text-primary">PEDIDO ENVIADO!</h3>
                 <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Sua música já caiu no mural do nosso DJ. Fique ligado na Impacto FM!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><User className="w-3 h-3" /> Seu Nome</Label>
                    <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Como se chama?" className="rounded-none border-gray-100 h-12 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Mic2 className="w-3 h-3" /> Artista</Label>
                    <Input value={artista} onChange={e => setArtista(e.target.value)} placeholder="Quem canta?" className="rounded-none border-gray-100 h-12 font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Music className="w-3 h-3" /> Nome da Música</Label>
                  <Input value={musica} onChange={e => setMusica(e.target.value)} placeholder="Qual o hit de hoje?" className="rounded-none border-gray-100 h-12 font-medium" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Mande seu Recado</Label>
                  <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Ofereça para alguém especial..." className="rounded-none border-gray-100 min-h-[100px] font-medium" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="clube-btn-yellow h-14 rounded-none font-black uppercase text-[10px] tracking-widest gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar para o DJ
                  </Button>
                  
                  {whatsapp && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="outline" className="w-full h-14 rounded-none border-2 border-green-500 text-green-600 hover:bg-green-50 font-black uppercase text-[10px] tracking-widest gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Pedir no Zap
                      </Button>
                    </a>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PedidoSection;
