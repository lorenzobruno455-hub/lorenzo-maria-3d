// Legacy encounters remain resumable; never offer a second start for the same ID.
export function legacyQuestOwns(progress,id){const status=progress.adventure?.quests?.[id]?.status;return ['lost-book','familiar-music'].includes(id)&&!!progress.living?.events?.[id]&&status!=='active'&&status!=='completed';}
