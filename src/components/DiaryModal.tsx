import React, { useState, useEffect } from 'react';
import { DiaryStarEntry, ColorTheme } from '../types';
import { X, Sparkles, BookOpen, Heart, Calendar, CloudSun, Trash2, Edit3, Check } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDiary: (entry: DiaryStarEntry) => void;
  onDeleteDiary?: (id: string) => void;
  initialDiary?: DiaryStarEntry | null; // If viewing/editing an existing diary
  theme: ColorTheme;
}

const MOOD_OPTIONS = ['心动 💖', '甜蜜 🍯', '幸福 🥰', '想你 🌙', '温暖 ☕', '星愿 ✨'];
const WEATHER_OPTIONS = ['璀璨星河 🌌', '橘色晚霞 🌇', '晴朗阳光 ☀️', '细雪纷飞 ❄️', '浪漫微风 🍃'];

export const DiaryModal: React.FC<DiaryModalProps> = ({
  isOpen,
  onClose,
  onSaveDiary,
  onDeleteDiary,
  initialDiary,
  theme,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!initialDiary);
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [mood, setMood] = useState<string>(MOOD_OPTIONS[0]);
  const [weather, setWeather] = useState<string>(WEATHER_OPTIONS[0]);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (initialDiary) {
      setTitle(initialDiary.title);
      setDate(initialDiary.date);
      setMood(initialDiary.mood || MOOD_OPTIONS[0]);
      setWeather(initialDiary.weather || WEATHER_OPTIONS[0]);
      setContent(initialDiary.content);
      setIsEditing(false);
    } else {
      // Create new diary entry
      const now = new Date();
      const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
        now.getDate()
      ).padStart(2, '0')}`;
      setTitle('');
      setDate(formattedDate);
      setMood(MOOD_OPTIONS[0]);
      setWeather(WEATHER_OPTIONS[0]);
      setContent('');
      setIsEditing(true);
    }
  }, [initialDiary, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const newOrUpdated: DiaryStarEntry = {
      id: initialDiary ? initialDiary.id : `diary-${Date.now()}`,
      title: title.trim(),
      date: date.trim() || '今日星光',
      mood,
      weather,
      content: content.trim(),
      galaxyRadiusFactor: initialDiary ? initialDiary.galaxyRadiusFactor : 0.4 + Math.random() * 0.45,
      galaxySpeed: initialDiary ? initialDiary.galaxySpeed : 0.0003 + Math.random() * 0.0002,
      galaxyInitialAngle: initialDiary ? initialDiary.galaxyInitialAngle : Math.random() * Math.PI * 2,
      heartT: initialDiary ? initialDiary.heartT : Math.random() * Math.PI * 2,
      stardustXFactor: initialDiary ? initialDiary.stardustXFactor : 0.15 + Math.random() * 0.7,
      stardustYFactor: initialDiary ? initialDiary.stardustYFactor : 0.18 + Math.random() * 0.65,
      createdAt: initialDiary ? initialDiary.createdAt : Date.now(),
    };

    onSaveDiary(newOrUpdated);
    romanticAudio.playFireworkSound(0, 0.4);
    onClose();
  };

  const handleDelete = () => {
    if (!initialDiary || !onDeleteDiary) return;
    onDeleteDiary(initialDiary.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#140d21] border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-7 text-white"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 24px 60px -12px ${theme.glow}, 0 0 25px rgba(255, 215, 0, 0.15)`,
        }}
      >
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-300" />
            <h3 className="text-base sm:text-lg font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-cyan-200 font-romantic-serif">
              {initialDiary ? (isEditing ? '编辑星语日记' : '星语日记') : '写下一颗心愿日记星'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {initialDiary && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                title="编辑此篇日记"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {initialDiary && onDeleteDiary && (
              <button
                onClick={handleDelete}
                title="删除此星语日记"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="关闭日记"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ---------------- Reading Mode ---------------- */}
        {initialDiary && !isEditing ? (
          <div className="space-y-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-pink-200 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-300" />
                {initialDiary.date}
              </span>

              <div className="flex items-center gap-1.5">
                {initialDiary.weather && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/20 text-cyan-200 text-xs">
                    {initialDiary.weather}
                  </span>
                )}
                {initialDiary.mood && (
                  <span className="px-2.5 py-1 rounded-full bg-pink-950/60 border border-pink-400/20 text-pink-200 text-xs">
                    {initialDiary.mood}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-white font-romantic-serif tracking-wide border-l-2 border-pink-400 pl-3">
              {initialDiary.title}
            </h2>

            {/* Content Body */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 max-h-[48vh] overflow-y-auto">
              <p className="text-sm sm:text-base text-rose-50/95 leading-relaxed whitespace-pre-wrap font-romantic-serif tracking-wide">
                {initialDiary.content}
              </p>
            </div>

            {/* Footer Prompt */}
            <div className="pt-2 text-center text-xs text-slate-400 font-romantic-serif flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>这篇日记正化作星轨中的一颗璀璨星宿，永远为你闪烁</span>
            </div>
          </div>
        ) : (
          /* ---------------- Editing / Creating Mode ---------------- */
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                日记标题 / 心动时刻
              </label>
              <input
                type="text"
                value={title}
                maxLength={30}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：第一次牵手的傍晚 / 看日落的那个夏夜"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {/* Date & Mood / Weather Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">纪念日期</label>
                <input
                  type="text"
                  value={date}
                  maxLength={16}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="2024.05.20"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">当时天气</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1d122e] border border-white/15 text-xs text-white focus:outline-none focus:border-pink-400"
                >
                  {WEATHER_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">心动心情</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1d122e] border border-white/15 text-xs text-white focus:outline-none focus:border-pink-400"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diary Content Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  心语日记正文
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{content.length}/500</span>
              </div>
              <textarea
                rows={5}
                value={content}
                maxLength={500}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录属于你们的甜蜜瞬间、悄悄话或温暖回忆...保存后将化作星光悬挂在粒子星空中！"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-pink-400 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-rose-500 text-xs font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>点亮为日记星 · 放飞星轨</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
