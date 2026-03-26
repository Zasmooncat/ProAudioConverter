import { useState, useEffect } from 'react';
import { Download, Crown, Zap, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Activity, Database, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { convertAudio, getDownloadUrl, createCheckout } from '../services/api';
import DropZone from '../components/DropZone';
import FormatSelector from '../components/FormatSelector';
import ProgressBar from '../components/ProgressBar';
import AdsBanner from '../components/AdsBanner';
import AuthModal from '../components/AuthModal';
import './HomePage.css';

const DEFAULT_QUALITY = { bitrate: '320k', bit_depth: '24' };

export default function HomePage() {
    const { user, isPremium } = useAuth();
    const [file, setFile] = useState(null);
    const [outputFormat, setOutputFormat] = useState('mp3');
    const [quality, setQuality] = useState(DEFAULT_QUALITY);
    const [stage, setStage] = useState(null);    // null | uploading | processing | done | error
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [downloadName, setDownloadName] = useState('');
    const [showAuth, setShowAuth] = useState(false);
    const [limitExceeded, setLimitExceeded] = useState(false);

    const maxSize = isPremium ? 500 * 1024 * 1024 : 50 * 1024 * 1024;

    // Reset conversion state when file changes
    useEffect(() => {
        if (file) {
            setStage(null);
            setError('');
            setDownloadUrl('');
            setLimitExceeded(false);
        }
    }, [file]);

    const handleConvert = async () => {
        if (!file) return;
        if (!outputFormat) { setError('Please select an output format.'); return; }

        setStage('uploading');
        setError('');
        setUploadProgress(0);
        setLimitExceeded(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('output_format', outputFormat);
        if (quality.bitrate && (outputFormat === 'mp3' || outputFormat === 'aac' || outputFormat === 'ogg')) {
            formData.append('bitrate', quality.bitrate);
        }
        if (quality.bit_depth && outputFormat === 'wav') {
            formData.append('bit_depth', quality.bit_depth);
        }

        try {
            const response = await convertAudio(formData, (evt) => {
                if (evt.total) setUploadProgress((evt.loaded / evt.total) * 100);
            });

            setStage('processing');
            // Small delay to show "Converting..." stage
            await new Promise((r) => setTimeout(r, 600));

            const { download_url, filename } = response.data;
            const fullUrl = getDownloadUrl(filename);
            // Derive a friendly name: original file stem + output extension
            const stem = file.name.replace(/\.[^.]+$/, '');
            const targetName = `${stem}.${outputFormat}`;
            // The backend now accepts ?name= to enforce Content-Disposition filename
            setDownloadUrl(`${fullUrl}?name=${encodeURIComponent(targetName)}`);
            setDownloadName(targetName);
            setStage('done');
        } catch (err) {
            const data = err.response?.data;
            setStage('error');
            if (data?.limit_exceeded) {
                setLimitExceeded(true);
                setError(data.error);
            } else {
                setError(data?.error || 'Conversion failed. Please try again.');
            }
        }
    };

    const handleUpgrade = async () => {
        if (!user) { setShowAuth(true); return; }
        try {
            const res = await createCheckout();
            window.location.href = res.data.checkout_url;
        } catch (e) {
            setError('Failed to open checkout. Please try again.');
        }
    };

    const handleReset = () => {
        setFile(null);
        setStage(null);
        setError('');
        setDownloadUrl('');
        setLimitExceeded(false);
        setOutputFormat('mp3');
        setQuality(DEFAULT_QUALITY);
    };

    const isConverting = stage === 'uploading' || stage === 'processing';

    return (
        <div className="homepage page">
            {/* ── Fullscreen Hero Segment ─────────────────────────────────────── */}
            <div className="hero-fullscreen-wrapper">
                {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
                <div className="left-column">
                    <section className="hero">
                        <div className="hero-badge">
                            <Sliders size={13} />
                            <span>Studio-Grade Audio Engine</span>
                        </div>
                        <h1 className="hero-title">
                            Pro Audio <span className="accent-text">Converter</span>
                        </h1>
                        <p className="hero-subtitle">
                            Pristine, high-fidelity format conversion for DJs, producers, and sound engineers.
                            WAV, FLAC, AIFF, MP3 320kbps, AAC, OGG.
                        </p>
                    </section>

                    {/* ── Main converter card ───────────────────────────────────────────── */}
                    <div className="converter-area">
                        {!isPremium && <AdsBanner />}

                        <div className="card converter-card">
                            {/* Step 1: Upload */}
                            <div className="step-section">
                                <label className="step-label">
                                    <span className="step-number">1</span>
                                    Upload your audio file
                                </label>
                                <DropZone
                                    file={file}
                                    onFileSelect={setFile}
                                    maxSize={maxSize}
                                    disabled={isConverting}
                                />
                                {!isPremium && (
                                    <p className="limit-hint">
                                        Free plan: up to 50 MB · 3 conversions/hour ·
                                        <button className="link-btn" onClick={handleUpgrade}> Upgrade for more</button>
                                    </p>
                                )}
                            </div>

                            <div className="divider" />

                            {/* Step 2: Format & quality */}
                            <div className="step-section">
                                <label className="step-label">
                                    <span className="step-number">2</span>
                                    Choose output format &amp; quality
                                </label>
                                <FormatSelector
                                    outputFormat={outputFormat}
                                    quality={quality}
                                    onFormatChange={setOutputFormat}
                                    onQualityChange={setQuality}
                                    disabled={isConverting}
                                />
                            </div>

                            <div className="divider" />

                            {/* Step 3: Convert / result */}
                            <div className="step-section">
                                <label className="step-label">
                                    <span className="step-number">3</span>
                                    Convert &amp; download
                                </label>

                                {/* Progress */}
                                {(stage === 'uploading' || stage === 'processing') && (
                                    <ProgressBar stage={stage} uploadProgress={uploadProgress} />
                                )}

                                {/* Done state */}
                                {stage === 'done' && (
                                    <div className="result-box">
                                        <div className="result-success">
                                            <CheckCircle2 size={20} className="result-icon" />
                                            <span>Conversion complete!</span>
                                        </div>
                                        <div className="result-actions">
                                            <a
                                                href={downloadUrl}
                                                download={downloadName}
                                                className="btn btn-primary btn-lg"
                                            >
                                                <Download size={18} /> Download {outputFormat.toUpperCase()}
                                            </a>
                                            <button className="btn btn-outline" onClick={handleReset}>
                                                <RefreshCw size={15} /> Convert another
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Limit exceeded */}
                                {limitExceeded && (
                                    <div className="limit-exceeded-box">
                                        <div className="alert alert-warning">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                        <button className="btn btn-primary" onClick={handleUpgrade}>
                                            <Crown size={16} /> Upgrade to Premium
                                        </button>
                                    </div>
                                )}

                                {/* General error */}
                                {stage === 'error' && !limitExceeded && (
                                    <div className="alert alert-error">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                {/* Convert button */}
                                {stage !== 'done' && (
                                    <button
                                        className="btn btn-primary btn-lg btn-full"
                                        onClick={handleConvert}
                                        disabled={!file || !outputFormat || isConverting}
                                    >
                                        {isConverting ? (
                                            <><span className="spinner" /> {stage === 'uploading' ? 'Uploading…' : 'Converting…'}</>
                                        ) : (
                                            <>Convert now <ArrowRight size={17} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FEATURE PILLS ────────────────────────────────────────────── */}
                <div className="hero-features">
                    <div className="hero-feature-item">
                        <Activity size={16} /> 24-bit Validated WAV
                    </div>
                    <div className="hero-feature-item">
                        <Zap size={16} /> Instant Processing
                    </div>
                    <div className="hero-feature-item">
                        <Database size={16} /> Lossless FLAC Archiving
                    </div>
                </div>

                {/* ── PREMIUM BANNER (full width, centered) ────────────────────── */}
                {!isPremium && (
                    <div className="premium-banner">
                        <div className="premium-banner-text">
                            <Crown size={32} className="premium-banner-icon" />
                            <div>
                                <strong>Unlock Professional Limits</strong>
                                <p>Unlimited file conversions, up to 500 MB uploads, completely ad-free, and priority processing queues.</p>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleUpgrade}>
                            Upgrade to Premium
                        </button>
                    </div>
                )}

                {/* ── SEO CARDS (3 columns, full width) ────────────────────────── */}
                <div className="seo-links">
                    <h2 className="seo-links-title">Industry Standard Conversions</h2>
                    <div className="seo-grid">
                        {[
                            { to: '/wav-to-mp3', label: 'WAV to MP3 320kbps', desc: 'DJ-ready MP3 promos instantly.' },
                            { to: '/flac-to-wav', label: 'FLAC to Uncompressed WAV', desc: 'Full 24-bit stems for your DAW.' },
                            { to: '/mp3-to-wav', label: 'MP3 to 16-bit WAV', desc: 'Standard 16-bit/44.1kHz WAV samplers.' },
                        ].map(({ to, label, desc }) => (
                            <Link key={to} to={to} className="seo-card">
                                <strong>{label}</strong>
                                <p>{desc}</p>
                                <span className="seo-card-arrow">Process Now →</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            </div>
        </div>
    );
}
