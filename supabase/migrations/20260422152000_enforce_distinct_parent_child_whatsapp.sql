-- Enforce distinct parent/child WhatsApp numbers for StudyPulse.
-- Product rule: parent updates and child check-ins must use separate numbers.

CREATE OR REPLACE FUNCTION public.sq_normalize_phone(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN raw IS NULL THEN ''
    ELSE RIGHT(regexp_replace(raw, '[^0-9]', '', 'g'), 8)
  END;
$$;

CREATE OR REPLACE FUNCTION public.sq_enforce_distinct_parent_child_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  parent_phone text;
  parent_norm text;
  child_norm text;
  has_match boolean;
BEGIN
  IF TG_TABLE_NAME = 'sq_children' THEN
    child_norm := public.sq_normalize_phone(NEW.whatsapp_number);
    IF child_norm = '' THEN
      RETURN NEW;
    END IF;

    SELECT m.parent_phone
      INTO parent_phone
      FROM public.sq_memberships m
      WHERE m.user_id = NEW.parent_id
      LIMIT 1;

    parent_norm := public.sq_normalize_phone(parent_phone);
    IF parent_norm <> '' AND parent_norm = child_norm THEN
      RAISE EXCEPTION 'Parent and child WhatsApp numbers must be different.';
    END IF;

    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'sq_memberships' THEN
    parent_norm := public.sq_normalize_phone(NEW.parent_phone);
    IF parent_norm = '' THEN
      RETURN NEW;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM public.sq_children c
      WHERE c.parent_id = NEW.user_id
        AND public.sq_normalize_phone(c.whatsapp_number) = parent_norm
    ) INTO has_match;

    IF has_match THEN
      RAISE EXCEPTION 'Parent and child WhatsApp numbers must be different.';
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sq_children'
  ) THEN
    DROP TRIGGER IF EXISTS trg_sq_children_distinct_whatsapp ON public.sq_children;
    CREATE TRIGGER trg_sq_children_distinct_whatsapp
      BEFORE INSERT OR UPDATE OF whatsapp_number, parent_id
      ON public.sq_children
      FOR EACH ROW
      EXECUTE FUNCTION public.sq_enforce_distinct_parent_child_whatsapp();
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sq_memberships'
  ) THEN
    DROP TRIGGER IF EXISTS trg_sq_memberships_distinct_whatsapp ON public.sq_memberships;
    CREATE TRIGGER trg_sq_memberships_distinct_whatsapp
      BEFORE INSERT OR UPDATE OF parent_phone, user_id
      ON public.sq_memberships
      FOR EACH ROW
      EXECUTE FUNCTION public.sq_enforce_distinct_parent_child_whatsapp();
  END IF;
END $$;
