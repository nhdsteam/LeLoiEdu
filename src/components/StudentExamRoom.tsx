import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Send,
  Maximize,
  Minimize,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  AntiCheatLog,
  ExamInfo,
  Question,
  StudentAnswer,
} from '../types';
import { TOPICS } from '../data/examData';

interface StudentExamRoomProps {
  examInfo: ExamInfo;
  questions: Question[];
  onSubmitExam: (
    studentData: { name: string; studentClass: string; studentId: string },
    answers: Record<string, StudentAnswer>,
    antiCheatLogs: AntiCheatLog[],
    timeSpentSeconds: number
  ) => void;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({
  examInfo,
  questions,
  onSubmitExam,
}) => {
  // Candidate info
  const [studentName, setStudentName] = useState('Phan Nhật Nam');
  const [studentClass, setStudentClass] = useState('9A1');
  const [studentId, setStudentId] = useState('HS0912');
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Exam state
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    examInfo.durationMinutes * 60
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [antiCheatLogs, setAntiCheatLogs] = useState<AntiCheatLog[]>([]);
  const [showCheatAlert, setShowCheatAlert] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const examStartTimeRef = useRef<number>(0);

  // Track anti-cheat violations
  const recordViolation = (type: AntiCheatLog['type'], message: string) => {
    if (!isExamStarted) return;
    const newLog: AntiCheatLog = {
      id: `cheat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    setAntiCheatLogs((prev) => [...prev, newLog]);
    setShowCheatAlert(message);
    setTimeout(() => {
      setShowCheatAlert(null);
    }, 4000);
  };

  // Set up Anti-cheat event listeners (tab switch, window blur, copy/paste prevention)
  useEffect(() => {
    if (!isExamStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(
          'tab_switch',
          'CẢNH BÁO GIAN LẬN: Thí sinh vừa rời khỏi tab làm bài thi!'
        );
      }
    };

    const handleWindowBlur = () => {
      recordViolation(
        'window_blur',
        'CẢNH BÁO: Thí sinh vừa chuyển trọng tâm ra ngoài màn hình thi!'
      );
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen && isExamStarted) {
        recordViolation(
          'fullscreen_exit',
          'CẢNH BÁO: Thí sinh vừa thoát khỏi chế độ thi toàn màn hình!'
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('copy_attempt', 'Thao tác nhấp chuột phải bị vô hiệu hóa.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, F12, Ctrl+U
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        recordViolation('copy_attempt', `Tổ hợp phím [${e.key.toUpperCase()}] bị cấm trong phòng thi!`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExamStarted]);

  // Exam timer countdown
  useEffect(() => {
    if (!isExamStarted) return;

    examStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleStartExam = () => {
    if (!studentName.trim() || !studentClass.trim() || !studentId.trim()) {
      alert('Vui lòng điền đầy đủ thông tin thí sinh trước khi bắt đầu.');
      return;
    }
    setIsExamStarted(true);
    // Request fullscreen on start if possible
    document.documentElement.requestFullscreen().catch(() => {});
  };

  const handleAutoSubmit = () => {
    const timeSpent = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
    onSubmitExam(
      { name: studentName, studentClass, studentId },
      answers,
      antiCheatLogs,
      timeSpent
    );
  };

  const handleManualSubmit = () => {
    const timeSpent = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onSubmitExam(
      { name: studentName, studentClass, studentId },
      answers,
      antiCheatLogs,
      timeSpent
    );
  };

  // Helper check if question is answered
  const isQuestionAnswered = (q: Question) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'multiple_choice') {
      return ans.mcqAnswer !== undefined;
    }
    if (q.type === 'true_false') {
      const tf = ans.tfAnswers;
      if (!tf) return false;
      return Object.keys(tf).length === q.statements.length;
    }
    if (q.type === 'essay') {
      return !!ans.essayAnswer && ans.essayAnswer.trim().length > 15;
    }
    return false;
  };

  const isQuestionFlagged = (qId: string) => {
    return !!answers[qId]?.isFlagged;
  };

  const toggleFlag = (qId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        questionId: qId,
        isFlagged: !prev[qId]?.isFlagged,
      },
    }));
  };

  // Handlers for inputs
  const handleSelectMCQ = (questionId: string, choice: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        mcqAnswer: choice,
      },
    }));
  };

  const handleSelectTF = (
    questionId: string,
    statementId: 'a' | 'b' | 'c' | 'd',
    value: boolean
  ) => {
    setAnswers((prev) => {
      const currentTF = prev[questionId]?.tfAnswers || {};
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          tfAnswers: {
            ...currentTF,
            [statementId]: value,
          },
        },
      };
    });
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        essayAnswer: text,
      },
    }));
  };

  // Format remaining time
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Statistics of completed answers
  const answeredCount = useMemo(() => {
    return questions.filter((q) => isQuestionAnswered(q)).length;
  }, [questions, answers]);

  const flaggedCount = useMemo(() => {
    return questions.filter((q) => isQuestionFlagged(q.id)).length;
  }, [questions, answers]);

  const currentQuestion = questions[currentQuestionIndex];

  // Filtered list for navigator
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (activeFilter === 'unanswered') return !isQuestionAnswered(q);
      if (activeFilter === 'flagged') return isQuestionFlagged(q.id);
      return true;
    });
  }, [questions, activeFilter, answers]);

  // Pre-exam start screen
  if (!isExamStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-indigo-200 text-xs uppercase tracking-wider font-semibold mb-2">
              <FileCheck className="w-4 h-4" />
              <span>{examInfo.school} • {examInfo.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {examInfo.title}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base mt-2">
              Môn: {examInfo.subject} - {examInfo.grade} ({examInfo.curriculum}) • {examInfo.academicYear}
            </p>
            <p className="text-xs text-indigo-200/80 mt-1 italic">
              {examInfo.documentRef}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Exam Matrix Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-xs font-medium text-slate-500 block">Thời gian làm bài</span>
                <span className="text-xl font-bold text-slate-900">{examInfo.durationMinutes} phút</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-xs font-medium text-slate-500 block">Tổng số câu hỏi</span>
                <span className="text-xl font-bold text-slate-900">{questions.length} câu</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-xs font-medium text-slate-500 block">Thang điểm</span>
                <span className="text-xl font-bold text-slate-900">{examInfo.totalScore.toFixed(1)} điểm</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-xs font-medium text-slate-500 block">Hình thức đề</span>
                <span className="text-sm font-bold text-indigo-600">3 Phần (TN, Đ/S, Tự luận)</span>
              </div>
            </div>

            {/* Anti-cheat and Security Rules */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Quy chế thi trực tuyến & Giám sát chống gian lận</span>
              </div>
              <ul className="text-xs sm:text-sm text-amber-800 space-y-1.5 list-disc list-inside">
                <li>Hệ thống <strong>tự động ghi nhận nhật ký (logs)</strong> mỗi khi thí sinh chuyển tab, thu nhỏ trình duyệt hoặc mở cửa sổ khác.</li>
                <li>Khuyến nghị làm bài ở chế độ <strong>Toàn màn hình (Fullscreen)</strong> để tối ưu sự tập trung.</li>
                <li>Vô hiệu hóa tính năng sao chép (Copy), dán (Paste) và chuột phải trong suốt quá trình làm bài.</li>
                <li>Bài thi sẽ <strong>tự động nộp khi hết 45 phút</strong>. Thí sinh có thể chủ động nộp bài khi đã hoàn thành.</li>
              </ul>
            </div>

            {/* Candidate Form */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Xác nhận thông tin thí sinh</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên thí sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="student-name-input"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="student-class-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="student-class-input"
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="Ví dụ: 9A1"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="student-id-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Số báo danh (SBD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="student-id-input"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Ví dụ: HS0912"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                id="btn-start-exam"
                onClick={handleStartExam}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>Vào Phòng Thi & Bắt Đầu Làm Bài</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-slate-500 mt-2">
                Đồng hồ 45 phút sẽ bắt đầu tính giờ ngay khi bạn bấm nút trên.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Exam View
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-12 select-none">
      {/* Floating Anti-cheat Alert Banner */}
      {showCheatAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-bounce">
          <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-rose-300">
            <AlertTriangle className="w-6 h-6 shrink-0 text-amber-200" />
            <div className="text-xs sm:text-sm font-bold">
              {showCheatAlert}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Exam Control Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Student Info & Anti-Cheat Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-500">Thí sinh:</div>
              <div className="text-sm font-extrabold text-slate-800 truncate">
                {studentName} ({studentClass} - {studentId})
              </div>
            </div>

            {/* Anti-cheat status badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                antiCheatLogs.length === 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {antiCheatLogs.length === 0
                  ? 'Giám sát: An toàn'
                  : `Cảnh báo vi phạm: ${antiCheatLogs.length}`}
              </span>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-extrabold border ${
                secondsRemaining < 300
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          </div>

          {/* Right: Actions (Fullscreen & Submit) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-toggle-fullscreen"
              onClick={toggleFullscreen}
              title="Toàn màn hình"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              type="button"
              id="btn-submit-exam-open-modal"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Exam Grid: Left Navigator & Right Question Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Sidebar: Question Matrix Navigator (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-36">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Danh sách câu hỏi</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {answeredCount}/{questions.length}
                </span>
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs mb-4">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unanswered')}
                className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
                  activeFilter === 'unanswered'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chưa làm ({questions.length - answeredCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('flagged')}
                className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
                  activeFilter === 'flagged'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cần xem lại ({flaggedCount})
              </button>
            </div>

            {/* Sections List */}
            <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {/* Part 1 */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                  <span>Phần I: Trắc nghiệm (3.0đ)</span>
                  <span className="text-[10px] text-slate-400">12 câu</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {questions
                    .filter((q) => q.part === 1)
                    .map((q, idx) => {
                      const isAnswered = isQuestionAnswered(q);
                      const isFlagged = isQuestionFlagged(q.id);
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          id={`nav-q-${q.id}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`relative h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2'
                              : ''
                          } ${
                            isAnswered
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{q.number}</span>
                          {isFlagged && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Part 2 */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                  <span>Phần II: Đúng / Sai (4.0đ)</span>
                  <span className="text-[10px] text-slate-400">4 câu</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {questions
                    .filter((q) => q.part === 2)
                    .map((q) => {
                      const idx = questions.findIndex((item) => item.id === q.id);
                      const isAnswered = isQuestionAnswered(q);
                      const isFlagged = isQuestionFlagged(q.id);
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          id={`nav-q-${q.id}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`relative h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2'
                              : ''
                          } ${
                            isAnswered
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>Câu {q.number}</span>
                          {isFlagged && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Part 3 */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                  <span>Phần III: Tự luận (3.0đ)</span>
                  <span className="text-[10px] text-slate-400">2 câu</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {questions
                    .filter((q) => q.part === 3)
                    .map((q) => {
                      const idx = questions.findIndex((item) => item.id === q.id);
                      const isAnswered = isQuestionAnswered(q);
                      const isFlagged = isQuestionFlagged(q.id);
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          id={`nav-q-${q.id}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`relative h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2'
                              : ''
                          } ${
                            isAnswered
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>Tự luận {q.number}</span>
                          {isFlagged && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" /> Đã trả lời
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 inline-block" /> Chưa làm
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> Đánh dấu
              </span>
            </div>
          </div>

          {/* Right: Question Workspace (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative">
              {/* Question Top Header */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentQuestion.part === 1
                      ? `Phần I - Câu ${currentQuestion.number}`
                      : currentQuestion.part === 2
                      ? `Phần II - Câu ${currentQuestion.number}`
                      : `Phần III - Tự luận ${currentQuestion.number}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {TOPICS[currentQuestion.topicId]?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentQuestion.maxScore.toFixed(2)} điểm
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Mức: {currentQuestion.cognitiveLevel === 'biet' ? 'Nhận biết' : currentQuestion.cognitiveLevel === 'hieu' ? 'Thông hiểu' : 'Vận dụng'}
                  </span>
                </div>

                {/* Flag Question Button */}
                <button
                  type="button"
                  id="btn-flag-question"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    isQuestionFlagged(currentQuestion.id)
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      isQuestionFlagged(currentQuestion.id)
                        ? 'fill-amber-500 text-amber-500'
                        : ''
                    }`}
                  />
                  <span>
                    {isQuestionFlagged(currentQuestion.id)
                      ? 'Đã đánh dấu'
                      : 'Đánh dấu xem lại'}
                  </span>
                </button>
              </div>

              {/* Question Content */}
              <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line mb-6">
                {currentQuestion.content}
              </div>

              {/* PART 1: Multiple Choice Options */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isSelected =
                      answers[currentQuestion.id]?.mcqAnswer === opt.key;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        id={`option-${currentQuestion.id}-${opt.key}`}
                        onClick={() =>
                          handleSelectMCQ(currentQuestion.id, opt.key)
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-normal pt-0.5 ${
                            isSelected
                              ? 'text-indigo-950 font-semibold'
                              : 'text-slate-800'
                          }`}
                        >
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PART 2: True / False Statements Table */}
              {currentQuestion.type === 'true_false' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      Quy tắc điểm Bộ GD&ĐT: Đúng 1 ý: <strong>0.1đ</strong> • Đúng 2 ý: <strong>0.25đ</strong> • Đúng 3 ý: <strong>0.5đ</strong> • Đúng 4 ý: <strong>1.0đ</strong>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.statements.map((stmt) => {
                      const userVal =
                        answers[currentQuestion.id]?.tfAnswers?.[stmt.id];

                      return (
                        <div
                          key={stmt.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {stmt.id})
                            </span>
                            <span className="text-sm sm:text-base text-slate-800 leading-snug">
                              {stmt.text}
                            </span>
                          </div>

                          {/* True / False Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              id={`tf-${currentQuestion.id}-${stmt.id}-true`}
                              onClick={() =>
                                handleSelectTF(currentQuestion.id, stmt.id, true)
                              }
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                userVal === true
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Đúng (Đ)
                            </button>
                            <button
                              type="button"
                              id={`tf-${currentQuestion.id}-${stmt.id}-false`}
                              onClick={() =>
                                handleSelectTF(currentQuestion.id, stmt.id, false)
                              }
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                userVal === false
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Sai (S)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PART 3: Essay Editor */}
              {currentQuestion.type === 'essay' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Gợi ý các tiêu chí chấm điểm (Barem đánh giá):</span>
                    </h4>
                    <ul className="text-xs text-indigo-800 space-y-1.5 list-disc list-inside">
                      {currentQuestion.rubric.map((r) => (
                        <li key={r.id}>
                          <strong>(+{r.maxScore.toFixed(2)}đ):</strong> {r.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label
                      htmlFor={`essay-textarea-${currentQuestion.id}`}
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Khu vực viết câu trả lời tự luận:
                    </label>
                    <textarea
                      id={`essay-textarea-${currentQuestion.id}`}
                      rows={9}
                      value={answers[currentQuestion.id]?.essayAnswer || ''}
                      onChange={(e) =>
                        handleEssayChange(currentQuestion.id, e.target.value)
                      }
                      placeholder="Trình bày bài làm tự luận của bạn tại đây... Hãy phân tích rõ từng ý và đưa ra lời giải thích chi tiết."
                      className="w-full p-4 text-sm sm:text-base bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed resize-y"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>
                        Số từ:{' '}
                        {
                          (answers[currentQuestion.id]?.essayAnswer || '')
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean).length
                        }
                      </span>
                      <span>
                        Số ký tự:{' '}
                        {(answers[currentQuestion.id]?.essayAnswer || '').length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Question Navigation Controls */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  id="btn-prev-question"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  ← Câu trước
                </button>

                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    id="btn-next-question"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Câu tiếp theo</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-finish-last-question"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn thành & Nộp bài</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">
                Xác nhận nộp bài thi?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sau khi nộp, hệ thống sẽ tự động chấm điểm và lập báo cáo kết quả chi tiết.
              </p>
            </div>

            {/* Answered Summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Tổng số câu hỏi:</span>
                <span className="font-bold text-slate-900">{questions.length} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu đã trả lời:</span>
                <span className="font-bold text-emerald-600">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu chưa hoàn thành:</span>
                <span className="font-bold text-rose-600">
                  {questions.length - answeredCount} câu
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu đánh dấu xem lại:</span>
                <span className="font-bold text-amber-600">{flaggedCount} câu</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Cảnh báo giám sát (vi phạm):</span>
                <span
                  className={`font-bold ${
                    antiCheatLogs.length === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {antiCheatLogs.length} lần
                </span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bạn vẫn còn <strong>{questions.length - answeredCount} câu hỏi</strong> chưa trả lời. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-cancel-submit-modal"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                id="btn-confirm-submit-modal"
                onClick={handleManualSubmit}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
