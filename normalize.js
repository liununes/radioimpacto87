const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminAparencia.tsx', 'utf-8');

// Header Block
content = content.replace(/<div className=\"relative overflow-hidden rounded-none[\s\S]*?<\/div>\\s*<\/div>/, 
`<div className="bg-card text-card-foreground p-6 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-2">
             <CheckCircle2 className="w-3 h-3" /> Design Ativo
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Aparência do Site</h2>
          <p className="text-sm font-medium text-muted-foreground">Personalize as cores, fotos e layout do portal.</p>
        </div>
        <Button onClick={handleSave} className="bg-primary text-primary-foreground gap-2 px-6 h-11 rounded-lg font-semibold text-sm shadow-sm transition-all hover:opacity-90" disabled={loading}>
          <Save className="w-4 h-4" /> {loading ? "Processando..." : "Publicar Mudanças"}
        </Button>
      </div>`);

// TabsList Block
content = content.replace(/<TabsList className=\"bg-white text-slate-900 p-1\.5 h-auto rounded-none border border-gray-100 shadow-xl gap-1 flex-wrap justify-center text-slate-400 max-w-7xl\">[\s\S]*?<\/TabsList>/, 
`<TabsList className="bg-muted/50 p-1 rounded-xl h-auto gap-1 flex-wrap justify-center max-w-full">
            {(isSuperAdmin || hasPermission('aparencia_visual')) && (
                <TabsTrigger value="visual" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <Palette className="w-4 h-4 mr-2" /> Visual
                </TabsTrigger>
            )}
            {(isSuperAdmin || hasPermission('aparencia_textos')) && (
                <TabsTrigger value="textos" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <Type className="w-4 h-4 mr-2" /> Texto & Cores
                </TabsTrigger>
            )}
            {(isSuperAdmin || hasPermission('aparencia_menus')) && (
                <TabsTrigger value="menus" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <ExternalLink className="w-4 h-4 mr-2" /> Menu
                </TabsTrigger>
            )}
            {(isSuperAdmin || hasPermission('aparencia_layout')) && (
                <TabsTrigger value="layout" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <Layout className="w-4 h-4 mr-2" /> Design
                </TabsTrigger>
            )}
            {(isSuperAdmin || hasPermission('visibilidade')) && (
                <TabsTrigger value="visibilidade" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <Eye className="w-4 h-4 mr-2" /> Visibilidade
                </TabsTrigger>
            )}
            {isSuperAdmin && (
                <TabsTrigger value="whitelabel" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-semibold">
                  <Settings className="w-4 h-4 mr-2" /> White Label
                </TabsTrigger>
            )}
           </TabsList>`);

// Card Headers and Content cleanup
content = content.replace(/rounded-none border-none shadow-xl bg-white text-slate-900 border border-gray-100/g, 'rounded-xl border border-border shadow-sm bg-card text-card-foreground');
content = content.replace(/rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100/g, 'rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden');
content = content.replace(/bg-orange-600 p-8 text-white/g, 'p-6 border-b border-border bg-muted/30');
content = content.replace(/bg-emerald-600 p-8 text-white/g, 'p-6 border-b border-border bg-muted/30');
content = content.replace(/bg-purple-600 p-8 text-white/g, 'p-6 border-b border-border bg-muted/30');
content = content.replace(/bg-red-600 p-8 text-white/g, 'p-6 border-b border-border bg-red-50 text-red-600');
content = content.replace(/bg-primary\/5 p-8 border-b border-gray-100\/50/g, 'p-6 border-b border-border bg-muted/30');

// General Typography & Elements
content = content.replace(/font-black uppercase tracking-widest text-gray-400/g, 'font-semibold text-muted-foreground');
content = content.replace(/text-\[10px\] font-black uppercase tracking-widest text-slate-700/g, 'text-xs font-semibold text-foreground');
content = content.replace(/text-\[10px\] font-black uppercase text-gray-400/g, 'text-xs font-semibold text-muted-foreground');
content = content.replace(/text-\[9px\] font-black uppercase text-gray-400/g, 'text-xs font-semibold text-muted-foreground');
content = content.replace(/font-black uppercase tracking-tight/g, 'font-bold tracking-tight');
content = content.replace(/rounded-none/g, 'rounded-lg');
content = content.replace(/border-4 border-gray-50/g, 'border border-border');
content = content.replace(/w-full h-12 rounded-lg cursor-pointer/g, 'w-full h-10 rounded-lg cursor-pointer p-0.5 bg-background shadow-sm border border-border');
content = content.replace(/w-full h-10 rounded-lg cursor-pointer/g, 'w-full h-10 rounded-lg cursor-pointer p-0.5 bg-background shadow-sm border border-border');
content = content.replace(/w-16 h-16 rounded-lg cursor-pointer/g, 'w-10 h-10 rounded-lg cursor-pointer p-0.5 bg-background shadow-sm border border-border');
content = content.replace(/text-\[9px\] text-gray-400 font-bold/g, 'text-xs text-muted-foreground font-medium');
content = content.replace(/p-8 pt-4/g, 'p-6');
content = content.replace(/p-8/g, 'p-6');

// Text Colors
content = content.replace(/text-slate-900/g, 'text-foreground');
content = content.replace(/text-slate-700/g, 'text-muted-foreground');
content = content.replace(/text-white\/60/g, 'text-muted-foreground');

// Fix text inside the formerly colored blocks
content = content.replace(/<h3 className=\"text-xl font-black uppercase italic tracking-tighter/g, '<h3 className=\"text-lg font-bold');

// Empty classes
content = content.replace(/text-xs font-medium mt-1 uppercase tracking-widest/g, 'text-sm text-foreground/70 font-medium mt-1');
content = content.replace(/text-\[10px\] text-slate-500 font-bold uppercase tracking-widest/g, 'text-xs text-muted-foreground font-medium');

// Write back
fs.writeFileSync('src/pages/admin/AdminAparencia.tsx', content);

// Also apply to Danger Zone to be completely sure
if (fs.existsSync('src/pages/admin/AdminDangerZone.tsx')) {
    let danger = fs.readFileSync('src/pages/admin/AdminDangerZone.tsx', 'utf-8');
    danger = danger.replace(/bg-red-600/g, 'bg-red-50 text-red-600 border border-red-100');
    danger = danger.replace(/text-white/g, 'text-red-700');
    danger = danger.replace(/rounded-none/g, 'rounded-xl');
    danger = danger.replace(/font-black uppercase/g, 'font-bold');
    fs.writeFileSync('src/pages/admin/AdminDangerZone.tsx', danger);
}

console.log('Styles normalized!');
