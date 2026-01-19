import { Router, Response } from 'express';
import db from '../database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/articles
 * Get all published articles (public)
 */
router.get('/', async (req, res: Response) => {
  try {
    const stmt = await db.prepare(`
        SELECT id, title, slug, excerpt, category, author, created_at, updated_at
        FROM articles
        WHERE published = 1
        ORDER BY created_at DESC
      `);
    const articles = stmt.all();

    res.json({ articles });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/articles/all
 * Get all articles including unpublished (admin only)
 */
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT * FROM articles ORDER BY created_at DESC');
    const articles = stmt.all();

    res.json({ articles });
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/articles/:slug
 * Get article by slug (public if published)
 */
router.get('/:slug', async (req, res: Response) => {
  try {
    const { slug } = req.params;

    const stmt = await db.prepare('SELECT * FROM articles WHERE slug = ? AND published = 1');
    const article = stmt.get(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/articles
 * Create new article (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, excerpt, content, category, author, published } = req.body;

    if (!title || !slug || !excerpt || !content || !category || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = await db.prepare(`
      INSERT INTO articles (title, slug, excerpt, content, category, author, published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      published !== false ? 1 : 0
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Article created successfully',
    });
  } catch (error: any) {
    console.error('Create article error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Article slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/articles/:id
 * Update article (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, slug, excerpt, content, category, author, published } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const stmt = await db.prepare(`
      UPDATE articles
      SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, author = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      published !== false ? 1 : 0,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error: any) {
    console.error('Update article error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Article slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/articles/:id
 * Delete article (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const stmt = await db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
