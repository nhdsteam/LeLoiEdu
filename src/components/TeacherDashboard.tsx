import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ExamInfo, ExamSubmission, Question } from '../types';
import { calculateClassAnalytics } from '../utils/scoring';
import { TOPICS } from '../data/examData';

interface TeacherDashboardProps {
  examInfo: ExamInfo;
  questions: Question[];
  submissions: ExamSubmission[];
  onNavigateToSubmissions: () => void;
  onNavigateToQuestionBank: () => void;
  isAdmin?: boolean;
  onOpenAccountManager?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  examInfo,
  questions,
  submissions,
  onNavigateToSubmissions,
  onNavigateToQuestionBank,
  isAdmin = false,
  onOpenAccountManager,
}) => {
  const stats = calculateClassAnalytics(questions, submissions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Báo Cáo Thống Kê & Phân Tích Kết Quả Thi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {examInfo.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Môn {examInfo.subject} - {examInfo.grade} • {examInfo.curriculum} • {examInfo.academicYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && onOpenAccountManager && (
            <button
              type="button"
              id="btn-teacher-manage-accounts"
              onClick={onOpenAccountManager}
              title="Quản lý danh sách tài khoản giảng viên (Quyền admin)"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>Quản lý tài khoản GV</span>
            </button>
          )}

          <button
            type="button"
            id="btn-teacher-view-submissions"
            onClick={onNavigateToSubmissions}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Danh sách bài nộp & Chấm tự luận</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng số bài nộp</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalSubmissions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lớp 9A (Chính khóa)</div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Điểm trung bình</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            {stats.averageScore.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Thang điểm 10.0</div>
        </div>

        {/* Highest Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Điểm cao nhất</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats.highestScore.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Thấp nhất: {stats.lowestScore.toFixed(2)}đ</div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tỉ lệ Đạt (≥ 5.0)</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.passRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {Math.round((stats.passRate / 100) * stats.totalSubmissions)} học sinh
          </div>
        </div>

        {/* Good/Excellence Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tỉ lệ Giỏi (≥ 8.0)</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">
            {stats.goodRate}%
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            {Math.round((stats.goodRate / 100) * stats.totalSubmissions)} học sinh
          </div>
        </div>

        {/* Security & Anti-cheat violations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vi phạm giám sát</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black ${
              stats.antiCheatViolationsTotal === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {stats.antiCheatViolationsTotal}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Lần chuyển tab/rời màn hình
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Phổ điểm & Năng lực theo ma trận */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution (Phổ điểm) - lg:col-span-6 */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Phổ điểm kiểm tra định kì</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân bố số lượng học sinh theo các dải điểm chuẩn Bộ GD&ĐT
                </p>
              </div>
            </div>

            <div className="space-y-3.5 mt-6">
              {stats.scoreDistribution.map((dist, idx) => {
                const maxCount = Math.max(...stats.scoreDistribution.map((d) => d.count), 1);
                const barWidth = (dist.count / maxCount) * 100;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{dist.label}</span>
                      <span className="text-slate-900 font-bold">
                        {dist.count} HS ({dist.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          idx === 4
                            ? 'bg-emerald-500'
                            : idx === 3
                            ? 'bg-indigo-600'
                            : idx === 2
                            ? 'bg-blue-500'
                            : idx === 1
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(barWidth, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Đánh giá chung: Phổ điểm lệch phải tích cực</span>
            <span className="font-semibold text-indigo-600">Độ phân hóa tốt</span>
          </div>
        </div>

        {/* Competency by Topic & Cognitive Level - lg:col-span-6 */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Ma trận Năng lực & Mức độ nhận thức</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỉ lệ hoàn thành mục tiêu kiến thức theo CV 7991/BGDĐT
                </p>
              </div>
            </div>

            {/* Cognitive level breakdown */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Theo Mức độ nhận thức (Bloom):
              </div>
              <div className="grid grid-cols-3 gap-2">
                {stats.levelPerformance.map((lvl) => (
                  <div key={lvl.level} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-slate-500 block font-medium truncate">{lvl.label}</span>
                    <span className="text-lg font-black text-indigo-700 mt-0.5 block">{lvl.percentage}%</span>
                    <span className="text-[10px] text-slate-400">ĐTB: {lvl.averageEarned.toFixed(2)}/{lvl.totalPossible.toFixed(2)}đ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Theo 4 Chủ đề bài học:
              </div>
              {stats.topicPerformance.map((tp) => (
                <div key={tp.topicId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate pr-2">{tp.topicName}</span>
                    <span className="font-bold text-indigo-600 shrink-0">
                      {tp.percentage}% ({tp.averageEarned.toFixed(2)}/{tp.totalPossible.toFixed(2)}đ)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Căn cứ Bản đặc tả CV 7991</span>
            <button
              type="button"
              onClick={onNavigateToQuestionBank}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Xem ma trận đề chi tiết →
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Gap Alert & Difficult Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Phân tích các câu hỏi học sinh hay làm sai nhất (Cảnh báo lỗ hổng)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Giúp giáo viên kịp thời phát hiện những khái niệm học sinh còn nhầm lẫn để có kế hoạch phụ đạo.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="p-3 font-bold rounded-l-xl">Câu hỏi</th>
                <th className="p-3 font-bold">Phần thi</th>
                <th className="p-3 font-bold">Nội dung tóm tắt</th>
                <th className="p-3 font-bold">Chủ đề</th>
                <th className="p-3 font-bold text-right">Tỉ lệ làm sai</th>
                <th className="p-3 font-bold rounded-r-xl">Khuyến nghị sư phạm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.questionErrorRates.map((qErr) => {
                const questionObj = questions.find((q) => q.id === qErr.questionId);
                const topicName = questionObj ? TOPICS[questionObj.topicId]?.name : '';

                return (
                  <tr key={qErr.questionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">
                      Câu {qErr.questionNumber}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {qErr.part === 1 ? 'Phần I (TN)' : qErr.part === 2 ? 'Phần II (Đ/S)' : 'Phần III (Tự luận)'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 font-medium max-w-xs truncate">
                      {qErr.snippet}
                    </td>
                    <td className="p-3 text-slate-600 text-xs truncate max-w-[140px]">
                      {topicName}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {qErr.wrongRate}% sai
                      </span>
                    </td>
                    <td className="p-3 text-xs text-indigo-700 font-medium">
                      {qErr.part === 1
                        ? 'Ôn lại 4 tiêu chí đánh giá chất lượng thông tin.'
                        : qErr.part === 2
                        ? 'Nhấn mạnh phân biệt phần mềm mô phỏng và thí nghiệm thật.'
                        : 'Luyện kỹ năng nhận diện lừa đảo trên mạng xã hội.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
