import React from 'react';
import { useMediaQuery } from './use-mobile';

const LIST_ROW_BUMP_QUERY = '(max-width: 1023px)';

type ListRowCardProps = React.HTMLAttributes<HTMLDivElement>;

export function ListRowCard({ className = '', style, children, ...rest }: ListRowCardProps) {
  const bumped = useMediaQuery(LIST_ROW_BUMP_QUERY);
  const mergedStyle = bumped ? { minHeight: '112px', ...style } : style;
  return (
    <div
      {...rest}
      style={mergedStyle}
      className={`flex items-center gap-4 px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function useIsListRowBumped() {
  return useMediaQuery(LIST_ROW_BUMP_QUERY);
}

export function useListRowFonts() {
  const bumped = useIsListRowBumped();
  return bumped
    ? {
        title: 'title-medium',
        bodyMd: 'body-large',
        body: 'body-medium',
        label: 'label-medium',
        tinyText: 'text-sm',
        baseText: 'text-base',
      }
    : {
        title: 'title-small',
        bodyMd: 'body-medium',
        body: 'body-small',
        label: 'label-small',
        tinyText: 'text-[11px]',
        baseText: 'text-sm',
      };
}
