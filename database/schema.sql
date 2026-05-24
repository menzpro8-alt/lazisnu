-- ============================================
-- LAZISNU Financial Application Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS lazisnu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lazisnu_db;

-- ============================================
-- 1. Organizations (Struktur Hierarki LAZISNU)
-- ============================================
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level ENUM('PP', 'PW', 'PC', 'MWC', 'PR') NOT NULL COMMENT 'PP=Pusat, PW=Wilayah, PC=Cabang, MWC=Kecamatan, PR=Ranting',
    parent_id INT DEFAULT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 2. Users (Akun Pengguna)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 3. Donors (Donatur)
-- ============================================
CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    nik VARCHAR(20),
    notes TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 4. Beneficiaries (Penerima Manfaat)
-- ============================================
CREATE TABLE beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    nik VARCHAR(20),
    category VARCHAR(100) COMMENT 'Kategori penerima: fakir, miskin, yatim, dll',
    notes TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 5. Income Categories (Kategori Pemasukan)
-- ============================================
CREATE TABLE income_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 6. Expense Categories (Kategori Pengeluaran)
-- ============================================
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 7. Incomes (Pemasukan)
-- ============================================
CREATE TABLE incomes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    category_id INT NOT NULL,
    donor_id INT DEFAULT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_number VARCHAR(50),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES income_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- 8. Expenses (Pengeluaran)
-- ============================================
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    category_id INT NOT NULL,
    beneficiary_id INT DEFAULT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_number VARCHAR(50),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_org_parent ON organizations(parent_id);
CREATE INDEX idx_org_level ON organizations(level);
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_donors_org ON donors(org_id);
CREATE INDEX idx_beneficiaries_org ON beneficiaries(org_id);
CREATE INDEX idx_incomes_org ON incomes(org_id);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_incomes_category ON incomes(category_id);
CREATE INDEX idx_expenses_org ON expenses(org_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert root organization (PP LAZISNU)
INSERT INTO organizations (name, level, parent_id, address) VALUES 
('PP LAZISNU', 'PP', NULL, 'Jakarta Pusat'),
('PW LAZISNU Jawa Timur', 'PW', 1, 'Surabaya'),
('PW LAZISNU Jawa Tengah', 'PW', 1, 'Semarang'),
('PC LAZISNU Kota Surabaya', 'PC', 2, 'Surabaya'),
('PC LAZISNU Kabupaten Sidoarjo', 'PC', 2, 'Sidoarjo'),
('MWC LAZISNU Wonokromo', 'MWC', 4, 'Wonokromo, Surabaya'),
('PR LAZISNU Ngagel', 'PR', 6, 'Ngagel, Wonokromo, Surabaya');

-- Insert default admin user (password: admin123 for all seed users)
-- Note: You should change this password in production
INSERT INTO users (org_id, username, password, name, role) VALUES 
(1, 'admin', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Super Admin', 'admin');

INSERT INTO users (org_id, username, password, name, role) VALUES
(1, 'staff_pp', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PP', 'staff'),
(2, 'admin_pw_jatim', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin PW Jatim', 'admin'),
(2, 'staff_pw_jatim', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PW Jatim', 'staff'),
(3, 'admin_pw_jateng', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin PW Jateng', 'admin'),
(3, 'staff_pw_jateng', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PW Jateng', 'staff'),
(4, 'admin_pc_sby', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin PC Surabaya', 'admin'),
(4, 'staff_pc_sby', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PC Surabaya', 'staff'),
(5, 'admin_pc_sda', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin PC Sidoarjo', 'admin'),
(5, 'staff_pc_sda', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PC Sidoarjo', 'staff'),
(6, 'admin_mwc_wonokromo', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin MWC Wonokromo', 'admin'),
(6, 'staff_mwc_wonokromo', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff MWC Wonokromo', 'staff'),
(7, 'admin_pr_ngagel', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Admin PR Ngagel', 'admin'),
(7, 'staff_pr_ngagel', '$2y$12$MrtXXOmGzXA5zNrXYHRYc.nQAkD9X03LPcWMhM8CuZ/wOoJPDauh6', 'Staff PR Ngagel', 'staff');

-- Insert default income categories for PP
INSERT INTO income_categories (org_id, name, description) VALUES
(1, 'Zakat Mal', 'Zakat harta'),
(1, 'Zakat Fitrah', 'Zakat fitrah'),
(1, 'Infaq', 'Infaq umum'),
(1, 'Sedekah', 'Sedekah umum'),
(1, 'Donasi', 'Donasi dari donatur');

-- Insert default expense categories for PP
INSERT INTO expense_categories (org_id, name, description) VALUES
(1, 'Fakir', 'Bantuan untuk fakir'),
(1, 'Miskin', 'Bantuan untuk miskin'),
(1, 'Amil', 'Biaya operasional amil'),
(1, 'Muallaf', 'Bantuan untuk muallaf'),
(1, 'Gharimin', 'Bantuan untuk gharimin'),
(1, 'Fisabilillah', 'Bantuan fi sabilillah'),
(1, 'Ibnu Sabil', 'Bantuan untuk ibnu sabil'),
(1, 'Operasional', 'Biaya operasional kantor');

-- Income categories for PC Surabaya
INSERT INTO income_categories (org_id, name, description) VALUES
(4, 'Zakat Mal', 'Zakat harta'),
(4, 'Zakat Fitrah', 'Zakat fitrah'),
(4, 'Infaq', 'Infaq umum'),
(4, 'Sedekah', 'Sedekah umum');

-- Expense categories for PC Surabaya
INSERT INTO expense_categories (org_id, name, description) VALUES
(4, 'Fakir', 'Bantuan untuk fakir'),
(4, 'Miskin', 'Bantuan untuk miskin'),
(4, 'Amil', 'Biaya operasional amil'),
(4, 'Fisabilillah', 'Bantuan fi sabilillah'),
(4, 'Operasional', 'Biaya operasional kantor');

-- ============================================
-- SAMPLE DATA (donors, beneficiaries, transactions)
-- ============================================

INSERT INTO donors (org_id, name, phone, email, address, nik) VALUES
(1, 'H. Ahmad Fauzi', '081234567890', 'ahmad.fauzi@email.com', 'Jakarta Pusat', '3171010101010001'),
(1, 'Ibu Siti Nurhaliza', '081234567891', 'siti.nur@email.com', 'Jakarta Selatan', '3174010101010002'),
(1, 'PT Berkah Abadi Sejahtera', '02112345678', 'finance@berkahabadi.co.id', 'Jakarta Barat, Gedung Berkah Lt.5', NULL),
(4, 'H. Muhammad Ramdan', '081234567892', 'ramdan@email.com', 'Surabaya Pusat', '3578010101010003'),
(4, 'Bu Rahma Sulistyowati', '081234567893', 'rahma@email.com', 'Wonokromo, Surabaya', '3578020101010004');

INSERT INTO beneficiaries (org_id, name, phone, address, nik, category, notes) VALUES
(4, 'Keluarga Pak Budi Santoso', '085111111111', 'Jl. Raya Wonokromo No.10, Surabaya', '3578030101010005', 'fakir', 'Kepala keluarga tidak bisa bekerja, 3 anak'),
(4, 'Yayasan Anak Yatim Al-Falah', '085111111112', 'Jl. Karah No.25, Surabaya', NULL, 'yatim', 'Menampung 25 anak yatim'),
(4, 'Masjid Al-Ikhlas', '085111111113', 'Jl. Ngagel Jaya No.5, Surabaya', NULL, 'fisabilillah', 'Renovasi masjid'),
(6, 'Keluarga Bu Aminah', '085111111114', 'Jl. Simo Hilir No.8, Wonokromo', '3578040101010006', 'miskin', 'Janda dengan 2 anak'),
(6, 'Madrasah Diniyah Nurul Huda', '085111111115', 'Jl. Wonokromo Gang 3', NULL, 'fisabilillah', 'Bantuan operasional madrasah'),
(7, 'Keluarga Pak Joko', '085111111116', 'Ngagel RT 03 RW 05, Surabaya', '3578050101010007', 'miskin', 'Lansia tidak produktif');

INSERT INTO incomes (org_id, category_id, donor_id, amount, date, description, receipt_number, created_by)
VALUES
(1, 1, 1, 150000000, '2026-01-15', 'Zakat Mal H. Ahmad Fauzi', 'TRX/2026/001', 1),
(1, 1, 3, 50000000, '2026-02-10', 'Zakat Mal PT Berkah Abadi', 'TRX/2026/005', 1),
(1, 3, 2, 25000000, '2026-01-20', 'Infaq Ibu Siti Nurhaliza', 'TRX/2026/002', 1),
(1, 3, 1, 10000000, '2026-03-05', 'Infaq H. Ahmad Fauzi', 'TRX/2026/008', 1),
(1, 5, 3, 75000000, '2026-04-01', 'Donasi CSR PT Berkah Abadi', 'TRX/2026/011', 1),
(1, 1, 2, 35000000, '2026-05-10', 'Zakat Mal Ibu Siti Nurhaliza', 'TRX/2026/015', 1),
(4, 6, 4, 25000000, '2026-01-10', 'Zakat Mal H. Muhammad Ramdan', 'TRX/SBY/001', 7),
(4, 7, NULL, 12000000, '2026-01-25', 'Zakat Fitrah jamaah masjid', 'TRX/SBY/002', 7),
(4, 8, 5, 5000000, '2026-02-15', 'Infaq Bu Rahma', 'TRX/SBY/003', 7),
(4, 8, 4, 7500000, '2026-03-10', 'Infaq H. Muhammad Ramdan', 'TRX/SBY/005', 7),
(4, 9, NULL, 3000000, '2026-04-05', 'Sedekah jamaah pengajian', 'TRX/SBY/007', 7),
(4, 6, 5, 15000000, '2026-05-01', 'Zakat Mal Bu Rahma', 'TRX/SBY/008', 7);

INSERT INTO expenses (org_id, category_id, beneficiary_id, amount, date, description, receipt_number, created_by)
VALUES
(1, 1, NULL, 75000000, '2026-01-25', 'Distribusi bantuan fakir ke PW Jatim', 'EXP/2026/001', 1),
(1, 6, NULL, 40000000, '2026-02-05', 'Bantuan fisabilillah operasional masjid', 'EXP/2026/002', 1),
(1, 3, NULL, 25000000, '2026-02-15', 'Biaya operasional amil nasional', 'EXP/2026/003', 1),
(1, 2, NULL, 60000000, '2026-03-01', 'Distribusi bantuan miskin', 'EXP/2026/004', 1),
(1, 8, NULL, 15000000, '2026-03-20', 'Operasional kantor pusat', 'EXP/2026/005', 1),
(4, 9, 1, 5000000, '2026-01-20', 'Bantuan sembako keluarga Pak Budi', 'EXP/SBY/001', 7),
(4, 10, 2, 10000000, '2026-02-10', 'Santunan anak yatim Al-Falah', 'EXP/SBY/002', 7),
(4, 12, 3, 15000000, '2026-03-15', 'Bantuan renovasi Masjid Al-Ikhlas', 'EXP/SBY/003', 7),
(4, 11, NULL, 3000000, '2026-04-01', 'Biaya operasional amil', 'EXP/SBY/004', 7),
(4, 12, 4, 2000000, '2026-04-20', 'Bantuan Bu Aminah (MWC Wonokromo)', 'EXP/SBY/005', 7),
(4, 13, NULL, 5000000, '2026-05-05', 'Biaya operasional kantor cabang', 'EXP/SBY/006', 7);
