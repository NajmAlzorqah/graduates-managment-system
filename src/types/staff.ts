export type StaffTodoItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type StaffHomeStats = {
  registeredTodayCount: number;
  certificatesUnderReviewCount: number;
  certificatesApprovedCount: number;
};

export type StaffHomeData = {
  stats: StaffHomeStats;
  todoItems: StaffTodoItem[];
};
