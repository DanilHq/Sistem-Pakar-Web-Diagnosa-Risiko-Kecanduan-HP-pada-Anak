import { Router, Response } from 'express';
import db from '../database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/rules
 * Get all active rules (admin only)
 */
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT * FROM rules ORDER BY priority ASC');
    const rules = stmt.all() as any[];

    // Parse JSON conditions
    const parsedRules = rules.map((rule) => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      active: Boolean(rule.active),
    }));

    res.json({ rules: parsedRules });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rules/:id
 * Get rule by ID (admin only)
 */
router.get('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    const stmt = await db.prepare('SELECT * FROM rules WHERE id = ?');
    const rule = stmt.get(id) as any;

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      active: Boolean(rule.active),
    });
  } catch (error) {
    console.error('Get rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rules
 * Create new rule (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, conditions, result, priority, description, recommendation, active } = req.body;

    // Validation
    if (!code || !result || !priority || !description || !recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(conditions)) {
      return res.status(400).json({ error: 'Conditions must be an array' });
    }

    const stmt = await db.prepare(`
      INSERT INTO rules (code, conditions, result, priority, description, recommendation, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result_db = stmt.run(
      code,
      JSON.stringify(conditions),
      result,
      priority,
      description,
      recommendation,
      active !== false ? 1 : 0
    );

    res.status(201).json({
      id: result_db.lastInsertRowid,
      code,
      conditions,
      result,
      priority,
      description,
      recommendation,
      active: active !== false,
      message: 'Rule created successfully',
    });
  } catch (error: any) {
    console.error('Create rule error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Rule code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/rules/:id
 * Update rule (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { code, conditions, result, priority, description, recommendation, active } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    if (!Array.isArray(conditions)) {
      return res.status(400).json({ error: 'Conditions must be an array' });
    }

    const stmt = await db.prepare(`
      UPDATE rules
      SET code = ?, conditions = ?, result = ?, priority = ?, description = ?, recommendation = ?, active = ?
      WHERE id = ?
    `);

    const result_db = stmt.run(
      code,
      JSON.stringify(conditions),
      result,
      priority,
      description,
      recommendation,
      active !== false ? 1 : 0,
      id
    );

    if (result_db.changes === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ message: 'Rule updated successfully' });
  } catch (error: any) {
    console.error('Update rule error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Rule code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/rules/:id
 * Delete rule (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    const stmt = await db.prepare('DELETE FROM rules WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
