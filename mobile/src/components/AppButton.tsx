// Importa React e componentes do React Native
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
// Importa cores do tema
import colors from "../theme/colors";

// Define as propriedades aceitas pelo botão
type Props = {
  title: string; // Texto exibido no botão
  onPress: () => void; // Função chamada ao clicar
  variant?: "primary" | "secondary" | "danger"; // Cor do botão
  disabled?: boolean; // Desabilita o botão
  size?: "sm" | "md"; // Tamanho do botão
};

// Componente de botão reutilizável
const AppButton: React.FC<Props> = ({ title, onPress, variant = "primary", disabled, size = "md" }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base, // Estilo base
        size === "sm" && styles.baseSm, // Estilo para botão pequeno
        styles[variant], // Estilo conforme variante
        disabled && styles.disabled, // Estilo se desabilitado
        pressed && !disabled && styles.pressed, // Estilo ao pressionar
      ]}
    >
      <Text style={[styles.text, size === "sm" && styles.textSm]}>{title}</Text>
    </Pressable>
  );
};

// Estilos do botão para diferentes variações e estados
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
