import { useState, useEffect, useCallback } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { MemoryStarsOverlay } from './components/MemoryStarsOverlay';
import { TopControls } from './components/TopControls';
import { UnifiedMemoryModal, MemoryHubTab } from './components/UnifiedMemoryModal';
import { ConfessionConfig, ParticleMode, ColorThemeId, MemoryStarPhoto, DiaryStarEntry } from './types';
import { COLOR_THEMES, DEFAULT_CONFIG, DEFAULT_MEMORY_STARS, DEFAULT_DIARY_STARS } from './constants/themes';
import { romanticAudio } from './utils/audio';
import { calculateDaysFromDate } from './utils/dateUtils';
import { Heart, Sparkles, Check } from 'lucide-react';

export default function App() {
  // Parse URL query parameters if shared, or load from localStorage with auto-calculated days
  const [config, setConfig] = useState<ConfessionConfig>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const to = params.get('to');
      const msg = params.get('msg');
      const from = params.get('from');
      const theme = params.get('theme') as ColorThemeId | null;
      const days = params.get('days');
      const date = params.get('date');

      let initialConfig: ConfessionConfig = DEFAULT_CONFIG;

      const stored = localStorage.getItem('romantic_confession_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        initialConfig = {
          ...DEFAULT_CONFIG,
          ...parsed,
          showDaysCounter: parsed.showDaysCounter !== false,
        };
      }

      if (to || msg || from || theme || days || date) {
        initialConfig = {
          recipient: to || initialConfig.recipient,
          message: msg || initialConfig.message,
          sender: from || initialConfig.sender,
          themeId: theme && COLOR_THEMES[theme] ? theme : initialConfig.themeId,
          daysTogether: days ? parseInt(days, 10) : initialConfig.daysTogether,
          showDaysCounter: true,
          dateStr: date || initialConfig.dateStr,
          anniversaryLabel: initialConfig.anniversaryLabel,
        };
      }

      // Automatically compute days based on the anniversary date
      const autoDays = calculateDaysFromDate(initialConfig.dateStr);
      return {
        ...initialConfig,
        daysTogether: autoDays,
      };
    } catch {
      return {
        ...DEFAULT_CONFIG,
        daysTogether: calculateDaysFromDate(DEFAULT_CONFIG.dateStr),
      };
    }
  });

  const [memoryStars, setMemoryStars] = useState<MemoryStarPhoto[]>(() => {
    try {
      const stored = localStorage.getItem('romantic_memory_stars');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_MEMORY_STARS;
  });

  const handleUpdateMemoryStars = (stars: MemoryStarPhoto[]) => {
    setMemoryStars(stars);
    try {
      localStorage.setItem('romantic_memory_stars', JSON.stringify(stars));
    } catch {
      // ignore
    }
  };
  
  // Diary Stars: load from localStorage with initial presets
  const [diaryStars, setDiaryStars] = useState<DiaryStarEntry[]>(() => {
    try {
      const stored = localStorage.getItem('romantic_diary_stars');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_DIARY_STARS;
  });

  const [isMemoryHubOpen, setIsMemoryHubOpen] = useState<boolean>(false);
  const [memoryHubTab, setMemoryHubTab] = useState<MemoryHubTab>('photos');
  const [selectedDiary, setSelectedDiary] = useState<DiaryStarEntry | null>(null);

  const [mode, setMode] = useState<ParticleMode>('galaxy');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentTheme = COLOR_THEMES[config.themeId] || COLOR_THEMES.rose;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Toggle ambient music
  const handleToggleSound = () => {
    const isPlaying = romanticAudio.toggleMusic();
    setIsAudioMuted(!isPlaying);
    showToast(isPlaying ? '已开启浪漫背景音效' : '已静音背景音效');
  };

  // Switch between galaxy drift, stardust and romantic heart shape
  const handleTriggerHeart = () => {
    if (mode === 'galaxy' || mode === 'stardust') {
      setMode('heart');
      // If audio is muted, gently remind or let them enjoy chimes
      romanticAudio.playChime(1.2);
    } else {
      // Periodic bloom burst
      setMode('bloom');
      romanticAudio.playChime(1.4);
      setTimeout(() => setMode('heart'), 800);
    }
  };

  const handleToggleMode = () => {
    setMode((prev) => {
      if (prev === 'heart') return 'stardust';
      if (prev === 'stardust') return 'galaxy';
      return 'heart';
    });
  };

  // Save new or edited diary star
  const handleSaveDiary = (entry: DiaryStarEntry) => {
    setDiaryStars((prev) => {
      const idx = prev.findIndex((d) => d.id === entry.id);
      let updated: DiaryStarEntry[];
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = entry;
      } else {
        updated = [entry, ...prev];
      }
      try {
        localStorage.setItem('romantic_diary_stars', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('✨ 新的心语星辰已化作光芒，融入星轨！');
  };

  // Delete diary star
  const handleDeleteDiary = (id: string) => {
    setDiaryStars((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('romantic_diary_stars', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('星语日记已归隐星空');
  };

  // Save config to state and localStorage with auto-calculated days
  const handleSaveConfig = (newCfg: ConfessionConfig) => {
    const autoDays = calculateDaysFromDate(newCfg.dateStr);
    const updated = {
      ...newCfg,
      daysTogether: autoDays,
    };
    setConfig(updated);
    try {
      localStorage.setItem('romantic_confession_config', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('✨ 纪念日与专属设置已保存！');
  };

  // Keyboard shortcut: Space to toggle heart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTriggerHeart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden select-none touch-none">
      {/* Dynamic Interactive Particle Canvas with Color Theme Switcher Dock */}
      <ParticleCanvas
        theme={currentTheme}
        mode={mode}
        onHeartActivated={() => {
          if (mode === 'galaxy') {
            setMode('heart');
          }
        }}
        isAudioMuted={isAudioMuted}
        onThemeChange={(newThm) => {
          handleSaveConfig({
            ...config,
            themeId: newThm.id,
          });
        }}
        isImmersive={isImmersive}
      />

      {/* Interactive Photo & Diary Stars on Trajectory with Hover Auto-Zoom */}
      <MemoryStarsOverlay
        stars={memoryStars}
        diaryStars={diaryStars}
        theme={currentTheme}
        mode={mode}
        isImmersive={isImmersive}
        onSelectDiary={(diary) => {
          setSelectedDiary(diary);
          setMemoryHubTab('diary');
          setIsMemoryHubOpen(true);
        }}
      />

      {/* Top Bar Controls with Integrated Non-Overlapping Anniversary Badge */}
      <TopControls
        isMuted={isAudioMuted}
        onToggleSound={handleToggleSound}
        isImmersive={isImmersive}
        onToggleImmersive={() => setIsImmersive(!isImmersive)}
        onOpenMemoryHub={() => {
          setSelectedDiary(null);
          setMemoryHubTab('photos');
          setIsMemoryHubOpen(true);
        }}
        onOpenAnniversarySettings={() => {
          setSelectedDiary(null);
          setMemoryHubTab('anniversary');
          setIsMemoryHubOpen(true);
        }}
        mode={mode}
        onToggleMode={handleToggleMode}
        dateStr={config.dateStr}
        daysTogether={config.daysTogether}
        anniversaryLabel={config.anniversaryLabel}
        showDaysCounter={config.showDaysCounter}
        glowColor={currentTheme.glow}
        sender={config.sender}
        recipient={config.recipient}
      />

      {/* Bottom Interactive Floating Hint */}
      {mode === 'galaxy' && !isImmersive && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-center px-4 w-full max-w-md transition-all duration-700 animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-xl">
            <Heart className="w-3.5 h-3.5 text-pink-300 fill-pink-300" />
            <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide font-romantic-serif">
              轻触屏幕绽放烟火 · 悬停星星查看照片与日记
            </span>
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
          </div>
        </div>
      )}

      {mode === 'stardust' && !isImmersive && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-center px-4 w-full max-w-md transition-all duration-700 animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide font-romantic-serif">
              漫步星尘漂浮中 · 悬停星星查看照片与日记
            </span>
          </div>
        </div>
      )}

      {/* Immersive Mode Exit Button */}
      {isImmersive && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => setIsImmersive(false)}
            className="px-5 py-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs text-slate-200 hover:text-white flex items-center gap-2 shadow-2xl transition-all cursor-pointer"
          >
            <span>退出沉浸模式</span>
          </button>
        </div>
      )}

      {/* Unified Photo & Diary Hub (回忆星册) */}
      <UnifiedMemoryModal
        isOpen={isMemoryHubOpen}
        onClose={() => {
          setIsMemoryHubOpen(false);
          setSelectedDiary(null);
        }}
        initialTab={memoryHubTab}
        theme={currentTheme}
        memoryStars={memoryStars}
        onUpdateMemoryStars={handleUpdateMemoryStars}
        diaryStars={diaryStars}
        onSaveDiary={handleSaveDiary}
        onDeleteDiary={handleDeleteDiary}
        initialSelectedDiary={selectedDiary}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-xs sm:text-sm text-white shadow-2xl">
            <Check className="w-4 h-4 text-pink-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

