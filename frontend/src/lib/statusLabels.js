/**
 * Hàm helper để chuyển đổi các mã trạng thái thành tên hiển thị trong giao diện
 * Các giá trị lưu trong DB giữ nguyên (với dấu gạch dưới)
 */

// Trạng thái lớp học
const CLASS_STATUS_MAP = {
  'sap_mo': 'Sắp mở',
  'cho_gia_su_xac_nhan': 'Chờ gia sư xác nhận',
  'dang_hoc': 'Đang học',
  'gia_su_tu_choi': 'Gia sư từ chối',
  'da_duyet_truc_tiep': 'Đã duyệt trực tiếp',
  'da_huy': 'Đã hủy'
}

// Trạng thái đăng ký lớp
const REGISTRATION_STATUS_MAP = {
  'cho_duyet': 'Chờ duyệt',
  'da_duyet': 'Đã duyệt',
  'da_duyet_truc_tiep': 'Đã duyệt trực tiếp',
  'tu_choi': 'Từ chối',
  'da_huy': 'Đã hủy'
}

// Trạng thái yêu cầu
const REQUEST_STATUS_MAP = {
  'cho_duyet': 'Chờ duyệt',
  'da_chap_nhan': 'Đã chấp nhận',
  'tu_choi': 'Từ chối',
  'da_huy': 'Đã hủy'
}

// Trạng thái thanh toán
const PAYMENT_STATUS_MAP = {
  'chua_thanh_toan': 'Chưa thanh toán',
  'da_thanh_toan': 'Đã thanh toán',
  'thanh_toan_mot_phan': 'Thanh toán một phần'
}

// Trạng thái tài khoản
const ACCOUNT_STATUS_MAP = {
  'da_duyet': 'Đang hoạt động',
  'cho_duyet': 'Chờ duyệt',
  'khoa': 'Bị khóa'
}

/**
 * Lấy tên hiển thị cho trạng thái lớp học
 * @param {string} status - Mã trạng thái
 * @returns {string} - Tên hiển thị
 */
export function getClassStatusLabel(status) {
  return CLASS_STATUS_MAP[status] || status || 'Không xác định'
}

/**
 * Lấy tên hiển thị cho trạng thái đăng ký
 * @param {string} status - Mã trạng thái
 * @returns {string} - Tên hiển thị
 */
export function getRegistrationStatusLabel(status) {
  return REGISTRATION_STATUS_MAP[status] || status || 'Không xác định'
}

/**
 * Lấy tên hiển thị cho trạng thái yêu cầu
 * @param {string} status - Mã trạng thái
 * @returns {string} - Tên hiển thị
 */
export function getRequestStatusLabel(status) {
  return REQUEST_STATUS_MAP[status] || status || 'Không xác định'
}

/**
 * Lấy tên hiển thị cho trạng thái thanh toán
 * @param {string} status - Mã trạng thái
 * @returns {string} - Tên hiển thị
 */
export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_MAP[status] || status || 'Không xác định'
}

/**
 * Lấy tên hiển thị cho trạng thái tài khoản
 * @param {string} status - Mã trạng thái
 * @returns {string} - Tên hiển thị
 */
export function getAccountStatusLabel(status) {
  return ACCOUNT_STATUS_MAP[status] || status || 'Không xác định'
}

/**
 * Lấy class CSS badge cho trạng thái
 * @param {string} status - Mã trạng thái
 * @returns {string} - Class CSS
 */
export function getStatusBadgeClass(status) {
  const statusBadges = {
    // Trạng thái lớp học
    'sap_mo': 'bg-yellow-100 text-yellow-800',
    'cho_gia_su_xac_nhan': 'bg-blue-100 text-blue-800',
    'dang_hoc': 'bg-green-100 text-green-800',
    'gia_su_tu_choi': 'bg-red-100 text-red-800',
    'da_duyet_truc_tiep': 'bg-purple-100 text-purple-800',
    'da_huy': 'bg-gray-100 text-gray-800',
    
    // Trạng thái đăng ký
    'cho_duyet': 'bg-yellow-100 text-yellow-800',
    'da_duyet': 'bg-green-100 text-green-800',
    'tu_choi': 'bg-red-100 text-red-800',
    
    // Trạng thái thanh toán
    'chua_thanh_toan': 'bg-red-100 text-red-800',
    'da_thanh_toan': 'bg-green-100 text-green-800',
    'thanh_toan_mot_phan': 'bg-yellow-100 text-yellow-800',
    
    // Trạng thái tài khoản
    'khoa': 'bg-gray-200 text-gray-800'
  }
  return statusBadges[status] || 'bg-gray-100 text-gray-700'
}
