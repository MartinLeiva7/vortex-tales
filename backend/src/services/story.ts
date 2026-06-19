import fs from 'fs/promises';
import path from 'path';

export interface StoryOption {
  text: string;
  next_node_id: string;
}

export interface StoryNode {
  text: string;
  ambient_sound?: string;
  visual_effect?: 'none' | 'flicker' | 'shake' | 'red_flash' | 'fade_to_black';
  is_death_node?: boolean;
  checkpoint?: boolean;
  unlock_trophy_id?: string;
  options: StoryOption[];
}

export interface StoryTrophy {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface StoryChapter {
  story_id: string;
  story_title: string;
  chapter_number: number;
  chapter_title: string;
  start_node_id: string;
  trophies?: StoryTrophy[];
  nodes: Record<string, StoryNode>;
}

class StoryService {
  // Simple cache to avoid reading from disk on every API call.
  // Using a Map structure is lightweight and sufficient for low-resource environments.
  private cache: Map<string, StoryChapter> = new Map();

  private getCacheKey(storyId: string, chapterNumber: number): string {
    return `${storyId}_ch${chapterNumber}`;
  }

  async getChapter(storyId: string, chapterNumber: number): Promise<StoryChapter> {
    const cacheKey = this.getCacheKey(storyId, chapterNumber);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Story files are stored in backend/stories/<storyId>/chapter<chapterNumber>.json
    const filePath = path.join(
      process.cwd(),
      'stories',
      storyId,
      `chapter${chapterNumber}.json`
    );

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const chapterData = JSON.parse(fileContent) as StoryChapter;

      // Cache the loaded chapter
      this.cache.set(cacheKey, chapterData);

      return chapterData;
    } catch (error) {
      console.error(`Error reading story chapter at ${filePath}:`, error);
      throw new Error(`Story ${storyId} Chapter ${chapterNumber} not found.`);
    }
  }

  async getNode(storyId: string, chapterNumber: number, nodeId: string): Promise<StoryNode> {
    const chapter = await this.getChapter(storyId, chapterNumber);
    const node = chapter.nodes[nodeId];

    if (!node) {
      throw new Error(`Node ${nodeId} not found in Story ${storyId} Chapter ${chapterNumber}.`);
    }

    return node;
  }

  async getTrophies(storyId: string): Promise<StoryTrophy[]> {
    // In our design, trophies are defined in the story chapters.
    // We can load them from chapter 1 (or accumulate across chapters 1, 2, 3).
    // Let's load chapters 1, 2, 3 and accumulate all unique trophies to show in the Trophy Room!
    const allTrophies: Map<string, StoryTrophy> = new Map();

    for (let ch = 1; ch <= 3; ch++) {
      try {
        const chapter = await this.getChapter(storyId, ch);
        if (chapter.trophies) {
          for (const trophy of chapter.trophies) {
            allTrophies.set(trophy.id, trophy);
          }
        }
      } catch (err) {
        // Stop if a chapter doesn't exist yet
        break;
      }
    }

    return Array.from(allTrophies.values());
  }
}

export const storyService = new StoryService();
