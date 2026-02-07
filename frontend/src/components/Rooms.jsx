import './Rooms.css';

const Rooms = () => {
    return (
        <div className="rooms-container">
            <header className="rooms-header">
                <h1 className="gradient-text">💬 Sesli Odalar</h1>
                <p className="rooms-subtitle">Canlı sohbetlere katıl</p>
            </header>

            <div className="rooms-content">
                <div className="coming-soon">
                    <div className="coming-soon-icon">🎙️</div>
                    <h2>Yakında!</h2>
                    <p>Sesli odalar özelliği çok yakında geliyor.</p>
                    <p className="feature-list">
                        ✨ Canlı sesli sohbetler<br />
                        👥 Sırayla konuşma sistemi<br />
                        🎭 Anonim katılım<br />
                        🔥 Trend odalar
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Rooms;
