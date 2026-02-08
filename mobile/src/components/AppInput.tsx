import React from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?: "emailAddress" | "password" | "name" | "none";
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  variant?: "default" | "soft";
  containerStyle?: StyleProp<ViewStyle>;
  density?: "regular" | "compact";
  inputStyle?: StyleProp<TextStyle>;
};

const AppInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  editable = true,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  textContentType,
  leftIconName,
  rightIconName,
  variant = "default",
  containerStyle,
  density = "regular",
  inputStyle,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!label?.trim() && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          variant === "soft" && styles.inputContainerSoft,
          density === "compact" && styles.inputContainerCompact,
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={density === "compact" ? 16 : 18}
            color={colors.muted}
            style={[styles.leftIcon, density === "compact" && styles.iconCompact]}
          />
        )}
        <TextInput
          style={[
            styles.input,
            (leftIconName || rightIconName) && styles.inputWithIcon,
            density === "compact" && styles.inputCompact,
            multiline && styles.multiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
        />
        {rightIconName && (
          <Ionicons
            name={rightIconName}
            size={density === "compact" ? 16 : 18}
            color={colors.muted}
            style={[styles.rightIcon, density === "compact" && styles.iconCompact]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  inputContainerCompact: {
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  inputContainerSoft: {
    borderWidth: 0,
    borderRadius: 14,
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  inputContainerMultiline: {
    alignItems: "flex-start",
    paddingTop: 10,
    paddingBottom: 10,
  },
  leftIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  rightIcon: {
    marginLeft: 8,
    marginTop: 1,
  },
  iconCompact: {
    marginTop: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputWithIcon: {
    paddingVertical: 12,
  },
  inputCompact: {
    paddingVertical: 10,
    fontSize: 14,
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
  },
});

export default AppInput;
