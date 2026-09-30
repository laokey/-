import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { ConfessionConfig, ColorTheme, ParticleMode } from '../types';

interface ConfessionCardProps {
  config: ConfessionConfig;
  theme: ColorTheme;
  mode: ParticleMode;
  onTriggerHeart: () => void;
  onOpenCustomize: () => void;
  onShare: () => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
  config,
  theme,
  mode,
  onTriggerHeart,
  onOpenCustomize,
  onShare,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Typewriter effect for confession text
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);
    let index = 0;
    const fullText = config.message;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [config.message]);

  const isHeartActive = mode === 'heart' || mode === 'bloom';

  return (
    <div className="w-full max-w-md mx-auto transition-all duration-500 ease-out select-none">
      {/* Main Glassmorphism Card */}
      <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden border border-white/15">
        {/* Soft glowing ambient edge based on theme */}
        <div
          className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: theme.glow }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: theme.heartCenterColor }}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: theme.palette[0] }}
            />
            <span className="text-xs uppercase tracking-widest text-slate-300/80 font-medium">
              Romantic Stardust
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onShare}
              aria-label="分享告白"
              className="min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs text-slate-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? '展开卡片' : '收起卡片'}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Content - Collapsible */}
        {!isCollapsed && (
          <div className="mt-4 space-y-3.5 relative z-10">
            {/* Recipient */}
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-pink-200/60 font-romantic-serif">To:</span>
              <h2 className="text-lg md:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-pink-200 font-romantic-serif">
                {config.recipient || '最爱的你'}
              </h2>
            </div>

            {/* Confession Message with Typewriter glow */}
            <div className="min-h-[64px] bg-black/25 rounded-2xl p-3.5 border border-white/5">
              <p className="text-sm md:text-base leading-relaxed text-slate-100 font-romantic-serif font-normal tracking-wide">
                {displayedText}
                {!isTypingComplete && (
                  <span
                    className="inline-block w-1.5 h-4 ml-1 align-middle animate-pulse"
                    style={{ backgroundColor: theme.palette[0] }}
                  />
                )}
              </p>
            </div>

            {/* Card Footer: Signature & Days Counter */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              {config.showDaysCounter && config.daysTogether ? (
                <span className="text-pink-200/90 font-mono">
                  相伴相守第 <strong className="text-white font-bold">{config.daysTogether}</strong> 天
                </span>
              ) : (
                <span className="text-slate-400/80 tracking-wider">
                  {config.dateStr || 'FOREVER & ALWAYS'}
                </span>
              )}

              <div className="text-right">
                <span className="text-slate-400 text-xs">—— </span>
                <span className="text-rose-200 font-semibold">{config.sender || '你心中的那颗星'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Interactive Trigger Button */}
        <div className="mt-4 relative z-10">
          <button
            onClick={onTriggerHeart}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl font-medium text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.palette[0]} 0%, ${theme.heartCenterColor} 100%)`,
              boxShadow: `0 8px 24px ${theme.glow}`,
            }}
          >
            <Heart
              className={`w-4 h-4 fill-white ${isHeartActive ? 'animate-heart-pulse' : ''}`}
            />
            <span className="tracking-wide">
              {isHeartActive
                ? '心动律动中 · 轻触屏幕漫天烟火'
                : mode === 'stardust'
                ? '凝聚星尘为爱心 · 开启专属告白'
                : '点击点亮星芒 · 开启专属告白'}
            </span>
            <Sparkles className="w-4 h-4 text-white/90" />
          </button>
        </div>

        {/* Customize shortcut hint */}
        <div className="mt-2.5 text-center">
          <button
            onClick={onOpenCustomize}
            className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
          >
            自定义这封告白信与星空主题
          </button>
        </div>
      </div>
    </div>
  );
};
