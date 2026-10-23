import { config } from './config.js';

// Cards and case studies use this exact model. Empty destinations render no link.
export function getProjects(text) {
  return text.projects.items.map(copy => {
    const settings = config.projects[copy.id];
    return { ...copy, ...settings, caseHref: `/My-Portfolio/work/${settings.slug}/` };
  });
}
