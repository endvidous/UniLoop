import TeacherAssignmentDetailView from "@/src/components/Assignments/teacher/AssignmentDetail";
import { useLocalSearchParams } from "expo-router";

const AssignmentDetailView = () => {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  return <TeacherAssignmentDetailView id={assignmentId} />;
};

export default AssignmentDetailView