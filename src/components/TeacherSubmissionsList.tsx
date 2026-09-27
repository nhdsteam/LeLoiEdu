import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Award,
  Sparkles,
  Save,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  CheckSquare,
  Square,
  Users,
  AlertCircle,
  GraduationCap,
  Info,
  Check,
  Printer,
} from 'lucide-react';
import { ExamInfo, ExamSubmission, Question, StudentAnswer } from '../types';
import { autoEvaluateEssay, gradeExam } from '../utils/scoring';
import { DEFAULT_EXAM_INFO } from '../data/examData';
import { PrintMultipleReportsModal } from './PrintMultipleReportsModal';

interface TeacherSubmissionsListProps {
  submissions: ExamSubmission[];
  questions: Question[];
  examInfo?: ExamInfo;
  onAddSubmission: (newSub: ExamSubmission) => void;
  onUpdateSubmission: (updated: ExamSubmission) => void;
  onDeleteSubmission: (submissionId: string) => void;
  onResetSubmissions?: () => void;
  onViewStudentDetail: (sub: ExamSubmission) => void;
}

/**
 * Helper to construct a full answers dictionary for a submission
 * based on the scores and essay text, ensuring compatibility with gradeExam()
 */
function buildSubmissionAnswers(
  questions: Question[],
  scorePart1: number,
  scorePart2: number,
  q17Score: number,
  q17Answer: string,
  q17Feedback: string,
  q18Score: number,
  q18Answer: string,
  q18Feedback: string,
  existingAnswers?: Record<string, StudentAnswer>
): Record<string, StudentAnswer> {
  const result: Record<string, StudentAnswer> = existingAnswers ? { ...existingAnswers } : {};

  // Part 1: Multiple choice questions (12 questions, maxScore = 0.25 each)
  const mcqQuestions = questions.filter((q) => q.type === 'multiple_choice');
  const targetCorrectCount = Math.min(
    mcqQuestions.length,
    Math.max(0, Math.round(scorePart1 / 0.25))
  );

  mcqQuestions.forEach((q, idx) => {
    if (idx < targetCorrectCount) {
      result[q.id] = { questionId: q.id, mcqAnswer: (q as any).correctAnswer };
    } else {
      const correct = (q as any).correctAnswer;
      const wrong = correct === 'A' ? 'B' : 'A';
      result[q.id] = { questionId: q.id, mcqAnswer: wrong as any };
    }
  });

  // Part 2: True/False questions (4 questions, maxScore = 1.0 each)
  const tfQuestions = questions.filter((q) => q.type === 'true_false');
  let remainingTf = Math.min(4.0, Math.max(0, scorePart2));

  tfQuestions.forEach((q) => {
    const targetQScore = Math.min(1.0, remainingTf);
    remainingTf = Math.max(0, remainingTf - targetQScore);

    // Barem: 4 correct = 1.0, 3 = 0.5, 2 = 0.25, 1 = 0.1, 0 = 0.0
    let correctCount = 0;
    if (targetQScore >= 0.95) correctCount = 4;
    else if (targetQScore >= 0.45) correctCount = 3;
    else if (targetQScore >= 0.2) correctCount = 2;
    else if (targetQScore >= 0.05) correctCount = 1;
    else correctCount = 0;

    const tfAns: { [key in 'a' | 'b' | 'c' | 'd']?: boolean } = {};
    if ('statements' in q) {
      q.statements.forEach((stmt, sIdx) => {
        if (sIdx < correctCount) {
          tfAns[stmt.id] = stmt.correctAnswer;
        } else {
          tfAns[stmt.id] = !stmt.correctAnswer;
        }
      });
    }
    result[q.id] = { questionId: q.id, tfAnswers: tfAns };
  });

  // Part 3: Essay questions (q17 and q18)
  result['q17'] = {
    questionId: 'q17',
    essayAnswer: q17Answer,
    essayScore: q17Score,
    essayFeedback: q17Feedback,
  };

  result['q18'] = {
    questionId: 'q18',
    essayAnswer: q18Answer,
    essayScore: q18Score,
    essayFeedback: q18Feedback,
  };

  return result;
}

export const TeacherSubmissionsList: React.FC<TeacherSubmissionsListProps> = ({
  submissions,
  questions,
  examInfo = DEFAULT_EXAM_INFO,
  onAddSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
  onResetSubmissions,
  onViewStudentDetail,
}) => {
  // Multi-Student Print Modal State
  const [isMultiPrintModalOpen, setIsMultiPrintModalOpen] = useState<boolean>(false);
  const [multiPrintSelectedIds, setMultiPrintSelectedIds] = useState<string[]>([]);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'high_score' | 'pending' | 'graded'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formStudentName, setFormStudentName] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formStudentClass, setFormStudentClass] = useState<string>('9A1');
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(40);
  const [formViolationCount, setFormViolationCount] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'submitted' | 'graded' | 'pending_essay'>('graded');
  const [formScorePart1, setFormScorePart1] = useState<number>(2.5);
  const [formScorePart2, setFormScorePart2] = useState<number>(3.0);
  const [formQ17Score, setFormQ17Score] = useState<number>(1.5);
  const [formQ17Answer, setFormQ17Answer] = useState<string>('');
  const [formQ17Feedback, setFormQ17Feedback] = useState<string>('');
  const [formQ18Score, setFormQ18Score] = useState<number>(0.8);
  const [formQ18Answer, setFormQ18Answer] = useState<string>('');
  const [formQ18Feedback, setFormQ18Feedback] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Delete Confirmation Modal State
  const [submissionToDelete, setSubmissionToDelete] = useState<ExamSubmission | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Live Essay Grading Modal (Legacy/Dedicated Modal)
  const [gradingSubmission, setGradingSubmission] = useState<ExamSubmission | null>(null);
  const [q17Score, setQ17Score] = useState<number>(0);
  const [q17Feedback, setQ17Feedback] = useState<string>('');
  const [q18Score, setQ18Score] = useState<number>(0);
  const [q18Feedback, setQ18Feedback] = useState<string>('');

  const essayQ1 = questions.find((q) => q.id === 'q17');
  const essayQ2 = questions.find((q) => q.id === 'q18');

  // Available classes for filter
  const availableClasses = Array.from(new Set(submissions.map((s) => s.studentClass))).sort();

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentClass.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (classFilter !== 'all' && sub.studentClass !== classFilter) return false;

    if (statusFilter === 'flagged') return sub.violationCount > 0;
    if (statusFilter === 'high_score') return sub.totalScore >= 8.0;
    if (statusFilter === 'pending') return sub.status === 'pending_essay' || sub.status === 'submitted';
    if (statusFilter === 'graded') return sub.status === 'graded';
    return true;
  });

  // Checkbox helpers
  const isAllSelected =
    filteredSubmissions.length > 0 &&
    filteredSubmissions.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextNum = (submissions.length + 1).toString().padStart(2, '0');
    setFormMode('add');
    setEditingId(null);
    setFormStudentName('');
    setFormStudentId(`HS09${nextNum}`);
    setFormStudentClass('9A1');
    setFormDurationMinutes(40);
    setFormViolationCount(0);
    setFormStatus('graded');
    setFormScorePart1(2.5);
    setFormScorePart2(3.0);
    setFormQ17Score(1.5);
    setFormQ17Answer(
      'Để đánh giá thông tin tìm kiếm trên Internet, em cần dựa vào 5 yếu tố cốt lõi: Tính chính xác, Tính mới, Tính đầy đủ, Tính tin cậy và Tính phù hợp. Bạn An nên ưu tiên đối chiếu thông tin từ cổng tin chính thức của Bộ Giáo dục và Đào tạo và các nguồn báo chính thống.'
    );
    setFormQ17Feedback('Bài làm nêu đầy đủ các tiêu chí chất lượng thông tin theo yêu cầu.');
    setFormQ18Score(0.8);
    setFormQ18Answer(
      'Hành vi của bạn B là tự ý đăng nhập email của bạn A và phát tán ảnh chế giễu, vi phạm Luật An ninh mạng và vi phạm đạo đức số (bắt nạt trên mạng). Để xử lý an toàn, bạn A cần lập tức đổi mật khẩu, bật xác thực 2 bước và báo cho giáo viên chủ nhiệm hoặc phụ huynh can thiệp.'
    );
    setFormQ18Feedback('Phân tích đúng các quy tắc vi phạm và nêu phương án xử lý an toàn.');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Quick Preset in Form
  const handleApplyPreset = (type: 'gioi' | 'kha' | 'trung_binh') => {
    const nextNum = (submissions.length + 1).toString().padStart(2, '0');
    if (type === 'gioi') {
      setFormStudentName('Nguyễn Hà Linh');
      setFormStudentId(`HS09${nextNum}`);
      setFormStudentClass('9A1');
      setFormDurationMinutes(38);
      setFormViolationCount(0);
      setFormStatus('graded');
      setFormScorePart1(2.75);
      setFormScorePart2(3.5);
      setFormQ17Score(1.75);
      setFormQ17Answer(
        '1. Năm yếu tố chất lượng thông tin: Tính chính xác, tính cập nhật mới, tính đầy đủ, tính tin cậy của tác giả/nguồn xuất bản, tính phù hợp với mục tiêu bài học.\n2. Lời khuyên cho bạn An: Cần đối chiếu chéo giữa các nguồn tin chính thống, không nên sao chép từ diễn đàn không rõ nguồn gốc.'
      );
      setFormQ17Feedback('Bài làm xuất sắc, lập luận mạch lạc, nắm chắc kiến thức Chủ đề 2.');
      setFormQ18Score(0.9);
      setFormQ18Answer(
        'a) Bạn B đã xâm phạm quyền riêng tư số và thực hiện hành vi miệt thị qua mạng.\nb) Bạn A cần: Đổi ngay mật khẩu hòm thư, kích hoạt xác thực đa yếu tố và chụp màn hình bằng chứng để báo cáo nhà trường.'
      );
      setFormQ18Feedback('Nêu rõ cả biện pháp công nghệ và báo cáo học đường.');
    } else if (type === 'kha') {
      setFormStudentName('Trần Quốc Tuấn');
      setFormStudentId(`HS09${nextNum}`);
      setFormStudentClass('9A2');
      setFormDurationMinutes(43);
      setFormViolationCount(0);
      setFormStatus('graded');
      setFormScorePart1(2.25);
      setFormScorePart2(2.8);
      setFormQ17Score(1.25);
      setFormQ17Answer(
        'Chất lượng thông tin gồm: đúng đắn, thông tin mới, thông tin đầy đủ và tin cậy. Bạn An nên chọn nguồn tin uy tín như báo điện tử chính thống.'
      );
      setFormQ17Feedback('Nêu được 4/5 tiêu chí, lời khuyên tương đối hợp lý.');
      setFormQ18Score(0.7);
      setFormQ18Answer(
        'Hành vi của B là xấu, xúc phạm bạn bè. Bạn A nên báo cho thầy cô giáo và phụ huynh biết.'
      );
      setFormQ18Feedback('Cần bổ sung biện pháp kỹ thuật như đổi mật khẩu email.');
    } else {
      setFormStudentName('Vũ Đức Thắng');
      setFormStudentId(`HS09${nextNum}`);
      setFormStudentClass('9A3');
      setFormDurationMinutes(45);
      setFormViolationCount(1);
      setFormStatus('graded');
      setFormScorePart1(1.75);
      setFormScorePart2(2.0);
      setFormQ17Score(1.0);
      setFormQ17Answer('Thông tin cần chính xác và tin cậy.');
      setFormQ17Feedback('Trả lời còn sơ sài, thiếu các tiêu chí tính mới và tính đầy đủ.');
      setFormQ18Score(0.5);
      setFormQ18Answer('B vi phạm quy định của lớp. A nên xin đổi email khác.');
      setFormQ18Feedback('Chưa chỉ ra được cơ sở pháp luật an ninh mạng.');
    }
    setFormError('');
  };

  // Open Edit Modal
  const handleOpenEdit = (sub: ExamSubmission) => {
    setFormMode('edit');
    setEditingId(sub.id);
    setFormStudentName(sub.studentName);
    setFormStudentId(sub.studentId);
    setFormStudentClass(sub.studentClass);
    setFormDurationMinutes(Math.max(1, Math.round(sub.durationSeconds / 60)));
    setFormViolationCount(sub.violationCount);
    setFormStatus(sub.status);
    setFormScorePart1(sub.scorePart1);
    setFormScorePart2(sub.scorePart2);
    setFormQ17Score(sub.answers['q17']?.essayScore ?? 1.5);
    setFormQ17Answer(sub.answers['q17']?.essayAnswer || '');
    setFormQ17Feedback(sub.answers['q17']?.essayFeedback || '');
    setFormQ18Score(sub.answers['q18']?.essayScore ?? 0.8);
    setFormQ18Answer(sub.answers['q18']?.essayAnswer || '');
    setFormQ18Feedback(sub.answers['q18']?.essayFeedback || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStudentName.trim()) {
      setFormError('Vui lòng nhập Họ và tên thí sinh.');
      return;
    }
    if (!formStudentId.trim()) {
      setFormError('Vui lòng nhập Số báo danh hoặc Mã định danh thí sinh.');
      return;
    }
    if (!formStudentClass.trim()) {
      setFormError('Vui lòng chọn hoặc nhập Lớp học.');
      return;
    }

    const clampedP1 = Math.max(0, Math.min(3.0, Number(formScorePart1) || 0));
    const clampedP2 = Math.max(0, Math.min(4.0, Number(formScorePart2) || 0));
    const clampedQ17 = Math.max(0, Math.min(2.0, Number(formQ17Score) || 0));
    const clampedQ18 = Math.max(0, Math.min(1.0, Number(formQ18Score) || 0));
    const clampedP3 = Number((clampedQ17 + clampedQ18).toFixed(2));
    const totalScore = Number((clampedP1 + clampedP2 + clampedP3).toFixed(2));

    const now = new Date();
    const durationSec = Math.max(60, formDurationMinutes * 60);
    const startedAt = new Date(now.getTime() - durationSec * 1000).toISOString();

    if (formMode === 'add') {
      const answers = buildSubmissionAnswers(
        questions,
        clampedP1,
        clampedP2,
        clampedQ17,
        formQ17Answer,
        formQ17Feedback,
        clampedQ18,
        formQ18Answer,
        formQ18Feedback
      );

      const newSub: ExamSubmission = {
        id: `sub-manual-${Date.now()}`,
        examId: 'tin-hoc-9-gk1-2026',
        studentId: formStudentId.trim(),
        studentName: formStudentName.trim(),
        studentClass: formStudentClass.trim(),
        startedAt,
        submittedAt: now.toISOString(),
        durationSeconds: durationSec,
        answers,
        scorePart1: clampedP1,
        scorePart2: clampedP2,
        scorePart3: clampedP3,
        totalScore,
        status: formStatus,
        antiCheatLogs:
          formViolationCount > 0
            ? [
                {
                  id: `log-${Date.now()}`,
                  timestamp: now.toISOString(),
                  type: 'tab_switch',
                  message: `Ghi nhận ${formViolationCount} lần chuyển tab trong ca thi`,
                },
              ]
            : [],
        violationCount: formViolationCount,
      };

      onAddSubmission(newSub);
      setIsFormModalOpen(false);
      showFeedback(`Đã thêm thành công bài nộp của học sinh ${newSub.studentName} (${newSub.studentId})!`, 'success');
    } else {
      // Edit existing submission
      const existing = submissions.find((s) => s.id === editingId);
      if (!existing) {
        setFormError('Không tìm thấy bài nộp cần chỉnh sửa.');
        return;
      }

      const answers = buildSubmissionAnswers(
        questions,
        clampedP1,
        clampedP2,
        clampedQ17,
        formQ17Answer,
        formQ17Feedback,
        clampedQ18,
        formQ18Answer,
        formQ18Feedback,
        existing.answers
      );

      const updatedSub: ExamSubmission = {
        ...existing,
        studentName: formStudentName.trim(),
        studentId: formStudentId.trim(),
        studentClass: formStudentClass.trim(),
        durationSeconds: durationSec,
        answers,
        scorePart1: clampedP1,
        scorePart2: clampedP2,
        scorePart3: clampedP3,
        totalScore,
        status: formStatus,
        violationCount: formViolationCount,
      };

      onUpdateSubmission(updatedSub);
      setIsFormModalOpen(false);
      showFeedback(`Đã cập nhật bài nộp của học sinh ${updatedSub.studentName} thành công!`, 'success');
    }
  };

  // Confirm Single Delete
  const handleConfirmDelete = () => {
    if (!submissionToDelete) return;
    onDeleteSubmission(submissionToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== submissionToDelete.id));
    showFeedback(`Đã xóa bài nộp của thí sinh ${submissionToDelete.studentName} (${submissionToDelete.studentId}).`, 'info');
    setSubmissionToDelete(null);
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = () => {
    selectedIds.forEach((id) => {
      onDeleteSubmission(id);
    });
    showFeedback(`Đã xóa thành công ${selectedIds.length} bài nộp đã chọn.`, 'info');
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  // Confirm Reset Submissions
  const handleConfirmReset = () => {
    if (onResetSubmissions) {
      onResetSubmissions();
      setSelectedIds([]);
      showFeedback('Đã khôi phục danh sách bài nộp về dữ liệu mẫu ban đầu của hệ thống.', 'info');
    }
    setIsResetModalOpen(false);
  };

  // Live essay grading modal handlers
  const handleOpenGrading = (sub: ExamSubmission) => {
    setGradingSubmission(sub);
    setQ17Score(sub.answers['q17']?.essayScore ?? 1.5);
    setQ17Feedback(
      sub.answers['q17']?.essayFeedback ??
        'Đã ghi nhận các tiêu chí phân tích chất lượng thông tin.'
    );
    setQ18Score(sub.answers['q18']?.essayScore ?? 0.8);
    setQ18Feedback(
      sub.answers['q18']?.essayFeedback ??
        'Nêu đúng hành vi vi phạm và cách xử lý an toàn.'
    );
  };

  const handleAISuggestRubric = () => {
    if (!gradingSubmission) return;

    if (essayQ1) {
      const studentText1 = gradingSubmission.answers['q17']?.essayAnswer || '';
      const eval1 = autoEvaluateEssay(essayQ1, studentText1);
      setQ17Score(eval1.score);
      setQ17Feedback(eval1.feedback);
    }

    if (essayQ2) {
      const studentText2 = gradingSubmission.answers['q18']?.essayAnswer || '';
      const eval2 = autoEvaluateEssay(essayQ2, studentText2);
      setQ18Score(eval2.score);
      setQ18Feedback(eval2.feedback);
    }
  };

  const handleSaveGrading = () => {
    if (!gradingSubmission) return;

    const updatedAnswers = {
      ...gradingSubmission.answers,
      q17: {
        ...gradingSubmission.answers['q17'],
        questionId: 'q17',
        essayScore: q17Score,
        essayFeedback: q17Feedback,
      },
      q18: {
        ...gradingSubmission.answers['q18'],
        questionId: 'q18',
        essayScore: q18Score,
        essayFeedback: q18Feedback,
      },
    };

    const { scorePart1, scorePart2, scorePart3, totalScore } = gradeExam(
      questions,
      updatedAnswers
    );

    const updatedSubmission: ExamSubmission = {
      ...gradingSubmission,
      answers: updatedAnswers,
      scorePart1,
      scorePart2,
      scorePart3,
      totalScore,
      status: 'graded',
    };

    onUpdateSubmission(updatedSubmission);
    setGradingSubmission(null);
    showFeedback(`Đã lưu kết quả chấm tự luận cho thí sinh ${updatedSubmission.studentName}!`, 'success');
  };

  // Helper classification badge
  const getScoreBadge = (score: number) => {
    if (score >= 8.0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Award className="w-3 h-3 text-emerald-700" />
          Giỏi ({score.toFixed(2)})
        </span>
      );
    }
    if (score >= 6.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
          Khá ({score.toFixed(2)})
        </span>
      );
    }
    if (score >= 5.0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
          Trung bình ({score.toFixed(2)})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
        Chưa đạt ({score.toFixed(2)})
      </span>
    );
  };

  // Computed summary stats
  const totalCount = submissions.length;
  const avgScore = totalCount > 0 ? submissions.reduce((acc, s) => acc + s.totalScore, 0) / totalCount : 0;
  const passCount = submissions.filter((s) => s.totalScore >= 5.0).length;
  const passRate = totalCount > 0 ? (passCount / totalCount) * 100 : 0;
  const highScoreCount = submissions.filter((s) => s.totalScore >= 8.0).length;
  const flaggedCount = submissions.filter((s) => s.violationCount > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : feedback.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-600/20'
              : 'bg-indigo-600 text-white shadow-indigo-600/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar with Action Buttons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Hệ Thống Khảo Thí & Chấm Thi
              </span>
              <span className="text-xs text-slate-400">• Tin học 9</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>Quản Lý Bài Nộp & Chấm Tự Luận</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Toàn quyền thêm mới, chỉnh sửa thông tin, cập nhật điểm số, chấm tự luận và xóa bài nộp của học sinh.
            </p>
          </div>

          {/* Action Buttons: Multi-Student Print, Add Submission & Reset Submissions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* IN KẾT QUẢ NHIỀU HỌC SINH */}
            <button
              type="button"
              id="btn-open-multi-print"
              onClick={() => {
                const targetIds = selectedIds.length > 0 ? selectedIds : filteredSubmissions.map((s) => s.id);
                setMultiPrintSelectedIds(targetIds);
                setIsMultiPrintModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="In kết quả thi của nhiều học sinh (Bộ phiếu điểm cá nhân liên tục hoặc Bảng tổng hợp điểm cả lớp)"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>In kết quả nhiều học sinh</span>
            </button>

            {onResetSubmissions && (
              <button
                type="button"
                id="btn-reset-submissions"
                onClick={() => setIsResetModalOpen(true)}
                title="Khôi phục danh sách bài nộp về dữ liệu chuẩn ban đầu"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Khôi phục mẫu</span>
              </button>
            )}

            <button
              type="button"
              id="btn-open-add-submission"
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bài nộp mới</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 font-medium">Tổng số bài nộp</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{totalCount} bài</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 font-medium">Điểm trung bình</div>
            <div className="text-lg sm:text-xl font-black text-indigo-700 mt-0.5">{avgScore.toFixed(2)} / 10</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 font-medium">Tỉ lệ đạt (≥ 5.0)</div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5">{passRate.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 font-medium">Điểm Giỏi (≥ 8.0)</div>
            <div className="text-lg sm:text-xl font-black text-purple-700 mt-0.5">{highScoreCount} bài</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
            <div className="text-slate-500 font-medium">Cảnh báo vi phạm</div>
            <div className="text-lg sm:text-xl font-black text-rose-700 mt-0.5">{flaggedCount} bài</div>
          </div>
        </div>

        {/* Search, Filter & Bulk Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-search-submissions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên học sinh, SBD, lớp..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Class Filter Dropdown */}
            {availableClasses.length > 1 && (
              <select
                id="select-filter-class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả các lớp ({availableClasses.length})</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({submissions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('high_score')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'high_score'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Giỏi (≥8đ) ({submissions.filter((s) => s.totalScore >= 8.0).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('flagged')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'flagged'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vi phạm ({submissions.filter((s) => s.violationCount > 0).length})
              </button>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs text-indigo-900 shadow-2xs">
              <span className="font-bold">Đã chọn {selectedIds.length} bài nộp</span>
              
              <button
                type="button"
                id="btn-bulk-print"
                onClick={() => {
                  setMultiPrintSelectedIds(selectedIds);
                  setIsMultiPrintModalOpen(true);
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                title="In kết quả các bài nộp đã chọn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In {selectedIds.length} bài đã chọn</span>
              </button>

              <button
                type="button"
                id="btn-bulk-delete"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa các bài</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả các bài nộp'}
                    className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 font-bold">Thí sinh</th>
                <th className="p-3.5 font-bold">Lớp</th>
                <th className="p-3.5 font-bold">SBD</th>
                <th className="p-3.5 font-bold text-center">Phần I (TN)</th>
                <th className="p-3.5 font-bold text-center">Phần II (Đ/S)</th>
                <th className="p-3.5 font-bold text-center">Phần III (TL)</th>
                <th className="p-3.5 font-bold text-center">Tổng điểm & Xếp loại</th>
                <th className="p-3.5 font-bold text-center">Giám sát vi phạm</th>
                <th className="p-3.5 font-bold text-right">Thao tác & Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-bold text-sm text-slate-700">Không tìm thấy bài nộp nào phù hợp</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Thêm bài nộp mới&quot; để tạo bài thi.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(sub.id)}
                          className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900">{sub.studentName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {Math.floor(sub.durationSeconds / 60)} phút {sub.durationSeconds % 60}s
                          </span>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                          {sub.studentClass}
                        </span>
                      </td>

                      {/* Student ID */}
                      <td className="p-3.5 font-mono font-bold text-slate-600">{sub.studentId}</td>

                      {/* Score Part 1 */}
                      <td className="p-3.5 text-center font-semibold text-indigo-600">
                        {sub.scorePart1.toFixed(2)}/3.0
                      </td>

                      {/* Score Part 2 */}
                      <td className="p-3.5 text-center font-semibold text-indigo-600">
                        {sub.scorePart2.toFixed(2)}/4.0
                      </td>

                      {/* Score Part 3 */}
                      <td className="p-3.5 text-center font-semibold text-purple-600">
                        {sub.scorePart3.toFixed(2)}/3.0
                      </td>

                      {/* Total Score & Badge */}
                      <td className="p-3.5 text-center">
                        <div>{getScoreBadge(sub.totalScore)}</div>
                      </td>

                      {/* Anti-cheat audit */}
                      <td className="p-3.5 text-center">
                        {sub.violationCount === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            0 vi phạm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {sub.violationCount} lần rời tab
                          </span>
                        )}
                      </td>

                      {/* Actions: Chấm TL, Sửa, Xem bài, Xóa */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chấm tự luận */}
                          <button
                            type="button"
                            id={`btn-grade-${sub.id}`}
                            onClick={() => handleOpenGrading(sub)}
                            title="Chấm điểm tự luận với Barem Bộ GD&ĐT và AI"
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-indigo-200 shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Chấm TL</span>
                          </button>

                          {/* Sửa bài nộp */}
                          <button
                            type="button"
                            id={`btn-edit-submission-${sub.id}`}
                            onClick={() => handleOpenEdit(sub)}
                            title="Chỉnh sửa thông tin thí sinh và kết quả bài làm"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 shadow-2xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                            <span>Sửa</span>
                          </button>

                          {/* Xem chi tiết */}
                          <button
                            type="button"
                            id={`btn-view-${sub.id}`}
                            onClick={() => onViewStudentDetail(sub)}
                            title="Xem chi tiết toàn bộ bài làm của học sinh"
                            className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                          >
                            Xem bài
                          </button>

                          {/* In kết quả học sinh này */}
                          <button
                            type="button"
                            id={`btn-print-${sub.id}`}
                            onClick={() => {
                              setMultiPrintSelectedIds([sub.id]);
                              setIsMultiPrintModalOpen(true);
                            }}
                            title="In phiếu báo điểm cá nhân cho học sinh này"
                            className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200 shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden xl:inline">In điểm</span>
                          </button>

                          {/* Xóa bài nộp */}
                          <button
                            type="button"
                            id={`btn-delete-submission-${sub.id}`}
                            onClick={() => setSubmissionToDelete(sub)}
                            title="Xóa bài nộp này khỏi hệ thống"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hiển thị <strong>{filteredSubmissions.length}</strong> trên tổng số <strong>{submissions.length}</strong> bài nộp
          </span>
          <span className="text-slate-400">
            Dữ liệu bài nộp được tự động đồng bộ và lưu trữ trên trình duyệt
          </span>
        </div>
      </div>

      {/* MODAL 1: Thêm / Sửa Bài Nộp Mới */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  {formMode === 'add' ? (
                    <Plus className="w-5 h-5 text-indigo-300" />
                  ) : (
                    <Pencil className="w-5 h-5 text-indigo-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {formMode === 'add' ? 'Thêm Bài Nộp Mới Của Học Sinh' : 'Chỉnh Sửa Bài Nộp Của Thí Sinh'}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {formMode === 'add'
                      ? 'Nhập thông tin thí sinh, điểm số từng phần và nội dung bài làm'
                      : `Mã bài nộp: ${editingId}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
              {/* Quick Template Presets for Add Mode */}
              {formMode === 'add' && (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Điền nhanh dữ liệu học sinh mẫu:
                    </span>
                    <span className="text-[11px] text-indigo-600 font-medium">Bấm để tự động điền</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('gioi')}
                      className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      Học sinh Giỏi (Nguyễn Hà Linh - 8.9đ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('kha')}
                      className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      Học sinh Khá (Trần Quốc Tuấn - 7.0đ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('trung_binh')}
                      className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      Học sinh TB (Vũ Đức Thắng - 5.25đ)
                    </button>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Student Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>1. Thông tin thí sinh & Ca thi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="input-form-student-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên học sinh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-form-student-name"
                      type="text"
                      required
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Hoàng Nam"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-form-student-id" className="block text-xs font-bold text-slate-700 mb-1">
                      Số báo danh / SBD <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-form-student-id"
                      type="text"
                      required
                      value={formStudentId}
                      onChange={(e) => setFormStudentId(e.target.value)}
                      placeholder="Ví dụ: HS0905"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-form-student-class" className="block text-xs font-bold text-slate-700 mb-1">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-form-student-class"
                      type="text"
                      required
                      value={formStudentClass}
                      onChange={(e) => setFormStudentClass(e.target.value)}
                      placeholder="Ví dụ: 9A1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="input-form-duration" className="block text-xs font-bold text-slate-700 mb-1">
                      Thời gian làm bài (Phút)
                    </label>
                    <input
                      id="input-form-duration"
                      type="number"
                      min={1}
                      max={90}
                      value={formDurationMinutes}
                      onChange={(e) => setFormDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-form-violations" className="block text-xs font-bold text-slate-700 mb-1">
                      Số lần vi phạm giám sát (tab switch)
                    </label>
                    <input
                      id="input-form-violations"
                      type="number"
                      min={0}
                      max={20}
                      value={formViolationCount}
                      onChange={(e) => setFormViolationCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="select-form-status" className="block text-xs font-bold text-slate-700 mb-1">
                      Trạng thái bài thi
                    </label>
                    <select
                      id="select-form-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="graded">Đã chấm điểm hoàn tất</option>
                      <option value="submitted">Đã nộp bài (Chờ rà soát)</option>
                      <option value="pending_essay">Chờ chấm tự luận</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Scores & Answers */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>2. Điểm số các phần thi & Nội dung tự luận</span>
                </h4>

                {/* Score inputs for Part 1 & Part 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="input-form-score-p1" className="text-xs font-bold text-slate-800">
                        Phần I: Trắc nghiệm nhiều lựa chọn
                      </label>
                      <span className="text-[11px] font-semibold text-slate-500">Tối đa 3.0 điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-form-score-p1"
                        type="number"
                        min={0}
                        max={3.0}
                        step={0.25}
                        value={formScorePart1}
                        onChange={(e) => setFormScorePart1(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <span className="font-bold text-slate-600 text-xs">/ 3.0đ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">12 câu hỏi trắc nghiệm (0.25đ / câu).</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="input-form-score-p2" className="text-xs font-bold text-slate-800">
                        Phần II: Trắc nghiệm Đúng/Sai
                      </label>
                      <span className="text-[11px] font-semibold text-slate-500">Tối đa 4.0 điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-form-score-p2"
                        type="number"
                        min={0}
                        max={4.0}
                        step={0.1}
                        value={formScorePart2}
                        onChange={(e) => setFormScorePart2(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <span className="font-bold text-slate-600 text-xs">/ 4.0đ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">4 câu hỏi chùm (theo barem Bộ GD&ĐT).</p>
                  </div>
                </div>

                {/* Essay Question 1 */}
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 text-xs sm:text-sm">
                      Câu 1 Tự luận (Chất lượng thông tin) - Tối đa 2.0 điểm
                    </span>
                    <div className="flex items-center gap-2">
                      <label htmlFor="input-form-q17-score" className="text-xs font-bold text-purple-900">
                        Điểm chấm:
                      </label>
                      <input
                        id="input-form-q17-score"
                        type="number"
                        min={0}
                        max={2.0}
                        step={0.25}
                        value={formQ17Score}
                        onChange={(e) => setFormQ17Score(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs sm:text-sm font-bold text-purple-700 text-center"
                      />
                      <span className="text-xs text-purple-900 font-semibold">/ 2.0đ</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="textarea-form-q17-ans" className="block text-xs font-semibold text-purple-900 mb-1">
                      Bài làm của học sinh:
                    </label>
                    <textarea
                      id="textarea-form-q17-ans"
                      rows={3}
                      value={formQ17Answer}
                      onChange={(e) => setFormQ17Answer(e.target.value)}
                      placeholder="Nhập nội dung bài làm tự luận của học sinh..."
                      className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="textarea-form-q17-fb" className="block text-xs font-semibold text-purple-900 mb-1">
                      Nhận xét & Lời khuyên của giảng viên:
                    </label>
                    <input
                      id="textarea-form-q17-fb"
                      type="text"
                      value={formQ17Feedback}
                      onChange={(e) => setFormQ17Feedback(e.target.value)}
                      placeholder="Lời nhận xét cho câu 1..."
                      className="w-full p-2 bg-white border border-purple-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Essay Question 2 */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                      Câu 2 Tự luận (Đạo đức & Pháp luật số) - Tối đa 1.0 điểm
                    </span>
                    <div className="flex items-center gap-2">
                      <label htmlFor="input-form-q18-score" className="text-xs font-bold text-indigo-900">
                        Điểm chấm:
                      </label>
                      <input
                        id="input-form-q18-score"
                        type="number"
                        min={0}
                        max={1.0}
                        step={0.25}
                        value={formQ18Score}
                        onChange={(e) => setFormQ18Score(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs sm:text-sm font-bold text-indigo-700 text-center"
                      />
                      <span className="text-xs text-indigo-900 font-semibold">/ 1.0đ</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="textarea-form-q18-ans" className="block text-xs font-semibold text-indigo-900 mb-1">
                      Bài làm của học sinh:
                    </label>
                    <textarea
                      id="textarea-form-q18-ans"
                      rows={3}
                      value={formQ18Answer}
                      onChange={(e) => setFormQ18Answer(e.target.value)}
                      placeholder="Nhập nội dung bài làm tự luận của học sinh..."
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="textarea-form-q18-fb" className="block text-xs font-semibold text-indigo-900 mb-1">
                      Nhận xét & Lời khuyên của giảng viên:
                    </label>
                    <input
                      id="textarea-form-q18-fb"
                      type="text"
                      value={formQ18Feedback}
                      onChange={(e) => setFormQ18Feedback(e.target.value)}
                      placeholder="Lời nhận xét cho câu 2..."
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Total Score Summary Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Xem trước tổng điểm:</div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Phần I ({Number(formScorePart1 || 0).toFixed(2)}đ) + Phần II ({Number(formScorePart2 || 0).toFixed(2)}đ) + Phần III ({(Number(formQ17Score || 0) + Number(formQ18Score || 0)).toFixed(2)}đ)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">
                      {(
                        Number(formScorePart1 || 0) +
                        Number(formScorePart2 || 0) +
                        Number(formQ17Score || 0) +
                        Number(formQ18Score || 0)
                      ).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ 10.0đ</span>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  id="btn-submit-submission-form"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{formMode === 'add' ? 'Lưu bài nộp mới' : 'Cập nhật thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Xóa 1 bài nộp (Confirm Single Delete) */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa bài nộp</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa bài nộp của học sinh{' '}
              <strong className="text-slate-900">{submissionToDelete.studentName}</strong> (SBD:{' '}
              <strong className="font-mono text-indigo-700">{submissionToDelete.studentId}</strong>, Lớp:{' '}
              <strong>{submissionToDelete.studentClass}</strong>) với điểm số hiện tại là{' '}
              <strong>{submissionToDelete.totalScore.toFixed(2)}/10đ</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubmissionToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-delete-submission"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Xóa hàng loạt bài nộp (Confirm Bulk Delete) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xóa hàng loạt bài nộp</h3>
                <p className="text-xs text-slate-500">Thao tác áp dụng cho các mục đã chọn</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa vĩnh viễn{' '}
              <strong className="text-rose-700">{selectedIds.length} bài nộp</strong> đã chọn khỏi hệ thống?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-bulk-delete"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa {selectedIds.length} bài đã chọn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Khôi phục danh sách bài nộp ban đầu */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Khôi phục danh sách mẫu</h3>
                <p className="text-xs text-slate-500">Đưa về các bài nộp kiểm định chuẩn</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              Hệ thống sẽ đặt lại danh sách bài nộp về 4 bài thi mẫu ban đầu của các học sinh (Nguyễn Hoàng Minh, Trần Thị Thu Trang, Lê Văn Nam, Phạm Hoàng Bách). Các bài nộp mới thêm vào sẽ bị thay thế.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-reset-submissions"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Chấm Bài Tự Luận Chi Tiết (Dedicated Grading Modal) */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                  Chấm Bài Tự Luận Trực Quan
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Thí sinh: {gradingSubmission.studentName} ({gradingSubmission.studentClass} - {gradingSubmission.studentId})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Anti-cheat audit notice */}
              {gradingSubmission.antiCheatLogs.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Nhật ký giám sát: Ghi nhận {gradingSubmission.antiCheatLogs.length} lần vi phạm</span>
                  </div>
                  {gradingSubmission.antiCheatLogs.map((log) => (
                    <div key={log.id} className="text-[11px] text-rose-700">
                      • {new Date(log.timestamp).toLocaleTimeString()}: {log.message}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Suggest Button */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Trợ lý AI chấm điểm theo Barem Bộ GD&ĐT</span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Tự động đối chiếu bài làm của thí sinh với từ khóa và các tiêu chí barem chính thức.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-ai-evaluate-essay"
                  onClick={handleAISuggestRubric}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Gợi ý chấm điểm</span>
                </button>
              </div>

              {/* Câu 1 Tự luận (2.0 điểm) */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">
                    Câu 1 Tự luận (Tối đa 2.0 điểm) - Chất lượng thông tin
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="q17-score-input" className="text-xs font-semibold text-slate-600">
                      Điểm chấm:
                    </label>
                    <input
                      id="q17-score-input"
                      type="number"
                      min={0}
                      max={2.0}
                      step={0.25}
                      value={q17Score}
                      onChange={(e) => setQ17Score(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 text-center"
                    />
                    <span className="text-xs text-slate-500">/ 2.0đ</span>
                  </div>
                </div>

                {/* Student's answer */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">
                    Bài làm của thí sinh:
                  </div>
                  <p className="text-slate-800 whitespace-pre-line italic">
                    {gradingSubmission.answers['q17']?.essayAnswer || '(Thí sinh chưa trả lời)'}
                  </p>
                </div>

                {/* Teacher feedback note */}
                <div>
                  <label htmlFor="q17-feedback-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhận xét & Lời khuyên của giảng viên:
                  </label>
                  <textarea
                    id="q17-feedback-input"
                    rows={3}
                    value={q17Feedback}
                    onChange={(e) => setQ17Feedback(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Câu 2 Tự luận (1.0 điểm) */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">
                    Câu 2 Tự luận (Tối đa 1.0 điểm) - An toàn không gian mạng
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="q18-score-input" className="text-xs font-semibold text-slate-600">
                      Điểm chấm:
                    </label>
                    <input
                      id="q18-score-input"
                      type="number"
                      min={0}
                      max={1.0}
                      step={0.25}
                      value={q18Score}
                      onChange={(e) => setQ18Score(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 text-center"
                    />
                    <span className="text-xs text-slate-500">/ 1.0đ</span>
                  </div>
                </div>

                {/* Student's answer */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">
                    Bài làm của thí sinh:
                  </div>
                  <p className="text-slate-800 whitespace-pre-line italic">
                    {gradingSubmission.answers['q18']?.essayAnswer || '(Thí sinh chưa trả lời)'}
                  </p>
                </div>

                {/* Teacher feedback note */}
                <div>
                  <label htmlFor="q18-feedback-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhận xét & Lời khuyên của giảng viên:
                  </label>
                  <textarea
                    id="q18-feedback-input"
                    rows={3}
                    value={q18Feedback}
                    onChange={(e) => setQ18Feedback(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700">
                Tổng điểm sau khi cập nhật:{' '}
                <span className="text-sm font-black text-indigo-700">
                  {(
                    gradingSubmission.scorePart1 +
                    gradingSubmission.scorePart2 +
                    q17Score +
                    q18Score
                  ).toFixed(2)}
                  /10.0
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  id="btn-save-essay-grading"
                  onClick={handleSaveGrading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu điểm & Cập nhật kết quả</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Student Print Modal */}
      <PrintMultipleReportsModal
        isOpen={isMultiPrintModalOpen}
        onClose={() => setIsMultiPrintModalOpen(false)}
        examInfo={examInfo}
        submissions={submissions}
        questions={questions}
        initialSelectedIds={multiPrintSelectedIds}
      />
    </div>
  );
};
