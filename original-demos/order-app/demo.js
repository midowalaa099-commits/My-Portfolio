import { MOCK_RESTAURANTS } from './src/mockData';
import { installDemo, reject, cents, now } from '../shared/demo.js';
export const users = {
  customer: { id: 1, name: 'Demo Customer', email: 'customer@example.test', role: 'customer' },
  owner: { id: 2, name: 'Demo Restaurant Owner', email: 'owner@example.test', role: 'restaurant_owner' },
  admin: { id: 3, name: 'Demo Admin', email: 'admin@example.test', role: 'admin' },
};
export function seedOrder() {
  const restaurants = MOCK_RESTAURANTS.map((r, i) => ({ id: i + 1, name: r.name, address: `Sample restaurant ${i + 1}, Demo District, Cairo`, owner_id: 2, is_open: r.isOpen, created_at: r.createdAt, image_url: r.imageUrl, cuisine: r.cuisine, rating: r.rating, delivery_time: r.deliveryTime, latitude: 30.0444 + i * 0.003, longitude: 31.2357 + i * 0.003 }));
  const names = [['Chicken Shawarma', 'Mixed Grill', 'Falafel Plate'], ['Zaatar Manakish', 'Chicken Wrap', 'Halloumi Salad'], ['Salmon Sushi', 'California Roll', 'Miso Soup'], ['Classic Burger', 'Double Cheeseburger', 'French Fries'], ['Chicken Noodles', 'Vegetable Noodles', 'Spring Rolls'], ['Grilled Chicken', 'Kofta Plate', 'Fresh Salad']];
  const meals = restaurants.flatMap((r, i) => names[i].map((name, j) => ({ id: i * 3 + j + 1, restaurant_id: r.id, name, description: 'A freshly prepared sample meal. All prices and orders are fictional.', price: [145, 195, 85][j], is_available: true, category: j === 2 ? 'Sides' : 'Main dishes', image_url: r.image_url })));
  const address = { id: 1, user_id: 1, label: 'Demo Home', address_line: '10 Sample Street, Demo District', city: 'Cairo', phone: '01000000000', latitude: 30.0544, longitude: 31.2457 };
  const orders = ['pending', 'preparing', 'on_the_way', 'delivered'].map((status, i) => ({ id: 1001 + i, user_id: 1, restaurant_id: 1, restaurant: restaurants[0], items: [{ meal: meals[i % 3], quantity: 1, price: meals[i % 3].price }], total_price: meals[i % 3].price, status, address, created_at: new Date(Date.UTC(2026, 10, 7, 9 - i)).toISOString() }));
  return { restaurants, meals, addresses: [address], orders, applications: [{ id: 1, user_id: 4, business_name: 'Sample Kitchen', notes: 'Fictional partner application for the admin demo.', status: 'pending', created_at: '2026-11-06T09:00:00Z', applicant: { id: 4, name: 'Sample Applicant', email: 'sample@example.test', role: 'customer' } }] };
}
export function orderApi({ state, role, path, method, body, query, save }) {
  const user = users[role];
  const data = value => ({ data: value });
  const nextId = items => Math.max(0, ...items.map(item => Number(item.id))) + 1;
  const parts = path.split('/').filter(Boolean);
  const owner = restaurant => restaurant && (role === 'admin' || role === 'owner' && restaurant.owner_id === user.id);
  const canSeeOrder = order => order && (role === 'admin' || role === 'customer' && order.user_id === user.id || role === 'owner' && owner(state.restaurants.find(r => r.id === order.restaurant_id)));
  if (path === '/me') return data(user);
  if (path === '/restaurants' && method === 'GET') {
    let restaurants = state.restaurants.filter(r => !query.get('search') || r.name.toLowerCase().includes(query.get('search').toLowerCase()));
    if (query.get('is_open') === 'true') restaurants = restaurants.filter(r => r.is_open);
    if (query.get('sort') === 'name') restaurants.sort((a, b) => a.name.localeCompare(b.name));
    if (query.get('sort') === '-created_at') restaurants.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return data(restaurants);
  }
  if (parts[0] === 'restaurants') {
    const restaurant = state.restaurants.find(r => r.id === Number(parts[1]));
    if (parts.length > 1 && !restaurant) reject('Restaurant not found.', 404);
    if (method === 'GET') return data(parts[2] === 'meals' ? state.meals.filter(m => m.restaurant_id === restaurant.id) : restaurant);
    if (parts[2] === 'meals' && method === 'POST') {
      if (!owner(restaurant)) reject('Use the restaurant owner demo.', 403);
      if (!String(body.name || '').trim()) reject('Meal name is required.');
      cents(body.price);
      const meal = { ...body, id: nextId(state.meals), restaurant_id: restaurant.id, price: Number(body.price), category: 'Main dishes', image_url: restaurant.image_url };
      state.meals.push(meal); save(); return data(meal);
    }
    if (parts.length === 1 && method === 'POST') {
      if (role !== 'owner' && role !== 'admin') reject('Use the restaurant owner demo.', 403);
      if (!String(body.name || '').trim() || !String(body.address || '').trim()) reject('Name and address are required.');
      const item = { ...body, id: nextId(state.restaurants), owner_id: 2, created_at: now(), cuisine: 'General', rating: 4.5, delivery_time: '25–35 min', image_url: state.restaurants[0]?.image_url };
      state.restaurants.push(item); save(); return data(item);
    }
    if (!owner(restaurant)) reject('Use the restaurant owner demo.', 403);
    if (method === 'PUT') { Object.assign(restaurant, body); save(); return data(restaurant); }
    if (method === 'DELETE') { state.restaurants = state.restaurants.filter(r => r !== restaurant); save(); return data(null); }
  }
  if (parts[0] === 'meals') {
    const meal = state.meals.find(m => m.id === Number(parts[1]));
    if (!meal) reject('Meal not found.', 404);
    if (!owner(state.restaurants.find(r => r.id === meal.restaurant_id))) reject('Use the restaurant owner demo.', 403);
    if (method === 'PUT') { if (body.price !== undefined) cents(body.price); Object.assign(meal, body); save(); return data(meal); }
    if (method === 'DELETE') { state.meals = state.meals.filter(m => m !== meal); save(); return data(null); }
  }
  if (parts[0] === 'addresses') {
    if (method === 'GET') return data(state.addresses.filter(a => a.user_id === user.id));
    const address = state.addresses.find(a => a.id === Number(parts[1]) && a.user_id === user.id);
    if (method === 'DELETE') { if (!address) reject('Address not found.', 404); state.addresses = state.addresses.filter(a => a !== address); save(); return data(null); }
    if (!String(body.address_line || '').trim() || !String(body.city || '').trim()) reject('Street and city are required.');
    if (method === 'POST') { const item = { ...body, id: nextId(state.addresses), user_id: user.id }; state.addresses.push(item); save(); return data(item); }
    if (method === 'PUT' && address) { Object.assign(address, body); save(); return data(address); }
  }
  if (parts[0] === 'orders') {
    const order = state.orders.find(o => o.id === Number(parts[1]));
    if (path === '/orders' && method === 'GET') return data(state.orders.filter(canSeeOrder));
    if (path === '/orders' && method === 'POST') {
      if (role !== 'customer') reject('Use the customer demo to place an order.', 403);
      const restaurant = state.restaurants.find(r => r.id === Number(body.restaurant_id));
      const address = state.addresses.find(a => a.id === Number(body.address_id) && a.user_id === user.id);
      if (!restaurant?.is_open || !address || !Array.isArray(body.items) || !body.items.length) reject('Choose an open restaurant, your delivery address, and at least one meal.');
      const items = body.items.map(item => {
        const meal = state.meals.find(m => m.id === Number(item.meal_id) && m.restaurant_id === restaurant.id && m.is_available);
        if (!meal || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) reject('Review the meals and quantities in your cart.');
        return { meal: { ...meal }, quantity: item.quantity, price: Number(meal.price) };
      });
      const total = items.reduce((sum, i) => sum + cents(i.price) * BigInt(i.quantity), 0n);
      const item = { id: nextId(state.orders), user_id: user.id, restaurant_id: restaurant.id, restaurant: { ...restaurant }, items, total_price: Number(total) / 100, status: 'pending', address: { ...address }, created_at: now() };
      state.orders.unshift(item); save(); return data(item);
    }
    if (!canSeeOrder(order)) reject('Order not found.', 404);
    if (method === 'PUT') {
      const allowed = role === 'customer' ? order.status === 'pending' && body.status === 'cancelled' : ({ pending: ['preparing', 'cancelled'], preparing: ['on_the_way', 'cancelled'], on_the_way: ['delivered'], delivered: [], cancelled: [] }[order.status] || []).includes(body.status);
      if (!allowed) reject('This order status transition is unavailable.');
      order.status = body.status; save(); return data(order);
    }
    if (parts[2] === 'tracking') {
      const location = { id: 1, latitude: 30.0494, longitude: 31.2407, recorded_at: now() };
      if (parts[3] === 'history') return data(order.status === 'on_the_way' ? [location] : []);
      return data({ order_id: order.id, status: order.status, tracking_active: order.status === 'on_the_way', location: order.status === 'on_the_way' ? location : null, restaurant: order.restaurant, destination: order.address });
    }
    if (method === 'GET') return data(order);
  }
  if (path === '/owner-applications/current') return data(state.applications.find(a => a.user_id === user.id) || null);
  if (path === '/owner-applications' && method === 'POST') {
    if (!String(body.business_name || '').trim()) reject('Business name is required.');
    if (state.applications.some(a => a.user_id === user.id && a.status === 'pending')) reject('You already have a pending application.');
    const application = { ...body, id: nextId(state.applications), user_id: user.id, status: 'pending', created_at: now(), applicant: user };
    state.applications.push(application); save(); return data(application);
  }
  if (parts[0] === 'admin') {
    if (role !== 'admin') reject('Use the administrator demo.', 403);
    if (path === '/admin/overview') return data({ stats: { customers: 12, restaurant_owners: 1, restaurants: state.restaurants.length, orders: state.orders.length, pending_applications: state.applications.filter(a => a.status === 'pending').length } });
    if (path === '/admin/owner-applications') return data(state.applications);
    const application = state.applications.find(a => a.id === Number(parts[2]));
    if (application && method === 'POST' && ['approve', 'reject'].includes(parts[3])) { application.status = parts[3] === 'approve' ? 'approved' : 'rejected'; save(); return data(application); }
  }
  reject('This endpoint is unavailable in the static demo.', 404);
}
if (typeof window !== 'undefined') installDemo({ key: 'original-order-demo-v1', seed: seedOrder, roles: ['customer', 'owner', 'admin'], handler: orderApi,
  session: () => sessionStorage.setItem('order-app-session-token', 'fictional-demo-session'),
  hint: 'Orders, restaurants, addresses and map positions are fictional. No payment, SMS or delivery is sent.' });
