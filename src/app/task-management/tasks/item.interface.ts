/**
 * Title: item.interface.ts
 * Author: Erin Brady
 * Date: 08/16/2023
 * Description: Task Item schema
*/


export interface Category {
  categoryName: string
  backgroundColor: string
}

export interface Item {
  _id?: string
  text: string
  category: Category
}
