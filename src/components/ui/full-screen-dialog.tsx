"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { cn } from "./utils";
import { OverlayPortalProvider } from "./overlay-portal-context";

function FullScreenDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="full-screen-dialog" {...props} />;
}

function FullScreenDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="full-screen-dialog-trigger" {...props} />;
}

function FullScreenDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="full-screen-dialog-portal" container={document.body} {...props} />;
}

function FullScreenDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="full-screen-dialog-close" {...props} />;
}

const FullScreenDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="full-screen-dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[9999] bg-black/30 md:bg-black/50",
      className,
    )}
    {...props}
  />
));
FullScreenDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const FullScreenDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    fullWidth?: boolean;
  }
>(({ className, children, fullWidth, ...props }, ref) => {
  // Detect if we're on desktop
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  
  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  const hasDescription = React.Children.toArray(children).some(
    (child: any) => {
      // Check for direct DialogDescription component
      if (child?.type?.displayName === 'FullScreenDialogDescription') return true;
      
      // Check for data-slot attribute
      if (child?.props?.["data-slot"] === 'full-screen-dialog-description') return true;
      
      // Check if it's a DialogPrimitive.Description
      if (child?.type === DialogPrimitive.Description) return true;
      
      // Check nested children (for DialogHeader containing DialogDescription)
      if (child?.props?.children) {
        const nestedChildren = React.Children.toArray(child.props.children);
        return nestedChildren.some((nestedChild: any) => 
          nestedChild?.type?.displayName === 'FullScreenDialogDescription' ||
          nestedChild?.props?.["data-slot"] === 'full-screen-dialog-description' ||
          nestedChild?.type === DialogPrimitive.Description
        );
      }
      
      return false;
    }
  );
  
  const hasTitle = React.Children.toArray(children).some(
    (child: any) => {
      // Check for direct DialogTitle component
      if (child?.type?.displayName === 'FullScreenDialogTitle') return true;
      
      // Check for data-slot attribute
      if (child?.props?.["data-slot"] === 'full-screen-dialog-title') return true;
      
      // Check if it's a DialogPrimitive.Title
      if (child?.type === DialogPrimitive.Title) return true;
      
      // Check nested children (for DialogHeader containing DialogTitle)
      if (child?.props?.children) {
        const nestedChildren = React.Children.toArray(child.props.children);
        return nestedChildren.some((nestedChild: any) => 
          nestedChild?.type?.displayName === 'FullScreenDialogTitle' ||
          nestedChild?.props?.["data-slot"] === 'full-screen-dialog-title' ||
          nestedChild?.type === DialogPrimitive.Title
        );
      }
      
      return false;
    }
  );
  
  // Determine the aria-describedby value
  const getAriaDescribedBy = () => {
    // If there's already an aria-describedby prop provided, use it
    if (props["aria-describedby"]) {
      return props["aria-describedby"];
    }
    
    // If there's a DialogDescription child, don't set aria-describedby (let Radix handle it)
    if (hasDescription) {
      return undefined;
    }
    
    // Otherwise, use our fallback description
    return "full-screen-dialog-fallback-description";
  };

  const ariaDescribedBy = getAriaDescribedBy();
  const shouldShowFallback = !hasDescription && !props["aria-describedby"];
  
  // Always set aria-describedby to suppress Radix warnings
  // Only apply width constraint if not fullWidth
  const desktopStyle = isDesktop && !fullWidth ? {
    width: '33vw',
    maxWidth: '400px',
    minWidth: '360px'
  } : undefined;
  
  const contentProps = {
    ...props,
    "aria-describedby": ariaDescribedBy || "full-screen-dialog-fallback-description",
    style: desktopStyle 
      ? { ...props.style, ...desktopStyle, zIndex: 9999 } 
      : { ...props.style, zIndex: 9999 }
  };
  
  const assignRef = React.useCallback((node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
    setPortalContainer(node);
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<React.ElementRef<typeof DialogPrimitive.Content> | null>).current = node;
    }
  }, [ref]);

  return (
    <FullScreenDialogPortal>
      <FullScreenDialogOverlay />
      <DialogPrimitive.Content
        ref={assignRef}
        data-slot="full-screen-dialog-content"
        className={cn(
          "bg-surface fixed z-[9999]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "duration-300",
          // Mobile: full screen, slide up from bottom, ensure it covers bottom nav
          !isDesktop && "inset-0 w-full h-screen max-h-screen",
          !isDesktop && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          !isDesktop && "bottom-0 top-0 left-0 right-0",
          // Desktop: slide in from right
          isDesktop && "inset-y-0 top-0 bottom-0 right-0 h-full",
          isDesktop && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          isDesktop && "shadow-[-4px_0_16px_rgba(0,0,0,0.1)]",
          // Full width on desktop: left-0 instead of left-auto
          isDesktop && fullWidth && "left-0 w-full",
          className,
        )}
        {...contentProps}
      >
        {!hasTitle && (
          <DialogPrimitive.Title className="sr-only">
            Dialog
          </DialogPrimitive.Title>
        )}
        {!hasDescription && (
          <DialogPrimitive.Description className="sr-only" id="full-screen-dialog-fallback-description">
            Full screen dialog content
          </DialogPrimitive.Description>
        )}
        <OverlayPortalProvider value={portalContainer}>
          {children}
        </OverlayPortalProvider>
      </DialogPrimitive.Content>
    </FullScreenDialogPortal>
  );
});
FullScreenDialogContent.displayName = DialogPrimitive.Content.displayName;

function FullScreenDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="full-screen-dialog-header"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function FullScreenDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="full-screen-dialog-footer"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function FullScreenDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="full-screen-dialog-title"
      className={cn("", className)}
      {...props}
    />
  );
}

function FullScreenDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="full-screen-dialog-description"
      className={cn("", className)}
      {...props}
    />
  );
}

FullScreenDialogDescription.displayName = "FullScreenDialogDescription";

export {
  FullScreenDialog,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogDescription,
  FullScreenDialogFooter,
  FullScreenDialogHeader,
  FullScreenDialogOverlay,
  FullScreenDialogPortal,
  FullScreenDialogTitle,
  FullScreenDialogTrigger,
};
