import React, { useState } from 'react';
import {
  FileText,
  Save,
  X,
  BookOpen,
  School,
  Clock,
  Award,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FolderArchive,
} from 'lucide-react';
import { ExamInfo, Question } from '../types';
import { INITIAL_QUESTIONS } from '../data/examData';

interface NewExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExamInfo: ExamInfo;
  onSaveExamInfo: (
    newExamInfo: ExamInfo,
    resetQuestionsMode?: 'keep' | 'reset_default' | 'clear',
    saveOldExam?: boolean,
    oldExamNote?: string
  ) => void;
  onOpenAutoImportFile: () => void;
}

export const NewExamConfigModal: React.FC<NewExamConfigModalProps> = ({
  isOpen,
  onClose,
  currentExamInfo,
  onSaveExamInfo,
  onOpenAutoImportFile,
}) => {
  const [title, setTitle] = useState(currentExamInfo.title);
  const [subject, setSubject] = useState(currentExamInfo.subject);
  const [grade, setGrade] = useState(currentExamInfo.grade);
  const [curriculum, setCurriculum] = useState(currentExamInfo.curriculum);
  const [school, setSchool] = useState(currentExamInfo.school);
  const [department, setDepartment] = useState(currentExamInfo.department);
  const [academicYear, setAcademicYear] = useState(currentExamInfo.academicYear);
  const [durationMinutes, setDurationMinutes] = useState(currentExamInfo.durationMinutes);
  const [totalScore, setTotalScore] = useState(currentExamInfo.totalScore);
  const [documentRef, setDocumentRef] = useState(currentExamInfo.documentRef);
  const [questionMode, setQuestionMode] = useState<'keep' | 'reset_default' | 'clear'>('keep');
  const [saveOldExam, setSaveOldExam] = useState(true);
  const [oldExamNote, setOldExamNote] = useState('Lưu trữ trước khi tạo đề mới');

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'gk1' | 'ck1' | 'gk2') => {
    if (type === 'gk1') {
      setTitle('ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ I');
      setSubject('TIN HỌC');
      setGrade('Lớp 9');
      setDurationMinutes(45);
      setCurriculum('Kết nối tri thức với cuộc sống');
    } else if (type === 'ck1') {
      setTitle('ĐỀ KIỂM TRA ĐỊNH KÌ HỌC KÌ I');
      setSubject('TIN HỌC');
      setGrade('Lớp 9');
      setDurationMinutes(45);
      setCurriculum('Kết nối tri thức với cuộc sống');
    } else if (type === 'gk2') {
      setTitle('ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ II');
      setSubject('TIN HỌC');
      setGrade('Lớp 9');
      setDurationMinutes(45);
      setCurriculum('Kết nối tri thức với cuộc sống');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên/tiêu đề đề thi.');
      return;
    }

    const updatedExam: ExamInfo = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim() || 'TIN HỌC',
      grade: grade.trim() || 'Lớp 9',
      curriculum: curriculum.trim() || 'Kết nối tri thức với cuộc sống',
      school: school.trim() || 'TRƯỜNG THCS & THPT',
      department: department.trim() || 'TỔ TIN HỌC - CÔNG NGHỆ',
      academicYear: academicYear.trim() || 'Năm học: 2026 - 2027',
      durationMinutes: Number(durationMinutes) || 45,
      totalScore: Number(totalScore) || 10.0,
      documentRef: documentRef.trim() || 'Căn cứ theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024',
    };

    onSaveExamInfo(updatedExam, questionMode, saveOldExam, oldExamNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Nhập & Thiết Lập Đề Thi Mới
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Cập nhật thông số kỳ thi, thời gian làm bài và quy chuẩn đánh giá
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Mẫu đề thi thiết lập nhanh:</span>
              </span>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Nhấn để tự động điền các thông tin phổ biến theo khung chương trình
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('gk1')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Giữa HK1 (45p)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('ck1')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cuối HK1 (45p)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('gk2')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Giữa HK2 (45p)
              </button>
            </div>
          </div>

          {/* Core Info Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tiêu đề đề thi / Kỳ thi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ I"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Môn học
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="TIN HỌC"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Khối lớp
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 6">Lớp 6</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bộ sách giáo khoa
                </label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                  <option value="Cánh diều">Cánh diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên trường
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="TRƯỜNG THCS & THPT LÊ LỢI"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tổ chuyên môn
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="TỔ TIN HỌC - CÔNG NGHỆ"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Năm học
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="Năm học: 2026 - 2027"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Thời gian làm bài (phút)</span>
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tổng điểm tối đa</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={totalScore}
                  onChange={(e) => setTotalScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Căn cứ văn bản quy định
              </label>
              <input
                type="text"
                value={documentRef}
                onChange={(e) => setDocumentRef(e.target.value)}
                placeholder="Căn cứ theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              />
            </div>
          </div>

          {/* Archive Old Exam Option */}
          <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="save-old-exam-checkbox"
                checked={saveOldExam}
                onChange={(e) => setSaveOldExam(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="save-old-exam-checkbox"
                    className="text-xs sm:text-sm font-bold text-emerald-950 cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderArchive className="w-4 h-4 text-emerald-700" />
                    <span>Lưu đề thi cũ vào Kho Quản Lý Đề Thi</span>
                  </label>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                    Tự động bảo toàn
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Đề thi hiện hành <strong>"{currentExamInfo.title}"</strong> sẽ được cất giữ vào kho lưu trữ. Bạn có thể xem lại hoặc kích hoạt lại đề cũ bất cứ lúc nào.
                </p>

                {saveOldExam && (
                  <div className="pt-1.5">
                    <input
                      type="text"
                      value={oldExamNote}
                      onChange={(e) => setOldExamNote(e.target.value)}
                      placeholder="Ghi chú cho đề cũ (ví dụ: Đề thi giữa kì 1 năm học 2026-2027)"
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Source Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Cấu hình ngân hàng câu hỏi cho đề thi mới:
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                <input
                  type="radio"
                  name="questionMode"
                  checked={questionMode === 'keep'}
                  onChange={() => setQuestionMode('keep')}
                  className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Giữ nguyên các câu hỏi hiện tại trong ngân hàng
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Đề mới sẽ sử dụng tiếp các câu hỏi đang có để bạn chỉnh sửa bổ sung
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                <input
                  type="radio"
                  name="questionMode"
                  checked={questionMode === 'reset_default'}
                  onChange={() => setQuestionMode('reset_default')}
                  className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Nạp lại bộ 18 câu hỏi chuẩn theo CV 7991/BGDĐT
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Khởi tạo lại ma trận chuẩn 12 trắc nghiệm + 4 đúng/sai + 2 tự luận
                  </span>
                </div>
              </label>
            </div>

            {/* Quick action to open Word/PDF modal */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Bạn muốn tạo đề tự động từ tệp Word hoặc PDF có sẵn?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAutoImportFile();
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nhập từ Word / PDF</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu và Kích Hoạt Đề Thi Này</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
