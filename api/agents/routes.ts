/**
 * Agent API Routes
 * RESTful endpoints for agent communication and management
 */

import { Router } from 'express'
import { z } from 'zod'
import { executeTask, getAgentStatus, cancelTask } from './handlers'
import { authenticate, rateLimit } from '../middleware'

const router = Router()

// Request validation schemas
const executeTaskSchema = z.object({
  code: z.string().min(1),
  language: z.enum(['typescript', 'javascript', 'python', 'java']),
  timeout: z.number().optional().default(300),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
})

const agentIdSchema = z.object({
  id: z.string().uuid(),
})

/**
 * POST /api/agents/:id/execute
 * Execute a code task on the specified agent
 */
router.post('/:id/execute', authenticate, rateLimit({ maxRequests: 10, windowMs: 60000 }), async (req, res) => {
  try {
    const { id } = agentIdSchema.parse(req.params)
    const taskData = executeTaskSchema.parse(req.body)

    const result = await executeTask(id, {
      ...taskData,
      userId: req.user.id,
    })

    res.status(200).json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      estimatedTime: result.estimatedTime,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    console.error('Failed to execute task:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to execute task',
    })
  }
})

/**
 * GET /api/agents/:id/status
 * Get current status of an agent
 */
router.get('/:id/status', authenticate, rateLimit({ maxRequests: 30, windowMs: 60000 }), async (req, res) => {
  try {
    const { id } = agentIdSchema.parse(req.params)
    const status = await getAgentStatus(id)

    res.status(200).json({
      success: true,
      agent: {
        id: status.id,
        type: status.type,
        status: status.status,
        currentTask: status.currentTask,
        uptime: status.uptime,
        tasksCompleted: status.tasksCompleted,
        averageResponseTime: status.averageResponseTime,
      },
    })
  } catch (error) {
    console.error('Failed to get agent status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get agent status',
    })
  }
})

/**
 * POST /api/agents/:id/cancel
 * Cancel a running task on the specified agent
 */
router.post('/:id/cancel', authenticate, rateLimit({ maxRequests: 5, windowMs: 60000 }), async (req, res) => {
  try {
    const { id } = agentIdSchema.parse(req.params)
    const { taskId } = z.object({ taskId: z.string() }).parse(req.body)

    const result = await cancelTask(id, taskId, req.user.id)

    res.status(200).json({
      success: true,
      message: 'Task cancelled successfully',
      taskId: result.taskId,
      status: result.status,
    })
  } catch (error) {
    console.error('Failed to cancel task:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to cancel task',
    })
  }
})

/**
 * GET /api/agents
 * List all available agents
 */
router.get('/', authenticate, rateLimit({ maxRequests: 20, windowMs: 60000 }), async (req, res) => {
  try {
    // Implementation would query Redis/DB for agent list
    res.status(200).json({
      success: true,
      agents: [],
    })
  } catch (error) {
    console.error('Failed to list agents:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to list agents',
    })
  }
})

export default router
