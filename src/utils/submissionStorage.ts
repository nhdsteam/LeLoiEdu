import { ExamSubmission } from '../types';

export const DELETED_SUBMISSIONS_KEY = 'edu_deleted_submission_ids';

/**
 * Retrieves the set of submission IDs that have been explicitly deleted by the user.
 * This acts as a persistent tombstone/blacklist to prevent old snapshots or browser caches
 * from resurrecting deleted student submissions.
 */
export function getDeletedSubmissionIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SUBMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.warn('Error reading deleted submission IDs from storage:', err);
  }
  return new Set();
}

/**
 * Marks a submission ID as deleted.
 */
export function recordDeletedSubmissionId(id: string): void {
  try {
    const set = getDeletedSubmissionIds();
    set.add(id);
    localStorage.setItem(DELETED_SUBMISSIONS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Error saving deleted submission ID to storage:', err);
  }
}

/**
 * Removes a submission ID from the deleted set (e.g. when re-created or re-added).
 */
export function removeDeletedSubmissionId(id: string): void {
  try {
    const set = getDeletedSubmissionIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_SUBMISSIONS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (err) {
    console.warn('Error removing deleted submission ID from storage:', err);
  }
}

/**
 * Clears all deleted tombstone IDs (used when explicitly resetting to initial preset sample data).
 */
export function clearDeletedSubmissionIds(): void {
  try {
    localStorage.removeItem(DELETED_SUBMISSIONS_KEY);
  } catch (err) {
    console.warn('Error clearing deleted submission IDs from storage:', err);
  }
}

/**
 * Helper to filter out any submissions whose ID is in the tombstone blacklist.
 */
export function filterOutDeletedSubmissions(submissions: ExamSubmission[]): ExamSubmission[] {
  const deletedSet = getDeletedSubmissionIds();
  if (deletedSet.size === 0) return submissions;
  return submissions.filter((sub) => !deletedSet.has(sub.id));
}
