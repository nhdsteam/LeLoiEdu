import React, { useState } from 'react';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Printer,
  RotateCcw,
  Table,
  Check,
  TrendingUp,
} from 'lucide-react';
import {
  ExamInfo,
  ExamSubmission,
  Question,
} from '../types';
import { gradeExam } from '../utils/scoring';
import { TOPICS } from '../data/examData';
import { PrintReportModal } from './PrintReportModal';

interface StudentExamResultProps {
  examInfo: ExamInfo;
  submission: ExamSubmission;
  questions: Question[];
  onRetakeExam: () => void;
  onViewTeacherDashboard: () => void;
}

export const StudentExamResult: React.FC<StudentExamResultProps> = ({
  examInfo,
  submission,
  questions,
  onRetakeExam,
  onViewTeacherDashboard,
}) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const { scorePart1, scorePart2, scorePart3, totalScore, questionResults } =
    gradeExam(questions, submission.answers);

  // Format time spent
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs.toString().padStart(2, '0')} giây`;
  };

  // Grade classification
  const getClassification = (score: number) => {
    if (score >= 9.0) return { label: 'Xuất sắc', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 8.0) return { label: 'Giỏi', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (score >= 6.5) return { label: 'Khá', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (score >= 5.0) return { label: 'Trung bình', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { label: 'Chưa đạt', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const classification = getClassification(totalScore);

  // Topic performance
  const topicStats = Object.keys(TOPICS).map((tKey) => {
    const topicQuestions = questions.filter((q) => q.topicId === tKey);
    const maxScore = topicQuestions.reduce((acc, q) => acc + q.maxScore, 0);
    const earnedScore = questionResults
      .filter((r) => r.topicId === tKey)
      .reduce((acc, r) => acc + r.score, 0);
    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    return {
      topicId: tKey,
      topicName: TOPICS[tKey as keyof typeof TOPICS].name,
      earnedScore: Math.round(earnedScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      percentage,
    };
  });

  // Filtered review list
  const filteredResults = questionResults.filter((r) => {
    if (reviewFilter === 'correct') return r.isFullyCorrect;
    if (reviewFilter === 'wrong') return !r.isFullyCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Top Banner & Print Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Phiếu Báo Kết Quả Thi Định Kì</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {submission.studentName} - Lớp {submission.studentClass}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SBD: {submission.studentId} • {examInfo.title} • {examInfo.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-print-result"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="In và xuất phiếu báo kết quả theo chuẩn A4 của Bộ GD&ĐT"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>In kết quả</span>
          </button>

          <button
            type="button"
            id="btn-retake-exam"
            onClick={onRetakeExam}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại đề thi</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Score Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white p-6 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                Tổng điểm đạt được
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${classification.color}`}>
                Xếp loại: {classification.label}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">
                {totalScore.toFixed(2)}
              </span>
              <span className="text-2xl font-bold text-indigo-300">/ 10.0</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-700/60 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Thời gian nộp bài: {formatDuration(submission.durationSeconds)}
            </span>
            <span>Chuẩn thang điểm Bộ GD&ĐT</span>
          </div>
        </div>

        {/* Section Breakdown Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm theo 3 phần thi
          </h3>
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Phần I: Trắc nghiệm</span>
                <span className="text-indigo-600 font-bold">{scorePart1.toFixed(2)} / 3.0đ</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(scorePart1 / 3.0) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Phần II: Đúng / Sai</span>
                <span className="text-indigo-600 font-bold">{scorePart2.toFixed(2)} / 4.0đ</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(scorePart2 / 4.0) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Phần III: Tự luận</span>
                <span className="text-indigo-600 font-bold">{scorePart3.toFixed(2)} / 3.0đ</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(scorePart3 / 3.0) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Anti-cheat Integrity Audit Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              {submission.antiCheatLogs.length === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              )}
              <span>Bảo mật & Chống gian lận</span>
            </h3>

            <div className="mt-3">
              <div
                className={`text-2xl font-black ${
                  submission.antiCheatLogs.length === 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {submission.antiCheatLogs.length === 0 ? 'Trung thực 100%' : `${submission.antiCheatLogs.length} cảnh báo`}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {submission.antiCheatLogs.length === 0
                  ? 'Thí sinh tuân thủ nghiêm túc quy chế, không rời tab hay mở ứng dụng ngoài.'
                  : 'Ghi nhận sự cố chuyển tab hoặc thu nhỏ màn hình trong lúc làm bài.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-view-class-stats-from-result"
            onClick={onViewTeacherDashboard}
            className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
          >
            Xem xếp hạng lớp học →
          </button>
        </div>
      </div>

      {/* Topic Competency Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Đánh giá năng lực theo 4 Chủ đề kiến thức (Theo CV 7991)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicStats.map((ts) => (
            <div key={ts.topicId} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate pr-2">{ts.topicName}</span>
                <span className="text-indigo-600 shrink-0">{ts.percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    ts.percentage >= 80
                      ? 'bg-emerald-500'
                      : ts.percentage >= 50
                      ? 'bg-indigo-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${ts.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Đạt: {ts.earnedScore.toFixed(2)}đ</span>
                <span>Tối đa: {ts.maxScore.toFixed(2)}đ</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng kết quả làm bài chi tiết */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <span>Bảng kết quả làm bài chi tiết</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê kết quả điểm số từng câu hỏi theo thang điểm chính thức của Bộ GD&ĐT.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({questionResults.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reviewFilter === 'correct'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đạt tối đa ({questionResults.filter((r) => r.isFullyCorrect).length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reviewFilter === 'wrong'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa tối đa ({questionResults.filter((r) => !r.isFullyCorrect).length})
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-14">Câu</th>
                <th className="py-3 px-4">Phần thi</th>
                <th className="py-3 px-4">Chủ đề kiến thức</th>
                <th className="py-3 px-4 text-center">Mức độ</th>
                <th className="py-3 px-4">Tình trạng làm bài</th>
                <th className="py-3 px-4 text-center">Điểm đạt</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredResults.map((r) => {
                const partLabel =
                  r.part === 1 ? 'Phần I' : r.part === 2 ? 'Phần II' : 'Phần III';
                const partBadgeColor =
                  r.part === 1
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : r.part === 2
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                const cognitiveLabel =
                  r.cognitiveLevel === 'biet'
                    ? 'Nhận biết'
                    : r.cognitiveLevel === 'hieu'
                    ? 'Thông hiểu'
                    : 'Vận dụng';

                let statusText = '';
                if (r.type === 'multiple_choice') {
                  statusText = r.details.userChoice
                    ? 'Đã trả lời'
                    : 'Chưa làm (bỏ trống)';
                } else if (r.type === 'true_false') {
                  const correctCount = r.details.correctStatementsCount || 0;
                  statusText = `Đúng ${correctCount}/4 ý`;
                } else {
                  statusText = r.details.essayAnswer
                    ? 'Đã nộp bài tự luận'
                    : 'Chưa làm (bỏ trống)';
                }

                return (
                  <tr
                    key={r.questionId}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      r.isFullyCorrect ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {r.questionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border ${partBadgeColor}`}
                      >
                        {partLabel} -{' '}
                        {r.type === 'multiple_choice'
                          ? 'Trắc nghiệm'
                          : r.type === 'true_false'
                          ? 'Đúng / Sai'
                          : 'Tự luận'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {TOPICS[r.topicId]?.name || r.topicId}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-600 font-medium">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        {cognitiveLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">{statusText}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={
                          r.isFullyCorrect
                            ? 'text-emerald-600 font-black'
                            : r.score > 0
                            ? 'text-amber-600 font-black'
                            : 'text-rose-600 font-bold'
                        }
                      >
                        {r.score.toFixed(2)} / {r.maxScore.toFixed(2)}đ
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.isFullyCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đạt tối đa
                        </span>
                      ) : r.score > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <Check className="w-3.5 h-3.5 text-amber-600" />
                          Đạt một phần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Chưa đạt
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={5} className="py-3.5 px-4 text-right">
                  Tổng kết bài thi:
                </td>
                <td className="py-3.5 px-4 text-center text-indigo-700 font-black text-base">
                  {totalScore.toFixed(2)} / 10.00đ
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${classification.color}`}>
                    {classification.label}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Security & Confidentiality Note */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <strong className="text-slate-800 font-semibold">Bảo mật kỳ thi:</strong> Hệ thống chỉ công bố bảng kết quả điểm số từng câu hỏi nhằm đảm bảo tính bảo mật và công bằng cho các ca thi tiếp theo. Chi tiết đáp án và barem giải thích sẽ do Giáo viên bộ môn công bố sau khi kết thúc toàn bộ đợt kiểm tra.
          </div>
        </div>
      </div>

      {/* Print & Export Report Card Modal */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        examInfo={examInfo}
        submission={submission}
        questions={questions}
      />
    </div>
  );
};
