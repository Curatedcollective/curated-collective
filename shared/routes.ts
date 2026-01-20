import { z } from 'zod';
import { insertCreationSchema, insertAgentSchema, creations, agents, insertConstellationEventSchema, updateConstellationEventSchema, insertEventParticipantSchema, insertEventNotificationSchema, constellationEvents } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  creations: {
    list: {
      method: 'GET' as const,
      path: '/api/creations',
      input: z.object({
        userId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof creations.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/creations/:id',
      responses: {
        200: z.custom<typeof creations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/creations',
      input: insertCreationSchema,
      responses: {
        201: z.custom<typeof creations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/creations/:id',
      input: insertCreationSchema.partial(),
      responses: {
        200: z.custom<typeof creations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/creations/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents',
      input: z.object({
        userId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id',
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/agents',
      input: insertAgentSchema,
      responses: {
        201: z.custom<typeof agents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/agents/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/agents/:id',
      input: insertAgentSchema.partial(),
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  // New: Link agents to conversations
  chat: {
    addAgent: {
      method: 'POST' as const,
      path: '/api/conversations/:id/agents',
      input: z.object({ agentId: z.number() }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    triggerAgent: {
      method: 'POST' as const,
      path: '/api/conversations/:id/trigger-agent',
      input: z.object({ agentId: z.number() }),
      responses: {
        200: z.void(), // Triggers a stream or background response, client handles SSE normally
      },
    }
  },
  constellationEvents: {
    list: {
      method: 'GET' as const,
      path: '/api/constellation-events',
      input: z.object({
        status: z.string().optional(),
        eventType: z.string().optional(),
        upcoming: z.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof constellationEvents.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/constellation-events/:id',
      responses: {
        200: z.custom<typeof constellationEvents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/constellation-events',
      input: insertConstellationEventSchema,
      responses: {
        201: z.custom<typeof constellationEvents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/constellation-events/:id',
      input: updateConstellationEventSchema,
      responses: {
        200: z.custom<typeof constellationEvents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/constellation-events/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    start: {
      method: 'POST' as const,
      path: '/api/constellation-events/:id/start',
      responses: {
        200: z.custom<typeof constellationEvents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    end: {
      method: 'POST' as const,
      path: '/api/constellation-events/:id/end',
      responses: {
        200: z.custom<typeof constellationEvents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/constellation-events/:id/join',
      input: insertEventParticipantSchema.omit({ eventId: true }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    leave: {
      method: 'POST' as const,
      path: '/api/constellation-events/:id/leave',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    participants: {
      method: 'GET' as const,
      path: '/api/constellation-events/:id/participants',
      responses: {
        200: z.array(z.any()),
      },
    },
    logs: {
      method: 'GET' as const,
      path: '/api/constellation-events/:id/logs',
      responses: {
        200: z.array(z.any()),
      },
    },
    notifications: {
      method: 'GET' as const,
      path: '/api/constellation-events/notifications',
      input: z.object({
        userId: z.string().optional(),
        eventId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
