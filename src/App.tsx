import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentExamRoom } from './components/StudentExamRoom';
import { StudentExamResult } from './components/StudentExamResult';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherSubmissionsList } from './components/TeacherSubmissionsList';
import { QuestionBankManager } from './components/QuestionBankManager';
import { TeacherLoginModal, TeacherProfile } from './components/TeacherLoginModal';
import {
  AntiCheatLog,
  ExamInfo,
  ExamSubmission,
  Question,
  SavedExam,
  StudentAnswer,
  UserRole,
} from './types';
import {
  DEFAULT_EXAM_INFO,
  INITIAL_QUESTIONS,
  INITIAL_SUBMISSIONS,
} from './data/examData';
import { gradeExam } from './utils/scoring';
import {
  archiveExamToRepo,
  getSavedExamsFromStorage,
  persistSavedExamsToStorage,
  DEFAULT_PRESET_SAVED_EXAMS,
} from './utils/examRepository';
import {
  auth,
  loginWithGoogle,
  saveExamToFirestore,
  deleteExamFromFirestore,
  subscribeToExams,
  saveSubmissionToFirestore,
  deleteSubmissionFromFirestore,
  subscribeToSubmissions,
} from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { ShieldAlert, LogIn, Cloud } from 'lucide-react';

export type AppView =
  | 'student_exam'
  | 'student_result'
  | 'teacher_dashboard'
  | 'teacher_submissions'
  | 'question_bank';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeView, setActiveView] = useState<AppView>('student_exam');

  // Teacher Authentication state
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalTab, setLoginModalTab] = useState<'login' | 'manage'>('login');
  const [pendingTargetView, setPendingTargetView] = useState<AppView>('teacher_dashboard');
  const [pendingTargetLabel, setPendingTargetLabel] = useState<string>('Khu vực quản lý giảng viên');

  // Restore remembered teacher session on mount
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem('edu_teacher_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.username && parsed?.name) {
          setIsTeacherAuthenticated(true);
          setTeacherProfile({
            username: parsed.username,
            name: parsed.name,
            roleTitle: parsed.roleTitle || 'Giáo viên bộ môn Tin học 9',
            school: parsed.school || 'Trường THCS Thực Nghiệm',
          });
        }
      }
    } catch {
      // Ignore session restore error
    }
  }, []);

  // Exam state
  const [examInfo, setExamInfo] = useState<ExamInfo>(() => {
    try {
      const saved = localStorage.getItem('edu_active_exam_info');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore local storage read errors
    }
    return DEFAULT_EXAM_INFO;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('edu_exam_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore local storage read errors
    }
    return INITIAL_QUESTIONS;
  });

  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('edu_exam_submissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore local storage read errors
    }
    return INITIAL_SUBMISSIONS;
  });

  // Sync examInfo to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edu_active_exam_info', JSON.stringify(examInfo));
    } catch {
      // Ignore local storage write errors
    }
  }, [examInfo]);

  // Sync questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edu_exam_questions', JSON.stringify(questions));
    } catch {
      // Ignore local storage write errors
    }
  }, [questions]);

  // Sync submissions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edu_exam_submissions', JSON.stringify(submissions));
    } catch {
      // Ignore local storage write errors
    }
  }, [submissions]);

  // Saved exams repository state
  const [savedExams, setSavedExams] = useState<SavedExam[]>(() => {
    return getSavedExamsFromStorage();
  });

  // Sync savedExams to localStorage
  useEffect(() => {
    persistSavedExamsToStorage(savedExams);
  }, [savedExams]);

  // Firebase Auth and Real-time Sync states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        if (!isTeacherAuthenticated) {
          setIsTeacherAuthenticated(true);
          setTeacherProfile({
            username: user.email === 'nhd.steam@gmail.com' ? 'admin' : (user.email?.split('@')[0] || 'gv'),
            name: user.displayName || user.email || 'Giáo viên Google',
            roleTitle: user.email === 'nhd.steam@gmail.com' ? 'Quản trị viên Hệ thống' : 'Giáo viên bộ môn Tin học 9',
            school: 'Trường THCS Thực Nghiệm',
          });
        }
      }
    });
    return () => unsubscribeAuth();
  }, [isTeacherAuthenticated]);

  // Real-time Firebase Sync for Submissions & Exams
  useEffect(() => {
    const unsubSubs = subscribeToSubmissions((remoteSubs) => {
      if (remoteSubs && remoteSubs.length > 0) {
        setSubmissions(remoteSubs);
        setIsFirebaseSynced(true);
      } else {
        // Seed initial submissions to Firebase Firestore if empty
        INITIAL_SUBMISSIONS.forEach((sub) => {
          saveSubmissionToFirestore(sub).catch(() => {});
        });
      }
    });

    const unsubExams = subscribeToExams((remoteExams) => {
      if (remoteExams && remoteExams.length > 0) {
        setSavedExams(remoteExams);
        const current = remoteExams.find((e) => e.isCurrent);
        if (current) {
          setExamInfo(current.examInfo);
          setQuestions(current.questions);
        }
        setIsFirebaseSynced(true);
      } else {
        // Seed initial exams to Firebase Firestore if empty
        DEFAULT_PRESET_SAVED_EXAMS.forEach((exam) => {
          saveExamToFirestore(exam).catch(() => {});
        });
      }
    });

    return () => {
      unsubSubs();
      unsubExams();
    };
  }, []);

  // Active student submission for review
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null);

  // Teacher Access Request with security gate
  const requestTeacherAccess = (targetView: AppView = 'teacher_dashboard', label: string = 'Khu vực quản trị giảng viên') => {
    if (isTeacherAuthenticated) {
      setCurrentRole('teacher');
      setActiveView(targetView);
    } else {
      setPendingTargetView(targetView);
      setPendingTargetLabel(label);
      setLoginModalTab('login');
      setIsLoginModalOpen(true);
    }
  };

  const handleOpenAccountManager = () => {
    // Chỉ cho phép admin mở giao diện quản lý tài khoản
    if (!isTeacherAuthenticated || teacherProfile?.username?.toLowerCase() !== 'admin') {
      return;
    }
    setLoginModalTab('manage');
    setPendingTargetView('teacher_dashboard');
    setPendingTargetLabel('Quản lý danh sách tài khoản giảng viên');
    setIsLoginModalOpen(true);
  };

  const handleTeacherLoginSuccess = (profile: TeacherProfile) => {
    setIsTeacherAuthenticated(true);
    setTeacherProfile(profile);
    setCurrentRole('teacher');
    setActiveView(pendingTargetView);
    setIsLoginModalOpen(false);
  };

  const handleLogoutTeacher = () => {
    setIsTeacherAuthenticated(false);
    setTeacherProfile(null);
    try {
      sessionStorage.removeItem('edu_teacher_auth');
    } catch {
      // Ignore storage error
    }
    setCurrentRole('student');
    if (currentSubmission) {
      setActiveView('student_result');
    } else {
      setActiveView('student_exam');
    }
  };

  // Student completes exam
  const handleStudentSubmitExam = (
    studentData: { name: string; studentClass: string; studentId: string },
    answers: Record<string, StudentAnswer>,
    antiCheatLogs: AntiCheatLog[],
    timeSpentSeconds: number
  ) => {
    const { scorePart1, scorePart2, scorePart3, totalScore } = gradeExam(questions, answers);

    const now = new Date();
    const startedAt = new Date(now.getTime() - timeSpentSeconds * 1000).toISOString();

    const newSub: ExamSubmission = {
      id: `sub-curr-${Date.now()}`,
      examId: examInfo.id,
      studentId: studentData.studentId || 'HS2025-099',
      studentName: studentData.name || 'Nguyễn Hoàng Nam',
      studentClass: studentData.studentClass || '9A',
      startedAt,
      submittedAt: now.toISOString(),
      durationSeconds: timeSpentSeconds,
      answers,
      scorePart1,
      scorePart2,
      scorePart3,
      totalScore,
      violationCount: antiCheatLogs.length,
      antiCheatLogs,
      status: 'submitted',
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setCurrentSubmission(newSub);
    setActiveView('student_result');

    // Save student submission to Firebase Firestore
    saveSubmissionToFirestore(newSub).catch((err) =>
      console.warn('Lỗi lưu kết quả bài thi lên Firebase:', err)
    );
  };

  // Switch role helper
  const handleRoleChange = (role: UserRole) => {
    if (role === 'student') {
      setCurrentRole('student');
      if (currentSubmission) {
        setActiveView('student_result');
      } else {
        setActiveView('student_exam');
      }
    } else {
      // Switching to teacher requires authentication
      requestTeacherAccess('teacher_dashboard', 'Khu vực quản lý giảng viên');
    }
  };

  // Direct navigation handler
  const handleNavigateView = (view: AppView) => {
    const isTeacherView =
      view === 'teacher_dashboard' ||
      view === 'teacher_submissions' ||
      view === 'question_bank';

    if (isTeacherView && !isTeacherAuthenticated) {
      requestTeacherAccess(view, 'Khu vực quản lý giảng viên');
    } else {
      setActiveView(view);
    }
  };

  // Retake exam
  const handleRetakeExam = () => {
    setCurrentSubmission(null);
    setActiveView('student_exam');
  };

  // Submissions handlers (Add, Update, Delete, Reset) with Firebase Sync
  const handleAddSubmission = (newSub: ExamSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
    saveSubmissionToFirestore(newSub).catch((err) =>
      console.warn('Lỗi lưu bài nộp mới lên Firebase:', err)
    );
  };

  const handleUpdateSubmission = (updated: ExamSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    if (currentSubmission && currentSubmission.id === updated.id) {
      setCurrentSubmission(updated);
    }
    saveSubmissionToFirestore(updated).catch((err) =>
      console.warn('Lỗi cập nhật bài nộp lên Firebase:', err)
    );
  };

  const handleDeleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    if (currentSubmission && currentSubmission.id === submissionId) {
      setCurrentSubmission(null);
    }
    deleteSubmissionFromFirestore(submissionId).catch((err) =>
      console.warn('Lỗi xóa bài nộp trên Firebase:', err)
    );
  };

  const handleResetSubmissions = () => {
    setSubmissions(INITIAL_SUBMISSIONS);
    INITIAL_SUBMISSIONS.forEach((sub) => {
      saveSubmissionToFirestore(sub).catch(() => {});
    });
    if (currentSubmission) {
      const found = INITIAL_SUBMISSIONS.find((s) => s.id === currentSubmission.id);
      setCurrentSubmission(found || null);
    }
  };

  // Exam & Question bank handlers
  const handleUpdateExamInfo = (newExamInfo: ExamInfo) => {
    setExamInfo(newExamInfo);
  };

  const handleImportExam = (newExamInfo: ExamInfo, newQuestions: Question[]) => {
    setExamInfo(newExamInfo);
    setQuestions(newQuestions);
  };

  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQ.id ? updatedQ : q))
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleResetQuestions = () => {
    setExamInfo(DEFAULT_EXAM_INFO);
    setQuestions(INITIAL_QUESTIONS);
  };

  // Exam Repository Handlers with Firebase Sync
  const handleSaveCurrentExamToRepo = (note?: string) => {
    const { updatedExams, savedExam } = archiveExamToRepo(
      savedExams,
      examInfo,
      questions,
      note || 'Lưu từ đề hiện hành'
    );
    setSavedExams(updatedExams);
    saveExamToFirestore(savedExam).catch((err) =>
      console.warn('Lỗi lưu đề thi lên Firebase:', err)
    );
  };

  const handleSwitchActiveExam = (selectedExam: SavedExam) => {
    setExamInfo(selectedExam.examInfo);
    setQuestions(selectedExam.questions);

    const updated = savedExams.map((e) => ({
      ...e,
      isCurrent: e.id === selectedExam.id,
    }));
    setSavedExams(updated);
    updated.forEach((e) => {
      saveExamToFirestore(e).catch(() => {});
    });
  };

  const handleDeleteSavedExam = (id: string) => {
    setSavedExams((prev) => prev.filter((e) => e.id !== id));
    deleteExamFromFirestore(id).catch((err) =>
      console.warn('Lỗi xóa đề thi trên Firebase:', err)
    );
  };

  const handleDuplicateExam = (id: string) => {
    const target = savedExams.find((e) => e.id === id);
    if (!target) return;
    const newId = `exam_${Date.now()}`;
    const clone: SavedExam = {
      ...target,
      id: newId,
      examInfo: {
        ...target.examInfo,
        id: newId,
        title: `${target.examInfo.title} (Bản sao)`,
      },
      questions: target.questions.map((q, idx) => ({
        ...q,
        id: `q_clone_${Date.now()}_${idx + 1}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrent: false,
      note: `Bản sao nhân bản từ "${target.examInfo.title}"`,
      tags: [...(target.tags || []), 'Bản sao'],
    };
    setSavedExams((prev) => [clone, ...prev]);
    saveExamToFirestore(clone).catch((err) =>
      console.warn('Lỗi lưu bản sao đề thi lên Firebase:', err)
    );
  };

  const handleUpdateSavedExamMeta = (
    id: string,
    updatedInfo: Partial<ExamInfo>,
    note?: string
  ) => {
    setSavedExams((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const newExamInfo = { ...e.examInfo, ...updatedInfo };
          if (e.id === examInfo.id) {
            setExamInfo(newExamInfo);
          }
          const updatedExam: SavedExam = {
            ...e,
            examInfo: newExamInfo,
            note: note !== undefined ? note : e.note,
            updatedAt: new Date().toISOString(),
          };
          saveExamToFirestore(updatedExam).catch(() => {});
          return updatedExam;
        }
        return e;
      })
    );
  };

  const handleImportExamJson = (importedExam: SavedExam) => {
    setSavedExams((prev) => [importedExam, ...prev]);
    saveExamToFirestore(importedExam).catch(() => {});
  };

  const handleSaveNewExamWithArchive = (
    newExamInfo: ExamInfo,
    resetQuestionsMode: 'keep' | 'reset_default' | 'clear' = 'keep',
    saveOldExam: boolean = true,
    oldExamNote?: string
  ) => {
    let currentExamsList = savedExams;
    if (saveOldExam) {
      const { updatedExams, savedExam } = archiveExamToRepo(
        savedExams,
        examInfo,
        questions,
        oldExamNote || `Lưu trữ trước khi tạo đề mới "${newExamInfo.title}"`
      );
      currentExamsList = updatedExams;
      saveExamToFirestore(savedExam).catch(() => {});
    }

    let nextQuestions = questions;
    if (resetQuestionsMode === 'reset_default') {
      nextQuestions = INITIAL_QUESTIONS;
    } else if (resetQuestionsMode === 'clear') {
      nextQuestions = [];
    }

    setExamInfo(newExamInfo);
    setQuestions(nextQuestions);

    const now = new Date().toISOString();
    const newSavedExam: SavedExam = {
      id: newExamInfo.id,
      examInfo: newExamInfo,
      questions: nextQuestions,
      createdAt: now,
      updatedAt: now,
      isCurrent: true,
      note: 'Đề thi mới được tạo',
      tags: ['Đề mới'],
    };

    const finalExams = [
      newSavedExam,
      ...currentExamsList.map((e) => ({ ...e, isCurrent: false })),
    ];
    setSavedExams(finalExams);
    saveExamToFirestore(newSavedExam).catch(() => {});
  };

  const handleApplyExamWithArchive = (
    newExamInfo: ExamInfo,
    newQuestions: Question[],
    saveOldExam: boolean = true,
    oldExamNote?: string
  ) => {
    let currentExamsList = savedExams;
    if (saveOldExam) {
      const { updatedExams, savedExam } = archiveExamToRepo(
        savedExams,
        examInfo,
        questions,
        oldExamNote || 'Tự động lưu trước khi nạp đề thi từ tệp file'
      );
      currentExamsList = updatedExams;
      saveExamToFirestore(savedExam).catch(() => {});
    }

    setExamInfo(newExamInfo);
    setQuestions(newQuestions);

    const now = new Date().toISOString();
    const newSavedExam: SavedExam = {
      id: newExamInfo.id,
      examInfo: newExamInfo,
      questions: newQuestions,
      createdAt: now,
      updatedAt: now,
      isCurrent: true,
      note: 'Tạo từ tệp Word / PDF',
      tags: ['Word/PDF'],
    };

    const finalExams = [
      newSavedExam,
      ...currentExamsList.map((e) => ({ ...e, isCurrent: false })),
    ];
    setSavedExams(finalExams);
    saveExamToFirestore(newSavedExam).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Navbar
        currentView={activeView}
        onNavigate={handleNavigateView}
        userRole={currentRole}
        onToggleRole={handleRoleChange}
        examTitle={examInfo.title}
        hasActiveSubmission={Boolean(currentSubmission)}
        isTeacherAuthenticated={isTeacherAuthenticated}
        teacherProfile={teacherProfile}
        onLogoutTeacher={handleLogoutTeacher}
        onOpenAccountManager={handleOpenAccountManager}
        isFirebaseSynced={isFirebaseSynced}
        firebaseEmail={firebaseUser?.email}
        onLoginGoogle={async () => {
          try {
            await loginWithGoogle();
          } catch (e) {
            console.warn('Google login popup cancelled or error:', e);
          }
        }}
      />

      <main className="flex-1 pb-16">
        {/* Security Guard Check for Teacher Views */}
        {!isTeacherAuthenticated &&
          (activeView === 'teacher_dashboard' ||
            activeView === 'teacher_submissions' ||
            activeView === 'question_bank') && (
            <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Yêu cầu quyền truy cập Giảng viên
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Khu vực này chứa ngân hàng câu hỏi, bài thi học sinh và dữ liệu thống kê. Bạn cần xác thực tài khoản và mật khẩu để tiếp tục.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveView(currentSubmission ? 'student_result' : 'student_exam')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Quay lại phòng thi
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
              </div>
            </div>
          )}

        {activeView === 'student_exam' && (
          <StudentExamRoom
            examInfo={examInfo}
            questions={questions}
            onSubmitExam={handleStudentSubmitExam}
          />
        )}

        {activeView === 'student_result' && (
          <StudentExamResult
            examInfo={examInfo}
            submission={
              currentSubmission ||
              submissions[0] || {
                id: 'dummy',
                examId: examInfo.id,
                studentId: 'HS2025-001',
                studentName: 'Trần Minh Tuấn',
                studentClass: '9A',
                startedAt: new Date(Date.now() - 2150 * 1000).toISOString(),
                submittedAt: new Date().toISOString(),
                durationSeconds: 2150,
                answers: {},
                scorePart1: 2.75,
                scorePart2: 3.25,
                scorePart3: 2.5,
                totalScore: 8.5,
                violationCount: 0,
                antiCheatLogs: [],
                status: 'graded',
              }
            }
            questions={questions}
            onRetakeExam={handleRetakeExam}
            onViewTeacherDashboard={() => {
              requestTeacherAccess('teacher_dashboard', 'Bảng thống kê xếp hạng lớp');
            }}
          />
        )}

        {isTeacherAuthenticated && activeView === 'teacher_dashboard' && (
          <TeacherDashboard
            examInfo={examInfo}
            questions={questions}
            submissions={submissions}
            onNavigateToSubmissions={() => setActiveView('teacher_submissions')}
            onNavigateToQuestionBank={() => setActiveView('question_bank')}
            isAdmin={teacherProfile?.username?.toLowerCase() === 'admin'}
            onOpenAccountManager={handleOpenAccountManager}
          />
        )}

        {isTeacherAuthenticated && activeView === 'teacher_submissions' && (
          <TeacherSubmissionsList
            submissions={submissions}
            questions={questions}
            examInfo={examInfo}
            onAddSubmission={handleAddSubmission}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onResetSubmissions={handleResetSubmissions}
            onViewStudentDetail={(sub) => {
              setCurrentSubmission(sub);
              setActiveView('student_result');
            }}
          />
        )}

        {isTeacherAuthenticated && activeView === 'question_bank' && (
          <QuestionBankManager
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onResetQuestions={handleResetQuestions}
            examInfo={examInfo}
            onUpdateExamInfo={handleUpdateExamInfo}
            onImportExam={handleImportExam}
            savedExams={savedExams}
            onSwitchActiveExam={handleSwitchActiveExam}
            onSaveCurrentExamToRepo={handleSaveCurrentExamToRepo}
            onDeleteSavedExam={handleDeleteSavedExam}
            onDuplicateExam={handleDuplicateExam}
            onUpdateSavedExamMeta={handleUpdateSavedExamMeta}
            onImportExamJson={handleImportExamJson}
            onSaveNewExamWithArchive={handleSaveNewExamWithArchive}
            onApplyExamWithArchive={handleApplyExamWithArchive}
          />
        )}
      </main>

      {/* Teacher Authentication Modal */}
      <TeacherLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleTeacherLoginSuccess}
        targetViewLabel={pendingTargetLabel}
        initialTab={loginModalTab}
        currentUserProfile={teacherProfile}
        isTeacherAuthenticated={isTeacherAuthenticated}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          Hệ Thống Khảo Thí & Đánh Giá Năng Lực Trực Tuyến — Chuẩn cấu trúc đề thi Bộ GD&ĐT (CV 7991/BGDĐT-GDTrH)
        </p>
      </footer>
    </div>
  );
}
