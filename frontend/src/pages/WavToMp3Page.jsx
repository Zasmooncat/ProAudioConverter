import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import './SeoPage.css';

const faqs = [
    {
        q: 'Is it free to convert WAV to MP3?',
        a: 'Yes! Free users get 3 conversions per hour with files up to 60 MB. Upgrade to Premium for unlimited conversions and up to 500 MB file size.',
    },
    {
        q: 'Will I lose audio quality converting WAV to MP3?',
        a: 'MP3 is a lossy format, so some audio data is removed during compression. Choosing a higher bitrate (256 or 320 kbps) minimises quality loss and is indistinguishable to most listeners.',
    },
    {
        q: 'What bitrate should I choose?',
        a: '192 kbps is a good balance for most uses. 320 kbps is the highest quality MP3 and ideal for music archiving. 128 kbps is sufficient for voice recordings.',
    },
    {
        q: 'Will my files be stored permanently?',
        a: 'No. All uploaded and converted files are automatically deleted from our servers after 1 hour.',
    },
    {
        q: 'What is the maximum WAV file size?',
        a: 'Free users can convert files up to 60 MB. Premium users can upload files up to 500 MB.',
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

export default function WavToMp3Page() {
    return (
        <div className="seo-page page">
            <div className="container">
                <header className="seo-header">
                    <p className="seo-breadcrumb"><Link to="/">Home</Link> › WAV to MP3</p>
                    <h1 className="section-title">WAV to MP3 Converter</h1>
                    <p className="section-subtitle">
                        Convert uncompressed WAV audio to MP3 format online — free, instant, and secure.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Convert WAV to MP3 now <ArrowRight size={17} />
                    </Link>
                </header>

                <section className="seo-section">
                    <h2>What is WAV?</h2>
                    <p>
                        WAV (Waveform Audio File Format) is an uncompressed audio container developed by Microsoft and IBM.
                        WAV files store raw PCM audio data, preserving every detail of the original recording.
                        This makes WAV excellent for audio editing and production — but files are large, typically
                        10–50× bigger than equivalent MP3 files.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>What is MP3?</h2>
                    <p>
                        MP3 (MPEG-1 Audio Layer III) is the most widely supported compressed audio format in the world.
                        By removing audio frequencies that most people cannot hear, MP3 achieves file sizes 10–15× smaller
                        than WAV while maintaining excellent perceived quality. It plays on virtually every device, player,
                        and platform.
                    </p>
                </section>

                <section className="seo-section">
                    <h2>Why convert WAV to MP3?</h2>
                    <div className="seo-cards-grid">
                        {[
                            { title: 'Smaller files', body: 'MP3 files are up to 10× smaller, saving storage and bandwidth.' },
                            { title: 'Universal compatibility', body: 'MP3 plays on every device — phones, speakers, cars, web.' },
                            { title: 'Streaming & sharing', body: 'Great for online sharing, podcasts, and music distribution.' },
                            { title: 'Adjustable quality', body: 'Choose from 128 to 320 kbps to balance size and quality.' },
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
