-- Database Schema for Customer/Account/Workplace/Terminal Management System (MySQL)

-- Customers table (base table for both individual and corporate)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_no VARCHAR(20) UNIQUE NOT NULL,
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('individual', 'corporate')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    title VARCHAR(200),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- Individual customer details
CREATE TABLE IF NOT EXISTS individual_customers (
    customer_id INT PRIMARY KEY,
    tc_kimlik_no CHAR(11) UNIQUE NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    birth_date DATE,
    birth_place VARCHAR(100),
    gender CHAR(1) CHECK (gender IN ('E', 'K')),
    education_level VARCHAR(50),
    marital_status VARCHAR(30),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Corporate customer details
CREATE TABLE IF NOT EXISTS corporate_customers (
    customer_id INT PRIMARY KEY,
    is_public BOOLEAN DEFAULT FALSE,
    tax_id_no VARCHAR(20),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    extension_no VARCHAR(10),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    account_name VARCHAR(200),
    currency_code VARCHAR(3) DEFAULT 'TRY',
    balance DECIMAL(18,2) DEFAULT 0,
    blocked_amount DECIMAL(18,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    iban VARCHAR(34),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Workplaces
CREATE TABLE IF NOT EXISTS workplaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workplace_no VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    name VARCHAR(200),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    partners TEXT,
    manager VARCHAR(200),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    tax_tc_no VARCHAR(20),
    workplace_type VARCHAR(20) DEFAULT 'normal' CHECK (workplace_type IN ('normal', 'virtual')),
    commission_rate DECIMAL(5,2) DEFAULT 0,
    block_day INT DEFAULT 0,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Terminals
CREATE TABLE IF NOT EXISTS terminals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    terminal_id VARCHAR(30) UNIQUE NOT NULL,
    workplace_id INT NOT NULL,
    registration_status SMALLINT DEFAULT 1 CHECK (registration_status IN (0, 1, 2)),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(150),
    usage_type VARCHAR(50),
    model_code VARCHAR(50),
    service_company VARCHAR(200),
    serial_no VARCHAR(100),
    closure_reason VARCHAR(200),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE
);

-- Operation logs
CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(30) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(100) DEFAULT 'system',
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_customers_customer_no ON customers(customer_no);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);
CREATE INDEX idx_workplaces_customer_id ON workplaces(customer_id);
CREATE INDEX idx_workplaces_deleted_at ON workplaces(deleted_at);
CREATE INDEX idx_terminals_workplace_id ON terminals(workplace_id);
CREATE INDEX idx_terminals_serial_no ON terminals(serial_no);
CREATE INDEX idx_terminals_deleted_at ON terminals(deleted_at);
CREATE INDEX idx_operation_logs_entity ON operation_logs(entity_type, entity_id);
CREATE INDEX idx_operation_logs_date ON operation_logs(changed_at);
