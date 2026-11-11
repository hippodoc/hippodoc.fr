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
// `ReactNode` est un TYPE : l'importer comme une valeur casse le serveur de dev
// dès que Vite n'a pas pré-bundlé React (react est alors servi en CommonJS, qui
// n'expose pas cet export nommé). Le build de production le tolérait, pas le dev.
import { useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/lib/use-mobile";

interface PremiumTooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  title?: string;
  /** Le déclencheur porte déjà son texte (une pastille) : le bouton ne reçoit pas de nom en plus. */
  texteVisible?: boolean;
}

export const PremiumTooltip = ({
  children,
  content,
  side = "top",
  delayDuration = 200,
  title = "Détail",
  texteVisible = false,
}: PremiumTooltipProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  // Le déclencheur est un vrai bouton : il prend le focus au clavier (la bulle
  // s'ouvre au focus), il a un nom pour les lecteurs d'écran et une cible de
  // 44 px au doigt (`.sim-aide-btn`, simulateur.css). Une icône seule est nommée
  // d'après le titre de l'aide.
  const nom = texteVisible ? undefined : `Aide : ${title}`;

  // Mobile : utiliser un Drawer (bottom sheet)
  if (isMobile) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="sim-aide-btn" aria-label={nom}>
          {children}
        </button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="sim sim-tiroir max-h-[85vh]">
            <DrawerHeader className="sim-tiroir-tete flex justify-between items-center pb-3">
              <DrawerTitle className="sim-tiroir-titre">{title}</DrawerTitle>
              <DrawerClose className="sim-tiroir-fermer" aria-label="Fermer">
                <X className="h-5 w-5" />
              </DrawerClose>
            </DrawerHeader>
            <div className="sim-bulle-in p-4 pb-24 overflow-y-auto w-full">
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
          <button type="button" className="sim-aide-btn" aria-label={nom}>
            {children}
          </button>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            side={side}
            align="center"
            collisionPadding={{ top: 16, bottom: 16, left: 20, right: 20 }}
            avoidCollisions={true}
            sticky="always"
            className="sim sim-bulle sim-bulle-in max-w-[min(300px,85vw)] max-h-[calc(100vh-64px)] overflow-y-auto z-[100000] pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 duration-300"
            sideOffset={8}
          >
            {content}
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
};
