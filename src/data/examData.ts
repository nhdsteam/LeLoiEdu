import {
  CognitiveLevel,
  ExamInfo,
  ExamMatrixItem,
  ExamSubmission,
  Question,
  TopicId,
  TopicInfo,
} from '../types';

export const TOPICS: Record<TopicId, TopicInfo> = {
  topic_1: {
    id: 'topic_1',
    code: 'CĐ1',
    name: 'Máy tính và cộng đồng',
    unit: 'Bài 1: Thế giới kĩ thuật số',
  },
  topic_2: {
    id: 'topic_2',
    code: 'CĐ2',
    name: 'Tổ chức lưu trữ, tìm kiếm thông tin',
    unit: 'Bài 2, 3: Thông tin trong giải quyết vấn đề',
  },
  topic_3: {
    id: 'topic_3',
    code: 'CĐ3',
    name: 'Đạo đức, pháp luật & văn hóa số',
    unit: 'Bài 4: Một số vấn đề pháp lí về sử dụng dịch vụ Internet',
  },
  topic_4: {
    id: 'topic_4',
    code: 'CĐ4',
    name: 'Ứng dụng tin học',
    unit: 'Bài 5: Tìm hiểu phần mềm mô phỏng',
  },
};

export const DEFAULT_EXAM_INFO: ExamInfo = {
  id: 'tin-hoc-9-gk1-2026',
  title: 'ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ I',
  subject: 'TIN HỌC',
  grade: 'Lớp 9',
  curriculum: 'Kết nối tri thức với cuộc sống',
  school: 'TRƯỜNG THCS & THPT LÊ LỢI',
  department: 'TỔ TIN HỌC - CÔNG NGHỆ',
  academicYear: 'Năm học: 2026 - 2027',
  durationMinutes: 45,
  totalScore: 10.0,
  documentRef: 'Căn cứ theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024',
};

export const EXAM_MATRIX: ExamMatrixItem[] = [
  {
    topicId: 'topic_1',
    topicName: 'Chủ đề 1: Máy tính và cộng đồng',
    unit: 'Thế giới kĩ thuật số',
    mcq: { biet: 2, hieu: 1, vanDung: 0 },
    tf: { biet: 1, hieu: 0, vanDung: 0 },
    essay: { biet: 0, hieu: 0, vanDung: 0 },
    totalQuestions: 4,
    totalScore: 1.75,
  },
  {
    topicId: 'topic_2',
    topicName: 'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm...',
    unit: 'Thông tin trong giải quyết vấn đề',
    mcq: { biet: 2, hieu: 1, vanDung: 0 },
    tf: { biet: 0, hieu: 1, vanDung: 0 },
    essay: { biet: 0, hieu: 0, vanDung: 1 },
    totalQuestions: 5,
    totalScore: 3.75,
  },
  {
    topicId: 'topic_3',
    topicName: 'Chủ đề 3: Đạo đức, pháp luật...',
    unit: 'Một số vấn đề pháp lí về sử dụng dịch vụ Internet',
    mcq: { biet: 2, hieu: 1, vanDung: 0 },
    tf: { biet: 1, hieu: 0, vanDung: 0 },
    essay: { biet: 0, hieu: 1, vanDung: 0 },
    totalQuestions: 5,
    totalScore: 2.75,
  },
  {
    topicId: 'topic_4',
    topicName: 'Chủ đề 4: Ứng dụng tin học',
    unit: 'Tìm hiểu phần mềm mô phỏng',
    mcq: { biet: 2, hieu: 1, vanDung: 0 },
    tf: { biet: 0, hieu: 1, vanDung: 0 },
    essay: { biet: 0, hieu: 0, vanDung: 0 },
    totalQuestions: 4,
    totalScore: 1.75,
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 câu x 0.25đ = 3.0 điểm)
  {
    id: 'q1',
    number: 1,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_1',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content: 'Thiết bị nào sau đây KHÔNG có gắn bộ xử lí thông tin (bộ não)?',
    options: [
      { key: 'A', text: 'Ti vi kĩ thuật số.' },
      { key: 'B', text: 'Tủ lạnh thông minh.' },
      { key: 'C', text: 'Kính lúp cầm tay.' },
      { key: 'D', text: 'Đồng hồ thông minh (Smartwatch).' },
    ],
    correctAnswer: 'C',
    explanation:
      'Kính lúp cầm tay là một dụng cụ quang học thông thường, không chứa linh kiện điện tử hay vi xử lý thông tin.',
  },
  {
    id: 'q2',
    number: 2,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_1',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content:
      'Việc ứng dụng máy tính và Internet trong giáo dục đã mang lại thay đổi tích cực nào nổi bật nhất?',
    options: [
      { key: 'A', text: 'Máy tính học thay con người, học sinh không cần đến trường.' },
      {
        key: 'B',
        text: 'Cung cấp kho học liệu khổng lồ, cho phép học tập từ xa mọi lúc, mọi nơi.',
      },
      { key: 'C', text: 'Làm mất đi hoàn toàn vai trò của giáo viên giảng dạy.' },
      { key: 'D', text: 'Tiêu thụ nhiều điện năng nhưng giảm hiệu quả học tập.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Internet và máy tính mở ra nguồn tri thức mở không giới hạn, hỗ trợ học tập trực tuyến linh hoạt, vượt qua rào cản thời gian và địa lý.',
  },
  {
    id: 'q3',
    number: 3,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_1',
    cognitiveLevel: 'hieu',
    maxScore: 0.25,
    content:
      'Hành vi nào sau đây cho thấy tác động tiêu cực của công nghệ kĩ thuật số đối với đời sống con người?',
    options: [
      { key: 'A', text: 'Sử dụng phần mềm quản lý công việc để tăng năng suất.' },
      { key: 'B', text: 'Thanh toán hóa đơn trực tuyến thay vì dùng tiền mặt.' },
      {
        key: 'C',
        text: 'Gây nghiện Internet, giảm giao tiếp trực tiếp với người thân và bạn bè.',
      },
      { key: 'D', text: 'Ứng dụng robot vào sản xuất nông nghiệp.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Lạm dụng thiết bị số dẫn đến lệ thuộc mạng xã hội, giảm tương tác xã hội ngoài đời thực và ảnh hưởng sức khỏe thể chất, tinh thần.',
  },
  {
    id: 'q4',
    number: 4,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_2',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content:
      'Để đánh giá chất lượng của một thông tin trên Internet, người ta thường dựa vào 4 tiêu chí cơ bản nào?',
    options: [
      { key: 'A', text: 'Tính mới, tính chính xác, tính đầy đủ, tính sử dụng được.' },
      { key: 'B', text: 'Tính hấp dẫn, tính giải trí, tính phổ biến, tính kinh tế.' },
      { key: 'C', text: 'Tính dài dòng, tính ngắn gọn, tính bảo mật, tính hình ảnh.' },
      { key: 'D', text: 'Tính thời sự, tính hài hước, tính đắt tiền, tính miễn phí.' },
    ],
    correctAnswer: 'A',
    explanation:
      '4 tiêu chí cốt lõi chuẩn đánh giá chất lượng thông tin theo SGK Tin học 9: Tính mới, Tính chính xác, Tính đầy đủ, và Tính sử dụng được.',
  },
  {
    id: 'q5',
    number: 5,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_2',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content: 'Tiêu chí "Tính mới" (tính cập nhật) của thông tin mang ý nghĩa gì?',
    options: [
      { key: 'A', text: 'Cho biết thông tin được trình bày bằng phông chữ và hình ảnh mới nhất.' },
      {
        key: 'B',
        text: 'Cho biết thông tin chưa bị lỗi thời, thời điểm công bố gần với thời điểm hiện tại.',
      },
      { key: 'C', text: 'Cho biết thông tin do một người rất trẻ tuổi tạo ra.' },
      { key: 'D', text: 'Cho biết thông tin chứa nhiều từ ngữ mới lạ, độc đáo.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Tính mới thể hiện tính thời sự, thời gian phát hành gần nhất và chưa bị thay thế bởi các quy định, dữ liệu mới.',
  },
  {
    id: 'q6',
    number: 6,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_2',
    cognitiveLevel: 'hieu',
    maxScore: 0.25,
    content:
      'Bạn An đang tìm hiểu quy chế tuyển sinh vào lớp 10 năm 2024 nhưng vô tình làm theo hướng dẫn của năm 2015. Thông tin An sử dụng đã thiếu đi tiêu chí nào?',
    options: [
      { key: 'A', text: 'Tính đầy đủ.' },
      { key: 'B', text: 'Tính sử dụng được.' },
      { key: 'C', text: 'Tính mới (tính cập nhật).' },
      { key: 'D', text: 'Tính chính xác.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Thông tin đã cũ (2015) nên không còn phù hợp để áp dụng cho kỳ thi năm 2024, do đó thiếu Tính sử dụng được và Tính mới.',
  },
  {
    id: 'q7',
    number: 7,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_3',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content: 'Hành vi nào sau đây là vi phạm pháp luật khi hoạt động trên không gian mạng?',
    options: [
      { key: 'A', text: 'Sử dụng phần mềm diệt virus có trả phí bản quyền.' },
      { key: 'B', text: 'Tìm kiếm tài liệu học tập trên máy tìm kiếm Google.' },
      {
        key: 'C',
        text: 'Làm lộ hình ảnh, thông tin cá nhân của người khác nhằm mục đích bôi nhọ mà không được phép.',
      },
      { key: 'D', text: 'Đăng tải bài thơ do chính mình sáng tác lên Facebook.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Phát tán hình ảnh riêng tư nhằm xúc phạm danh dự, nhân phẩm người khác là hành vi vi phạm nghiêm trọng Luật An ninh mạng và Bộ luật Dân sự.',
  },
  {
    id: 'q8',
    number: 8,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_3',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content:
      'Khi nhận được một đường link lạ qua Messenger với nội dung: "Bấm vào đây để nhận ngay iPhone 15 Pro Max miễn phí", cách xử lí an toàn nhất là gì?',
    options: [
      { key: 'A', text: 'Nhấp vào ngay để không bỏ lỡ cơ hội trúng thưởng.' },
      {
        key: 'B',
        text: 'Cảnh giác không nhấp vào, vì đây rất có thể là đường link lừa đảo nhằm đánh cắp tài khoản (phishing).',
      },
      { key: 'C', text: 'Chia sẻ đường link đó cho nhiều bạn bè cùng nhận.' },
      { key: 'D', text: 'Nhấp vào và điền đầy đủ thông tin cá nhân, tài khoản ngân hàng để nhận quà.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Đường link tặng quà giá trị cao bất thường thường là bẫy lừa đảo giả mạo (phishing) nhằm đánh cắp thông tin đăng nhập hoặc cài mã độc.',
  },
  {
    id: 'q9',
    number: 9,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_3',
    cognitiveLevel: 'hieu',
    maxScore: 0.25,
    content:
      'Luật nào của Nhà nước ta quy định chi tiết về hoạt động bảo vệ an ninh quốc gia và bảo đảm trật tự, an toàn xã hội trên không gian mạng?',
    options: [
      { key: 'A', text: 'Luật An ninh mạng (2018).' },
      { key: 'B', text: 'Luật Giao thông đường bộ.' },
      { key: 'C', text: 'Luật Bảo vệ Môi trường.' },
      { key: 'D', text: 'Luật Giáo dục.' },
    ],
    correctAnswer: 'A',
    explanation:
      'Luật An ninh mạng được Quốc hội Việt Nam ban hành năm 2018 và có hiệu lực từ ngày 01/01/2019.',
  },
  {
    id: 'q10',
    number: 10,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_4',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content: 'Phần mềm mô phỏng là gì?',
    options: [
      { key: 'A', text: 'Là phần mềm chỉ dùng để gõ văn bản và làm toán.' },
      { key: 'B', text: 'Là phần mềm quét và tiêu diệt virus máy tính.' },
      {
        key: 'C',
        text: 'Là phần mềm thể hiện trực quan sự vận động của một đối tượng, cho phép người dùng tương tác và quan sát kết quả.',
      },
      { key: 'D', text: 'Là một loại virus giả dạng phần mềm học tập.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Phần mềm mô phỏng (Simulation Software) tái tạo các quá trình, đối tượng thực tế trên máy tính để người dùng tương tác, thử nghiệm an toàn.',
  },
  {
    id: 'q11',
    number: 11,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_4',
    cognitiveLevel: 'biet',
    maxScore: 0.25,
    content:
      'Trang web PhET (phet.colorado.edu) nổi tiếng với việc cung cấp các phần mềm mô phỏng chủ yếu trong lĩnh vực nào?',
    options: [
      { key: 'A', text: 'Thiết kế thời trang và đồ họa 3D.' },
      { key: 'B', text: 'Khoa học (Vật lí, Hóa học, Sinh học) và Toán học.' },
      { key: 'C', text: 'Kế toán và Ngân hàng.' },
      { key: 'D', text: 'Chỉnh sửa hình ảnh và cắt ghép video.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Dự án PhET Interactive Simulations của Đại học Colorado Boulder cung cấp hàng trăm mô phỏng khoa học và toán học miễn phí toàn cầu.',
  },
  {
    id: 'q12',
    number: 12,
    part: 1,
    type: 'multiple_choice',
    topicId: 'topic_4',
    cognitiveLevel: 'hieu',
    maxScore: 0.25,
    content:
      'Lợi ích lớn nhất của việc sử dụng phần mềm mô phỏng thí nghiệm Hóa học (như phản ứng nổ) so với việc làm thí nghiệm thật trên lớp là gì?',
    options: [
      { key: 'A', text: 'Tốn nhiều hóa chất và ống nghiệm thật hơn.' },
      { key: 'B', text: 'Máy tính tự động biến thành hóa chất thật để ngửi mùi.' },
      {
        key: 'C',
        text: 'Đảm bảo an toàn tuyệt đối, loại bỏ nguy cơ cháy nổ, độc hại cho học sinh.',
      },
      { key: 'D', text: 'Phần mềm mô phỏng luôn cho kết quả sai lệch để học sinh tự tìm hiểu.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Mô phỏng giúp quan sát trực quan các phản ứng nguy hiểm mà không lo xảy ra tai nạn, không tốn hóa chất đắt tiền và bảo vệ môi trường.',
  },

  // PHẦN II: TRẮC NGHIỆM ĐÚNG SAI (4 câu x 1.0 điểm = 4.0 điểm)
  // Quy tắc tính điểm Bộ GD&ĐT: Đúng 1 ý = 0.1đ; Đúng 2 ý = 0.25đ; Đúng 3 ý = 0.5đ; Đúng 4 ý = 1.0đ
  {
    id: 'q13',
    number: 1,
    part: 2,
    type: 'true_false',
    topicId: 'topic_1',
    cognitiveLevel: 'biet',
    maxScore: 1.0,
    content:
      'Về sự phát triển của thiết bị thông minh và thế giới kỹ thuật số, các phát biểu sau đây đúng hay sai?',
    statements: [
      {
        id: 'a',
        text: 'Việc gắn bộ vi xử lý vào các thiết bị gia dụng (máy giặt, nồi cơm điện) giúp chúng có thêm nhiều tính năng thông minh và vận hành tự động.',
        correctAnswer: true,
      },
      {
        id: 'b',
        text: 'Nhờ máy tính, con người có thể mô phỏng dòng chảy của chất lỏng hoặc dự báo thời tiết với độ chính xác cao.',
        correctAnswer: true,
      },
      {
        id: 'c',
        text: 'Robot hút bụi thông minh không được coi là thiết bị có gắn bộ xử lý thông tin vì nó chỉ làm nhiệm vụ dọn dẹp.',
        correctAnswer: false,
      },
      {
        id: 'd',
        text: 'Rác thải điện tử từ các thiết bị số lỗi thời nếu không được xử lý đúng cách sẽ gây ô nhiễm môi trường nghiêm trọng.',
        correctAnswer: true,
      },
    ],
    explanation:
      'Ý a: Đúng (vi xử lý mang lại tính năng tự động); Ý b: Đúng (máy tính dự báo thời tiết); Ý c: Sai (robot hút bụi có cảm biến và bộ vi xử lý định vị bản đồ); Ý d: Đúng (rác điện tử chứa chì, thủy ngân độc hại).',
  },
  {
    id: 'q14',
    number: 2,
    part: 2,
    type: 'true_false',
    topicId: 'topic_2',
    cognitiveLevel: 'hieu',
    maxScore: 1.0,
    content:
      'Bạn Khoa đang tìm kiếm thông tin để làm bài thuyết trình về "Biến đổi khí hậu". Về đánh giá chất lượng thông tin, các phát biểu sau đây đúng hay sai?',
    statements: [
      {
        id: 'a',
        text: 'Nếu Khoa chỉ tìm định nghĩa biến đổi khí hậu là gì mà không tìm hiểu nguyên nhân, hậu quả và giải pháp thì thông tin thu được thiếu tính đầy đủ.',
        correctAnswer: false, // Theo bảng đáp án chính thức Trang 12: a: S
      },
      {
        id: 'b',
        text: 'Nguồn thông tin đáng tin cậy nhất về biến đổi khí hậu là bài viết trên trang blog cá nhân của một bạn học sinh cấp 1.',
        correctAnswer: false,
      },
      {
        id: 'c',
        text: 'Việc sử dụng thông tin không chính xác có thể dẫn đến việc đưa ra các quyết định sai lầm.',
        correctAnswer: true,
      },
      {
        id: 'd',
        text: 'Tiêu chí "tính sử dụng được" đòi hỏi thông tin tìm được phải phù hợp, liên quan trực tiếp đến vấn đề mà Khoa đang cần giải quyết.',
        correctAnswer: true,
      },
    ],
    explanation:
      'Barem Bộ GD: a) Sai; b) Sai (blog cá nhân học sinh cấp 1 không phải nguồn khoa học uy tín); c) Đúng; d) Đúng (tính sử dụng được gắn liền với mục đích cụ thể).',
  },
  {
    id: 'q15',
    number: 3,
    part: 2,
    type: 'true_false',
    topicId: 'topic_3',
    cognitiveLevel: 'biet',
    maxScore: 1.0,
    content:
      'Tham gia mạng xã hội và sử dụng Internet mang lại nhiều tiện ích nhưng cũng tiềm ẩn rủi ro. Các phát biểu sau đây đúng hay sai về hành vi trên mạng?',
    statements: [
      {
        id: 'a',
        text: 'Việc chia sẻ, phát trực tiếp (livestream) một vụ đánh nhau của học sinh trong trường lên Facebook là hành vi vi phạm đạo đức và pháp luật.',
        correctAnswer: true,
      },
      {
        id: 'b',
        text: 'Gửi email, tin nhắn quảng cáo liên tục đến một người mà họ không muốn nhận (thư rác, spam) là hành vi quấy nhiễu, gây phiền toái.',
        correctAnswer: true,
      },
      {
        id: 'c',
        text: 'Tự ý tải một phần mềm bẻ khóa (crack) từ các diễn đàn lạ là việc làm an toàn và được khuyến khích để tiết kiệm tiền.',
        correctAnswer: false,
      },
      {
        id: 'd',
        text: 'Khi thấy một bài đăng xuyên tạc lịch sử dân tộc, em nên bấm nút "Report" (Báo cáo vi phạm) thay vì chia sẻ bài viết đó.',
        correctAnswer: true,
      },
    ],
    explanation:
      'Ý a: Đúng (vi phạm quyền riêng tư và phát tán bạo lực); Ý b: Đúng (spam thư rác); Ý c: Sai (phần mềm crack vi phạm bản quyền và thường chứa mã độc/trojan); Ý d: Đúng (báo cáo vi phạm giúp môi trường mạng trong sạch).',
  },
  {
    id: 'q16',
    number: 4,
    part: 2,
    type: 'true_false',
    topicId: 'topic_4',
    cognitiveLevel: 'hieu',
    maxScore: 1.0,
    content:
      'Lớp 9A chuẩn bị học bài thực hành môn Vật lí về mạch điện. Cô giáo yêu cầu học sinh sử dụng phần mềm Crocodile Physics trên máy tính. Các phát biểu sau đúng hay sai?',
    statements: [
      {
        id: 'a',
        text: 'Crocodile Physics là một phần mềm mô phỏng giúp học sinh lắp ráp và quan sát sự hoạt động của mạch điện ảo trên máy tính.',
        correctAnswer: true,
      },
      {
        id: 'b',
        text: 'Việc sử dụng phần mềm mô phỏng giúp tiết kiệm chi phí mua sắm thiết bị thực tế (pin, bóng đèn, dây dẫn).',
        correctAnswer: true,
      },
      {
        id: 'c',
        text: 'Thực hành trên phần mềm mô phỏng dễ gây ra hiện tượng giật điện hoặc cháy nổ nguy hiểm cho học sinh y như thực tế.',
        correctAnswer: false,
      },
      {
        id: 'd',
        text: 'Phần mềm mô phỏng cho phép thực hành lặp đi lặp lại nhiều lần với các thông số khác nhau một cách dễ dàng.',
        correctAnswer: true,
      },
    ],
    explanation:
      'Ý a: Đúng; Ý b: Đúng; Ý c: Sai (mô phỏng trên máy tính hoàn toàn an toàn, không có dòng điện thật gây giật); Ý d: Đúng (dễ dàng thay đổi điện trở, hiệu điện thế nhiều lần).',
  },

  // PHẦN III: TỰ LUẬN (2 câu = 3.0 điểm)
  {
    id: 'q17',
    number: 1,
    part: 3,
    type: 'essay',
    topicId: 'topic_2',
    cognitiveLevel: 'van_dung',
    maxScore: 2.0,
    content: `Mẹ của Minh thường xuyên bị đau xương khớp. Hôm nay, Minh thấy mẹ lên mạng xã hội và định đặt mua một loại thuốc tên là "Linh Đan Cốt Khang" từ một tài khoản Facebook lạ có tên "Thần Y Trị Bách Bệnh". Bài quảng cáo cam kết "chữa dứt điểm trong 3 ngày", không ghi rõ địa chỉ nhà thuốc, không có giấy phép của Bộ Y tế, và yêu cầu phải chuyển tiền trước.

Dựa vào kiến thức về Chất lượng thông tin (4 tiêu chí: Tính mới, Tính chính xác, Tính đầy đủ, Tính sử dụng được), em hãy phân tích nguồn thông tin quảng cáo trên để chứng minh đây là thông tin không đáng tin cậy. Từ đó, đưa ra lời khuyên cho mẹ của Minh.`,
    rubric: [
      {
        id: 'r1_1',
        description: 'Phân tích Tính mới: Quảng cáo xuất hiện tràn lan, không phản ánh tiến bộ y khoa được thẩm định.',
        maxScore: 0.25,
      },
      {
        id: 'r1_2',
        description: 'Phân tích Tính chính xác: Rất kém; tài khoản ảo, cam kết phóng đại "3 ngày khỏi dứt điểm", không có kiểm chứng y tế.',
        maxScore: 0.25,
      },
      {
        id: 'r1_3',
        description: 'Phân tích Tính đầy đủ: Thiếu trầm trọng nguồn gốc, thành phần dược liệu, địa chỉ cơ sở, số đăng ký lưu hành của Bộ Y tế.',
        maxScore: 0.25,
      },
      {
        id: 'r1_4',
        description: 'Phân tích Tính sử dụng được: Không thể sử dụng, tiềm ẩn nguy cơ lừa đảo tài chính và nguy hại trực tiếp đến sức khỏe người bệnh.',
        maxScore: 0.25,
      },
      {
        id: 'r1_5',
        description: 'Lời khuyên 1: Khuyên mẹ tuyệt đối không mua loại thuốc này và không chuyển tiền trước vì dấu hiệu lừa đảo rõ ràng.',
        maxScore: 0.5,
      },
      {
        id: 'r1_6',
        description: 'Lời khuyên 2: Khuyên mẹ đến bệnh viện uy tín khám chuyên khoa, chỉ dùng thuốc theo đơn bác sĩ và tra cứu thông tin y tế trên website Bộ Y tế (.gov.vn).',
        maxScore: 0.5,
      },
    ],
    sampleAnswer: `1. Phân tích chất lượng thông tin theo 4 tiêu chí (1.0 điểm):
- Tính mới: Mặc dù quảng cáo mới xuất hiện liên tục nhưng không chứa đựng các phát minh khoa học hay thông tin y tế có giá trị thời sự được công nhận.
- Tính chính xác: Rất kém. Tên tài khoản ảo ("Thần Y Trị Bách Bệnh"), lời quảng cáo nói quá sự thật ("chữa dứt điểm bệnh xương khớp trong 3 ngày" - y học hiện đại không có cam kết phi thực tế như vậy), không có chứng nhận lâm sàng.
- Tính đầy đủ: Thiếu thông tin nghiêm trọng: không có địa chỉ nhà thuốc cụ thể, không rõ thành phần dược chất, không có số giấy phép công bố của Cục Quản lý Dược - Bộ Y tế.
- Tính sử dụng được: Thông tin hoàn toàn không sử dụng được, nếu tin theo sẽ bị lừa đảo mất tiền và dùng thuốc không rõ nguồn gốc có thể gây suy gan, suy thận nguy hiểm.

2. Lời khuyên cho mẹ của Minh (1.0 điểm):
- Thứ nhất: Tuyệt đối không đặt mua thuốc "Linh Đan Cốt Khang" và không chuyển tiền trước theo yêu cầu của trang Facebook lạ.
- Thứ hai: Khuyên mẹ nên đi khám tại các bệnh viện có chuyên khoa cơ xương khớp uy tín để được bác sĩ chẩn đoán và kê đơn điều trị an toàn. Nếu muốn tìm hiểu kiến thức y tế, chỉ nên tham khảo các cổng thông tin chính thống như Cổng TTĐT Bộ Y tế (moh.gov.vn) hoặc bệnh viện tuyến trung ương.`,
    explanation:
      'Áp dụng 4 tiêu chí chất lượng thông tin để nhận diện quảng cáo thuốc giả trên mạng xã hội và đưa ra phương án bảo vệ sức khỏe gia đình.',
  },
  {
    id: 'q18',
    number: 2,
    part: 3,
    type: 'essay',
    topicId: 'topic_3',
    cognitiveLevel: 'hieu',
    maxScore: 1.0,
    content: `Trong một buổi học nhóm trực tuyến, bạn A vô tình để lộ mật khẩu email của mình. Bạn B đã lén dùng mật khẩu đó đăng nhập vào tài khoản của A, lấy những bức ảnh dìm hàng (ảnh chụp lúc A đang ngủ gật) và gửi vào nhóm chat của lớp kèm theo những lời chế giễu, miệt thị. Bạn A cảm thấy rất xấu hổ và áp lực.

Theo em, hành vi của bạn B đã vi phạm những nguyên tắc pháp lý và đạo đức nào trên không gian mạng? Em hãy đưa ra 2 cách xử lý an toàn để giúp bạn A thoát khỏi tình trạng bị bắt nạt này.`,
    rubric: [
      {
        id: 'r2_1',
        description: 'Chỉ ra vi phạm pháp lý: Xâm phạm trái phép tài khoản thư điện tử cá nhân của người khác (vi phạm quyền bí mật đời tư, Luật An ninh mạng).',
        maxScore: 0.25,
      },
      {
        id: 'r2_2',
        description: 'Chỉ ra vi phạm đạo đức: Hành vi bắt nạt qua mạng (Cyberbullying), cố ý chế giễu, xúc phạm danh dự và bôi nhọ bạn học.',
        maxScore: 0.25,
      },
      {
        id: 'r2_3',
        description: 'Cách xử lý an toàn 1: Lập tức đổi mật khẩu email và kích hoạt xác thực 2 lớp (2FA) để bảo vệ tài khoản.',
        maxScore: 0.25,
      },
      {
        id: 'r2_4',
        description: 'Cách xử lý an toàn 2: Chụp lại màn hình tin nhắn làm bằng chứng, báo cáo ngay cho Giáo viên chủ nhiệm hoặc phụ huynh can thiệp, yêu cầu bạn B gỡ ảnh và xin lỗi.',
        maxScore: 0.25,
      },
    ],
    sampleAnswer: `a) Hành vi của bạn B vi phạm các nguyên tắc sau (0.5 điểm):
- Vi phạm pháp luật: Tự ý đăng nhập tài khoản email của A khi chưa được phép là hành vi xâm phạm bí mật đời tư cá nhân và an toàn thông tin mạng theo Luật An ninh mạng năm 2018.
- Vi phạm đạo đức mạng: Phát tán hình ảnh cá nhân nhằm mục đích chế giễu, miệt thị là hành vi bắt nạt qua mạng (Cyberbullying), thiếu tôn trọng bạn bè và vi phạm quy tắc ứng xử văn minh học đường.

b) 2 cách xử lý an toàn giúp bạn A (0.5 điểm):
1. Biện pháp kỹ thuật: Bạn A cần lập tức đăng nhập lại email, đổi mật khẩu mới có độ bảo mật cao, đồng thời bật tính năng xác thực 2 yếu tố (2FA) và đăng xuất khỏi tất cả các thiết bị lạ.
2. Biện pháp hỗ trợ: Chụp ảnh màn hình các tin nhắn miệt thị làm bằng chứng, sau đó mạnh dạn tâm sự và báo cáo sự việc cho Giáo viên chủ nhiệm, Đoàn đội hoặc phụ huynh để người lớn can thiệp, yêu cầu bạn B chấm dứt hành vi và công khai xin lỗi.`,
    explanation:
      'Nhận diện hành vi xâm phạm tài khoản, bắt nạt trực tuyến và kỹ năng bảo vệ an toàn danh tính số theo chương trình GDPT Tin học 9.',
  },
];

export const INITIAL_SUBMISSIONS: ExamSubmission[] = [
  {
    id: 'sub-01',
    studentId: 'HS0901',
    studentName: 'Nguyễn Hoàng Minh',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:41:20Z',
    durationSeconds: 2480,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'B' },
      q6: { questionId: 'q6', mcqAnswer: 'B' },
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'C' },
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'C' },
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: false, b: false, c: true, d: true },
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          '1. Phân tích 4 tiêu chí:\n- Tính mới: Quảng cáo chạy liên tục trên mạng xã hội nhưng không có công bố y khoa chính thức.\n- Tính chính xác: Rất kém, nói quá sự thật chữa dứt điểm trong 3 ngày, tài khoản ảo Thần Y.\n- Tính đầy đủ: Không có địa chỉ cụ thể của nhà thuốc, không có giấy phép Bộ Y tế.\n- Tính sử dụng được: Không thể sử dụng vì có nguy cơ lừa đảo tiền bạc và hại sức khỏe.\n2. Lời khuyên:\n- Khuyên mẹ tuyệt đối không mua loại thuốc này và không chuyển tiền trước.\n- Khuyên mẹ đến bệnh viện chuyên khoa để bác sĩ thăm khám và tra cứu thông tin y tế trên trang web Bộ Y tế.',
        essayScore: 2.0,
        essayFeedback: 'Bài làm xuất sắc, phân tích rõ ràng cả 4 tiêu chí và lời khuyên rất thiết thực.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'a) Vi phạm của bạn B: Bạn B xâm phạm tài khoản email cá nhân trái phép (vi phạm Luật An ninh mạng) và phát tán ảnh chế giễu bạn là hành vi bắt nạt qua mạng (vi phạm đạo đức).\nb) Cách xử lý cho bạn A:\n1. Đổi ngay mật khẩu email và bật xác thực 2 bước.\n2. Chụp màn hình bằng chứng và báo ngay cho Giáo viên chủ nhiệm để xử lý.',
        essayScore: 1.0,
        essayFeedback: 'Đầy đủ 2 ý vi phạm và 2 cách giải quyết an toàn, hợp lý.',
      },
    },
    scorePart1: 3.0,
    scorePart2: 4.0,
    scorePart3: 3.0,
    totalScore: 10.0,
    status: 'graded',
    antiCheatLogs: [],
    violationCount: 0,
  },
  {
    id: 'sub-02',
    studentId: 'HS0902',
    studentName: 'Trần Thị Mai Anh',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:39:10Z',
    durationSeconds: 2350,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'B' },
      q6: { questionId: 'q6', mcqAnswer: 'B' },
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'C' },
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'C' },
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: false, b: false, c: true, d: false }, // 3/4 ý -> 0.5đ
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          'Thông tin không đáng tin cậy vì không có giấy phép Bộ Y tế, địa chỉ không rõ ràng và cam kết 3 ngày là không có căn cứ y học. Khuyên mẹ không mua thuốc trên mạng mà hãy đi bệnh viện khám.',
        essayScore: 1.5,
        essayFeedback: 'Nêu đúng ý cơ bản nhưng cần phân tích tách biệt rõ 4 tiêu chí chất lượng thông tin hơn.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'Bạn B vi phạm quyền riêng tư và bắt nạt bạn bè. Bạn A nên đổi mật khẩu ngay và nhờ cô giáo chủ nhiệm can thiệp.',
        essayScore: 0.8,
        essayFeedback: 'Tốt, nêu đúng giải pháp.',
      },
    },
    scorePart1: 3.0,
    scorePart2: 3.5,
    scorePart3: 2.3,
    totalScore: 8.8,
    status: 'graded',
    antiCheatLogs: [],
    violationCount: 0,
  },
  {
    id: 'sub-03',
    studentId: 'HS0903',
    studentName: 'Lê Tuấn Kiệt',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:44:50Z',
    durationSeconds: 2690,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'A' }, // Sai
      q6: { questionId: 'q6', mcqAnswer: 'B' },
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'C' },
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'A' }, // Sai
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: true, c: true, d: true }, // 3/4 ý -> 0.5đ
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: false, b: false, c: true, d: true }, // 4/4 ý -> 1.0đ
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: true, d: true }, // 3/4 ý -> 0.5đ
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true }, // 4/4 ý -> 1.0đ
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          'Bài quảng cáo trên thiếu tính chính xác và không đầy đủ vì không ghi địa chỉ hay có kiểm duyệt của Bộ Y tế. Khuyên mẹ không nên mua thuốc này vì dễ bị lừa tiền.',
        essayScore: 1.25,
        essayFeedback: 'Cần bổ sung thêm tiêu chí Tính mới và Tính sử dụng được.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'Bạn B vi phạm pháp luật vì xâm nhập nick người khác. Bạn A cần đổi mật khẩu và báo phụ huynh.',
        essayScore: 0.75,
        essayFeedback: 'Khá, cần làm rõ thêm khía cạnh vi phạm đạo đức bắt nạt mạng.',
      },
    },
    scorePart1: 2.5,
    scorePart2: 3.0,
    scorePart3: 2.0,
    totalScore: 7.5,
    status: 'graded',
    antiCheatLogs: [
      {
        id: 'log-1',
        timestamp: '2026-09-17T08:15:22Z',
        type: 'tab_switch',
        message: 'Thí sinh chuyển sang tab khác trong 4 giây',
      },
    ],
    violationCount: 1,
  },
  {
    id: 'sub-04',
    studentId: 'HS0904',
    studentName: 'Vũ Thảo Linh',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:35:00Z',
    durationSeconds: 2100,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'B' },
      q6: { questionId: 'q6', mcqAnswer: 'B' },
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'C' },
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'C' },
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: false, b: false, c: true, d: true },
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          '1. Phân tích: Thông tin thuốc không chính xác vì quảng cáo quá mức 3 ngày là khỏi; không đầy đủ thông tin về thành phần nhà sản xuất; thông tin không thể sử dụng vì gây nguy hiểm sức khỏe; tính mới không có căn cứ.\n2. Lời khuyên: Mẹ tuyệt đối không chuyển tiền và nên đến cơ sở y tế uy tín để được bác sĩ tư vấn.',
        essayScore: 1.75,
        essayFeedback: 'Lập luận sắc bén, bám sát các tiêu chí chất lượng thông tin.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'Bạn B đã vi phạm quyền bí mật thông tin của bạn A và có hành vi bắt nạt qua mạng cyberbullying. Bạn A nên đổi mật khẩu ngay lập tức và chụp bằng chứng báo cáo cho giáo viên chủ nhiệm.',
        essayScore: 1.0,
        essayFeedback: 'Trả lời đúng trọng tâm và chính xác.',
      },
    },
    scorePart1: 3.0,
    scorePart2: 4.0,
    scorePart3: 2.75,
    totalScore: 9.75,
    status: 'graded',
    antiCheatLogs: [],
    violationCount: 0,
  },
  {
    id: 'sub-05',
    studentId: 'HS0905',
    studentName: 'Đặng Quốc Bảo',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:43:15Z',
    durationSeconds: 2595,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'B' },
      q6: { questionId: 'q6', mcqAnswer: 'C' }, // Khác đáp án barem
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'B' }, // Sai
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'C' },
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: false, c: false, d: true }, // 3/4 ý -> 0.5đ
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: true, b: false, c: true, d: true }, // 3/4 ý -> 0.5đ
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: false, d: true }, // 4/4 ý -> 1.0đ
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true }, // 4/4 ý -> 1.0đ
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          'Em khuyên mẹ không nên mua thuốc vì không có địa chỉ rõ ràng và thuốc không đáng tin cậy.',
        essayScore: 0.75,
        essayFeedback: 'Chưa phân tích đầy đủ các tiêu chí theo yêu cầu đề bài.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'Bạn B làm như vậy là sai. Bạn A cần đổi mật khẩu.',
        essayScore: 0.5,
        essayFeedback: 'Cần nêu rõ vi phạm pháp lý, đạo đức và bổ sung cách xử lý thứ hai.',
      },
    },
    scorePart1: 2.5,
    scorePart2: 3.0,
    scorePart3: 1.25,
    totalScore: 6.75,
    status: 'graded',
    antiCheatLogs: [
      {
        id: 'log-b1',
        timestamp: '2026-09-17T08:21:10Z',
        type: 'fullscreen_exit',
        message: 'Thí sinh thoát chế độ toàn màn hình',
      },
      {
        id: 'log-b2',
        timestamp: '2026-09-17T08:21:25Z',
        type: 'tab_switch',
        message: 'Thí sinh rời cửa sổ thi sang ứng dụng khác (15 giây)',
      },
    ],
    violationCount: 2,
  },
  {
    id: 'sub-06',
    studentId: 'HS0906',
    studentName: 'Hoàng Gia Huy',
    studentClass: '9A1',
    examId: 'tin-hoc-9-gk1-2026',
    startedAt: '2026-09-17T08:00:00Z',
    submittedAt: '2026-09-17T08:45:00Z',
    durationSeconds: 2700,
    answers: {
      q1: { questionId: 'q1', mcqAnswer: 'C' },
      q2: { questionId: 'q2', mcqAnswer: 'B' },
      q3: { questionId: 'q3', mcqAnswer: 'C' },
      q4: { questionId: 'q4', mcqAnswer: 'A' },
      q5: { questionId: 'q5', mcqAnswer: 'B' },
      q6: { questionId: 'q6', mcqAnswer: 'B' },
      q7: { questionId: 'q7', mcqAnswer: 'C' },
      q8: { questionId: 'q8', mcqAnswer: 'C' },
      q9: { questionId: 'q9', mcqAnswer: 'A' },
      q10: { questionId: 'q10', mcqAnswer: 'C' },
      q11: { questionId: 'q11', mcqAnswer: 'B' },
      q12: { questionId: 'q12', mcqAnswer: 'C' },
      q13: {
        questionId: 'q13',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q14: {
        questionId: 'q14',
        tfAnswers: { a: false, b: false, c: true, d: true },
      },
      q15: {
        questionId: 'q15',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q16: {
        questionId: 'q16',
        tfAnswers: { a: true, b: true, c: false, d: true },
      },
      q17: {
        questionId: 'q17',
        essayAnswer:
          'Bài viết phân tích theo 4 tiêu chí:\n- Tính mới: Không phản ánh tiến bộ y khoa đáng tin cậy.\n- Tính chính xác: Bịa đặt cam kết chữa dứt điểm 3 ngày, tài khoản nặc danh.\n- Tính đầy đủ: Thiếu giấy phép Bộ Y tế, nguồn gốc thành phần thuốc.\n- Tính sử dụng được: Mang rủi ro lừa đảo mất tiền và hại người.\nLời khuyên: Khuyên mẹ tuyệt đối không chuyển tiền và đưa mẹ đi khám bác sĩ.',
        essayScore: 1.75,
        essayFeedback: 'Lập luận đầy đủ, trình bày logic.',
      },
      q18: {
        questionId: 'q18',
        essayAnswer:
          'Vi phạm pháp lý vì truy cập tài khoản người khác khi không được phép; vi phạm đạo đức mạng vì bôi nhọ danh dự bạn bè. Cách xử lý: A đổi mật khẩu có bảo mật 2 lớp và báo cáo giáo viên chủ nhiệm xử lý kịp thời.',
        essayScore: 1.0,
        essayFeedback: 'Rất tốt.',
      },
    },
    scorePart1: 3.0,
    scorePart2: 4.0,
    scorePart3: 2.75,
    totalScore: 9.75,
    status: 'graded',
    antiCheatLogs: [],
    violationCount: 0,
  },
];
