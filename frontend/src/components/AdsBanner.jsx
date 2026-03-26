import { useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import './AdsBanner.css';

export default function AdsBanner({ format = 'auto' }) {
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
    const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

    useEffect(() => {
        try {
            if (clientId && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, [clientId]);

    return (
        <div className="ads-banner-outer">
            <p className="ads-banner-label">
                <Megaphone size={12} /> Advertisement
            </p>
            
            {(clientId && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX') ? (
                <ins
                    className="adsbygoogle ads-banner-ins"
                    style={{ display: 'block' }}
                    data-ad-client={clientId}
                    data-ad-slot={slotId}
                    data-ad-format={format}
                    data-full-width-responsive="true"
                />
            ) : (
                <div className="ads-banner-fallback">
                    <Megaphone size={18} />
                    <span>Espacio Publicitario · <a href="/?upgrade=1">Hazte Premium para eliminar →</a></span>
                </div>
            )}
        </div>
    );
}
