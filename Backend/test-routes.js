// Test script to check if all route modules load correctly
console.log('Testing route loading...');

try {
  console.log('Loading ResourceRoutes...');
  require('./Routes/ResourceRoutes');
  console.log('✅ ResourceRoutes loaded successfully');
} catch (error) {
  console.log('❌ ResourceRoutes error:', error.message);
}

try {
  console.log('Loading ForumPostRoutes...');
  require('./Routes/ForumPostRoutes');
  console.log('✅ ForumPostRoutes loaded successfully');
} catch (error) {
  console.log('❌ ForumPostRoutes error:', error.message);
}

try {
  console.log('Loading SessionRoutes...');
  require('./Routes/SessionRoutes');
  console.log('✅ SessionRoutes loaded successfully');
} catch (error) {
  console.log('❌ SessionRoutes error:', error.message);
}

try {
  console.log('Loading BookingRoutes...');
  require('./Routes/BookingRoutes');
  console.log('✅ BookingRoutes loaded successfully');
} catch (error) {
  console.log('❌ BookingRoutes error:', error.message);
}

try {
  console.log('Loading PaymentRoutes...');
  require('./Routes/PaymentRoutes');
  console.log('✅ PaymentRoutes loaded successfully');
} catch (error) {
  console.log('❌ PaymentRoutes error:', error.message);
}

try {
  console.log('Loading NotificationRoutes...');
  require('./Routes/NotificationRoutes');
  console.log('✅ NotificationRoutes loaded successfully');
} catch (error) {
  console.log('❌ NotificationRoutes error:', error.message);
}

try {
  console.log('Loading InvoiceRoutes...');
  require('./Routes/InvoiceRoutes');
  console.log('✅ InvoiceRoutes loaded successfully');
} catch (error) {
  console.log('❌ InvoiceRoutes error:', error.message);
}

console.log('Route loading test completed.');