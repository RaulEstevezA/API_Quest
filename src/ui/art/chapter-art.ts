/**
 * Illustrations of the story, in `public/chapters/`. They are image files rather than
 * code because they show full scenes. To illustrate a new chapter, add
 * `chapter-<id>.webp` to that folder.
 */

import type { ChapterId } from '../../core/missions'

/**
 * Builds the address of an illustration.
 *
 * @param chapter Number of the chapter.
 * @returns Address of its image, under the base path of the game.
 */
export function chapterArtUrl(chapter: ChapterId): string {
  return `${import.meta.env.BASE_URL}chapters/chapter-${chapter}.webp`
}

/**
 * Builds the address of the illustration of the ending.
 *
 * @returns Address of its image, under the base path of the game.
 */
export function endingArtUrl(): string {
  return `${import.meta.env.BASE_URL}chapters/ending.webp`
}
