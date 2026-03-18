const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeta(html: string, property: string): string {
  // Try og: and twitter: and name= patterns with more flexibility for whitespace and variations
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*\\/?>`, 'i'), // For cases where it might be empty
  ];
  
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) {
      // Decode HTML entities
      return m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
    }
  }
  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractDescription(html: string): string {
  return extractMeta(html, 'og:description') || extractMeta(html, 'description') || extractMeta(html, 'twitter:description') || '';
}

function extractImage(html: string): string {
  return extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || extractMeta(html, 'image') || '';
}

function extractSiteName(html: string, url: string): string {
  const name = extractMeta(html, 'og:site_name');
  if (name) return name;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch { return ''; }
}

function extractContent(html: string): string {
  // Remove scripts, styles, nav, header, footer, etc
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '');

  // Try to find article content
  const articleSelectors = [
    /<article[\s\S]*?<\/article>/i,
    /<main[\s\S]*?<\/main>/i,
    /<div[^>]+id=["']content["'][\s\S]*?<\/div>/i,
    /<div[^>]+class=["'](?:post-content|entry-content|article-content)["'][\s\S]*?<\/div>/i
  ];

  for (const selector of articleSelectors) {
    const match = text.match(selector);
    if (match) {
      text = match[0];
      break;
    }
  }

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(text)) !== null) {
    const clean = match[1].replace(/<[^>]+>/g, '').trim();
    // Decode basic entities and clean up
    const final = clean
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (final.length > 40) paragraphs.push(final);
  }

  return paragraphs.slice(0, 10).join('\n\n') || '';
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Não foi possível acessar a URL. O site retornou erro ${response.status}.` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Check for encoding
    let decoder = new TextDecoder('utf-8');
    let html = decoder.decode(arrayBuffer);
    
    if (html.includes('charset=iso-8859-1') || html.includes('charset=ISO-8859-1') || html.includes('charset="iso-8859-1"')) {
      console.log('Detected ISO-8859-1 encoding');
      decoder = new TextDecoder('iso-8859-1');
      html = decoder.decode(arrayBuffer);
    }

    const titulo = extractTitle(html);
    const resumo = extractDescription(html);
    const imagem = extractImage(html);
    const fonte = extractSiteName(html, formattedUrl);
    const conteudo = extractContent(html);

    if (!titulo && !resumo && !conteudo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível detectar conteúdo nesta página. Pode ser um site que requer JavaScript.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      JSON.stringify({ success: false, error: 'Ocorreu um erro ao processar esta URL. Verifique o link e tente novamente.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
