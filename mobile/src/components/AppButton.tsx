import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import colors from "../theme/colors";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  size?: "sm" | "md";
};

const AppButton: React.FC<Props> = ({ title, onPress, variant = "primary", disabled, size = "md" }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.baseSm,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, size === "sm" && styles.textSm]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  baseSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  text: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  textSm: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AppButton;
