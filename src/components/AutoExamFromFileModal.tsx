import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Eye,
  Check,
  BookOpen,
  Clock,
  Layers,
  HelpCircle,
  RotateCcw,
  FolderArchive,
} from 'lucide-react';
import { ExamInfo, Question } from '../types';
import {
  extractTextFromFile,
  parseExamFromText,
  ParsedExamResult,
  SAMPLE_EXAMS_TEXT,
} from '../utils/fileExamParser';

interface AutoExamFromFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExam: (
    newExamInfo: ExamInfo,
    newQuestions: Question[],
    saveOldExam?: boolean,
    oldExamNote?: string
  ) => void;
  currentExamInfo: ExamInfo;
}

export const AutoExamFromFileModal: React.FC<AutoExamFromFileModalProps> = ({
  isOpen,
  onClose,
  onApplyExam,
  currentExamInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedExamResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saveOldExam, setSaveOldExam] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessText = (text: string, fileName?: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = parseExamFromText(text);
      if (result.questions.length === 0) {
        setErrorMsg('Không tìm thấy câu hỏi hợp lệ nào trong tệp. Vui lòng kiểm tra lại định dạng tệp hoặc sử dụng tệp mẫu.');
      } else {
        setParsedResult(result);
        if (fileName) setSelectedFileName(fileName);
        setActiveTab('preview');
      }
    } catch (err: any) {
      setErrorMsg(`Lỗi khi phân tích đề thi: ${err?.message || 'Không xác định'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSelectedFileName(file.name);

    try {
      const extractedText = await extractTextFromFile(file);
      setRawText(extractedText);
      handleProcessText(extractedText, file.name);
    } catch (err: any) {
      setErrorMsg(`Không thể đọc tệp "${file.name}": ${err?.message || 'Định dạng tệp không được hỗ trợ'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSelectedFileName(file.name);

    try {
      const extractedText = await extractTextFromFile(file);
      setRawText(extractedText);
      handleProcessText(extractedText, file.name);
    } catch (err: any) {
      setErrorMsg(`Không thể đọc tệp "${file.name}": ${err?.message || 'Định dạng tệp không được hỗ trợ'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (sampleKey: string) => {
    const sample = SAMPLE_EXAMS_TEXT[sampleKey];
    if (!sample) return;
    setRawText(sample.content);
    setSelectedFileName(`${sample.name}.docx`);
    handleProcessText(sample.content, `${sample.name}.docx`);
  };

  const handleUpdateQuestionAnswer = (qId: string, newAnswer: 'A' | 'B' | 'C' | 'D') => {
    if (!parsedResult) return;
    setParsedResult({
      ...parsedResult,
      questions: parsedResult.questions.map((q) => {
        if (q.id === qId && q.type === 'multiple_choice') {
          return { ...q, correctAnswer: newAnswer };
        }
        return q;
      }),
    });
  };

  const handleToggleStatementCorrect = (qId: string, statementId: 'a' | 'b' | 'c' | 'd') => {
    if (!parsedResult) return;
    setParsedResult({
      ...parsedResult,
      questions: parsedResult.questions.map((q) => {
        if (q.id === qId && q.type === 'true_false') {
          return {
            ...q,
            statements: q.statements.map((st) =>
              st.id === statementId ? { ...st, correctAnswer: !st.correctAnswer } : st
            ),
          };
        }
        return q;
      }),
    });
  };

  const handleConfirmApply = () => {
    if (!parsedResult || parsedResult.questions.length === 0) return;

    const fullExamInfo: ExamInfo = {
      id: parsedResult.examInfo.id || `exam-${Date.now()}`,
      title: parsedResult.examInfo.title || 'ĐỀ KIỂM TRA ĐỊNH KỲ MỚI',
      subject: parsedResult.examInfo.subject || currentExamInfo.subject,
      grade: parsedResult.examInfo.grade || currentExamInfo.grade,
      curriculum: parsedResult.examInfo.curriculum || currentExamInfo.curriculum,
      school: parsedResult.examInfo.school || currentExamInfo.school,
      department: parsedResult.examInfo.department || currentExamInfo.department,
      academicYear: parsedResult.examInfo.academicYear || currentExamInfo.academicYear,
      durationMinutes: parsedResult.examInfo.durationMinutes || currentExamInfo.durationMinutes,
      totalScore: parsedResult.examInfo.totalScore || 10.0,
      documentRef: parsedResult.examInfo.documentRef || 'Căn cứ theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024',
    };

    onApplyExam(
      fullExamInfo,
      parsedResult.questions,
      saveOldExam,
      `Tự động lưu trước khi nhập đề từ tệp ${selectedFileName || 'Word/PDF'}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>Tự Động Tạo Đề Thi Từ File Word / PDF</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-100 border border-indigo-400/30">
                  CV 7991/BGDĐT
                </span>
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Trích xuất câu hỏi trắc nghiệm, đúng/sai và tự luận từ tệp tin Word (.docx) hoặc PDF (.pdf)
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Tải lên tệp & Nhận diện</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (parsedResult) setActiveTab('preview');
            }}
            disabled={!parsedResult}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-700'
                : !parsedResult
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Xem trước & Rà soát đáp án {parsedResult ? `(${parsedResult.stats.totalQuestions} câu)` : ''}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Đã có lỗi xảy ra:</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".docx,.doc,.pdf,.txt"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                  Kéo thả tệp đề thi Word (.docx) hoặc PDF (.pdf) vào đây
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
                  Hệ thống tự động phân tích và trích xuất theo cấu trúc 3 phần chuẩn Công văn 7991/BGDĐT.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Chọn tệp từ máy tính</span>
                </div>

                {selectedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Đã chọn: {selectedFileName}</span>
                  </div>
                )}
              </div>

              {/* Sample Exams Presets for Instant Testing */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Hoặc thử nghiệm ngay với đề thi mẫu chuẩn Bộ GD&ĐT:</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">1 Click để thử</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(SAMPLE_EXAMS_TEXT).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleLoadSample(key)}
                      disabled={isProcessing}
                      className="p-3.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1 block line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                        <span>Nạp và bóc tách đề mẫu</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw Text Manual Input / Paste option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Xem hoặc dán trực tiếp nội dung văn bản đề thi:</span>
                  </label>
                  {rawText && (
                    <button
                      type="button"
                      onClick={() => setRawText('')}
                      className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Xóa trắng
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán nội dung đề thi từ Word/PDF tại đây nếu không tải tệp..."
                  className="w-full p-3.5 text-xs font-mono bg-white border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleProcessText(rawText, 'Van_ban_dan_truc_tiep.docx')}
                    disabled={!rawText.trim() || isProcessing}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Phân tích văn bản</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && parsedResult && (
            <div className="space-y-6">
              {/* Parsed Exam Overview Banner */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      Thông tin đề thi nhận diện được
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {parsedResult.examInfo.title || 'ĐỀ KIỂM TRA MỚI'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-2">
                      <span>Môn: <strong>{parsedResult.examInfo.subject || 'Tin học'}</strong></span>
                      <span>Khối: <strong>{parsedResult.examInfo.grade || 'Lớp 9'}</strong></span>
                      <span>Thời gian: <strong>{parsedResult.examInfo.durationMinutes || 45} phút</strong></span>
                      <span>Trường: <strong>{parsedResult.examInfo.school || 'THCS & THPT'}</strong></span>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-2 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <div className="text-xs text-slate-500 font-medium">Phần I (TN)</div>
                      <div className="text-sm font-black text-indigo-700">
                        {parsedResult.stats.part1Count} câu
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <div className="text-xs text-slate-500 font-medium">Phần II (Đ/S)</div>
                      <div className="text-sm font-black text-indigo-700">
                        {parsedResult.stats.part2Count} câu
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <div className="text-xs text-slate-500 font-medium">Phần III (TL)</div>
                      <div className="text-sm font-black text-indigo-700">
                        {parsedResult.stats.part3Count} câu
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-indigo-600 rounded-xl text-white text-center shadow-xs">
                      <div className="text-xs text-indigo-200 font-medium">Tổng số</div>
                      <div className="text-sm font-black">
                        {parsedResult.stats.totalQuestions} câu
                      </div>
                    </div>
                  </div>
                </div>

                {parsedResult.warnings.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-indigo-100">
                    <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lưu ý rà soát: {parsedResult.warnings.join(' | ')}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Questions Interactive Review List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
                    Danh sách câu hỏi được trích xuất (Có thể sửa trực tiếp đáp án đúng):
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Chọn tệp khác</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {parsedResult.questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-all text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                            {q.part === 1
                              ? `Phần I - Câu ${q.number}`
                              : q.part === 2
                              ? `Phần II - Câu ${q.number}`
                              : `Phần III - Tự luận ${q.number}`}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 text-[11px]">
                            {q.cognitiveLevel === 'biet'
                              ? 'Nhận biết'
                              : q.cognitiveLevel === 'hieu'
                              ? 'Thông hiểu'
                              : 'Vận dụng'}
                          </span>
                          <span className="text-slate-400 font-medium">({q.maxScore} điểm)</span>
                        </div>

                        {q.type === 'multiple_choice' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Đáp án đúng:</span>
                            <div className="flex items-center gap-1">
                              {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                                <button
                                  key={optKey}
                                  type="button"
                                  onClick={() => handleUpdateQuestionAnswer(q.id, optKey)}
                                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                    q.correctAnswer === optKey
                                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {optKey}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Question Content */}
                      <p className="font-semibold text-slate-900 mb-2 leading-relaxed">
                        {q.content}
                      </p>

                      {/* MCQ Options */}
                      {q.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.key}
                              onClick={() => handleUpdateQuestionAnswer(q.id, opt.key)}
                              className={`p-2 rounded-xl border flex items-start gap-2 cursor-pointer transition-colors ${
                                q.correctAnswer === opt.key
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                                  q.correctAnswer === opt.key
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False Statements */}
                      {q.type === 'true_false' && (
                        <div className="space-y-1.5 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {q.statements.map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-slate-700 uppercase">{st.id})</span>
                                <span className="text-slate-800">{st.text}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleStatementCorrect(q.id, st.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                                  st.correctAnswer
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {st.correctAnswer ? 'ĐÚNG' : 'SAI'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Essay Question */}
                      {q.type === 'essay' && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-700">
                          <span className="font-bold text-amber-900 block mb-1">Gợi ý đáp án / Barem chấm:</span>
                          <p className="text-slate-800 italic leading-relaxed">{q.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-3">
            {activeTab === 'preview' && parsedResult ? (
              <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl font-bold">
                <input
                  type="checkbox"
                  checked={saveOldExam}
                  onChange={(e) => setSaveOldExam(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                />
                <FolderArchive className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tự động lưu đề thi cũ vào Kho Quản Lý Đề Thi</span>
              </label>
            ) : parsedResult ? (
              <span>Đã bóc tách thành công {parsedResult.questions.length} câu hỏi theo chuẩn CV 7991.</span>
            ) : (
              <span>Chọn tệp Word (.docx) hoặc PDF (.pdf) để bắt đầu.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            {activeTab === 'upload' && rawText && (
              <button
                type="button"
                onClick={() => handleProcessText(rawText, selectedFileName || 'de_thi.docx')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Xem kết quả bóc tách</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {activeTab === 'preview' && parsedResult && (
              <button
                type="button"
                id="btn-apply-parsed-exam"
                onClick={handleConfirmApply}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Áp Dụng Vào Đề Thi & Ngân Hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
