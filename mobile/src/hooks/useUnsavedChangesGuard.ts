import { Alert } from "react-native";
import { useEffect, type MutableRefObject } from "react";

type UseUnsavedChangesGuardParams = {
  navigation: any;
  enabled: boolean;
  hasUnsavedChanges: boolean;
  allowExitWithoutPromptRef?: MutableRefObject<boolean>;
  title?: string;
  message?: string;
  stayText?: string;
  exitText?: string;
};

export function useUnsavedChangesGuard({
  navigation,
  enabled,
  hasUnsavedChanges,
  allowExitWithoutPromptRef,
  title = "Sair sem salvar?",
  message = "Você tem alterações não salvas. Deseja realmente sair sem salvar?",
  stayText = "Continuar editando",
  exitText = "Sair sem salvar",
}: UseUnsavedChangesGuardParams) {
  // Guard de navegação: confirma o descarte quando existem alterações não salvas.
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (allowExitWithoutPromptRef?.current) return;
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(title, message, [
        { text: stayText, style: "cancel" },
        {
          text: exitText,
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });

    return unsubscribe;
  }, [
    allowExitWithoutPromptRef,
    enabled,
    exitText,
    hasUnsavedChanges,
    message,
    navigation,
    stayText,
    title,
  ]);
}
