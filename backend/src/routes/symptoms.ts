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
    const symptoms = stmt.all();

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
    const symptoms = stmt.all();

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

    const stmt = await db.prepare(`
      INSERT INTO symptoms (code, text, help_text, active)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(code, text, help_text || null, active !== false ? 1 : 0);

    res.status(201).json({
      id: result.lastInsertRowid,
      code,
      text,
      help_text,
      active: active !== false,
      message: 'Symptom created successfully',
    });
  } catch (error: any) {
    console.error('Create symptom error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
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

    const stmt = await db.prepare(`
      UPDATE symptoms
      SET code = ?, text = ?, help_text = ?, active = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      code,
      text,
      help_text || null,
      active !== false ? 1 : 0,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }

    res.json({ message: 'Symptom updated successfully' });
  } catch (error: any) {
    console.error('Update symptom error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
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

    const stmt = await db.prepare('DELETE FROM symptoms WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }

    res.json({ message: 'Symptom deleted successfully' });
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
