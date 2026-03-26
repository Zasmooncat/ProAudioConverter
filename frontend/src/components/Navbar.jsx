import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Crown, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isPremium } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-logo">
                        <Activity size={22} className="navbar-logo-icon" />
                        <span>Pro Audio Converter</span>
                    </Link>

                    <button className="navbar-menu-btn" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                        <Link to="/wav-to-mp3" onClick={() => setMenuOpen(false)}>WAV→MP3</Link>
                        <Link to="/flac-to-wav" onClick={() => setMenuOpen(false)}>FLAC→WAV</Link>
                        <Link to="/mp3-to-wav" onClick={() => setMenuOpen(false)}>MP3→WAV</Link>
                    </div>

                    <div className="navbar-actions">
                        {user ? (
                            <>
                                {isPremium && (
                                    <span className="badge badge-premium">
                                        <Crown size={11} /> Premium
                                    </span>
                                )}
                                <span className="navbar-email">
                                    <User size={14} /> {user.email}
                                </span>
                                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                    <LogOut size={14} /> Sign out
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => setShowAuth(true)}>
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
