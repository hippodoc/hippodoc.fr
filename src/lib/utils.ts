import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  differenceInDays, 
  startOfWeek as dateStartOfWeek, 
  endOfWeek as dateEndOfWeek, 
  format as dateFormat, 
  parse, 
  getWeek as getDateWeek, 
  addDays, 
  isAfter, 
  isBefore,
  parseISO,
  startOfDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Fonction utilitaire pour les classes conditionnelles Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatage de la semaine pour l'affichage
export function formatWeekKey(weekKey: string): string {
  const parts = weekKey.split('-W');
  if (parts.length !== 2) return weekKey;
  
  const year = parseInt(parts[0]);
  const weekNumber = parseInt(parts[1]);
  
  // Calculer la date de début et de fin de la semaine
  const startOfWeek = dateStartOfWeek(new Date(year, 0, 1 + (weekNumber - 1) * 7), { weekStartsOn: 1 });
  const endOfWeek = dateEndOfWeek(startOfWeek, { weekStartsOn: 1 });
  
  // Formater les dates
  const formattedStart = dateFormat(startOfWeek, 'dd MMM', { locale: fr });
  const formattedEnd = dateFormat(endOfWeek, 'dd MMM yyyy', { locale: fr });
  
  return `${formattedStart} - ${formattedEnd}`;
}

// Formatage de devises
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Détermine si un remplacement est sur une seule journée
export function isSingleDayReplacement(remplacement: any): boolean {
  return !remplacement.est_periode && !remplacement.date_fin;
}

// Calcule le nombre de jours travaillés
export function getWorkDaysCount(remplacement: any): number {
  // Si le remplacement spécifie explicitement le nombre de jours travaillés
  if (remplacement.jours_travailles && remplacement.jours_travailles > 0) {
    return remplacement.jours_travailles;
  }
  
  // Si c'est une période avec date de début et de fin
  if (remplacement.date_fin) {
    const startDate = new Date(remplacement.date);
    const endDate = new Date(remplacement.date_fin);
    return differenceInDays(endDate, startDate) + 1; // +1 car on compte le jour de début
  }
  
  // Par défaut, un remplacement compte pour 1 jour
  return 1;
}

// Calcule le revenu net à partir du montant brut et du pourcentage de rétrocession
export function calculateNetRevenue(remplacement: any): number {
  const montantBrut = remplacement.montant_encaisse || 0;
  const pourcentage = remplacement.pourcentage_retrocession || 0;
  return (montantBrut * pourcentage) / 100;
}

// Obtient la clé de semaine au format ISO 8601 (YYYY-Www)
export function getWeekKey(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const year = dateObj.getFullYear();
  const weekNumber = getDateWeek(dateObj, { weekStartsOn: 1, firstWeekContainsDate: 4 });
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Obtient les dates de début et de fin d'une semaine à partir de sa clé
export function getWeekDates(weekKey: string): { start: Date; end: Date } {
  const [year, week] = weekKey.split('-W');
  const firstDayOfYear = new Date(parseInt(year), 0, 1);
  const weekNumber = parseInt(week);
  
  const dayOfYear = (weekNumber - 1) * 7;
  const approximateDate = addDays(firstDayOfYear, dayOfYear);
  const startDate = dateStartOfWeek(approximateDate, { weekStartsOn: 1 });
  const endDate = dateEndOfWeek(startDate, { weekStartsOn: 1 });
  
  return { start: startDate, end: endDate };
}

// Formatage de la période de la semaine
export function formatWeekRange(weekKey: string): string {
  const { start, end } = getWeekDates(weekKey);
  return `Semaine du ${dateFormat(start, 'dd/MM/yyyy')} au ${dateFormat(end, 'dd/MM/yyyy')}`;
}

// Distribue le revenu d'un remplacement sur les jours CALENDAIRES de la période
// IMPORTANT: Pour les statistiques, le comptage des "jours travaillés" doit être fait 
// séparément avec getWorkDaysCount() - cette fonction distribue sur les jours calendaires
// pour que le total des revenus distribués = netRevenue exact
export function distributeRevenueOverDays(remplacement: any): { date: Date, revenue: number }[] {
  const result: { date: Date, revenue: number }[] = [];
  const netRevenue = calculateNetRevenue(remplacement);
  
  // Si c'est un remplacement d'un jour
  if (isSingleDayReplacement(remplacement)) {
    result.push({
      date: new Date(remplacement.date),
      revenue: netRevenue
    });
    return result;
  }
  
  // Si c'est une période : distribuer sur TOUS les jours calendaires
  const startDate = new Date(remplacement.date);
  const endDate = new Date(remplacement.date_fin || remplacement.date);
  
  // CORRECTION Option B : Diviser par le nombre de jours CALENDAIRES (pas jours_travailles)
  // Cela garantit que sum(revenuePerCalendarDay) = netRevenue exact
  const calendarDays = differenceInDays(endDate, startDate) + 1;
  const revenuePerCalendarDay = netRevenue / calendarDays;
  
  let currentDate = startDate;
  while (currentDate <= endDate) {
    result.push({
      date: new Date(currentDate),
      revenue: revenuePerCalendarDay
    });
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
}

/**
 * Formate une Date pour la base de données (YYYY-MM-DD) sans problème de fuseau horaire
 * Utilise date-fns format() pour respecter le timezone local
 */
export function formatDateForDB(date: Date): string {
  return dateFormat(date, 'yyyy-MM-dd');
}

/**
 * Retourne la date d'aujourd'hui en format YYYY-MM-DD (timezone local)
 * Utilise date-fns format() pour éviter le bug de toISOString()
 */
export function getTodayString(): string {
  return dateFormat(new Date(), 'yyyy-MM-dd');
}

/**
 * Formate une chaîne de date en format lisible
 */
export function formatDateString(dateStr: string): string {
  try {
    // Si c'est une date Excel (nombre de jours depuis 1900-01-01)
    if (!isNaN(Number(dateStr))) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + Number(dateStr) * 24 * 60 * 60 * 1000);
      return new Intl.DateTimeFormat('fr-FR').format(date);
    }
    
    // Format ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return new Intl.DateTimeFormat('fr-FR').format(new Date(dateStr));
    }
    
    // Si c'est déjà au format JJ/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Autres formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('fr-FR').format(date);
    }
    
    return dateStr;
  } catch (error) {
    return dateStr;
  }
}

/**
 * Formate un nombre de jours travaillés pour l'affichage
 * 0.5 → "½ jour", 1 → "1 jour", 1.5 → "1,5 jours", 2 → "2 jours"
 */
export function formatDaysCount(days: number | null | undefined): string {
  const d = days ?? 1;
  if (d === 0.5) return '½ jour';
  if (d === 1) return '1 jour';
  // Format avec virgule française pour les décimales
  const formatted = d % 1 === 0 
    ? d.toString() 
    : d.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${formatted} jours`;
}
