import React from 'react';
import { Volume2, VolumeX, Eye, Heart, Sparkles, Orbit, BookOpen } from 'lucide-react';
import { ParticleMode } from '../types';

interface TopControlsProps {
  isMuted: boolean;
  onToggleSound: () => void;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  onOpenMemoryHub: () => void;
  onOpenAnniversarySettings?: () => void;
  mode: ParticleMode;
  onToggleMode: () => void;
  dateStr?: string;
  daysTogether?: number;
  anniversaryLabel?: string;
  showDaysCounter?: boolean;
  glowColor?: string;
  sender?: string;
  recipient?: string;
}

export const TopControls: React.FC<TopControlsProps> = ({
  isMuted,
  onToggleSound,
  isImmersive,
  onToggleImmersive,
  onOpenMemoryHub,
  onOpenAnniversarySettings,
  mode,
  onToggleMode,
  dateStr,
  daysTogether,
  anniversaryLabel = '相恋',
  showDaysCounter = true,
  glowColor,
  sender,
  recipient,
}) => {
  const getModeInfo = () => {
    switch (mode) {
      case 'heart':
        return {
          label: '心动爱心',
          icon: <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />,
          nextTitle: '切换为慢速飘动星尘',
        };
      case 'stardust':
        return {
          label: '星尘漫游',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />,
          nextTitle: '切换为星海旋涡',
        };
      case 'galaxy':
      default:
        return {
          label: '星海旋涡',
          icon: <Orbit className="w-3.5 h-3.5 text-cyan-300" />,
          nextTitle: '凝聚为心动爱心',
        };
    }
  };

  const modeInfo = getModeInfo();

  if (isImmersive) return null;

  const handleAnniversaryClick = () => {
    if (onOpenAnniversarySettings) {
      onOpenAnniversarySettings();
    } else {
      onOpenMemoryHub();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 pointer-events-none">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Zone 1: Brand Wordmark */}
        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          <span className="text-base sm:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-white font-romantic-serif select-none">
            心动星芒
          </span>
        </div>

        {/* Zone 2 (Desktop): Commemoration Date Badge (Click to configure anniversary) */}
        {showDaysCounter && (
          <div className="hidden md:flex items-center justify-center pointer-events-auto">
            <button
              onClick={handleAnniversaryClick}
              title="点击调整专属纪念日与相伴天数"
              className="group px-4 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/20 hover:border-pink-400/60 shadow-xl flex items-center gap-2 text-xs sm:text-sm text-slate-100 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
              style={{
                boxShadow: `0 4px 20px -4px ${glowColor || 'rgba(255, 182, 193, 0.25)'}`,
              }}
            >
              {(sender || recipient) && (
                <>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-200">
                    <span className="truncate max-w-[80px] sm:max-w-[100px]">{sender || '我'}</span>
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0 animate-pulse" />
                    <span className="truncate max-w-[80px] sm:max-w-[100px]">{recipient || 'TA'}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-pink-400/60" />
                </>
              )}
              <div className="flex items-center gap-1 text-rose-300 group-hover:text-rose-200">
                {!(sender || recipient) && (
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse shrink-0 mr-0.5" />
                )}
                <span className="font-romantic-serif text-xs sm:text-sm font-semibold">
                  {anniversaryLabel}第{' '}
                  <span className="font-mono text-sm sm:text-base text-white font-bold">{daysTogether || 520}</span> 天
                </span>
              </div>
              <Sparkles className="w-3 h-3 text-amber-300 opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          </div>
        )}

        {/* Zone 3: Compact Clean Controls */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Toggle Mode: Heart -> Stardust -> Galaxy */}
          <button
            onClick={onToggleMode}
            title={`${modeInfo.label} (${modeInfo.nextTitle})`}
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            {modeInfo.icon}
            <span className="hidden sm:inline">{modeInfo.label}</span>
          </button>

          {/* Unified Photo & Diary Hub: 回忆星册 */}
          <button
            onClick={onOpenMemoryHub}
            title="回忆星册 (定制轨迹照片与星语日记)"
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-purple-500/20 hover:from-cyan-500/35 hover:via-pink-500/35 hover:to-purple-500/35 backdrop-blur-md border border-pink-300/30 text-xs text-pink-200 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-300" />
            <span className="hidden sm:inline">回忆星册</span>
          </button>

          {/* Ambient Romantic Music Toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? '开启浪漫背景音效' : '静音背景音效'}
            className="min-h-[40px] min-w-[40px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-pink-300 animate-pulse" />}
          </button>

          {/* Immersive View Toggle */}
          <button
            onClick={onToggleImmersive}
            title="沉浸全屏星空"
            className="min-h-[40px] min-w-[40px] rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet (< md): Commemoration Date Badge cleanly wrapped on separate row below controls */}
      {showDaysCounter && (
        <div className="md:hidden flex justify-center mt-2.5 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={handleAnniversaryClick}
            title="点击调整专属纪念日与相伴天数"
            className="group px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-xl border border-white/20 hover:border-pink-400/60 shadow-xl flex items-center gap-1.5 text-xs text-slate-100 hover:text-white transition-all active:scale-95 cursor-pointer max-w-[95vw]"
            style={{
              boxShadow: `0 4px 16px -4px ${glowColor || 'rgba(255, 182, 193, 0.25)'}`,
            }}
          >
            {(sender || recipient) && (
              <>
                <div className="flex items-center gap-1 font-semibold text-rose-200">
                  <span className="truncate max-w-[55px] sm:max-w-[75px]">{sender || '我'}</span>
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400 shrink-0 animate-pulse" />
                  <span className="truncate max-w-[55px] sm:max-w-[75px]">{recipient || 'TA'}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-pink-400/60" />
              </>
            )}
            <div className="flex items-center gap-1 text-rose-300">
              {!(sender || recipient) && (
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-pulse shrink-0 mr-0.5" />
              )}
              <span className="font-romantic-serif text-xs font-semibold">
                {anniversaryLabel}第{' '}
                <span className="font-mono text-xs text-white font-bold">{daysTogether || 520}</span> 天
              </span>
            </div>
            <Sparkles className="w-3 h-3 text-amber-300 opacity-80 shrink-0" />
          </button>
        </div>
      )}
    </header>
  );
};
