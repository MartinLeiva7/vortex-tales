import fs from 'fs/promises';
import path from 'path';

export interface StoryOption {
  text: string;
  next_node_id: string;
}

export interface StoryNode {
  text: string;
  ambient_sound?: string;
  image?: string;
  visual_effect?: 'none' | 'flicker' | 'shake' | 'red_flash' | 'fade_to_black';
  is_death_node?: boolean;
  checkpoint?: boolean;
  unlock_trophy_id?: string;
  options: StoryOption[];
  input_challenge?: {
    placeholder: string;
    correct_answer: string;
    success_node_id: string;
    fail_node_id: string;
  };
  timer?: {
    duration_seconds: number;
    timeout_node_id: string;
  } | null;
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

    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (!isDev && this.cache.has(cacheKey)) {
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

      // Clean up repeating phrases in all nodes of the chapter to keep narrative fresh
      const repetitivePhrases = [
        "El aire helado transporta un susurro incomprensible que eriza el vello de tu nuca, recordándote que cada segundo cuenta en este laberinto de locura.",
        "La presencia del ser maldito satura el ambiente con un hedor a muerte y descomposición, paralizando tus músculos por un instante y forzándote a tomar decisiones al límite de la cordura.",
        "El mobiliario oxidado y las manchas indescifrables en las paredes atestiguan el sufrimiento silencioso de quienes alguna vez estuvieron encerrados aquí, dejando ecos de su agonía flotando en el ambiente.",
        "El eco del sonido reverbera en el vacío del corredor, despertando temores ancestrales en lo más profundo de tu conciencia. Algo te acecha desde la penumbra, y la distancia que los separa parece acortarse con cada latido.",
        "La luz titilante proyecta siluetas monstruosas y distorsionadas contra el moho de los muros, haciendo que cada esquina oscura parezca ocultar una amenaza mortal que espera el momento exacto para atacar."
      ];

      if (chapterData && chapterData.nodes) {
        for (const nodeId in chapterData.nodes) {
          // Keep them only on the very first start node of Chapter 1
          if (chapterNumber === 1 && nodeId === chapterData.start_node_id) {
            continue;
          }
          const node = chapterData.nodes[nodeId];
          if (node && typeof node.text === 'string') {
            let cleanText = node.text;
            let modified = false;
            for (const phrase of repetitivePhrases) {
              if (cleanText.includes(phrase)) {
                cleanText = cleanText.split(phrase).join("");
                modified = true;
              }
            }
            if (modified) {
              cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
              node.text = cleanText;
            }
          }
        }
      }

      // Cache the loaded chapter
      this.cache.set(cacheKey, chapterData);

      return chapterData;
    } catch (error: any) {
      console.error(`Error reading story chapter at ${filePath}:`, error);
      if (error.code === 'ENOENT') {
        throw new Error('CHAPTER_NOT_FOUND');
      }
      throw error;
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

    let ch = 1;
    while (true) {
      try {
        const chapter = await this.getChapter(storyId, ch);
        if (chapter.trophies) {
          for (const trophy of chapter.trophies) {
            allTrophies.set(trophy.id, trophy);
          }
        }
        ch++;
      } catch (err) {
        // Stop if a chapter doesn't exist yet
        break;
      }
    }

    return Array.from(allTrophies.values());
  }
}

export const storyService = new StoryService();
