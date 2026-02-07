import PropTypes from 'prop-types';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange }) => {
    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'trending', icon: '🔥', label: 'Trending' },
        { id: 'rooms', icon: '💬', label: 'Rooms' },
        { id: 'profile', icon: '👤', label: 'Profile' }
    ];

    return (
        <nav className="bottom-navigation safe-bottom">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => onViewChange(item.id)}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

Navigation.propTypes = {
    currentView: PropTypes.string.isRequired,
    onViewChange: PropTypes.func.isRequired
};

export default Navigation;
