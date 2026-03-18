const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    console.log('Fetching:', formattedUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ success: false, error: `Erro no site original (${response.status})` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Leitura limitada a 500kb para economizar memória
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Falha ao ler corpo da resposta');

    let html = '';
    const decoder = new TextDecoder('utf-8');
    let bytesRead = 0;

    while (bytesRead < 500000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytesRead += value.length;
    }
    html += decoder.decode();
    reader.releaseLock();
    clearTimeout(timeoutId);

    // Extração básica via regex
    const getMeta = (prop: string) => {
      const reg = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match = html.match(reg);
      if (match) return match[1];
      const regAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
      const matchAlt = html.match(regAlt);
      return matchAlt ? matchAlt[1] : '';
    };

    const titulo = getMeta('og:title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const resumo = getMeta('og:description') || getMeta('description') || '';
    const imagem = getMeta('og:image') || getMeta('twitter:image') || '';
    const fonte = getMeta('og:site_name') || new URL(formattedUrl).hostname.replace('www.', '');

    // Extração de conteúdo simplificada
    const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const conteudo = pMatches
      .map(p => p.replace(/<[^>]+>/g, '').trim())
      .filter(text => text.length > 50)
      .slice(0, 8)
      .join('\n\n');

    return new Response(
      JSON.stringify({
        success: true,
        data: { titulo, resumo, imagem, fonte, conteudo, url: formattedUrl }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    const message = error.name === 'AbortError' ? 'O site demorou demais para responder' : 'Erro ao processar URL';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
