import db from '../database';
import { Rule, RuleTrace, Category } from '../types';

/**
 * Forward Chaining Inference Engine
 *
 * Algorithm:
 * 1. Load all active rules from database
 * 2. Sort rules by priority (1 = highest priority)
 * 3. For each rule, check if all conditions (symptoms) are present in user's selected symptoms
 * 4. Return the first matched rule (highest priority)
 * 5. If no rules match, return default result (K01 - Normal)
 * 6. Generate trace of all rules for transparency
 */

export interface InferenceResult {
  result_code: string;
  matched_rule_code: string | null;
  matched_description: string | null;
  recommendation: string | null;
  trace: RuleTrace[];
  category: Category | null;
}

export async function runInference(selectedSymptoms: string[]): Promise<InferenceResult> {
  // Load all active rules, sorted by priority (ascending, where 1 is highest)
  const stmt = await db.prepare('SELECT * FROM rules WHERE active = 1 ORDER BY priority ASC');
  const rules = stmt.all() as any[];

  const trace: RuleTrace[] = [];
  let matchedRule: any | null = null;

  // Forward chaining: check each rule
  for (const rule of rules) {
    const conditions: string[] = JSON.parse(rule.conditions);

    // Check if all conditions of this rule are satisfied
    const isMatched = conditions.length > 0
      ? conditions.every((condition) => selectedSymptoms.includes(condition))
      : conditions.length === 0 && selectedSymptoms.length === 0; // R16 for empty symptoms

    trace.push({
      rule_code: rule.code,
      conditions,
      matched: isMatched,
      priority: rule.priority,
    });

    // If this rule is matched and we haven't found a match yet, use it
    // (Since rules are sorted by priority, first match is the best match)
    if (isMatched && !matchedRule) {
      matchedRule = rule;
    }
  }

  // If no rule matched, return default (K01 - Normal)
  const resultCode = matchedRule ? matchedRule.result : 'K01';
  const matchedRuleCode = matchedRule ? matchedRule.code : null;
  const matchedDescription = matchedRule ? matchedRule.description : 'Tidak ada gejala kecanduan HP yang terdeteksi.';
  const recommendation = matchedRule ? matchedRule.recommendation : 'Pertahankan pola penggunaan HP yang sehat.';

  // Get category information
  const stmt2 = await db.prepare('SELECT * FROM categories WHERE code = ?');
  const category = stmt2.get(resultCode) as Category | undefined;

  return {
    result_code: resultCode,
    matched_rule_code: matchedRuleCode,
    matched_description: matchedDescription,
    recommendation,
    trace,
    category: category || null,
  };
}

/**
 * Save diagnosis result to database
 */
export async function saveDiagnosis(
  userId: number | null,
  selectedSymptoms: string[],
  inferenceResult: InferenceResult
): Promise<number> {
  const stmt = await db.prepare(`
    INSERT INTO diagnoses (user_id, selected_symptoms, result, matched_rule_code, trace)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    JSON.stringify(selectedSymptoms),
    inferenceResult.result_code,
    inferenceResult.matched_rule_code,
    JSON.stringify(inferenceResult.trace)
  );

  return result.lastInsertRowid as number;
}

/**
 * Get diagnosis history for a user
 */
export async function getDiagnosisHistory(userId: number, limit: number = 10) {
  const stmt = await db.prepare(`
      SELECT * FROM diagnoses
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
  const diagnoses = stmt.all(userId, limit) as any[];

  return diagnoses.map((d) => ({
    ...d,
    selected_symptoms: JSON.parse(d.selected_symptoms),
    trace: JSON.parse(d.trace),
  }));
}

/**
 * Get diagnosis by ID
 */
export async function getDiagnosisById(id: number, userId?: number) {
  let query = 'SELECT * FROM diagnoses WHERE id = ?';
  const params: any[] = [id];

  if (userId) {
    query += ' AND user_id = ?';
    params.push(userId);
  }

  const stmt = await db.prepare(query);
  const diagnosis = stmt.get(...params) as any;

  if (!diagnosis) {
    return null;
  }

  // Get category information
  const stmt2 = await db.prepare('SELECT * FROM categories WHERE code = ?');
  const categoryResult = stmt2.get(diagnosis.result);
  const category = categoryResult ? (categoryResult as unknown as Category) : null;

  return {
    ...diagnosis,
    selected_symptoms: JSON.parse(diagnosis.selected_symptoms),
    trace: JSON.parse(diagnosis.trace),
    category,
  };
}
