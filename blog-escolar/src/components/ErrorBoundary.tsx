import React from "react";
import type { ChildrenProps } from "../interfaces/children";

class ErrorBoundary extends React.Component<ChildrenProps, { hasError: boolean }> {
  constructor(props: ChildrenProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Você pode logar o erro em algum serviço externo aqui
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <h1>Ocorreu um erro inesperado.</h1>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
