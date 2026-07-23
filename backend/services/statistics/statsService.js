const StatEvent = require('./models/StatEvent');

async function recordUserRegistered(user) {
  try {
    await StatEvent.create({
      type: 'user_registered',
      userId: user.id,
      metadata: { email: user.email },
    });
  } catch (error) {
    console.error('⚠️  Failed to record user_registered stat event:', error.message);
  }
}

async function recordOrderPlaced(order) {
  try {
    await StatEvent.create({
      type: 'order_placed',
      userId: order.user_id,
      amount: Number(order.total_amount),
      metadata: { orderId: order.id, status: order.status },
    });
  } catch (error) {
    console.error('⚠️  Failed to record order_placed stat event:', error.message);
  }
}

module.exports = { recordUserRegistered, recordOrderPlaced };