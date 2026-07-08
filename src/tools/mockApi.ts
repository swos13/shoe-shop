// Mock api for fetching data from mock-data.json file that requires processing - mocking the processes

import { MockFilters, ProductResponse } from "@/lib/types";
import { filterProducts } from "@/utils/helperFunctions";

export async function getMockProducts(pageParam: number = 1, params?: MockFilters) {

    const response = await fetch(`${process.env.API_URL}/mock-data/mock-products.json`, { cache: 'no-store' });

    if (!response.ok) throw Error("Failed to fetch products");

    const { products } = await response.json() as { products: Array<ProductResponse> };

    let filteredProducts = Array.from(products).map((product: ProductResponse) => product.data);

    if (params
         && (params?.genders.length > 0
             || params?.categories.length > 0
             || params?.colors.length > 0
             || params?.brands.length > 0
             || params?.sizes.length > 0)) filteredProducts = filterProducts(filteredProducts, params);

    const pageSize = 10;
    const startIndex = (pageParam - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const pageData = filteredProducts.slice(startIndex, endIndex);

    await new Promise(resolve => setTimeout(resolve, 500));


    return {
        data: pageData,
        meta: {
            pagination: {
                page: pageParam,
                pageSize,
                pageCount: Math.ceil(filteredProducts.length / pageSize),
                total: filteredProducts.length,
            },
        },
    };

}

export async function getMockMaxPrice() {
    const response = await fetch(`${process.env.API_URL}/mock-data/mock-products.json`);
    if (!response.ok) throw Error("Failed to fetch products");

    const { products } = await response.json() as { products: Array<ProductResponse> };
    const prices = products.map((product: ProductResponse) => product.data.attributes.price);
    return Math.max(...prices);
};