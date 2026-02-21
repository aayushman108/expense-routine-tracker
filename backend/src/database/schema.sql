
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    avatar JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- GROUPS
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- GROUP MEMBERS
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL, -- NULL means currently a member
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT unique_group_user UNIQUE (group_id, user_id)
);

-- EXPENSES
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NULL, -- NULL for personal expenses
    paid_by UUID NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- EXPENSE SPLITS
CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    split_percentage DECIMAL(5,2) NOT NULL CHECK (split_percentage >= 0 AND split_percentage <= 100),
    split_amount DECIMAL(12,2) NOT NULL CHECK (split_amount >= 0),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT unique_expense_user UNIQUE (expense_id, user_id)
);

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(100) NOT NULL, -- e.g. khalti, esewa, bank
    external_id VARCHAR(255),
    metadata JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- MONTHLY SETTLEMENTS
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    from_user UUID NOT NULL,
    to_user UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(10) DEFAULT 'pending', -- pending / paid
    proof_image JSONB, -- stores payment screenshot details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_user) REFERENCES users(id) ON DELETE RESTRICT
);

