import { Suspense } from 'react';
// This component is referenced by the auto-generated router.tsx

interface Props {
  children: React.ReactNode;
}

export const SuspenseWrapper = ({ children }: Props) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};
