import PropTypes from 'prop-types';
import './RecordButton.css';

const RecordButton = ({ onClick }) => {
    return (
        <button className="record-button glow" onClick={onClick}>
            <span className="record-icon">🎙️</span>
        </button>
    );
};

RecordButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default RecordButton;
