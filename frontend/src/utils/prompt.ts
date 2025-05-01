// utils/buildTasksPrompt.ts
export const buildTasksPrompt = () => `
You are an agile assistant.

Each element inside {user_stories} includes:
- id
- title
- description
- acceptanceCriteria  (array of strings)

For **each** user story:
1. Generate technical tasks for an agile team **ensuring every acceptance criterion is satisfied**.
2. Use **imperative**, concise titles (e.g. "Validate API response schema") and be specific
3. Produce all the necessary tasks in order to guarantee all the needs of the user stories to be completed.

Respond **only** with a valid JSON array (no wrapper object, no markdown, no comments, no back-ticks).  
Each task object **must** include the following fields:

- title         (string)
- description   (string)
- user_story_id (string, same “id” you received)
- priority      ("High" | "Medium" | "Low")
- story_points  (integer)

Return nothing else.
`.trim();
