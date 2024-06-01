import { z } from "zod";

export const ParametersSchema = z.object({
  maxDistance: z.number(),
});

export const TransactionSchema = z.object({
  date: z.date(),
  amount: z.number(),
  category: z.string(),
  info: z.string(),
  id: z.number()
});

export const TransactionDataSchema = z.object({
  date: z.date(),
  amount: z.number(),
  category: z.string(),
  info: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionData = z.infer<typeof TransactionDataSchema>;
export type Parameters = z.infer<typeof ParametersSchema>;

export interface TransactionGroup {
  expanded: boolean,
  id: number,
  transactions: Transaction[]
}


export function getDayOfWeek0(d: Date) : number {
  const day0 = d.getDay() || 0; // 0..6 (1 = monday)
  const day = (day0+6)%7; // 0..6 (0 = monday)
  return day;
}

export function getDayOfYear(d: Date): number {
  const yearStart = new Date(new Date(d.getFullYear(),0,1));
  const dayOfYear = Math.floor((d.getTime()-yearStart.getTime()) / (1000*60*60*24));
  return dayOfYear;
}

export function getWeekNumber0(d: Date) : number {
  const yearStart = new Date(new Date(d.getFullYear(),0,1));
  const nextYearStart = new Date(new Date(d.getFullYear()+1,0,1));
  const prevYearEnd = new Date(new Date(d.getFullYear()-1,11,31));
  const yearStartDay = getDayOfWeek0(yearStart);
  const nextYearStartDay = getDayOfWeek0(nextYearStart);
  //console.log(`${yearStart.getFullYear()} -> start day ${yearStartDay}`);
  const dayOfYear = getDayOfYear(d);
  //const daysUntilNextYear = Math.round((nextYearStart.getTime()-d.getTime()) / (1000*60*60*24));

  const delta = (yearStartDay<4)?yearStartDay:(-(7-yearStartDay)%7);
  const result = Math.floor((dayOfYear+delta)/7);
  if (getEndOfWeek(d).getFullYear()!==d.getFullYear() && nextYearStartDay<4) return 0;
  if (result<0) return getWeekNumber0(prevYearEnd);
  else return result;
};

export function getStartOfWeek(d: Date) : Date {
  const day = getDayOfWeek0(d);
  return new Date(d.getTime()-day*24*60*60*1000);
};

export function getEndOfWeek(d: Date) : Date {
  return new Date(getStartOfWeek(d).getTime()+6*24*60*60*1000);
};

export function getWeekNumber(d: Date) : number {
  return getWeekNumber0(d)+1;
}
export function getDayName(d: Date): string {
  const days = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const idx = getDayOfWeek0(d);
  if (idx<0 || idx>6) throw new Error('unexpected');
  return days[idx];
}

export function getStartDateOfGroup(group: TransactionGroup): Date {
  if (group.transactions.length===0) return new Date(0);
  return getStartOfWeek(group.transactions[0].date);
}

export function getEndDateOfGroup(group: TransactionGroup): Date {
  return new Date(getStartDateOfGroup(group).getTime()+6*24*60*60*1000);
}

export function getExtendedSummaryText(group: TransactionGroup): string {
  const sum = group.transactions.reduce((prev, t) => prev+t.amount, 0);
  return `${group.transactions.length} entries, total: ${sum.toFixed(2)}€`;
}

export function getGroupIdFromDate(date: Date) : number {
  const week = getWeekNumber0(date);
  if (week<25) return week+(getEndOfWeek(date).getFullYear()*100);
  else return week+(getStartOfWeek(date).getFullYear()*100);
}

export function getTransactionGroupId(transaction: Transaction|TransactionData) : number {
  return getGroupIdFromDate(transaction.date);
}
export function getGroupId(group: TransactionGroup) : number {
  if (group.transactions.length===0) return 0;
  else return getTransactionGroupId(group.transactions[0]);
}

export function getGroupWeekNumber(group: TransactionGroup): number {
  return (getGroupId(group)%100)+1;
}

export function findTransactionGroupForTransaction(transaction: Transaction|TransactionData, groups: TransactionGroup[]): TransactionGroup|undefined {
  return groups.find(group => getGroupId(group)===getTransactionGroupId(transaction));
}

export function createTransactions(transactions: TransactionData[]): Transaction[] {
  const result = new Array<Transaction>();
  transactions.forEach((transaction, idx)=>{
    const fullTransaction = {id:idx, ...transaction};
    result.push(fullTransaction);
  });
  return result;
}

export function createTransactionGroups(transactions: Transaction[], groups?: TransactionGroup[]): TransactionGroup[] {
  const result = new Array<TransactionGroup>();
  transactions.forEach((transaction)=>{
    const group = findTransactionGroupForTransaction(transaction, result);
    if (group===undefined) {
      const groupId = getTransactionGroupId(transaction);
      if (groupId<10000) throw new Error('unexpected group ID; too small');
      result.push({
        expanded: false,
        id: groupId,
        transactions: [transaction]
      });
    }
    else {
      group.transactions.push(transaction);
    }
  });
  result.forEach(group=>{
    group.transactions.sort((a,b)=>a.date.getTime()-b.date.getTime());
  });
  result.sort((a,b)=>a.id-b.id);
  if (groups!==undefined) {
    result.forEach(group=>{
      const orig = groups.find(g=>g.id===group.id);
      if (orig!==undefined) {
        group.expanded = orig.expanded;
      }
      else {
        group.expanded = true;
      }
    })
  }
  else {
    if (result.length>0) {
      result[result.length-1].expanded = true;
    }  
  }
  return result;
}

export function convertDateToHtmlFormat(date: Date): string {
  // const year = date.getFullYear();
  // const day = (date.getDate()).toString().padStart(2, "0");
  // const month = (date.getMonth()+1).toString().padStart(2, "0");
  // const result = `${year}-${month}-${day}`;
  // //console.log(date, "->", result," ", month, " from ", date);
  // return result;
  return date.toISOString();
}

export function convertDateToSimplLocalHtmlFormat(date: Date): string {
  const year = date.getFullYear();
  const day = (date.getDate()).toString().padStart(2, "0");
  const month = (date.getMonth()+1).toString().padStart(2, "0");
  const result = `${year}-${month}-${day}`;
  //console.log(date, "->", result," ", month, " from ", date);
  return result;
}

export function convertHtmlFormatToDate(html: string): Date {
  // if (html.length<10) throw new Error(`bad date format: ${html}`);
  // const year = Number.parseInt(html.slice(0,4));
  // const month = Number.parseInt(html.slice(5,8))-1;
  // const day = Number.parseInt(html.slice(8,10));
  // const result = new Date(new Date(year,month, day));
  // //console.log("back ",result, " ",year, " ", month, " ", day);
  // return result;
  return new Date(html);
}

export function extractTransactionData(data: Transaction[]): TransactionData[] {
  return data.map((t):TransactionData=>{
    return {
      amount: t.amount,
      category: t.category,
      date: t.date,
      info: t.info,
    };
  });
}

export interface TransactionClickEvent {
  transaction: Transaction;
  group: TransactionGroup;
}

export interface TransactionUpdateEvent {
  originalTransaction: Transaction;
  newTransaction: TransactionData;
  originalGroupId: number;
  newGroupId: number;
}

export function fixDatesInArray(x: Array<object>) {
  x.forEach(e=>{
    if (typeof e === 'object' && Object.hasOwn(e,'date')) {
      (<any>e).date = new Date((<any>e).date);
    }
  });
}