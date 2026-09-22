import defaultMemories from "../data/memories.json";

const STORAGE_KEY = "cloudMemories";

export function loadMemories() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMemories));
  return defaultMemories;
}

export function saveMemories(memories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}
