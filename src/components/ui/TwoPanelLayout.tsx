import React from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface TwoPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  leftPanelWidth?: string;
}

export const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  leftPanel,
  rightPanel,
  leftPanelWidth = 'w-full md:w-[380px]',
}) => {
  const isMobile = useIsMobile();
  const hasRightContent = React.Children.count(rightPanel) > 0;

  if (isMobile && !hasRightContent) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - var(--topbar-height) - var(--bottomnav-height))' }}>
        <div className="flex-1 overflow-y-auto">
          {leftPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-0 min-h-0 h-full">
      <div className={`${leftPanelWidth} flex-shrink-0 overflow-hidden flex flex-col border-r border-[var(--border-subtle)]`}>
        {leftPanel}
      </div>
      {hasRightContent && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {rightPanel}
        </div>
      )}
    </div>
  );
};