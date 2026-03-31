-- Enable Row-Level Security on all tenant-scoped tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history FORCE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE ifood_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifood_events FORCE ROW LEVEL SECURITY;

-- Policies for tables with direct store_id column
CREATE POLICY tenant_isolation ON orders
  FOR ALL
  USING (store_id = current_setting('app.current_store_id', true)::uuid)
  WITH CHECK (store_id = current_setting('app.current_store_id', true)::uuid);

CREATE POLICY tenant_isolation ON conversations
  FOR ALL
  USING (store_id = current_setting('app.current_store_id', true)::uuid)
  WITH CHECK (store_id = current_setting('app.current_store_id', true)::uuid);

CREATE POLICY tenant_isolation ON ifood_events
  FOR ALL
  USING (store_id = current_setting('app.current_store_id', true)::uuid)
  WITH CHECK (store_id = current_setting('app.current_store_id', true)::uuid);

-- Policy for order_items (via join to orders)
CREATE POLICY tenant_isolation ON order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.store_id = current_setting('app.current_store_id', true)::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.store_id = current_setting('app.current_store_id', true)::uuid
    )
  );

-- Policy for order_status_history (via join to orders)
CREATE POLICY tenant_isolation ON order_status_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND orders.store_id = current_setting('app.current_store_id', true)::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND orders.store_id = current_setting('app.current_store_id', true)::uuid
    )
  );
