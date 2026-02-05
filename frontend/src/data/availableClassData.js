export const options = [
  {
    name: "giasu",
    label: "Yêu cầu",
    values: [
      "Sinh viên",
      "Giáo viên đứng lớp",
      "Giáo viên tự do",
      "Giáo viên trung tâm",
      "Gia sư",
    ],
  },
  {
    name: "monhoc",
    label: "Nhóm môn",
    values: ["Toán", "Văn", "Anh", "Lý", "Hóa", "Sinh"],
  },
  {
    name: "tinhthanh",
    label: "Tỉnh thành",
    values: ["Hà Nội", "TP. Hồ Chí Minh", "Dạy Online", "Kèm tại nhà"],
  },
  {
    name: "gioitinh",
    label: "Giới tính",
    values: ["Nam", "Nữ"],
  },
];
export const classList = [
  {
    code: "HA2505",
    requirement: {
      role: "Giáo viên tự do",
      gender: "Nữ",
    },
    subject: "Tiếng Anh",
    grade: "Lớp 10",
    location: {
      address: "đường số 3",
      ward: "P.9",
      district: "Q. Gò Vấp",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "1h30",
      availableTime: [
        { day: "Thứ 2", time: "19:00 - 20:30" },
        { day: "Thứ 4", time: "19:00 - 20:30" },
      ],
    },
    fee: "250k/buổi",
    student: {
      quantity: 1,
      gender: "Nữ",
    },
    note: "",
  },

  {
    code: "HM2512",
    requirement: {
      role: "Sinh viên",
      gender: "Không yêu cầu",
    },
    subject: "Toán",
    grade: "Lớp 8",
    location: {
      address: "Nguyễn Văn Cừ",
      ward: "P.4",
      district: "Q.5",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 3,
      durationPerSession: "1h30",
      availableTime: [
        { day: "Thứ 3", time: "18:00 - 19:30" },
        { day: "Thứ 5", time: "18:00 - 19:30" },
        { day: "Thứ 7", time: "08:00 - 09:30" },
      ],
    },
    fee: "180k/buổi",
    student: {
      quantity: 1,
      gender: "Nam",
    },
    note: "Học sinh hơi yếu Toán, cần gia sư kiên nhẫn",
  },

  {
    code: "HP2498",
    requirement: {
      role: "Giáo viên đứng lớp",
      gender: "Nam",
    },
    subject: "Piano",
    grade: "Cơ bản",
    location: {
      address: "Lê Văn Việt",
      ward: "P. Hiệp Phú",
      district: "TP. Thủ Đức",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "1h",
      availableTime: [
        { day: "Thứ 6", time: "19:00 - 20:00" },
        { day: "Chủ nhật", time: "15:00 - 16:00" },
      ],
    },
    fee: "300k/buổi",
    student: {
      quantity: 1,
      gender: "Nữ",
    },
    note: "Học sinh mới bắt đầu, cần giáo viên có đàn riêng",
  },

  {
    code: "HL2530",
    requirement: {
      role: "Gia sư",
      gender: "Không yêu cầu",
    },
    subject: "Vật Lý",
    grade: "Lớp 12",
    location: {
      address: "Phan Văn Trị",
      ward: "P.11",
      district: "Q. Bình Thạnh",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "2h",
      availableTime: [
        { day: "Thứ 2", time: "18:00 - 20:00" },
        { day: "Thứ 6", time: "18:00 - 20:00" },
      ],
    },
    fee: "220k/buổi",
    student: {
      quantity: 2,
      gender: "Nam + Nữ",
    },
    note: "Ôn luyện thi đại học",
  },
  {
    code: "HA2505",
    requirement: {
      role: "Giáo viên tự do",
      gender: "Nữ",
    },
    subject: "Tiếng Anh",
    grade: "Lớp 10",
    location: {
      address: "đường số 3",
      ward: "P.9",
      district: "Q. Gò Vấp",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "1h30",
      availableTime: [
        { day: "Thứ 2", time: "19:00 - 20:30" },
        { day: "Thứ 4", time: "19:00 - 20:30" },
      ],
    },
    fee: "250k/buổi",
    student: {
      quantity: 1,
      gender: "Nữ",
    },
    note: "",
  },

  {
    code: "HM2512",
    requirement: {
      role: "Sinh viên",
      gender: "Không yêu cầu",
    },
    subject: "Toán",
    grade: "Lớp 8",
    location: {
      address: "Nguyễn Văn Cừ",
      ward: "P.4",
      district: "Q.5",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 3,
      durationPerSession: "1h30",
      availableTime: [
        { day: "Thứ 3", time: "18:00 - 19:30" },
        { day: "Thứ 5", time: "18:00 - 19:30" },
        { day: "Thứ 7", time: "08:00 - 09:30" },
      ],
    },
    fee: "180k/buổi",
    student: {
      quantity: 1,
      gender: "Nam",
    },
    note: "Học sinh hơi yếu Toán, cần gia sư kiên nhẫn",
  },

  {
    code: "HP2498",
    requirement: {
      role: "Giáo viên đứng lớp",
      gender: "Nam",
    },
    subject: "Piano",
    grade: "Cơ bản",
    location: {
      address: "Lê Văn Việt",
      ward: "P. Hiệp Phú",
      district: "TP. Thủ Đức",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "1h",
      availableTime: [
        { day: "Thứ 6", time: "19:00 - 20:00" },
        { day: "Chủ nhật", time: "15:00 - 16:00" },
      ],
    },
    fee: "300k/buổi",
    student: {
      quantity: 1,
      gender: "Nữ",
    },
    note: "Học sinh mới bắt đầu, cần giáo viên có đàn riêng",
  },

  {
    code: "HL2530",
    requirement: {
      role: "Gia sư",
      gender: "Không yêu cầu",
    },
    subject: "Vật Lý",
    grade: "Lớp 12",
    location: {
      address: "Phan Văn Trị",
      ward: "P.11",
      district: "Q. Bình Thạnh",
      city: "TP. Hồ Chí Minh",
    },
    schedule: {
      sessionsPerWeek: 2,
      durationPerSession: "2h",
      availableTime: [
        { day: "Thứ 2", time: "18:00 - 20:00" },
        { day: "Thứ 6", time: "18:00 - 20:00" },
      ],
    },
    fee: "220k/buổi",
    student: {
      quantity: 2,
      gender: "Nam + Nữ",
    },
    note: "Ôn luyện thi đại học",
  },
];
