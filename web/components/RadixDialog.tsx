// Optional Radix Dialog wrapper. Requires installing @radix-ui/react-dialog
// Install with: npm --prefix web install @radix-ui/react-dialog

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface RadixDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

export function RadixDialog({ open, onOpenChange, title, children }: RadixDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-[#0B0F19] shadow-2xl">
          {title && <Dialog.Title className="sr-only">{title}</Dialog.Title>}
          {children}
          <Dialog.Close className="sr-only">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default RadixDialog;
