import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const DEFAULT_MANAGEMENT_PASSWORD = "1234";

type ManagementAuthApi = {
  isAuthorized: boolean;
  ensureAuthorized: () => Promise<boolean>;
  resetAuthorization: () => void;
};

const ManagementAuthContext = createContext<ManagementAuthApi | null>(null);

export const useManagementAuth = () => {
  const ctx = useContext(ManagementAuthContext);
  if (!ctx) throw new Error("useManagementAuth deve ser usado dentro de ManagementAuthProvider");
  return ctx;
};

export const ManagementAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visible, setVisible] = useState(false);
  const [senha, setSenha] = useState("");

  const pendingResolveRef = useRef<((ok: boolean) => void) | null>(null);

  const resetAuthorization = useCallback(() => {
    setIsAuthorized(false);
  }, []);

  // Autorização local para abrir telas de gerenciamento; não substitui validações do backend.
  useEffect(() => {
    resetAuthorization();
    if (pendingResolveRef.current) {
      pendingResolveRef.current(false);
      pendingResolveRef.current = null;
    }
    setVisible(false);
    setSenha("");
  }, [user?.id, resetAuthorization]);

  const ensureAuthorized = useCallback(async () => {
    if (isAuthorized) return true;

    if (!user) return false;

    if (user.role !== "professor") {
      toast.show("Acesso restrito a professores.", { variant: "error" });
      return false;
    }

    setSenha("");
    setVisible(true);

    return new Promise<boolean>((resolve) => {
      pendingResolveRef.current = resolve;
    });
  }, [isAuthorized, toast, user]);

  const finish = useCallback((ok: boolean) => {
    setVisible(false);
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolve?.(ok);
  }, []);

  const handleConfirm = useCallback(() => {
    const entered = senha.trim();
    if (entered === DEFAULT_MANAGEMENT_PASSWORD) {
      setIsAuthorized(true);
      finish(true);
      return;
    }

    toast.show("Senha incorreta.", { variant: "error" });
  }, [finish, senha, toast]);

  const handleCancel = useCallback(() => {
    finish(false);
  }, [finish]);

  const api = useMemo(
    () => ({
      isAuthorized,
      ensureAuthorized,
      resetAuthorization,
    }),
    [ensureAuthorized, isAuthorized, resetAuthorization]
  );

  return (
    <ManagementAuthContext.Provider value={api}>
      {children}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
        <Pressable style={styles.backdrop} onPress={handleCancel}>
          <Pressable style={styles.card} onPress={() => null}>
            <Text style={styles.title}>Acesso ao gerenciamento</Text>
            <Text style={styles.subtitle}>Digite a senha para continuar.</Text>

            <AppInput
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder=""
              secureTextEntry
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />

            <View style={styles.actions}>
              <View style={styles.actionBtn}>
                <AppButton title="Cancelar" onPress={handleCancel} variant="secondary" size="sm" />
              </View>
              <View style={styles.actionBtn}>
                <AppButton title="Entrar" onPress={handleConfirm} variant="primary" size="sm" />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ManagementAuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionBtn: {
    minWidth: 96,
  },
});
