/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Sword, 
  Scroll, 
  BookOpen, 
  LogOut, 
  Dices,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterList } from './components/CharacterList';
import { CampaignList } from './components/CampaignList';
import { Compendium } from './components/Compendium';
import { ErrorBoundary } from './components/ErrorBoundary';
import { handleFirestoreError, OperationType } from './firebase';

type Tab = 'home' | 'characters' | 'campaigns' | 'compendium';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Dices className="w-12 h-12 text-[#141414]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-[#141414] uppercase leading-none italic font-serif">
              Mythic<br/>Forge
            </h1>
            <p className="text-sm uppercase tracking-widest font-mono text-[#141414]/60">
              Plataforma de RPG Lendária
            </p>
          </div>
          
          <div className="aspect-square bg-[#141414] rounded-full flex items-center justify-center relative overflow-hidden group">
            <Dices className="w-32 h-32 text-[#E4E3E0] group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-40" />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-colors flex items-center justify-center gap-3 group"
          >
            Entrar na Forja
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-xs font-mono text-[#141414]/40 uppercase">
            Alimentado por APIs Open5e & D&D 5e
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] overflow-hidden">
        {/* Navigation */}
        <nav className="border-b border-[#141414] bg-[#E4E3E0] z-50 shrink-0">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('home')}
                className="text-xl font-black italic font-serif tracking-tighter uppercase"
              >
                MF
              </button>
              
              <div className="hidden md:flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                <NavButton active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} icon={<Sword className="w-3.5 h-3.5" />} label="Personagens" />
                <NavButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<Scroll className="w-3.5 h-3.5" />} label="Campanhas" />
                <NavButton active={activeTab === 'compendium'} onClick={() => setActiveTab('compendium')} icon={<BookOpen className="w-3.5 h-3.5" />} label="Compêndio" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-3 py-1 border border-[#141414]/10 rounded-full">
                <img src={user.photoURL || ''} alt="" className="w-5 h-5 rounded-full border border-[#141414]" />
                <span className="text-[9px] font-mono uppercase font-bold">{user.displayName}</span>
                <button onClick={handleLogout} className="hover:text-red-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-[#141414] bg-[#E4E3E0] overflow-hidden shrink-0"
            >
              <div className="p-4 space-y-4 font-mono text-xs uppercase">
                <button onClick={() => { setActiveTab('characters'); setIsMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-3"><Sword className="w-4 h-4" /> Personagens</button>
                <button onClick={() => { setActiveTab('campaigns'); setIsMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-3"><Scroll className="w-4 h-4" /> Campanhas</button>
                <button onClick={() => { setActiveTab('compendium'); setIsMenuOpen(false); }} className="w-full text-left py-2 flex items-center gap-3"><BookOpen className="w-4 h-4" /> Compêndio</button>
                <button onClick={handleLogout} className="w-full text-left py-2 flex items-center gap-3 text-red-600"><LogOut className="w-4 h-4" /> Sair</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <Home user={user} onNavigate={setActiveTab} />}
              {activeTab === 'characters' && <CharacterList user={user} />}
              {activeTab === 'campaigns' && <CampaignList user={user} />}
              {activeTab === 'compendium' && <Compendium />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 transition-all ${active ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Home({ user, onNavigate }: { user: User, onNavigate: (tab: Tab) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h2 className="text-4xl md:text-6xl font-black italic font-serif tracking-tighter uppercase leading-none">
          Bem-vindo de volta,<br/>{user.displayName?.split(' ')[0]}
        </h2>
        <div className="h-1 w-16 bg-[#141414]" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard 
          icon={<Sword className="w-6 h-6" />}
          title="Personagens"
          description="Gerencie seus heróis lendários e sua progressão."
          onClick={() => onNavigate('characters')}
          count="Personagens"
          className="lg:row-span-2"
        />
        <DashboardCard 
          icon={<Scroll className="w-6 h-6" />}
          title="Campanhas"
          description="Crie narrativas épicas e gerencie seu mundo de jogo."
          onClick={() => onNavigate('campaigns')}
          count="Campanhas"
        />
        <DashboardCard 
          icon={<BookOpen className="w-6 h-6" />}
          title="Compêndio"
          description="Acesse o banco de dados definitivo de magias e monstros."
          onClick={() => onNavigate('compendium')}
          count="Compêndio"
        />
      </div>

      <section className="border-t border-[#141414] pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif italic text-xl uppercase tracking-tight">Atividade Recente</h3>
          <span className="font-mono text-[9px] uppercase opacity-50">Últimos 7 Dias</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {[1, 2].map(i => (
            <div key={i} className="flex grid grid-cols-2 md:grid-cols-4 p-3 border-b border-[#141414]/10 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group cursor-default gap-y-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-mono uppercase opacity-50 group-hover:opacity-100">Tipo</span>
                <span className="text-[10px] uppercase font-bold">Personagem</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-mono uppercase opacity-50 group-hover:opacity-100">Ação</span>
                <span className="text-[10px] uppercase">Atributos Atualizados</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-mono uppercase opacity-50 group-hover:opacity-100">Alvo</span>
                <span className="text-[10px] uppercase font-bold italic font-serif">Aethelgard</span>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-[7px] font-mono uppercase opacity-50 group-hover:opacity-100">Data</span>
                <span className="text-[10px] uppercase opacity-50 group-hover:opacity-100">2h atrás</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function DashboardCard({ icon, title, description, onClick, count, className = "" }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, count: string, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group p-6 border border-[#141414] text-left hover:bg-[#141414] hover:text-[#E4E3E0] transition-all duration-300 relative overflow-hidden ${className}`}
    >
      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="space-y-1 relative z-10">
        <h4 className="text-xl font-black uppercase italic font-serif tracking-tight">{title}</h4>
        <p className="text-xs opacity-70 leading-relaxed line-clamp-2">{description}</p>
      </div>
      <div className="mt-4 font-mono text-[9px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">
        {count}
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5" />
      </div>
    </button>
  );
}

