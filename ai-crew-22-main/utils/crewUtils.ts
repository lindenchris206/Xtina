import type { CrewMember } from '../types';

/**
 * Selects a specified number of collaborators from the crew, excluding the lead member.
 * @param leadMemberName The name of the lead agent for the task.
 * @param crew The list of all active crew members.
 * @param count The number of collaborators to select.
 * @returns An array of CrewMember objects who will act as collaborators.
 */
export const selectCollaborators = (
  leadMemberName: string,
  crew: CrewMember[],
  count: number = 2
): CrewMember[] => {
  const availableCrew = crew.filter(m => m.name !== leadMemberName);
  if (availableCrew.length <= count) {
    return availableCrew;
  }

  const leadIndex = crew.findIndex(m => m.name === leadMemberName);
  const collaborators: CrewMember[] = [];
  
  // Start searching for collaborators from the member right after the lead
  for (let i = 1; i <= crew.length; i++) {
    const potentialCollaborator = crew[(leadIndex + i) % crew.length];
    if (potentialCollaborator.name !== leadMemberName) {
      collaborators.push(potentialCollaborator);
    }
    if (collaborators.length === count) {
      break;
    }
  }

  return collaborators;
};