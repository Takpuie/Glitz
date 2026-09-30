"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import AccountClient from "@/app/account/AccountClient";

const AccountModalContext = createContext<(() => void) | null>(null);

export function AccountModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  return <AccountModalContext.Provider value={() => setOpen(true)}>
    {children}
    {open && <dialog ref={dialog} aria-label="Your Glitz account" onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto bg-paper p-0 text-ink shadow-xl backdrop:bg-black/50">
      <div className="relative p-6 sm:p-8">
        <button type="button" autoFocus aria-label="Close account dialog" onClick={() => setOpen(false)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <AccountClient modal onAuthenticated={() => { setOpen(false); router.push("/account"); router.refresh(); }} />
      </div>
    </dialog>}
  </AccountModalContext.Provider>;
}

export function AccountLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const open = useContext(AccountModalContext);
  return <Link {...props} href="/account" onClick={(event) => {
    onClick?.(event);
    if (!open || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open();
  }} />;
}
