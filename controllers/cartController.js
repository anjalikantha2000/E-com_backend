const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.product', 'name price images stock isActive');

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products or products with insufficient stock
    cart.items = cart.items.filter(item => {
      const product = item.product;
      return product &&
             product.isActive &&
             product.stock >= item.quantity;
    });

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount - cart.couponDiscount;

    await cart.save();

    res.json({
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = new Cart({
        user: req.user.userId,
        items: []
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;

      // Check stock limit
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return res.status(400).json({
          message: 'Cannot add more items. Stock limit reached.'
        });
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity,
        image: product.images[0]?.url,
        sku: product.sku
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');

    res.json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1'
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        message: 'Product not found or unavailable'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock'
      });
    }

    // Update cart
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');

    res.json({
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.userId },
      {
        items: [],
        subtotal: 0,
        total: 0,
        discount: 0,
        couponCode: null,
        couponDiscount: 0
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Apply coupon (placeholder implementation)
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // This is a placeholder. In a real application, you'd validate
    // the coupon against a coupons collection/database
    const validCoupons = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE50': { discount: 50, type: 'fixed' }
    };

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }

    if (!validCoupons[couponCode]) {
      return res.status(400).json({
        message: 'Invalid coupon code'
      });
    }

    const coupon = validCoupons[couponCode];
    cart.couponCode = couponCode;
    cart.couponDiscount = coupon.type === 'percentage'
      ? (cart.subtotal * coupon.discount / 100)
      : Math.min(coupon.discount, cart.subtotal);

    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount - cart.couponDiscount;

    await cart.save();

    res.json({
      message: 'Coupon applied successfully',
      cart
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};