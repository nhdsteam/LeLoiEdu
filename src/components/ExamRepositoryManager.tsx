import React, { useState, useRef } from 'react';
import {
  FolderArchive,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Plus,
  Upload,
  Download,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Search,
  Filter,
  Sparkles,
  AlertCircle,
  FileText,
  Star,
  Check,
  X,
  ArrowRight,
  Info,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { ExamInfo, Question, SavedExam } from '../types';
import { downloadExamJson, parseExamJson } from '../utils/examRepository';
import { TOPICS } from '../data/examData';

interface ExamRepositoryManagerProps {
  savedExams: SavedExam[];
  currentExamInfo: ExamInfo;
  currentQuestions: Question[];
  onSwitchActiveExam: (selectedExam: SavedExam) => void;
  onSaveCurrentExamToRepo: (note?: string) => void;
  onDeleteSavedExam: (id: string) => void;
  onDuplicateExam: (id: string) => void;
  onUpdateSavedExamMeta: (id: string, updatedInfo: Partial<ExamInfo>, note?: string) => void;
  onImportExamJson: (importedExam: SavedExam) => void;
  onOpenCreateNewExam: () => void;
  onOpenAutoImportFile: () => void;
}

export const ExamRepositoryManager: React.FC<ExamRepositoryManagerProps> = ({
  savedExams,
  currentExamInfo,
  currentQuestions,
  onSwitchActiveExam,
  onSaveCurrentExamToRepo,
  onDeleteSavedExam,
  onDuplicateExam,
  onUpdateSavedExamMeta,
  onImportExamJson,
  onOpenCreateNewExam,
  onOpenAutoImportFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  // Preview Modal
  const [previewExam, setPreviewExam] = useState<SavedExam | null>(null);

  // Edit Meta Modal
  const [editingExam, setEditingExam] = useState<SavedExam | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDuration, setEditDuration] = useState(45);
  const [editSchool, setEditSchool] = useState('');

  // Quick Save Active Exam Modal/Prompt
  const [showSaveActivePrompt, setShowSaveActivePrompt] = useState(false);
  const [saveActiveNote, setSaveActiveNote] = useState('');

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEditMeta = (exam: SavedExam) => {
    setEditingExam(exam);
    setEditTitle(exam.examInfo.title);
    setEditNote(exam.note || '');
    setEditDuration(exam.examInfo.durationMinutes);
    setEditSchool(exam.examInfo.school);
  };

  const handleSaveEditMeta = () => {
    if (!editingExam) return;
    onUpdateSavedExamMeta(
      editingExam.id,
      {
        title: editTitle,
        durationMinutes: Number(editDuration) || 45,
        school: editSchool,
      },
      editNote
    );
    setEditingExam(null);
    showToast('Đã cập nhật thông tin đề thi thành công!');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseExamJson(text);
      onImportExamJson(imported);
      showToast(`Đã nhập thành công đề thi: "${imported.examInfo.title}"!`);
    } catch (err: any) {
      alert('Lỗi nhập tệp JSON: ' + (err.message || 'Tệp không hợp lệ'));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmSaveActive = () => {
    onSaveCurrentExamToRepo(saveActiveNote || 'Lưu từ đề hiện hành');
    setShowSaveActivePrompt(false);
    setSaveActiveNote('');
    showToast('Đã lưu đề thi hiện hành vào kho đề!');
  };

  // Filtered exams
  const filteredExams = savedExams.filter((exam) => {
    const isActive = exam.id === currentExamInfo.id;
    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'archived' && isActive) return false;
    if (filterGrade !== 'all' && exam.examInfo.grade !== filterGrade) return false;

    const term = searchTerm.toLowerCase();
    const matchSearch =
      exam.examInfo.title.toLowerCase().includes(term) ||
      exam.examInfo.subject.toLowerCase().includes(term) ||
      exam.examInfo.school.toLowerCase().includes(term) ||
      (exam.note && exam.note.toLowerCase().includes(term));

    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Header Banner for Exam Repository */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5 text-indigo-300" />
                <span>Kho Lưu Trữ Đề Thi & Lịch Sử Đề Cũ</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                Tổng: {savedExams.length} đề thi
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Quản Lý Kho Đề Thi - Bảo Toàn Đề Cũ Khi Tạo Đề Mới
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Lưu giữ toàn bộ các đề thi đã kiểm tra (Giữa kì, Cuối kì, Khảo sát, Đề dự phòng). Khi bạn tạo đề mới từ file Word/PDF hoặc nhập đề mới, đề hiện tại sẽ được tự động lưu vào kho để bạn có thể kích hoạt sử dụng lại bất cứ lúc nào.
            </p>
          </div>

          {/* Quick Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-save-current-exam-repo"
              onClick={() => setShowSaveActivePrompt(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              title="Lưu bản sao đề thi hiện tại vào kho lưu trữ"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu đề hiện tại vào kho</span>
            </button>

            <button
              type="button"
              id="btn-import-json-exam"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
              title="Nhập đề thi từ tệp JSON sao lưu"
            >
              <Upload className="w-4 h-4 text-indigo-300" />
              <span>Nhập tệp JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Currently Active Exam Highlight Bar */}
      <div className="bg-indigo-50/80 border-2 border-indigo-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-200/70 px-2 py-0.5 rounded-md">
                ĐỀ THI ĐANG SỬ DỤNG LÀM BÀI CHO HỌC SINH
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({currentQuestions.length} câu hỏi)
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              {currentExamInfo.title}
            </h4>
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <span>Môn: <strong>{currentExamInfo.subject}</strong></span>
              <span>•</span>
              <span>{currentExamInfo.grade}</span>
              <span>•</span>
              <span>Thời gian: {currentExamInfo.durationMinutes} phút</span>
              <span>•</span>
              <span>{currentExamInfo.school}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateNewExam}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đề mới</span>
          </button>

          <button
            type="button"
            onClick={onOpenAutoImportFile}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Đề từ Word/PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề đề thi, môn, trường, ghi chú..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">🌟 Đang sử dụng</option>
              <option value="archived">📦 Đề lưu trữ</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Khối:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="Lớp 9">Lớp 9</option>
              <option value="Lớp 8">Lớp 8</option>
              <option value="Lớp 7">Lớp 7</option>
              <option value="Lớp 6">Lớp 6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredExams.map((exam) => {
          const isActive = exam.id === currentExamInfo.id;
          const questionsCount = exam.questions.length;
          const part1Count = exam.questions.filter((q) => q.part === 1).length;
          const part2Count = exam.questions.filter((q) => q.part === 2).length;
          const part3Count = exam.questions.filter((q) => q.part === 3).length;

          const createdDateFormatted = new Date(exam.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          return (
            <div
              key={exam.id}
              className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between bg-white shadow-xs ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Status Badges & Date */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>Đang kích hoạt</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1">
                        <FolderArchive className="w-3 h-3 text-slate-500" />
                        <span>Đề thi lưu trữ</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {exam.examInfo.grade} • {exam.examInfo.subject}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Lưu: {createdDateFormatted}</span>
                  </span>
                </div>

                {/* Exam Title */}
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug">
                  {exam.examInfo.title}
                </h3>

                {/* Exam School & Academic Year */}
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {exam.examInfo.school} • {exam.examInfo.academicYear} • {exam.examInfo.curriculum}
                </p>

                {/* Note / Tag */}
                {exam.note && (
                  <div className="mt-2.5 px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 italic">{exam.note}</span>
                  </div>
                )}

                {/* Structure Breakdown Stats */}
                <div className="mt-3.5 grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Tổng câu</div>
                    <div className="text-xs sm:text-sm font-black text-slate-800">{questionsCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Phần I (TN)</div>
                    <div className="text-xs sm:text-sm font-bold text-indigo-700">{part1Count} câu</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Phần II (Đ/S)</div>
                    <div className="text-xs sm:text-sm font-bold text-indigo-700">{part2Count} câu</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Phần III (TL)</div>
                    <div className="text-xs sm:text-sm font-bold text-indigo-700">{part3Count} câu</div>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {/* Primary Action: Switch or Active Indicator */}
                <div>
                  {isActive ? (
                    <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đang dùng làm đề thi</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      id={`btn-activate-exam-${exam.id}`}
                      onClick={() => onSwitchActiveExam(exam)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Chuyển sang đề thi này để học sinh thi và quản lý câu hỏi"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Kích hoạt đề này</span>
                    </button>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-1">
                  {/* Preview Exam */}
                  <button
                    type="button"
                    onClick={() => setPreviewExam(exam)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Xem trước nội dung đề thi và đáp án"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Duplicate Exam */}
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateExam(exam.id);
                      showToast('Đã nhân bản đề thi thành công!');
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Nhân bản đề thi này thành bản sao mới"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit Meta */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditMeta(exam)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa thông tin đề thi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Export JSON */}
                  <button
                    type="button"
                    onClick={() => downloadExamJson(exam)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Tải về tệp đề thi (.json) để sao lưu"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* Delete Exam */}
                  <button
                    type="button"
                    disabled={isActive || savedExams.length <= 1}
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa đề thi "${exam.examInfo.title}" khỏi kho lưu trữ?`)) {
                        onDeleteSavedExam(exam.id);
                        showToast('Đã xóa đề thi khỏi kho!');
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive || savedExams.length <= 1
                        ? 'opacity-30 cursor-not-allowed text-slate-400'
                        : 'hover:bg-rose-50 text-rose-600 cursor-pointer'
                    }`}
                    title={
                      isActive
                        ? 'Không thể xóa đề đang được kích hoạt làm bài'
                        : savedExams.length <= 1
                        ? 'Cần giữ lại ít nhất 1 đề thi trong kho'
                        : 'Xóa đề thi khỏi kho'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FolderArchive className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy đề thi phù hợp</h4>
          <p className="text-xs text-slate-500">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để xem các đề thi đã lưu.
          </p>
        </div>
      )}

      {/* Modal: Preview Saved Exam */}
      {previewExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-indigo-200">
                  Xem chi tiết đề thi lưu trữ
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  {previewExam.examInfo.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {previewExam.examInfo.school} • {previewExam.examInfo.grade} • Thời gian: {previewExam.examInfo.durationMinutes} phút • Tổng {previewExam.questions.length} câu
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewExam(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {previewExam.questions.map((q, idx) => {
                const topicName = TOPICS[q.topicId]?.name || q.topicId;
                const partLabel = q.part === 1 ? 'Phần I (Trắc nghiệm)' : q.part === 2 ? 'Phần II (Đúng / Sai)' : 'Phần III (Tự luận)';

                return (
                  <div key={q.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-extrabold text-indigo-700">
                        Câu {q.number || idx + 1}: {partLabel}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {topicName} • {q.maxScore} điểm
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-800 whitespace-pre-line">
                      {q.content}
                    </p>

                    {/* MCQ Options */}
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {q.options.map((opt) => {
                          const isCorrect = opt.key === q.correctAnswer;
                          return (
                            <div
                              key={opt.key}
                              className={`p-2 rounded-lg border flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                              {isCorrect && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False Statements */}
                    {q.type === 'true_false' && (
                      <div className="space-y-1.5 pt-1 text-xs">
                        {q.statements.map((stmt) => (
                          <div
                            key={stmt.id}
                            className="p-2 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                          >
                            <span className="text-slate-800">
                              <strong>{stmt.id})</strong> {stmt.text}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                              stmt.correctAnswer
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              Đáp án: {stmt.correctAnswer ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Essay Rubric */}
                    {q.type === 'essay' && (
                      <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-xs space-y-1.5">
                        <div className="font-bold text-indigo-900">Hướng dẫn chấm & Đáp án mẫu:</div>
                        <p className="text-slate-700 italic">{q.sampleAnswer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => downloadExamJson(previewExam)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewExam(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>

                {previewExam.id !== currentExamInfo.id && (
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchActiveExam(previewExam);
                      setPreviewExam(null);
                      showToast('Đã kích hoạt đề thi thành công!');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Kích hoạt đề này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Exam Metadata */}
      {editingExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Chỉnh sửa thông tin đề thi trong kho</h3>
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề đề thi</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trường học / Đơn vị</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (Phút)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú / Nhãn phân loại</label>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ví dụ: Đề thi thử học kì 1, đã duyệt chuyên môn..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEditMeta}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Save Active Exam to Repository Prompt */}
      {showSaveActivePrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Lưu đề thi hiện tại vào kho</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveActivePrompt(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
                <div className="font-extrabold text-indigo-950">{currentExamInfo.title}</div>
                <div className="text-xs text-indigo-800">
                  Gồm <strong>{currentQuestions.length} câu hỏi</strong> • {currentExamInfo.subject} ({currentExamInfo.grade})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú cho bản lưu trữ này (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={saveActiveNote}
                  onChange={(e) => setSaveActiveNote(e.target.value)}
                  placeholder="Ví dụ: Đề chính thức năm học 2026-2027, bản chốt..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>

              <p className="text-xs text-slate-500 italic">
                Sau khi lưu, bạn có thể tạo đề thi mới mà không sợ mất đề thi hiện hành này.
              </p>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveActivePrompt(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveActive}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Xác nhận lưu vào kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
