-- Create tables for the Insurance Eligibility Verification System

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,

    -- Insurance information
    insurance_member_id VARCHAR(50),
    insurance_company_name VARCHAR(200),
    service_date DATE NOT NULL
);

-- Eligibility results
CREATE TABLE IF NOT EXISTS eligibility (
    eligibility_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    check_date_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active','Inactive','Unknown')),
    
    -- Coverage information
    deductible DECIMAL(10,2),
    deductible_met DECIMAL(10,2),
    copay DECIMAL(10,2),
    out_of_pocket_max DECIMAL(10,2),
    out_of_pocket_met DECIMAL(10,2),
    
    -- Error tracking
    errors JSONB DEFAULT '[]'::jsonb,
);

-- Add foreign key constraint between patients and eligibility tables
ALTER TABLE eligibility 
ADD CONSTRAINT fk_patient 
FOREIGN KEY (patient_id) 
REFERENCES patients(patient_id); -- ON DELETE CASCADE optional

-- Create indexes for optimal database performance: 4 TOTAL

-- Index on eligibility.patient_id - Optimizes:
-- Frequent looksups by patient_id
-- Queries like: SELECT * FROM eligibility WHERE patient_id = 'P123456'
CREATE INDEX IF NOT EXISTS idx_eligibility_patient_id ON eligibility(patient_id);

-- Index on eligibility.check_date_time and .patient_id - Optimizes:
-- Finding recent eligibility checks for reporting
-- Time-based queries: WHERE check_date_time BETWEEN '2024-01-01' AND '2024-12-31'
CREATE INDEX IF NOT EXISTS idx_eligibility_patient_date ON eligibility(patient_id, check_date_time DESC);

-- Index on eligibility.status - Optimizes:
-- Filtering by status
-- Status filtering: WHERE status = 'Active' or WHERE status IN ('Active', 'Inactive')
CREATE INDEX IF NOT EXISTS idx_eligibility_status ON eligibility(status);

-- Index on patients.insurance_member_id - Optimizes:
-- Patient lookups by insurance member ID: WHERE insurance_member_id = 'MBR001'
-- Insurance company integration queries
-- Duplicate member ID detection and validation
CREATE INDEX IF NOT EXISTS idx_patients_insurance_member ON patients(insurance_member_id);

-- Load sample data from CSV files

-- Import patients data from CSV
COPY patients
FROM '/data/patients.csv' DELIMITER ',' CSV HEADER;

-- Import eligibility data from CSV  
COPY eligibility
FROM '/data/eligibility.csv' DELIMITER ',' CSV HEADER;