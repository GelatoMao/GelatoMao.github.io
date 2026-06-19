import type { CollectionEntry } from "astro:content";

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * - Excludes drafts always
 * - Non-draft posts are always shown regardless of pubDatetime
 */
export function postFilter({ data }: CollectionEntry<"posts">) {
  return !data.draft;
}
