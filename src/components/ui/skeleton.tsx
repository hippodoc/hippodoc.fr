import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "card" | "text" | "avatar" | "badge" | "chart-bar";
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const baseClasses = "rounded-md bg-muted";
  
  const variantClasses = {
    default: "animate-pulse",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    card: "animate-pulse bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100",
    text: "animate-pulse h-4",
    avatar: "animate-pulse rounded-full",
    badge: "animate-pulse rounded-full h-6",
    "chart-bar": "animate-pulse rounded-t-sm",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

// Composants skeleton spécifiques pour le dashboard
function DashboardCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="shimmer" className="h-5 w-24 bg-gray-200" />
        <Skeleton variant="shimmer" className="h-8 w-8 rounded-full bg-gray-200" />
      </div>
      {/* Montant principal */}
      <div className="flex flex-col items-center py-4">
        <Skeleton variant="shimmer" className="h-12 w-40 bg-gray-200" />
        <Skeleton variant="shimmer" className="h-3 w-24 mt-2 bg-gray-100" />
      </div>
      {/* Badge Super-Net */}
      <Skeleton variant="shimmer" className="h-10 w-full rounded-lg bg-gray-200" />
    </div>
  );
}

function ChartSkeleton({ className, barCount = 6, isMobile = false }: { className?: string; barCount?: number; isMobile?: boolean }) {
  // Heights fixes pour éviter tout layout shift - doit matcher exactement RevenueChart
  const barHeights = [65, 45, 80, 55, 70, 60, 50, 75, 40, 85, 48, 72];
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header premium - exactement comme RevenueChart */}
      <div className={cn(
        "border-b border-hippo-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 via-white/60 to-hippo-50/40",
        isMobile ? "px-4 py-2.5" : "px-3 py-1.5"
      )}>
        <div className="flex items-center gap-2.5">
          {/* Icône titre skeleton - rounded-full comme RevenueChart */}
          <Skeleton 
            variant="shimmer" 
            className={cn(
              "rounded-full bg-gradient-to-br from-gray-200 to-gray-300",
              isMobile ? "w-8 h-8" : "w-7 h-7"
            )} 
          />
          <Skeleton variant="shimmer" className={cn("bg-gray-200", isMobile ? "h-5 w-36" : "h-4 w-32")} />
        </div>
        
        {/* Contrôles droite - masqués sur mobile comme dans RevenueChart */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {/* Badge moyenne skeleton - match RevenueChart px-3 py-2 */}
            <div className="bg-gradient-to-r from-hippo-50/60 to-hippo-100/40 border border-hippo-200/40 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="shimmer" className="w-2.5 h-2.5 rounded-full bg-hippo-300" />
                <Skeleton variant="shimmer" className="h-3.5 w-8 bg-gray-200" />
                <Skeleton variant="shimmer" className="h-4 w-16 bg-gray-300" />
              </div>
            </div>
            {/* Toggle période skeleton - match RevenueChart p-1 min-w-[110px] */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200/50 rounded-xl p-1 flex min-w-[110px]">
              <Skeleton variant="shimmer" className="flex-1 h-8 rounded-lg bg-gray-200" />
              <Skeleton variant="shimmer" className="flex-1 h-8 rounded-lg bg-gray-100" />
              <Skeleton variant="shimmer" className="flex-1 h-8 rounded-lg bg-gray-100" />
            </div>
          </div>
        )}
      </div>
      
      {/* Zone graphique avec container premium - exactement comme RevenueChart */}
      <div className={cn("flex-1 min-h-0", isMobile ? "p-2" : "p-2")}>
        <div className={cn(
          "h-full rounded-lg bg-gradient-to-br from-white/80 via-gray-50/40 to-hippo-50/20 border border-gray-200/40 shadow-sm",
          isMobile ? "p-1.5" : "p-1"
        )}>
          <div className="h-full flex items-end justify-around gap-2">
            {Array.from({ length: barCount }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                <Skeleton 
                  variant="shimmer" 
                  className="w-full rounded-t-md bg-gradient-to-t from-gray-200 to-gray-100" 
                  style={{ height: `${barHeights[i % barHeights.length]}%` }}
                />
                <Skeleton variant="shimmer" className="h-3 w-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ReplacementItemCardSkeleton - Skeleton qui correspond exactement à ReplacementItemCard
 * Structure verticale 3 lignes : Header (date + badge) | Badges row | CTA
 */
function ReplacementItemCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative pl-3", className)}>
      {/* Barre colorée latérale - exactement comme ReplacementItemCard */}
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-gray-200 to-gray-300" />
      
      <div className="flex flex-col p-2.5 rounded-xl bg-gradient-to-br from-white/90 to-gray-50/50 border border-gray-100/80">
        {/* Header: Date et Badge - exactement comme ligne 104-109 */}
        <div className="flex items-center justify-between mb-1.5">
          <Skeleton variant="shimmer" className="h-4 w-20 bg-gray-200" />
          <Skeleton variant="shimmer" className="h-5 w-14 rounded-full bg-gray-200" />
        </div>
        
        {/* Badges row - exactement comme ligne 112-148 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Badge fusionné Médecin • Lieu */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-hippo-50/80 border border-hippo-100/60 rounded-full">
            <Skeleton variant="shimmer" className="w-4 h-4 rounded-full bg-hippo-100" />
            <Skeleton variant="shimmer" className="h-3 w-24 bg-hippo-100" />
          </div>
          {/* Distance badge */}
          <Skeleton variant="shimmer" className="h-5 w-12 rounded-full bg-slate-100 border border-slate-200" />
          {/* Rétrocession badge */}
          <Skeleton variant="shimmer" className="h-5 w-10 rounded-full bg-hippo-100 border border-hippo-200/60" />
        </div>
        
        {/* CTA en bas à droite - exactement comme ligne 152-166 */}
        <div className="flex justify-end mt-1.5">
          <Skeleton variant="shimmer" className="h-3.5 w-14 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

// Legacy alias pour compatibilité
function ListItemSkeleton({ className }: { className?: string }) {
  return <ReplacementItemCardSkeleton className={className} />;
}

function UpcomingWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toggle Premium skeleton - premier élément (pas de header séparé) */}
      <div className="px-2.5 pt-2.5 pb-1.5">
        <div className="flex p-1 bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-xl border border-gray-200/50">
          <Skeleton variant="shimmer" className="flex-1 h-8 rounded-lg bg-gray-200" />
          <Skeleton variant="shimmer" className="flex-1 h-8 rounded-lg bg-gray-100" />
        </div>
      </div>
      
      {/* Liste items skeleton - utilise ReplacementItemCardSkeleton */}
      <div className="flex-1 px-2.5 pb-1.5 space-y-1.5">
        {[1, 2, 3].map((i) => (
          <ReplacementItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function UrssafBreakdownSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2 min-h-[100px]", className)}>
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border-2 border-gray-200 bg-gray-50 p-0.5 min-h-[70px]">
            <div className="flex flex-col items-center gap-1 py-1">
              {/* Icône - h-6 w-6 md:h-7 md:w-7 comme UrssafBreakdownSection */}
              <Skeleton variant="shimmer" className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-gray-200" />
              {/* Label */}
              <Skeleton variant="shimmer" className="h-3 w-12 bg-gray-100" />
              {/* Montant */}
              <Skeleton variant="shimmer" className="h-5 w-16 bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuperNetBadgeSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton 
      variant="shimmer" 
      className={cn("h-10 md:h-11 w-full rounded-xl bg-gradient-to-r from-hippo-500/20 via-hippo-400/10 to-hippo-500/20", className)} 
    />
  );
}

function MonthlyTabSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full gap-1.5", className)}>
      {/* Montant principal XXL */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <Skeleton variant="shimmer" className="h-14 w-40 bg-gray-200" />
        <Skeleton variant="shimmer" className="h-3 w-24 mt-2 bg-gray-100" />
      </div>
      {/* Badge Super-Net */}
      <div className="mt-auto">
        <SuperNetBadgeSkeleton />
      </div>
    </div>
  );
}

function YearlyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 md:p-4 lg:p-5 h-full flex flex-col gap-1.5 md:gap-2 lg:gap-3", className)}>
      {/* Header skeleton - exactement comme YearlyDashboardCard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton variant="shimmer" className="w-7 h-7 md:w-8 md:h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-hippo-200 to-hippo-300" />
          <Skeleton variant="shimmer" className="h-5 w-24 bg-gray-200" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="shimmer" className="h-6 w-24 bg-hippo-100 rounded-full" />
          <Skeleton variant="shimmer" className="h-8 w-8 bg-gray-100 rounded-full" />
        </div>
      </div>
      
      {/* Montant central skeleton */}
      <div className="flex-shrink min-h-[60px] flex flex-col items-center justify-center py-2">
        <Skeleton variant="shimmer" className="h-10 md:h-12 w-40 md:w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
        <Skeleton variant="shimmer" className="h-4 w-24 bg-gray-100 rounded mt-2" />
      </div>
      
      {/* Groupe URSSAF + Super-Net - poussé en bas */}
      <div className="mt-auto flex flex-col gap-1.5 md:gap-2 lg:gap-3">
        <UrssafBreakdownSkeleton />
        <SuperNetBadgeSkeleton />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  DashboardCardSkeleton, 
  ChartSkeleton, 
  ListItemSkeleton,
  ReplacementItemCardSkeleton,
  UpcomingWidgetSkeleton,
  UrssafBreakdownSkeleton,
  SuperNetBadgeSkeleton,
  MonthlyTabSkeleton,
  YearlyCardSkeleton
}