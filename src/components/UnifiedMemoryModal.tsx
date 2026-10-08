import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Check,
  Copy,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ConfessionConfig, MemoryStarPhoto, DiaryStarEntry, ColorTheme } from '../types';
import { calculateDaysFromDate, formatDateToStandard, formatDateToInputFormat } from '../utils/dateUtils';
import { romanticAudio } from '../utils/audio';
import { uploadImage } from '../utils/contentApi';

export type MemoryHubTab = 'photos' | 'diary' | 'anniversary';

interface UnifiedMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MemoryHubTab;
  theme: ColorTheme;
  // Photo Stars
  memoryStars: MemoryStarPhoto[];
  onUpdateMemoryStars: (stars: MemoryStarPhoto[]) => void;
  // Diary Stars
  diaryStars: DiaryStarEntry[];
  onSaveDiary: (entry: DiaryStarEntry) => Promise<void> | void;
  onDeleteDiary?: (id: string) => void;
  initialSelectedDiary?: DiaryStarEntry | null;
  // Anniversary Config
  config: ConfessionConfig;
  onSaveConfig: (newConfig: ConfessionConfig) => void;
}

const MOOD_OPTIONS = ['心动 💖', '甜蜜 🍯', '幸福 🥰', '想你 🌙', '温暖 ☕', '星愿 ✨'];
const WEATHER_OPTIONS = ['璀璨星河 🌌', '橘色晚霞 🌇', '晴朗阳光 ☀️', '细雪纷飞 ❄️', '浪漫微风 🍃'];

export const UnifiedMemoryModal: React.FC<UnifiedMemoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'photos',
  theme,
  memoryStars,
  onUpdateMemoryStars,
  diaryStars,
  onSaveDiary,
  onDeleteDiary,
  initialSelectedDiary,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<MemoryHubTab>(initialTab);
  const [editingStarId, setEditingStarId] = useState<string | null>(null);

  // Diary compose/edit states
  const [isComposingDiary, setIsComposingDiary] = useState<boolean>(false);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [diaryTitle, setDiaryTitle] = useState<string>('');
  const [diaryDate, setDiaryDate] = useState<string>('');
  const [diaryMood, setDiaryMood] = useState<string>(MOOD_OPTIONS[0]);
  const [diaryWeather, setDiaryWeather] = useState<string>(WEATHER_OPTIONS[0]);
  const [diaryContent, setDiaryContent] = useState<string>('');

  // Anniversary state
  const [annivData, setAnnivData] = useState<ConfessionConfig>(config);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    setAnnivData(config);
  }, [config, isOpen]);

  // Handle opening with a specific diary star selected from the trajectory
  useEffect(() => {
    if (initialSelectedDiary) {
      setActiveTab('diary');
      setEditingDiaryId(initialSelectedDiary.id);
      setDiaryTitle(initialSelectedDiary.title);
      setDiaryDate(initialSelectedDiary.date);
      setDiaryMood(initialSelectedDiary.mood || MOOD_OPTIONS[0]);
      setDiaryWeather(initialSelectedDiary.weather || WEATHER_OPTIONS[0]);
      setDiaryContent(initialSelectedDiary.content);
      setIsComposingDiary(true);
    }
  }, [initialSelectedDiary]);

  if (!isOpen) return null;

  // --- Photo Stars Handlers ---
  const handlePhotoUpload = async (starId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const newImgUrl = await uploadImage(file);
      const updated = memoryStars.map((s) =>
        s.id === starId ? { ...s, imageUrl: newImgUrl } : s
      );
      onUpdateMemoryStars(updated);
      romanticAudio.playChime(1.5);
    } catch (error) {
      console.error('Failed to upload photo star image', error);
    }
  };

  const handleAddNewPhotoStar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      const newPhoto: MemoryStarPhoto = {
        id: `photo-${Date.now()}`,
        title: `星光合照 ${memoryStars.length + 1}`,
        quote: '把我们的浪漫，写进浩瀚星河的每一颗星宿',
        imageUrl,
        galaxyRadiusFactor: 0.28 + Math.random() * 0.42,
        galaxySpeed: 0.00025 + Math.random() * 0.0002,
        galaxyInitialAngle: Math.random() * Math.PI * 2,
        heartT: Math.random() * Math.PI * 2,
        stardustXFactor: 0.15 + Math.random() * 0.7,
        stardustYFactor: 0.2 + Math.random() * 0.6,
        date: '甜蜜瞬间',
      };
      onUpdateMemoryStars([...memoryStars, newPhoto]);
      romanticAudio.playFireworkSound(0, 0.4);
    } catch (error) {
      console.error('Failed to upload new photo star image', error);
    }
  };

  const handleDeletePhotoStar = (starId: string) => {
    const updated = memoryStars.filter((s) => s.id !== starId);
    onUpdateMemoryStars(updated);
    if (editingStarId === starId) {
      setEditingStarId(null);
    }
    romanticAudio.playChime(0.9);
  };

  const handleStarTextChange = (starId: string, field: 'title' | 'quote', val: string) => {
    const updated = memoryStars.map((s) =>
      s.id === starId ? { ...s, [field]: val } : s
    );
    onUpdateMemoryStars(updated);
  };

  // --- Diary Handlers ---
  const handleStartCompose = () => {
    const now = new Date();
    const formatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')}`;
    setEditingDiaryId(null);
    setDiaryTitle('');
    setDiaryDate(formatted);
    setDiaryMood(MOOD_OPTIONS[0]);
    setDiaryWeather(WEATHER_OPTIONS[0]);
    setDiaryContent('');
    setIsComposingDiary(true);
  };

  const handleSelectDiaryToView = (entry: DiaryStarEntry) => {
    setEditingDiaryId(entry.id);
    setDiaryTitle(entry.title);
    setDiaryDate(entry.date);
    setDiaryMood(entry.mood || MOOD_OPTIONS[0]);
    setDiaryWeather(entry.weather || WEATHER_OPTIONS[0]);
    setDiaryContent(entry.content);
    setIsComposingDiary(true);
  };

  const handleSaveDiaryEntry = async () => {
    if (!diaryTitle.trim() || !diaryContent.trim()) return;

    const existing = diaryStars.find((d) => d.id === editingDiaryId);
    const newOrUpdated: DiaryStarEntry = {
      id: editingDiaryId || `diary-${Date.now()}`,
      title: diaryTitle.trim(),
      date: diaryDate.trim() || '今日星光',
      mood: diaryMood,
      weather: diaryWeather,
      content: diaryContent.trim(),
      galaxyRadiusFactor: existing ? existing.galaxyRadiusFactor : 0.35 + Math.random() * 0.45,
      galaxySpeed: existing ? existing.galaxySpeed : 0.0003 + Math.random() * 0.0002,
      galaxyInitialAngle: existing ? existing.galaxyInitialAngle : Math.random() * Math.PI * 2,
      heartT: existing ? existing.heartT : Math.random() * Math.PI * 2,
      stardustXFactor: existing ? existing.stardustXFactor : 0.15 + Math.random() * 0.7,
      stardustYFactor: existing ? existing.stardustYFactor : 0.18 + Math.random() * 0.65,
      createdAt: existing ? existing.createdAt : Date.now(),
    };

    await onSaveDiary(newOrUpdated);
    romanticAudio.playFireworkSound(0, 0.4);
    setIsComposingDiary(false);
    setEditingDiaryId(null);
  };

  const handleDeleteDiaryEntry = (id: string) => {
    if (!onDeleteDiary) return;
    onDeleteDiary(id);
    if (editingDiaryId === id) {
      setIsComposingDiary(false);
      setEditingDiaryId(null);
    }
  };

  // --- Anniversary Handlers ---
  const handleAnnivDateChange = (val: string) => {
    const formatted = formatDateToStandard(val);
    const autoDays = calculateDaysFromDate(formatted);
    const updated = {
      ...annivData,
      dateStr: formatted,
      daysTogether: autoDays,
    };
    setAnnivData(updated);
    onSaveConfig(updated);
  };

  const handleAnnivFieldChange = (field: keyof ConfessionConfig, value: unknown) => {
    const updated = { ...annivData, [field]: value };
    setAnnivData(updated);
    onSaveConfig(updated);
  };

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      if (annivData.dateStr) url.searchParams.set('date', annivData.dateStr);
      if (annivData.showDaysCounter && annivData.daysTogether) {
        url.searchParams.set('days', String(annivData.daysTogether));
      }
      if (annivData.sender) url.searchParams.set('from', annivData.sender);
      if (annivData.recipient) url.searchParams.set('to', annivData.recipient);
      url.searchParams.set('theme', annivData.themeId);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#140e21] border border-white/20 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-100 z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 24px 60px -12px ${theme.glow}, 0 0 25px rgba(255, 182, 193, 0.15)`,
        }}
      >
        {/* Mobile Grab Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header Bar with Integrated Tabs */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          {/* Segmented Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>照片星</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'diary'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>星语日记</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('anniversary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'anniversary'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-300" />
              <span>纪念日</span>
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="关闭"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* TAB 1: 📸 照片星设置 */}
          {activeTab === 'photos' && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-300" />
                    星空轨迹照片星定制
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    悬浮在星轨上的专属合照星，鼠标悬停或轻触即可全屏放大赏阅
                  </p>
                </div>

                {/* Add New Photo Star Button */}
                <label
                  htmlFor="upload-new-photo-star"
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加照片星</span>
                </label>
                <input
                  id="upload-new-photo-star"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddNewPhotoStar}
                />
              </div>

              {memoryStars.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/15">
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">目前星轨上还没有照片星哦</p>
                  <label
                    htmlFor="upload-empty-photo-star"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>上传第一张照片星</span>
                  </label>
                  <input
                    id="upload-empty-photo-star"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddNewPhotoStar}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memoryStars.map((star) => (
                    <div
                      key={star.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-300/40 transition-all flex flex-col gap-2 relative group"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Image Thumbnail with Overlay Upload */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-300/50 shrink-0 shadow-md">
                          <img
                            src={star.imageUrl}
                            alt={star.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <label
                            htmlFor={`upload-hub-${star.id}`}
                            title="点击更换照片"
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          >
                            <Upload className="w-4 h-4 text-amber-300" />
                          </label>
                          <input
                            id={`upload-hub-${star.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(star.id, e)}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-white truncate">
                            {star.title}
                          </span>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            “{star.quote}”
                          </p>
                          <label
                            htmlFor={`upload-hub-${star.id}`}
                            className="inline-block mt-1 text-[11px] text-pink-400 hover:text-pink-300 font-medium cursor-pointer"
                          >
                            更换合照 ↗
                          </label>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStarId(editingStarId === star.id ? null : star.id)
                            }
                            className="px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                          >
                            {editingStarId === star.id ? '收起' : '修改文案'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePhotoStar(star.id)}
                            title="从星轨移除此照片星"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline edit title / caption drawer */}
                      {editingStarId === star.id && (
                        <div className="space-y-2 pt-2 border-t border-white/10 animate-in fade-in duration-200">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">星名</label>
                            <input
                              type="text"
                              value={star.title}
                              maxLength={10}
                              onChange={(e) => handleStarTextChange(star.id, 'title', e.target.value)}
                              placeholder="星名"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">专属情话</label>
                            <textarea
                              rows={2}
                              value={star.quote}
                              maxLength={50}
                              onChange={(e) => handleStarTextChange(star.id, 'quote', e.target.value)}
                              placeholder="浪漫情话"
                              className="w-full px-2.5 py-1 text-xs rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-pink-500 resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 📖 星语日记设置 */}
          {activeTab === 'diary' && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* Top bar in Diary tab: write new or view list */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-300" />
                    星语日记（化作星轨中的日记星）
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    记录相爱的每刻心情，化作青蓝光晕的日记星在星空长明
                  </p>
                </div>

                {!isComposingDiary ? (
                  <button
                    type="button"
                    onClick={handleStartCompose}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-semibold hover:from-cyan-600 hover:to-purple-700 shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>写新日记</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposingDiary(false);
                      setEditingDiaryId(null);
                    }}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    返回列表
                  </button>
                )}
              </div>

              {/* Compose/Edit Mode */}
              {isComposingDiary ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        日记星标题
                      </label>
                      <input
                        type="text"
                        value={diaryTitle}
                        onChange={(e) => setDiaryTitle(e.target.value)}
                        placeholder="如：今夜看星星、第一次牵手"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        日期标记
                      </label>
                      <input
                        type="text"
                        value={diaryDate}
                        onChange={(e) => setDiaryDate(e.target.value)}
                        placeholder="2024.05.20"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Mood Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      此时心情
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {MOOD_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setDiaryMood(m)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                            diaryMood === m
                              ? 'bg-pink-600/40 border-pink-400 text-white shadow-sm'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      天空星象 / 天气
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEATHER_OPTIONS.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setDiaryWeather(w)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                            diaryWeather === w
                              ? 'bg-cyan-600/40 border-cyan-400 text-white shadow-sm'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      写下想对TA说的心里话
                    </label>
                    <textarea
                      rows={10}
                      value={diaryContent}
                      onChange={(e) => setDiaryContent(e.target.value)}
                      placeholder="这一刻关于你的温暖、思念或感动..."
                      className="min-h-[220px] w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400 resize-y leading-relaxed whitespace-pre-wrap"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    {editingDiaryId && onDeleteDiary ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteDiaryEntry(editingDiaryId)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1 border border-rose-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除此星</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsComposingDiary(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDiaryEntry}
                        disabled={!diaryTitle.trim() || !diaryContent.trim()}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                      >
                        发射化作日记星
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Diary Stars List */
                <div className="space-y-2.5">
                  {diaryStars.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/15">
                      <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">目前还没有写下星语日记哦</p>
                      <button
                        type="button"
                        onClick={handleStartCompose}
                        className="mt-3 px-4 py-1.5 rounded-full bg-cyan-600/40 text-cyan-200 border border-cyan-400/40 text-xs font-medium hover:bg-cyan-600/60 cursor-pointer"
                      >
                        写下第一颗日记星
                      </button>
                    </div>
                  ) : (
                    diaryStars.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleSelectDiaryToView(entry)}
                        className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                            <span className="font-semibold text-xs text-white truncate font-romantic-serif">
                              {entry.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-pink-300 border border-white/10">
                              {entry.mood}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-1">
                            {entry.content}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            {entry.date} · {entry.weather}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-cyan-300 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 💑 纪念日设置 */}
          {activeTab === 'anniversary' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-300" />
                    专属纪念日期与相伴天数
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    选择纪念日，系统将根据当前日期每天自动精准计算相恋相伴天数
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleAnnivFieldChange('showDaysCounter', !annivData.showDaysCounter)
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    annivData.showDaysCounter ? 'bg-pink-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                      annivData.showDaysCounter ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {annivData.showDaysCounter && (
                <div className="space-y-3.5 pt-2">
                  {/* Both Partners' Nicknames */}
                  <div className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-2.5">
                    <span className="text-xs font-semibold text-pink-200 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                      专属恋爱昵称（将同步展示于星空顶端与纪念徽章）
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          我的昵称
                        </label>
                        <input
                          type="text"
                          value={annivData.sender || ''}
                          maxLength={12}
                          onChange={(e) => handleAnnivFieldChange('sender', e.target.value)}
                          placeholder="如：阿星 / 某某先生"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          TA的昵称
                        </label>
                        <input
                          type="text"
                          value={annivData.recipient || ''}
                          maxLength={12}
                          onChange={(e) => handleAnnivFieldChange('recipient', e.target.value)}
                          placeholder="如：小月 / 某某小仙女"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        纪念起始日期 (日历选择或手填)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={annivData.dateStr || '2024.05.20'}
                          onChange={(e) => handleAnnivDateChange(e.target.value)}
                          placeholder="2024.05.20"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                        />
                        <input
                          type="date"
                          value={formatDateToInputFormat(annivData.dateStr)}
                          title="从日历选择日期（系统将自动实时测算天数）"
                          onChange={(e) => handleAnnivDateChange(e.target.value)}
                          className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        关系文案
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {['相恋', '相爱', '相伴', '初遇'].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleAnnivFieldChange('anniversaryLabel', label)}
                            className={`py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                              (annivData.anniversaryLabel || '相恋') === label
                                ? 'bg-pink-600/40 border-pink-400 text-white'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Automatic Days Result Display */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 bg-black/30 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300">自动测算相伴：</span>
                      <span className="text-sm font-bold font-mono text-pink-300">
                        第 {annivData.daysTogether} 天
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-300 shrink-0" />
                        根据纪念日自动实时计算
                      </span>
                    </div>

                    {/* Badge Preview */}
                    <div className="px-3.5 py-1.5 rounded-full bg-black/60 border border-white/20 text-[11px] text-pink-200 flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
                      {(annivData.sender || annivData.recipient) && (
                        <>
                          <span className="font-semibold text-white">
                            {annivData.sender || '我'}
                          </span>
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse shrink-0" />
                          <span className="font-semibold text-white">
                            {annivData.recipient || 'TA'}
                          </span>
                          <span className="text-white/40">·</span>
                        </>
                      )}
                      {!(annivData.sender || annivData.recipient) && (
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse shrink-0" />
                      )}
                      <span>{annivData.anniversaryLabel || '相恋'}第 {annivData.daysTogether} 天</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions: Copy Share Link & Save */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex-1 min-h-[42px] py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">专属星空链接已复制到剪贴板！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>复制专属星空链接发给TA</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="min-h-[42px] py-2 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold hover:from-pink-600 hover:to-rose-700 shadow-md transition-all cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
