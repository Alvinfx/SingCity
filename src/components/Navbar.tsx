import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Mic2, Library, User, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export default function Navbar() {
  const location = useLocation();
  const { walletConnected, walletAddress, connectWallet } = useWallet();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Mic2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SingCity
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/karaoke" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/karaoke') 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>Sing</span>
            </Link>
            <Link 
              to="/library" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/library') 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Library</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/profile') 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>

          <Button 
            onClick={handleConnectWallet}
            className={`${
              walletConnected 
                ? 'bg-accent hover:bg-accent/90' 
                : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
            }`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {walletConnected ? walletAddress : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </nav>
  );
}
