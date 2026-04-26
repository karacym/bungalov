-- UTF-8 mojibake (Turkce): genelde WIN1254 yanlis okuma. Latin1 yetersiz kalabilir.
-- Latin1'e cevrilemeyen karakterde orijinal metin korunur.

CREATE OR REPLACE FUNCTION fix_mojibake_txt(t text)
RETURNS text
LANGUAGE plpgsql
STABLE AS $$
BEGIN
  IF t IS NULL OR length(t) = 0 THEN
    RETURN t;
  END IF;
  IF t !~ '[ÃÄ]' THEN
    RETURN t;
  END IF;
  RETURN convert_from(convert_to(t, 'WIN1254'), 'UTF8');
EXCEPTION WHEN others THEN
  RETURN t;
END;
$$;

BEGIN;

UPDATE "Bungalow"
SET
  title = fix_mojibake_txt(title),
  description = fix_mojibake_txt(description),
  location = fix_mojibake_txt(location)
WHERE title ~ '[ÃÄ]' OR description ~ '[ÃÄ]' OR location ~ '[ÃÄ]';

UPDATE "Room"
SET
  name = fix_mojibake_txt(name),
  description = fix_mojibake_txt(description)
WHERE name ~ '[ÃÄ]' OR description ~ '[ÃÄ]';

UPDATE "User"
SET name = fix_mojibake_txt(name)
WHERE name ~ '[ÃÄ]';

UPDATE "Translation"
SET
  "tr" = fix_mojibake_txt("tr"),
  "en" = fix_mojibake_txt("en"),
  "ar" = fix_mojibake_txt("ar")
WHERE "tr" ~ '[ÃÄ]' OR "en" ~ '[ÃÄ]' OR "ar" ~ '[ÃÄ]';

UPDATE "ContactMessage"
SET
  name = fix_mojibake_txt(name),
  message = fix_mojibake_txt(message)
WHERE name ~ '[ÃÄ]' OR message ~ '[ÃÄ]';

COMMIT;

DROP FUNCTION IF EXISTS fix_mojibake_txt(text);
