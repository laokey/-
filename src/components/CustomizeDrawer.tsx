import React, { useState } from 'react';
import { X, Check, Copy, Sparkles, Heart, Image as ImageIcon, Upload, Calendar } from 'lucide-react';
import { ConfessionConfig, MemoryStarPhoto } from '../types';
import { calculateDaysFromDate, formatDateToStandard, formatDateToInputFormat } from '../utils/dateUtils';

interface CustomizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfessionConfig;
  onSave: (newConfig: ConfessionConfig) => void;
  memoryStars?: MemoryStarPhoto[];
  onUpdateMemoryStars?: (stars: MemoryStarPhoto[]) => void;
}

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  memoryStars = [],
  onUpdateMemoryStars,
}) => {
  const [formData, setFormData] = useState<ConfessionConfig>(config);
  const [copied, setCopied] = useState(false);
  const [editingStarId, setEditingStarId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof ConfessionConfig, value: unknown) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSave(updated);
  };

  // Automatically calculate days whenever anniversary date is changed
  const handleDateChange = (val: string) => {
    const formatted = formatDateToStandard(val);
    const autoDays = calculateDaysFromDate(formatted);
    const updated = {
      ...formData,
      dateStr: formatted,
      daysTogether: autoDays,
    };
    setFormData(updated);
    onSave(updated);
  };

  // Custom photo upload for star
  const handlePhotoUpload = (starId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateMemoryStars) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        const newImgUrl = ev.target.result;
        const updatedStars = memoryStars.map((s) =>
          s.id === starId ? { ...s, imageUrl: newImgUrl } : s
        );
        onUpdateMemoryStars(updatedStars);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStarTextChange = (starId: string, field: 'title' | 'quote', val: string) => {
    if (!onUpdateMemoryStars) return;
    const updatedStars = memoryStars.map((s) =>
      s.id === starId ? { ...s, [field]: val } : s
    );
    onUpdateMemoryStars(updatedStars);
  };

  // Generate shareable URL with parameters
  const generateShareLink = () => {
    const url = new URL(window.location.href);
    if (formData.dateStr) url.searchParams.set('date', formData.dateStr);
    if (formData.showDaysCounter && formData.daysTogether) {
      url.searchParams.set('days', String(formData.daysTogether));
    }
    url.searchParams.set('theme', formData.themeId);
    return url.toString();
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = generateShareLink();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md transition-opacity">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-[#140e21] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden text-slate-100 z-10">
        {/* Mobile Grab Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-semibold text-white tracking-wide font-romantic-serif">
              专属纪念日与照片星定制
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭设置"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* 1. Commemoration Date & Days Together Settings */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                显示专属纪念日期与相伴天数
              </span>
              <button
                type="button"
                onClick={() => handleFieldChange('showDaysCounter', !formData.showDaysCounter)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  formData.showDaysCounter ? 'bg-pink-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    formData.showDaysCounter ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {formData.showDaysCounter && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      纪念起始日期 (日历直选或手填)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formData.dateStr || '2024.05.20'}
                        onChange={(e) => handleDateChange(e.target.value)}
                        placeholder="2024.05.20"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                      />
                      <input
                        type="date"
                        value={formatDateToInputFormat(formData.dateStr)}
                        title="从日历选择日期（系统将自动实时测算天数）"
                        onChange={(e) => handleDateChange(e.target.value)}
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
                          onClick={() => handleFieldChange('anniversaryLabel', label)}
                          className={`py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                            (formData.anniversaryLabel || '相恋') === label
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

                {/* Automatic Days Calculation Display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 bg-black/30 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">自动测算相伴：</span>
                    <span className="text-sm font-bold font-mono text-pink-300">
                      第 {formData.daysTogether} 天
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3 text-emerald-300 shrink-0" />
                      根据纪念日自动实时计算
                    </span>
                  </div>

                  {/* Badge Preview */}
                  <div className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-[11px] text-pink-200 flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse shrink-0" />
                    <span>{formData.dateStr || '2024.05.20'}</span>
                    <span>·</span>
                    <span>{formData.anniversaryLabel || '相恋'}第 {formData.daysTogether} 天</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Trajectory Star Photos Section */}
          {memoryStars.length > 0 && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                  星空轨迹相片星定制（悬停查看大图）
                </span>
                <span className="text-[10px] text-amber-200/80">点击更换专属合照</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {memoryStars.map((star) => (
                  <div
                    key={star.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 relative group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-amber-300/40 shrink-0">
                        <img
                          src={star.imageUrl}
                          alt={star.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <label
                          htmlFor={`upload-${star.id}`}
                          title="更换照片"
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-300" />
                        </label>
                        <input
                          id={`upload-${star.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(star.id, e)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-white truncate">
                          {star.title}
                        </span>
                        <label
                          htmlFor={`upload-${star.id}`}
                          className="text-[10px] text-pink-400 hover:text-pink-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <span>更换照片</span>
                        </label>
                      </div>
                    </div>

                    {/* Inline edit title / caption button */}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStarId(editingStarId === star.id ? null : star.id)
                      }
                      className="text-[10px] text-left text-slate-400 hover:text-slate-200 truncate cursor-pointer"
                    >
                      {editingStarId === star.id ? '收起编辑' : `情话: “${star.quote}”`}
                    </button>

                    {editingStarId === star.id && (
                      <div className="space-y-1.5 pt-1 border-t border-white/10">
                        <input
                          type="text"
                          value={star.title}
                          maxLength={10}
                          onChange={(e) => handleStarTextChange(star.id, 'title', e.target.value)}
                          placeholder="星名"
                          className="w-full px-2 py-1 text-[11px] rounded bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                        />
                        <textarea
                          rows={2}
                          value={star.quote}
                          maxLength={50}
                          onChange={(e) => handleStarTextChange(star.id, 'quote', e.target.value)}
                          placeholder="浪漫情话"
                          className="w-full px-2 py-1 text-[11px] rounded bg-black/50 border border-white/15 text-white focus:outline-none focus:border-pink-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions: Save & Share */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
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
            className="min-h-[44px] py-2.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold hover:from-pink-600 hover:to-rose-700 shadow-md transition-all cursor-pointer"
          >
            完成并保存
          </button>
        </div>
      </div>
    </div>
  );
};
