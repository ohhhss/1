
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dbService } from './services/db';
import { DiaryEntry, AppSettings, ViewState, MoodType, CustomMood } from './types';
import { AFFIRMATION_LIBRARY, EXTRA_AFFIRMATIONS, GREETINGS, MOOD_CONFIG, DEFAULT_TAGS, MOOD_ICONS, getMoodColorHex, getMoodColorClass } from './constants';
import { 
  BookOpen, 
  BarChart2, 
  Settings as SettingsIcon, 
  PlusCircle, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  Moon, 
  Sun,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Tag,
  Heart,
  Image as ImageIcon,
  X,
  Plus,
  Thermometer,
  CloudRain,
  Cloud,
  Feather,
  Wind,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// --- Helper Functions ---
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- Helper Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', icon: Icon }: any) => {
  const base = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all transform active:scale-95 shadow-sm";
  const styles = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-200",
    secondary: "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 px-4 py-2"
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 ${className}`}
  >
    {children}
  </div>
);

const Chip = ({ label, selected, onClick, colorClass = "bg-stone-100 text-stone-600" }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      selected 
        ? 'bg-brand-500 text-white shadow-md' 
        : `${colorClass} hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600`
    }`}
  >
    {label}
  </button>
);

// --- Detail Modal Component ---
const EntryDetailModal = ({ entry, onClose, onDelete }: { entry: DiaryEntry, onClose: () => void, onDelete: (id: string) => void }) => {
  const moodScore = entry.moodScore ?? 50;
  const moodColor = getMoodColorHex(moodScore);
  
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-stone-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-slide-up flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image or Color Bar */}
        {entry.image ? (
          <div className="relative w-full h-56 flex-shrink-0">
             <img src={entry.image} alt="Memory" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             <button onClick={onClose} className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-colors">
               <X size={20} />
             </button>
             <div className="absolute bottom-4 left-6 text-white">
                <span className="text-sm font-medium opacity-90 block mb-1">
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-xs opacity-75 flex items-center gap-1">
                   <Clock size={12} />
                   {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
             </div>
          </div>
        ) : (
          <div className="relative w-full h-24 flex-shrink-0" style={{ backgroundColor: moodColor }}>
             <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition-colors">
               <X size={20} />
             </button>
             <div className="absolute bottom-4 left-6 text-white flex items-center gap-2">
                <span className="text-lg font-bold">
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </span>
                <span className="text-sm opacity-80">
                   {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { weekday: 'long' })}
                </span>
             </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
           {/* Header Section */}
           <div>
             <div className="flex items-center gap-2 mb-3">
               <div className="w-2 h-6 rounded-full" style={{ backgroundColor: moodColor }}></div>
               <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-white leading-tight">
                 {entry.content.event}
               </h2>
             </div>
             
             {entry.content.feeling && (
               <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-700`} style={{ color: moodColor }}>
                    心情：{entry.content.feeling}
                  </span>
               </div>
             )}
           </div>

           {/* Main Content */}
           <div className="prose dark:prose-invert max-w-none">
             <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-700 leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                {entry.content.evidence}
             </div>
           </div>

           {/* AI Response */}
           {entry.aiResponse && (
              <div className="relative p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 overflow-hidden">
                <Sparkles className="absolute top-4 right-4 text-amber-300 opacity-50" size={48} />
                <div className="relative z-10">
                   <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <Heart size={12} fill="currentColor" /> 来自值得日记的鼓励
                   </p>
                   <p className="text-stone-600 dark:text-stone-300 italic font-medium leading-relaxed">
                     "{entry.aiResponse}"
                   </p>
                </div>
              </div>
           )}

           {/* Tags */}
           {entry.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-2">
               {entry.tags.map(tag => (
                 <span key={tag} className="text-xs px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 rounded-lg flex items-center gap-1">
                   <Tag size={12} /> {tag}
                 </span>
               ))}
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-700 flex justify-end gap-3 bg-white dark:bg-stone-800 rounded-b-3xl">
           <button 
             onClick={() => {
               if(window.confirm('确定要删除这条美好的回忆吗？')) {
                 onDelete(entry.id);
                 onClose();
               }
             }}
             className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium"
           >
             <Trash2 size={16} /> 删除
           </button>
           <Button onClick={onClose} className="px-6 py-2 text-sm shadow-none">
             关闭
           </Button>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Views ---

const WriteView = ({ 
  onSave, 
  initialGreeting, 
  customTags,
  onAddCustomTag
}: { 
  onSave: (entry: Omit<DiaryEntry, 'id' | 'timestamp' | 'date' | 'aiResponse'>) => void, 
  initialGreeting: string,
  customTags: string[],
  onAddCustomTag: (t: string) => void
}) => {
  const [event, setEvent] = useState('');
  const [feeling, setFeeling] = useState(''); // This captures the specific mood description
  const [evidence, setEvidence] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => [...DEFAULT_TAGS, ...customTags], [customTags]);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setImage(compressed);
      } catch (err) {
        console.error("Image upload failed", err);
        alert("图片上传失败，请重试");
      }
    }
  };

  const getMoodLabel = (score: number): MoodType => {
    if (score <= 35) return 'sad';
    if (score <= 65) return 'calm';
    return 'happy';
  }

  const handleSave = () => {
    if (!event.trim() || !evidence.trim()) return;
    onSave({
      title: '日记',
      content: { event, feeling: feeling || getDefaultFeeling(moodScore), evidence },
      tags,
      mood: getMoodLabel(moodScore), 
      moodScore,
      image: image || undefined
    });
  };

  const getDefaultFeeling = (score: number) => {
    if (score <= 35) return '低落';
    if (score <= 65) return '平静';
    return '开心';
  }

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      const t = newTag.trim();
      onAddCustomTag(t); // Save globally
      toggleTag(t); // Select immediately
      setNewTag('');
    }
  };

  // Dynamic Styles based on Mood Score (3 Zones: 0-35, 36-65, 66-100)
  const isSad = moodScore <= 35;
  const isCalm = moodScore > 35 && moodScore <= 65;
  const isHappy = moodScore > 65;

  const getGradient = () => {
    // Blue (0) -> Teal (50) -> Amber (100)
    return `linear-gradient(90deg, #60a5fa 0%, #2dd4bf 50%, #fbbf24 100%)`;
  };

  const getPromptText = () => {
    if (isSad) return "是什么真正刺痛了你？";
    if (isCalm) return "此刻，你的内心在感受什么？";
    return "被爱的证据";
  }

  const getPromptPlaceholder = () => {
    if (isSad) return "试着描述那份痛楚，看见它，本身就是一种对自我的接纳...";
    if (isCalm) return "闭上眼睛深呼吸... 写下你现在的念头或身体的感觉...";
    return "这证明我值得被善待，因为...";
  }

  const getPromptIcon = () => {
    if (isSad) return <CloudRain size={16} />;
    if (isCalm) return <Wind size={16} />;
    return <Sparkles size={16} />;
  }

  const promptIconColor = isSad ? "text-blue-500" : (isCalm ? "text-teal-500" : "text-amber-500");
  const promptBg = isSad ? "bg-blue-50 dark:bg-blue-900/20" : (isCalm ? "bg-teal-50 dark:bg-teal-900/20" : "bg-amber-50 dark:bg-amber-900/20");
  const ringColor = isSad ? '#60a5fa' : (isCalm ? '#2dd4bf' : '#f59e0b');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-28">
      <div className="text-center py-6">
        <h2 className="text-2xl font-serif font-semibold text-stone-800 dark:text-stone-100">{initialGreeting}</h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
          {isSad && "接纳悲伤，也是爱自己的一部分。"}
          {isCalm && "平静是内心最强大的力量。"}
          {isHappy && "收集快乐的碎片，拼凑出完整的你。"}
        </p>
      </div>

      <Card className="animate-slide-up">
        <div className="space-y-8">
          {/* Mood Barometer Slider */}
          <div>
             <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-6 text-center">内心晴雨表</label>
             <div className="px-4">
                <div className="relative h-14 flex items-center">
                   {/* Zone Labels */}
                   <div className="absolute top-[-24px] w-full flex justify-between px-2 text-xs font-bold text-stone-300 select-none">
                     <span className="text-blue-400 w-1/3 text-left pl-2">低落</span>
                     <span className="text-teal-400 w-1/3 text-center">平静</span>
                     <span className="text-amber-400 w-1/3 text-right pr-2">愉悦</span>
                   </div>

                   {/* Icons at ends/middle */}
                   <CloudRain className="absolute left-[-28px] text-blue-400" size={20} />
                   <Feather className="absolute left-[50%] -translate-x-1/2 -top-8 text-teal-400 opacity-50" size={16} />
                   <Sun className="absolute right-[-28px] text-amber-400" size={20} />
                   
                   {/* Track */}
                   <div 
                      className="w-full h-4 rounded-full shadow-inner"
                      style={{ background: getGradient() }}
                   ></div>

                   {/* Slider Input */}
                   <input 
                     type="range" 
                     min="0" 
                     max="100" 
                     value={moodScore} 
                     onChange={(e) => setMoodScore(Number(e.target.value))}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />

                   {/* Thumb Indicator (Visual only, follows logic) */}
                   <div 
                     className="absolute h-8 w-8 bg-white dark:bg-stone-200 border-4 rounded-full shadow-lg transition-all duration-75 ease-out flex items-center justify-center pointer-events-none z-20"
                     style={{ 
                       left: `calc(${moodScore}% - 16px)`,
                       borderColor: getMoodColorHex(moodScore)
                     }}
                   >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getMoodColorHex(moodScore) }}></div>
                   </div>
                </div>
             </div>
             
             {/* Specific Feeling Input */}
             <div className="mt-6 text-center">
                <input 
                  type="text"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder={isCalm ? "那种平静的感觉像..." : "如何具体描述此刻的心情？"}
                  className="w-full text-center border-b border-stone-200 dark:border-stone-700 bg-transparent py-2 focus:outline-none text-stone-700 dark:text-stone-200 placeholder-stone-400 transition-colors duration-300"
                  style={{ borderBottomColor: feeling ? ringColor : '' }}
                />
             </div>
          </div>

          <div className="border-t border-stone-100 dark:border-stone-700 pt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">今天发生了什么？</label>
              <textarea
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="记录下一个瞬间，无论大小..."
                className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border-none focus:ring-2 focus:ring-brand-200 resize-none h-24 dark:text-white placeholder-stone-400"
              />
            </div>

            {/* Image Upload */}
            <div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 accept="image/*" 
                 className="hidden" 
               />
               {!image ? (
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-stone-400 flex items-center justify-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                 >
                   <ImageIcon size={18} />
                   添加图片回忆
                 </button>
               ) : (
                 <div className="relative rounded-xl overflow-hidden group">
                   <img src={image} alt="Upload preview" className="w-full h-48 object-cover" />
                   <button 
                     onClick={() => setImage(null)}
                     className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                   >
                     <X size={16} />
                   </button>
                 </div>
               )}
            </div>

            {/* Dynamic Evidence/Pain Box */}
            <div className={`p-4 rounded-xl transition-colors duration-500 ${promptBg}`}>
              <label className={`block text-sm font-bold mb-2 flex items-center gap-2 transition-colors duration-500 ${promptIconColor}`}>
                {getPromptIcon()}
                {getPromptText()}
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder={getPromptPlaceholder()}
                className="w-full p-4 rounded-xl bg-white dark:bg-stone-800 border-none focus:ring-2 focus:ring-opacity-50 focus:ring-current resize-none h-28 dark:text-white placeholder-stone-400"
                style={{ '--tw-ring-color': ringColor } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-3">标签</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Chip key={tag} label={tag} selected={tags.includes(tag)} onClick={() => toggleTag(tag)} />
              ))}
              <div className="flex items-center gap-2">
                 <input 
                   className="px-3 py-1.5 rounded-full text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 w-24 focus:outline-none focus:border-brand-300 dark:text-white placeholder-stone-400" 
                   placeholder="+ 新标签"
                   value={newTag}
                   onChange={(e) => setNewTag(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleAddNewTag();
                   }}
                   onBlur={handleAddNewTag}
                 />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full text-lg shadow-lg shadow-brand-200/50 py-4" icon={Save}>
            保存到日记
          </Button>
        </div>
      </Card>
    </div>
  );
};

const CalendarWidget = ({ entries, selectedDate, onSelectDate }: { entries: DiaryEntry[], selectedDate: Date | null, onSelectDate: (d: Date | null) => void }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  // Map entries to days for dots
  const entriesByDay = useMemo(() => {
    const map: Record<number, boolean> = {};
    entries.forEach(e => {
      const d = new Date(e.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[d.getDate()] = true;
      }
    });
    return map;
  }, [entries, year, month]);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  }

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(
      <button
        key={d}
        onClick={() => {
          if (isSelected(d)) {
            onSelectDate(null); // Deselect
          } else {
            onSelectDate(new Date(year, month, d));
          }
        }}
        className={`h-10 w-10 mx-auto flex flex-col items-center justify-center rounded-full relative transition-all text-sm
          ${isSelected(d) ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'}
          ${isToday(d) && !isSelected(d) ? 'border border-brand-500 font-bold' : ''}
        `}
      >
        <span>{d}</span>
        {entriesByDay[d] && (
          <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected(d) ? 'bg-white' : 'bg-brand-500'}`}></span>
        )}
      </button>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full text-stone-500"><ChevronLeft size={20} /></button>
        <span className="font-bold text-stone-700 dark:text-stone-200">
          {year}年 {month + 1}月
        </span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full text-stone-500"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <span key={d} className="text-xs text-stone-400">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {days}
      </div>
    </Card>
  );
};

const HistoryView = ({ entries, onDelete }: { entries: DiaryEntry[], onDelete: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (selectedDate) {
      filtered = filtered.filter(e => {
        const d = new Date(e.timestamp);
        return d.getDate() === selectedDate.getDate() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getFullYear() === selectedDate.getFullYear();
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.content.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.evidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [entries, searchTerm, selectedDate]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 animate-fade-in">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
          <input 
            type="text"
            placeholder="搜索回忆..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-800 border-none shadow-sm focus:ring-2 focus:ring-brand-200 dark:text-white placeholder-stone-400"
          />
        </div>
      </div>

      <CalendarWidget entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="flex justify-between items-center px-2">
         <h3 className="font-bold text-stone-700 dark:text-stone-300">
            {selectedDate 
              ? `${selectedDate.getMonth()+1}月${selectedDate.getDate()}日的记录` 
              : "所有记录"
            }
         </h3>
         <span className="text-xs text-stone-500">{filteredEntries.length} 条</span>
      </div>

      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>这里还是一片空白。</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const moodScore = entry.moodScore ?? 50; // Fallback
            return (
            <div key={entry.id} className="group relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 dark:border-stone-700">
              {/* Timeline Dot with Mood Color */}
              <div 
                 className="absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white dark:border-stone-900"
                 style={{ backgroundColor: getMoodColorHex(moodScore) }}
              ></div>
              
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
                {new Date(entry.timestamp).toLocaleString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <Card 
                className="hover:scale-[1.01] transition-transform duration-300 overflow-hidden cursor-pointer"
                onClick={() => setViewingEntry(entry)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {/* Visual Bar for Mood */}
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: getMoodColorHex(moodScore) }}></div>
                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 line-clamp-1">{entry.content.event}</h3>
                  </div>
                  {/* Keep trash button working separately without triggering modal */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }} 
                    className="text-stone-300 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {entry.content.feeling && (
                  <p className="text-stone-600 dark:text-stone-300 mb-4 italic flex items-center gap-2">
                     <span className="text-stone-400 text-xs bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-md">心情: {entry.content.feeling}</span>
                  </p>
                )}
                
                {entry.image && (
                   <div className="mb-4 rounded-lg overflow-hidden max-h-40">
                     <img src={entry.image} alt="Memory" className="w-full h-full object-cover" />
                   </div>
                )}

                <div className={`p-3 rounded-lg border-l-4 mb-4 line-clamp-2 text-sm ${moodScore <= 35 ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200' : (moodScore <= 65 ? 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-200' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200')}`}>
                  <p className="text-stone-700 dark:text-stone-200">{entry.content.evidence}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-stone-100 dark:bg-stone-900 text-stone-500 rounded-md">#{tag}</span>
                  ))}
                </div>
              </Card>
            </div>
          )})
        )}
      </div>

      {viewingEntry && (
        <EntryDetailModal 
          entry={viewingEntry} 
          onClose={() => setViewingEntry(null)} 
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

// Interactive Watercolor/Fog Palette
const MoodCloud = ({ entries }: { entries: DiaryEntry[] }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use latest entries for the cloud
  const cloudItems = useMemo(() => {
    return entries.slice(0, 20).map(e => ({
      id: e.id,
      color: getMoodColorHex(e.moodScore || 50),
      date: new Date(e.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      feeling: e.content.feeling,
      score: e.moodScore || 50
    }));
  }, [entries]);

  if (entries.length === 0) return (
     <div className="h-40 flex items-center justify-center text-stone-400 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-700">
       <span className="text-sm">暂无心情记录，去写第一篇日记吧</span>
     </div>
  );

  return (
    <div className="w-full min-h-[300px] flex flex-wrap justify-center items-center content-center p-6 bg-white dark:bg-stone-900 rounded-2xl relative overflow-hidden isolate">
      {/* Container for blending */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center content-center pointer-events-none">
        {cloudItems.map((item, idx) => {
          const isActive = activeId === item.id;
          // Substantially increased size and negative margin for overlap blending
          return (
             <div 
               key={'bg-' + item.id}
               className={`transition-all duration-700 rounded-full mix-blend-multiply dark:mix-blend-screen ${isActive ? 'opacity-0' : 'opacity-80 blur-xl'}`}
               style={{
                 width: '100px',
                 height: '100px',
                 margin: '-30px',
                 backgroundColor: item.color,
                 transform: `scale(${1 + Math.random() * 0.5})`,
               }}
             />
          );
        })}
      </div>

      {/* Interactive Layer (Sharp when active) */}
      <div className="relative z-10 flex flex-wrap justify-center items-center gap-1">
        {cloudItems.map((item) => {
           const isActive = activeId === item.id;
           return (
             <div 
               key={item.id}
               onClick={() => setActiveId(isActive ? null : item.id)}
               className={`cursor-pointer transition-all duration-500 flex items-center justify-center rounded-full ${
                  isActive 
                  ? 'w-24 h-24 shadow-2xl scale-110 z-20 bg-white dark:bg-stone-800 border-4' 
                  : 'w-8 h-8 opacity-0 hover:opacity-50 hover:bg-white/20'
               }`}
               style={{ 
                 borderColor: isActive ? item.color : 'transparent'
               }}
             >
                {isActive && (
                  <div className="text-center p-2 animate-fade-in">
                     <p className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">{item.date}</p>
                     <p className="text-xs font-medium text-stone-800 dark:text-stone-200 line-clamp-2 leading-tight px-1">{item.feeling}</p>
                  </div>
                )}
             </div>
           )
        })}
      </div>
      
      <p className="absolute bottom-4 text-xs text-stone-400 w-full text-center pointer-events-none tracking-widest uppercase">
        点击区域查看详情
      </p>
    </div>
  )
}

const StatsView = ({ entries }: { entries: DiaryEntry[] }) => {
  const stats = useMemo(() => {
    // Word Cloud Logic
    const words = entries.flatMap(e => 
      [...e.content.feeling.split(' '), ...e.tags]
      .map(w => w.replace(/[^\u4e00-\u9fa5\w]/g, '')) // Keep Chinese and alphanumeric
      .filter(w => w.length >= 1 && w !== '不错' && w !== '低落' && w !== '平静' && w !== '开心') // Filter default fillers
    );
    const wordFreq: Record<string, number> = {};
    words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    return { topWords, total: entries.length };
  }, [entries]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 animate-fade-in">
       <div className="grid grid-cols-2 gap-4">
         <Card className="text-center">
            <h3 className="text-3xl font-bold text-brand-500">{stats.total}</h3>
            <p className="text-sm text-stone-500 uppercase tracking-wide">总记录数</p>
         </Card>
         <Card className="text-center">
            <h3 className="text-3xl font-bold text-amber-500">{stats.topWords.length > 0 ? stats.topWords[0][0] : '-'}</h3>
            <p className="text-sm text-stone-500 uppercase tracking-wide">年度关键词</p>
         </Card>
       </div>

       <Card>
         <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-4 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
           心情云雾调色盘
         </h3>
         <MoodCloud entries={entries} />
       </Card>

       <Card>
          <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-4">关键词</h3>
          {stats.topWords.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {stats.topWords.map(([word, count]) => {
                const size = Math.min(2, 0.8 + (count * 0.2)); 
                return (
                  <span 
                    key={word} 
                    style={{ fontSize: `${size}rem`, opacity: 0.6 + (Math.min(count, 5) * 0.08) }}
                    className="text-brand-400 font-medium transition-all hover:scale-110 cursor-default"
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-stone-400 py-10">你的正能量词汇将在这里出现。</p>
          )}
       </Card>
    </div>
  );
};

const SettingsView = ({ settings, setSettings, onImport, onExport }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
  };
  
  const lastBackup = settings.lastBackupDate 
    ? new Date(settings.lastBackupDate).toLocaleDateString() 
    : "从未";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 animate-fade-in">
      <Card>
        <h3 className="text-xl font-bold mb-6 dark:text-white">设置与数据</h3>
        
        <div className="flex items-center justify-between py-4 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-3">
             {settings.darkMode ? <Moon className="text-brand-500" /> : <Sun className="text-amber-500" />}
             <span className="dark:text-stone-200">深色模式</span>
          </div>
          <button 
            onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-brand-500' : 'bg-stone-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-xl mb-4">
             <p className="text-sm text-stone-500 mb-1">上次备份时间</p>
             <p className="font-bold text-stone-700 dark:text-stone-300">{lastBackup}</p>
          </div>

          <Button variant="secondary" className="w-full justify-start" icon={Download} onClick={onExport}>
            导出日记备份 (JSON)
          </Button>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          <Button variant="secondary" className="w-full justify-start" icon={Upload} onClick={handleImportClick}>
            导入日记备份
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-800 dark:text-amber-200">
          <p><strong>隐私说明：</strong> 所有数据 100% 存储在您的本地设备浏览器中。我们不追踪任何信息，数据也不会上传到任何服务器。</p>
        </div>
      </Card>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<ViewState>('write');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    userName: '朋友',
    reminderEnabled: false,
    reminderTime: '20:00',
    customMoods: [],
    customTags: [],
    lastBackupDate: Date.now()
  });
  const [showEncouragement, setShowEncouragement] = useState<string | null>(null);
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [showBackupAlert, setShowBackupAlert] = useState(false);

  // Initialization
  useEffect(() => {
    const init = async () => {
      try {
          await dbService.init();
          const loadedEntries = await dbService.getAllEntries();
          setEntries(loadedEntries);
          const loadedSettings = dbService.getSettings();
          setSettings(loadedSettings);
          
          // Random greeting
          setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
          
          // Check backup status (3 days)
          checkBackupStatus(loadedSettings.lastBackupDate);
      } catch (e) {
          console.error("Initialization error", e);
      }
    };
    init();
  }, []);

  const checkBackupStatus = (lastBackup: number) => {
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastBackup > threeDays) {
      setShowBackupAlert(true);
    }
  };

  // Theme effect
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    dbService.saveSettings(settings);
  }, [settings]);

  // "AI" Logic (Simple keyword matching)
  const generateResponse = (entry: Omit<DiaryEntry, 'id' | 'timestamp' | 'date' | 'aiResponse'>) => {
    let pool = [...AFFIRMATION_LIBRARY.general];
    
    // Check specific conditions
    if (entry.image) {
      pool = [...pool, ...AFFIRMATION_LIBRARY.image];
    }
    
    // Check if new tags used (simplified check against defaults)
    const hasNewTags = entry.tags.some(t => !DEFAULT_TAGS.includes(t));
    if (hasNewTags) {
      pool = [...pool, ...AFFIRMATION_LIBRARY.new_tag];
    }
    
    const text = (entry.content.event + ' ' + entry.content.evidence).toLowerCase();
    
    if (text.match(/朋友|家人|妈妈|爸爸|伴侣|爱人|同事|聚会|聊天/)) {
      pool = [...pool, ...AFFIRMATION_LIBRARY.social];
    }
    if (text.match(/工作|任务|完成|成功|项目|学习|考试|进步/)) {
      pool = [...pool, ...AFFIRMATION_LIBRARY.achievement];
    }
    
    // Mood based
    if (entry.mood === 'sad') {
       pool = [...pool, ...AFFIRMATION_LIBRARY.difficult];
    } else if (entry.mood === 'calm') {
       pool = [...pool, ...AFFIRMATION_LIBRARY.calm];
    } else if (text.match(/难过|累|哭|失败|痛苦|焦虑|压力|糟糕/)) {
       // Keep fallback keyword matching just in case
       pool = [...pool, ...AFFIRMATION_LIBRARY.difficult];
    }

    // Add random extra variation
    pool = [...pool, ...EXTRA_AFFIRMATIONS.slice(0, 5)];
    
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSaveEntry = async (data: Omit<DiaryEntry, 'id' | 'timestamp' | 'date' | 'aiResponse'>) => {
    const response = generateResponse(data);
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...data,
      aiResponse: response
    };

    await dbService.addEntry(newEntry);
    setEntries(prev => [newEntry, ...prev]); 
    setShowEncouragement(response);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("确定要删除这条美好的回忆吗？")) {
      await dbService.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleExport = async () => {
    const json = await dbService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worthiness-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    // Update local state to hide alert
    setSettings(prev => ({...prev, lastBackupDate: Date.now()}));
    setShowBackupAlert(false);
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        await dbService.importData(text);
        const refreshed = await dbService.getAllEntries();
        setEntries(refreshed);
        const newSettings = dbService.getSettings();
        setSettings(newSettings);
        alert("导入成功！");
      } catch (err) {
        alert("文件格式有误，导入失败。");
      }
    };
    reader.readAsText(file);
  };
  
  const handleAddCustomTag = (newTag: string) => {
    if (settings.customTags?.includes(newTag)) return;
    const updatedSettings = {
      ...settings,
      customTags: [...(settings.customTags || []), newTag]
    };
    setSettings(updatedSettings);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4">
      {/* Header */}
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="bg-brand-500 text-white p-2 rounded-xl shadow-brand-200">
             <Heart fill="currentColor" size={20} />
           </div>
           <h1 className="text-xl font-serif font-bold text-stone-800 dark:text-white tracking-tight">值得日记</h1>
        </div>
        <div className="text-sm font-medium text-stone-500 dark:text-stone-400">
           {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {view === 'write' && (
          <WriteView 
            onSave={handleSaveEntry} 
            initialGreeting={greeting}
            customTags={settings.customTags || []}
            onAddCustomTag={handleAddCustomTag}
          />
        )}
        {view === 'history' && <HistoryView entries={entries} onDelete={handleDeleteEntry} />}
        {view === 'stats' && <StatsView entries={entries} />}
        {view === 'settings' && <SettingsView settings={settings} setSettings={setSettings} onExport={handleExport} onImport={handleImport} />}
      </main>

      {/* Encouragement Modal */}
      {showEncouragement && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-slide-up relative overflow-hidden">
             {/* Decorative background circle */}
             <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-32 h-32 bg-brand-100 dark:bg-brand-900 rounded-full blur-2xl z-0"></div>
             
             <div className="relative z-10">
                <div className="mx-auto w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-6 animate-bounce-gentle">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-white mb-4">保存成功</h3>
                <p className="text-lg text-stone-600 dark:text-stone-300 italic mb-8">"{showEncouragement}"</p>
                <Button 
                  onClick={() => { setShowEncouragement(null); setView('history'); }} 
                  className="w-full"
                >
                  我收到了
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* Backup Alert Banner */}
      {showBackupAlert && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-stone-800 text-white px-4 py-3 rounded-xl shadow-xl flex justify-between items-center z-50 animate-slide-up">
           <div className="text-sm">
             <p className="font-bold">温馨提醒</p>
             <p className="text-stone-300 text-xs">已经超过3天没有备份日记了哦</p>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setShowBackupAlert(false)} className="px-3 py-1 text-xs text-stone-400">稍后</button>
             <button onClick={handleExport} className="px-3 py-1 bg-brand-500 rounded-lg text-xs font-bold">去备份</button>
           </div>
        </div>
      )}

      {/* Bottom Navigation - Symmetrical Layout */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-stone-800/95 backdrop-blur-xl border border-stone-200 dark:border-stone-700 shadow-xl rounded-2xl px-2 py-3 w-[90%] max-w-md flex justify-between items-center z-40">
        <NavButton active={view === 'write'} onClick={() => setView('write')} icon={PlusCircle} label="记录" />
        <NavButton active={view === 'history'} onClick={() => setView('history')} icon={BookOpen} label="回忆" />
        <NavButton active={view === 'stats'} onClick={() => setView('stats')} icon={BarChart2} label="统计" />
        <NavButton active={view === 'settings'} onClick={() => setView('settings')} icon={SettingsIcon} label="设置" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 rounded-xl py-1 ${
      active 
        ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} className="transition-transform duration-300 transform" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
