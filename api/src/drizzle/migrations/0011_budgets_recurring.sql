ALTER TABLE budgets ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE budgets ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE budgets ADD COLUMN recurring_group_id UUID REFERENCES budgets(id);

CREATE INDEX idx_budgets_recurring_group_id ON budgets(recurring_group_id);
CREATE INDEX idx_budgets_is_recurring ON budgets(is_recurring);
