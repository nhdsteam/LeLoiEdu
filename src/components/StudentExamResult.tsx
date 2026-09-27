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
  BookOpen,
  Filter,
  Check,
  X,
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

      {/* Question-by-Question Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Xem lại chi tiết đáp án & Lời giải bài thi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối chiếu đáp án của bạn với hướng dẫn chấm và thang điểm chính thức của Bộ GD&ĐT.
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
              Làm đúng ({questionResults.filter((r) => r.isFullyCorrect).length})
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

        {/* Questions list */}
        <div className="space-y-6">
          {filteredResults.map((r) => {
            const originalQuestion = questions.find((q) => q.id === r.questionId)!;

            return (
              <div
                key={r.questionId}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  r.isFullyCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800">
                      {originalQuestion.part === 1
                        ? `Phần I - Câu ${r.questionNumber}`
                        : originalQuestion.part === 2
                        ? `Phần II - Câu ${r.questionNumber}`
                        : `Phần III - Tự luận ${r.questionNumber}`}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {TOPICS[r.topicId]?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        r.isFullyCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.score > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.isFullyCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        +{r.score.toFixed(2)} / {r.maxScore.toFixed(2)} điểm
                      </span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 mb-4 whitespace-pre-line">
                  {originalQuestion.content}
                </div>

                {/* Review Part 1: Multiple choice */}
                {originalQuestion.type === 'multiple_choice' && (
                  <div className="space-y-2 mb-4">
                    {originalQuestion.options.map((opt) => {
                      const isUserChoice = r.details.userChoice === opt.key;
                      const isOfficialAnswer = originalQuestion.correctAnswer === opt.key;

                      let rowClass = 'border-slate-200 bg-slate-50/50 text-slate-700';
                      if (isOfficialAnswer) {
                        rowClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isUserChoice && !isOfficialAnswer) {
                        rowClass = 'border-rose-400 bg-rose-50 text-rose-950';
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${rowClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold w-6 h-6 rounded-md bg-white border border-current flex items-center justify-center text-xs">
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
                            {isUserChoice && (
                              <span className="px-2 py-0.5 rounded-md bg-white/80 text-slate-800 border border-slate-200">
                                Lựa chọn của bạn
                              </span>
                            )}
                            {isOfficialAnswer && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đáp án đúng
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Review Part 2: True / False Statements */}
                {originalQuestion.type === 'true_false' && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      Kết quả: Đúng {r.details.correctStatementsCount} / {originalQuestion.statements.length} ý
                    </div>
                    {r.details.statementResults?.map((sr) => (
                      <div
                        key={sr.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm ${
                          sr.isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold uppercase w-5 text-slate-700">{sr.id})</span>
                          <span className="text-slate-800">{sr.text}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-slate-500">
                            Bạn chọn:{' '}
                            <strong className={sr.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                              {sr.userVal === true ? 'Đúng' : sr.userVal === false ? 'Sai' : 'Chưa chọn'}
                            </strong>
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            Đáp án: {sr.correctVal ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Part 3: Essay */}
                {originalQuestion.type === 'essay' && (
                  <div className="space-y-3 mb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm">
                      <div className="font-bold text-slate-700 mb-1">Bài làm của thí sinh:</div>
                      <p className="text-slate-900 whitespace-pre-line italic">
                        {r.details.essayAnswer || '(Thí sinh chưa nhập câu trả lời)'}
                      </p>
                    </div>

                    {r.details.essayFeedback && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                        <div className="font-bold mb-0.5">Nhận xét của Giáo viên / Hệ thống chấm:</div>
                        <div className="whitespace-pre-line">{r.details.essayFeedback}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Official Explanation / Barem Note */}
                {originalQuestion.explanation && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold">Hướng dẫn giải chi tiết: </strong>
                      <span>{originalQuestion.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
