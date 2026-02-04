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
  const rules = await stmt.all() as any[];

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
  const stmt2 = await db.prepare('SELECT * FROM categories WHERE code = $1');
  const category = await stmt2.get(resultCode) as Category | undefined;

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
  const result = await db.query(
    `INSERT INTO diagnoses (user_id, selected_symptoms, result, matched_rule_code, trace)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      userId,
      JSON.stringify(selectedSymptoms),
      inferenceResult.result_code,
      inferenceResult.matched_rule_code,
      JSON.stringify(inferenceResult.trace)
    ]
  );

  return result.rows[0].id as number;
}

/**
 * Get diagnosis history for a user
 */
export async function getDiagnosisHistory(userId: number, limit: number = 10) {
  const result = await db.query(
    `SELECT * FROM diagnoses
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  const diagnoses = result.rows;

  return diagnoses.map((d: any) => ({
    ...d,
    selected_symptoms: JSON.parse(d.selected_symptoms),
    trace: JSON.parse(d.trace),
  }));
}

/**
 * Get diagnosis by ID
 */
export async function getDiagnosisById(id: number, userId?: number) {
  let query = 'SELECT * FROM diagnoses WHERE id = $1';
  const params: any[] = [id];

  if (userId) {
    query += ' AND user_id = $2';
    params.push(userId);
  }

  const result = await db.query(query, params);
  const diagnosis = result.rows[0];

  if (!diagnosis) {
    return null;
  }

  // Get category information
  const stmt2 = await db.prepare('SELECT * FROM categories WHERE code = $1');
  const categoryResult = await stmt2.get(diagnosis.result);
  const category = categoryResult ? (categoryResult as unknown as Category) : null;

  return {
    ...diagnosis,
    selected_symptoms: JSON.parse(diagnosis.selected_symptoms),
    trace: JSON.parse(diagnosis.trace),
    category,
  };
}
