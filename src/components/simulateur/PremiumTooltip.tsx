import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode, useState } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/lib/use-mobile";

interface PremiumTooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  title?: string;
}

export const PremiumTooltip = ({
  children,
  content,
  side = "top",
  delayDuration = 200,
  title = "Détail",
}: PremiumTooltipProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile : utiliser un Drawer (bottom sheet)
  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="bg-gray-900/98 backdrop-blur-xl border-gray-700 max-h-[85vh]">
            <DrawerHeader className="flex justify-between items-center border-b border-gray-700/50 pb-3">
              <DrawerTitle className="text-white text-lg font-medium">{title}</DrawerTitle>
              <DrawerClose className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50">
                <X className="h-5 w-5" />
              </DrawerClose>
            </DrawerHeader>
            <div className="p-4 pb-24 text-white overflow-y-auto w-full">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop : utiliser un Tooltip classique (hover)
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side={side}
            align="center"
            collisionPadding={{ top: 16, bottom: 16, left: 20, right: 20 }}
            avoidCollisions={true}
            sticky="always"
            className="max-w-[min(300px,85vw)] max-h-[calc(100vh-64px)] overflow-y-auto bg-gray-900/95 backdrop-blur-md text-white border-gray-700 shadow-2xl p-3 md:p-4 z-[100000] pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 duration-300"
            sideOffset={8}
          >
            {content}
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
};
