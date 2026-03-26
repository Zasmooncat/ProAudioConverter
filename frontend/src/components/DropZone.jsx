import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import './DropZone.css';

const ACCEPTED_TYPES = {
    'audio/*': ['.wav', '.mp3', '.flac', '.aac', '.ogg', '.m4a', '.aiff', '.alac'],
};

function formatBytes(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DropZone({ file, onFileSelect, maxSize, disabled }) {
    const onDrop = useCallback(
        (accepted) => {
            if (accepted[0]) onFileSelect(accepted[0]);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: maxSize || 500 * 1024 * 1024,
        maxFiles: 1,
        disabled,
    });

    const rejection = fileRejections[0];

    const clearFile = (e) => {
        e.stopPropagation();
        onFileSelect(null);
    };

    return (
        <div className="dropzone-wrapper">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="dropzone-file">
                        <FileAudio size={36} className="dropzone-file-icon" />
                        <div className="dropzone-file-info">
                            <span className="dropzone-filename">{file.name}</span>
                            <span className="dropzone-filesize">{formatBytes(file.size)}</span>
                        </div>
                        <button className="dropzone-clear" onClick={clearFile} aria-label="Remove file">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <div className="dropzone-icon-wrap">
                            <UploadCloud size={40} />
                        </div>
                        <p className="dropzone-main-text">
                            {isDragActive ? 'Drop it here!' : 'Drag & drop your audio file'}
                        </p>
                        <p className="dropzone-sub-text">
                            or <span className="dropzone-browse">click to browse</span>
                        </p>
                        <p className="dropzone-formats">
                            WAV · MP3 · FLAC · AAC · OGG · M4A · AIFF · ALAC
                        </p>
                    </div>
                )}
            </div>

            {rejection && (
                <p className="dropzone-error">
                    {rejection.errors[0]?.code === 'file-too-large'
                        ? `File is too large. Max ${formatBytes(maxSize)}`
                        : rejection.errors[0]?.message || 'Invalid file'}
                </p>
            )}
        </div>
    );
}
