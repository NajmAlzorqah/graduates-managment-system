import NewNotificationForm from "@/components/staff/new-notification-form";
import { getStudentsBasicInfo } from "@/lib/api/students";

export default async function NewNotificationPage() {
  const students = await getStudentsBasicInfo();

  return (
    <div className="w-full">
      <NewNotificationForm students={students} />
    </div>
  );
}
