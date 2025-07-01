-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Produce table
CREATE TABLE produce (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  variety TEXT,
  category TEXT NOT NULL CHECK (category IN ('Fruit', 'Vegetable', 'Herb', 'Legume')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Markets table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  country_codes TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specifications table
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produce_id UUID REFERENCES produce(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  effective_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produce_id, market_id, version)
);

-- Specification fields table
CREATE TABLE spec_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'General', 'Quality', 'Size', 'Maturity', 'Packaging', 
    'Post-Harvest', 'Cold Chain', 'Certification', 'Residue', 
    'Appearance', 'Traceability', 'Shelf Life'
  )),
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packaging table
CREATE TABLE packaging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  box_type TEXT NOT NULL,
  labeling TEXT[],
  materials TEXT[],
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'kg',
  dimensions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cold chain requirements table
CREATE TABLE cold_chain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  temperature_min NUMERIC,
  temperature_max NUMERIC,
  temperature_unit TEXT DEFAULT '°C',
  humidity_min NUMERIC,
  humidity_max NUMERIC,
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_specifications_produce_market ON specifications(produce_id, market_id);
CREATE INDEX idx_spec_fields_spec_id ON spec_fields(spec_id);
CREATE INDEX idx_certifications_spec_id ON certifications(spec_id); 