// Importa Alert do React Native para exibir alertas na tela
import { Alert } from "react-native";
// Importa useEffect para lidar com efeitos colaterais e MutableRefObject para referências mutáveis
import { useEffect, type MutableRefObject } from "react";

// Define os parâmetros aceitos pelo hook
// navigation: controle de navegação
// enabled: ativa ou desativa o guard
// hasUnsavedChanges: indica se há alterações não salvas
// allowExitWithoutPromptRef: referência para permitir saída sem alerta
// title, message, stayText, exitText: textos customizáveis do alerta
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

// Hook para proteger contra perda de alterações não salvas
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
  // Efeito que adiciona o guard de navegação quando ativado
  useEffect(() => {
    // Se não estiver ativado, não faz nada
    if (!enabled) return;

    // Adiciona listener para evento de saída da tela
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      // Permite saída sem alerta se referência permitir
      if (allowExitWithoutPromptRef?.current) return;
      // Se não há alterações não salvas, permite saída normalmente
      if (!hasUnsavedChanges) return;

      // Impede a navegação padrão (bloqueia saída)
      e.preventDefault();

      // Exibe alerta para o usuário decidir se quer sair sem salvar
      Alert.alert(title, message, [
        { text: stayText, style: "cancel" },
        {
          text: exitText,
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });

    // Remove o listener ao desmontar ou mudar dependências
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
