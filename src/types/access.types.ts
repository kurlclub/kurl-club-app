export type AccessSubjectType = 'staff' | 'trainer' | (string & {});

export interface AccessModuleDefinition {
  id?: number;
  moduleKey?: string;
  key?: string;
  name?: string;
  moduleName?: string;
  displayName?: string;
  description?: string | null;
}

export interface AccessSubjectPermission {
  moduleKey: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AccessSubjectPermissionsResponse {
  status: string;
  message: string;
  data:
    | AccessSubjectPermission[]
    | {
        permissions?: AccessSubjectPermission[] | null;
      };
}

export interface UpdateAccessSubjectPermissionsPayload {
  permissions: AccessSubjectPermission[];
}
