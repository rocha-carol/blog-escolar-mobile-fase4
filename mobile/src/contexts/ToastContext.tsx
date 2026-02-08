import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

type ToastVariant = "success" | "info" | "error";

type ToastState = {
  message: string;
  variant: ToastVariant;
  visible: boolean;
};

type ToastApi = {
  show: (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    visible: false,
  });

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false, message: "" }));
    });
  }, [opacity, translateY]);

  const show: ToastApi["show"] = useCallback(
    (message, options) => {
      const variant = options?.variant ?? "success";
      const durationMs = options?.durationMs ?? 1600;

      setToast({ message, variant, visible: true });

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => hide(), durationMs);
    },
    [hide, opacity, translateY]
  );

  const api = useMemo(() => ({ show }), [show]);

  const backgroundColor =
    toast.variant === "error"
      ? colors.danger
      : toast.variant === "info"
        ? colors.primary
        : colors.secondary;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast.visible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { backgroundColor, opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.toastInner}>
            <Text style={styles.toastText} numberOfLines={3}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    zIndex: 999,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 16,
    flexShrink: 1,
  },
});
