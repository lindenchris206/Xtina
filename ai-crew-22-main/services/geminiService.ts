import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import type { CrewMember, MissionPlan, PrioritizedTask, ProjectFile, GroundedSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const getFileTree = (files: ProjectFile[]): string => {
    if (files.length === 0) return "No files in project yet.";
    let tree = "Current project file structure:\n";
    const buildTree = (fileList: ProjectFile[], prefix: string) => {
        fileList.forEach(file => {
            tree += `${prefix}${file.name}\n`;
            if (file.isFolder && file.children) {
                buildTree(file.children, prefix + "  ");
            }
        });
    }
    buildTree(files, "");
    return tree;
};


export const generatePlan = async (objective: string, crew: CrewMember[]): Promise<MissionPlan> => {

    const crewRoster = crew.map(c => `- ${c.name} (${c.specialty})`).join('\n');

    const systemInstruction = `You are Orion, an expert Project Manager AI. Your role is to analyze a user's mission objective and break it down into a series of clear, prioritized, and actionable tasks for a team of specialized AI agents.

    **Your Task:**
    1.  **Analyze the Objective:** Understand the user's high-level goal.
    2.  **Define Project Name & Summary:** Create a concise, descriptive project name and a one-sentence summary.
    3.  **Deliberate (Think Step-by-Step):** First, consider the overall architecture and technology stack required. Second, outline the major steps. Third, refine these steps into specific tasks, assign the most suitable agent, and determine dependencies.
    4.  **Create a Task List:** Each task must be a single, concrete action. Assign exactly one crew member. Define dependencies using the task's future ID (index). Ensure the task list is ordered logically.

    **Crew Roster:**
    ${crewRoster}

    You MUST respond in a valid JSON format that matches the schema. Do not include any text outside of the JSON structure.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a plan for this objective: "${objective}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectName: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        deliberation: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    agent: { type: Type.STRING },
                                    thought: { type: Type.STRING }
                                },
                                required: ['agent', 'thought']
                            }
                        },
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    task: { type: Type.STRING },
                                    member: { type: Type.STRING },
                                    priority: { type: Type.INTEGER },
                                    dependencies: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                                    isComplete: { type: Type.BOOLEAN },
                                },
                                required: ['id', 'task', 'member', 'priority', 'dependencies', 'isComplete']
                            }
                        }
                    },
                    required: ['projectName', 'summary', 'deliberation', 'tasks']
                }
            }
        });

        const planResponse = response.text;
        if (!planResponse) {
            throw new Error("Received an empty plan from the API.");
        }

        let parsedPlan: any;

        if (typeof planResponse === 'string') {
            try {
                parsedPlan = JSON.parse(planResponse);
            } catch (e) {
                console.error("Failed to parse plan JSON string:", planResponse);
                throw new Error("Received invalid JSON format for the plan.");
            }
        } else if (typeof planResponse === 'object') {
            parsedPlan = planResponse;
        } else {
            throw new Error(`Received unexpected plan type from API: ${typeof planResponse}`);
        }

        if (!parsedPlan || typeof parsedPlan !== 'object' || Object.keys(parsedPlan).length === 0) {
            throw new Error("Received an empty or invalid plan object from the API.");
        }

        return parsedPlan as MissionPlan;
    } catch (e) {
        console.error("Error generating plan:", e);
        throw new Error("Failed to generate mission plan from Gemini API.");
    }
};

export interface ExecutionResult {
    actions: { tool: string; args: any }[];
    thoughts: string;
    sources: GroundedSource[];
    isFinished: boolean;
}

export const executeTask = async (
    objective: string,
    task: PrioritizedTask,
    agent: CrewMember,
    collaborators: CrewMember[],
    projectFiles: ProjectFile[],
): Promise<ExecutionResult> => {

    const fileStructure = getFileTree(projectFiles);
    
    const isArchitect = agent.name === 'Cygnus';
    const architectInstruction = isArchitect 
        ? "**SPECIAL INSTRUCTION:** When your task involves creating architecture diagrams or flowcharts, you MUST generate the diagram using Mermaid.js syntax inside a markdown file (e.g., `architecture.md`). Example: `graph TD; A-->B;`" 
        : "";

    const systemInstruction = `You are an expert AI software developer agent. Your name is ${agent.name}, and your specialty is ${agent.specialty}.
    You are part of a team working on a project with the overall objective: "${objective}".
    Your current task is: "${task.task}".

    **Your Responsibilities:**
    1.  **Analyze the Task:** Carefully read your assigned task and understand what needs to be done.
    2.  **Review Context:** You have access to the current state of the project files. Use this to inform your actions.
    3.  **Collaborate:** Your collaborators are: ${collaborators.map(c => c.name).join(', ')}. Mention them in your thoughts if you need to consider their specialties.
    4.  **Take Action:** You must use the provided functions to perform actions. You can perform multiple actions.
        *   Use \`read_file\` to understand existing code before modifying it.
        *   Use \`create_or_update_file\` to write new code or modify existing files.
        *   Use \`google_search\` if you need external information, libraries, or examples.
        *   When your assigned task is fully complete, and only then, call the \`finish_task\` function.
    5.  **Be Efficient:** Write clean, efficient, and correct code. Do not create placeholder files. Implement the full functionality required by your task.

    ${architectInstruction}

    **Project Files:**
    ${fileStructure}
    `;

    const createOrUpdateFile: FunctionDeclaration = {
        name: 'create_or_update_file',
        description: 'Creates a new file or updates an existing file with the given content.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: 'The full path of the file (e.g., "src/components/Button.tsx").' },
                content: { type: Type.STRING, description: 'The new content of the file.' },
                thought: { type: Type.STRING, description: 'Your reasoning for creating/updating this file.' }
            },
            required: ['path', 'content', 'thought']
        }
    };

    const readFile: FunctionDeclaration = {
        name: 'read_file',
        description: 'Reads the content of an existing file.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: 'The full path of the file to read.' },
                thought: { type: Type.STRING, description: 'Your reason for reading this file.' }
            },
            required: ['path', 'thought']
        }
    };
    
    const finishTask: FunctionDeclaration = {
        name: 'finish_task',
        description: 'Call this function when the current task is fully complete.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: 'A brief summary of what you accomplished.' }
            },
            required: ['summary']
        }
    };


    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Execute task: "${task.task}"`,
            config: {
                systemInstruction,
                tools: [
                    { functionDeclarations: [createOrUpdateFile, readFile, finishTask] },
                    { googleSearch: {} }
                ],
            }
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => ({ uri: c.web.uri, title: c.web.title })) || [];

        const functionCalls = response.functionCalls || [];
        if (functionCalls.length > 0) {
            const actions = functionCalls.map(fc => ({
                tool: fc.name,
                args: fc.args,
            }));
            const isFinished = actions.some(a => a.tool === 'finish_task');
            
            // Safely access arguments by casting the unknown type.
            const firstArgs = actions[0]?.args as { thought?: string; summary?: string; } | undefined;
            const thoughts = firstArgs?.thought || firstArgs?.summary || 'Executing action...';

            return { actions, thoughts, sources, isFinished };
        }
        
        const thoughts = String(response.text || '').trim() || "No clear action was decided.";
        return { actions: [], thoughts, isFinished: false, sources };

    } catch (e) {
        console.error("Error executing task:", e);
        throw new Error("Failed to execute task via Gemini API.");
    }
};


export const generateReadme = async (objective: string, projectFiles: ProjectFile[]): Promise<string> => {
    const fileTree = getFileTree(projectFiles);

    const prompt = `Based on the original mission objective and the final project structure, generate a high-quality README.md file.

    **Mission Objective:** ${objective}

    **Final File Structure:**
    ${fileTree}

    The README should be comprehensive and include:
    - A project title
    - A brief description of what the application does
    - A "Getting Started" or "Installation" section with clear, step-by-step instructions.
    - A "Usage" section explaining how to run the application.
    - Mention any prerequisites (like Node.js, npm, etc.).
    - Do not include sections about deployment or docker as those are in separate files.
    
    Format the output as clean Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return String(response.text || '');
    } catch (e) {
        console.error("Error generating README:", e);
        throw new Error("Failed to generate README from Gemini API.");
    }
};