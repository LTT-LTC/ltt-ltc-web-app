export interface SeatType {
  id: number;
  name: string;
  description: string;
  priceMultiplier: number;
  /** Optional hex fill `#RRGGBB` from administration API or layout snapshot */
  seatColor?: string;
  // How many grid cells this seat type takes in the seat map editor
  seatOccupied: number;
  // Visual orientation rules for the seat type editor
  orientation: "horizontal" | "vertical" | "square";
  createdAt: string;
  updatedAt: string;
}

export const mockSeatTypes: SeatType[] = [
  {
    id: 1,
    name: "Standard",
    description: "Ghế tiêu chuẩn, thoải mái với đệm êm",
    priceMultiplier: 1.0,
    seatColor: "#3B82F6",
    seatOccupied: 1,
    orientation: "square",
    createdAt: "2026-01-15 08:00",
    updatedAt: "2026-01-15 08:00",
  },
  {
    id: 2,
    name: "VIP",
    description: "Ghế VIP với không gian rộng rãi, có tay vịn nâng",
    priceMultiplier: 1.5,
    seatColor: "#F59E0B",
    seatOccupied: 1,
    orientation: "square",
    createdAt: "2026-01-15 08:00",
    updatedAt: "2026-02-10 10:30",
  },
  {
    id: 3,
    name: "Sweetbox",
    description: "Ghế đôi dành cho cặp đôi, có bàn nhỏ phía trước",
    priceMultiplier: 2.0,
    seatColor: "#EC4899",
    seatOccupied: 2,
    orientation: "horizontal",
    createdAt: "2026-01-15 08:00",
    updatedAt: "2026-03-01 14:00",
  },
  {
    id: 4,
    name: "Premium",
    description: "Ghế cao cấp với chế độ ngả lưng, có gối và chăn",
    priceMultiplier: 2.5,
    seatColor: "#A855F7",
    seatOccupied: 1,
    orientation: "square",
    createdAt: "2026-02-01 09:00",
    updatedAt: "2026-03-15 16:00",
  },
  {
    id: 5,
    name: "Economy",
    description: "Ghế phổ thông, giá ưu đãi",
    priceMultiplier: 0.8,
    seatColor: "#22C55E",
    seatOccupied: 1,
    orientation: "square",
    createdAt: "2026-03-01 09:00",
    updatedAt: "2026-03-01 09:00",
  },
];

export interface SeatLayoutSeat {
  seatCode: string;
  x: number;
  y: number;
  seatTypeId: number;
  seatTypeName?: string;
  /** Snapshot hex from seat type when layout was saved (`#RRGGBB`) */
  seatColor?: string;
  seatPriceMultiplier?: number;
  seatOccupied?: number;
  seatDisplayDirection?: "horizontal" | "vertical" | "square";
  type?: "seat" | "walkway" | "emergency_exit" | "door" | "empty";
}

export interface SeatLayoutRow {
  row: string;
  seats: SeatLayoutSeat[];
}

export interface SeatLayout {
  rows: SeatLayoutRow[];
}

export interface Screen {
  id: string;
  tenantId: string;
  cinemaId: string;
  seatMapId?: string;
  name?: string;
  description?: string;
  screenNumber: number;
  screenType: string;
  seatLayout: SeatLayout;
  seatCount: number;
  createdAt: string;
  updatedAt: string;
}

export const mockScreens: Screen[] = [
  {
    id: "scr-1", tenantId: "tenant-001", cinemaId: "1", screenNumber: 1, screenType: "Standard", seatCount: 120,
    seatLayout: { rows: [
      { row: "A", seats: Array.from({ length: 10 }, (_, i) => ({ seatCode: `A${i + 1}`, x: i * 40, y: 0, seatTypeId: 1 })) },
      { row: "B", seats: Array.from({ length: 10 }, (_, i) => ({ seatCode: `B${i + 1}`, x: i * 40, y: 40, seatTypeId: 1 })) },
      { row: "C", seats: Array.from({ length: 10 }, (_, i) => ({ seatCode: `C${i + 1}`, x: i * 40, y: 80, seatTypeId: 1 })) },
    ]},
    createdAt: "2026-01-20 10:00", updatedAt: "2026-01-20 10:00",
  },
  {
    id: "scr-2", tenantId: "tenant-001", cinemaId: "1", screenNumber: 2, screenType: "4DX", seatCount: 80,
    seatLayout: { rows: [
      { row: "A", seats: Array.from({ length: 8 }, (_, i) => ({ seatCode: `A${i + 1}`, x: i * 40, y: 0, seatTypeId: 2 })) },
      { row: "B", seats: Array.from({ length: 8 }, (_, i) => ({ seatCode: `B${i + 1}`, x: i * 40, y: 40, seatTypeId: 2 })) },
    ]},
    createdAt: "2026-02-01 10:00", updatedAt: "2026-02-01 10:00",
  },
  {
    id: "scr-3", tenantId: "tenant-001", cinemaId: "3", screenNumber: 1, screenType: "IMAX", seatCount: 200,
    seatLayout: { rows: [
      { row: "A", seats: Array.from({ length: 12 }, (_, i) => ({ seatCode: `A${i + 1}`, x: i * 40, y: 0, seatTypeId: 1 })) },
    ]},
    createdAt: "2026-03-01 10:00", updatedAt: "2026-03-10 12:00",
  },
];

export const screenTypes = ["Standard", "4DX", "IMAX", "Screen-X", "Gold Class", "Dolby Atmos"];

// ─── Cinema Configuration ───
export interface AdminCinema {
  id: string;
  tenantId: string;
  name: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  screenCount: number;
  status: "active" | "maintenance" | "closed";
  createdAt: string;
  updatedAt: string;
}

export const mockAdminCinemas: AdminCinema[] = [
  { id: "1", tenantId: "tenant-001", name: "LTC Vincom Hải Phòng", province: "Hải Phòng", address: "Tầng 5, TTTM Vincom Plaza Hải Phòng", phone: "0225-123-4567", email: "vincomhp@ltc.vn", screenCount: 6, status: "active", createdAt: "2025-06-01 08:00", updatedAt: "2026-03-15 10:00" },
  { id: "2", tenantId: "tenant-001", name: "LTC Aeon Mall Hải Phòng", province: "Hải Phòng", address: "Tầng 3, Aeon Mall Lê Chân", phone: "0225-234-5678", email: "aeonhp@ltc.vn", screenCount: 8, status: "active", createdAt: "2025-08-15 08:00", updatedAt: "2026-02-20 14:00" },
  { id: "3", tenantId: "tenant-001", name: "LTC Landmark 81", province: "Hồ Chí Minh", address: "Tầng B1, Landmark 81, Bình Thạnh", phone: "028-123-4567", email: "landmark@ltc.vn", screenCount: 10, status: "active", createdAt: "2025-03-01 08:00", updatedAt: "2026-04-01 09:00" },
  { id: "4", tenantId: "tenant-001", name: "LTC Royal City", province: "Hà Nội", address: "Tầng B2, Royal City, Thanh Xuân", phone: "024-345-6789", email: "royalcity@ltc.vn", screenCount: 7, status: "maintenance", createdAt: "2025-05-10 08:00", updatedAt: "2026-03-28 16:00" },
  { id: "5", tenantId: "tenant-001", name: "LTC Indochina Đà Nẵng", province: "Đà Nẵng", address: "Tầng 4, Indochina Riverside Mall", phone: "0236-456-7890", email: "indochina@ltc.vn", screenCount: 5, status: "active", createdAt: "2025-09-01 08:00", updatedAt: "2026-01-15 11:00" },
];

// ─── Movies & Showtimes ───
export interface AdminMovie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  ageRating: string;
  director: string;
  cast: string;
  releaseDate: string;
  endDate: string;
  status: "now_showing" | "coming_soon" | "ended";
  posterUrl: string;
  trailerUrl: string;
  createdAt: string;
}

export const mockAdminMovies: AdminMovie[] = [
  { id: "1", title: "STRAY KIDS: DOMINATE", genre: "Âm nhạc", duration: 120, ageRating: "T13", director: "Park Ji-hoon", cast: "Stray Kids", releaseDate: "2026-03-06", endDate: "2026-04-30", status: "now_showing", posterUrl: "", trailerUrl: "", createdAt: "2026-01-15" },
  { id: "2", title: "PHIM SUPER MARIO THIÊN HÀ", genre: "Hoạt hình", duration: 95, ageRating: "P", director: "Aaron Horvath", cast: "Chris Pratt, Anya Taylor-Joy", releaseDate: "2026-03-28", endDate: "2026-05-15", status: "now_showing", posterUrl: "", trailerUrl: "", createdAt: "2026-02-01" },
  { id: "3", title: "HẸN EM NGÀY NHẬT THỰC", genre: "Tình cảm", duration: 110, ageRating: "T16", director: "Nguyễn Quang Dũng", cast: "Trấn Thành, Nhã Phương", releaseDate: "2026-03-27", endDate: "2026-05-10", status: "now_showing", posterUrl: "", trailerUrl: "", createdAt: "2026-02-10" },
  { id: "4", title: "THUNDERBOLTS*", genre: "Hành động", duration: 130, ageRating: "T13", director: "Jake Schreier", cast: "Florence Pugh, Sebastian Stan", releaseDate: "2026-05-01", endDate: "2026-06-30", status: "coming_soon", posterUrl: "", trailerUrl: "", createdAt: "2026-03-01" },
  { id: "5", title: "LILO & STITCH", genre: "Hoạt hình", duration: 100, ageRating: "P", director: "Dean Fleischer Camp", cast: "Maia Kealoha", releaseDate: "2026-05-23", endDate: "2026-07-15", status: "coming_soon", posterUrl: "", trailerUrl: "", createdAt: "2026-03-15" },
];

// ─── Showtime Scheduler ───
export interface AdminShowtime {
  id: string;
  movieId: string;
  movieTitle: string;
  cinemaId: string;
  cinemaName: string;
  screenNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  format: string;
  basePrice: number;
  status: "scheduled" | "cancelled" | "completed";
}

export const mockAdminShowtimes: AdminShowtime[] = [
  { id: "st-1", movieId: "1", movieTitle: "STRAY KIDS: DOMINATE", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", screenNumber: 1, date: "2026-04-07", startTime: "10:00", endTime: "12:00", format: "2D Phụ Đề Việt", basePrice: 105000, status: "scheduled" },
  { id: "st-2", movieId: "1", movieTitle: "STRAY KIDS: DOMINATE", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", screenNumber: 2, date: "2026-04-07", startTime: "13:30", endTime: "15:30", format: "2D Phụ Đề Anh", basePrice: 105000, status: "scheduled" },
  { id: "st-3", movieId: "3", movieTitle: "HẸN EM NGÀY NHẬT THỰC", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", screenNumber: 1, date: "2026-04-07", startTime: "15:00", endTime: "16:50", format: "2D Phụ Đề Anh", basePrice: 105000, status: "scheduled" },
  { id: "st-4", movieId: "2", movieTitle: "PHIM SUPER MARIO THIÊN HÀ", cinemaId: "3", cinemaName: "LTC Landmark 81", screenNumber: 1, date: "2026-04-07", startTime: "10:00", endTime: "11:35", format: "2D Lồng Tiếng Việt", basePrice: 125000, status: "scheduled" },
  { id: "st-5", movieId: "3", movieTitle: "HẸN EM NGÀY NHẬT THỰC", cinemaId: "3", cinemaName: "LTC Landmark 81", screenNumber: 1, date: "2026-04-07", startTime: "14:00", endTime: "15:50", format: "2D Phụ Đề Anh", basePrice: 125000, status: "completed" },
  { id: "st-6", movieId: "1", movieTitle: "STRAY KIDS: DOMINATE", cinemaId: "3", cinemaName: "LTC Landmark 81", screenNumber: 1, date: "2026-04-08", startTime: "19:00", endTime: "21:00", format: "IMAX 2D", basePrice: 180000, status: "scheduled" },
];

// ─── Staff & RBAC ───
export interface StaffMember {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  cinemaId: string;
  cinemaName: string;
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastLogin: string;
}

export const staffRoles = ["Super Admin", "Cinema Manager", "Box Office", "Concession Staff", "Projectionist", "Usher", "Accountant"];

export const mockStaff: StaffMember[] = [
  { id: "s-1", fullname: "Dương Thành Long", email: "long@ltc.vn", phone: "0901000001", role: "Super Admin", cinemaId: "all", cinemaName: "Tất cả", status: "active", joinedAt: "2025-01-01", lastLogin: "2026-04-07 08:30" },
  { id: "s-2", fullname: "Nguyễn Minh Tuấn", email: "tuan@ltc.vn", phone: "0901000002", role: "Cinema Manager", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", status: "active", joinedAt: "2025-03-15", lastLogin: "2026-04-06 17:00" },
  { id: "s-3", fullname: "Trần Thị Mai", email: "mai@ltc.vn", phone: "0901000003", role: "Box Office", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", status: "active", joinedAt: "2025-06-01", lastLogin: "2026-04-07 09:15" },
  { id: "s-4", fullname: "Lê Văn Hùng", email: "hung@ltc.vn", phone: "0901000004", role: "Cinema Manager", cinemaId: "3", cinemaName: "LTC Landmark 81", status: "active", joinedAt: "2025-04-10", lastLogin: "2026-04-07 07:45" },
  { id: "s-5", fullname: "Phạm Hương Giang", email: "giang@ltc.vn", phone: "0901000005", role: "Concession Staff", cinemaId: "3", cinemaName: "LTC Landmark 81", status: "inactive", joinedAt: "2025-09-01", lastLogin: "2026-03-20 12:00" },
  { id: "s-6", fullname: "Hoàng Đức Anh", email: "anh@ltc.vn", phone: "0901000006", role: "Accountant", cinemaId: "all", cinemaName: "Tất cả", status: "active", joinedAt: "2025-02-15", lastLogin: "2026-04-06 16:30" },
];

// ─── F&B / Concessions ───
export interface FnBItem {
  id: string;
  name: string;
  category: "popcorn" | "drink" | "combo" | "snack" | "other";
  price: number;
  cost: number;
  description: string;
  imageUrl: string;
  status: "available" | "out_of_stock" | "discontinued";
  createdAt: string;
  updatedAt: string;
}

export const fnbCategories = ["popcorn", "drink", "combo", "snack", "other"] as const;

export const mockFnBItems: FnBItem[] = [
  { id: "f-1", name: "Bắp rang bơ (L)", category: "popcorn", price: 59000, cost: 12000, description: "Bắp rang bơ size lớn", imageUrl: "", status: "available", createdAt: "2025-06-01", updatedAt: "2026-03-01" },
  { id: "f-2", name: "Bắp rang phô mai (M)", category: "popcorn", price: 49000, cost: 10000, description: "Bắp rang phô mai size trung", imageUrl: "", status: "available", createdAt: "2025-06-01", updatedAt: "2026-03-01" },
  { id: "f-3", name: "Coca-Cola (L)", category: "drink", price: 35000, cost: 8000, description: "Coca-Cola size lớn", imageUrl: "", status: "available", createdAt: "2025-06-01", updatedAt: "2026-01-15" },
  { id: "f-4", name: "Pepsi (M)", category: "drink", price: 29000, cost: 7000, description: "Pepsi size trung", imageUrl: "", status: "available", createdAt: "2025-06-01", updatedAt: "2026-01-15" },
  { id: "f-5", name: "Combo Couple", category: "combo", price: 129000, cost: 30000, description: "2 Bắp L + 2 Nước L", imageUrl: "", status: "available", createdAt: "2025-08-01", updatedAt: "2026-02-10" },
  { id: "f-6", name: "Combo Family", category: "combo", price: 189000, cost: 45000, description: "2 Bắp L + 4 Nước L + 1 Snack", imageUrl: "", status: "available", createdAt: "2025-08-01", updatedAt: "2026-02-10" },
  { id: "f-7", name: "Nachos Phô Mai", category: "snack", price: 45000, cost: 10000, description: "Nachos với sốt phô mai", imageUrl: "", status: "out_of_stock", createdAt: "2025-10-01", updatedAt: "2026-03-20" },
  { id: "f-8", name: "Hotdog", category: "snack", price: 39000, cost: 8000, description: "Hotdog xúc xích Đức", imageUrl: "", status: "available", createdAt: "2025-10-01", updatedAt: "2026-03-01" },
];

// ─── Promotions & Gift Cards ───
export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "gift_card";
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "draft";
  applicableTo: string;
  createdAt: string;
}

export const mockPromotions: Promotion[] = [
  { id: "p-1", name: "Flash Sale Thứ 4", code: "FLASH04", type: "percentage", value: 20, minOrderValue: 100000, maxDiscount: 50000, usageLimit: 500, usedCount: 312, startDate: "2026-01-01", endDate: "2026-12-31", status: "active", applicableTo: "Vé phim", createdAt: "2025-12-15" },
  { id: "p-2", name: "Giảm 30K đơn đầu", code: "NEWUSER30K", type: "fixed", value: 30000, minOrderValue: 80000, maxDiscount: 30000, usageLimit: 1000, usedCount: 876, startDate: "2026-01-01", endDate: "2026-06-30", status: "active", applicableTo: "Tất cả", createdAt: "2025-12-20" },
  { id: "p-3", name: "Mua 2 tặng 1 bắp", code: "BUY2GET1", type: "buy_x_get_y", value: 0, minOrderValue: 0, maxDiscount: 59000, usageLimit: 200, usedCount: 145, startDate: "2026-03-01", endDate: "2026-04-30", status: "active", applicableTo: "F&B", createdAt: "2026-02-20" },
  { id: "p-4", name: "Gift Card 200K", code: "GIFT200K", type: "gift_card", value: 200000, minOrderValue: 0, maxDiscount: 200000, usageLimit: 100, usedCount: 45, startDate: "2026-01-01", endDate: "2027-01-01", status: "active", applicableTo: "Tất cả", createdAt: "2025-12-01" },
  { id: "p-5", name: "Tết Sale 2026", code: "TET2026", type: "percentage", value: 15, minOrderValue: 150000, maxDiscount: 40000, usageLimit: 300, usedCount: 300, startDate: "2026-01-25", endDate: "2026-02-10", status: "expired", applicableTo: "Vé phim", createdAt: "2026-01-10" },
];

// ─── CRM & Incidents ───
export interface Incident {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: "complaint" | "feedback" | "inquiry" | "technical" | "refund_request";
  subject: string;
  description: string;
  cinemaId: string;
  cinemaName: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export const mockIncidents: Incident[] = [
  { id: "INC-001", customerName: "Nguyễn Văn An", customerEmail: "an@gmail.com", customerPhone: "0901234567", type: "complaint", subject: "Ghế bị hỏng tại phòng 3", description: "Ghế D5 phòng 3 bị gãy tay vịn, gây khó chịu khi xem phim.", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", priority: "high", status: "in_progress", assignedTo: "Nguyễn Minh Tuấn", createdAt: "2026-04-05 14:30", updatedAt: "2026-04-06 09:00" },
  { id: "INC-002", customerName: "Trần Thị Bích", customerEmail: "bich@gmail.com", customerPhone: "0912345678", type: "refund_request", subject: "Yêu cầu hoàn tiền vé", description: "Suất chiếu 19:00 ngày 04/04 bị hủy đột xuất, yêu cầu hoàn tiền 2 vé.", cinemaId: "3", cinemaName: "LTC Landmark 81", priority: "urgent", status: "open", assignedTo: "", createdAt: "2026-04-05 20:15", updatedAt: "2026-04-05 20:15" },
  { id: "INC-003", customerName: "Lê Hoàng Nam", customerEmail: "nam@gmail.com", customerPhone: "0923456789", type: "feedback", subject: "Khen ngợi dịch vụ", description: "Nhân viên rất nhiệt tình, phòng chiếu IMAX rất tuyệt!", cinemaId: "3", cinemaName: "LTC Landmark 81", priority: "low", status: "closed", assignedTo: "Lê Văn Hùng", createdAt: "2026-04-03 11:00", updatedAt: "2026-04-04 08:00" },
  { id: "INC-004", customerName: "Phạm Minh Đức", customerEmail: "duc@gmail.com", customerPhone: "0934567890", type: "technical", subject: "Lỗi hệ thống đặt vé online", description: "Không thể thanh toán bằng MoMo từ 10:00 sáng nay.", cinemaId: "all", cinemaName: "Hệ thống", priority: "high", status: "in_progress", assignedTo: "Dương Thành Long", createdAt: "2026-04-06 10:30", updatedAt: "2026-04-06 15:00" },
  { id: "INC-005", customerName: "Vũ Thị Hoa", customerEmail: "hoa@gmail.com", customerPhone: "0945678901", type: "inquiry", subject: "Hỏi về chương trình khuyến mãi", description: "Muốn biết thêm chi tiết chương trình Flash Sale Thứ 4.", cinemaId: "1", cinemaName: "LTC Vincom Hải Phòng", priority: "low", status: "resolved", assignedTo: "Trần Thị Mai", createdAt: "2026-04-04 09:00", updatedAt: "2026-04-04 10:30" },
];

// ─── Refund Approval ───
export interface RefundRequest {
  id: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  movieTitle: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  ticketCount: number;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt: string;
  processedBy: string;
}

export const mockRefunds: RefundRequest[] = [
  { id: "RF-001", transactionId: "TH-010", customerName: "Trần Thị Bích", customerEmail: "bich@gmail.com", amount: 250000, reason: "Suất chiếu bị hủy đột xuất", movieTitle: "STRAY KIDS: DOMINATE", cinemaName: "LTC Landmark 81", showDate: "2026-04-04", showTime: "19:00", ticketCount: 2, status: "pending", requestedAt: "2026-04-05 20:15", processedAt: "", processedBy: "" },
  { id: "RF-002", transactionId: "TH-008", customerName: "Nguyễn Thành Đạt", customerEmail: "dat@gmail.com", amount: 105000, reason: "Đặt nhầm suất chiếu", movieTitle: "HẸN EM NGÀY NHẬT THỰC", cinemaName: "LTC Vincom Hải Phòng", showDate: "2026-04-03", showTime: "14:00", ticketCount: 1, status: "pending", requestedAt: "2026-04-03 10:00", processedAt: "", processedBy: "" },
  { id: "RF-003", transactionId: "TH-005", customerName: "Lê Minh Quân", customerEmail: "quan@gmail.com", amount: 320000, reason: "Lỗi kỹ thuật – phim bị dừng giữa chừng", movieTitle: "PHIM SUPER MARIO THIÊN HÀ", cinemaName: "LTC Aeon Mall Hải Phòng", showDate: "2026-03-30", showTime: "15:00", ticketCount: 2, status: "approved", requestedAt: "2026-03-30 17:00", processedAt: "2026-03-31 09:00", processedBy: "Dương Thành Long" },
  { id: "RF-004", transactionId: "TH-003", customerName: "Hoàng Văn Sơn", customerEmail: "son@gmail.com", amount: 80000, reason: "Không hài lòng với chất lượng phim", movieTitle: "HẸN EM NGÀY NHẬT THỰC", cinemaName: "LTC Royal City", showDate: "2026-03-28", showTime: "20:30", ticketCount: 1, status: "rejected", requestedAt: "2026-03-29 08:00", processedAt: "2026-03-29 14:00", processedBy: "Nguyễn Minh Tuấn" },
];

// ─── Revenue Reports ───
export interface RevenueData {
  date: string;
  ticketRevenue: number;
  fnbRevenue: number;
  totalRevenue: number;
  ticketsSold: number;
  occupancyRate: number;
}

export const mockRevenueData: RevenueData[] = [
  { date: "2026-04-01", ticketRevenue: 15200000, fnbRevenue: 4800000, totalRevenue: 20000000, ticketsSold: 145, occupancyRate: 72 },
  { date: "2026-04-02", ticketRevenue: 12800000, fnbRevenue: 3900000, totalRevenue: 16700000, ticketsSold: 122, occupancyRate: 61 },
  { date: "2026-04-03", ticketRevenue: 18500000, fnbRevenue: 5600000, totalRevenue: 24100000, ticketsSold: 178, occupancyRate: 85 },
  { date: "2026-04-04", ticketRevenue: 21000000, fnbRevenue: 6200000, totalRevenue: 27200000, ticketsSold: 201, occupancyRate: 92 },
  { date: "2026-04-05", ticketRevenue: 22500000, fnbRevenue: 7100000, totalRevenue: 29600000, ticketsSold: 215, occupancyRate: 95 },
  { date: "2026-04-06", ticketRevenue: 24000000, fnbRevenue: 7800000, totalRevenue: 31800000, ticketsSold: 230, occupancyRate: 98 },
  { date: "2026-04-07", ticketRevenue: 19800000, fnbRevenue: 5500000, totalRevenue: 25300000, ticketsSold: 190, occupancyRate: 88 },
];
