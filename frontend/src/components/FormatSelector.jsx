import './FormatSelector.css';

const FORMAT_OPTIONS = [
    { value: 'mp3', label: 'MP3 — Compressed (universal)' },
    { value: 'wav', label: 'WAV — Uncompressed (high quality)' },
    { value: 'flac', label: 'FLAC — Lossless compressed' },
    { value: 'aac', label: 'AAC — Compressed (Apple/mobile)' },
    { value: 'ogg', label: 'OGG — Open compressed format' },
];

const BITRATE_OPTIONS = ['128k', '192k', '256k', '320k'];
const BIT_DEPTH_OPTIONS = ['16', '24'];

export default function FormatSelector({ outputFormat, quality, onFormatChange, onQualityChange, disabled }) {
    return (
        <div className="format-selector">
            <div className="form-group">
                <label className="form-label">Output Format</label>
                <div className="select-wrapper">
                    <select
                        id="output-format"
                        className="form-select"
                        value={outputFormat}
                        onChange={(e) => onFormatChange(e.target.value)}
                        disabled={disabled}
                    >
                        <option value="">— Select format —</option>
                        {FORMAT_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* MP3 / AAC / OGG → bitrate */}
            {(outputFormat === 'mp3' || outputFormat === 'aac' || outputFormat === 'ogg') && (
                <div className="form-group">
                    <label className="form-label">Bitrate</label>
                    <div className="quality-pills">
                        {BITRATE_OPTIONS.map((b) => (
                            <button
                                key={b}
                                className={`quality-pill ${quality.bitrate === b ? 'active' : ''}`}
                                onClick={() => onQualityChange({ ...quality, bitrate: b })}
                                disabled={disabled}
                                type="button"
                            >
                                {b.replace('k', ' kbps')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* WAV → bit depth */}
            {outputFormat === 'wav' && (
                <div className="form-group">
                    <label className="form-label">Bit Depth</label>
                    <div className="quality-pills">
                        {BIT_DEPTH_OPTIONS.map((d) => (
                            <button
                                key={d}
                                className={`quality-pill ${quality.bit_depth === d ? 'active' : ''}`}
                                onClick={() => onQualityChange({ ...quality, bit_depth: d })}
                                disabled={disabled}
                                type="button"
                            >
                                {d}-bit
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FLAC → info only */}
            {outputFormat === 'flac' && (
                <p className="format-info">
                    ✦ FLAC is lossless — no quality settings needed
                </p>
            )}
        </div>
    );
}
