import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, DollarSign, Package } from 'lucide-react';
import { getCart, removeFromCart, checkout } from '../../store/studentSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { isLoading, error } = useSelector((state) => state.student);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const result = await dispatch(getCart()).unwrap();
      setCartItems(result.cart || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const handleRemoveItem = async (courseId) => {
    try {
      await dispatch(removeFromCart(courseId)).unwrap();
      setCartItems(cartItems.filter(item => item.course_id !== courseId));
      setTotal(total - (cartItems.find(item => item.course_id === courseId)?.courses?.price || 0));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      const courseIds = cartItems.map(item => item.course_id);
      const result = await dispatch(checkout({ courseIds, paymentMethod: 'stripe' })).unwrap();
      
      // Redirect to payment page
      navigate('/student/payment', { state: { order: result.order } });
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass}`}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center py-20">
            <Package size={64} className="mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className={secondaryText}>Start adding courses to your cart!</p>
            <button
              onClick={() => navigate('/student/courses')}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={`${cardBg} rounded-lg p-6 border ${borderClass}`}>
              <h2 className="text-xl font-semibold mb-6">
                {cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'}
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.course_id}
                    className={`flex items-center justify-between p-4 border ${borderClass} rounded-lg hover:shadow-lg transition`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.courses?.name}
                      </h3>
                      <p className={secondaryText}>
                        Category: {item.courses?.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">
                          ${item.courses?.price?.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.course_id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-lg p-6 border ${borderClass} sticky top-4`}>
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={secondaryText}>Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className={secondaryText}>Tax (0%)</span>
                  <span className="font-semibold">$0.00</span>
                </div>

                <div className="flex justify-between">
                  <span className={secondaryText}>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>

                <div className={`border-t ${borderClass} pt-4 flex justify-between`}>
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-green-500">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {total === 0 ? (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                >
                  {isCheckingOut ? 'Enrolling...' : 'Enroll Now (Free)'}
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  {isCheckingOut ? 'Processing...' : 'Proceed to Payment'}
                </button>
              )}

              <p className={`text-xs ${secondaryText} text-center mt-4`}>
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
