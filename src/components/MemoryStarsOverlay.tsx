import React, { useState, useEffect, useRef } from 'react';
import { MemoryStarPhoto, DiaryStarEntry, ColorTheme, ParticleMode } from '../types';
import { calculateHeartbeatScale } from '../utils/heartMath';
import { romanticAudio } from '../utils/audio';
import { Sparkles, Calendar, Heart, X, ChevronLeft, ChevronRight, Eye, BookOpen, Feather } from 'lucide-react';

interface MemoryStarsOverlayProps {
  stars: MemoryStarPhoto[];
  diaryStars?: DiaryStarEntry[];
  theme: ColorTheme;
  mode: ParticleMode;
  isImmersive: boolean;
  onSelectDiary?: (diary: DiaryStarEntry) => void;
}

interface ActivePopup {
  id: string;
  type: 'photo' | 'diary';
  x: number;
  y: number;
  photoData?: MemoryStarPhoto;
  diaryData?: DiaryStarEntry;
}

export const MemoryStarsOverlay: React.FC<MemoryStarsOverlayProps> = ({
  stars,
  diaryStars = [],
  theme,
  mode,
  isImmersive,
  onSelectDiary,
}) => {
  const [photoPositions, setPhotoPositions] = useState<{ id: string; x: number; y: number }[]>([]);
  const [diaryPositions, setDiaryPositions] = useState<{ id: string; x: number; y: number }[]>([]);
  
  // Active locked popup state (coordinates are frozen at hover time to completely prevent shaking/jitter)
  const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);
  const activePopupRef = useRef<ActivePopup | null>(null);
  activePopupRef.current = activePopup;

  const photoPositionsRef = useRef<{ id: string; x: number; y: number }[]>([]);
  photoPositionsRef.current = photoPositions;

  const diaryPositionsRef = useRef<{ id: string; x: number; y: number }[]>([]);
  diaryPositionsRef.current = diaryPositions;

  const [selectedPhoto, setSelectedPhoto] = useState<MemoryStarPhoto | null>(null);
  const animRef = useRef<number | null>(null);
  const lastChimeTimeRef = useRef<number>(0);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time position tracking along active trajectory
  useEffect(() => {
    const updatePositions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 640;
      // Exactly screen centered to match ParticleCanvas
      const cy = height * 0.5;
      const cx = width * 0.5;
      const minDim = Math.min(width, height);
      const baseScale = isMobile ? minDim * 0.024 : minDim * 0.023;
      const maxR = minDim * 0.46;

      const timeInSec = performance.now() * 0.001;
      const heartData = calculateHeartbeatScale(timeInSec);
      const heartScale = heartData.scale;

      const currentLockedId = activePopupRef.current?.id;

      // Calculate photo star coordinates
      const newPhotoPos = stars.map((star) => {
        // If this star is currently hovered/active, freeze its coordinates so neither star nor card jitters!
        if (currentLockedId === star.id) {
          const existing = photoPositionsRef.current.find((p) => p.id === star.id);
          if (existing) return existing;
        }

        let x = cx;
        let y = cy;

        if (mode === 'heart' || mode === 'bloom') {
          const t = star.heartT;
          const sinT = Math.sin(t);
          const hx = 16 * Math.pow(sinT, 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          x = cx + hx * baseScale * heartScale;
          y = cy + hy * baseScale * heartScale;
        } else if (mode === 'stardust') {
          const baseX = width * star.stardustXFactor;
          const baseY = height * star.stardustYFactor;
          const driftX = Math.sin(timeInSec * 0.45 + star.galaxyInitialAngle) * 32;
          const driftY = Math.cos(timeInSec * 0.38 + star.galaxyInitialAngle) * 22;
          x = baseX + driftX;
          y = baseY + driftY;
        } else {
          const r = maxR * star.galaxyRadiusFactor;
          const angle = star.galaxyInitialAngle + timeInSec * 0.14;
          x = cx + Math.cos(angle) * r;
          y = cy + Math.sin(angle) * (r * 0.72);
        }

        return { id: star.id, x, y };
      });

      // Calculate diary star coordinates
      const newDiaryPos = diaryStars.map((diary) => {
        // If this diary star is currently hovered/active, freeze its coordinates
        if (currentLockedId === diary.id) {
          const existing = diaryPositionsRef.current.find((p) => p.id === diary.id);
          if (existing) return existing;
        }

        let x = cx;
        let y = cy;

        if (mode === 'heart' || mode === 'bloom') {
          const t = diary.heartT;
          const sinT = Math.sin(t);
          const hx = 16 * Math.pow(sinT, 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          x = cx + hx * baseScale * heartScale;
          y = cy + hy * baseScale * heartScale;
        } else if (mode === 'stardust') {
          const baseX = width * diary.stardustXFactor;
          const baseY = height * diary.stardustYFactor;
          const driftX = Math.sin(timeInSec * 0.42 + diary.galaxyInitialAngle) * 35;
          const driftY = Math.cos(timeInSec * 0.35 + diary.galaxyInitialAngle) * 25;
          x = baseX + driftX;
          y = baseY + driftY;
        } else {
          const r = maxR * diary.galaxyRadiusFactor;
          const angle = diary.galaxyInitialAngle + timeInSec * 0.12;
          x = cx + Math.cos(angle) * r;
          y = cy + Math.sin(angle) * (r * 0.72);
        }

        return { id: diary.id, x, y };
      });

      setPhotoPositions(newPhotoPos);
      setDiaryPositions(newDiaryPos);
      animRef.current = requestAnimationFrame(updatePositions);
    };

    animRef.current = requestAnimationFrame(updatePositions);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [stars, diaryStars, mode]);

  // Audio chimes on hover
  const triggerChime = () => {
    const now = performance.now();
    if (now - lastChimeTimeRef.current > 380) {
      lastChimeTimeRef.current = now;
      romanticAudio.playChime(1.35);
    }
  };

  // Hover handlers with debounce buffer to eliminate mouse jitter
  const handleStarMouseEnter = (star: MemoryStarPhoto, pos: { x: number; y: number }) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    if (activePopup?.id === star.id) return;

    triggerChime();
    setActivePopup({
      id: star.id,
      type: 'photo',
      x: pos.x,
      y: pos.y,
      photoData: star,
    });
  };

  const handleDiaryMouseEnter = (diary: DiaryStarEntry, pos: { x: number; y: number }) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    if (activePopup?.id === diary.id) return;

    triggerChime();
    setActivePopup({
      id: diary.id,
      type: 'diary',
      x: pos.x,
      y: pos.y,
      diaryData: diary,
    });
  };

  const handleItemMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setActivePopup(null);
    }, 160);
  };

  const handlePopupMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setActivePopup(null);
    }, 160);
  };

  const handlePhotoClick = (e: React.MouseEvent, star: MemoryStarPhoto) => {
    e.stopPropagation();
    setSelectedPhoto(star);
    romanticAudio.playChime(1.5);
  };

  const handleDiaryClick = (e: React.MouseEvent, diary: DiaryStarEntry) => {
    e.stopPropagation();
    onSelectDiary?.(diary);
    romanticAudio.playChime(1.45);
  };

  const handleLightboxNav = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPhoto) return;
    const currentIndex = stars.findIndex((s) => s.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % stars.length
        : (currentIndex - 1 + stars.length) % stars.length;
    setSelectedPhoto(stars[nextIndex]);
    romanticAudio.playChime(1.4);
  };

  if (isImmersive) return null;

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. Floating Interactive Star Tokens Layer             */}
      {/* ---------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {/* Photo Stars */}
        {stars.map((star) => {
          const pos = photoPositions.find((p) => p.id === star.id);
          if (!pos) return null;

          const isHovered = activePopup?.id === star.id;

          return (
            <div
              key={star.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute transition-transform duration-200 pointer-events-auto ${
                isHovered ? 'z-40' : 'z-20'
              }`}
              onMouseEnter={() => handleStarMouseEnter(star, pos)}
              onMouseLeave={handleItemMouseLeave}
              onClick={(e) => handlePhotoClick(e, star)}
            >
              {/* Star Token Pin */}
              <div className="relative group cursor-pointer">
                {/* Rotating Halo */}
                <div
                  className="absolute -inset-2.5 rounded-full border border-dashed border-amber-300/40 opacity-70 animate-spin"
                  style={{ animationDuration: '14s' }}
                />

                {/* Glow Backdrop */}
                <div
                  className="absolute -inset-1.5 rounded-full blur-sm transition-all duration-300"
                  style={{
                    background: isHovered
                      ? `radial-gradient(circle, ${theme.palette[0]} 0%, rgba(255,215,0,0.5) 100%)`
                      : 'rgba(255, 215, 0, 0.25)',
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  }}
                />

                {/* Sparkling Star Badge Accent */}
                <div className="absolute -top-1 -right-1 z-10 p-0.5 bg-gradient-to-r from-amber-300 to-rose-400 rounded-full shadow-md">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>

                {/* Circular Photo */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-xl bg-slate-900 ${
                    isHovered
                      ? 'border-amber-300 scale-110 shadow-amber-300/40'
                      : 'border-white/80 hover:border-pink-300 scale-100'
                  }`}
                >
                  <img
                    src={star.imageUrl}
                    alt={star.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                  />
                </div>

                {/* Floating Moniker Tag */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[10px] text-amber-200 font-romantic-serif font-medium tracking-wider shadow-sm">
                    {star.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Diary Stars */}
        {diaryStars.map((diary) => {
          const pos = diaryPositions.find((p) => p.id === diary.id);
          if (!pos) return null;

          const isHovered = activePopup?.id === diary.id;

          return (
            <div
              key={diary.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute transition-transform duration-200 pointer-events-auto ${
                isHovered ? 'z-40' : 'z-20'
              }`}
              onMouseEnter={() => handleDiaryMouseEnter(diary, pos)}
              onMouseLeave={handleItemMouseLeave}
              onClick={(e) => handleDiaryClick(e, diary)}
            >
              {/* Diary Star Token Pin */}
              <div className="relative group cursor-pointer">
                {/* Rotating Cyan/Lilac Halo */}
                <div
                  className="absolute -inset-2.5 rounded-full border border-dashed border-cyan-400/40 opacity-70 animate-spin"
                  style={{ animationDuration: '18s', animationDirection: 'reverse' }}
                />

                {/* Glow Backdrop */}
                <div
                  className="absolute -inset-1.5 rounded-full blur-sm transition-all duration-300"
                  style={{
                    background: isHovered
                      ? 'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(168,85,247,0.4) 100%)'
                      : 'rgba(56, 189, 248, 0.3)',
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  }}
                />

                {/* Quill / Book Badge Accent */}
                <div className="absolute -top-1 -right-1 z-10 p-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-md">
                  <Feather className="w-2.5 h-2.5 text-white" />
                </div>

                {/* Circular Diary Icon Badge */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-xl flex items-center justify-center bg-gradient-to-br from-[#1a1236] to-[#0c182b] ${
                    isHovered
                      ? 'border-cyan-300 scale-110 shadow-cyan-400/40'
                      : 'border-cyan-200/70 hover:border-pink-300 scale-100'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-cyan-200 group-hover:text-white transition-colors" />
                </div>

                {/* Floating Moniker Tag */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/30 text-[10px] text-cyan-200 font-romantic-serif font-medium tracking-wider shadow-sm">
                    {diary.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Standalone Rock-Solid Non-Jittering Popup Card Container Layer   */}
      {/* ------------------------------------------------------------------ */}
      {activePopup && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {(() => {
            const isRightHalf = activePopup.x > window.innerWidth * 0.52;
            const clampedY = Math.max(160, Math.min(window.innerHeight - 170, activePopup.y));
            
            // Fixed anchor coordinates captured at hover time: ZERO JITTER!
            const style: React.CSSProperties = isRightHalf
              ? {
                  left: `${activePopup.x - 20}px`,
                  top: `${clampedY}px`,
                  transform: 'translate(-100%, -50%)',
                }
              : {
                  left: `${activePopup.x + 20}px`,
                  top: `${clampedY}px`,
                  transform: 'translate(0, -50%)',
                };

            return (
              <div
                style={style}
                className="absolute pointer-events-auto transition-opacity duration-200 animate-in fade-in zoom-in-95"
                onMouseEnter={handlePopupMouseEnter}
                onMouseLeave={handlePopupMouseLeave}
              >
                {/* Photo Magnified Card */}
                {activePopup.type === 'photo' && activePopup.photoData && (
                  <div
                    className="w-56 sm:w-64 p-3 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/25 shadow-2xl text-left cursor-pointer"
                    style={{
                      boxShadow: `0 20px 48px -10px ${theme.glow}, 0 0 24px rgba(255,215,0,0.25)`,
                    }}
                    onClick={(e) => handlePhotoClick(e, activePopup.photoData!)}
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/20 shadow-inner group">
                      <img
                        src={activePopup.photoData.imageUrl}
                        alt={activePopup.photoData.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white flex items-center gap-1 opacity-90">
                        <Eye className="w-3 h-3 text-pink-300" />
                        <span>点击看大图</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          {activePopup.photoData.title}
                        </h4>
                        {activePopup.photoData.date && (
                          <span className="text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                            <Calendar className="w-2.5 h-2.5 text-pink-300" />
                            {activePopup.photoData.date}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-pink-100/90 leading-relaxed font-romantic-serif italic line-clamp-2">
                        “{activePopup.photoData.quote}”
                      </p>
                    </div>
                  </div>
                )}

                {/* Diary Magnified Card */}
                {activePopup.type === 'diary' && activePopup.diaryData && (
                  <div
                    className="w-64 sm:w-72 p-3.5 rounded-2xl bg-[#110b1f]/95 backdrop-blur-2xl border border-cyan-400/35 shadow-2xl text-left cursor-pointer"
                    style={{
                      boxShadow: '0 24px 50px -10px rgba(56,189,248,0.4), 0 0 25px rgba(168,85,247,0.3)',
                    }}
                    onClick={(e) => handleDiaryClick(e, activePopup.diaryData!)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-white/10 text-xs">
                      <span className="text-[11px] font-mono text-cyan-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-300" />
                        {activePopup.diaryData.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/20 text-[10px] text-cyan-200">
                        {activePopup.diaryData.weather || '璀璨星河'} · {activePopup.diaryData.mood || '心动 💖'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-wide font-romantic-serif mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span className="truncate">{activePopup.diaryData.title}</span>
                    </h4>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 mb-2">
                      <p className="text-xs text-rose-100/90 leading-relaxed font-romantic-serif italic line-clamp-3">
                        “{activePopup.diaryData.content}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-cyan-300/90 pt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3" />
                        点击展开阅读全文
                      </span>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. Full-screen Romantic Photo Lightbox Modal         */}
      {/* ---------------------------------------------------- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-[#160d21] border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 text-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `0 24px 60px -12px ${theme.glow}`,
            }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="关闭预览"
              className="absolute top-3 right-3 z-20 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => handleLightboxNav('prev', e)}
              aria-label="上一张相片"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => handleLightboxNav('next', e)}
              aria-label="下一张相片"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3.5 border border-white/15 shadow-inner">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center px-2 space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <h3 className="text-base font-semibold text-white tracking-wide font-romantic-serif">
                  {selectedPhoto.title}
                </h3>
              </div>
              {selectedPhoto.date && (
                <div className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-pink-300" />
                  <span>{selectedPhoto.date}</span>
                </div>
              )}
              <p className="text-sm text-rose-100/90 font-romantic-serif italic leading-relaxed pt-1">
                “{selectedPhoto.quote}”
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
