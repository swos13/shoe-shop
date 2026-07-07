// Mock api for fetching data from mock-data.json file that requires processing - mocking the processes

export async function getMockProducts(pageParam: number = 1, params: Object = {}) {

    const response = await fetch(`${process.env.API_URL}/mock-data/mock-products.json`);

    if (!response.ok) throw Error("Failed to fetch products");

    const { products } = await response.json();
    const pageSize = 10;
    const startIndex = (pageParam - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const pageData = products.slice(startIndex, endIndex);

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        data: pageData,
        meta: {
            pagination: {
                page: pageParam,
                pageSize,
                pageCount: Math.ceil(products.length / pageSize),
                total: products.length,
            },
        },
    };

}

export async function getMockMaxPrice() {
    const response = await fetch(`${process.env.API_URL}/mock-data/mock-products.json`);
    if (!response.ok) throw Error("Failed to fetch products");

    const { products } = await response.json();
    const prices = products.map((product: {  attributes: { price: number } }) => product.attributes.price);
    return Math.max(...prices);
};