import { Router, Response } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { progress, userTrophies } from '../db/schema.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { storyService } from '../services/story.js';

const router = Router();

// GET /api/game/state
// Retrieves or initializes the user's progress for a story
router.get('/state', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req.user!.id;
  const storyId = req.query.storyId as string;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required.' });
  }

  try {
    // Check if progress exists
    let [userProgress] = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)))
      .limit(1);

    if (!userProgress) {
      // Load chapter 1 to find the start node
      const chapter1 = await storyService.getChapter(storyId, 1);
      const progressId = crypto.randomUUID();

      await db.insert(progress).values({
        id: progressId,
        userId,
        storyId,
        currentChapter: 1,
        currentNodeId: chapter1.start_node_id,
        playtimeSeconds: 0,
      });

      // Reload progress
      [userProgress] = await db
        .select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)))
        .limit(1);
    }

    // Load node details
    const node = await storyService.getNode(
      storyId,
      userProgress.currentChapter,
      userProgress.currentNodeId
    );

    return res.json({
      storyId: userProgress.storyId,
      currentChapter: userProgress.currentChapter,
      currentNodeId: userProgress.currentNodeId,
      playtimeSeconds: userProgress.playtimeSeconds,
      node: {
        text: node.text,
        ambient_sound: node.ambient_sound,
        visual_effect: node.visual_effect || 'none',
        is_death_node: node.is_death_node || false,
        checkpoint: node.checkpoint || false,
        options: node.options,
      },
    });
  } catch (error: any) {
    console.error('Error fetching game state:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// POST /api/game/navigate
// Moves the player to the next node, handles checkpoints and unlocks trophies
router.post('/navigate', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req.user!.id;
  const { storyId, nextNodeId } = req.body;

  if (!storyId || !nextNodeId) {
    return res.status(400).json({ error: 'storyId and nextNodeId are required.' });
  }

  try {
    // 1. Fetch current progress
    const [userProgress] = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)))
      .limit(1);

    if (!userProgress) {
      return res.status(400).json({ error: 'No active progress found for this story.' });
    }

    let currentChapter = userProgress.currentChapter;
    let currentNodeId = userProgress.currentNodeId;
    let newChapterNumber = currentChapter;
    let newNodeId = nextNodeId;
    let newlyUnlockedTrophy = null;

    // Load current node
    const currentNode = await storyService.getNode(storyId, currentChapter, currentNodeId);

    // 2. Handle Chapter transition (Next Chapter navigation)
    if (nextNodeId === 'next_chapter') {
      if (!currentNode.checkpoint) {
        return res.status(400).json({ error: 'Cannot advance chapter. Current node is not a checkpoint.' });
      }

      newChapterNumber = currentChapter + 1;
      try {
        const nextChapter = await storyService.getChapter(storyId, newChapterNumber);
        newNodeId = nextChapter.start_node_id;
      } catch (err) {
        // No more chapters, the story has ended!
        return res.json({
          storyEnded: true,
          message: 'Felicidades, has completado la historia.'
        });
      }
    } else {
      // 3. Normal navigation - Validate adjacency
      const validOption = currentNode.options.find(opt => opt.next_node_id === nextNodeId);

      // Allow restart from death node to starting node of the chapter (even if not explicitly in options, or if it is in options)
      const isRestartFromDeath = currentNode.is_death_node && nextNodeId === 'c1_inicio'; // Fallback
      // Let's check general starts just in case
      const isRestartFromDeathGeneral = currentNode.is_death_node && (nextNodeId.endsWith('_inicio') || nextNodeId === 'c1_inicio' || nextNodeId === 'c2_inicio' || nextNodeId === 'c3_inicio');

      if (!validOption && !isRestartFromDeath && !isRestartFromDeathGeneral) {
        return res.status(400).json({ error: 'Invalid move. Target node is not reachable from current node.' });
      }
    }

    // 4. Load the target node details
    const targetNode = await storyService.getNode(storyId, newChapterNumber, newNodeId);

    // 5. Handle Trophy Unlock
    if (targetNode.unlock_trophy_id) {
      const trophyId = targetNode.unlock_trophy_id;

      // Check if already unlocked
      const [existingTrophy] = await db
        .select()
        .from(userTrophies)
        .where(
          and(
            eq(userTrophies.userId, userId),
            eq(userTrophies.storyId, storyId),
            eq(userTrophies.trophyId, trophyId)
          )
        )
        .limit(1);

      if (!existingTrophy) {
        await db.insert(userTrophies).values({
          id: crypto.randomUUID(),
          userId,
          storyId,
          trophyId,
        });

        // Load trophy details from service to send to client
        const trophiesList = await storyService.getTrophies(storyId);
        newlyUnlockedTrophy = trophiesList.find(t => t.id === trophyId) || {
          id: trophyId,
          title: 'Trofeo Desbloqueado',
          description: '¡Felicidades!',
          icon: 'Award'
        };
      }
    }

    // 6. Update database progress
    await db
      .update(progress)
      .set({
        currentChapter: newChapterNumber,
        currentNodeId: newNodeId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)));

    return res.json({
      storyId,
      currentChapter: newChapterNumber,
      currentNodeId: newNodeId,
      node: {
        text: targetNode.text,
        ambient_sound: targetNode.ambient_sound,
        visual_effect: targetNode.visual_effect || 'none',
        is_death_node: targetNode.is_death_node || false,
        checkpoint: targetNode.checkpoint || false,
        options: targetNode.options,
      },
      unlockedTrophy: newlyUnlockedTrophy,
    });
  } catch (error: any) {
    console.error('Error during navigation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// POST /api/game/playtime
// Increments the playtime of the active story
router.post('/playtime', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req.user!.id;
  const { storyId, seconds } = req.body;

  if (!storyId || seconds === undefined || typeof seconds !== 'number') {
    return res.status(400).json({ error: 'storyId and seconds (number) are required.' });
  }

  try {
    await db
      .update(progress)
      .set({
        playtimeSeconds: sql`${progress.playtimeSeconds} + ${seconds}`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)));

    // Return the updated playtime
    const [userProgress] = await db
      .select({ playtimeSeconds: progress.playtimeSeconds })
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.storyId, storyId)))
      .limit(1);

    return res.json({
      playtimeSeconds: userProgress?.playtimeSeconds || 0,
    });
  } catch (error: any) {
    console.error('Error updating playtime:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/game/trophies
// Retrieves all trophies for a story, with unlocked status for this user
router.get('/trophies', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const userId = req.user!.id;
  const storyId = req.query.storyId as string;

  if (!storyId) {
    return res.status(400).json({ error: 'storyId is required.' });
  }

  try {
    // 1. Get all trophies defined in JSONs
    const allTrophies = await storyService.getTrophies(storyId);

    // 2. Get unlocked trophies for this user
    const unlockedList = await db
      .select({ trophyId: userTrophies.trophyId, unlockedAt: userTrophies.unlockedAt })
      .from(userTrophies)
      .where(and(eq(userTrophies.userId, userId), eq(userTrophies.storyId, storyId)));

    const unlockedMap = new Map(unlockedList.map(item => [item.trophyId, item.unlockedAt]));

    // 3. Merge status
    const trophiesWithStatus = allTrophies.map(trophy => ({
      ...trophy,
      unlocked: unlockedMap.has(trophy.id),
      unlockedAt: unlockedMap.get(trophy.id) || null,
    }));

    return res.json({ trophies: trophiesWithStatus });
  } catch (error: any) {
    console.error('Error fetching trophies:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
