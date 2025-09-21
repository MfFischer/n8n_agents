-- MediLocal AI Database Initialization
-- PostgreSQL database setup for German clinic automation

-- Create database if not exists
-- (This is handled by Docker environment variables)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS medical;
CREATE SCHEMA IF NOT EXISTS automation;
CREATE SCHEMA IF NOT EXISTS audit;

-- Patients table
CREATE TABLE IF NOT EXISTS medical.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    egk_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    address JSONB,
    phone VARCHAR(20),
    email VARCHAR(100),
    insurance_type VARCHAR(20) DEFAULT 'GKV',
    insurance_number VARCHAR(50),
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS medical.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES medical.patients(id),
    doctor_id VARCHAR(50) NOT NULL,
    appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50) NOT NULL, -- 'notfall', 'akut', 'routine', 'nachsorge'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
    symptoms TEXT,
    patient_request TEXT,
    ai_classification JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS medical.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES medical.appointments(id),
    patient_id UUID REFERENCES medical.patients(id),
    doctor_id VARCHAR(50) NOT NULL,
    consultation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    chief_complaint TEXT,
    symptoms TEXT,
    vital_signs JSONB,
    examination_findings TEXT,
    diagnosis TEXT,
    icd10_codes TEXT[],
    treatment_plan TEXT,
    medications JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    soap_note TEXT,
    ai_generated_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions (eRezept) table
CREATE TABLE IF NOT EXISTS medical.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id VARCHAR(50) UNIQUE NOT NULL,
    consultation_id UUID REFERENCES medical.consultations(id),
    patient_id UUID REFERENCES medical.patients(id),
    doctor_id VARCHAR(50) NOT NULL,
    egk_number VARCHAR(20),
    medications JSONB NOT NULL,
    prescription_type VARCHAR(20) DEFAULT 'Standard', -- 'Standard', 'BTM', 'T-Rezept'
    insurance_type VARCHAR(10) DEFAULT 'GKV',
    aut_idem BOOLEAN DEFAULT TRUE,
    transmission_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'transmitted', 'dispensed', 'cancelled'
    ti_transmission_id VARCHAR(100),
    prescription_code VARCHAR(20),
    pharmacy_id VARCHAR(50),
    dispensed_at TIMESTAMP WITH TIME ZONE,
    ai_analysis JSONB,
    safety_checks JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation workflows table
CREATE TABLE IF NOT EXISTS automation.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL, -- 'medical_chat', 'appointments', 'erezept', 'documentation'
    n8n_workflow_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error'
    configuration JSONB,
    execution_count INTEGER DEFAULT 0,
    last_execution TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation executions table
CREATE TABLE IF NOT EXISTS automation.executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES automation.workflows(id),
    execution_id VARCHAR(100),
    trigger_type VARCHAR(50),
    input_data JSONB,
    output_data JSONB,
    execution_status VARCHAR(20), -- 'success', 'error', 'running', 'cancelled'
    execution_time_ms INTEGER,
    error_message TEXT,
    ai_confidence DECIMAL(3,2),
    human_review_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50),
    user_type VARCHAR(20), -- 'doctor', 'nurse', 'admin', 'ai_system'
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI decisions audit table
CREATE TABLE IF NOT EXISTS audit.ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_type VARCHAR(50) NOT NULL,
    execution_id UUID REFERENCES automation.executions(id),
    patient_id UUID REFERENCES medical.patients(id),
    ai_model VARCHAR(50),
    input_prompt TEXT,
    ai_response TEXT,
    confidence_score DECIMAL(3,2),
    human_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    compliance_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_egk ON medical.patients(egk_number);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON medical.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON medical.appointments(appointment_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON medical.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON medical.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON medical.consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON medical.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON medical.prescriptions(transmission_status);
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON automation.executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON automation.executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_patient ON audit.ai_decisions(patient_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON medical.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON medical.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON medical.consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON medical.prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON automation.workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial workflow configurations
INSERT INTO automation.workflows (workflow_name, workflow_type, n8n_workflow_id, configuration) VALUES
('Medical AI Chat - Optimized', 'medical_chat', 'medical-ai-chat', '{"model": "llama3.2:latest", "temperature": 0.2, "max_tokens": 1024}'),
('Intelligent Appointment System', 'appointments', 'smart-scheduling', '{"classification_model": "llama3.2:1b", "auto_booking": true}'),
('German eRezept Automation', 'erezept', 'erezept-automation', '{"ti_integration": true, "safety_checks": true}'),
('Automated Clinical Documentation', 'documentation', 'auto-documentation', '{"soap_generation": true, "billing_codes": true}')
ON CONFLICT DO NOTHING;

-- Create sample data (for testing)
INSERT INTO medical.patients (patient_id, egk_number, first_name, last_name, date_of_birth, gender, insurance_type) VALUES
('PAT001', '80276001234567890', 'Max', 'Mustermann', '1980-05-15', 'male', 'GKV'),
('PAT002', '80276001234567891', 'Anna', 'Schmidt', '1975-08-22', 'female', 'GKV'),
('PAT003', '80276001234567892', 'Hans', 'Weber', '1965-12-10', 'male', 'PKV')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA medical TO medilocal;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA automation TO medilocal;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO medilocal;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA medical TO medilocal;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA automation TO medilocal;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO medilocal;
