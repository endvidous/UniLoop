import React, { useMemo, useCallback } from "react";
import { TextInput, StyleSheet } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import debounce from "lodash/debounce";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

interface ReportModalProps {
  visible: boolean;
  reportReason: string;
  reportTitle: string;
  onDismiss: () => void;
  setReportReason: (value: string) => void;
  onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = React.memo(
  ({
    visible,
    reportReason,
    reportTitle,
    onDismiss,
    setReportReason,
    onSubmit,
  }) => {
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

    const { colors } = useTheme();
    const styles = StyleSheet.create({
      dialogBox: {
        backgroundColor: colors.background,
        elevation: 0,
        borderWidth: 1,
        borderColor: colors.text,
        overflow: "hidden",
      },
      reportInput: {
        borderWidth: 1,
        borderColor: colors.icon,
        borderRadius: 8,
        padding: 8,
        marginVertical: 8,
        minHeight: 60,
        color: colors.text,
      },
      button: {
        borderColor: colors.tabIconSelected,
        borderWidth: 1,
        borderRadius: 8,
        elevation: 6,
        paddingHorizontal: 10,
      },
    });

    return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={styles.dialogBox}
          theme={{ roundness: 2 }}
        >
          <Dialog.Title>{reportTitle}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              placeholder="Enter reason for report"
              placeholderTextColor={colors.text}
              defaultValue={reportReason}
              onChangeText={handleChange}
              multiline
              maxLength={500}
              style={styles.reportInput}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: "space-between" }}>
            <Button
              textColor={colors.text}
              style={styles.button}
              onPress={onDismiss}
            >
              Cancel
            </Button>
            <Button
              textColor={colors.text}
              style={styles.button}
              onPress={onSubmit}
            >
              Submit Report
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);

export default ReportModal;
