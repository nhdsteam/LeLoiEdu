import React, { useState } from 'react';
import {
  Printer,
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Award,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ExamInfo, ExamSubmission, Question } from '../types';
import { gradeExam } from '../utils/scoring';
import { TOPICS } from '../data/examData';
import {
  generatePrintableReportHtml,
  printViaHiddenIframe,
  openReportInNewTab,
  downloadReportHtml,
  copyReportSummary,
  getGradeClassification,
  formatDuration,
} from '../utils/printReport';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examInfo: ExamInfo;
  submission: ExamSubmission;
  questions: Question[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  examInfo,
  submission,
  questions,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showIframeNotice, setShowIframeNotice] = useState(false);

  if (!isOpen) return null;

  const { scorePart1, scorePart2, scorePart3, totalScore, questionResults } = gradeExam(
    questions,
    submission.answers
  );
  const classification = getGradeClassification(totalScore);

  const formattedSubmittedDate = new Date(submission.submittedAt).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handlePrintDirect = async () => {
    setIsPrinting(true);
    const htmlContent = generatePrintableReportHtml(examInfo, submission, questions);
    
    // First try hidden iframe print
    const success = await printViaHiddenIframe(htmlContent);
    setIsPrinting(false);

    if (!success) {
      // In sandboxed iframes, window.print or iframe print can be blocked
      setShowIframeNotice(true);
      // Fallback try standard window.print()
      try {
        window.print();
      } catch (e) {
        console.warn('Standard window.print also restricted:', e);
      }
    }
  };

  const handleOpenNewTab = () => {
    const htmlContent = generatePrintableReportHtml(examInfo, submission, questions);
    const opened = openReportInNewTab(htmlContent);
    if (!opened) {
      alert('Vui lòng cho phép mở cửa sổ bật lên (pop-up) trên trình duyệt để mở trang in!');
    }
  };

  const handleDownload = () => {
    const htmlContent = generatePrintableReportHtml(examInfo, submission, questions);
    const fileName = `Phieu_Bao_Diem_${submission.studentId}_${submission.studentName.replace(/\s+/g, '_')}.html`;
    downloadReportHtml(htmlContent, fileName);
  };

  const handleCopy = async () => {
    const ok = await copyReportSummary(examInfo, submission, questions);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Printer className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                In & Xuất Phiếu Báo Kết Quả Kiểm Tra Định Kì
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Quy chuẩn văn bản hành chính theo Công văn số 7991/BGDĐT-GDTrH
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

        {/* Action Bar (Top) */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Thí sinh: <strong>{submission.studentName}</strong> (SBD: {submission.studentId})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Print Button */}
            <button
              type="button"
              id="btn-modal-print-direct"
              onClick={handlePrintDirect}
              disabled={isPrinting}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Đang gửi lệnh in...' : 'In trực tiếp (Print)'}</span>
            </button>

            {/* Open in New Tab */}
            <button
              type="button"
              id="btn-modal-print-newtab"
              onClick={handleOpenNewTab}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Mở tài liệu in độc lập trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mở tab mới để in</span>
            </button>

            {/* Download File */}
            <button
              type="button"
              id="btn-modal-download-report"
              onClick={handleDownload}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Tải về file HTML chuẩn A4 để in hoặc lưu trữ"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải file phiếu điểm</span>
            </button>

            {/* Copy Summary Text */}
            <button
              type="button"
              id="btn-modal-copy-summary"
              onClick={handleCopy}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sao chép nội dung tóm tắt để gửi Zalo / tin nhắn cho Phụ huynh"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sao chép gửi PH</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Iframe advice notice if triggered */}
        {showIframeNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-amber-900 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Gợi ý:</strong> Nếu trình duyệt đang chặn hộp thoại in trong khung xem trước (iframe), bạn hãy bấm nút <strong>"Mở tab mới để in"</strong> hoặc <strong>"Tải file phiếu điểm"</strong> để in A4 chuẩn nhất.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowIframeNotice(false)}
              className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Printable Document Preview Area (A4 Simulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80">
          <div className="max-w-[760px] mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border border-slate-300 text-slate-900 font-serif space-y-6">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4 text-center border-b border-slate-200 pb-4">
              <div>
                <div className="font-bold text-xs uppercase text-slate-700">SỞ GD&ĐT / PHÒNG GD&ĐT</div>
                <div className="font-extrabold text-sm uppercase text-slate-900">{examInfo.school}</div>
                <div className="text-xs italic text-slate-600">Tổ: {examInfo.department}</div>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1.5"></div>
              </div>

              <div>
                <div className="font-bold text-xs uppercase text-slate-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="font-extrabold text-sm text-slate-900">Độc lập - Tự do - Hạnh phúc</div>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1.5"></div>
                <div className="text-[11px] italic text-slate-500 mt-1">
                  Ngày in: {new Date().toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            {/* Main Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-950">
                PHIẾU BÁO KẾT QUẢ KIỂM TRA ĐỊNH KÌ
              </h2>
              <p className="text-sm font-bold text-slate-800 uppercase">
                MÔN: {examInfo.subject} - {examInfo.grade}
              </p>
              <p className="text-xs italic text-slate-600">
                {examInfo.title} • {examInfo.academicYear} • Thời gian làm bài: {examInfo.durationMinutes} phút
              </p>
              <p className="text-[11px] text-slate-500">
                ({examInfo.documentRef})
              </p>
            </div>

            {/* Student Information */}
            <div className="border border-slate-800 rounded-lg p-3.5 bg-slate-50/50 text-xs sm:text-sm font-sans space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                <div>Họ và tên thí sinh: <strong className="text-slate-950 font-bold">{submission.studentName}</strong></div>
                <div>Lớp: <strong className="text-slate-950 font-bold">{submission.studentClass}</strong></div>
                <div>Số báo danh (SBD): <strong className="text-slate-950 font-bold">{submission.studentId}</strong></div>
                <div>Thời gian làm bài: <strong>{formatDuration(submission.durationSeconds)}</strong></div>
                <div>Thời điểm nộp bài: <strong>{formattedSubmittedDate}</strong></div>
                <div>
                  Giám sát trực tuyến:{' '}
                  <strong className={submission.antiCheatLogs.length === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {submission.antiCheatLogs.length === 0
                      ? 'Trung thực 100% (0 vi phạm)'
                      : `${submission.antiCheatLogs.length} lần chuyển tab`}
                  </strong>
                </div>
              </div>
            </div>

            {/* High Impact Score Overview */}
            <div className="bg-indigo-50 border-2 border-indigo-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-950">
                  Tổng Điểm Đạt Được (Thang 10.0)
                </div>
                <div className="text-xs text-indigo-800 mt-0.5">
                  Xếp loại học lực bài thi: <strong className="text-indigo-950 font-black text-sm">{classification.label.toUpperCase()}</strong>
                </div>
              </div>

              <div className="text-right flex items-baseline gap-1 self-end sm:self-center">
                <span className="text-3xl sm:text-4xl font-black text-indigo-950">
                  {totalScore.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-600">/ 10.0 điểm</span>
              </div>
            </div>

            {/* 3-Part Grading Table */}
            <div className="space-y-2 font-sans">
              <div className="text-xs font-bold text-slate-900 uppercase">
                1. Điểm số chi tiết theo 3 phần thi (Quy chuẩn CV 7991):
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-left">Phần thi</th>
                      <th className="border border-slate-300 p-2 text-center w-28">Thể thức</th>
                      <th className="border border-slate-300 p-2 text-center w-24">Tối đa</th>
                      <th className="border border-slate-300 p-2 text-center w-24">Điểm đạt</th>
                      <th className="border border-slate-300 p-2 text-center w-20">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2 font-medium">Phần I: Trắc nghiệm 4 lựa chọn</td>
                      <td className="border border-slate-300 p-2 text-center">12 câu (A-D)</td>
                      <td className="border border-slate-300 p-2 text-center">3.00đ</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                        {scorePart1.toFixed(2)}đ
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {Math.round((scorePart1 / 3.0) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-medium">Phần II: Trắc nghiệm Đúng / Sai</td>
                      <td className="border border-slate-300 p-2 text-center">4 câu (16 ý)</td>
                      <td className="border border-slate-300 p-2 text-center">4.00đ</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                        {scorePart2.toFixed(2)}đ
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {Math.round((scorePart2 / 4.0) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 font-medium">Phần III: Tự luận / Trả lời ngắn</td>
                      <td className="border border-slate-300 p-2 text-center">2 câu</td>
                      <td className="border border-slate-300 p-2 text-center">3.00đ</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                        {scorePart3.toFixed(2)}đ
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {Math.round((scorePart3 / 3.0) * 100)}%
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-300 p-2 text-right uppercase">
                        Tổng điểm toàn bài:
                      </td>
                      <td className="border border-slate-300 p-2 text-center">10.00đ</td>
                      <td className="border border-slate-300 p-2 text-center text-indigo-950 font-black text-sm">
                        {totalScore.toFixed(2)}đ
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {Math.round((totalScore / 10.0) * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 Topics Competency Breakdown */}
            <div className="space-y-2 font-sans">
              <div className="text-xs font-bold text-slate-900 uppercase">
                2. Năng lực đạt được theo 4 chủ đề kiến thức:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.keys(TOPICS).map((tKey) => {
                  const topicQuestions = questions.filter((q) => q.topicId === tKey);
                  const maxScore = topicQuestions.reduce((acc, q) => acc + q.maxScore, 0);
                  const earnedScore = questionResults
                    .filter((r) => r.topicId === tKey)
                    .reduce((acc, r) => acc + r.score, 0);
                  const pct = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
                  return (
                    <div key={tKey} className="border border-slate-300 p-2 rounded-lg bg-slate-50/50 flex justify-between items-center">
                      <span className="font-semibold truncate pr-2">{TOPICS[tKey as keyof typeof TOPICS].name}</span>
                      <span className="font-bold text-indigo-700 shrink-0">
                        {earnedScore.toFixed(2)}/{maxScore.toFixed(2)}đ ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Feedback Box */}
            <div className="space-y-1.5 font-sans">
              <div className="text-xs font-bold text-slate-900 uppercase">
                3. Nhận xét của giáo viên bộ môn:
              </div>
              <div className="border border-dashed border-slate-400 p-3 rounded-lg text-xs italic text-slate-800 bg-white">
                {totalScore >= 8.5
                  ? 'Học sinh nắm vững kiến thức trọng tâm, kỹ năng tư duy và vận dụng rất tốt. Bài làm nghiêm túc.'
                  : totalScore >= 6.5
                  ? 'Học sinh nắm được kiến thức căn bản, cần rèn luyện thêm kỹ năng phân tích ý đúng/sai và bài tập tự luận.'
                  : 'Học sinh cần chú ý ôn tập củng cố lại các khái niệm cơ bản, rèn luyện thêm kỹ năng làm bài trắc nghiệm.'}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 text-center pt-4 text-xs font-serif">
              <div>
                <div className="font-bold uppercase text-slate-900">Ý KIẾN PHỤ HUYNH</div>
                <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                <div className="h-16"></div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-900">CHỮ KÝ HỌC SINH</div>
                <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                <div className="h-16"></div>
              </div>
              <div>
                <div className="text-[11px] italic text-slate-600 mb-0.5">Ngày ..... tháng ..... năm 202...</div>
                <div className="font-bold uppercase text-slate-900">GIÁO VIÊN CHẤM THI</div>
                <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                <div className="h-16"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Hỗ trợ in ấn A4 chuẩn hóa, lưu trữ hồ sơ học bạ hoặc gửi báo điểm cho Phụ huynh.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handlePrintDirect}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Thực hiện lệnh In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
