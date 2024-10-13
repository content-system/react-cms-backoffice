import { Item } from "onecore"

export interface MasterDataService {
  getStatus(): Promise<Item[]>
  getTitles(): Promise<Item[]>
  getPositions(): Promise<Item[]>
  getGenders(): Promise<Item[]>
}
export class MasterDataClient implements MasterDataService {
  private status = [
    { value: "A", text: "Active" },
    { value: "I", text: "Inactive" },
  ]
  private titles = [
    { value: "Mr", text: "Mr" },
    { value: "Mrs", text: "Mrs" },
    { value: "Ms", text: "Ms" },
    { value: "Dr", text: "Dr" },
  ]
  private positions = [
    { value: "E", text: "Employee" },
    { value: "M", text: "Manager" },
    { value: "D", text: "Director" },
  ]
  private genders = [
    { value: "M", text: "Male" },
    { value: "F", text: "Female" },
  ]
  getGenders(): Promise<Item[]> {
    return Promise.resolve(this.genders)
  }
  getTitles(): Promise<Item[]> {
    return Promise.resolve(this.titles)
  }
  getPositions(): Promise<Item[]> {
    return Promise.resolve(this.positions)
  }
  getStatus(): Promise<Item[]> {
    return Promise.resolve(this.status)
  }
}
