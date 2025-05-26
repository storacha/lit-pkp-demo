import { useAuth } from '../context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Force a refresh when redirecting to home
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        padding: '0.5rem 1rem',
        background: '#357abd',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'background-color 0.2s',
        zIndex: 1000,
      }}
      onMouseOver={(e) => e.target.style.background = '#2c6aa0'}
      onMouseOut={(e) => e.target.style.background = '#357abd'}
    >
      Logout
    </button>
  );
} 