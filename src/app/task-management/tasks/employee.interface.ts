/**
 * Title: employee.interface.ts
 * Author: Erin Brady
 * Date: 08/16/2023
 * Description: Employee schema
*/

import { Item } from './item.interface'

export interface Employee {
  empId: number
  todo: Item[]
  done: Item[]
}
