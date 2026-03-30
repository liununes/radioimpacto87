import { useEffect } from "react";
import { applyTheme, getThemeConfig, saveThemeConfig } from "@/lib/themeStore";
import { getSiteConfig } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";

/** Loads and applies saved theme on mount */
const ThemeLoader = () => {
  useEffect(() => {
    // Apply local theme immediately for no flash
    applyTheme(getThemeConfig());

    // Then sync with Supabase
    const syncTheme = async () => {
      const [saved, radioConfig] = await Promise.all([
        getSiteConfig("theme"),
        getSiteConfig("streaming")
      ]);

      if (saved) {
        applyTheme(saved);
        saveThemeConfig(saved);
      }

      if (radioConfig?.favicon) {
        // Favicon principal
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = radioConfig.favicon;

        // Apple Touch Icon
        let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
        appleLink.href = radioConfig.favicon;
      }
    };
    syncTheme();

    /** REAL TIME Presence for Online Statistics. Track each unique device. */
    const isInternalUser = window.location.pathname.startsWith('/admin');
    
    // Don't track admin pages to show clean audience data
    if (!isInternalUser) {
        const sessionId = localStorage.getItem('siteSessionId') || crypto.randomUUID();
        if (!localStorage.getItem('siteSessionId')) localStorage.setItem('siteSessionId', sessionId);

        /** USAR SESSION ID COMO CHAVE ÚNICA DE PRESENÇA */
        const channel = supabase.channel('online_presence', {
            config: { presence: { key: sessionId } }
        });

        let currentListening = false;

        const trackStatus = async (listening: boolean) => {
            currentListening = listening;
            try {
                await channel.track({ 
                    id: sessionId,
                    is_listening: listening,
                    online_at: new Date().toISOString()
                });
            } catch (err) {
                console.error("Presence error:", err);
            }
        };

        channel
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await trackStatus(currentListening);
            }
          });

        // Event listener to react to play/pause from any component
        const handlePlayState = (e: any) => {
            const isPlaying = !!e.detail?.isPlaying;
            trackStatus(isPlaying);
        };

        window.addEventListener('radio-play-state', handlePlayState as any);
        
        return () => {
            window.removeEventListener('radio-play-state', handlePlayState as any);
            channel.unsubscribe();
        };
    }

    return () => {
      // Nenhum cleanup global necessário além do que já está nos ifs
    };
  }, []);
  return null;
};

export default ThemeLoader;
