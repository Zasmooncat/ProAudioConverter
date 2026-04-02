import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import './SeoPage.css';

const faqs = [
    {
        q: 'Will I lose quality converting FLAC to WAV?',
        a: 'No. FLAC is lossless audio — it contains 100% of the original audio data. Converting to WAV simply unpacks the lossless data into an uncompressed container. There is zero quality loss.',
    },
    {
        q: 'Why is WAV larger than FLAC if quality is the same?',
        a: 'FLAC uses lossless compression to reduce file size while preserving every bit of audio data. WAV stores audio data raw and uncompressed, making it larger but identically audible.',
    },
    {
        q: 'When should I convert FLAC to WAV?',
        a: 'Use WAV when working with professional audio software that requires uncompressed audio, when your device or DAW does not support FLAC, or for maximum compatibility in broadcast and studio workflows.',
    },
    {
        q: 'Is the conversion instant?',
        a: 'For most file sizes, yes. The time depends on your file size and internet connection. Larger FLAC files may take a few more seconds.',
    },
    {
        q: 'Is it free?',
        a: 'Yes. Free users get 3 conversions per hour for files up to 60 MB. Premium gives you unlimited conversions and files up to 500 MB.',
    },
];

function FAQ({ items }) {
    const [open, setOpen] = useState(null);
    return (
        <div className="faq-list">
            {items.map((item, i) => (
                <div key={i} className="faq-item">
                    <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                        {item.q}
                        {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {open === i && <p className="faq-answer">{item.a}</p>}
                </div>
            ))}
        </div>
    );
}

export default function FlacToWavPage() {
    return (
        <div className="seo-page page">
            <div className="container">
                <header className="seo-header">
                    <p className="seo-breadcrumb"><Link to="/">Home</Link> › FLAC to WAV</p>
                    <h1 className="section-title">FLAC to WAV Converter</h1>
                    <p className="section-subtitle">
                        Convert lossless FLAC audio to uncompressed WAV format — free, instant, and secure.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Convert FLAC to WAV now <ArrowRight size={17} />
                    </Link>
                </header>

                <section className="seo-section">
                    <h2>What is FLAC?</h2>
                    <p>
                        FLAC (Free Lossless Audio Codec) is an open-source lossless audio format. It compresses audio
                        data without any quality loss — unlike MP3 or AAC. FLAC files are typically 40–60% smaller than
                        equivalent WAV files while sounding completely identical.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>What is WAV?</h2>
                    <p>
                        WAV (Waveform Audio File Format) stores raw, uncompressed PCM audio. Because it requires
                        no decoding step, WAV enjoys near-universal compatibility with professional audio software,
                        digital audio workstations (DAWs), and hardware playback devices.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>Why convert FLAC to WAV?</h2>
                    <div className="seo-cards-grid">
                        {[
                            { title: 'DAW compatibility', body: 'Some DAWs and plugins work exclusively with WAV/AIFF uncompressed formats.' },
                            { title: 'Hardware players', body: 'Older audiophile players and car stereos may not support FLAC.' },
                            { title: 'Zero quality loss', body: 'Both FLAC and WAV are lossless — the conversion is perfectly transparent.' },
                            { title: 'Broadcast workflows', body: 'Broadcast and mastering typically requires uncompressed WAV deliverables.' },
                        ].map(({ title, body }) => (
                            <div key={title} className="seo-info-card">
                                <strong>{title}</strong>
                                <p>{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="seo-section">
                    <h2>Frequently Asked Questions</h2>
                    <FAQ items={faqs} />
                </section>

                <div className="seo-cta">
                    <h2>Ready to convert?</h2>
                    <p>Free, no signup required. Your files are deleted after 1 hour.</p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Start converting <ArrowRight size={17} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
