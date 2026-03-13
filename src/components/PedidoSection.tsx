import { useState } from "react";
import { Music, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PedidoSectionProps {
  position?: 'left' | 'center' | 'right';
}

const PedidoSection = ({ position = 'center' }: PedidoSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    musica: '',
    artista: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.musica.trim()) {
      toast.error("Por favor, informe o nome da música.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("pedidos").insert({
        nome: formData.nome.trim() || null,
        musica: formData.musica.trim(),
        artista: formData.artista.trim() || null,
        status: 'pendente'
      });

      if (error) {
        toast.error("Erro ao enviar pedido: " + error.message);
      } else {
        toast.success("Pedido musical enviado com sucesso! 🎵");
        setFormData({ nome: '', musica: '', artista: '' });
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          size="lg"
        >
          <Music className="w-5 h-5" />
          Fazer Pedido Musical
        </Button>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Pedido Musical
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Seu Nome (opcional)</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu nome"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="musica">Nome da Música *</Label>
                <Input
                  id="musica"
                  value={formData.musica}
                  onChange={(e) => setFormData(prev => ({ ...prev, musica: e.target.value }))}
                  placeholder="Nome da música"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="artista">Artista (opcional)</Label>
                <Input
                  id="artista"
                  value={formData.artista}
                  onChange={(e) => setFormData(prev => ({ ...prev, artista: e.target.value }))}
                  placeholder="Nome do artista/banda"
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PedidoSection;
