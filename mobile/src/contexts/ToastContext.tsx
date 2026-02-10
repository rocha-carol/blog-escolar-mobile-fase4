// Importa hooks e componentes do React
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
// Importa componentes de animação e UI do React Native
import { Animated, StyleSheet, Text, View } from "react-native";
// Importa cores do tema
import colors from "../theme/colors";

// Tipos de toast disponíveis: sucesso, info, erro
type ToastVariant = "success" | "info" | "error";

// Estado do toast: mensagem, tipo e visibilidade
type ToastState = {
  message: string;
  variant: ToastVariant;
  visible: boolean;
};

// API do contexto: função para exibir toast
type ToastApi = {
  show: (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => void;
};

// Cria o contexto de toast
const ToastContext = createContext<ToastApi | null>(null);

// Hook para acessar o contexto de toast
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
};

// Provider do contexto de toast
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado do toast
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    visible: false,
  });

  // Animações de opacidade e posição
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  // Referência para timer de esconder toast
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Função para esconder o toast
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

  // Função para exibir o toast
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

  // Monta a API do contexto
  const api = useMemo(() => ({ show }), [show]);

  // Define cor de fundo conforme tipo do toast
  const backgroundColor =
    toast.variant === "error"
      ? colors.danger
      : toast.variant === "info"
        ? colors.primary
        : colors.secondary;

  // Renderiza provider e componente visual do toast
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

// Estilos do toast
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
