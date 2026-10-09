import { useState, useEffect, useCallback, useRef } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { MemoryStarsOverlay } from './components/MemoryStarsOverlay';
import { TopControls } from './components/TopControls';
import { UnifiedMemoryModal, MemoryHubTab } from './components/UnifiedMemoryModal';
import { ConfessionConfig, ParticleMode, ColorThemeId, MemoryStarPhoto, DiaryStarEntry } from './types';
import { COLOR_THEMES, DEFAULT_CONFIG, DEFAULT_MEMORY_STARS, DEFAULT_DIARY_STARS } from './constants/themes';
import { romanticAudio } from './utils/audio';
import { calculateDaysFromDate } from './utils/dateUtils';
import { fetchContent, saveContent } from './utils/contentApi';
import { Heart, Sparkles, Check } from 'lucide-react';

const CONFIG_STORAGE_KEY = 'romantic_confession_config';
const MEMORY_STARS_STORAGE_KEY = 'romantic_memory_stars';
const DIARY_STARS_STORAGE_KEY = 'romantic_diary_stars';

function readStoredValue<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

function applyUrlOverrides(baseConfig: ConfessionConfig): ConfessionConfig {
  const params = new URLSearchParams(window.location.search);
  const to = params.get('to');
  const msg = params.get('msg');
  const from = params.get('from');
  const theme = params.get('theme') as ColorThemeId | null;
  const days = params.get('days');
  const date = params.get('date');

  if (!to && !msg && !from && !theme && !days && !date) {
    return baseConfig;
  }

  return {
    recipient: to || baseConfig.recipient,
    message: msg || baseConfig.message,
    sender: from || baseConfig.sender,
    themeId: theme && COLOR_THEMES[theme] ? theme : baseConfig.themeId,
    daysTogether: days ? parseInt(days, 10) : baseConfig.daysTogether,
    showDaysCounter: true,
    dateStr: date || baseConfig.dateStr,
    anniversaryLabel: baseConfig.anniversaryLabel,
  };
}

function buildInitialConfig(): ConfessionConfig {
  const stored = readStoredValue<Partial<ConfessionConfig>>(CONFIG_STORAGE_KEY);
  const merged = stored
    ? {
        ...DEFAULT_CONFIG,
        ...stored,
        showDaysCounter: stored.showDaysCounter !== false,
      }
    : DEFAULT_CONFIG;

  const withUrlOverrides = applyUrlOverrides(merged);
  return {
    ...withUrlOverrides,
    daysTogether: calculateDaysFromDate(withUrlOverrides.dateStr),
  };
}

function buildInitialMemoryStars(): MemoryStarPhoto[] {
  const stored = readStoredValue<MemoryStarPhoto[]>(MEMORY_STARS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : DEFAULT_MEMORY_STARS;
}

function buildInitialDiaryStars(): DiaryStarEntry[] {
  const stored = readStoredValue<DiaryStarEntry[]>(DIARY_STARS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : DEFAULT_DIARY_STARS;
}

export default function App() {
  const [config, setConfig] = useState<ConfessionConfig>(buildInitialConfig);
  const [memoryStars, setMemoryStars] = useState<MemoryStarPhoto[]>(buildInitialMemoryStars);
  const [diaryStars, setDiaryStars] = useState<DiaryStarEntry[]>(buildInitialDiaryStars);
  const [isMemoryHubOpen, setIsMemoryHubOpen] = useState<boolean>(false);
  const [memoryHubTab, setMemoryHubTab] = useState<MemoryHubTab>('photos');
  const [selectedDiary, setSelectedDiary] = useState<DiaryStarEntry | null>(null);
  const [mode, setMode] = useState<ParticleMode>('galaxy');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasLoadedServerContent = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const currentTheme = COLOR_THEMES[config.themeId] || COLOR_THEMES.rose;

  const persistContent = useCallback(
    async (nextContent: {
      config?: ConfessionConfig;
      memoryStars?: MemoryStarPhoto[];
      diaryStars?: DiaryStarEntry[];
    }) => {
      await saveContent({
        config: nextContent.config ?? config,
        memoryStars: nextContent.memoryStars ?? memoryStars,
        diaryStars: nextContent.diaryStars ?? diaryStars,
      });
    },
    [config, memoryStars, diaryStars]
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleUpdateMemoryStars = (stars: MemoryStarPhoto[]) => {
    setMemoryStars(stars);
    try {
      localStorage.setItem(MEMORY_STARS_STORAGE_KEY, JSON.stringify(stars));
    } catch {
      // ignore
    }
  };

  const handleSaveDiary = async (entry: DiaryStarEntry) => {
    const idx = diaryStars.findIndex((d) => d.id === entry.id);
    const updated =
      idx !== -1
        ? diaryStars.map((item) => (item.id === entry.id ? entry : item))
        : [entry, ...diaryStars];

    setDiaryStars(updated);
    if (selectedDiary?.id === entry.id) {
      setSelectedDiary(entry);
    }
    try {
      localStorage.setItem(DIARY_STARS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    try {
      await persistContent({ diaryStars: updated });
    } catch (error) {
      console.error('Failed to persist diary entry', error);
    }
    showToast('✨ 新的心语星辰已化作光芒，融入星轨！');
  };

  const handleDeleteDiary = (id: string) => {
    const updated = diaryStars.filter((d) => d.id !== id);
    setDiaryStars(updated);
    if (selectedDiary?.id === id) {
      setSelectedDiary(null);
    }
    try {
      localStorage.setItem(DIARY_STARS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    persistContent({ diaryStars: updated }).catch((error) => {
      console.error('Failed to delete diary entry on server', error);
    });
    showToast('星语日记已归隐星空');
  };

  const handleSaveConfig = (newCfg: ConfessionConfig) => {
    const autoDays = calculateDaysFromDate(newCfg.dateStr);
    const updated = {
      ...newCfg,
      daysTogether: autoDays,
    };
    setConfig(updated);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('✨ 纪念日与专属设置已保存！');
  };

  const handleToggleSound = () => {
    const isPlaying = romanticAudio.toggleMusic();
    setIsAudioMuted(!isPlaying);
    showToast(isPlaying ? '已开启浪漫背景音效' : '已静音背景音效');
  };

  const handleTriggerHeart = () => {
    if (mode === 'galaxy' || mode === 'stardust') {
      setMode('heart');
      romanticAudio.playChime(1.2);
    } else {
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

  useEffect(() => {
    let cancelled = false;

    const loadServerContent = async () => {
      try {
        const serverContent = await fetchContent();
        if (cancelled) return;

        if (serverContent.config) {
          const mergedConfig = applyUrlOverrides({
            ...DEFAULT_CONFIG,
            ...serverContent.config,
            showDaysCounter: serverContent.config.showDaysCounter !== false,
          });
          const hydratedConfig = {
            ...mergedConfig,
            daysTogether: calculateDaysFromDate(mergedConfig.dateStr),
          };
          setConfig(hydratedConfig);
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(hydratedConfig));
        }

        if (Array.isArray(serverContent.memoryStars)) {
          setMemoryStars(serverContent.memoryStars);
          localStorage.setItem(MEMORY_STARS_STORAGE_KEY, JSON.stringify(serverContent.memoryStars));
        }

        if (Array.isArray(serverContent.diaryStars)) {
          setDiaryStars(serverContent.diaryStars);
          localStorage.setItem(DIARY_STARS_STORAGE_KEY, JSON.stringify(serverContent.diaryStars));
        }
      } catch (error) {
        console.error('Failed to load content from server', error);
      } finally {
        if (!cancelled) {
          hasLoadedServerContent.current = true;
        }
      }
    };

    loadServerContent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedServerContent.current) return;

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveContent({
        config,
        memoryStars,
        diaryStars,
      }).catch((error) => {
        console.error('Failed to save content to server', error);
      });
    }, 500);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [config, memoryStars, diaryStars]);

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

      <MemoryStarsOverlay
        stars={memoryStars}
        diaryStars={diaryStars}
        theme={currentTheme}
        mode={mode}
        isImmersive={isImmersive}
      />

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
