// Test script to check if all modules load correctly
console.log('Testing module loading...');

try {
  console.log('Loading ResourceController...');
  require('./Controllers/ResourceController');
  console.log('✅ ResourceController loaded successfully');
} catch (error) {
  console.log('❌ ResourceController error:', error.message);
}

try {
  console.log('Loading ForumPostController...');
  require('./Controllers/ForumPostController');
  console.log('✅ ForumPostController loaded successfully');
} catch (error) {
  console.log('❌ ForumPostController error:', error.message);
}

try {
  console.log('Loading SessionController...');
  require('./Controllers/SessionController');
  console.log('✅ SessionController loaded successfully');
} catch (error) {
  console.log('❌ SessionController error:', error.message);
}

try {
  console.log('Loading BookingController...');
  require('./Controllers/BookingController');
  console.log('✅ BookingController loaded successfully');
} catch (error) {
  console.log('❌ BookingController error:', error.message);
}

try {
  console.log('Loading PaymentController...');
  require('./Controllers/PaymentController');
  console.log('✅ PaymentController loaded successfully');
} catch (error) {
  console.log('❌ PaymentController error:', error.message);
}

try {
  console.log('Loading NotificationController...');
  require('./Controllers/NotificationController');
  console.log('✅ NotificationController loaded successfully');
} catch (error) {
  console.log('❌ NotificationController error:', error.message);
}

try {
  console.log('Loading InvoiceController...');
  require('./Controllers/InvoiceController');
  console.log('✅ InvoiceController loaded successfully');
} catch (error) {
  console.log('❌ InvoiceController error:', error.message);
}

console.log('Module loading test completed.');