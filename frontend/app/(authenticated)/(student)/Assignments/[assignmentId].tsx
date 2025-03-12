import StudentAssignmentDetailView from "@/src/components/Assignments/student/AssignmentDetail";
import { useLocalSearchParams } from "expo-router";

const AssignmentDetailView = () => {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  return <StudentAssignmentDetailView id={assignmentId} />;
};

export default AssignmentDetailView;
