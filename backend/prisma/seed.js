// Run via `npx prisma db seed` 
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Demo admin account
const ADMIN_PASSWORD_HASH = '$2b$10$THBohf/OIleIB1VkICVU1O91uAZSKfrJ8ldvv8g9a9RmNgPSqxeHe';

const PRODUCTS = [
  { title: 'AK 61 Keyboard', description: 'RGB 60% Gaming Mechanical Keyboard – Blue Switch / Hot Swap – EN keys | Black', price: 100.00, category: 'Keyboards', image_url: '/uploads/1783950108876-266394581.jpg', stock: 15 },
  { title: 'HyperX Cloud III', description: 'Wired Gaming Headset, PC, PS5, Xbox Series X|S, Angled 53mm Drivers, Spatial Audio, Memory Foam, Durable Frame, Ultra-Clear 10mm Mic, USB-C, USB-A, 3.5mm – Black/Red', price: 115.00, category: 'Headsets', image_url: '/uploads/1784510439773-226457221.jpg', stock: 9 },
  { title: 'Razer BlackShark V3', description: 'HyperSpeed Wireless Gaming Headset for PC: 50mm Drivers - Cardioid Mic - 2.4 GHz, Bluetooth, USB - Works with Mac, PS5, Nintendo Switch, Smartphone - 70 Hr Battery - Black', price: 100.00, category: 'Headsets', image_url: '/uploads/1784510684522-688402722.jpg', stock: 7 },
  { title: 'KTC 32 Inch Monitor', description: 'FHD 1080P 240Hz PC Monitor, 1500R, 122% sRGB with HDR, FreeSync Premium, HDMI 2.0x2, DisplayPort 1.4, VESA Compatible, Tilt Adjustable, Eye Care, H32S17C', price: 150.00, category: 'Monitors', image_url: '/uploads/1784510876724-649331234.jpg', stock: 22 },
  { title: 'Samsung 27" Odyssey G5', description: '(G51F) Gaming Monitor - QHD (1440P), 180Hz, 1ms, AMD FreeSync, HDR10, Height Adjustable Stand, Black Equalizer, Virtual Aim Point, Auto Source Switch+, LS27FG512ENXZA', price: 200.00, category: 'Monitors', image_url: '/uploads/1784511000116-608873672.jpg', stock: 23 },
  { title: 'Uineer Wired Gaming Mouse', description: '12800 DPI Mouse with Gaming Sensor, 6 Programmable Buttons, 1000Hz Polling Rate, Customizable RGB Lighting and 2M Cable, Plug & Play for Laptop/PC, Office & Gaming', price: 100.00, category: 'gaming mice', image_url: '/uploads/1783951404870-653246490.jpg', stock: 13 },
  { title: 'viper mini', description: 'Ultra light gaming mouse (ultra-light ambidextrous gamer mouse with 61g weight, Speedflex cable, optical 8,500 DPI sensor and RGB', price: 150.00, category: 'gaming mice', image_url: '/uploads/1783951522983-437344588.jpg', stock: 3 },
  { title: 'Razer Ornata V3 X', description: 'Flat Membrane Keyboard with Chroma RGB (Silent Membrane Switches, Ergonomic Wrist Rest, Keycaps Anti-UV Coating) QWERTZ DE Layout | Black', price: 100.00, category: 'Keyboards', image_url: '/uploads/1783951685406-46191068.jpg', stock: 16 },
  { title: 'MozaR12 package', description: 'The mid tier package from Moza sim racing which 12 nm force', price: 600.00, category: 'Steering wheels', image_url: '/uploads/1783949511880-825997882.jpg', stock: 5 },
  { title: 'Logitech G305', description: 'LIGHT SPEED wireless gaming mouse, HERO 12000 DPI sensor, 6 programmable keys 250 hours of battery life, Customizable game profiles, lightweight, PC / Mac, Black - German Packaging', price: 50.00, category: 'gaming mice', image_url: '/uploads/1783950532456-525066060.jpg', stock: 10 },
];

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@relay.demo' },
    update: {},
    create: {
      name: 'Demo Admin',
      email: 'admin@relay.demo',
      password: ADMIN_PASSWORD_HASH,
      role: 'admin',
    },
  });
  console.log('✔ Demo admin ready (admin@relay.demo / Admin123!)');

  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { title_price: { title: product.title, price: product.price } },
      update: {},
      create: product,
    });
  }
  console.log(`✔ Seeded ${PRODUCTS.length} products`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());