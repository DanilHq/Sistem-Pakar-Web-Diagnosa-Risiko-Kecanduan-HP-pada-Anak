import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/admin/statistics
 * Get system statistics (admin only)
 */
router.get('/statistics', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Total users
    const totalUsersStmt = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalUsers = await totalUsersStmt.get() as any;

    // Total diagnoses
    const totalDiagnosesStmt = await db.prepare('SELECT COUNT(*) as count FROM diagnoses');
    const totalDiagnoses = await totalDiagnosesStmt.get() as any;

    // Diagnoses by result category
    const diagnosisByCategoryStmt = await db.prepare(`
        SELECT result, COUNT(*) as count
        FROM diagnoses
        GROUP BY result
        ORDER BY result
      `);
    const diagnosisByCategory = await diagnosisByCategoryStmt.all() as any[];

    // Get category names
    const categoriesMap = new Map();
    const categoriesStmt = await db.prepare('SELECT code, name FROM categories');
    const categories = await categoriesStmt.all() as any[];
    categories.forEach((cat) => categoriesMap.set(cat.code, cat.name));

    const diagnosisDistribution = diagnosisByCategory.map((item) => ({
      code: item.result,
      name: categoriesMap.get(item.result) || item.result,
      count: parseInt(item.count),
    }));

    // Recent diagnoses (last 7 days) - PostgreSQL syntax
    const recentDiagnosesStmt = await db.prepare(`
        SELECT COUNT(*) as count
        FROM diagnoses
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);
    const recentDiagnoses = await recentDiagnosesStmt.get() as any;

    // Most common symptoms
    const allDiagnosesStmt = await db.prepare('SELECT selected_symptoms FROM diagnoses');
    const allDiagnoses = await allDiagnosesStmt.all() as any[];
    const symptomCount = new Map<string, number>();

    allDiagnoses.forEach((d) => {
      const symptoms: string[] = JSON.parse(d.selected_symptoms);
      symptoms.forEach((symptom) => {
        symptomCount.set(symptom, (symptomCount.get(symptom) || 0) + 1);
      });
    });

    const topSymptoms = Array.from(symptomCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));

    // Total active symptoms and rules
    const activeSymptomsStmt = await db.prepare('SELECT COUNT(*) as count FROM symptoms WHERE active = 1');
    const activeSymptoms = await activeSymptomsStmt.get() as any;
    const activeRulesStmt = await db.prepare('SELECT COUNT(*) as count FROM rules WHERE active = 1');
    const activeRules = await activeRulesStmt.get() as any;
    const publishedArticlesStmt = await db.prepare('SELECT COUNT(*) as count FROM articles WHERE published = 1');
    const publishedArticles = await publishedArticlesStmt.get() as any;

    res.json({
      users: {
        total: parseInt(totalUsers.count),
      },
      diagnoses: {
        total: parseInt(totalDiagnoses.count),
        recent_7_days: parseInt(recentDiagnoses.count),
        distribution: diagnosisDistribution,
      },
      symptoms: {
        active: parseInt(activeSymptoms.count),
        top_10: topSymptoms,
      },
      rules: {
        active: parseInt(activeRules.count),
      },
      articles: {
        published: parseInt(publishedArticles.count),
      },
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/diagnoses
 * Get all diagnoses with pagination (admin only)
 */
router.get('/diagnoses', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const diagnosesResult = await db.query(`
        SELECT d.*, u.name as user_name, u.email as user_email
        FROM diagnoses d
        LEFT JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
    const diagnoses = diagnosesResult.rows;

    const totalStmt = await db.prepare('SELECT COUNT(*) as count FROM diagnoses');
    const total = await totalStmt.get() as any;

    const parsedDiagnoses = diagnoses.map((d: any) => ({
      ...d,
      selected_symptoms: JSON.parse(d.selected_symptoms),
      trace: JSON.parse(d.trace),
    }));

    res.json({
      diagnoses: parsedDiagnoses,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        total_pages: Math.ceil(parseInt(total.count) / limit),
      },
    });
  } catch (error) {
    console.error('Get all diagnoses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stmt = await db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    const users = await stmt.all();

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
router.post('/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password harus diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role harus "user" atau "admin"' });
    }

    // Check if email already exists
    const checkStmt = await db.prepare('SELECT id FROM users WHERE email = $1');
    const existingUser = await checkStmt.get(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and return
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role || 'user']
    );

    const newUser = result.rows[0];

    res.status(201).json({ message: 'Pengguna berhasil ditambahkan', user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update a user (admin only)
 */
router.put('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Check if user exists
    const checkStmt = await db.prepare('SELECT * FROM users WHERE id = $1');
    const existingUser = await checkStmt.get(id) as any;

    if (!existingUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Check if email is taken by another user
    if (email && email !== existingUser.email) {
      const emailCheckResult = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({ error: 'Email sudah digunakan pengguna lain' });
      }
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role harus "user" atau "admin"' });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }
    if (email) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (role) {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(role);
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password minimal 6 karakter' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${paramIndex++}`);
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
    await db.query(updateQuery, updateValues);

    // Fetch updated user
    const userStmt = await db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = $1');
    const updatedUser = await userStmt.get(id);

    res.json({ message: 'Pengguna berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === adminId) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
    }

    // Check if user exists
    const checkStmt = await db.prepare('SELECT id FROM users WHERE id = $1');
    const existingUser = await checkStmt.get(id);

    if (!existingUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
