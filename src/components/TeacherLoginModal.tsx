import React, { useState, useEffect, useId } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  X,
  ShieldCheck,
  AlertCircle,
  School,
  CheckCircle2,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  Key,
  Check,
  ArrowRight,
  ShieldAlert,
  Cloud,
  Database,
  RefreshCw,
} from 'lucide-react';
import { TeacherAccount } from '../types';
import {
  saveTeacherAccountToFirestore,
  deleteTeacherAccountFromFirestore,
  subscribeToTeacherAccounts,
  seedInitialTeacherAccountsIfEmpty,
} from '../firebase';

export interface TeacherProfile {
  username: string;
  name: string;
  roleTitle: string;
  school: string;
}

export type { TeacherAccount };

export const DEFAULT_TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    id: 'gv-1',
    username: 'giaovien',
    password: 'giaovien123',
    name: 'ThS. Lê Hoàng Nam',
    roleTitle: 'Giáo viên bộ môn Tin học 9',
    school: 'Trường THCS Thực Nghiệm',
    createdAt: '01/09/2026',
  },
  {
    id: 'gv-2',
    username: 'admin',
    password: 'admin123',
    name: 'Ban Giám Khảo & Quản Trị Hệ Thống',
    roleTitle: 'Tổ trưởng chuyên môn Tin học',
    school: 'Sở GD&ĐT - Cổng Khảo Thí CV 7991',
    createdAt: '15/08/2026',
  },
  {
    id: 'gv-3',
    username: 'gv.tinhoc',
    password: '123456',
    name: 'Cô Trần Mai Lan',
    roleTitle: 'Giáo viên giảng dạy khối 9',
    school: 'Trường THCS Thực Nghiệm',
    createdAt: '05/09/2026',
  },
];

const STORAGE_KEY = 'edu_teacher_accounts_list_v2';

export const getStoredTeacherAccounts = (): TeacherAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_TEACHER_ACCOUNTS;
};

export const saveTeacherAccounts = (accounts: TeacherAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore error
  }
};

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: TeacherProfile) => void;
  targetViewLabel?: string;
  initialTab?: 'login' | 'manage';
  currentUserProfile?: TeacherProfile | null;
  isTeacherAuthenticated?: boolean;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetViewLabel = 'Khu vực quản lý giảng viên',
  initialTab = 'login',
  currentUserProfile = null,
  isTeacherAuthenticated = false,
}) => {
  const isAdmin = Boolean(
    isTeacherAuthenticated && currentUserProfile?.username?.toLowerCase() === 'admin'
  );

  const [activeTab, setActiveTab] = useState<'login' | 'manage'>(
    isAdmin && initialTab === 'manage' ? 'manage' : 'login'
  );
  const [accounts, setAccounts] = useState<TeacherAccount[]>(getStoredTeacherAccounts);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(true);
  const [isSavingAccount, setIsSavingAccount] = useState<boolean>(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    // Seed initial default accounts if empty on Firebase
    seedInitialTeacherAccountsIfEmpty(DEFAULT_TEACHER_ACCOUNTS)
      .then((seeded) => {
        if (seeded && seeded.length > 0) {
          setAccounts(seeded);
          saveTeacherAccounts(seeded);
          setIsFirebaseSynced(true);
        }
      })
      .catch((err) => {
        console.warn('Initial seed teacher accounts error:', err);
      });

    // Realtime listener for teacher accounts collection
    const unsubscribe = subscribeToTeacherAccounts(
      (remoteAccounts) => {
        if (remoteAccounts && remoteAccounts.length > 0) {
          setAccounts(remoteAccounts);
          saveTeacherAccounts(remoteAccounts);
          setIsFirebaseSynced(true);
        }
      },
      (error) => {
        console.warn('Firebase teacher accounts subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync accounts from storage when opening
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredTeacherAccounts();
      if (stored.length > 0) {
        setAccounts(stored);
      }
      setActiveTab(isAdmin && initialTab === 'manage' ? 'manage' : 'login');
      setErrorMessage('');
      setSuccessFeedback('');
      setIsFormOpen(false);
      setEditingAccountId(null);
      setAccountToDelete(null);
    }
  }, [isOpen, initialTab, isAdmin]);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Account Form Fields
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoleTitle, setFormRoleTitle] = useState('');
  const [formSchool, setFormSchool] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Password visibility map for listed accounts
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Confirmation modal for delete
  const [accountToDelete, setAccountToDelete] = useState<TeacherAccount | null>(null);

  const togglePasswordVisibility = (accId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  if (!isOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên tài khoản hoặc mã cán bộ.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const match = accounts.find(
        (c) =>
          c.username.toLowerCase() === cleanUsername &&
          c.password === cleanPassword
      );

      if (match) {
        setLoginSuccess(true);
        if (rememberMe) {
          try {
            sessionStorage.setItem('edu_teacher_auth', JSON.stringify(match));
          } catch {
            // Ignore storage errors
          }
        }
        setTimeout(() => {
          setIsSubmitting(false);
          setLoginSuccess(false);
          onLoginSuccess({
            username: match.username,
            name: match.name,
            roleTitle: match.roleTitle,
            school: match.school,
          });
        }, 400);
      } else {
        setIsSubmitting(false);
        setErrorMessage(
          'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.'
        );
      }
    }, 350);
  };

  // Open Create Account Form
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditingAccountId(null);
    setFormUsername('');
    setFormPassword('');
    setFormName('');
    setFormRoleTitle('Giáo viên bộ môn Tin học 9');
    setFormSchool('Trường THCS Thực Nghiệm');
    setFormShowPassword(false);
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Edit Account Form
  const handleOpenEditForm = (account: TeacherAccount) => {
    setFormMode('edit');
    setEditingAccountId(account.id);
    setFormUsername(account.username);
    setFormPassword(account.password);
    setFormName(account.name);
    setFormRoleTitle(account.roleTitle);
    setFormSchool(account.school);
    setFormShowPassword(false);
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Account (Create or Update) - Lưu trực tiếp vào Firebase Firestore
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUser = formUsername.trim().toLowerCase();
    const cleanPass = formPassword.trim();
    const cleanName = formName.trim();
    const cleanRole = formRoleTitle.trim();
    const cleanSchool = formSchool.trim();

    if (!cleanUser || cleanUser.length < 3) {
      setFormError('Tên đăng nhập phải có ít nhất 3 ký tự (chữ cái hoặc số).');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setFormError('Mật khẩu phải có tối thiểu 4 ký tự.');
      return;
    }

    if (!cleanName) {
      setFormError('Vui lòng nhập họ và tên cán bộ giáo viên.');
      return;
    }

    // Check duplicate username
    const duplicate = accounts.find(
      (a) =>
        a.username.toLowerCase() === cleanUser &&
        (formMode === 'create' || a.id !== editingAccountId)
    );

    if (duplicate) {
      setFormError(`Tên đăng nhập "${cleanUser}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    setIsSavingAccount(true);
    try {
      let updatedAccounts: TeacherAccount[];
      if (formMode === 'create') {
        const newAcc: TeacherAccount = {
          id: 'gv-' + Date.now(),
          username: cleanUser,
          password: cleanPass,
          name: cleanName,
          roleTitle: cleanRole || 'Giáo viên bộ môn Tin học',
          school: cleanSchool || 'Trường THCS Thực Nghiệm',
          createdAt: new Date().toLocaleDateString('vi-VN'),
          role: cleanUser === 'admin' ? 'admin' : 'teacher',
        };
        await saveTeacherAccountToFirestore(newAcc);
        updatedAccounts = [newAcc, ...accounts];
        setSuccessFeedback(`Đã thêm & lưu vào Firebase tài khoản: ${cleanName}`);
      } else {
        const currentAcc = accounts.find((a) => a.id === editingAccountId);
        const updatedAcc: TeacherAccount = {
          ...(currentAcc || {
            id: editingAccountId || 'gv-' + Date.now(),
            createdAt: new Date().toLocaleDateString('vi-VN'),
          }),
          id: editingAccountId || 'gv-' + Date.now(),
          username: cleanUser,
          password: cleanPass,
          name: cleanName,
          roleTitle: cleanRole || 'Giáo viên bộ môn Tin học',
          school: cleanSchool || 'Trường THCS Thực Nghiệm',
          role: cleanUser === 'admin' ? 'admin' : 'teacher',
        };
        await saveTeacherAccountToFirestore(updatedAcc);
        updatedAccounts = accounts.map((acc) =>
          acc.id === editingAccountId ? updatedAcc : acc
        );
        setSuccessFeedback(`Đã cập nhật trên Firebase tài khoản: ${cleanName}`);
      }

      setAccounts(updatedAccounts);
      saveTeacherAccounts(updatedAccounts);
      setIsFormOpen(false);

      setTimeout(() => {
        setSuccessFeedback('');
      }, 4000);
    } catch (err: any) {
      console.error('Error saving teacher account to Firebase:', err);
      setFormError('Lỗi khi lưu tài khoản lên Firebase: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Delete Account - Xóa trực tiếp khỏi Firebase Firestore
  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    if (accounts.length <= 1) {
      setFormError('Hệ thống cần giữ lại ít nhất 1 tài khoản giảng viên để đăng nhập.');
      setAccountToDelete(null);
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteTeacherAccountFromFirestore(accountToDelete.id);
      const updated = accounts.filter((a) => a.id !== accountToDelete.id);
      setAccounts(updated);
      saveTeacherAccounts(updated);
      setSuccessFeedback(`Đã xóa tài khoản "${accountToDelete.username}" khỏi Firebase thành công.`);
      setAccountToDelete(null);

      setTimeout(() => {
        setSuccessFeedback('');
      }, 3500);
    } catch (err: any) {
      console.error('Error deleting teacher account from Firebase:', err);
      setFormError('Lỗi khi xóa tài khoản khỏi Firebase: ' + (err.message || 'Thất bại'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Reset to default accounts - Khôi phục và đồng bộ lên Firebase Firestore
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn khôi phục danh sách tài khoản giảng viên về cấu hình mặc định và đồng bộ lên Firebase không?'
      )
    ) {
      try {
        for (const acc of DEFAULT_TEACHER_ACCOUNTS) {
          await saveTeacherAccountToFirestore(acc);
        }
        setAccounts(DEFAULT_TEACHER_ACCOUNTS);
        saveTeacherAccounts(DEFAULT_TEACHER_ACCOUNTS);
        setSuccessFeedback('Đã khôi phục và lưu lên Firebase 3 tài khoản mặc định.');
        setTimeout(() => setSuccessFeedback(''), 3000);
      } catch (err: any) {
        setFormError('Lỗi khi khôi phục tài khoản lên Firebase: ' + (err.message || ''));
      }
    }
  };

  // Filtered accounts for management
  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header with Security Badge */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-5 sm:p-6 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {isAdmin && activeTab === 'manage' ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 backdrop-blur flex items-center justify-center shadow-inner shrink-0">
                  <Users className="w-6 h-6 text-amber-300" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/30 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Quyền Quản Trị Hệ Thống (admin)
                    </span>
                    <span className="text-xs text-indigo-300">• Tin học 9</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Quản Lý Danh Sách Tài Khoản Giảng Viên
                  </h2>
                </div>
              </div>

              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Cán bộ quản trị: <strong>{currentUserProfile?.name || 'Ban Giám Khảo & Quản Trị Hệ Thống'}</strong> • Đơn vị: <strong>{currentUserProfile?.school || 'Sở GD&ĐT'}</strong>
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shadow-inner shrink-0">
                  <Lock className="w-6 h-6 text-indigo-200" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Bảo Mật Cấp Giảng Viên
                    </span>
                    <span className="text-xs text-indigo-300">• Tin học 9</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Cổng Xác Thực Giảng Viên
                  </h2>
                </div>
              </div>

              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Yêu cầu xác thực tài khoản để truy cập: <strong>{targetViewLabel}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Feedback Alert if any */}
        {successFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successFeedback}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-5 max-w-md mx-auto">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="teacher-username-input"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Tên đăng nhập / Mã cán bộ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="teacher-username-input"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="giaovien hoặc admin"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="teacher-password-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Mật khẩu
                    </label>
                    <span className="text-[11px] text-slate-400">Tối thiểu 4 ký tự</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="teacher-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 font-medium select-none">
                      Ghi nhớ phiên làm việc trên trình duyệt này
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    id="btn-cancel-teacher-login"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    id="btn-submit-teacher-login"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {loginSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Đã xác thực...</span>
                      </>
                    ) : isSubmitting ? (
                      <span>Đang kiểm tra...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Đăng nhập</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Notice */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chỉ dành cho cán bộ khảo thí & giáo viên bộ môn Tin học</span>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ACCOUNTS (ADD / EDIT / DELETE) */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Firebase Cloud Sync Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-gradient-to-r from-indigo-50 via-blue-50 to-emerald-50/70 border border-indigo-200/80 rounded-2xl text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 text-indigo-950 font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">Lưu trữ & Đồng bộ Firebase Firestore</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Trực tuyến
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Tất cả tài khoản quản trị và giảng viên được lưu trực tiếp vào collection <code className="text-indigo-700 font-mono font-semibold bg-indigo-100/60 px-1 py-0.2 rounded">/teacher_accounts</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] text-indigo-800 font-medium bg-white/80 border border-indigo-200/60 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Realtime Sync: Bật</span>
                </div>
              </div>

              {/* Header actions of manage tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Danh Sách Tài Khoản Giảng Viên ({accounts.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thêm, cập nhật mật khẩu, quyền hạn và xóa tài khoản truy cập
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    title="Khôi phục 3 tài khoản mặc định ban đầu"
                    className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Khôi phục mặc định</span>
                  </button>

                  <button
                    type="button"
                    id="btn-open-create-teacher-account"
                    onClick={handleOpenCreateForm}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Thêm tài khoản mới</span>
                  </button>
                </div>
              </div>

              {/* Inline Form for Add / Edit Account */}
              {isFormOpen && (
                <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2.5">
                    <div className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                      {formMode === 'create' ? (
                        <>
                          <UserPlus className="w-4 h-4 text-indigo-600" />
                          <span>Thêm Tài Khoản Giảng Viên Mới</span>
                        </>
                      ) : (
                        <>
                          <Pencil className="w-4 h-4 text-indigo-600" />
                          <span>Chỉnh Sửa Tài Khoản: {formUsername}</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAccount} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Username */}
                      <div className="space-y-1">
                        <label
                          htmlFor="input-form-teacher-username"
                          className="block text-[11px] font-bold text-slate-700 uppercase"
                        >
                          Tên đăng nhập *
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                          <input
                            id="input-form-teacher-username"
                            type="text"
                            value={formUsername}
                            onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                            placeholder="vd: gv.nguyenvana"
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label
                          htmlFor="input-form-teacher-password"
                          className="block text-[11px] font-bold text-slate-700 uppercase"
                        >
                          Mật khẩu *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                          <input
                            id="input-form-teacher-password"
                            type={formShowPassword ? 'text' : 'password'}
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Tối thiểu 4 ký tự"
                            className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setFormShowPassword(!formShowPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {formShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <label
                          htmlFor="input-form-teacher-fullname"
                          className="block text-[11px] font-bold text-slate-700 uppercase"
                        >
                          Họ và tên cán bộ *
                        </label>
                        <input
                          id="input-form-teacher-fullname"
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="vd: ThS. Nguyễn Văn A"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      {/* Role title */}
                      <div className="space-y-1">
                        <label
                          htmlFor="input-form-teacher-role"
                          className="block text-[11px] font-bold text-slate-700 uppercase"
                        >
                          Chức danh / Vị trí
                        </label>
                        <input
                          id="input-form-teacher-role"
                          type="text"
                          value={formRoleTitle}
                          onChange={(e) => setFormRoleTitle(e.target.value)}
                          placeholder="vd: Giáo viên bộ môn Tin học 9"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* School / Organization */}
                    <div className="space-y-1">
                      <label
                        htmlFor="input-form-teacher-school"
                        className="block text-[11px] font-bold text-slate-700 uppercase"
                      >
                        Đơn vị công tác / Trường
                      </label>
                      <input
                        id="input-form-teacher-school"
                        type="text"
                        value={formSchool}
                        onChange={(e) => setFormSchool(e.target.value)}
                        placeholder="vd: Trường THCS Thực Nghiệm"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        id="btn-save-teacher-account"
                        disabled={isSavingAccount}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSavingAccount ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang lưu lên Firebase...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{formMode === 'create' ? 'Lưu vào Firebase' : 'Cập nhật Firebase'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên cán bộ, tên tài khoản hoặc trường..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Accounts List */}
              <div className="space-y-2.5">
                {filteredAccounts.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">
                      Không tìm thấy tài khoản nào khớp với từ khóa tìm kiếm.
                    </p>
                  </div>
                ) : (
                  filteredAccounts.map((acc, index) => {
                    const isPassRevealed = !!revealedPasswords[acc.id];
                    return (
                      <div
                        key={acc.id}
                        className="p-3.5 bg-slate-50/90 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
                            {acc.name
                              ? acc.name
                                  .split(' ')
                                  .slice(-1)[0]
                                  ?.charAt(0) || 'G'
                              : 'G'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {acc.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                @{acc.username}
                              </span>
                              {acc.username.toLowerCase() === 'admin' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                  Quản Trị Viên (Admin)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Giảng Viên
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <Cloud className="w-3 h-3 text-blue-500" />
                                <span>Firebase DB</span>
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span>{acc.roleTitle}</span>
                              <span>•</span>
                              <span className="text-slate-500">{acc.school}</span>
                            </div>

                            {/* Password display info */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pt-0.5">
                              <Key className="w-3 h-3 text-slate-400" />
                              <span>Mật khẩu:</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {isPassRevealed ? acc.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                title={isPassRevealed ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                                className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                              >
                                {isPassRevealed ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(acc)}
                            title="Sửa thông tin tài khoản"
                            className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Sửa</span>
                          </button>

                          {/* Delete button (protected for admin) */}
                          <button
                            type="button"
                            onClick={() => setAccountToDelete(acc)}
                            disabled={acc.username.toLowerCase() === 'admin'}
                            title={
                              acc.username.toLowerCase() === 'admin'
                                ? 'Tài khoản admin hệ thống không thể xóa'
                                : 'Xóa tài khoản này'
                            }
                            className={`p-1.5 rounded-xl border transition-colors ${
                              acc.username.toLowerCase() === 'admin'
                                ? 'text-slate-300 border-transparent cursor-not-allowed opacity-40'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom bar with count and Close button */}
              <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Tổng cộng: <strong>{filteredAccounts.length}</strong> / <strong>{accounts.length}</strong> tài khoản giảng viên
                </span>
                <button
                  type="button"
                  id="btn-close-teacher-account-manager"
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Đóng / Hoàn tất
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {accountToDelete && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-slate-900 text-sm">
                  Xác nhận xóa tài khoản giảng viên?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bạn sắp xóa tài khoản <strong>{accountToDelete.username}</strong> ({accountToDelete.name}). Tài khoản này sẽ không thể đăng nhập vào hệ thống khảo thí nữa.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isDeletingAccount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xóa khỏi Firebase</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
