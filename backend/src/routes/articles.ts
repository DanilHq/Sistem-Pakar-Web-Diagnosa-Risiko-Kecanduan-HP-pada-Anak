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
    const articles = await stmt.all();

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
    const articles = await stmt.all();

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

    const stmt = await db.prepare('SELECT * FROM articles WHERE slug = $1 AND published = 1');
    const article = await stmt.get(slug);

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

    const result = await db.query(
      `INSERT INTO articles (title, slug, excerpt, content, category, author, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        title,
        slug,
        excerpt,
        content,
        category,
        author,
        published !== false ? 1 : 0
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      message: 'Article created successfully',
    });
  } catch (error: any) {
    console.error('Create article error:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
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

    const result = await db.query(
      `UPDATE articles
       SET title = $1, slug = $2, excerpt = $3, content = $4, category = $5, author = $6, published = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [
        title,
        slug,
        excerpt,
        content,
        category,
        author,
        published !== false ? 1 : 0,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error: any) {
    console.error('Update article error:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
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

    const result = await db.query('DELETE FROM articles WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
