import { useState, useEffect } from "react";
import { Music, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWhatsApp } from "@/lib/radioStore";

interface PedidoSectionProps {
  position?: 'left' | 'center' | 'right';
}

const PedidoSection = ({ position = 'center' }: PedidoSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const whatsappNum = await getWhatsApp();
      setWhatsapp(whatsappNum);
    };
    fetchWhatsApp();
  }, []);

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Quero fazer um pedido musical 🎵")}`
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
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Faça seu pedido musical diretamente pelo WhatsApp!
              </p>
              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para abrir o WhatsApp e enviar sua solicitação.
              </p>
            </div>
            {whatsapp ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4" />
                  Pedir no WhatsApp
                </Button>
              </a>
            ) : (
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  WhatsApp não configurado. Entre em contato com a administração.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PedidoSection;
