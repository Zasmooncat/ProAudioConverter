import './ProgressBar.css';

const STAGES = ['Uploading', 'Processing', 'Finalizing'];

export default function ProgressBar({ uploadProgress, stage, error }) {
    // stage: null | 'uploading' | 'processing' | 'done' | 'error'
    const displayProgress = stage === 'uploading'
        ? Math.round(uploadProgress * 0.5)       // upload = 0–50%
        : stage === 'processing'
            ? 60 + Math.round(Math.random() * 20)    // shown as 60–80%
            : stage === 'done' ? 100 : 0;

    const stageName =
        stage === 'uploading' ? 'Uploading...' :
            stage === 'processing' ? 'Converting...' :
                stage === 'done' ? 'Done!' :
                    stage === 'error' ? 'Error' : '';

    return (
        <div className="progressbar-wrapper">
            <div className="progressbar-header">
                <span className="progressbar-label">{stageName}</span>
                {stage && stage !== 'error' && (
                    <span className="progressbar-pct">{displayProgress}%</span>
                )}
            </div>
            <div className="progressbar-track">
                <div
                    className={`progressbar-fill ${stage === 'error' ? 'error' : ''} ${stage === 'done' ? 'done' : ''}`}
                    style={{ width: stage === 'error' ? '100%' : `${displayProgress}%` }}
                />
            </div>
            {error && <p className="progressbar-error">{error}</p>}
        </div>
    );
}
