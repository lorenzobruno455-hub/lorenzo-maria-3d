// Legacy encounters remain resumable; never offer a second start for the same ID.
export function legacyQuestOwns(progress,id){const status=progress.adventure?.quests?.[id]?.status;return ['lost-book','familiar-music'].includes(id)&&!!progress.living?.events?.[id]&&!['active','paused','completed'].includes(status);}

// Interactions and the player must share the same coordinate frame.
export function narrativeOccluders(world,school,follow){return school?.active?follow.obstacles:world.occluders;}
