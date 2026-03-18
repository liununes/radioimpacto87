const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
  ];
  
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) {
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
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  const articleSelectors = [
    /<article[\s\S]*?<\/article>/i,
    /<main[\s\S]*?<\/main>/i,
    /<div[^>]+(?:id|class)=["'](?:post-content|entry-content|article-content|content)["'][\s\S]*?<\/div>/i
  ];

  for (const selector of articleSelectors) {
    const match = text.match(selector);
    if (match) {
      text = match[0];
      break;
    }
  }

  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(text)) !== null) {
    const clean = match[1].replace(/<[^>]+>/g, '').trim();
    const final = clean.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Adicionando timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.google.com/',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return new Response(
          JSON.stringify({ success: false, error: `O site recusou a conexão (Erro ${response.status}).` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      let decoder = new TextDecoder('utf-8');
      let html = decoder.decode(arrayBuffer);
      
      if (html.includes('charset=iso-8859-1') || html.includes('charset=ISO-8859-1')) {
        decoder = new TextDecoder('iso-8859-1');
        html = decoder.decode(arrayBuffer);
      }

      const titulo = extractTitle(html);
      const resumo = extractDescription(html);
      const imagem = extractImage(html);
      const fonte = extractSiteName(html, formattedUrl);
      const conteudo = extractContent(html);

      return new Response(
        JSON.stringify({
          success: true,
          data: { titulo, resumo, imagem, fonte, conteudo, url: formattedUrl },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ success: false, error: 'O site demorou muito para responder (Timeout).' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error scraping:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Ocorreu um erro ao processar esta URL. Verifique o link.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
