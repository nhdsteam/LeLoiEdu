import { ExamInfo, Question, SavedExam } from '../types';
import { DEFAULT_EXAM_INFO, INITIAL_QUESTIONS } from '../data/examData';

export const EXAM_REPO_STORAGE_KEY = 'edu_saved_exams_repository';

// Pre-packaged archive exams for realistic experience
export const DEFAULT_PRESET_SAVED_EXAMS: SavedExam[] = [
  {
    id: DEFAULT_EXAM_INFO.id,
    examInfo: { ...DEFAULT_EXAM_INFO },
    questions: [...INITIAL_QUESTIONS],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-15T14:30:00.000Z',
    isCurrent: true,
    note: 'Đề kiểm tra Giữa kì 1 chính thức - Chuẩn ma trận CV 7991/BGDĐT',
    tags: ['Giữa kì 1', 'Chính thức', 'CV 7991'],
  },
  {
    id: 'tin-hoc-9-hk1-du-phong-2026',
    examInfo: {
      id: 'tin-hoc-9-hk1-du-phong-2026',
      title: 'ĐỀ KIỂM TRA ĐỊNH KÌ CUỐI HỌC KÌ I (DỰ PHÒNG)',
      subject: 'TIN HỌC',
      grade: 'Lớp 9',
      curriculum: 'Kết nối tri thức với cuộc sống',
      school: 'TRƯỜNG THCS & THPT LÊ LỢI',
      department: 'TỔ TIN HỌC - CÔNG NGHỆ',
      academicYear: 'Năm học: 2026 - 2027',
      durationMinutes: 45,
      totalScore: 10.0,
      documentRef: 'Căn cứ theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024',
    },
    questions: INITIAL_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `q_hk1_backup_${idx + 1}`,
      content: idx === 0 
        ? 'Dịch vụ nào sau đây trên Internet cho phép người dùng lưu trữ, chia sẻ và đồng bộ dữ liệu đám mây phổ biến nhất?'
        : q.content,
    })),
    createdAt: '2026-08-20T09:15:00.000Z',
    updatedAt: '2026-08-25T11:00:00.000Z',
    isCurrent: false,
    note: 'Đề thi dự phòng Cuối học kì 1 - Đã duyệt chuyên môn',
    tags: ['Cuối kì 1', 'Dự phòng'],
  },
  {
    id: 'tin-hoc-9-khao-sat-dau-nam-2026',
    examInfo: {
      id: 'tin-hoc-9-khao-sat-dau-nam-2026',
      title: 'ĐỀ KHẢO SÁT CHẤT LƯỢNG ĐẦU NĂM HỌC',
      subject: 'TIN HỌC',
      grade: 'Lớp 9',
      curriculum: 'Kết nối tri thức với cuộc sống',
      school: 'TRƯỜNG THCS & THPT LÊ LỢI',
      department: 'TỔ TIN HỌC - CÔNG NGHỆ',
      academicYear: 'Năm học: 2026 - 2027',
      durationMinutes: 45,
      totalScore: 10.0,
      documentRef: 'Theo kế hoạch năm học và chuẩn kiến thức kĩ năng',
    },
    questions: INITIAL_QUESTIONS.slice(0, 14),
    createdAt: '2026-08-10T07:30:00.000Z',
    updatedAt: '2026-08-12T16:45:00.000Z',
    isCurrent: false,
    note: 'Đề khảo sát năng lực đầu cấp lớp 9 - 14 câu hỏi trọng tâm',
    tags: ['Khảo sát', 'Đầu năm'],
  },
];

export function getSavedExamsFromStorage(): SavedExam[] {
  try {
    const raw = localStorage.getItem(EXAM_REPO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc kho đề thi từ localStorage:', err);
  }
  return DEFAULT_PRESET_SAVED_EXAMS;
}

export function persistSavedExamsToStorage(exams: SavedExam[]): void {
  try {
    localStorage.setItem(EXAM_REPO_STORAGE_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error('Lỗi lưu kho đề thi vào localStorage:', err);
  }
}

/**
 * Automatically archives the given active exam into repository before switching or creating new.
 * If an exam with the same ID already exists, it updates it or creates a versioned copy.
 */
export function archiveExamToRepo(
  exams: SavedExam[],
  examInfo: ExamInfo,
  questions: Question[],
  note?: string
): { updatedExams: SavedExam[]; savedExam: SavedExam } {
  const now = new Date().toISOString();
  const existingIdx = exams.findIndex((e) => e.id === examInfo.id);

  let savedExam: SavedExam;

  if (existingIdx >= 0) {
    // Update existing or preserve history
    savedExam = {
      ...exams[existingIdx],
      examInfo: { ...examInfo },
      questions: [...questions],
      updatedAt: now,
      note: note || exams[existingIdx].note || 'Đã cập nhật từ đề hiện hành',
    };
    const updated = [...exams];
    updated[existingIdx] = savedExam;
    persistSavedExamsToStorage(updated);
    return { updatedExams: updated, savedExam };
  } else {
    // Add as new archive
    savedExam = {
      id: examInfo.id || `exam_${Date.now()}`,
      examInfo: { ...examInfo },
      questions: [...questions],
      createdAt: now,
      updatedAt: now,
      isCurrent: false,
      note: note || 'Lưu trữ tự động khi tạo đề thi mới',
      tags: ['Đã lưu'],
    };
    const updated = [savedExam, ...exams];
    persistSavedExamsToStorage(updated);
    return { updatedExams: updated, savedExam };
  }
}

/**
 * Downloads a saved exam as a JSON file for backup or cross-browser exchange
 */
export function downloadExamJson(savedExam: SavedExam): void {
  const dataStr = JSON.stringify(savedExam, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = savedExam.examInfo.title
    .replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  link.href = url;
  link.download = `DeThi_${safeName}_${savedExam.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports an exam from JSON string
 */
export function parseExamJson(jsonStr: string): SavedExam {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.examInfo || !parsed.examInfo.title || !Array.isArray(parsed.questions)) {
    throw new Error('Định dạng tệp JSON đề thi không hợp lệ! Thiếu examInfo hoặc danh sách câu hỏi.');
  }
  const newId = `exam_imported_${Date.now()}`;
  return {
    id: newId,
    examInfo: {
      ...parsed.examInfo,
      id: newId,
    },
    questions: parsed.questions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCurrent: false,
    note: parsed.note || 'Nhập từ tệp JSON bên ngoài',
    tags: parsed.tags || ['Nhập từ file'],
  };
}
