export interface Category {
  categoryName: string
  backgroundColor: string
}

export interface Item {
  _id?: string
  text: string
  category: Category
}