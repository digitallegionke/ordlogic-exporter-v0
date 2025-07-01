-- Sample data for Export Crop Specifications Management System

-- Produce
INSERT INTO produce (id, name, variety, category, image_url) VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Avocado', 'Hass', 'Fruit', 'https://example.com/avocado.jpg'),
  ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'French Beans', 'Fine Beans', 'Vegetable', 'https://example.com/french-beans.jpg');

-- Markets
INSERT INTO markets (id, name, country_codes) VALUES
  ('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'European Union', ARRAY['DE', 'FR', 'NL', 'BE', 'ES', 'IT']),
  ('d4e5f6a7-b8c9-0123-4567-890abcdef123', 'Netherlands', ARRAY['NL']);

-- Specifications
INSERT INTO specifications (id, produce_id, market_id, title, version, effective_date, is_active, status) VALUES
  ('e5f6a7b8-c9d0-1234-5678-90abcdef1234', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Avocado Hass EU Export Standards', '1.2', '2024-01-01', TRUE, 'approved'),
  ('f6a7b8c9-d0e1-2345-6789-0abcdef12345', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'd4e5f6a7-b8c9-0123-4567-890abcdef123', 'French Beans Netherlands Export Standards', '1.1', '2024-03-15', TRUE, 'approved');

-- Spec Fields
INSERT INTO spec_fields (id, spec_id, label, value, unit, category, is_required) VALUES
  (gen_random_uuid(), 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', 'Dry Matter', '≥ 24%', '%', 'Maturity', TRUE),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', 'Weight Range', '150g – 300g', 'g', 'Size', TRUE),
  (gen_random_uuid(), 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', 'Length', '12–15cm', 'cm', 'Size', TRUE),
  (gen_random_uuid(), 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', 'Defect Tolerance', 'Max 2%', '%', 'Quality', TRUE);

-- Certifications
INSERT INTO certifications (id, spec_id, name, is_required) VALUES
  (gen_random_uuid(), 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', 'GlobalG.A.P.', TRUE),
  (gen_random_uuid(), 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', 'KEPHIS', TRUE);

-- Packaging
INSERT INTO packaging (id, spec_id, box_type, labeling, materials, weight, weight_unit) VALUES
  (gen_random_uuid(), 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', '4kg ventilated carton', ARRAY['Variety', 'origin', 'batch code'], ARRAY['Cardboard', 'Ventilation holes'], 4, 'kg'),
  (gen_random_uuid(), 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', '250g packs, 5kg cartons', ARRAY['Variety', 'farm', 'date of pack'], ARRAY['Plastic', 'Cardboard'], 5, 'kg');

-- Cold Chain
INSERT INTO cold_chain (id, spec_id, temperature_min, temperature_max, temperature_unit, requirements) VALUES
  (gen_random_uuid(), 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', 5, 7, '°C', ARRAY['Rapid cooling after harvest', 'Maintain temperature during transport']),
  (gen_random_uuid(), 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', NULL, 7, '°C', ARRAY['Morning harvest', 'Cooled within 4 hrs', 'Pre-cooled containers']); 