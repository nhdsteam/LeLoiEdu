import { ExamInfo, ExamSubmission, Question } from '../types';
import { gradeExam } from './scoring';
import { TOPICS } from '../data/examData';

export function getGradeClassification(score: number): { label: string; textClass: string } {
  if (score >= 9.0) return { label: 'Xuất sắc', textClass: 'text-emerald-700' };
  if (score >= 8.0) return { label: 'Giỏi', textClass: 'text-indigo-700' };
  if (score >= 6.5) return { label: 'Khá', textClass: 'text-blue-700' };
  if (score >= 5.0) return { label: 'Trung bình', textClass: 'text-amber-700' };
  return { label: 'Chưa đạt', textClass: 'text-rose-700' };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} phút ${secs.toString().padStart(2, '0')} giây`;
}

export function generatePrintableReportHtml(
  examInfo: ExamInfo,
  submission: ExamSubmission,
  questions: Question[]
): string {
  const { scorePart1, scorePart2, scorePart3, totalScore, questionResults } = gradeExam(
    questions,
    submission.answers
  );
  const classification = getGradeClassification(totalScore);

  const formattedSubmittedDate = new Date(submission.submittedAt).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Topic performance
  const topicBreakdown = Object.keys(TOPICS).map((tKey) => {
    const topicQuestions = questions.filter((q) => q.topicId === tKey);
    const maxScore = topicQuestions.reduce((acc, q) => acc + q.maxScore, 0);
    const earnedScore = questionResults
      .filter((r) => r.topicId === tKey)
      .reduce((acc, r) => acc + r.score, 0);
    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    return {
      name: TOPICS[tKey as keyof typeof TOPICS].name,
      earnedScore: Math.round(earnedScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      percentage,
    };
  });

  // Questions breakdown rows
  const questionRows = questionResults
    .map((r) => {
      let answerDetail = '';
      if (r.type === 'multiple_choice') {
        answerDetail = `Chọn: ${r.details.userChoice || '-'} | Đ.án: ${r.details.correctChoice || '-'}`;
      } else if (r.type === 'true_false') {
        const correctCount = r.details.correctStatementsCount || 0;
        answerDetail = `Đúng ${correctCount}/4 ý`;
      } else {
        answerDetail = r.details.essayFeedback || 'Đã chấm tự luận';
      }

      const partLabel =
        r.part === 1 ? 'Phần I' : r.part === 2 ? 'Phần II' : 'Phần III';

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${partLabel} - Câu ${r.questionNumber}</td>
          <td style="text-align: center;">${r.type === 'multiple_choice' ? 'Trắc nghiệm' : r.type === 'true_false' ? 'Đúng / Sai' : 'Tự luận'}</td>
          <td>${answerDetail}</td>
          <td style="text-align: center; font-weight: bold; color: ${r.score === r.maxScore ? '#047857' : r.score > 0 ? '#b45309' : '#b91c1c'};">
            ${r.score.toFixed(2)} / ${r.maxScore.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu Báo Kết Quả - ${submission.studentName} (${submission.studentId})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Times New Roman", Times, serif, system-ui;
      font-size: 13pt;
      line-height: 1.4;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .page-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 10px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .header-table td {
      vertical-align: top;
      padding: 2px 4px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    
    .divider {
      width: 100px;
      height: 1px;
      background: #334155;
      margin: 3px auto 6px auto;
    }
    
    .title-box {
      text-align: center;
      margin: 15px 0 15px 0;
    }
    .title-main {
      font-size: 16pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-sub {
      font-size: 12pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 3px;
    }
    .title-desc {
      font-size: 10.5pt;
      font-style: italic;
      color: #475569;
      margin-top: 2px;
    }
    
    .info-card {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 15px;
      background-color: #f8fafc;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 6px;
      column-gap: 20px;
      font-size: 11.5pt;
    }
    
    .score-summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .score-summary-table th, .score-summary-table td {
      border: 1px solid #334155;
      padding: 6px 10px;
      font-size: 11.5pt;
    }
    .score-summary-table th {
      background-color: #e2e8f0;
      font-weight: bold;
      text-align: center;
    }
    
    .highlight-box {
      border: 2px solid #1e3a8a;
      background-color: #eff6ff;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .big-score {
      font-size: 22pt;
      font-weight: 900;
      color: #1e3a8a;
    }
    
    .competency-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .competency-table th, .competency-table td {
      border: 1px solid #64748b;
      padding: 5px 8px;
      font-size: 10.5pt;
    }
    .competency-table th {
      background: #f1f5f9;
      text-align: center;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .details-table th, .details-table td {
      border: 1px solid #94a3b8;
      padding: 4px 6px;
      font-size: 9.5pt;
    }
    .details-table th {
      background: #f8fafc;
    }

    .feedback-box {
      border: 1px dashed #64748b;
      padding: 8px 12px;
      margin-bottom: 15px;
      font-size: 11pt;
      background: #ffffff;
      min-height: 45px;
    }

    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      page-break-inside: avoid;
    }
    .signatures-table td {
      width: 33.33%;
      vertical-align: top;
      text-align: center;
      padding: 4px;
      font-size: 11pt;
    }
    .signature-space {
      height: 60px;
    }

    .no-print-bar {
      background: #1e293b;
      color: white;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
    }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #4338ca;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      .page-container {
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Non-print helper banner when opened directly -->
    <div class="no-print-bar">
      <span>📄 <strong>Bản xem trước Phiếu Báo Điểm Chuẩn A4</strong> (Bộ Giáo dục & Đào tạo)</span>
      <button class="print-btn" onclick="window.print()">🖨️ Nhấn vào đây để In (Ctrl + P)</button>
    </div>

    <!-- Official Vietnamese Document Header -->
    <table class="header-table">
      <tr>
        <td style="width: 48%; text-align: center;">
          <div class="uppercase font-bold" style="font-size: 11pt;">SỞ GD&ĐT / PHÒNG GD&ĐT</div>
          <div class="uppercase font-bold" style="font-size: 11.5pt;">${examInfo.school}</div>
          <div class="italic" style="font-size: 10.5pt;">Tổ: ${examInfo.department}</div>
          <div class="divider"></div>
        </td>
        <td style="width: 52%; text-align: center;">
          <div class="uppercase font-bold" style="font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="font-bold" style="font-size: 11.5pt;">Độc lập - Tự do - Hạnh phúc</div>
          <div class="divider"></div>
          <div class="italic" style="font-size: 9.5pt; margin-top: 2px;">Ngày in: ${currentDateStr}</div>
        </td>
      </tr>
    </table>

    <!-- Main Title -->
    <div class="title-box">
      <div class="title-main">PHIẾU BÁO KẾT QUẢ KIỂM TRA ĐỊNH KÌ</div>
      <div class="title-sub">MÔN: ${examInfo.subject.toUpperCase()} - ${examInfo.grade.toUpperCase()}</div>
      <div class="title-desc">
        ${examInfo.title} • ${examInfo.academicYear} • Thời gian: ${examInfo.durationMinutes} phút
      </div>
      <div style="font-size: 9.5pt; color: #64748b; margin-top: 2px;">
        (${examInfo.documentRef})
      </div>
    </div>

    <!-- Student Info Card -->
    <div class="info-card">
      <div class="info-grid">
        <div>Họ và tên thí sinh: <strong>${submission.studentName}</strong></div>
        <div>Lớp: <strong>${submission.studentClass}</strong></div>
        <div>Số báo danh (SBD): <strong>${submission.studentId}</strong></div>
        <div>Thời gian làm bài: <strong>${formatDuration(submission.durationSeconds)}</strong></div>
        <div>Thời điểm nộp bài: <strong>${formattedSubmittedDate}</strong></div>
        <div>Giám sát thi trực tuyến: <strong>${
          submission.antiCheatLogs.length === 0
            ? 'Tuân thủ tốt (0 vi phạm)'
            : `${submission.antiCheatLogs.length} lần chuyển tab`
        }</strong></div>
      </div>
    </div>

    <!-- Big Scorecard Banner -->
    <div class="highlight-box">
      <div>
        <div style="font-size: 11pt; text-transform: uppercase; font-weight: bold; color: #1e3a8a;">
          Tổng Điểm Đạt Được (Thang Điểm 10.0)
        </div>
        <div style="font-size: 10.5pt; color: #334155; margin-top: 2px;">
          Xếp loại học lực bài thi: <strong style="color: #1e3a8a; font-size: 12pt;">${classification.label.toUpperCase()}</strong>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="big-score">${totalScore.toFixed(2)}</span>
        <span style="font-size: 14pt; font-weight: bold; color: #64748b;"> / 10.0 điểm</span>
      </div>
    </div>

    <!-- Score Breakdown by 3 Parts (CV 7991 Standard) -->
    <table class="score-summary-table">
      <thead>
        <tr>
          <th>Phần thi theo cấu trúc Bộ GD&ĐT</th>
          <th style="width: 130px;">Số câu / Thể thức</th>
          <th style="width: 120px;">Điểm tối đa</th>
          <th style="width: 120px;">Điểm đạt được</th>
          <th style="width: 100px;">Tỷ lệ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Phần I: Câu hỏi trắc nghiệm nhiều lựa chọn</strong></td>
          <td style="text-align: center;">12 câu (A, B, C, D)</td>
          <td style="text-align: center;">3.00 điểm</td>
          <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart1.toFixed(2)} điểm</td>
          <td style="text-align: center;">${Math.round((scorePart1 / 3.0) * 100)}%</td>
        </tr>
        <tr>
          <td><strong>Phần II: Câu hỏi trắc nghiệm Đúng / Sai</strong></td>
          <td style="text-align: center;">4 câu (16 ý a,b,c,d)</td>
          <td style="text-align: center;">4.00 điểm</td>
          <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart2.toFixed(2)} điểm</td>
          <td style="text-align: center;">${Math.round((scorePart2 / 4.0) * 100)}%</td>
        </tr>
        <tr>
          <td><strong>Phần III: Câu hỏi Tự luận / Trả lời ngắn</strong></td>
          <td style="text-align: center;">2 câu tự luận</td>
          <td style="text-align: center;">3.00 điểm</td>
          <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart3.toFixed(2)} điểm</td>
          <td style="text-align: center;">${Math.round((scorePart3 / 3.0) * 100)}%</td>
        </tr>
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          <td colspan="2" style="text-align: right; text-transform: uppercase;">TỔNG CỘNG TOÀN BÀI THI:</td>
          <td style="text-align: center;">10.00 điểm</td>
          <td style="text-align: center; font-size: 13pt; color: #1e3a8a;">${totalScore.toFixed(2)} điểm</td>
          <td style="text-align: center; font-size: 11pt;">${Math.round((totalScore / 10.0) * 100)}%</td>
        </tr>
      </tbody>
    </table>

    <!-- Competency Breakdown by 4 Topics -->
    <div style="font-weight: bold; font-size: 11pt; margin: 12px 0 6px 0;">
      ĐÁNH GIÁ NĂNG LỰC THEO 4 CHỦ ĐỀ KIẾN THỨC MÔN HỌC (CV 7991):
    </div>
    <table class="competency-table">
      <thead>
        <tr>
          <th>Chủ đề kiến thức</th>
          <th style="width: 120px;">Điểm đạt</th>
          <th style="width: 120px;">Điểm tối đa</th>
          <th style="width: 100px;">Mức độ đạt</th>
        </tr>
      </thead>
      <tbody>
        ${topicBreakdown
          .map(
            (tb) => `
          <tr>
            <td>${tb.name}</td>
            <td style="text-align: center; font-weight: bold;">${tb.earnedScore.toFixed(2)}</td>
            <td style="text-align: center;">${tb.maxScore.toFixed(2)}</td>
            <td style="text-align: center; font-weight: bold; color: ${
              tb.percentage >= 80 ? '#047857' : tb.percentage >= 50 ? '#1e3a8a' : '#b91c1c'
            };">
              ${tb.percentage}%
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- Teacher Feedback Section -->
    <div style="font-weight: bold; font-size: 11pt; margin: 12px 0 4px 0;">
      NHẬN XÉT CỦA GIÁO VIÊN BỘ MÔN:
    </div>
    <div class="feedback-box">
      ${
        totalScore >= 8.5
          ? 'Học sinh nắm vững kiến thức trọng tâm, kỹ năng làm bài tốt và có tư duy logic cao.'
          : totalScore >= 6.5
          ? 'Học sinh đạt yêu cầu kiến thức cơ bản, cần rèn luyện thêm phần giải quyết vấn đề và tự luận.'
          : 'Học sinh cần chú ý ôn tập củng cố thêm các khái niệm cơ bản và kỹ năng phân tích ý đúng/sai.'
      }
    </div>

    <!-- Signatures -->
    <table class="signatures-table">
      <tr>
        <td>
          <div class="font-bold uppercase">Ý KIẾN PHỤ HUYNH</div>
          <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
          <div class="signature-space"></div>
        </td>
        <td>
          <div class="font-bold uppercase">CHỮ KÝ HỌC SINH</div>
          <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
          <div class="signature-space"></div>
        </td>
        <td>
          <div class="italic" style="font-size: 9.5pt; margin-bottom: 2px;">Ngày ..... tháng ..... năm 202...</div>
          <div class="font-bold uppercase">GIÁO VIÊN CHẤM THI</div>
          <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
          <div class="signature-space"></div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Triggers printing using a hidden iframe to ensure clean A4 printout
 * without web UI headers and navigation bars.
 */
export function printViaHiddenIframe(htmlContent: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Remove any previous print iframe
      const oldFrame = document.getElementById('edu-print-hidden-iframe');
      if (oldFrame) {
        oldFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'edu-print-hidden-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';

      document.body.appendChild(iframe);

      const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!frameDoc) {
        throw new Error('Không thể truy cập tài liệu iframe in');
      }

      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (printErr) {
          console.warn('Iframe print blocked by browser sandbox:', printErr);
          resolve(false);
        }
      }, 400);
    } catch (err) {
      console.warn('Cannot create print iframe:', err);
      resolve(false);
    }
  });
}

/**
 * Opens report in a new browser tab with automatic print prompt.
 * This bypasses iframe sandbox blocks in AI Studio / embedded previews.
 */
export function openReportInNewTab(htmlContent: string): boolean {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newWin = window.open(blobUrl, '_blank');
    if (newWin) {
      newWin.focus();
      return true;
    }
  } catch (err) {
    console.warn('Cannot open new tab:', err);
  }
  return false;
}

/**
 * Direct file download of the official HTML report for offline archiving & printing.
 */
export function downloadReportHtml(htmlContent: string, fileName: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies concise text summary to clipboard for sending to parents via Zalo / SMS.
 */
export async function copyReportSummary(
  examInfo: ExamInfo,
  submission: ExamSubmission,
  questions: Question[]
): Promise<boolean> {
  try {
    const { scorePart1, scorePart2, scorePart3, totalScore } = gradeExam(
      questions,
      submission.answers
    );
    const classification = getGradeClassification(totalScore);

    const text = `📢 THÔNG BÁO KẾT QUẢ KIỂM TRA ĐỊNH KÌ
Trường: ${examInfo.school}
Môn: ${examInfo.subject} - ${examInfo.grade} (${examInfo.academicYear})
Kỳ thi: ${examInfo.title}

Họ và tên học sinh: ${submission.studentName}
Lớp: ${submission.studentClass} | SBD: ${submission.studentId}
Thời gian làm bài: ${formatDuration(submission.durationSeconds)}

📊 KẾT QUẢ CHI TIẾT:
- Phần I (Trắc nghiệm): ${scorePart1.toFixed(2)}/3.00 điểm
- Phần II (Đúng/Sai): ${scorePart2.toFixed(2)}/4.00 điểm
- Phần III (Tự luận): ${scorePart3.toFixed(2)}/3.00 điểm
⭐️ TỔNG ĐIỂM BÀI THI: ${totalScore.toFixed(2)} / 10.00 ĐIỂM
Xếp loại: ${classification.label.toUpperCase()}

Giám sát trực tuyến: ${
      submission.antiCheatLogs.length === 0
        ? 'Trung thực 100%'
        : `${submission.antiCheatLogs.length} lần chuyển tab`
    }
Căn cứ đánh giá: ${examInfo.documentRef}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write error:', err);
  }
  return false;
}

/**
 * Generates an official multi-student printable document containing continuous individual scorecards,
 * with standard CSS page-breaks between each student for bulk printing.
 */
export function generateMultiStudentScorecardsHtml(
  examInfo: ExamInfo,
  submissions: ExamSubmission[],
  questions: Question[]
): string {
  const studentPages = submissions.map((sub, index) => {
    const isLast = index === submissions.length - 1;
    const { scorePart1, scorePart2, scorePart3, totalScore, questionResults } = gradeExam(
      questions,
      sub.answers
    );
    const classification = getGradeClassification(totalScore);

    const formattedSubmittedDate = new Date(sub.submittedAt).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const currentDateStr = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Topic performance
    const topicBreakdown = Object.keys(TOPICS).map((tKey) => {
      const topicQuestions = questions.filter((q) => q.topicId === tKey);
      const maxScore = topicQuestions.reduce((acc, q) => acc + q.maxScore, 0);
      const earnedScore = questionResults
        .filter((r) => r.topicId === tKey)
        .reduce((acc, r) => acc + r.score, 0);
      const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
      return {
        name: TOPICS[tKey as keyof typeof TOPICS].name,
        earnedScore: Math.round(earnedScore * 100) / 100,
        maxScore: Math.round(maxScore * 100) / 100,
        percentage,
      };
    });

    const essayFeedbackText =
      sub.answers['q17']?.essayFeedback || sub.answers['q18']?.essayFeedback
        ? `Câu 17: ${sub.answers['q17']?.essayFeedback || 'Đạt yêu cầu'}. Câu 18: ${
            sub.answers['q18']?.essayFeedback || 'Đạt yêu cầu'
          }`
        : totalScore >= 8.5
        ? 'Học sinh nắm vững kiến thức trọng tâm, kỹ năng giải quyết vấn đề xuất sắc.'
        : totalScore >= 6.5
        ? 'Học sinh đạt chuẩn kiến thức, cần rèn luyện thêm kĩ năng lập luận tự luận.'
        : 'Cần ôn tập củng cố kiến thức nền tảng và kĩ năng phân tích đúng/sai.';

    return `
    <div class="page-container ${!isLast ? 'page-break' : ''}">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td style="width: 50%;" class="text-center">
            <div class="font-bold uppercase" style="font-size: 11pt;">${examInfo.school}</div>
            <div class="font-bold uppercase" style="font-size: 11pt;">${examInfo.department}</div>
            <div class="divider"></div>
          </td>
          <td style="width: 50%;" class="text-center">
            <div class="font-bold uppercase" style="font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="font-bold" style="font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</div>
            <div class="divider"></div>
            <div class="italic" style="font-size: 9.5pt;">Hà Nội, ngày ${currentDateStr}</div>
          </td>
        </tr>
      </table>

      <!-- Title -->
      <div class="title-box">
        <div class="title-main">PHIẾU BÁO ĐIỂM KIỂM TRA ĐỊNH KÌ</div>
        <div class="title-sub">${examInfo.title}</div>
        <div class="title-desc">Môn: <strong>${examInfo.subject}</strong> — Khối: <strong>${examInfo.grade}</strong> | ${examInfo.academicYear}</div>
        <div class="italic text-slate-500" style="font-size: 9pt; margin-top: 2px;">
          (${examInfo.documentRef})
        </div>
      </div>

      <!-- Student Metadata Box -->
      <div class="info-card">
        <div class="info-grid">
          <div>Họ và tên thí sinh: <strong style="font-size: 12pt; text-transform: uppercase;">${sub.studentName}</strong></div>
          <div>Lớp: <strong>${sub.studentClass}</strong></div>
          <div>Số báo danh (Mã HS): <strong>${sub.studentId}</strong></div>
          <div>Thời gian làm bài: <strong>${formatDuration(sub.durationSeconds)}</strong> / ${examInfo.durationMinutes} phút</div>
          <div>Thời điểm nộp bài: <strong>${formattedSubmittedDate}</strong></div>
          <div>Giám sát thi trực tuyến: <strong>${
            sub.violationCount === 0 ? 'Trung thực (0 vi phạm)' : `${sub.violationCount} lần chuyển tab`
          }</strong></div>
        </div>
      </div>

      <!-- Big Scorecard Banner -->
      <div class="highlight-box">
        <div>
          <div style="font-size: 11pt; text-transform: uppercase; font-weight: bold; color: #1e3a8a;">
            Tổng Điểm Đạt Được (Thang Điểm 10.0)
          </div>
          <div style="font-size: 10.5pt; color: #334155; margin-top: 2px;">
            Xếp loại học lực bài thi: <strong style="color: #1e3a8a; font-size: 12pt;">${classification.label.toUpperCase()}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="big-score">${totalScore.toFixed(2)}</span>
          <span style="font-size: 14pt; font-weight: bold; color: #64748b;"> / 10.0 điểm</span>
        </div>
      </div>

      <!-- Score Breakdown by 3 Parts (CV 7991 Standard) -->
      <table class="score-summary-table">
        <thead>
          <tr>
            <th>Phần thi theo cấu trúc Bộ GD&ĐT</th>
            <th style="width: 130px;">Số câu / Thể thức</th>
            <th style="width: 120px;">Điểm tối đa</th>
            <th style="width: 120px;">Điểm đạt được</th>
            <th style="width: 100px;">Tỷ lệ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Phần I: Câu hỏi trắc nghiệm nhiều lựa chọn</strong></td>
            <td style="text-align: center;">12 câu (A, B, C, D)</td>
            <td style="text-align: center;">3.00 điểm</td>
            <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart1.toFixed(2)} điểm</td>
            <td style="text-align: center;">${Math.round((scorePart1 / 3.0) * 100)}%</td>
          </tr>
          <tr>
            <td><strong>Phần II: Câu hỏi trắc nghiệm Đúng / Sai</strong></td>
            <td style="text-align: center;">4 câu (16 ý a,b,c,d)</td>
            <td style="text-align: center;">4.00 điểm</td>
            <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart2.toFixed(2)} điểm</td>
            <td style="text-align: center;">${Math.round((scorePart2 / 4.0) * 100)}%</td>
          </tr>
          <tr>
            <td><strong>Phần III: Câu hỏi Tự luận / Trả lời ngắn</strong></td>
            <td style="text-align: center;">2 câu tự luận</td>
            <td style="text-align: center;">3.00 điểm</td>
            <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${scorePart3.toFixed(2)} điểm</td>
            <td style="text-align: center;">${Math.round((scorePart3 / 3.0) * 100)}%</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="text-align: right; text-transform: uppercase;">TỔNG CỘNG TOÀN BÀI THI:</td>
            <td style="text-align: center;">10.00 điểm</td>
            <td style="text-align: center; font-size: 13pt; color: #1e3a8a;">${totalScore.toFixed(2)} điểm</td>
            <td style="text-align: center; font-size: 11pt;">${Math.round((totalScore / 10.0) * 100)}%</td>
          </tr>
        </tbody>
      </table>

      <!-- Competency Breakdown by 4 Topics -->
      <div style="font-weight: bold; font-size: 10.5pt; margin: 10px 0 5px 0;">
        ĐÁNH GIÁ NĂNG LỰC THEO 4 CHỦ ĐỀ KIẾN THỨC MÔN HỌC (CV 7991):
      </div>
      <table class="competency-table">
        <thead>
          <tr>
            <th>Chủ đề kiến thức</th>
            <th style="width: 120px;">Điểm đạt</th>
            <th style="width: 120px;">Điểm tối đa</th>
            <th style="width: 100px;">Mức độ đạt</th>
          </tr>
        </thead>
        <tbody>
          ${topicBreakdown
            .map(
              (tb) => `
            <tr>
              <td>${tb.name}</td>
              <td style="text-align: center; font-weight: bold;">${tb.earnedScore.toFixed(2)}</td>
              <td style="text-align: center;">${tb.maxScore.toFixed(2)}</td>
              <td style="text-align: center; font-weight: bold; color: ${
                tb.percentage >= 80 ? '#047857' : tb.percentage >= 50 ? '#1e3a8a' : '#b91c1c'
              };">
                ${tb.percentage}%
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Teacher Feedback Section -->
      <div style="font-weight: bold; font-size: 10.5pt; margin: 10px 0 4px 0;">
        NHẬN XÉT CỦA GIÁO VIÊN BỘ MÔN:
      </div>
      <div class="feedback-box">
        ${essayFeedbackText}
      </div>

      <!-- Signatures -->
      <table class="signatures-table">
        <tr>
          <td>
            <div class="font-bold uppercase">Ý KIẾN PHỤ HUYNH</div>
            <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
            <div class="signature-space"></div>
          </td>
          <td>
            <div class="font-bold uppercase">CHỮ KÝ HỌC SINH</div>
            <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
            <div class="signature-space"></div>
          </td>
          <td>
            <div class="italic" style="font-size: 9.5pt; margin-bottom: 2px;">Ngày ..... tháng ..... năm 202...</div>
            <div class="font-bold uppercase">GIÁO VIÊN CHẤM THI</div>
            <div class="italic" style="font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
            <div class="signature-space"></div>
          </td>
        </tr>
      </table>
    </div>
    `;
  });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bộ Phiếu Báo Kết Quả Thi - ${submissions.length} Học Sinh</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Times New Roman", Times, serif, system-ui;
      font-size: 13pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .page-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 10px;
      min-height: 290mm;
      position: relative;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    @media screen {
      .page-container {
        border-bottom: 4px dashed #cbd5e1;
        margin-bottom: 30px;
        padding-bottom: 30px;
      }
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .header-table td {
      vertical-align: top;
      padding: 2px 4px;
    }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    
    .divider {
      width: 100px;
      height: 1px;
      background: #334155;
      margin: 3px auto 5px auto;
    }
    
    .title-box {
      text-align: center;
      margin: 10px 0 12px 0;
    }
    .title-main {
      font-size: 15pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-sub {
      font-size: 11.5pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 2px;
    }
    .title-desc {
      font-size: 10pt;
      color: #334155;
      margin-top: 2px;
    }
    
    .info-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      background-color: #f8fafc;
      margin-bottom: 10px;
      font-size: 10.5pt;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 5px;
      column-gap: 15px;
    }
    
    .highlight-box {
      background: #eff6ff;
      border: 1.5px solid #93c5fd;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .big-score {
      font-size: 24pt;
      font-weight: 900;
      color: #1d4ed8;
      line-height: 1;
    }
    
    .score-summary-table, .competency-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 10pt;
    }
    .score-summary-table th, .score-summary-table td,
    .competency-table th, .competency-table td {
      border: 1px solid #64748b;
      padding: 5px 8px;
    }
    .score-summary-table th, .competency-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    
    .feedback-box {
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 8px 12px;
      background: #ffffff;
      min-height: 48px;
      font-size: 10.5pt;
      color: #1e293b;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      text-align: center;
    }
    .signatures-table td {
      width: 33.33%;
      vertical-align: top;
      padding: 0 8px;
    }
    .signature-space {
      height: 60px;
    }
  </style>
</head>
<body>
  ${studentPages.join('')}
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      if (window.location.search.includes('print=true')) {
        setTimeout(() => window.print(), 300);
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Generates an administrative Master Grade Sheet (Bảng tổng hợp điểm thi cả lớp)
 * suitable for school archives, semester records, and board of examiners.
 */
export function generateMasterGradeSheetHtml(
  examInfo: ExamInfo,
  submissions: ExamSubmission[]
): string {
  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const total = submissions.length;
  const avg = total > 0 ? submissions.reduce((acc, s) => acc + s.totalScore, 0) / total : 0;
  const gioCount = submissions.filter((s) => s.totalScore >= 8.0).length;
  const khaCount = submissions.filter((s) => s.totalScore >= 6.5 && s.totalScore < 8.0).length;
  const tbCount = submissions.filter((s) => s.totalScore >= 5.0 && s.totalScore < 6.5).length;
  const yeuCount = submissions.filter((s) => s.totalScore < 5.0).length;

  const rows = submissions
    .slice()
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'vi'))
    .map((sub, idx) => {
      const classification = getGradeClassification(sub.totalScore);
      const essayComment =
        sub.answers['q17']?.essayFeedback || sub.answers['q18']?.essayFeedback
          ? `${sub.answers['q17']?.essayFeedback ? 'C17: ' + sub.answers['q17'].essayFeedback : ''} ${
              sub.answers['q18']?.essayFeedback ? 'C18: ' + sub.answers['q18'].essayFeedback : ''
            }`
          : sub.totalScore >= 8.0
          ? 'Nắm vững kiến thức, tự luận tốt'
          : sub.totalScore >= 5.0
          ? 'Đạt yêu cầu'
          : 'Cần rèn luyện thêm';

      return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: bold; text-align: left;">${sub.studentName}</td>
        <td style="text-align: center; font-family: monospace;">${sub.studentId}</td>
        <td style="text-align: center;">${sub.studentClass}</td>
        <td style="text-align: center;">${sub.scorePart1.toFixed(2)}</td>
        <td style="text-align: center;">${sub.scorePart2.toFixed(2)}</td>
        <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${sub.scorePart3.toFixed(2)}</td>
        <td style="text-align: center; font-weight: bold; font-size: 11pt; color: #0f172a; background-color: #f8fafc;">
          ${sub.totalScore.toFixed(2)}
        </td>
        <td style="text-align: center; font-weight: bold;">
          ${classification.label}
        </td>
        <td style="text-align: center; color: ${sub.violationCount > 0 ? '#b91c1c' : '#047857'}; font-weight: bold;">
          ${sub.violationCount === 0 ? '0' : sub.violationCount}
        </td>
        <td style="text-align: left; font-size: 9pt;">
          ${essayComment}
        </td>
      </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bảng Tổng Hợp Kết Quả Thi - ${examInfo.title}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Times New Roman", Times, serif, system-ui;
      font-size: 11pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .header-table td {
      vertical-align: top;
      padding: 2px 4px;
    }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    .divider {
      width: 120px;
      height: 1px;
      background: #334155;
      margin: 3px auto 5px auto;
    }
    .title-box {
      text-align: center;
      margin: 10px 0 15px 0;
    }
    .title-main {
      font-size: 15pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-sub {
      font-size: 12pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 3px;
    }
    
    .stats-summary {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10pt;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
    }
    .stats-summary td {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10pt;
    }
    .data-table th, .data-table td {
      border: 1px solid #475569;
      padding: 5px 6px;
    }
    .data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      text-align: center;
    }
    .signatures-table td {
      width: 25%;
      vertical-align: top;
      padding: 0 8px;
    }
    .signature-space {
      height: 70px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;" class="text-center">
        <div class="font-bold uppercase">${examInfo.school}</div>
        <div class="font-bold uppercase">${examInfo.department}</div>
        <div class="divider"></div>
      </td>
      <td style="width: 55%;" class="text-center">
        <div class="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="font-bold">Độc lập - Tự do - Hạnh phúc</div>
        <div class="divider"></div>
        <div class="italic" style="font-size: 9.5pt;">Ngày xuất bảng điểm: ${currentDateStr}</div>
      </td>
    </tr>
  </table>

  <div class="title-box">
    <div class="title-main">BẢNG TỔNG HỢP KẾT QUẢ KIỂM TRA ĐỊNH KÌ & ĐIỂM CHẤM TỰ LUẬN</div>
    <div class="title-sub">${examInfo.title}</div>
    <div style="font-size: 10.5pt; color: #334155; margin-top: 2px;">
      Môn: <strong>${examInfo.subject}</strong> | Khối: <strong>${examInfo.grade}</strong> | ${examInfo.academicYear} | Chuẩn CV 7991/BGDĐT-GDTrH
    </div>
  </div>

  <table class="stats-summary">
    <tr>
      <td>Tổng số học sinh: <strong>${total}</strong></td>
      <td>Điểm trung bình toàn khối: <strong>${avg.toFixed(2)} / 10</strong></td>
      <td>Giỏi (≥8.0đ): <strong>${gioCount}</strong> (${total > 0 ? ((gioCount / total) * 100).toFixed(1) : 0}%)</td>
      <td>Khá (6.5 - 7.9đ): <strong>${khaCount}</strong> (${total > 0 ? ((khaCount / total) * 100).toFixed(1) : 0}%)</td>
      <td>Đạt (5.0 - 6.4đ): <strong>${tbCount}</strong> (${total > 0 ? ((tbCount / total) * 100).toFixed(1) : 0}%)</td>
      <td>Chưa đạt (&lt;5.0đ): <strong style="color: #b91c1c;">${yeuCount}</strong></td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35px;">STT</th>
        <th style="width: 160px;">Họ và tên thí sinh</th>
        <th style="width: 80px;">SBD</th>
        <th style="width: 55px;">Lớp</th>
        <th style="width: 65px;">Phần I<br/>(TN/3đ)</th>
        <th style="width: 65px;">Phần II<br/>(Đ-S/4đ)</th>
        <th style="width: 65px;">Phần III<br/>(TL/3đ)</th>
        <th style="width: 75px;">Tổng điểm<br/>(10.0)</th>
        <th style="width: 75px;">Xếp loại</th>
        <th style="width: 50px;">Vi phạm</th>
        <th>Ghi chú & Nhận xét chấm tự luận</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <table class="signatures-table">
    <tr>
      <td>
        <div class="font-bold uppercase">NGƯỜI LẬP BẢNG</div>
        <div class="italic" style="font-size: 9pt;">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </td>
      <td>
        <div class="font-bold uppercase">GIÁO VIÊN CHẤM TỰ LUẬN</div>
        <div class="italic" style="font-size: 9pt;">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </td>
      <td>
        <div class="font-bold uppercase">TỔ TRƯỞNG CHUYÊN MÔN</div>
        <div class="italic" style="font-size: 9pt;">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </td>
      <td>
        <div class="italic" style="font-size: 9pt; margin-bottom: 2px;">Ngày ..... tháng ..... năm 202...</div>
        <div class="font-bold uppercase">HIỆU TRƯỞNG / PHÓ HIỆU TRƯỞNG</div>
        <div class="italic" style="font-size: 9pt;">(Ký, đóng dấu và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Exports submissions to CSV file with UTF-8 BOM encoding for Excel compatibility
 */
export function exportSubmissionsToCsv(examInfo: ExamInfo, submissions: ExamSubmission[]): void {
  const headers = [
    'STT',
    'Họ và tên',
    'Số báo danh',
    'Lớp',
    'Điểm Phần I (TN/3.0)',
    'Điểm Phần II (Đ-S/4.0)',
    'Điểm Phần III (TL/3.0)',
    'Tổng điểm (10.0)',
    'Xếp loại',
    'Thời gian nộp bài',
    'Thời lượng (giây)',
    'Số lần vi phạm',
    'Nhận xét tự luận Câu 17',
    'Nhận xét tự luận Câu 18',
  ];

  const rows = submissions.map((s, idx) => {
    const classification = getGradeClassification(s.totalScore);
    const q17Fb = (s.answers['q17']?.essayFeedback || '').replace(/"/g, '""');
    const q18Fb = (s.answers['q18']?.essayFeedback || '').replace(/"/g, '""');
    return [
      idx + 1,
      `"${s.studentName}"`,
      `"${s.studentId}"`,
      `"${s.studentClass}"`,
      s.scorePart1.toFixed(2),
      s.scorePart2.toFixed(2),
      s.scorePart3.toFixed(2),
      s.totalScore.toFixed(2),
      `"${classification.label}"`,
      `"${s.submittedAt}"`,
      s.durationSeconds,
      s.violationCount,
      `"${q17Fb}"`,
      `"${q18Fb}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = examInfo.title
    .replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  link.download = `Bang_Diem_${safeTitle}_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
