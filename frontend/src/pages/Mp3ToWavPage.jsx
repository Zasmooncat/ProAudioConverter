import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import './SeoPage.css';

const faqs = [
    {
        q: 'Does converting MP3 to WAV improve quality?',
        a: 'No. MP3 is a lossy format — some audio data is permanently removed during encoding. Converting to WAV creates a lossless container of the MP3 data, but cannot restore the removed information. The audio sounds identical to the original MP3.',
    },
    {
        q: 'Why would I convert MP3 to WAV then?',
        a: 'The main reasons are software compatibility — some DAWs, video editors, and broadcast workflows require WAV input — and editability. WAV files are easier to work with in audio editors without introducing additional compression artefacts.',
    },
    {
        q: 'Which WAV bit depth should I choose?',
        a: '16-bit WAV is standard CD quality and is compatible with all playback software. 24-bit WAV offers a greater dynamic range and is preferred for music production and professional audio editing.',
    },
    {
        q: 'How long does the conversion take?',
        a: 'Most conversions complete in seconds. Conversion time depends on file size and server load.',
    },
    {
        q: 'Is my data safe?',
        a: 'Yes. Files are processed securely and automatically deleted from our servers after 1 hour.',
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

export default function Mp3ToWavPage() {
    return (
        <div className="seo-page page">
            <div className="container">
                <header className="seo-header">
                    <p className="seo-breadcrumb"><Link to="/">Home</Link> › MP3 to WAV</p>
                    <h1 className="section-title">MP3 to WAV Converter</h1>
                    <p className="section-subtitle">
                        Convert MP3 audio to uncompressed WAV format — free, instant, and secure.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Convert MP3 to WAV now <ArrowRight size={17} />
                    </Link>
                </header>

                <section className="seo-section">
                    <h2>What is MP3?</h2>
                    <p>
                        MP3 (MPEG-1 Audio Layer III) is the world&apos;s most popular compressed audio format. It uses
                        perceptual audio coding to remove sounds that are difficult for humans to hear, achieving
                        file sizes 8–10× smaller than uncompressed audio. Almost every device and platform supports MP3.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>What is WAV?</h2>
                    <p>
                        WAV (Waveform Audio File Format) is an uncompressed audio container that stores raw PCM audio data.
                        WAV files are large but lossless-compatible — perfect for professional audio production, editing,
                        and use in software that requires uncompressed input.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>Why convert MP3 to WAV?</h2>
                    <div className="seo-cards-grid">
                        {[
                            { title: 'Software compatibility', body: 'Many DAWs and audio editors import WAV natively and do not support MP3 input.' },
                            { title: 'Video editing', body: 'Video editors like Premiere Pro and DaVinci Resolve work best with WAV audio tracks.' },
                            { title: 'No further compression', body: 'Editing a WAV copy avoids re-encoding and introducing additional MP3 artefacts.' },
                            { title: 'Hardware compatibility', body: 'Some hardware samplers and broadcast equipment require WAV-format audio.' },
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
