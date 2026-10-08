CREATE TYPE public.app_role AS ENUM ('super_admin','manager','designer','accountant','read_only');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','manager','designer','accountant'))
$$;

CREATE POLICY "staff read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admin delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "staff read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text,
  email text,
  company text,
  default_percentage numeric(6,3) NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read clients" ON public.clients FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "staff update clients" ON public.clients FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "admin delete clients" ON public.clients FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER clients_touch BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE SEQUENCE public.order_seq START 1001;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('DC-' || nextval('public.order_seq')),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  category text NOT NULL DEFAULT 'Ring',
  gold_weight numeric(12,3) NOT NULL DEFAULT 0,
  percentage numeric(6,3) NOT NULL DEFAULT 2,
  earning_gold numeric(12,3) NOT NULL DEFAULT 0,
  delivery_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Pending',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_seq TO authenticated, service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "staff update orders" ON public.orders FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.gold_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL DEFAULT current_date,
  transaction_type text NOT NULL,
  reference text,
  reference_id uuid,
  gold_added numeric(12,3) NOT NULL DEFAULT 0,
  gold_deducted numeric(12,3) NOT NULL DEFAULT 0,
  balance_after numeric(12,3) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gold_transactions TO authenticated;
GRANT ALL ON public.gold_transactions TO service_role;
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read gold" ON public.gold_transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert gold" ON public.gold_transactions FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "admin delete gold" ON public.gold_transactions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.casting_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casting_date date NOT NULL DEFAULT current_date,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reference text,
  gold_given numeric(12,3) NOT NULL DEFAULT 0,
  gold_returned numeric(12,3) NOT NULL DEFAULT 0,
  gold_loss numeric(12,3) NOT NULL DEFAULT 0,
  vendor text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.casting_records TO authenticated;
GRANT ALL ON public.casting_records TO service_role;
ALTER TABLE public.casting_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read casting" ON public.casting_records FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert casting" ON public.casting_records FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "staff update casting" ON public.casting_records FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "admin delete casting" ON public.casting_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT current_date,
  category text NOT NULL DEFAULT 'Other',
  vendor text,
  description text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  invoice_number text,
  payment_status text NOT NULL DEFAULT 'Pending',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "staff update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE POLICY "admin delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER expenses_touch BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.business_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  business_name text NOT NULL DEFAULT 'DAS & CO',
  email text NOT NULL DEFAULT 'sandeepdas6699@gmail.com',
  phone text,
  address text,
  opening_gold_balance numeric(12,3) NOT NULL DEFAULT 0,
  default_percentage numeric(6,3) NOT NULL DEFAULT 2,
  rate_24k numeric(12,2) NOT NULL DEFAULT 0,
  rate_22k numeric(12,2) NOT NULL DEFAULT 0,
  rate_18k numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.business_settings TO authenticated;
GRANT ALL ON public.business_settings TO service_role;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read settings" ON public.business_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admin update settings" ON public.business_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager')) WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "admin insert settings" ON public.business_settings FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()));
INSERT INTO public.business_settings (id) VALUES (true);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  module text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  company text,
  project_type text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));

CREATE OR REPLACE FUNCTION public.current_gold_balance()
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT opening_gold_balance FROM public.business_settings WHERE id), 0)
       + COALESCE((SELECT SUM(gold_added) - SUM(gold_deducted) FROM public.gold_transactions), 0)
$$;

CREATE OR REPLACE FUNCTION public.log_gold(_type text, _ref text, _ref_id uuid, _add numeric, _ded numeric, _notes text, _by uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bal numeric;
BEGIN
  SELECT public.current_gold_balance() INTO _bal;
  _bal := _bal + COALESCE(_add,0) - COALESCE(_ded,0);
  INSERT INTO public.gold_transactions (transaction_type, reference, reference_id, gold_added, gold_deducted, balance_after, notes, created_by)
  VALUES (_type, _ref, _ref_id, COALESCE(_add,0), COALESCE(_ded,0), _bal, _notes, _by);
END; $$;

CREATE OR REPLACE FUNCTION public.orders_gold_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.earning_gold := ROUND(COALESCE(NEW.gold_weight,0) * COALESCE(NEW.percentage,0) / 100.0, 3);
  IF NEW.status IN ('Completed','Delivered') AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('Completed','Delivered')) THEN
    PERFORM public.log_gold('CAD Earnings', NEW.order_number, NEW.id, NEW.earning_gold, 0, NEW.project_name, NEW.created_by);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_gold_sync_trg BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_gold_sync();

CREATE OR REPLACE FUNCTION public.casting_gold_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.gold_loss := ROUND(COALESCE(NEW.gold_given,0) - COALESCE(NEW.gold_returned,0), 3);
  IF TG_OP = 'INSERT' AND NEW.gold_loss > 0 THEN
    PERFORM public.log_gold('Casting Loss', COALESCE(NEW.reference,'Casting'), NEW.id, 0, NEW.gold_loss, NEW.vendor, NEW.created_by);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER casting_gold_sync_trg BEFORE INSERT OR UPDATE ON public.casting_records FOR EACH ROW EXECUTE FUNCTION public.casting_gold_sync();