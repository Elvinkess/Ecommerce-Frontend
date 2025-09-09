import Product from "../component/Product"
const product = async()=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/`)
    return await  res.json()
}
export default async function Products(){
    const res = await product()
    return (
        <div>
         <Product products={res}></Product>
        </div>
    )
}