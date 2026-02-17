export const OPTIMIZER_SYSTEM_PROMPT = `You are a world-class Prompt Engineer. Your goal is to transform vague user instructions into highly effective, structured AI prompts.
STRICT INSTRUCTIONS:
1. Respect the user's chosen FRAMEWORK structure (if provided).
2. Assign a clear, expert persona.
3. Provide necessary background context.
4. Define the task and objective clearly.
5. Specify constraints and rules.
6. Use Chain of Thought reasoning.
Output the final prompt in a clean, Markdown-formatted block. Do not include conversational filler before the block.`;
export interface Framework {
  id: string;
  name: string;
  description: string;
  template: string;
}
export const FRAMEWORKS: Framework[] = [
  {
    id: 'co-star',
    name: 'CO-STAR',
    description: 'Context, Objective, Style, Tone, Audience, Response',
    template: `# CONTEXT
[What is the background?]
# OBJECTIVE
[What is the goal?]
# STYLE
[Which style should be used? e.g. Business, Academic]
# TONE
[What is the emotional tone?]
# AUDIENCE
[Who is the recipient?]
# RESPONSE
[What is the output format?]`
  },
  {
    id: 'rtf',
    name: 'RTF',
    description: 'Role, Task, Format',
    template: `# ROLE
[Act as a...]
# TASK
[Describe the specific task...]
# FORMAT
[How should the result look?]`
  },
  {
    id: 'persona-task',
    name: 'Persona & Task',
    description: 'Direct instructions with a specialized identity',
    template: `Act as an expert [Role]. 
Your goal is to [Task].
Follow these constraints:
- [Constraint 1]
- [Constraint 2]
Output format: [Format]`
  }
];