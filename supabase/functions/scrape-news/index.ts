const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeta(html: string, property: string): string {
  // Try og: and twitter: and name= patterns
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractDescription(html: string): string {
  return extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
}

function extractImage(html: string): string {
  return extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '';
}

function extractSiteName(html: string, url: string): string {
  const name = extractMeta(html, 'og:site_name');
  if (name) return name;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch { return ''; }
}

function extractContent(html: string): string {
  // Remove scripts, styles, nav, header, footer
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Try to find article content
  const articleMatch = text.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch) text = articleMatch[0];

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(text)) !== null) {
    const clean = match[1].replace(/<[^>]+>/g, '').trim();
    if (clean.length > 30) paragraphs.push(clean);
  }

  return paragraphs.slice(0, 15).join('\n\n') || '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LovableBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Não foi possível acessar a URL (${response.status})` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    const titulo = extractTitle(html);
    const resumo = extractDescription(html);
    const imagem = extractImage(html);
    const fonte = extractSiteName(html, formattedUrl);
    const conteudo = extractContent(html);

    console.log('Scraped successfully:', { titulo, fonte, hasImage: !!imagem });

    return new Response(
      JSON.stringify({
        success: true,
        data: { titulo, resumo, imagem, fonte, conteudo, url: formattedUrl },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro ao processar URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
