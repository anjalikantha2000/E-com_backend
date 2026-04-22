const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      couponCode
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: 'Order must contain at least one item'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: `Product ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]?.url,
        sku: product.sku
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate final totals
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 499 ? 0 : 50; // Free shipping above ₹499
    const discount = 0; // You can implement coupon logic here
    const total = subtotal + tax + shipping - discount;

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      notes,
      couponCode
    });

    await order.save();

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [], subtotal: 0, total: 0 }
    );

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name images');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      user,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (user) query.user = user;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price')
      .populate('assignedTo', 'name');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if user can access this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    const updateData = { status, updatedAt: new Date() };

    // Set appropriate dates based on status
    if (status === 'shipped') updateData.shippedDate = new Date();
    if (status === 'delivered') updateData.deliveredDate = new Date();
    if (status === 'cancelled') updateData.cancelledDate = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update payment status (Admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: 'Invalid payment status'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json({
      message: 'Payment status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // Check if user can cancel this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledDate = new Date();
    order.updatedAt = new Date();
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};