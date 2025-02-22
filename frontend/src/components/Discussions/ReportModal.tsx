import React, { useMemo, useCallback } from "react";
import { TextInput, StyleSheet } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import debounce from "lodash/debounce";

interface ReportModalProps {
  visible: boolean;
  onDismiss: () => void;
  reportReason: string;
  setReportReason: (value: string) => void;
  onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = React.memo(
  ({ visible, onDismiss, reportReason, setReportReason, onSubmit }) => {
    // Debounce the state update so it doesn't update on every keystroke
    const debouncedChange = useMemo(
      () => debounce((value: string) => setReportReason(value), 300),
      [setReportReason]
    );

    const handleChange = useCallback(
      (value: string) => {
        debouncedChange(value);
      },
      [debouncedChange]
    );

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
          <Dialog.Title>Report Discussion</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.reportInput}
              placeholder="Enter reason for report"
              placeholderTextColor="#cccccc"
              defaultValue={reportReason}
              onChangeText={handleChange}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button onPress={onSubmit}>Submit Report</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);

const styles = StyleSheet.create({
  reportInput: {
    borderWidth: 1,
    borderColor: "#353535",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    minHeight: 60,
    backgroundColor: "transparent",
    color: "#ffffff",
  },
});

export default ReportModal;
