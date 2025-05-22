// Permission definitions
export const permissions = [
  {
    id: 0,
    code: "PROJECT_ADMIN",
    name: "Project Administration",
    description: "Delete or edit project general configuration",
    bit: 1 << 0,
  },
  {
    id: 1,
    code: "MEMBER_MANAGE",
    name: "Member Management",
    description: "Invite/remove members and edit their roles",
    bit: 1 << 1,
  },
  {
    id: 2,
    code: "REQ_MANAGE",
    name: "Items Management",
    description: "Create/edit/delete Epics, User Stories and tasks (generated or manual)",
    bit: 1 << 2,
  },
  {
    id: 3,
    code: "SPRINT_PLAN",
    name: "Sprint Planning Management",
    description: "Define what goes into each sprint and assign members",
    bit: 1 << 3,
  },
  {
    id: 4,
    code: "MEETING_MANAGE",
    name: "Meeting Management",
    description: "Schedule and conduct meetings",
    bit: 1 << 4,
  },
  {
    id: 5,
    code: "ITEM_REVIEW",
    name: "Item Review",
    description: "Reject/accept items or bugs (includes moving to review)",
    bit: 1 << 5,
  },
  {
    id: 6,
    code: "FORCE_DONE",
    name: "Direct Complete (Force Done)",
    description: "Move an item directly to 'Done' without going through review",
    bit: 1 << 6,
  },
  {
    id: 7,
    code: "ROADMAP_EDIT",
    name: "Roadmap Editing",
    description: "Order or reconfigure the roadmap",
    bit: 1 << 7,
  },
  {
    id: 8,
    code: "TEAM_MANAGE",
    name: "Team Management",
    description: "Create/edit/delete teams within the project",
    bit: 1 << 8,
  },
  {
    id: 9,
    code: "BIOMETRIC_SESSION",
    name: "Biometric Session Control",
    description: "Start and manage sessions with biometric devices",
    bit: 1 << 9,
  },
]

// Predefined roles
export const predefinedRoles = [
  {
    id: "owner",
    name: "Owner",
    description: "Full access to all project functions",
    bitmask: 0b1111111111,
    isDefault: true,
  },
  {
    id: "admin",
    name: "Admin",
    description: "General project administration without the ability to delete it",
    bitmask: 0b0111111110,
    isDefault: true,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Task development and sprint management",
    bitmask: 0b0000000000,
    isDefault: true,
  },
]