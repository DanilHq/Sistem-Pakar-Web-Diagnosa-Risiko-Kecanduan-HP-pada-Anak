import { Router, Response } from 'express';
import db from '../database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/about
 * Get about page content (public)
 */
router.get('/', async (req, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT * FROM about_content WHERE id = 1');
    const content = stmt.get() as any;

    if (!content) {
      // Return default content if none exists
      return res.json({
        title: 'Tentang Sistem Pakar',
        content: 'Sistem Pakar Diagnosa Risiko Kecanduan HP pada Anak',
        vision: 'Menjadi sistem yang membantu orang tua dalam mendeteksi dini kecanduan gadget pada anak.',
        mission: 'Memberikan diagnosa awal yang akurat berdasarkan gejala-gejala yang diamati.',
        team: []
      });
    }

    // Parse team if stored as JSON
    if (content.team && typeof content.team === 'string') {
      content.team = JSON.parse(content.team);
    }

    res.json(content);
  } catch (error) {
    console.error('Get about content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/about
 * Update about page content (admin only)
 */
router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, vision, mission, team } = req.body;

    // Check if about content exists
    const checkStmt = await db.prepare('SELECT id FROM about_content WHERE id = 1');
    const existing = checkStmt.get();

    const teamJson = team ? JSON.stringify(team) : '[]';

    if (existing) {
      // Update existing
      const updateStmt = await db.prepare(`
        UPDATE about_content 
        SET title = ?, content = ?, vision = ?, mission = ?, team = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      updateStmt.run(title, content, vision, mission, teamJson);
    } else {
      // Insert new
      const insertStmt = await db.prepare(`
        INSERT INTO about_content (id, title, content, vision, mission, team)
        VALUES (1, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(title, content, vision, mission, teamJson);
    }

    res.json({ message: 'Konten berhasil diperbarui' });
  } catch (error) {
    console.error('Update about content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
