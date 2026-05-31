import { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './Waveform.css';

const Waveform = ({ data, isPlaying, currentTime, duration }) => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const phaseRef = useRef(0);

    // Generate stable waveform data from provided data or create dummy
    const stableWaveform = useMemo(() => {
        if (data && data.length > 0) return data;
        // Deterministic dummy waveform
        return Array.from({ length: 40 }, (_, i) => {
            const seed = Math.sin(i * 2.5) * 0.4 + Math.cos(i * 1.2) * 0.3 + 0.5;
            return Math.max(0.1, Math.min(1.0, seed));
        });
    }, [data]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const progress = duration > 0 ? currentTime / duration : 0;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            const barWidth = width / stableWaveform.length;

            stableWaveform.forEach((value, index) => {
                const isPassed = (index / stableWaveform.length) <= progress;

                // Animate played portion while playing
                let heightMultiplier = value;
                if (isPassed && isPlaying) {
                    heightMultiplier = value * (0.85 + Math.sin(phaseRef.current + index * 0.5) * 0.15);
                }

                const barHeight = Math.max(4, heightMultiplier * height * 0.85);
                const x = index * barWidth;
                const y = (height - barHeight) / 2;

                const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                if (isPassed && isPlaying) {
                    gradient.addColorStop(0, '#c084fc'); // purple
                    gradient.addColorStop(0.5, '#a855f7');
                    gradient.addColorStop(1, '#ec4899'); // pink
                } else if (isPassed) {
                    gradient.addColorStop(0, '#6d28d9');
                    gradient.addColorStop(1, '#be185d');
                } else {
                    gradient.addColorStop(0, '#2d2d45');
                    gradient.addColorStop(1, '#1e1e30');
                }

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x + 1, y, barWidth - 3, barHeight, 2);
                ctx.fill();
            });
        };

        if (isPlaying) {
            const animate = () => {
                phaseRef.current += 0.08;
                draw();
                animFrameRef.current = requestAnimationFrame(animate);
            };
            animFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            draw();
        }

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
    }, [stableWaveform, isPlaying, currentTime, duration]);

    return (
        <div className="waveform-container">
            <canvas
                ref={canvasRef}
                className="waveform-canvas"
                width={500}
                height={72}
            />
        </div>
    );
};

Waveform.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    isPlaying: PropTypes.bool,
    currentTime: PropTypes.number,
    duration: PropTypes.number
};

Waveform.defaultProps = {
    data: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0
};

export default Waveform;

