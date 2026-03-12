import { useState, useEffect } from 'react';
import { Search, Book, Zap, Skull, Shield, Info, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { gemini } from '../services/gemini';
import Markdown from 'react-markdown';

type Category = 'monsters' | 'spells' | 'classes' | 'races' | 'magicitems';

export function Compendium() {
  const [category, setCategory] = useState<Category>('monsters');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [category]);

  useEffect(() => {
    setTranslatedContent(null);
  }, [selectedItem]);

  const handleTranslate = async () => {
    if (!selectedItem) return;
    setIsTranslating(true);
    const content = selectedItem.desc || selectedItem.description || '';
    const translated = await gemini.translate(content);
    setTranslatedContent(translated);
    setIsTranslating(false);
  };

  const fetchResults = async (searchQuery = '') => {
    setLoading(true);
    try {
      let data;
      switch (category) {
        case 'monsters': data = await api.getMonsters(searchQuery); break;
        case 'spells': data = await api.getSpells(searchQuery); break;
        case 'classes': data = await api.getClasses(); break;
        case 'races': data = await api.getRaces(); break;
        case 'magicitems': data = await api.getMagicItems(searchQuery); break;
        default: data = { results: [] };
      }
      setResults(data.results || []);
    } catch (error) {
      console.error("Failed to fetch compendium", error);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-[calc(100vh-140px)] space-y-4"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#141414] pb-3 shrink-0 gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic font-serif uppercase tracking-tighter">Compêndio</h2>
          <p className="font-mono text-[8px] uppercase opacity-50 tracking-widest">Conhecimento Arcano e Bestiário</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
          <input 
            type="text" 
            placeholder={`Buscar em ${category}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/50 border border-[#141414] py-2 px-4 font-mono text-[10px] uppercase tracking-wider focus:outline-none focus:bg-white transition-all"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-[#141414]/10 pb-2 shrink-0">
        <CategoryTab active={category === 'monsters'} onClick={() => setCategory('monsters')} icon={<Skull className="w-3.5 h-3.5" />} label="Monstros" />
        <CategoryTab active={category === 'spells'} onClick={() => setCategory('spells')} icon={<Zap className="w-3.5 h-3.5" />} label="Magias" />
        <CategoryTab active={category === 'classes'} onClick={() => setCategory('classes')} icon={<Shield className="w-3.5 h-3.5" />} label="Classes" />
        <CategoryTab active={category === 'races'} onClick={() => setCategory('races')} icon={<Info className="w-3.5 h-3.5" />} label="Raças" />
        <CategoryTab active={category === 'magicitems'} onClick={() => setCategory('magicitems')} icon={<Book className="w-3.5 h-3.5" />} label="Itens Mágicos" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Results List */}
        <div className="w-full md:w-1/4 flex flex-col min-h-0 border border-[#141414] bg-white/30">
          <div className="p-2 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Resultados ({results.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center font-mono text-[10px] animate-pulse uppercase opacity-50">Consultando...</div>
            ) : results.length > 0 ? (
              results.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-2.5 border-b border-[#141414]/5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group ${selectedItem?.name === item.name ? 'bg-[#141414] text-[#E4E3E0]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase italic font-serif tracking-tight">{item.name}</span>
                    <span className="font-mono text-[9px] opacity-50 group-hover:opacity-100">
                      {item.challenge_rating ? `ND ${item.challenge_rating}` : item.level || ''}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center font-mono text-[10px] opacity-50 uppercase">Vazio</div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 flex flex-col min-h-0 border border-[#141414] bg-white/50 relative">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key={selectedItem.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col h-full"
              >
                <div className="p-3 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black italic font-serif uppercase tracking-tighter">{selectedItem.name}</h3>
                    <div className="hidden sm:flex gap-2 font-mono text-[8px] uppercase font-bold text-indigo-300">
                      <span>{selectedItem.type || selectedItem.school}</span>
                      <span>•</span>
                      <span>{selectedItem.size || selectedItem.level}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="flex items-center gap-2 px-3 py-1 bg-[#E4E3E0] text-[#141414] font-mono text-[9px] uppercase font-bold hover:bg-white transition-all disabled:opacity-50"
                  >
                    <Languages className={`w-3 h-3 ${isTranslating ? 'animate-spin' : ''}`} />
                    {isTranslating ? 'Traduzindo...' : 'Traduzir'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pb-4 border-b border-[#141414]/10">
                      {selectedItem.strength && <StatBox label="FOR" value={selectedItem.strength} />}
                      {selectedItem.dexterity && <StatBox label="DES" value={selectedItem.dexterity} />}
                      {selectedItem.constitution && <StatBox label="CON" value={selectedItem.constitution} />}
                      {selectedItem.intelligence && <StatBox label="INT" value={selectedItem.intelligence} />}
                      {selectedItem.wisdom && <StatBox label="SAB" value={selectedItem.wisdom} />}
                      {selectedItem.charisma && <StatBox label="CAR" value={selectedItem.charisma} />}
                    </div>

                    <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter">
                      <div className="font-mono text-[9px] uppercase opacity-30 mb-2">Descrição / Tradução</div>
                      <div className="markdown-body text-sm leading-relaxed">
                        <Markdown>{translatedContent || selectedItem.desc || selectedItem.description || 'Nenhuma descrição disponível.'}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <Book className="w-12 h-12" />
                <p className="font-mono text-[9px] uppercase tracking-widest">Selecione uma entrada</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${active ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#141414]/40 hover:text-[#141414]'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="border border-[#141414]/10 p-3 text-center">
      <div className="text-[10px] font-mono uppercase opacity-50">{label}</div>
      <div className="text-xl font-black font-serif italic">{value}</div>
      <div className="text-[10px] font-mono font-bold text-indigo-600">{mod >= 0 ? `+${mod}` : mod}</div>
    </div>
  );
}
