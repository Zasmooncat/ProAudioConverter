import { useState, useEffect } from 'react';
import './ProgressBar.css';

export default function ProgressBar({ uploadProgress, stage, error }) {
    const [simulatedProgress, setSimulatedProgress] = useState(50);

    useEffect(() => {
        if (stage === 'processing') {
            setSimulatedProgress(50);
            
            const interval = setInterval(() => {
                setSimulatedProgress(prev => {
                    // Slow down as we reach 99% to simulate heavy work
                    const increment = prev < 80 ? 2 : prev < 90 ? 1 : prev < 98 ? 0.2 : 0;
                    return prev >= 99 ? 99 : prev + increment;
                });
            }, 1000);
            
            return () => clearInterval(interval);
        }
    }, [stage]);

    // stage: null | 'uploading' | 'processing' | 'done' | 'error'
    const displayProgress = stage === 'uploading'
        ? Math.round(uploadProgress * 0.5)       // upload = 0–50%
        : stage === 'processing'
            ? Math.round(simulatedProgress)
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
