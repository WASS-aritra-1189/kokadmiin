import { api } from "@/lib/axios";

// Normalize activity log - extract fields from metadata if missing at top level
function normalizeActivityLog({
  id,
  accessTime,
  description,
  resourceId,
  metadata,
  ...rest
}: Record<string, any>): Record<string, any> {
  // Extract ipAddress from metadata if missing at top level
  const ipAddress = rest.ipAddress ?? metadata?.ipAddress ?? 'Unknown';
  
  // Extract module from description if missing (e.g., "UPDATE on user-details" -> USER_DETAILS)
  let module = rest.module ?? 'Unknown';
  if (!rest.module && description) {
    const match = description.match(/(?:CREATE|UPDATE|DELETE|READ)\s+on\s+(\w+)/i);
    if (match) {
      const rawModule = match[1].toUpperCase();
      module = rawModule.replace(/[-_]/g, '_');
    }
  }
  
  // Extract action from description (e.g., "Created ..." -> CREATE)
  let action = rest.action ?? 'Unknown';
  if (!rest.action && description) {
    if (description.startsWith('CREATE') || description.startsWith('Created')) {
      action = 'CREATE';
    } else if (description.startsWith('UPDATE') || description.startsWith('Updated')) {
      action = 'UPDATE';
    } else if (description.startsWith('DELETE') || description.startsWith('Deleted')) {
      action = 'DELETE';
    } else if (description.startsWith('READ')) {
      action = 'READ';
    }
  }

  // Exclude account from response
  const { account, ...restWithoutAccount } = rest;

  return {
    ...restWithoutAccount,
    id,
    accessTime,
    ipAddress,
    module,
    action,
    description: description ?? 'Unknown',
    method: rest.method ?? metadata?.method ?? '-',
    endpoint: rest.endpoint ?? metadata?.url ?? '-',
    resourceId: resourceId ?? '-',
    device: rest.device ?? metadata?.device ?? 'Unknown',
    metadata,
    statusCode: rest.statusCode ?? metadata?.statusCode ?? 0,
    userAgent: rest.userAgent ?? metadata?.userAgent ?? 'Unknown',
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  };
}

export interface ActivityLogItem {
  id: string;
  accountId: string;
  loginId: string;
  accessTime: string;
  ipAddress: string;
  module: string;
  action: string;
  description: string;
  method: string;
  endpoint: string;
  resourceId: string;
  device: string;
  metadata: Record<string, any>;
  statusCode: number;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogsResponse {
  success: boolean;
  messageId?: string;
  messageType?: string;
  data: {
    data: ActivityLogItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ActivityLogsByModuleResponse {
  success: boolean;
  data: {
    module: string;
    action: string;
    count: number;
  }[];
}

export interface ActivityLogsQuery {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  accountId?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
}

type ApiResponse = Record<string, any>;

export const activityLogsService = {
  getAll: (params: ActivityLogsQuery = {}) =>
    api.get<ApiResponse>("/activity-logs", { params })
      .then((response) => {
        const apiData = response.data;
        const { data: items, total, page, limit } = apiData.data;
        return {
          success: apiData.success,
          messageId: apiData.messageId,
          messageType: apiData.messageType,
          data: {
            data: items.map(normalizeActivityLog),
            total,
            page,
            limit,
          },
        };
      }),

  getByModule: (params: Pick<ActivityLogsQuery, 'startDate' | 'endDate'>) =>
    api.get("/activity-logs/by-module", { params }).then(r => r.data.data),

  getTopUsers: (params: Pick<ActivityLogsQuery, 'startDate' | 'endDate' | 'limit'>) =>
    api.get("/activity-logs/top-users", { params }).then(r => r.data.data),

  getMyLogs: (params: ActivityLogsQuery = {}) =>
    api.get("/activity-logs/my-logs", { params }).then((response) => {
      const apiData = response.data;
      const { data: items, total, page, limit } = apiData.data;
      return {
        success: apiData.success,
        data: {
          data: items.map(normalizeActivityLog),
          total,
          page,
          limit,
        },
      };
    }),
};