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
        id: 1,
        title: 'Tentang Sistem Pakar',
        description: 'Sistem Pakar Diagnosa Risiko Kecanduan HP pada Anak adalah aplikasi web yang dikembangkan untuk membantu orang tua mendeteksi dini tanda-tanda kecanduan gadget pada anak.',
        vision: 'Menjadi sistem yang membantu orang tua dalam mendeteksi dini kecanduan gadget pada anak secara akurat dan mudah diakses.',
        mission: 'Memberikan diagnosa awal yang akurat berdasarkan gejala-gejala yang diamati, serta edukasi kepada orang tua tentang kecanduan gadget pada anak.',
        developer_name: 'Tim Pengembang',
        developer_info: 'Sistem ini dikembangkan sebagai bagian dari penelitian tentang kecerdasan buatan dan sistem pakar.',
        contact_email: 'admin@example.com',
        contact_phone: '',
        address: ''
      });
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
    const { 
      title, 
      description, 
      vision, 
      mission, 
      developer_name,
      developer_info,
      contact_email,
      contact_phone,
      address
    } = req.body;

    // Check if about content exists
    const checkStmt = await db.prepare('SELECT id FROM about_content WHERE id = 1');
    const existing = checkStmt.get();

    if (existing) {
      // Update existing
      const updateStmt = await db.prepare(`
        UPDATE about_content 
        SET title = ?, 
            description = ?, 
            vision = ?, 
            mission = ?, 
            developer_name = ?,
            developer_info = ?,
            contact_email = ?,
            contact_phone = ?,
            address = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      updateStmt.run(
        title, 
        description, 
        vision, 
        mission, 
        developer_name,
        developer_info,
        contact_email,
        contact_phone,
        address
      );
    } else {
      // Insert new
      const insertStmt = await db.prepare(`
        INSERT INTO about_content (id, title, description, vision, mission, developer_name, developer_info, contact_email, contact_phone, address)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        title, 
        description, 
        vision, 
        mission, 
        developer_name,
        developer_info,
        contact_email,
        contact_phone,
        address
      );
    }

    // Return updated content
    const stmt = await db.prepare('SELECT * FROM about_content WHERE id = 1');
    const content = stmt.get();

    res.json({ message: 'Konten berhasil diperbarui', data: content });
  } catch (error) {
    console.error('Update about content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
