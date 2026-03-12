import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Character } from '../types';
import { Plus, User as UserIcon, Trash2, ChevronRight, Shield, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CharacterList({ user }: { user: User }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newChar, setNewChar] = useState({ name: '', race: 'Humano', class: 'Guerreiro' });

  useEffect(() => {
    const q = query(collection(db, 'characters'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character));
      setCharacters(chars);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'characters');
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'characters'), {
        ...newChar,
        ownerId: user.uid,
        level: 1,
        hp: 10,
        maxHp: 10,
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        equipment: [],
        spells: [],
        notes: '',
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'characters');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este personagem para sempre?")) {
      try {
        await deleteDoc(doc(db, 'characters', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `characters/${id}`);
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
          <h2 className="text-4xl font-black italic font-serif uppercase tracking-tighter">Personagens</h2>
          <p className="font-mono text-[9px] uppercase opacity-50 tracking-widest">Seu Salão de Heróis</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-[#141414] text-[#E4E3E0] p-3 rounded-full hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {characters.map((char) => (
            <motion.div 
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group border border-[#141414] p-6 space-y-6 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all duration-300 relative"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black italic font-serif uppercase tracking-tight">{char.name}</h3>
                  <div className="font-mono text-[9px] uppercase font-bold opacity-50 group-hover:opacity-100">
                    Nív {char.level} {char.race} {char.class}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(char.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MiniStat icon={<Heart className="w-3 h-3" />} label="PV" value={`${char.hp}/${char.maxHp}`} />
                <MiniStat icon={<Shield className="w-3 h-3" />} label="CA" value="15" />
                <MiniStat icon={<Zap className="w-3 h-3" />} label="INIT" value="+2" />
              </div>

              <div className="pt-4 border-t border-[#141414]/10 group-hover:border-[#E4E3E0]/20 flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase opacity-50 group-hover:opacity-100">Ver Detalhes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              className="bg-[#E4E3E0] border-2 border-[#141414] p-8 max-w-md w-full relative z-10 space-y-6"
            >
              <h3 className="text-3xl font-black italic font-serif uppercase tracking-tighter">Forjar Novo Herói</h3>
              <form onSubmit={handleCreateCharacter} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase font-bold">Nome</label>
                  <input 
                    required
                    type="text" 
                    value={newChar.name}
                    onChange={e => setNewChar({...newChar, name: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-[#141414] py-2 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold">Raça</label>
                    <select 
                      value={newChar.race}
                      onChange={e => setNewChar({...newChar, race: e.target.value})}
                      className="w-full bg-transparent border-b-2 border-[#141414] py-2 focus:outline-none"
                    >
                      <option>Humano</option>
                      <option>Elfo</option>
                      <option>Anão</option>
                      <option>Halfling</option>
                      <option>Draconato</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase font-bold">Classe</label>
                    <select 
                      value={newChar.class}
                      onChange={e => setNewChar({...newChar, class: e.target.value})}
                      className="w-full bg-transparent border-b-2 border-[#141414] py-2 focus:outline-none"
                    >
                      <option>Guerreiro</option>
                      <option>Mago</option>
                      <option>Ladino</option>
                      <option>Clérigo</option>
                      <option>Paladino</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#141414] text-[#E4E3E0] py-3 font-bold uppercase tracking-widest text-xs">Forjar</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 border border-[#141414] font-bold uppercase tracking-widest text-xs">Cancelar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="border border-[#141414]/10 group-hover:border-[#E4E3E0]/20 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[8px] font-mono uppercase opacity-50 group-hover:opacity-100 mb-1">
        {icon} {label}
      </div>
      <div className="text-xs font-bold font-mono">{value}</div>
    </div>
  );
}
