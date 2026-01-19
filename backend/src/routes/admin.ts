import { Router, Response } from 'express';
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
    const totalUsersStmt = await db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalUsers = totalUsersStmt.get() as any;

    // Total diagnoses
    const totalDiagnosesStmt = await db.prepare('SELECT COUNT(*) as count FROM diagnoses');
    const totalDiagnoses = totalDiagnosesStmt.get() as any;

    // Diagnoses by result category
    const diagnosisByCategoryStmt = await db.prepare(`
        SELECT result, COUNT(*) as count
        FROM diagnoses
        GROUP BY result
        ORDER BY result
      `);
    const diagnosisByCategory = diagnosisByCategoryStmt.all() as any[];

    // Get category names
    const categoriesMap = new Map();
    const categoriesStmt = await db.prepare('SELECT code, name FROM categories');
    const categories = categoriesStmt.all() as any[];
    categories.forEach((cat) => categoriesMap.set(cat.code, cat.name));

    const diagnosisDistribution = diagnosisByCategory.map((item) => ({
      code: item.result,
      name: categoriesMap.get(item.result) || item.result,
      count: item.count,
    }));

    // Recent diagnoses (last 7 days)
    const recentDiagnosesStmt = await db.prepare(`
        SELECT COUNT(*) as count
        FROM diagnoses
        WHERE created_at >= datetime('now', '-7 days')
      `);
    const recentDiagnoses = recentDiagnosesStmt.get() as any;

    // Most common symptoms
    const allDiagnosesStmt = await db.prepare('SELECT selected_symptoms FROM diagnoses');
    const allDiagnoses = allDiagnosesStmt.all() as any[];
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
    const activeSymptoms = activeSymptomsStmt.get() as any;
    const activeRulesStmt = await db.prepare('SELECT COUNT(*) as count FROM rules WHERE active = 1');
    const activeRules = activeRulesStmt.get() as any;
    const publishedArticlesStmt = await db.prepare('SELECT COUNT(*) as count FROM articles WHERE published = 1');
    const publishedArticles = publishedArticlesStmt.get() as any;

    res.json({
      users: {
        total: totalUsers.count,
      },
      diagnoses: {
        total: totalDiagnoses.count,
        recent_7_days: recentDiagnoses.count,
        distribution: diagnosisDistribution,
      },
      symptoms: {
        active: activeSymptoms.count,
        top_10: topSymptoms,
      },
      rules: {
        active: activeRules.count,
      },
      articles: {
        published: publishedArticles.count,
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

    const diagnosesStmt = await db.prepare(`
        SELECT d.*, u.name as user_name, u.email as user_email
        FROM diagnoses d
        LEFT JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
      `);
    const diagnoses = diagnosesStmt.all(limit, offset) as any[];

    const totalStmt = await db.prepare('SELECT COUNT(*) as count FROM diagnoses');
    const total = totalStmt.get() as any;

    const parsedDiagnoses = diagnoses.map((d) => ({
      ...d,
      selected_symptoms: JSON.parse(d.selected_symptoms),
      trace: JSON.parse(d.trace),
    }));

    res.json({
      diagnoses: parsedDiagnoses,
      pagination: {
        page,
        limit,
        total: total.count,
        total_pages: Math.ceil(total.count / limit),
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
    const users = stmt.all();

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
