import { pool } from '../config/db.js';

// In-memory store for orders if MySQL is offline
const memoryOrders = [];

export const createOrder = async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Shopping cart is empty' });
    }

    const orderNumber = `CFS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const payee = process.env.DEEP_LINK_BASE_PAYEE || 'chicfashion@upi';
    const storeName = encodeURIComponent(process.env.STORE_NAME || 'CHIC FASHION STORE');
    const note = encodeURIComponent(`Order ${orderNumber}`);
    const encodedAmount = Number(totalAmount).toFixed(2);
    
    // Multiple deep link protocols
    const upiDeepLink = `upi://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${orderNumber}`;
    const gpayDeepLink = `tez://upi/pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${orderNumber}`;
    const phonepeDeepLink = `phonepe://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${orderNumber}`;
    const paytmDeepLink = `paytmmp://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${orderNumber}`;
    
    // WhatsApp Order deep link
    const waText = encodeURIComponent(
      `Hello CHIC FASHION STORE!\n\nI have placed order *#${orderNumber}* for *₹${encodedAmount}*.\nName: ${customer.name}\nShipping: ${customer.address}, ${customer.city}\n\nPlease confirm my order.`
    );
    const whatsappDeepLink = `https://wa.me/919876543210?text=${waText}`;

    if (pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
          `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_deep_link)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNumber,
            customer.name,
            customer.email,
            customer.phone,
            `${customer.address}, ${customer.city}, ${customer.postalCode}`,
            totalAmount,
            upiDeepLink,
          ]
        );

        const orderId = orderResult.insertId;

        for (const item of items) {
          await connection.query(
            `INSERT INTO order_items (order_id, product_id, product_title, size, color, quantity, price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.id,
              item.title,
              item.selectedSize || 'Standard',
              item.selectedColor || 'Default',
              item.quantity,
              item.price,
            ]
          );
        }

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      memoryOrders.push({
        orderNumber,
        customer,
        items,
        totalAmount,
        paymentDeepLink: upiDeepLink,
        paymentStatus: 'PENDING',
        createdAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      orderNumber,
      paymentDeepLink: upiDeepLink,
      links: {
        upi: upiDeepLink,
        gpay: gpayDeepLink,
        phonepe: phonepeDeepLink,
        paytm: paytmDeepLink,
        whatsapp: whatsappDeepLink,
      },
      totalAmount,
      customerName: customer.name,
    });
  } catch (error) {
    console.error('Order creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const confirmOrderPayment = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { paymentId, method } = req.body;

    if (pool) {
      await pool.query(
        'UPDATE orders SET payment_status = ? WHERE order_number = ?',
        ['PAID', orderNumber]
      );
    } else {
      const order = memoryOrders.find((o) => o.orderNumber === orderNumber);
      if (order) order.paymentStatus = 'PAID';
    }

    return res.json({
      success: true,
      message: 'Payment confirmed successfully',
      orderNumber,
      status: 'PAID',
      method: method || 'DEEP_LINK_UPI',
      paidAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Confirm payment error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (pool) {
      const [orders] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const order = orders[0];
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return res.json({ ...order, items });
    }

    const order = memoryOrders.find((o) => o.orderNumber === orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
