import MeetingsDetail from "@/src/components/Meetings/MeetingsDetails";
import { useLocalSearchParams } from "expo-router";

const MeetingDetailPage = () => {
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  console.log(meetingId);
  return <MeetingsDetail id={meetingId} />;
};

export default MeetingDetailPage;
