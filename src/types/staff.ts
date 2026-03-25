export type StaffTodoItem = {
  id: string;
  title: string;
  completed: boolean;
  staffId: string;
  staffName?: string;
};

export type StaffHomeStats = {
  registeredTodayCount: number;
  certificatesUnderReviewCount: number;
  certificatesApprovedCount: number;
  certificatesDeliveredCount: number;
};

export type StaffHomeData = {
  stats: StaffHomeStats;
  todoItems: StaffTodoItem[];
};
