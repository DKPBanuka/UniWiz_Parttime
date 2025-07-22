-- Payments Table for Job Posting Payments
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'bank_transfer', 'e_wallet') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to jobs table
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_job_id (job_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Add payment columns to jobs table if they don't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL;

-- Add indexes for payment-related queries
ALTER TABLE jobs 
ADD INDEX IF NOT EXISTS idx_payment_status (payment_status),
ADD INDEX IF NOT EXISTS idx_payment_amount (payment_amount); 