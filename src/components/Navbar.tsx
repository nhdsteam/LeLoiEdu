import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Database,
  ShieldCheck,
  Award,
  Lock,
  LogOut,
  UserCheck,
  Users,
  Cloud,
} from 'lucide-react';
import { TeacherProfile } from './TeacherLoginModal';

interface NavbarProps {
  currentView: 'student_exam' | 'student_result' | 'teacher_dashboard' | 'teacher_submissions' | 'question_bank';
  onNavigate: (view: 'student_exam' | 'student_result' | 'teacher_dashboard' | 'teacher_submissions' | 'question_bank') => void;
  userRole: 'student' | 'teacher';
  onToggleRole: (role: 'student' | 'teacher') => void;
  examTitle: string;
  hasActiveSubmission: boolean;
  isTeacherAuthenticated: boolean;
  teacherProfile: TeacherProfile | null;
  onLogoutTeacher: () => void;
  onOpenAccountManager?: () => void;
  isFirebaseSynced?: boolean;
  firebaseEmail?: string | null;
  onLoginGoogle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userRole,
  onToggleRole,
  examTitle,
  hasActiveSubmission,
  isTeacherAuthenticated,
  teacherProfile,
  onLogoutTeacher,
  onOpenAccountManager,
  isFirebaseSynced = true,
  firebaseEmail,
  onLoginGoogle,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  LeLoiEdu
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  CV 7991/BGDĐT
                </span>
            
              </div>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {examTitle} • Môn Tin Học 9
              </p>
            </div>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {userRole === 'student' ? (
              <>
                

                {hasActiveSubmission && (
                  <button
                    type="button"
                    id="nav-student-result"
                    onClick={() => onNavigate('student_result')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'student_result'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Kết quả & Báo cáo</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="nav-teacher-dashboard"
                  onClick={() => onNavigate('teacher_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'teacher_dashboard'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Thống kê lớp</span>
                  <span className="sm:hidden">Thống kê</span>
                </button>

                <button
                  type="button"
                  id="nav-teacher-submissions"
                  onClick={() => onNavigate('teacher_submissions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'teacher_submissions'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Bài nộp & Chấm tự luận</span>
                  <span className="sm:hidden">Bài nộp</span>
                </button>

                <button
                  type="button"
                  id="nav-teacher-question-bank"
                  onClick={() => onNavigate('question_bank')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'question_bank'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Ngân hàng câu hỏi</span>
                  <span className="sm:hidden">Ngân hàng</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Section: Teacher Profile & Role Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* If authenticated teacher, display active teacher tag and actions */}
            {userRole === 'teacher' && isTeacherAuthenticated && (
              <>
                <div className="hidden lg:flex items-center gap-2 bg-indigo-50/80 border border-indigo-200/80 px-2.5 py-1 rounded-xl text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-indigo-950 truncate max-w-[140px]">
                      {teacherProfile?.name || 'Giảng viên'}
                    </div>
                    <div className="text-[10px] text-indigo-600 truncate max-w-[140px]">
                      {teacherProfile?.roleTitle || 'Tổ Tin học'}
                    </div>
                  </div>
                </div>

                {/* Account Manager Button - Chỉ hiển thị khi đăng nhập tên admin */}
                {teacherProfile?.username?.toLowerCase() === 'admin' && onOpenAccountManager && (
                  <button
                    type="button"
                    id="btn-nav-manage-accounts"
                    onClick={onOpenAccountManager}
                    title="Quản lý tài khoản giảng viên (Dành riêng cho Quản trị viên admin)"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Quản lý tài khoản</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 rounded">
                      Admin
                    </span>
                  </button>
                )}

                {/* Logout button when in teacher mode */}
                <button
                  type="button"
                  id="btn-teacher-logout"
                  onClick={onLogoutTeacher}
                  title="Đăng xuất khỏi cổng Giảng viên và khóa bảo mật"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Khóa / Đăng xuất</span>
                </button>
              </>
            )}

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                id="role-switch-student"
                onClick={() => {
                  onToggleRole('student');
                  if (currentView === 'teacher_dashboard' || currentView === 'teacher_submissions' || currentView === 'question_bank') {
                    onNavigate(hasActiveSubmission ? 'student_result' : 'student_exam');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  userRole === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Học sinh
              </button>
              <button
                type="button"
                id="role-switch-teacher"
                onClick={() => {
                  onToggleRole('teacher');
                }}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  userRole === 'teacher'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {!isTeacherAuthenticated && (
                  <Lock className="w-3 h-3 text-amber-500" />
                )}
                <span>Giảng viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

