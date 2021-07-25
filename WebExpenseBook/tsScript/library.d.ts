interface CategoryList {
    ParentName: string;
    CategoryName: string;
    CategotyPrice: number;
}
interface ChaildCategory {
    Depth: number;
    ParentName: string;
    CategoryName: string;
    Pattern: string;
}

interface EditItem {
    ItemId: number;
    ItemName: string;
    ItemPrice: number;
    ItemDate: Date;
    Pattern: string;
    Category: CategoryListNoPrice[]
}
interface ItemList {
    ItemId: number;
    ItemName: string;
    ItemPrice: number;
    ItemDate: Date;
}
interface CategoryListNoPrice {
    Depth: number;
    CategoryName: string;
}

interface ItemNameOnly {
    ItemName: string
}

interface CategoryListWithItemInfo {
    Category: CategoryListNoPrice[]
    IsItemExist: boolean;
}
