import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const AdminNoticias = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Notícias</h2>
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Gerenciamento de notícias em breve.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Aqui você poderá criar e editar notícias locais e regionais.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNoticias;
