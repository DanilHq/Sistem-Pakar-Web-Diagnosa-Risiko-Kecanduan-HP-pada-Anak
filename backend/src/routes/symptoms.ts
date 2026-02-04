import { Router, Response } from 'express';
import db from '../database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/symptoms
 * Get all active symptoms (public)
 */
router.get('/', async (req, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT id, code, text, help_text FROM symptoms WHERE active = 1 ORDER BY code');
    const symptoms = await stmt.all();

    res.json({ symptoms });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/symptoms/all
 * Get all symptoms including inactive (admin only)
 */
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT * FROM symptoms ORDER BY code');
    const symptoms = await stmt.all();

    res.json({ symptoms });
  } catch (error) {
    console.error('Get all symptoms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/symptoms
 * Create new symptom (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, text, help_text, active } = req.body;

    if (!code || !text) {
      return res.status(400).json({ error: 'Code and text are required' });
    }

    const result = await db.query(
      `INSERT INTO symptoms (code, text, help_text, active)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [code, text, help_text || null, active !== false ? 1 : 0]
    );

    res.status(201).json({
      id: result.rows[0].id,
      code,
      text,
      help_text,
      active: active !== false,
      message: 'Symptom created successfully',
    });
  } catch (error: any) {
    console.error('Create symptom error:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ error: 'Symptom code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/symptoms/:id
 * Update symptom (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { code, text, help_text, active } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid symptom ID' });
    }

    const result = await db.query(
      `UPDATE symptoms
       SET code = $1, text = $2, help_text = $3, active = $4
       WHERE id = $5`,
      [code, text, help_text || null, active !== false ? 1 : 0, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }

    res.json({ message: 'Symptom updated successfully' });
  } catch (error: any) {
    console.error('Update symptom error:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ error: 'Symptom code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/symptoms/:id
 * Delete symptom (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid symptom ID' });
    }

    const result = await db.query('DELETE FROM symptoms WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }

    res.json({ message: 'Symptom deleted successfully' });
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
