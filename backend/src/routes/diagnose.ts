import { Router, Request, Response } from 'express';
import { runInference, saveDiagnosis, getDiagnosisHistory, getDiagnosisById } from '../services/inference';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../database';
import { DiagnosisRequest, DiagnosisResponse } from '../types';

const router = Router();

/**
 * POST /api/diagnose
 * Run diagnosis with forward chaining inference
 * Can be used anonymously or with authentication
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { selected_symptoms, user_id } = req.body as DiagnosisRequest;

    // Validation
    if (!selected_symptoms || !Array.isArray(selected_symptoms)) {
      return res.status(400).json({ error: 'selected_symptoms must be an array' });
    }

    // Validate that all selected symptoms exist
    if (selected_symptoms.length > 0) {
      const placeholders = selected_symptoms.map(() => '?').join(',');
      const stmt = await db.prepare(`SELECT code FROM symptoms WHERE code IN (${placeholders}) AND active = 1`);
      const validSymptoms = stmt.all(...selected_symptoms) as any[];

      const validCodes = validSymptoms.map((s) => s.code);
      const invalidSymptoms = selected_symptoms.filter((s) => !validCodes.includes(s));

      if (invalidSymptoms.length > 0) {
        return res.status(400).json({
          error: 'Invalid symptom codes',
          invalid_symptoms: invalidSymptoms,
        });
      }
    }

    // Run forward chaining inference
    const inferenceResult = await runInference(selected_symptoms);

    // Save diagnosis to database
    const diagnosisId = await saveDiagnosis(user_id || null, selected_symptoms, inferenceResult);

    // Prepare response
    const response: DiagnosisResponse = {
      result_code: inferenceResult.result_code,
      matched_rule_code: inferenceResult.matched_rule_code,
      matched_description: inferenceResult.matched_description || undefined,
      recommendation: inferenceResult.recommendation || undefined,
      trace: inferenceResult.trace,
      active_symptoms: selected_symptoms,
      category: inferenceResult.category || undefined,
    };

    res.json({
      ...response,
      diagnosis_id: diagnosisId,
      message: 'Diagnosis completed successfully',
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/diagnose/history
 * Get diagnosis history for authenticated user
 */
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const history = await getDiagnosisHistory(req.user.id, limit);

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/diagnose/:id
 * Get diagnosis by ID
 * Authenticated users can only see their own diagnoses
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid diagnosis ID' });
    }

    // Non-admin users can only view their own diagnoses
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    const diagnosis = await getDiagnosisById(id, userId);

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
