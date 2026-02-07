import { useEffect, useRef } from 'prop-types';
import PropTypes from 'prop-types';
import './Waveform.css';

const Waveform = ({ data, isPlaying, currentTime, duration }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Generate waveform data if not provided
        const waveformData = data.length > 0 ? data : generateDummyWaveform(50);

        const barWidth = width / waveformData.length;
        const progress = duration > 0 ? currentTime / duration : 0;

        waveformData.forEach((value, index) => {
            const barHeight = (value * height * 0.8) || (Math.random() * height * 0.5);
            const x = index * barWidth;
            const y = (height - barHeight) / 2;

            // Color based on progress
            const isPassed = (index / waveformData.length) <= progress;

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            if (isPassed && isPlaying) {
                gradient.addColorStop(0, '#7c3aed');
                gradient.addColorStop(1, '#ec4899');
            } else {
                gradient.addColorStop(0, '#2a2a3c');
                gradient.addColorStop(1, '#1f1f2e');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    }, [data, isPlaying, currentTime, duration]);

    const generateDummyWaveform = (count) => {
        return Array.from({ length: count }, () => Math.random() * 0.8 + 0.2);
    };

    return (
        <div className="waveform-container">
            <canvas
                ref={canvasRef}
                className="waveform-canvas"
                width={600}
                height={80}
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
