import React from 'react';
import styled from 'styled-components';
import AccessibilityBar from '../components/AccessibilityBar';
import type { ChildrenProps } from "../interfaces/children";

const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-gradient);
`;

const Header = styled.header`
  background: linear-gradient(135deg, rgba(124, 77, 190, 0.92), rgba(76, 173, 199, 0.92));
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  padding: 20px clamp(18px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 18px 40px rgba(24, 20, 57, 0.18);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  color: #fff;
  letter-spacing: 0.5px;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  padding: clamp(18px, 4vw, 40px);
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
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(124, 77, 190, 0.12);
  padding: 18px clamp(18px, 4vw, 32px);
  text-align: center;
  color: var(--app-muted);
  font-size: 0.9rem;
  backdrop-filter: blur(8px);
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
