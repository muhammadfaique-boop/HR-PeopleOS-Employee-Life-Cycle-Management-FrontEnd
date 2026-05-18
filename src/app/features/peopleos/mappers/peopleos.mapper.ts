import { Dashboard } from '../../../shared/models/peopleos.models';

export function mapDashboardResponse(response: Dashboard): Dashboard {
  return {
    ...response,
    metrics: response.metrics ?? [],
    employees: response.employees ?? [],
    lifecycle: response.lifecycle ?? [],
    approvals: response.approvals ?? [],
    whoIsOut: response.whoIsOut ?? [],
    holidays: response.holidays ?? [],
    announcements: response.announcements ?? [],
    quickActions: response.quickActions ?? [],
    lifecycleSignals: response.lifecycleSignals ?? [],
    recentActivity: response.recentActivity ?? []
  };
}
