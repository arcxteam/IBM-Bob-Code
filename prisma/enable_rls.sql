-- Enable Row Level Security on User and Post tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

-- Default policy: allow all operations for authenticated users (service role)
-- These can be refined later for specific access patterns
CREATE POLICY "Allow all for service role" ON "User"
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON "Post"
  FOR ALL
  USING (true)
  WITH CHECK (true);
