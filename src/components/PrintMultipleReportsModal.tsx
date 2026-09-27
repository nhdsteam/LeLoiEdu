import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Table,
  Download,
  ExternalLink,
  CheckSquare,
  Square,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Check,
  Award,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ExamInfo, ExamSubmission, Question } from '../types';
import {
  generateMultiStudentScorecardsHtml,
  generateMasterGradeSheetHtml,
  exportSubmissionsToCsv,
  printViaHiddenIframe,
  openReportInNewTab,
  downloadReportHtml,
  getGradeClassification,
  formatDuration,
} from '../utils/printReport';
import { gradeExam } from '../utils/scoring';

interface PrintMultipleReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examInfo: ExamInfo;
  submissions: ExamSubmission[];
  questions: Question[];
  initialSelectedIds?: string[];
}

export const PrintMultipleReportsModal: React.FC<PrintMultipleReportsModalProps> = ({
  isOpen,
  onClose,
  examInfo,
  submissions,
  questions,
  initialSelectedIds = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds.length > 0) return initialSelectedIds;
    return submissions.map((s) => s.id);
  });

  const [printFormat, setPrintFormat] = useState<'scorecards' | 'master_sheet'>('scorecards');
  const [previewStudentIdx, setPreviewStudentIdx] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableClasses = Array.from(new Set(submissions.map((s) => s.studentClass))).sort();

  // Filtered submissions based on class filter
  const displayedSubmissions = submissions.filter((s) => {
    if (classFilter !== 'all' && s.studentClass !== classFilter) return false;
    return true;
  });

  const selectedSubmissions = submissions.filter((s) => selectedIds.includes(s.id));

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === displayedSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedSubmissions.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectByFilter = (filterType: 'all' | 'gioi' | 'violation' | 'clear') => {
    if (filterType === 'all') {
      setSelectedIds(submissions.map((s) => s.id));
    } else if (filterType === 'gioi') {
      setSelectedIds(submissions.filter((s) => s.totalScore >= 8.0).map((s) => s.id));
    } else if (filterType === 'violation') {
      setSelectedIds(submissions.filter((s) => s.violationCount > 0).map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Printing handlers
  const handlePrint = async () => {
    if (selectedSubmissions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để in!');
      return;
    }

    setIsPrinting(true);
    let html = '';
    if (printFormat === 'scorecards') {
      html = generateMultiStudentScorecardsHtml(examInfo, selectedSubmissions, questions);
    } else {
      html = generateMasterGradeSheetHtml(examInfo, selectedSubmissions);
    }

    const success = await printViaHiddenIframe(html);
    setIsPrinting(false);

    if (!success) {
      // In sandboxed environments, opening a print tab is the most reliable fallback
      openReportInNewTab(html);
    }
  };

  const handleOpenInNewTab = () => {
    if (selectedSubmissions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để in!');
      return;
    }
    let html = '';
    if (printFormat === 'scorecards') {
      html = generateMultiStudentScorecardsHtml(examInfo, selectedSubmissions, questions);
    } else {
      html = generateMasterGradeSheetHtml(examInfo, selectedSubmissions);
    }
    const opened = openReportInNewTab(html);
    if (!opened) {
      alert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép pop-up để mở trang in!');
    }
  };

  const handleDownloadHtml = () => {
    if (selectedSubmissions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để tải tệp in!');
      return;
    }
    let html = '';
    let fileName = '';
    const safeTitle = examInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    if (printFormat === 'scorecards') {
      html = generateMultiStudentScorecardsHtml(examInfo, selectedSubmissions, questions);
      fileName = `Bo_Phieu_Bao_Diem_${selectedSubmissions.length}_HocSinh_${safeTitle}.html`;
    } else {
      html = generateMasterGradeSheetHtml(examInfo, selectedSubmissions);
      fileName = `Bang_Tong_Hop_Diem_${selectedSubmissions.length}_HocSinh_${safeTitle}.html`;
    }
    downloadReportHtml(html, fileName);
  };

  const handleExportCsv = () => {
    if (selectedSubmissions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh để xuất file!');
      return;
    }
    exportSubmissionsToCsv(examInfo, selectedSubmissions);
    setCopiedStatus('Đã tải tệp bảng điểm CSV!');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  // Preview target student
  const validPreviewIdx = Math.min(
    previewStudentIdx,
    Math.max(0, selectedSubmissions.length - 1)
  );
  const previewStudent = selectedSubmissions[validPreviewIdx];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-6xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Printer className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  In Kết Quả Thi Của Nhiều Học Sinh
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                  Chuẩn CV 7991/BGDĐT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                In đồng loạt phiếu báo điểm cá nhân từng học sinh hoặc xuất bảng tổng hợp điểm cả lớp
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

        {/* Action Controls & Format Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Format Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrintFormat('scorecards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                printFormat === 'scorecards'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Phiếu điểm cá nhân liên tục ({selectedSubmissions.length} trang)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('master_sheet')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                printFormat === 'master_sheet'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Bảng tổng hợp điểm cả lớp (Khổ ngang)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-bulk-print-direct"
              onClick={handlePrint}
              disabled={isPrinting || selectedSubmissions.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Đang gửi in...' : `In toàn bộ (${selectedSubmissions.length} bài)`}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              disabled={selectedSubmissions.length === 0}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Mở toàn bộ bản in trong tab trình duyệt mới"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mở tab in</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={selectedSubmissions.length === 0}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Lưu file HTML in ấn về máy"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Tải file in</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={selectedSubmissions.length === 0}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Xuất bảng điểm dạng bảng tính Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {copiedStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs text-emerald-800 font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{copiedStatus}</span>
          </div>
        )}

        {/* Main Content Area: Split View (Student Checklist on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Student Selection & Filtering (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col h-full overflow-hidden">
            {/* Quick Filter Header */}
            <div className="space-y-2 mb-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Danh sách học sinh ({selectedSubmissions.length} / {submissions.length})
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {selectedIds.length === displayedSubmissions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              {/* Class Filter dropdown */}
              {availableClasses.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Lớp:</span>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="flex-1 py-1 px-2 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="all">Tất cả các lớp ({submissions.length})</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Lớp {cls} ({submissions.filter((s) => s.studentClass === cls).length} bài)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Tags Filter */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectByFilter('all')}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Tất cả ({submissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectByFilter('gioi')}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors cursor-pointer"
                >
                  Giỏi ≥8đ ({submissions.filter((s) => s.totalScore >= 8.0).length})
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectByFilter('violation')}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors cursor-pointer"
                >
                  Có vi phạm ({submissions.filter((s) => s.violationCount > 0).length})
                </button>
              </div>
            </div>

            {/* Scrollable Student List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {displayedSubmissions.map((sub, idx) => {
                const isSelected = selectedIds.includes(sub.id);
                const isCurrentPreview =
                  printFormat === 'scorecards' &&
                  selectedSubmissions[validPreviewIdx]?.id === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      const selIdx = selectedSubmissions.findIndex((s) => s.id === sub.id);
                      if (selIdx >= 0) setPreviewStudentIdx(selIdx);
                    }}
                    className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrentPreview
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                        : isSelected
                        ? 'border-slate-300 bg-white hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-100/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectOne(sub.id);
                        }}
                        className="p-0.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 truncate">
                          {sub.studentName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{sub.studentId}</span>
                          <span>•</span>
                          <span>Lớp {sub.studentClass}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-indigo-700">
                        {sub.totalScore.toFixed(2)}đ
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sub.status === 'graded' ? 'Đã chấm' : 'Chờ TL'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Document Preview (8 cols) */}
          <div className="lg:col-span-8 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
            {selectedSubmissions.length === 0 ? (
              <div className="m-auto text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Chưa chọn học sinh nào để in</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Vui lòng tích chọn ít nhất một học sinh ở danh sách bên trái để xem trước và in kết quả.
                </p>
              </div>
            ) : printFormat === 'scorecards' ? (
              /* Scorecard Multi-Page Preview */
              <div className="w-full max-w-3xl space-y-4">
                {/* Pagination bar for previewing different students */}
                <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Xem trước trang:</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold">
                      {validPreviewIdx + 1} / {selectedSubmissions.length}
                    </span>
                    <span className="text-slate-400">—</span>
                    <strong className="text-slate-900">{previewStudent?.studentName}</strong>
                    <span className="text-slate-500">({previewStudent?.studentId})</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={validPreviewIdx === 0}
                      onClick={() => setPreviewStudentIdx((prev) => Math.max(0, prev - 1))}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={validPreviewIdx >= selectedSubmissions.length - 1}
                      onClick={() =>
                        setPreviewStudentIdx((prev) =>
                          Math.min(selectedSubmissions.length - 1, prev + 1)
                        )
                      }
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scorecard Visual Layout (Preview of 1 page) */}
                {previewStudent && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md font-serif text-slate-900 space-y-4">
                    {/* Header */}
                    <div className="grid grid-cols-2 text-center text-xs pb-2 border-b border-slate-200">
                      <div>
                        <div className="font-bold uppercase">{examInfo.school}</div>
                        <div className="font-bold uppercase text-[11px]">{examInfo.department}</div>
                      </div>
                      <div>
                        <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                        <div className="font-bold text-[11px]">Độc lập - Tự do - Hạnh phúc</div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center py-1">
                      <h4 className="text-base font-black uppercase tracking-wider text-slate-900">
                        PHIẾU BÁO ĐIỂM KIỂM TRA ĐỊNH KÌ
                      </h4>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">{examInfo.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Môn: <strong>{examInfo.subject}</strong> — Khối: <strong>{examInfo.grade}</strong> ({examInfo.academicYear})
                      </div>
                    </div>

                    {/* Student Info Box */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 gap-2">
                      <div>
                        Thí sinh: <strong className="uppercase">{previewStudent.studentName}</strong>
                      </div>
                      <div>
                        Lớp: <strong>{previewStudent.studentClass}</strong> | SBD: <strong>{previewStudent.studentId}</strong>
                      </div>
                      <div>
                        Thời gian làm bài: <strong>{formatDuration(previewStudent.durationSeconds)}</strong>
                      </div>
                      <div>
                        Giám sát: <strong>{previewStudent.violationCount === 0 ? 'Trung thực (0 vi phạm)' : `${previewStudent.violationCount} vi phạm`}</strong>
                      </div>
                    </div>

                    {/* Score Highlight Banner */}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase font-extrabold text-blue-900">
                          Tổng điểm bài thi (Thang điểm 10.0)
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Xếp loại: <strong>{getGradeClassification(previewStudent.totalScore).label}</strong>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-blue-700">
                        {previewStudent.totalScore.toFixed(2)}{' '}
                        <span className="text-xs text-slate-500 font-normal">/ 10.0</span>
                      </div>
                    </div>

                    {/* 3 Parts Table */}
                    <table className="w-full text-xs border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="border border-slate-300 p-2 text-left">Phần thi CV 7991</th>
                          <th className="border border-slate-300 p-2 text-center w-24">Điểm đạt</th>
                          <th className="border border-slate-300 p-2 text-center w-24">Điểm tối đa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2">Phần I: Trắc nghiệm 4 lựa chọn</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                            {previewStudent.scorePart1.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">3.00</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2">Phần II: Trắc nghiệm Đúng / Sai</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                            {previewStudent.scorePart2.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">4.00</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2">Phần III: Tự luận / Trả lời ngắn</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-purple-700">
                            {previewStudent.scorePart3.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">3.00</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Teacher Feedback Box */}
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-800">Nhận xét bài tự luận của Giáo viên:</div>
                      <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-700 italic">
                        {previewStudent.answers['q17']?.essayFeedback ||
                        previewStudent.answers['q18']?.essayFeedback
                          ? `Câu 17: ${previewStudent.answers['q17']?.essayFeedback || 'Đạt'}. Câu 18: ${
                              previewStudent.answers['q18']?.essayFeedback || 'Đạt'
                            }`
                          : 'Học sinh hoàn thành bài kiểm tra theo đúng quy chế.'}
                      </div>
                    </div>

                    {/* Notice on batch printing */}
                    <div className="text-[11px] text-slate-400 text-center pt-2">
                      Khi bấm &quot;In toàn bộ&quot;, hệ thống sẽ in lần lượt tất cả {selectedSubmissions.length} phiếu báo điểm, tự động phân cách 1 phiếu / trang A4.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Master Grade Sheet Preview */
              <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                <div className="text-center border-b border-slate-200 pb-3">
                  <div className="text-xs uppercase font-bold text-slate-500">{examInfo.school}</div>
                  <h4 className="text-base font-black uppercase tracking-wider text-slate-900 mt-1">
                    BẢNG TỔNG HỢP KẾT QUẢ KIỂM TRA ĐỊNH KÌ CẢ LỚP
                  </h4>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {examInfo.title} — Môn {examInfo.subject} ({examInfo.academicYear})
                  </div>
                </div>

                {/* Table Summary Strip */}
                <div className="grid grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center font-bold">
                  <div>
                    <div className="text-slate-400 font-normal">Học sinh</div>
                    <div className="text-slate-800 font-extrabold">{selectedSubmissions.length} em</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-normal">Điểm TB</div>
                    <div className="text-indigo-700 font-extrabold">
                      {(
                        selectedSubmissions.reduce((acc, s) => acc + s.totalScore, 0) /
                        (selectedSubmissions.length || 1)
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-normal">Điểm Giỏi (≥8đ)</div>
                    <div className="text-purple-700 font-extrabold">
                      {selectedSubmissions.filter((s) => s.totalScore >= 8.0).length} em
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-normal">Chưa đạt (&lt;5đ)</div>
                    <div className="text-rose-700 font-extrabold">
                      {selectedSubmissions.filter((s) => s.totalScore < 5.0).length} em
                    </div>
                  </div>
                </div>

                {/* Table preview */}
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2 border border-slate-200 text-center w-8">#</th>
                        <th className="p-2 border border-slate-200">Họ và tên</th>
                        <th className="p-2 border border-slate-200 text-center">SBD</th>
                        <th className="p-2 border border-slate-200 text-center">Lớp</th>
                        <th className="p-2 border border-slate-200 text-center">Phần I (3đ)</th>
                        <th className="p-2 border border-slate-200 text-center">Phần II (4đ)</th>
                        <th className="p-2 border border-slate-200 text-center">Phần III (3đ)</th>
                        <th className="p-2 border border-slate-200 text-center font-black">Tổng điểm</th>
                        <th className="p-2 border border-slate-200 text-center">Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSubmissions.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{s.studentName}</td>
                          <td className="p-2 text-center font-mono text-slate-600">{s.studentId}</td>
                          <td className="p-2 text-center">{s.studentClass}</td>
                          <td className="p-2 text-center">{s.scorePart1.toFixed(2)}</td>
                          <td className="p-2 text-center">{s.scorePart2.toFixed(2)}</td>
                          <td className="p-2 text-center font-bold text-indigo-700">
                            {s.scorePart3.toFixed(2)}
                          </td>
                          <td className="p-2 text-center font-black text-indigo-900 bg-indigo-50/50">
                            {s.totalScore.toFixed(2)}
                          </td>
                          <td className="p-2 text-center font-semibold">
                            {getGradeClassification(s.totalScore).label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
