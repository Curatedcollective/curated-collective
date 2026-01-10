import { z } from 'zod';
import { insertCreationSchema, insertAgentSchema, creations, agents } from './schema';

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
