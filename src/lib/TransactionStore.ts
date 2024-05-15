import { z } from "zod";
import { type TransactionGroup, createTransactionGroups, createTransactions, extractTransactionData, findTransactionGroupForTransaction, type Transaction, type TransactionData, TransactionDataSchema, fixDatesInArray, type Parameters, ParametersSchema } from "./transaction";
import { type TransactionLocation, TransactionLocationSchema, TransactionLocationDataSchema, convertTransactionLocationFromData, type TransactionLocationData, convertTransactionLocationToData } from './location'

function exportGroups(groups: TransactionGroup[]): string {
  return groups.map(group =>{
    return `\n// week group ${(group.id %100)+1}\n`+group.transactions.map(t=>`#${t.date.toLocaleDateString("de-DE")} @${t.category} ${t.amount} ${(t.info.length>0 && !t.info.slice(0,1).match(/[a-z-A-Z]/))?'_':''}${t.info}`).join('\n');
  }).join("\n");
}

export class TransactionStore {
  private transactions: Transaction[] = new Array<Transaction>();
  private groups: TransactionGroup[]|undefined = undefined;
  private storage: Storage; 
  private categories: string[] = demoCategories;
  private archive = new Array<TransactionData[]>;
  private locations = new Array<TransactionLocation>();
  private errors = new Array<any>();
  private exceptions = new Array<any>();
  private parameters: Parameters = { maxDistance: 150 };
  private firstTime = false;
  
  constructor(databaseName="transaction-logger") {
    this.transactions = createTransactions(demoTransactions);
    this.storage = window.localStorage;
    if (this.storage.getItem("transactions")===null) this.firstTime = true;
    this.restoreCategories();
    this.restoreTransactions();
    this.restoreArchive();
    this.restoreLocations();
    this.restoreParameters();

    const self = this;
    window.onunhandledrejection = (e=>{
      self.exceptions.push(e);
      console.log('exception catched', e);
    });
  }

  isFirstTime(): boolean {
    return this.firstTime;
  }

  restoreParameters() {
    try {
      const data = this.storage.getItem('parameters');
      if (data!==null) {
        const tmp = JSON.parse(data);
        const checked = ParametersSchema.parse(tmp); // throws on error
        console.log('parameters ok');
        this.parameters = checked;
      }
    }
    catch(e) {
      console.log('parameters error',e);
      this.errors.push([new Date(), "parameters format error", e]);
    }
  }
  getParametersJson(): string {
    return JSON.stringify(this.parameters);
  }
  setParametersJson(txt: string) {
    this.storage.setItem('parameters', txt);
    this.restoreParameters();        
  }
  getParameters() {
    return this.parameters;
  }

  restoreArchive() {
    try {
      const data = this.storage.getItem('archive');
      if (data!==null) {
        const tmp = JSON.parse(data);
        tmp.forEach(fixDatesInArray);
        const checked = z.array(z.array(TransactionDataSchema)).parse(tmp); // throws on error
        console.log('archive ok');
        this.archive = checked;
      }
    }
    catch(e) {
      console.log('archive error',e);
      this.errors.push([new Date(), "archive format error", e]);
    }
  }
  readStorage(name: string): string {
    return this.storage.getItem(name)??'???';
  }
  getArchiveJson(): string {
    return JSON.stringify(this.archive);
  }
  setArchiveJson(txt: string) {
    this.storage.setItem('archive', txt);
    this.restoreArchive();        
  }
  clearAndUpdateArchive() {
    this.archive.push(extractTransactionData(this.transactions));
    this.storage.setItem('archive', this.getArchiveJson());
    this.transactions = [];
    this.storeTransactions();
  }
  getCategories(): string[] {
    return this.categories;
  }
  getGroups(): TransactionGroup[] {
    this.groups = createTransactionGroups(this.transactions, this.groups);
    return this.groups;
  }
  getGroupsInternal(): TransactionGroup[] {
    if (this.groups!==undefined) return this.groups;
    else return this.getGroups();
  }
  updateTransaction(id: number, newTransaction: TransactionData) {
    const existing = this.transactions.find(t=>t.id === id);
    if (existing!==undefined) {
      Object.assign(existing, newTransaction);
    }
    else {
      throw new Error(`unexpected: did not find transaction ${id}`);
    }
    this.storeTransactions();
  }
  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter(t=>t.id!==id);
    this.storeTransactions();
  }
  getExportText(): string {
    return exportGroups(this.getGroupsInternal());
  }
  getArchiveExportText(): string {
    return this.archive.map(ar=>{
      return '\n\n// archive list\n'+exportGroups(createTransactionGroups(createTransactions(ar)));
    }).join('\n');
  }
  
  setLocationsJson(txt: string) {
    this.storage.setItem('locations', txt);
    this.restoreLocations();        
  }
  getLocationsJson(): string {
    return JSON.stringify(convertTransactionLocationToData(this.locations));    
  }
  storeLocations() {
    this.storage.setItem('locations', this.getLocationsJson());
  }
  getLocations(): TransactionLocation[] {
    return this.locations;    
  }
  newLocation(newLocation: TransactionLocationData) {
    const id = this.locations.map(l=>l.id).reduce((a,b)=>(a>b)?a:b, 0);    
    this.locations.push({id:id, ...newLocation});
    this.storeLocations();
  }
  restoreLocations() {
    try {
      const data = this.storage.getItem('locations');
      if (data!==null) {
        const tmp = JSON.parse(data);
        const checked = z.array(TransactionLocationDataSchema).parse(tmp); // throws on error
        console.log('locations ok');
        this.locations = convertTransactionLocationFromData(checked);
      }
    }
    catch(e) {
      console.log('locations error',e);
      this.errors.push([new Date(), "locations format error", e]);
    }
  }
  deleteLocation(id: number) {
    this.locations = this.locations.filter(l=>l.id!==id);
    this.storeLocations();
  }
 
  setTransactionJson(txt: string) {
    this.storage.setItem('transactions', txt);
    this.restoreTransactions();        
  }
  getTransactionsJson(): string {
    const jsonData = extractTransactionData(this.transactions);
    return JSON.stringify(jsonData);
  }
  storeTransactions() {
    this.storage.setItem('transactions', this.getTransactionsJson());
    this.firstTime = false;
  }
  restoreTransactions() {
    try {
      const data = this.storage.getItem('transactions');
      if (data!==null) {
        console.log(`transactions json == "${data}"`);
        const tmp = <Array<object>>JSON.parse(data);
        fixDatesInArray(tmp)
        const checked = z.array(TransactionDataSchema).parse(tmp); // throws on error
        console.log('transactions ok');

        this.transactions = createTransactions(checked);
      }
    }
    catch(e) {
      console.log('transactions error',e);
      this.errors.push([new Date(), "transactions format error", e]);
    }
  }

  setCategoriesJson(txt: string) {
    this.storage.setItem('categories', txt);
    this.restoreCategories();        
  }
  getCategoriesJson(): string {
    return JSON.stringify(this.categories);    
  }
  storeCategories() {
    this.storage.setItem('categories', this.getCategoriesJson());
  }
  restoreCategories() {
    try {
      const data = this.storage.getItem('categories');
      if (data!==null) {
        const tmp = JSON.parse(data);
        const checked = z.array(z.string()).parse(tmp); // throws on error
        console.log('categories ok');
        this.categories = checked;
      }
    }
    catch(e) {
      console.log('categories error',e);
      this.errors.push([new Date(), "categories format error", e]);
    }
    this.categories.sort((a,b)=>a.toUpperCase().localeCompare(b.toUpperCase()));
  }

  reset() {
    this.storage.removeItem('archive');
    this.storage.removeItem('transactions');
    this.storage.removeItem('locations');
    //this.storage.removeItem('categories');
    this.transactions = []
    this.locations = []
  }
  newTransaction(newTransaction: TransactionData) {
    const id = this.transactions.map(t=>t.id).reduce((a,b)=>(a>b)?a:b, 0);
    this.transactions.push({id:id+1, ...newTransaction});
    this.storeTransactions();
    this.getGroups();
    const groups = this.groups || this.getGroups();
    const group = findTransactionGroupForTransaction(newTransaction, groups);
    if (group!==undefined) group.expanded=true;
  }

  getErrors() {
    return this.errors;
  }

  getErrorText(): string {
    return this.errors.map(e=>`${e}`).join("\n\n");
  }

  getExceptions() {
    return this.exceptions;
  }

  getExceptionText(): string {
    return this.exceptions.map(e=>`${e}`).join("\n\n");
  }
}


const demoCategories = [
  "Essen",
  "Non_Food",
  "Essen_gehen",
  "Kleidung",
  "Kinder",
  "Schule",
  "Taschengeld",
  "Wohnen",
  "Telefon",
  "Technik",
  "Auto",
  "Fahrrad",
  "Transport",
  "Hobby",
  "Sport",
  "Geschenke",
  "Urlaub",
  "gesundheit",
];
const demoTransactions: TransactionData[] = [
  {
    date: new Date(2024, 4, 20),
    amount: 35.20,
    info: "demo",
    category: "essen",
  }
];
