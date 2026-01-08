import React from 'react';
import styled from 'styled-components';
import AccessibilityBar from '../components/AccessibilityBar';
import type { ChildrenProps } from "../interfaces/children";

const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-background);
`;

const Header = styled.header`
  background: var(--app-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px clamp(16px, 4vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  color: var(--app-text);
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  padding: clamp(16px, 3vw, 32px);
  display: flex;
  justify-content: center;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Footer = styled.footer`
  background: var(--app-surface);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px clamp(16px, 4vw, 32px);
  text-align: center;
  color: var(--app-muted);
  font-size: 0.9rem;
`;

const MainLayout: React.FC<ChildrenProps> = ({ children }) => {
  return (
    <PageShell>
      <Header>
        <AccessibilityBar />
        <HeaderTitle>Blog Escolar</HeaderTitle>
      </Header>
      <Main>
        <MainContent>{children}</MainContent>
      </Main>
      <Footer>
        <small>© 2025 Blog Escolar</small>
      </Footer>
    </PageShell>
  );
};

export default MainLayout;
