// Canvas API utility functions
// Usage: import { fetchCanvasCourses, fetchCanvasAssignments, fetchCanvasEvents } from './canvas';

const PROXY_PATH = '/api/canvas-proxy';

/**
 * Fetch all courses for the authenticated user.
 * @param {string} baseUrl - Canvas instance URL (e.g. https://school.instructure.com)
 * @param {string} token - Canvas API token
 */
export const fetchCanvasCourses = async (baseUrl: string, token: string) => {
  let allCourses: any[] = [];
  let url = `/api/canvas-proxy?endpoint=courses&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}&per_page=50`;
  while (url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    const data = await response.json();
    allCourses = allCourses.concat(data);
    // Parse Link header for next page
    const link = response.headers.get('Link');
    if (link) {
      const match = link.match(/<([^>]+)>; rel="next"/);
      if (match) {
        // Convert the next page Canvas API URL to a canvas-proxy URL
        const nextUrl = new URL(match[1]);
        const endpoint = nextUrl.pathname.replace('/api/v1/', '');
        const search = nextUrl.search;
        url = `/api/canvas-proxy?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}${search}`;
      } else {
        url = '';
      }
    } else {
      url = '';
    }
  }
  return allCourses;
};

/**
 * Fetch assignments for a given course.
 * @param {string} baseUrl
 * @param {string} token
 * @param {number|string} courseId
 */
export async function fetchCanvasAssignments(baseUrl: string, token: string, courseId: number | string) {
  if (courseId === undefined) {
    throw new Error('Course ID is undefined');
  }
  let allAssignments: any[] = [];
  let url = `${PROXY_PATH}?endpoint=courses/${courseId}/assignments&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}&per_page=50`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const data = await res.json();
    allAssignments = allAssignments.concat(data);
    // Parse Link header for next page
    const link = res.headers.get('Link');
    if (link) {
      const match = link.match(/<([^>]+)>; rel="next"/);
      if (match) {
        // Convert the next page Canvas API URL to a canvas-proxy URL
        const nextUrl = new URL(match[1]);
        const endpoint = nextUrl.pathname.replace('/api/v1/', '');
        const search = nextUrl.search;
        url = `/api/canvas-proxy?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}${search}`;
      } else {
        url = '';
      }
    } else {
      url = '';
    }
  }
  return allAssignments;
}

/**
 * Fetch calendar events for the authenticated user.
 * @param {string} baseUrl
 * @param {string} token
 */
export async function fetchCanvasEvents(baseUrl: string, token: string) {
  let allEvents: any[] = [];
  let url = `${PROXY_PATH}?endpoint=calendar_events&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}&per_page=50`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch calendar events');
    const data = await res.json();
    allEvents = allEvents.concat(data);
    // Parse Link header for next page
    const link = res.headers.get('Link');
    if (link) {
      const match = link.match(/<([^>]+)>; rel="next"/);
      if (match) {
        // Convert the next page Canvas API URL to a canvas-proxy URL
        const nextUrl = new URL(match[1]);
        const endpoint = nextUrl.pathname.replace('/api/v1/', '');
        const search = nextUrl.search;
        url = `/api/canvas-proxy?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}${search}`;
      } else {
        url = '';
      }
    } else {
      url = '';
    }
  }
  return allEvents;
}

export async function fetchCanvasQuizzes(baseUrl: string, token: string, courseId: number | string) {
  let allQuizzes: any[] = [];
  let url = `/api/canvas-proxy?endpoint=courses/${courseId}/quizzes&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}&per_page=50`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    const data = await res.json();
    allQuizzes = allQuizzes.concat(data);
    const link = res.headers.get('Link');
    if (link) {
      const match = link.match(/<([^>]+)>; rel=\"next\"/);
      if (match) {
        const nextUrl = new URL(match[1]);
        const endpoint = nextUrl.pathname.replace('/api/v1/', '');
        const search = nextUrl.search;
        url = `/api/canvas-proxy?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}${search}`;
      } else {
        url = '';
      }
    } else {
      url = '';
    }
  }
  return allQuizzes;
}

export async function fetchCanvasAnnouncements(baseUrl: string, token: string, courseId: number | string) {
  let allAnnouncements: any[] = [];
  let url = `/api/canvas-proxy?endpoint=courses/${courseId}/discussion_topics&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}&per_page=50&only_announcements=true`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    const data = await res.json();
    allAnnouncements = allAnnouncements.concat(data);
    const link = res.headers.get('Link');
    if (link) {
      const match = link.match(/<([^>]+)>; rel=\"next\"/);
      if (match) {
        const nextUrl = new URL(match[1]);
        const endpoint = nextUrl.pathname.replace('/api/v1/', '');
        const search = nextUrl.search;
        url = `/api/canvas-proxy?endpoint=${encodeURIComponent(endpoint)}&token=${encodeURIComponent(token)}&baseUrl=${encodeURIComponent(baseUrl)}${search}`;
      } else {
        url = '';
      }
    } else {
      url = '';
    }
  }
  console.log(allAnnouncements)
  return allAnnouncements;
} 