import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "../styles/header.css"
import "../styles/orderList.css"

export interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
}

export interface Orders {
  status: string
  totalAmountPaid: number
  date: string
  transactionRef: string
  Order_items: OrderItem[]
}

interface OrderListDrawerProps {
  open: boolean
  onClose: () => void
}

export default function OrderListDrawer({ open, onClose }: OrderListDrawerProps) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Orders[]>([])
  const [loading, setLoading] = useState(false)

  const getOrders = async (userId: string) => {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/history/${userId}`
      )
      if (!res.ok) throw new Error("Failed to fetch orders")

      const data: Orders[] = await res.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && user?.id) {
      getOrders(user.id)
    }
  }, [open, user])

  if (!open) return null

  return (
    <div className="order-memu-container" onClick={onClose}>
      <div className="order-memu" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-header">
          {user?.username ? (
            <h2 className="order-user">{user.username}&apos;s Orders</h2>
          ) : (
            <h2 >Your Orders</h2>
          )}
          <button onClick={onClose} className="order-header-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Orders List */}
        <div className="order-items">
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="empty-cart">No orders found</p>
          ) : (
            <ul className="order-items-list">
              {orders.map((order) => (
                <li key={order.transactionRef} className="order-item">
                  <div className="order-item-details-wrapper">
                    <p className="order-item-name">
                      <strong>TransactionRef:</strong> {order.transactionRef}
                    </p>
                    <p className="order-item-size">
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p className="order-item-size">
                      <strong>Date:</strong> {order.date}
                    </p>
                    <p className="order-item-size">
                      <strong>Total:</strong> ₦
                      {order.totalAmountPaid.toLocaleString()}
                    </p>

                    <div className="">
                      <strong>Items:</strong>
                      <ul className="order-items">
                        {order.Order_items.map((item) => (
                          <li key={item.product_id}>
                            {item.product_name} :{item.quantity} × ₦
                            {item.price.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
