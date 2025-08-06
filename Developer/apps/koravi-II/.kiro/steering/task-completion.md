# Task Completion Rules

## After Every Completed Task

When you complete any task, you MUST follow this sequence:

1. **Explain what you did in simple language**
   - Use plain English, not technical jargon
   - Focus on the business value and functionality added
   - Keep it concise but informative

2. **Describe visual/UI changes**
   - Specify exactly what the user should see differently in the app
   - Mention any new screens, components, or interactions
   - If no visual changes were made, explicitly state "No visual changes - this was backend/infrastructure work"
   - Include any new navigation options or user flows

3. **Run the development server**
   - Always run `pnpm dev &` (with the & to run in background)
   - NEVER run `pnpm ddev &` as this command doesn't exist
   - Confirm the server is running

## Example Format

```
## Task X.X Complete: [Task Name]

### What I Did
[Simple explanation of functionality added]

### What You'll See
[Specific UI/UX changes or "No visual changes - backend work"]

### Dev Server
✅ Development server is running at http://localhost:3000
```

## Important Notes
- This applies to ALL task completions, not just UI tasks
- Even backend tasks should explain their user-facing impact
- Always be specific about what changed visually
- The dev server command is `pnpm dev &` (not `pnpm ddev &`)