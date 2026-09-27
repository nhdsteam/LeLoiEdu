import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Table,
  CheckCircle2,
  HelpCircle,
  Layers,
  X,
  Save,
  RotateCcw,
  Sparkles,
  FileText,
  BookOpen,
  Settings2,
  Clock,
  Award,
  UploadCloud,
  Check,
  AlertCircle,
  FolderArchive,
} from 'lucide-react';
import {
  CognitiveLevel,
  ExamInfo,
  Question,
  QuestionType,
  SavedExam,
  TopicId,
} from '../types';
import { EXAM_MATRIX, INITIAL_QUESTIONS, TOPICS } from '../data/examData';
import { AutoExamFromFileModal } from './AutoExamFromFileModal';
import { NewExamConfigModal } from './NewExamConfigModal';
import { ExamRepositoryManager } from './ExamRepositoryManager';

interface QuestionBankManagerProps {
  questions: Question[];
  onAddQuestion: (newQuestion: Question) => void;
  onUpdateQuestion: (updatedQuestion: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onResetQuestions: () => void;
  examInfo: ExamInfo;
  onUpdateExamInfo: (newExamInfo: ExamInfo) => void;
  onImportExam: (newExamInfo: ExamInfo, newQuestions: Question[]) => void;
  savedExams: SavedExam[];
  onSwitchActiveExam: (selectedExam: SavedExam) => void;
  onSaveCurrentExamToRepo: (note?: string) => void;
  onDeleteSavedExam: (id: string) => Promise<void> | void;
  onDuplicateExam: (id: string) => void;
  onUpdateSavedExamMeta: (id: string, updatedInfo: Partial<ExamInfo>, note?: string) => void;
  onImportExamJson: (importedExam: SavedExam) => void;
  onSaveNewExamWithArchive: (
    newExamInfo: ExamInfo,
    resetQuestionsMode?: 'keep' | 'reset_default' | 'clear',
    saveOldExam?: boolean,
    oldExamNote?: string
  ) => void;
  onApplyExamWithArchive: (
    newExamInfo: ExamInfo,
    newQuestions: Question[],
    saveOldExam?: boolean,
    oldExamNote?: string
  ) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  examInfo,
  onUpdateExamInfo,
  onImportExam,
  savedExams,
  onSwitchActiveExam,
  onSaveCurrentExamToRepo,
  onDeleteSavedExam,
  onDuplicateExam,
  onUpdateSavedExamMeta,
  onImportExamJson,
  onSaveNewExamWithArchive,
  onApplyExamWithArchive,
}) => {
  const [bankTab, setBankTab] = useState<'questions' | 'repository'>('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // New Modals: Auto Exam from File and New Exam Config
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const [showNewExamConfigModal, setShowNewExamConfigModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Add/Edit Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states
  const [formPart, setFormPart] = useState<1 | 2 | 3>(1);
  const [formType, setFormType] = useState<QuestionType>('multiple_choice');
  const [formTopic, setFormTopic] = useState<TopicId>('topic_1');
  const [formLevel, setFormLevel] = useState<CognitiveLevel>('biet');
  const [formContent, setFormContent] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formMaxScore, setFormMaxScore] = useState<number>(0.25);

  // For MCQ
  const [mcqOptA, setMcqOptA] = useState('');
  const [mcqOptB, setMcqOptB] = useState('');
  const [mcqOptC, setMcqOptC] = useState('');
  const [mcqOptD, setMcqOptD] = useState('');
  const [mcqCorrect, setMcqCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // For True/False
  const [tfStmtA, setTfStmtA] = useState('');
  const [tfStmtACorrect, setTfStmtACorrect] = useState(true);
  const [tfStmtB, setTfStmtB] = useState('');
  const [tfStmtBCorrect, setTfStmtBCorrect] = useState(true);
  const [tfStmtC, setTfStmtC] = useState('');
  const [tfStmtCCorrect, setTfStmtCCorrect] = useState(false);
  const [tfStmtD, setTfStmtD] = useState('');
  const [tfStmtDCorrect, setTfStmtDCorrect] = useState(true);

  // For Essay
  const [essaySample, setEssaySample] = useState('');
  const [essayRubrics, setEssayRubrics] = useState<string>(
    'Tiêu chí 1 (+0.5đ)\nTiêu chí 2 (+0.5đ)'
  );

  const handleOpenAdd = () => {
    setEditingQuestionId(null);
    setFormPart(1);
    setFormType('multiple_choice');
    setFormTopic('topic_1');
    setFormLevel('biet');
    setFormContent('');
    setFormExplanation('');
    setFormMaxScore(0.25);
    setMcqOptA('');
    setMcqOptB('');
    setMcqOptC('');
    setMcqOptD('');
    setMcqCorrect('A');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setFormPart(q.part);
    setFormType(q.type);
    setFormTopic(q.topicId);
    setFormLevel(q.cognitiveLevel);
    setFormContent(q.content);
    setFormExplanation(q.explanation || '');
    setFormMaxScore(q.maxScore);

    if (q.type === 'multiple_choice') {
      setMcqOptA(q.options.find((o) => o.key === 'A')?.text || '');
      setMcqOptB(q.options.find((o) => o.key === 'B')?.text || '');
      setMcqOptC(q.options.find((o) => o.key === 'C')?.text || '');
      setMcqOptD(q.options.find((o) => o.key === 'D')?.text || '');
      setMcqCorrect(q.correctAnswer);
    } else if (q.type === 'true_false') {
      const sA = q.statements.find((s) => s.id === 'a');
      const sB = q.statements.find((s) => s.id === 'b');
      const sC = q.statements.find((s) => s.id === 'c');
      const sD = q.statements.find((s) => s.id === 'd');
      setTfStmtA(sA?.text || '');
      setTfStmtACorrect(sA?.correctAnswer ?? true);
      setTfStmtB(sB?.text || '');
      setTfStmtBCorrect(sB?.correctAnswer ?? true);
      setTfStmtC(sC?.text || '');
      setTfStmtCCorrect(sC?.correctAnswer ?? false);
      setTfStmtD(sD?.text || '');
      setTfStmtDCorrect(sD?.correctAnswer ?? true);
    } else if (q.type === 'essay') {
      setEssaySample(q.sampleAnswer || '');
      setEssayRubrics(
        q.rubric.map((r) => `${r.description} (+${r.maxScore}đ)`).join('\n')
      );
    }
    setIsModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const questionId = editingQuestionId || `custom-${Date.now()}`;
    const nextNumber = editingQuestionId
      ? questions.find((q) => q.id === editingQuestionId)?.number || 1
      : questions.filter((q) => q.part === formPart).length + 1;

    let newQuestion: Question;

    if (formType === 'multiple_choice') {
      newQuestion = {
        id: questionId,
        number: nextNumber,
        part: 1,
        type: 'multiple_choice',
        topicId: formTopic,
        cognitiveLevel: formLevel,
        maxScore: formMaxScore,
        content: formContent,
        explanation: formExplanation,
        options: [
          { key: 'A', text: mcqOptA },
          { key: 'B', text: mcqOptB },
          { key: 'C', text: mcqOptC },
          { key: 'D', text: mcqOptD },
        ],
        correctAnswer: mcqCorrect,
      };
    } else if (formType === 'true_false') {
      newQuestion = {
        id: questionId,
        number: nextNumber,
        part: 2,
        type: 'true_false',
        topicId: formTopic,
        cognitiveLevel: formLevel,
        maxScore: formMaxScore || 1.0,
        content: formContent,
        explanation: formExplanation,
        statements: [
          { id: 'a', text: tfStmtA, correctAnswer: tfStmtACorrect },
          { id: 'b', text: tfStmtB, correctAnswer: tfStmtBCorrect },
          { id: 'c', text: tfStmtC, correctAnswer: tfStmtCCorrect },
          { id: 'd', text: tfStmtD, correctAnswer: tfStmtDCorrect },
        ],
      };
    } else {
      const rubricLines = essayRubrics.split('\n').filter((l) => l.trim().length > 0);
      newQuestion = {
        id: questionId,
        number: nextNumber,
        part: 3,
        type: 'essay',
        topicId: formTopic,
        cognitiveLevel: formLevel,
        maxScore: formMaxScore || 2.0,
        content: formContent,
        explanation: formExplanation,
        sampleAnswer: essaySample,
        rubric: rubricLines.map((line, idx) => ({
          id: `rubric-${idx}`,
          description: line,
          maxScore: 0.5,
        })),
      };
    }

    if (editingQuestionId) {
      onUpdateQuestion(newQuestion);
    } else {
      onAddQuestion(newQuestion);
    }

    setIsModalOpen(false);
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.explanation && q.explanation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (selectedTopic !== 'all' && q.topicId !== selectedTopic) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    if (selectedLevel !== 'all' && q.cognitiveLevel !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Sub-Navigation Tabs: Active Bank vs Exam Repository */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="tab-btn-questions-bank"
            onClick={() => setBankTab('questions')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              bankTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Đề Hiện Hành & Ngân Hàng Câu Hỏi</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                bankTab === 'questions' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {questions.length} câu
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-exam-repository"
            onClick={() => setBankTab('repository')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              bankTab === 'repository'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-emerald-500" />
            <span>Quản Lý Kho Đề Thi (Lưu Đề Cũ)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                bankTab === 'repository' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {savedExams.length} đề
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 pr-2">
          <FolderArchive className="w-4 h-4 text-emerald-600" />
          <span>Tự động lưu trữ an toàn các đề thi cũ khi tạo đề mới</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 border shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {bankTab === 'repository' ? (
        <ExamRepositoryManager
          savedExams={savedExams}
          currentExamInfo={examInfo}
          currentQuestions={questions}
          onSwitchActiveExam={(selected) => {
            onSwitchActiveExam(selected);
            setNotification({
              type: 'success',
              message: `Đã kích hoạt đề thi: "${selected.examInfo.title}" (${selected.questions.length} câu hỏi). Toàn bộ bài thi học sinh sẽ làm theo đề này.`,
            });
            setBankTab('questions');
          }}
          onSaveCurrentExamToRepo={(note) => {
            onSaveCurrentExamToRepo(note);
            setNotification({
              type: 'success',
              message: `Đã lưu bản sao đề thi hiện tại vào Kho đề thi thành công!`,
            });
          }}
          onDeleteSavedExam={onDeleteSavedExam}
          onDuplicateExam={onDuplicateExam}
          onUpdateSavedExamMeta={onUpdateSavedExamMeta}
          onImportExamJson={onImportExamJson}
          onOpenCreateNewExam={() => setShowNewExamConfigModal(true)}
          onOpenAutoImportFile={() => setShowAutoImportModal(true)}
        />
      ) : (
        <>
          {/* Active Exam Overview Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Kỳ thi hiện hành</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                    {examInfo.grade} • {examInfo.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{examInfo.durationMinutes} phút</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {examInfo.title}
                </h2>

                <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>{examInfo.school}</span>
                  <span>•</span>
                  <span>{examInfo.department}</span>
                  <span>•</span>
                  <span>Bộ sách: {examInfo.curriculum}</span>
                  <span>•</span>
                  <span>{examInfo.academicYear}</span>
                </p>
              </div>

              {/* Action Buttons for Exam */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  id="btn-quick-save-repo"
                  onClick={() => {
                    onSaveCurrentExamToRepo('Lưu thủ công từ thanh công cụ ngân hàng câu hỏi');
                    setNotification({
                      type: 'success',
                      message: `Đã lưu đề thi hiện hành "${examInfo.title}" vào Kho Quản Lý Đề Thi!`,
                    });
                  }}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-emerald-950/30 transition-all flex items-center gap-2 cursor-pointer"
                  title="Lưu đề thi này vào kho lưu trữ để bảo toàn đề cũ"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>Lưu đề này vào kho</span>
                </button>

                <button
                  type="button"
                  id="btn-open-repo-tab"
                  onClick={() => setBankTab('repository')}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Mở kho lưu trữ để xem và quản lý các đề thi cũ"
                >
                  <Layers className="w-4 h-4 text-indigo-300" />
                  <span>Kho đề thi ({savedExams.length})</span>
                </button>

                <button
                  type="button"
                  id="btn-auto-exam-word-pdf"
                  onClick={() => setShowAutoImportModal(true)}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2 border border-purple-400/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Tạo đề từ Word / PDF</span>
                </button>

                <button
                  type="button"
                  id="btn-new-exam-config"
                  onClick={() => setShowNewExamConfigModal(true)}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Settings2 className="w-4 h-4 text-indigo-300" />
                  <span>Nhập đề thi mới</span>
                </button>
              </div>
            </div>
          </div>

      {/* Top Header / Questions Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Ngân Hàng Câu Hỏi & Phân Loại Ma Trận</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đang hiển thị: <strong>{filteredQuestions.length}/{questions.length} câu hỏi</strong> trong đề thi (12 Trắc nghiệm, 4 Đúng/Sai, 2 Tự luận).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-view-matrix"
            onClick={() => setShowMatrixModal(true)}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Table className="w-4 h-4 text-indigo-600" />
            <span>Xem Ma trận CV 7991</span>
          </button>

          <button
            type="button"
            id="btn-reset-questions"
            onClick={() => {
              if (confirm('Khôi phục lại toàn bộ ngân hàng câu hỏi gốc theo CV 7991/BGDĐT?')) {
                onResetQuestions();
                setNotification({
                  type: 'info',
                  message: 'Đã khôi phục ngân hàng câu hỏi gốc theo chuẩn CV 7991/BGDĐT.',
                });
              }
            }}
            className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Khôi phục câu hỏi mặc định"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-add-new-question"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">Tất cả chủ đề</option>
            <option value="topic_1">CĐ 1: Máy tính & cộng đồng</option>
            <option value="topic_2">CĐ 2: Thông tin giải quyết VĐ</option>
            <option value="topic_3">CĐ 3: Đạo đức, pháp luật số</option>
            <option value="topic_4">CĐ 4: Phần mềm mô phỏng</option>
          </select>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="multiple_choice">Phần I: Trắc nghiệm (4 LC)</option>
            <option value="true_false">Phần II: Đúng / Sai (4 ý)</option>
            <option value="essay">Phần III: Tự luận</option>
          </select>

          {/* Level Select */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">Mức độ nhận thức</option>
            <option value="biet">Nhận biết</option>
            <option value="hieu">Thông hiểu</option>
            <option value="van_dung">Vận dụng</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-indigo-300 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {q.part === 1
                    ? `Phần I - Câu ${q.number}`
                    : q.part === 2
                    ? `Phần II - Câu ${q.number}`
                    : `Phần III - Tự luận ${q.number}`}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {TOPICS[q.topicId]?.name}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  {q.cognitiveLevel === 'biet' ? 'Nhận biết' : q.cognitiveLevel === 'hieu' ? 'Thông hiểu' : 'Vận dụng'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {q.maxScore.toFixed(2)} điểm
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id={`btn-edit-${q.id}`}
                  onClick={() => handleOpenEdit(q)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Chỉnh sửa câu hỏi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id={`btn-delete-${q.id}`}
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Content */}
            <div className="text-sm sm:text-base font-semibold text-slate-900 mb-3 whitespace-pre-line">
              {q.content}
            </div>

            {/* MCQ Options preview */}
            {q.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      opt.key === q.correctAnswer
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-white border border-current flex items-center justify-center font-bold text-[11px]">
                      {opt.key}
                    </span>
                    <span>{opt.text}</span>
                    {opt.key === q.correctAnswer && (
                      <span className="ml-auto text-emerald-600 text-[10px] uppercase font-bold">
                        (Đáp án đúng)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* True/False Statements preview */}
            {q.type === 'true_false' && (
              <div className="space-y-1.5 text-xs">
                {q.statements.map((s) => (
                  <div
                    key={s.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 uppercase">{s.id})</span>
                      <span className="text-slate-800">{s.text}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        s.correctAnswer
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.correctAnswer ? 'Đúng (Đ)' : 'Sai (S)'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Essay Rubric preview */}
            {q.type === 'essay' && (
              <div className="text-xs bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 space-y-1">
                <div className="font-bold text-indigo-900">Barem chấm điểm:</div>
                {q.rubric.map((r) => (
                  <div key={r.id} className="text-indigo-800">
                    • (+{r.maxScore}đ): {r.description}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation */}
            {q.explanation && (
              <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Giải thích: {q.explanation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      </>
      )}

      {/* Official Matrix Modal (CV 7991/BGDĐT-GDTrH) */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Căn cứ Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Ma Trận Đề Kiểm Tra Định Kì Giữa Học Kì 1 - Tin Học 9
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-xs">
                      <th className="p-3 font-bold border-r border-slate-200" rowSpan={2}>
                        Chủ đề / Đơn vị kiến thức
                      </th>
                      <th className="p-3 font-bold text-center border-r border-slate-200" colSpan={3}>
                        Nhiều lựa chọn (30%)
                      </th>
                      <th className="p-3 font-bold text-center border-r border-slate-200" colSpan={3}>
                        Đúng - Sai (40%)
                      </th>
                      <th className="p-3 font-bold text-center border-r border-slate-200" colSpan={3}>
                        Tự luận (30%)
                      </th>
                      <th className="p-3 font-bold text-center" rowSpan={2}>
                        Tổng câu / Điểm
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] text-center">
                      <th className="p-1 border-r border-slate-200">Biết</th>
                      <th className="p-1 border-r border-slate-200">Hiểu</th>
                      <th className="p-1 border-r border-slate-200">VD</th>
                      <th className="p-1 border-r border-slate-200">Biết</th>
                      <th className="p-1 border-r border-slate-200">Hiểu</th>
                      <th className="p-1 border-r border-slate-200">VD</th>
                      <th className="p-1 border-r border-slate-200">Biết</th>
                      <th className="p-1 border-r border-slate-200">Hiểu</th>
                      <th className="p-1 border-r border-slate-200">VD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {EXAM_MATRIX.map((item, i) => (
                      <tr key={item.topicId} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                          <div>{item.topicName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{item.unit}</div>
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">{item.mcq.biet || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.mcq.hieu || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.mcq.vanDung || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.tf.biet || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.tf.hieu || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.tf.vanDung || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.essay.biet || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.essay.hieu || '-'}</td>
                        <td className="p-2 text-center border-r border-slate-200">{item.essay.vanDung || '-'}</td>
                        <td className="p-2 text-center font-bold text-indigo-700">
                          {item.totalQuestions} câu ({item.totalScore}đ)
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      <td className="p-3 text-left border-r border-slate-200">Tổng cộng (18 câu - 10 điểm)</td>
                      <td className="p-2 border-r border-slate-200" colSpan={3}>8 câu Biết + 4 câu Hiểu (3.0đ)</td>
                      <td className="p-2 border-r border-slate-200" colSpan={3}>2 Biết + 2 Hiểu (4.0đ)</td>
                      <td className="p-2 border-r border-slate-200" colSpan={3}>1 Hiểu + 1 VD (3.0đ)</td>
                      <td className="p-2 text-indigo-700 font-black">18 câu / 10.0đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Đóng ma trận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {editingQuestionId ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới Vào Ngân Hàng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Type, Topic, Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Định dạng câu hỏi
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      setFormType(t);
                      if (t === 'multiple_choice') {
                        setFormPart(1);
                        setFormMaxScore(0.25);
                      } else if (t === 'true_false') {
                        setFormPart(2);
                        setFormMaxScore(1.0);
                      } else {
                        setFormPart(3);
                        setFormMaxScore(2.0);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="multiple_choice">Phần I: Trắc nghiệm 4 lựa chọn</option>
                    <option value="true_false">Phần II: Đúng / Sai (4 ý)</option>
                    <option value="essay">Phần III: Tự luận</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chủ đề kiến thức
                  </label>
                  <select
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value as TopicId)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="topic_1">CĐ 1: Máy tính & cộng đồng</option>
                    <option value="topic_2">CĐ 2: Tổ chức lưu trữ, tìm kiếm</option>
                    <option value="topic_3">CĐ 3: Đạo đức & pháp luật số</option>
                    <option value="topic_4">CĐ 4: Phần mềm mô phỏng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức độ nhận thức
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as CognitiveLevel)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="biet">Nhận biết (Biết)</option>
                    <option value="hieu">Thông hiểu (Hiểu)</option>
                    <option value="van_dung">Vận dụng</option>
                  </select>
                </div>
              </div>

              {/* Question Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung câu hỏi / Tình huống <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Form fields for MCQ */}
              {formType === 'multiple_choice' && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="font-bold text-xs text-slate-700 mb-2">
                    Các phương án lựa chọn:
                  </div>
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const val =
                      optKey === 'A'
                        ? mcqOptA
                        : optKey === 'B'
                        ? mcqOptB
                        : optKey === 'C'
                        ? mcqOptC
                        : mcqOptD;
                    const setter =
                      optKey === 'A'
                        ? setMcqOptA
                        : optKey === 'B'
                        ? setMcqOptB
                        : optKey === 'C'
                        ? setMcqOptC
                        : setMcqOptD;

                    return (
                      <div key={optKey} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md bg-slate-100 font-bold text-xs flex items-center justify-center">
                          {optKey}
                        </span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={`Nội dung phương án ${optKey}...`}
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setMcqCorrect(optKey)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            mcqCorrect === optKey
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {mcqCorrect === optKey ? 'Đáp án đúng ✓' : 'Chọn đúng'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form fields for True/False */}
              {formType === 'true_false' && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="font-bold text-xs text-slate-700 mb-1">
                    4 ý phát biểu (a, b, c, d):
                  </div>
                  {[
                    { id: 'a', val: tfStmtA, set: setTfStmtA, corr: tfStmtACorrect, setCorr: setTfStmtACorrect },
                    { id: 'b', val: tfStmtB, set: setTfStmtB, corr: tfStmtBCorrect, setCorr: setTfStmtBCorrect },
                    { id: 'c', val: tfStmtC, set: setTfStmtC, corr: tfStmtCCorrect, setCorr: setTfStmtCCorrect },
                    { id: 'd', val: tfStmtD, set: setTfStmtD, corr: tfStmtDCorrect, setCorr: setTfStmtDCorrect },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="font-bold uppercase w-5 text-slate-700">{item.id})</span>
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => item.set(e.target.value)}
                        placeholder={`Nội dung ý ${item.id}...`}
                        className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => item.setCorr(!item.corr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          item.corr
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {item.corr ? 'Đúng (Đ)' : 'Sai (S)'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form fields for Essay */}
              {formType === 'essay' && (
                <div className="space-y-3 border-t border-slate-200 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Barem tiêu chí chấm điểm (mỗi dòng một tiêu chí)
                    </label>
                    <textarea
                      rows={3}
                      value={essayRubrics}
                      onChange={(e) => setEssayRubrics(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bài giải mẫu / Hướng dẫn đáp án
                    </label>
                    <textarea
                      rows={3}
                      value={essaySample}
                      onChange={(e) => setEssaySample(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Explanation note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giải thích chi tiết (hiển thị khi thí sinh xem lại kết quả)
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Giải thích tại sao phương án này đúng..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-save-question"
                onClick={handleSaveQuestion}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu câu hỏi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Exam from Word / PDF Modal */}
      <AutoExamFromFileModal
        isOpen={showAutoImportModal}
        onClose={() => setShowAutoImportModal(false)}
        currentExamInfo={examInfo}
        onApplyExam={(newExam, newQuestions, saveOldExam, oldExamNote) => {
          onApplyExamWithArchive(newExam, newQuestions, saveOldExam, oldExamNote);
          setNotification({
            type: 'success',
            message: `Tạo đề thi mới thành công! ${saveOldExam ? 'Đề thi cũ đã được tự động lưu trữ vào kho.' : ''} Đã nạp ${newQuestions.length} câu hỏi vào đề hiện hành.`,
          });
          setBankTab('questions');
        }}
      />

      {/* New Exam Configuration Modal */}
      <NewExamConfigModal
        isOpen={showNewExamConfigModal}
        onClose={() => setShowNewExamConfigModal(false)}
        currentExamInfo={examInfo}
        onOpenAutoImportFile={() => setShowAutoImportModal(true)}
        onSaveExamInfo={(newExam, questionMode, saveOldExam, oldExamNote) => {
          onSaveNewExamWithArchive(newExam, questionMode, saveOldExam, oldExamNote);
          setNotification({
            type: 'success',
            message: `Đã thiết lập đề thi mới "${newExam.title}"! ${saveOldExam ? 'Đề thi trước đó đã được lưu vào kho.' : ''}`,
          });
          setBankTab('questions');
        }}
      />
    </div>
  );
};
