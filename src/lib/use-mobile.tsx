
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Fonction de vérification de la taille de l'écran
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initialiser la valeur
    checkIsMobile()
    
    // Ajouter l'écouteur d'événement pour les changements de taille
    window.addEventListener("resize", checkIsMobile)
    
    // Nettoyage
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Pour les rendus côté serveur et l'initialisation
  if (typeof isMobile === 'undefined') {
    // Détection basique pour le premier rendu
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // Si on est en SSR, on suppose desktop par défaut
    return false
  }

  return isMobile
}
