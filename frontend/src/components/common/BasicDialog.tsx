import React from "react";
import { Portal, Dialog, Button } from "react-native-paper";
import { InteractionManager, StyleSheet } from "react-native";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

interface BasicDialogProps {
  visible: boolean;
  title: string;
  cancelText?: string;
  confirmText?: string;
  onDismiss: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
}

const BasicDialog = ({
  visible,
  title,
  cancelText = "Cancel",
  confirmText = "Delete",
  onDismiss,
  onCancel,
  onConfirm,
}: BasicDialogProps) => {
  const { colors } = useTheme();
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[
          defaultStyles.dialog,
          { backgroundColor: colors.background, borderColor: colors.text },
        ]}
        theme={{ roundness: 2 }}
      >
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Actions style={[defaultStyles.actions]}>
          <Button
            textColor={colors.text}
            style={[
              defaultStyles.button,
              { borderColor: colors.tabIconSelected },
            ]}
            onPress={onCancel || onDismiss}
          >
            {cancelText}
          </Button>
          <Button
            textColor={colors.text}
            style={[
              defaultStyles.button,
              { borderColor: colors.tabIconSelected },
            ]}
            onPress={onConfirm}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const defaultStyles = StyleSheet.create({
  dialog: {
    elevation: 0,
    borderWidth: 1,
    overflow: "hidden",
  },
  actions: {
    justifyContent: "space-between",
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    elevation: 6,
    paddingHorizontal: 10,
  },
});

export default BasicDialog;
