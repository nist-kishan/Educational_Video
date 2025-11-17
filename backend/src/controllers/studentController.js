import { supabaseAdmin } from '../config/supabase.js';

export const getAllPublishedCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    // Search by name or description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: courses, error, count } = await query;

    if (error) {
      console.error('Fetch published courses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Published courses fetched successfully',
      courses: courses || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get published courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single course details (for students) - PUBLIC (no auth required)
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id; // Optional - only if authenticated

    // Get course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course modules with videos and assignments
    const { data: modules } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    // Enrich modules with videos and assignments
    const enrichedModules = await Promise.all(
      (modules || []).map(async (module) => {
        // Get videos for this module
        const { data: videos } = await supabaseAdmin
          .from('videos')
          .select('id, title, duration, is_demo, video_url, url')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        console.log(`📹 Videos for module ${module.id}:`, videos);

        // Get assignments for this module
        const { data: assignments } = await supabaseAdmin
          .from('assignments')
          .select('id, title, due_date, description')
          .eq('module_id', module.id)
          .order('created_at', { ascending: true });

        console.log(`📋 Assignments for module ${module.id}:`, assignments);

        return {
          ...module,
          videos: videos || [],
          assignments: assignments || []
        };
      })
    );

    // Get demo video if available
    const { data: demoVideo } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_demo', true)
      .limit(1)
      .single();

    // Get tutor information
    const { data: tutor } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, bio, avatar_url')
      .eq('id', course.tutor_id)
      .single();
    
    // Construct full name from first_name and last_name
    if (tutor) {
      tutor.name = `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim();
    }

    // Check if student is enrolled (if authenticated)
    let isEnrolled = false;
    if (studentId) {
      const { data: enrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

      isEnrolled = !!enrollment;
    }

    // Check if in wishlist (if authenticated)
    let isInWishlist = false;
    if (studentId) {
      const { data: wishlistItem } = await supabaseAdmin
        .from('wishlist')
        .select('id')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .single();

      isInWishlist = !!wishlistItem;
    }

    const responseData = {
      success: true,
      message: 'Course details fetched successfully',
      course: {
        ...course,
        modules: enrichedModules || [],
        demoVideo: demoVideo || null,
        tutor: tutor || null,
        isEnrolled,
        isInWishlist
      }
    };

    console.log('✅ Final course response:', JSON.stringify(responseData, null, 2));
    console.log('📊 Total modules:', enrichedModules?.length);
    console.log('📊 Total videos:', enrichedModules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0));
    console.log('📊 Total assignments:', enrichedModules?.reduce((sum, m) => sum + (m.assignments?.length || 0), 0));

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    console.log('❤️ Add to wishlist request');
    console.log('- Course ID:', courseId);
    console.log('- Student ID:', studentId);

    // Check if course exists (published or draft)
    console.log('📚 Fetching course...');
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, status')
      .eq('id', courseId);

    if (courseError) {
      console.error('❌ Course fetch error:', courseError);
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        error: courseError.message
      });
    }

    if (!course || course.length === 0) {
      console.log('❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('✅ Course found:', course[0]);

    // Add to wishlist
    console.log('❤️ Adding to wishlist...');
    const { data: wishlistItem, error } = await supabaseAdmin
      .from('wishlist')
      .insert({
        user_id: studentId,
        course_id: courseId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Wishlist insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Course already in wishlist'
        });
      }
      throw error;
    }

    console.log('✅ Course added to wishlist:', wishlistItem);

    res.status(201).json({
      success: true,
      message: 'Course added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      details: error.details || error.hint
    });
  }
};

// Remove course from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const { error } = await supabaseAdmin
      .from('wishlist')
      .delete()
      .eq('user_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Course removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get student wishlist
export const getWishlist = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data: wishlistItems, error } = await supabaseAdmin
      .from('wishlist')
      .select('*, courses(*)')
      .eq('user_id', studentId)
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      wishlist: wishlistItems || [],
      count: wishlistItems?.length || 0
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== CART ====================

// Add course to cart
export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    console.log('🛒 Add to cart request');
    console.log('- Course ID:', courseId);
    console.log('- Student ID:', studentId);

    // Check if course exists (published or draft)
    console.log('📚 Fetching course...');
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, price, status')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('❌ Course fetch error:', courseError);
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        error: courseError.message
      });
    }

    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('✅ Course found:', course);

    // Check if already enrolled
    console.log('🔍 Checking enrollment status...');
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (enrollError) {
      console.error('❌ Enrollment fetch error:', enrollError);
      throw enrollError;
    }

    if (enrollment && enrollment.length > 0) {
      console.log('❌ Already enrolled');
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Add to cart
    console.log('🛒 Adding to cart...');
    const { data: cartItem, error } = await supabaseAdmin
      .from('cart')
      .insert({
        student_id: studentId,
        course_id: courseId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Cart insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      if (error.code === '23505') {
        console.log('⚠️ Course already in cart');
        return res.status(400).json({
          success: false,
          message: 'Course already in cart'
        });
      }
      throw error;
    }

    console.log('✅ Course added to cart:', cartItem);

    res.status(201).json({
      success: true,
      message: 'Course added to cart',
      cartItem
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
      error: error.message,
      details: error.details || error.hint
    });
  }
};

// Remove course from cart
export const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('user_id', studentId)
      .eq('item_type', 'course')
      .eq('item_id', courseId);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Course removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get student cart
export const getCart = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data: cartItems, error } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('user_id', studentId)
      .eq('item_type', 'course')
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate total
    const total = (cartItems || []).reduce((sum, item) => {
      return sum + (item.courses?.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      cart: cartItems || [],
      count: cartItems?.length || 0,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== CHECKOUT & ENROLLMENT ====================

// Checkout (create order and enroll in courses)
export const checkout = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseIds, paymentMethod = 'stripe' } = req.body;

    console.log('🛒 Checkout request received');
    console.log('- Student ID:', studentId);
    console.log('- Course IDs:', courseIds);
    console.log('- Payment Method:', paymentMethod);

    if (!courseIds || courseIds.length === 0) {
      console.log('❌ No courses provided');
      return res.status(400).json({
        success: false,
        message: 'No courses selected for checkout'
      });
    }

    // Get all courses in cart
    console.log('📚 Fetching course details...');
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, price')
      .in('id', courseIds);

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      throw coursesError;
    }

    if (!courses || courses.length === 0) {
      console.log('❌ No courses found');
      return res.status(404).json({
        success: false,
        message: 'Courses not found'
      });
    }

    console.log('✅ Courses found:', courses);

    // Calculate total
    const totalAmount = courses.reduce((sum, course) => sum + (course.price || 0), 0);
    console.log('💰 Total amount:', totalAmount);

    // If total is 0 (free courses), enroll directly
    if (totalAmount === 0) {
      console.log('🎁 Free courses - enrolling directly');
      
      // Create enrollments for free courses
      const enrollments = courseIds.map(courseId => ({
        student_id: studentId,
        course_id: courseId,
        status: 'active',
        progress: 0,
        enrollment_date: new Date().toISOString()
      }));

      console.log('📝 Creating enrollments:', enrollments);

      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert(enrollments);

      if (enrollError) {
        console.error('❌ Enrollment error:', enrollError);
        throw enrollError;
      }

      console.log('✅ Enrollments created');

      // Clear cart
      console.log('🗑️ Clearing cart...');
      await supabaseAdmin
        .from('cart')
        .delete()
        .eq('student_id', studentId)
        .in('course_id', courseIds);

      console.log('✅ Cart cleared');

      return res.status(200).json({
        success: true,
        message: 'Enrolled in free courses successfully',
        enrollments
      });
    }

    // For paid courses, create order with pending status
    console.log('💳 Creating order for paid courses...');
    
    const orderNumber = `LM-${Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0')}`; // Generate order number with proper format
    
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        student_id: studentId,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: paymentMethod,
        order_number: orderNumber
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      throw orderError;
    }

    console.log('✅ Order created:', order);

    // Create order items
    const orderItems = courseIds.map(courseId => ({
      order_id: order.id,
      course_id: courseId,
      price: courses.find(c => c.id === courseId)?.price || 0
    }));

    console.log('📝 Creating order items:', orderItems);

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items error:', itemsError);
      throw itemsError;
    }

    console.log('✅ Order items created');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      message: 'Checkout failed',
      error: error.message,
      details: error.details || error.hint
    });
  }
};

// Complete payment and enroll student
export const completePayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    const studentId = req.user.id;

    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction ID are required'
      });
    }

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('student_id', studentId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('course_id')
      .eq('order_id', orderId);

    if (itemsError || !orderItems) {
      throw itemsError;
    }

    // Create enrollments
    const enrollments = orderItems.map(item => ({
      student_id: studentId,
      course_id: item.course_id,
      status: 'active',
      progress: 0,
      enrollment_date: new Date().toISOString()
    }));

    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollments);

    if (enrollError) {
      throw enrollError;
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed'
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        student_id: studentId,
        amount: order.total_amount,
        status: 'completed',
        transaction_id: transactionId,
        payment_method: order.payment_method || 'stripe',
        payment_date: new Date().toISOString()
      });

    if (paymentError) {
      throw paymentError;
    }

    // Clear cart
    await supabaseAdmin
      .from('cart')
      .delete()
      .eq('student_id', studentId)
      .in('course_id', orderItems.map(item => item.course_id));

    res.status(200).json({
      success: true,
      message: 'Payment completed and enrolled successfully',
      enrollments
    });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get student enrollments with detailed progress
export const getEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('*, courses(id, name, description, category, total_duration, total_videos, price, status)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Enhance enrollments with additional data
    const enrichedEnrollments = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        // Skip if course data is missing
        if (!enrollment.courses || !enrollment.courses.id) {
          return enrollment;
        }

        // Get course modules count
        const { data: modules } = await supabaseAdmin
          .from('modules')
          .select('id')
          .eq('course_id', enrollment.courses.id);

        // Get completed videos count (assuming we track this)
        const { data: videos } = await supabaseAdmin
          .from('videos')
          .select('id')
          .eq('course_id', enrollment.courses.id);

        return {
          ...enrollment,
          courses: {
            ...enrollment.courses,
            modules_count: modules?.length || 0,
            videos_count: videos?.length || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Enrollments fetched successfully',
      enrollments: enrichedEnrollments || [],
      count: enrichedEnrollments?.length || 0
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get student's purchased/enrolled courses with progress
export const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // Get enrollments with course details
    const { data: enrollments, error, count } = await supabaseAdmin
      .from('enrollments')
      .select('*, courses(id, name, description, category, total_duration, total_videos, price, status)', { count: 'exact' })
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('enrollment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Enhance with additional data
    const enrichedEnrollments = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        // Skip if course data is missing
        if (!enrollment.courses || !enrollment.courses.id) {
          return enrollment;
        }

        // Get modules count
        const { data: modules } = await supabaseAdmin
          .from('modules')
          .select('id')
          .eq('course_id', enrollment.courses.id);

        // Get videos count
        const { data: videos } = await supabaseAdmin
          .from('videos')
          .select('id')
          .eq('course_id', enrollment.courses.id);

        // Get assignments count
        const { data: assignments } = await supabaseAdmin
          .from('assignments')
          .select('id')
          .eq('course_id', enrollment.courses.id);

        return {
          ...enrollment,
          courses: {
            ...enrollment.courses,
            modules_count: modules?.length || 0,
            videos_count: videos?.length || 0,
            assignments_count: assignments?.length || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'My enrollments fetched successfully',
      enrollments: enrichedEnrollments || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transaction history (orders and payments) for a student
export const getTransactionHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    if (!ordersData || ordersData.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Transaction history fetched successfully',
        orders: []
      });
    }

    const orderIds = ordersData.map(order => order.id);

    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, courses(id, name, category, price)')
      .in('order_id', orderIds);

    if (itemsError) {
      throw itemsError;
    }

    const { data: paymentsData, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .in('order_id', orderIds);

    if (paymentsError) {
      throw paymentsError;
    }

    const orders = ordersData.map(order => ({
      ...order,
      items: (itemsData || []).filter(item => item.order_id === order.id),
      payments: (paymentsData || []).filter(payment => payment.order_id === order.id)
    }));

    res.status(200).json({
      success: true,
      message: 'Transaction history fetched successfully',
      orders
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
