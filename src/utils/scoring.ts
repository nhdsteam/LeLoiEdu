import {
  CognitiveLevel,
  ExamSubmission,
  Question,
  StudentAnswer,
  TopicId,
} from '../types';
import { EXAM_MATRIX, TOPICS } from '../data/examData';

/**
 * Tính điểm cho 1 câu hỏi Trắc nghiệm Đúng/Sai theo barem chuẩn của Bộ GD&ĐT:
 * - Đúng 1 ý: 0.1 điểm
 * - Đúng 2 ý: 0.25 điểm
 * - Đúng 3 ý: 0.50 điểm
 * - Đúng 4 ý: 1.00 điểm
 */
export function calculateTrueFalseScore(
  correctCount: number,
  totalStatements = 4
): number {
  if (totalStatements === 4) {
    switch (correctCount) {
      case 1:
        return 0.1;
      case 2:
        return 0.25;
      case 3:
        return 0.5;
      case 4:
        return 1.0;
      default:
        return 0.0;
    }
  }
  return (correctCount / totalStatements) * 1.0;
}

export interface QuestionGradingResult {
  questionId: string;
  questionNumber: number;
  part: 1 | 2 | 3;
  type: string;
  topicId: TopicId;
  cognitiveLevel: CognitiveLevel;
  maxScore: number;
  score: number;
  isFullyCorrect: boolean;
  details: {
    userChoice?: string;
    correctChoice?: string;
    statementResults?: {
      id: 'a' | 'b' | 'c' | 'd';
      text: string;
      userVal?: boolean;
      correctVal: boolean;
      isCorrect: boolean;
    }[];
    correctStatementsCount?: number;
    essayAnswer?: string;
    essayScore?: number;
    essayFeedback?: string;
  };
}

export function gradeExam(
  questions: Question[],
  answers: Record<string, StudentAnswer>
) {
  let scorePart1 = 0;
  let scorePart2 = 0;
  let scorePart3 = 0;
  const questionResults: QuestionGradingResult[] = [];

  questions.forEach((q) => {
    const studentAns = answers[q.id];

    if (q.type === 'multiple_choice') {
      const userChoice = studentAns?.mcqAnswer;
      const isCorrect = userChoice === q.correctAnswer;
      const score = isCorrect ? q.maxScore : 0;
      scorePart1 += score;

      questionResults.push({
        questionId: q.id,
        questionNumber: q.number,
        part: q.part,
        type: q.type,
        topicId: q.topicId,
        cognitiveLevel: q.cognitiveLevel,
        maxScore: q.maxScore,
        score,
        isFullyCorrect: isCorrect,
        details: {
          userChoice,
          correctChoice: q.correctAnswer,
        },
      });
    } else if (q.type === 'true_false') {
      const tfAns = studentAns?.tfAnswers || {};
      let correctCount = 0;

      const statementResults = q.statements.map((stmt) => {
        const userVal = tfAns[stmt.id];
        const isStmtCorrect = userVal !== undefined && userVal === stmt.correctAnswer;
        if (isStmtCorrect) correctCount++;

        return {
          id: stmt.id,
          text: stmt.text,
          userVal,
          correctVal: stmt.correctAnswer,
          isCorrect: isStmtCorrect,
        };
      });

      const score = calculateTrueFalseScore(correctCount, q.statements.length);
      scorePart2 += score;

      questionResults.push({
        questionId: q.id,
        questionNumber: q.number,
        part: q.part,
        type: q.type,
        topicId: q.topicId,
        cognitiveLevel: q.cognitiveLevel,
        maxScore: q.maxScore,
        score,
        isFullyCorrect: correctCount === q.statements.length,
        details: {
          statementResults,
          correctStatementsCount: correctCount,
        },
      });
    } else if (q.type === 'essay') {
      const essayScore = studentAns?.essayScore ?? 0;
      scorePart3 += essayScore;

      questionResults.push({
        questionId: q.id,
        questionNumber: q.number,
        part: q.part,
        type: q.type,
        topicId: q.topicId,
        cognitiveLevel: q.cognitiveLevel,
        maxScore: q.maxScore,
        score: essayScore,
        isFullyCorrect: essayScore >= q.maxScore,
        details: {
          essayAnswer: studentAns?.essayAnswer,
          essayScore,
          essayFeedback: studentAns?.essayFeedback,
        },
      });
    }
  });

  const totalScore = Math.min(10, Math.round((scorePart1 + scorePart2 + scorePart3) * 100) / 100);

  return {
    scorePart1: Math.round(scorePart1 * 100) / 100,
    scorePart2: Math.round(scorePart2 * 100) / 100,
    scorePart3: Math.round(scorePart3 * 100) / 100,
    totalScore,
    questionResults,
  };
}

/**
 * Đánh giá tự luận thông minh dựa trên barem và từ khóa tiêu chuẩn Bộ GD&ĐT
 */
export function autoEvaluateEssay(
  question: Question,
  studentText: string
): { score: number; feedback: string } {
  if (question.type !== 'essay') return { score: 0, feedback: '' };

  const lower = studentText.toLowerCase();
  let score = 0;
  const feedbackList: string[] = [];

  if (question.number === 1) {
    // Câu 1: 4 tiêu chí + Lời khuyên (Max 2.0đ)
    let criteriaCount = 0;
    if (lower.includes('tính mới') || lower.includes('cập nhật')) {
      criteriaCount++;
    }
    if (
      lower.includes('chính xác') ||
      lower.includes('thần y') ||
      lower.includes('3 ngày') ||
      lower.includes('dứt điểm')
    ) {
      criteriaCount++;
    }
    if (
      lower.includes('đầy đủ') ||
      lower.includes('nguồn gốc') ||
      lower.includes('địa chỉ') ||
      lower.includes('bộ y tế') ||
      lower.includes('giấy phép')
    ) {
      criteriaCount++;
    }
    if (
      lower.includes('sử dụng được') ||
      lower.includes('nguy hại') ||
      lower.includes('lừa đảo') ||
      lower.includes('sức khỏe')
    ) {
      criteriaCount++;
    }

    const criteriaScore = criteriaCount * 0.25;
    score += criteriaScore;
    feedbackList.push(`- Đã phân tích ${criteriaCount}/4 tiêu chí chất lượng thông tin (+${criteriaScore}đ).`);

    let adviceScore = 0;
    if (lower.includes('không mua') || lower.includes('không chuyển tiền')) {
      adviceScore += 0.5;
      feedbackList.push('- Có lời khuyên cảnh giác: không mua thuốc, không chuyển tiền (+0.5đ).');
    }
    if (
      lower.includes('bệnh viện') ||
      lower.includes('bác sĩ') ||
      lower.includes('khám') ||
      lower.includes('chính thống') ||
      lower.includes('.gov.vn')
    ) {
      adviceScore += 0.5;
      feedbackList.push('- Có lời khuyên khám bác sĩ / tra cứu nguồn y tế chính thống (+0.5đ).');
    }
    score += adviceScore;

    if (score === 0 && studentText.trim().length > 10) {
      score = 0.5;
      feedbackList.push('- Bài làm có ý nhưng chưa bám sát 4 tiêu chí chất lượng thông tin.');
    }
  } else if (question.number === 2) {
    // Câu 2: Vi phạm pháp luật + đạo đức + 2 cách xử lý (Max 1.0đ)
    if (
      lower.includes('pháp luật') ||
      lower.includes('trái phép') ||
      lower.includes('an ninh mạng') ||
      lower.includes('tài khoản') ||
      lower.includes('riêng tư')
    ) {
      score += 0.25;
      feedbackList.push('- Chỉ ra vi phạm pháp luật / an ninh mạng (+0.25đ).');
    }
    if (
      lower.includes('đạo đức') ||
      lower.includes('bắt nạt') ||
      lower.includes('chế giễu') ||
      lower.includes('miệt thị') ||
      lower.includes('xúc phạm')
    ) {
      score += 0.25;
      feedbackList.push('- Chỉ ra vi phạm đạo đức / bắt nạt trực tuyến (+0.25đ).');
    }
    if (
      lower.includes('đổi mật khẩu') ||
      lower.includes('2 lớp') ||
      lower.includes('2fa') ||
      lower.includes('bảo mật')
    ) {
      score += 0.25;
      feedbackList.push('- Nêu giải pháp kỹ thuật: đổi mật khẩu, bật 2FA (+0.25đ).');
    }
    if (
      lower.includes('giáo viên') ||
      lower.includes('thầy cô') ||
      lower.includes('chủ nhiệm') ||
      lower.includes('phụ huynh') ||
      lower.includes('chụp màn hình') ||
      lower.includes('bằng chứng') ||
      lower.includes('báo')
    ) {
      score += 0.25;
      feedbackList.push('- Nêu giải pháp hỗ trợ: lưu bằng chứng & báo thầy cô, phụ huynh (+0.25đ).');
    }

    if (score === 0 && studentText.trim().length > 10) {
      score = 0.25;
      feedbackList.push('- Có ý kiến trả lời nhưng chưa làm rõ căn cứ pháp lý và giải pháp.');
    }
  }

  score = Math.min(question.maxScore, Math.round(score * 100) / 100);
  return {
    score,
    feedback: feedbackList.join('\n') || 'Đã ghi nhận câu trả lời.',
  };
}

export interface ClassStatistics {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // >= 5.0
  goodRate: number; // >= 8.0
  scoreDistribution: {
    label: string;
    count: number;
    percentage: number;
  }[];
  topicPerformance: {
    topicId: TopicId;
    topicName: string;
    totalPossible: number;
    averageEarned: number;
    percentage: number;
  }[];
  levelPerformance: {
    level: CognitiveLevel;
    label: string;
    totalPossible: number;
    averageEarned: number;
    percentage: number;
  }[];
  questionErrorRates: {
    questionId: string;
    questionNumber: number;
    part: number;
    snippet: string;
    wrongRate: number; // % học sinh làm sai
  }[];
  antiCheatViolationsTotal: number;
}

export function calculateClassAnalytics(
  questions: Question[],
  submissions: ExamSubmission[]
): ClassStatistics {
  if (submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      goodRate: 0,
      scoreDistribution: [],
      topicPerformance: [],
      levelPerformance: [],
      questionErrorRates: [],
      antiCheatViolationsTotal: 0,
    };
  }

  const scores = submissions.map((s) => s.totalScore);
  const totalSubmissions = submissions.length;
  const averageScore =
    Math.round((scores.reduce((a, b) => a + b, 0) / totalSubmissions) * 10) / 10;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const passCount = scores.filter((s) => s >= 5.0).length;
  const goodCount = scores.filter((s) => s >= 8.0).length;
  const passRate = Math.round((passCount / totalSubmissions) * 100);
  const goodRate = Math.round((goodCount / totalSubmissions) * 100);

  // Phổ điểm
  const brackets = [
    { label: '0 - < 2.0 (Kém)', min: 0, max: 2 },
    { label: '2.0 - < 5.0 (Yếu)', min: 2, max: 5 },
    { label: '5.0 - < 6.5 (Trung bình)', min: 5, max: 6.5 },
    { label: '6.5 - < 8.0 (Khá)', min: 6.5, max: 8 },
    { label: '8.0 - 10.0 (Giỏi)', min: 8, max: 10.01 },
  ];

  const scoreDistribution = brackets.map((b) => {
    const count = scores.filter((s) => s >= b.min && s < b.max).length;
    return {
      label: b.label,
      count,
      percentage: Math.round((count / totalSubmissions) * 100),
    };
  });

  // Tính điểm theo chủ đề và mức độ nhận thức
  const topicMap: Record<TopicId, { max: number; earned: number }> = {
    topic_1: { max: 0, earned: 0 },
    topic_2: { max: 0, earned: 0 },
    topic_3: { max: 0, earned: 0 },
    topic_4: { max: 0, earned: 0 },
  };

  const levelMap: Record<CognitiveLevel, { max: number; earned: number }> = {
    biet: { max: 0, earned: 0 },
    hieu: { max: 0, earned: 0 },
    van_dung: { max: 0, earned: 0 },
  };

  const questionWrongMap: Record<string, number> = {};

  submissions.forEach((sub) => {
    const { questionResults } = gradeExam(questions, sub.answers);
    questionResults.forEach((res) => {
      topicMap[res.topicId].earned += res.score;
      levelMap[res.cognitiveLevel].earned += res.score;

      if (!res.isFullyCorrect) {
        questionWrongMap[res.questionId] = (questionWrongMap[res.questionId] || 0) + 1;
      }
    });
  });

  // Tổng điểm tối đa của 1 đề thi theo từng tiêu chí * số bài nộp
  questions.forEach((q) => {
    topicMap[q.topicId].max += q.maxScore * totalSubmissions;
    levelMap[q.cognitiveLevel].max += q.maxScore * totalSubmissions;
  });

  const topicPerformance = (Object.keys(topicMap) as TopicId[]).map((tid) => {
    const { max, earned } = topicMap[tid];
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
    return {
      topicId: tid,
      topicName: TOPICS[tid].name,
      totalPossible: Math.round((max / totalSubmissions) * 100) / 100,
      averageEarned: Math.round((earned / totalSubmissions) * 100) / 100,
      percentage: pct,
    };
  });

  const levelLabels: Record<CognitiveLevel, string> = {
    biet: 'Nhận biết (Biết)',
    hieu: 'Thông hiểu (Hiểu)',
    van_dung: 'Vận dụng',
  };

  const levelPerformance = (Object.keys(levelMap) as CognitiveLevel[]).map((lvl) => {
    const { max, earned } = levelMap[lvl];
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
    return {
      level: lvl,
      label: levelLabels[lvl],
      totalPossible: Math.round((max / totalSubmissions) * 100) / 100,
      averageEarned: Math.round((earned / totalSubmissions) * 100) / 100,
      percentage: pct,
    };
  });

  // Top câu hỏi hay sai
  const questionErrorRates = questions
    .map((q) => {
      const wrongCount = questionWrongMap[q.id] || 0;
      const wrongRate = Math.round((wrongCount / totalSubmissions) * 100);
      return {
        questionId: q.id,
        questionNumber: q.number,
        part: q.part,
        snippet: q.content.slice(0, 90) + (q.content.length > 90 ? '...' : ''),
        wrongRate,
      };
    })
    .sort((a, b) => b.wrongRate - a.wrongRate)
    .slice(0, 5);

  const antiCheatViolationsTotal = submissions.reduce(
    (acc, cur) => acc + (cur.violationCount || 0),
    0
  );

  return {
    totalSubmissions,
    averageScore,
    highestScore,
    lowestScore,
    passRate,
    goodRate,
    scoreDistribution,
    topicPerformance,
    levelPerformance,
    questionErrorRates,
    antiCheatViolationsTotal,
  };
}
