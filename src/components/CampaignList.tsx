import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Campaign } from '../types';
import { Plus, Scroll, Trash2, ChevronRight, Users, Map, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CampaignList({ user }: { user: User }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });

  useEffect(() => {
    const q = query(collection(db, 'campaigns'), where('gmId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const camps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      setCampaigns(camps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'campaigns');
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'campaigns'), {
        ...newCampaign,
        gmId: user.uid,
        worldNotes: '',
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewCampaign({ name: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaigns');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir esta campanha e todo o seu histórico?")) {
      try {
        await deleteDoc(doc(db, 'campaigns', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `campaigns/${id}`);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex items-end justify-between border-b border-[#141414] pb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic font-serif uppercase tracking-tighter">Campanhas</h2>
          <p className="font-mono text-[9px] uppercase opacity-50 tracking-widest">Mestre de Mundos</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-[#141414] text-[#E4E3E0] p-3 rounded-full hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {campaigns.map((camp) => (
            <motion.div 
              key={camp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group border-l-4 border-[#141414] bg-white/50 p-8 space-y-6 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all duration-300 relative"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic font-serif uppercase tracking-tight">{camp.name}</h3>
                  <p className="text-xs opacity-70 group-hover:opacity-100 line-clamp-1">{camp.description}</p>
                </div>
                <button 
                  onClick={() => handleDelete(camp.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-6 font-mono text-[10px] uppercase font-bold">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 4 Jogadores</div>
                <div className="flex items-center gap-2"><Map className="w-4 h-4" /> 12 Locais</div>
                <div className="flex items-center gap-2"><Book className="w-4 h-4" /> 8 Capítulos</div>
              </div>

              <div className="pt-6 border-t border-[#141414]/10 group-hover:border-[#E4E3E0]/20 flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Abrir Tela do Mestre</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#E4E3E0] border-2 border-[#141414] p-8 max-w-lg w-full relative z-10 space-y-6"
            >
              <h3 className="text-3xl font-black italic font-serif uppercase tracking-tighter">Iniciar Nova Saga</h3>
              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase font-bold">Nome da Campanha</label>
                  <input 
                    required
                    type="text" 
                    value={newCampaign.name}
                    onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-[#141414] py-2 focus:outline-none text-xl font-serif italic font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase font-bold">Descrição / Premissa</label>
                  <textarea 
                    rows={4}
                    value={newCampaign.description}
                    onChange={e => setNewCampaign({...newCampaign, description: e.target.value})}
                    className="w-full bg-transparent border-2 border-[#141414] p-4 focus:outline-none font-sans text-sm"
                    placeholder="Em um mundo onde o sol nunca nasce..."
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#141414] text-[#E4E3E0] py-4 font-bold uppercase tracking-widest text-sm">Começar Jornada</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-8 border border-[#141414] font-bold uppercase tracking-widest text-sm">Cancelar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
