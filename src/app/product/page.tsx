import Product from "../component/Product"
const product = async()=>{
    const res = await fetch("http://localhost:8000/product/")
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