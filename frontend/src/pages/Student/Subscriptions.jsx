import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Check, X, Calendar, DollarSign, Zap } from 'lucide-react';
import axios from 'axios';

const Subscriptions = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      billingCycle: 'monthly',
      features: [
        'Access to 50+ courses',
        'HD video quality',
        'Offline downloads',
        'Certificate of completion',
        'Email support'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 19.99,
      billingCycle: 'monthly',
      features: [
        'Access to 200+ courses',
        '4K video quality',
        'Unlimited offline downloads',
        'Certificate of completion',
        'Priority email & chat support',
        'Live Q&A sessions',
        'Course completion guarantee'
      ],
      color: 'from-purple-500 to-purple-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      billingCycle: 'monthly',
      features: [
        'Access to all courses',
        '4K video quality',
        'Unlimited offline downloads',
        'Certificate of completion',
        '24/7 phone & chat support',
        'Live Q&A sessions',
        'Course completion guarantee',
        'Personal learning coach',
        'Custom learning paths',
        'Team management'
      ],
      color: 'from-amber-500 to-amber-600'
    }
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/subscriptions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await axios.post(
        `${API_URL}/student/subscriptions/subscribe`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPlan(planId);
      // Redirect to payment page
      window.location.href = `/student/payment?subscriptionId=${response.data.subscriptionId}`;
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await axios.post(
          `${API_URL}/student/subscriptions/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSubscriptions();
      } catch (error) {
        console.error('Error canceling subscription:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} py-12 px-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Plan
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Unlock unlimited learning with our flexible subscription plans
          </p>
        </div>

        {/* Current Subscription Info */}
        {userSubscription && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-12 p-6 rounded-lg ${isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                  Current Plan: {userSubscription.planName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Renews on {new Date(userSubscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Subscription
              </button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold">
                  POPULAR
                </div>
              )}

              <div className={`p-8 h-full ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{plan.billingCycle}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={userSubscription?.planId === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    userSubscription?.planId === plan.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                  }`}
                >
                  {userSubscription?.planId === plan.id ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Can I change my plan?
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Is there a free trial?
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Yes, all new subscribers get a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                What payment methods do you accept?
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                We accept all major credit cards, PayPal, and digital wallets for your convenience.
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Can I cancel anytime?
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Absolutely! Cancel your subscription anytime with no penalties or hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Subscriptions.displayName = 'Subscriptions';
export default Subscriptions;
