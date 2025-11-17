import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { completePayment } from '../../store/studentSlice';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  
  const order = location.state?.order;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900';

  if (!order) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass}`}>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p>No order found. Please go back and try again.</p>
          <button
            onClick={() => navigate('/student/cart')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate || !formData.cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Complete payment
      await dispatch(completePayment({
        orderId: order.id,
        transactionId
      })).unwrap();

      setPaymentSuccess(true);

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/student/courses', { state: { paymentSuccess: true } });
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center`}>
        <div className="text-center">
          <CheckCircle size={80} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className={secondaryText}>You have been enrolled in the courses.</p>
          <p className="mt-4 text-sm">Redirecting to courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className={`${cardBg} rounded-lg p-8 border ${borderClass}`}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard size={24} />
                Card Details
              </h2>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength="19"
                    className={`w-full px-4 py-3 border rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-sm font-medium mb-2">Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      maxLength="5"
                      className={`w-full px-4 py-3 border rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength="3"
                      className={`w-full px-4 py-3 border rounded-lg ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <Lock size={20} className="text-blue-500" />
                  <p className="text-sm">Your payment information is secure and encrypted</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                >
                  {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className={`${cardBg} rounded-lg p-6 border ${borderClass} sticky top-4`}>
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div>
                  <p className={`text-sm ${secondaryText}`}>Order ID</p>
                  <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                </div>

                <div>
                  <p className={`text-sm ${secondaryText}`}>Number of Courses</p>
                  <p className="font-semibold">{order.items?.length || 1}</p>
                </div>

                <div className={`border-t ${borderClass} pt-3`}>
                  <p className={`text-sm ${secondaryText}`}>Total Amount</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${order.totalAmount?.toFixed(2) || order.total_amount?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className={`bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm`}>
                <p className="font-semibold mb-2">Test Card Numbers</p>
                <p className="font-mono text-xs mb-1">4242 4242 4242 4242</p>
                <p className={`text-xs ${secondaryText}`}>Any future expiry date and any 3-digit CVV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
