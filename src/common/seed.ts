// import { Logger } from '@nestjs/common';
// import dataSource from 'src/config/orm.config';
// import { User, UserRole } from 'src/users/entities/user.entity';
// import { Category } from 'src/categories/entities/category.entity';
// import { Product, ProductStatus } from 'src/products/entities/product.entity';
// import { config } from 'dotenv';

// config();

// // --- Helper function to replace faker.helpers.slugify ---
// function slugify(text: string): string {
//   return text
//     .toString()
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, '-') // Replace spaces with -
//     .replace(/[^\w\-]+/g, '') // Remove all non-word chars
//     .replace(/\-\-+/g, '-'); // Replace multiple - with single -
// }

// // Generate realistic product names and descriptions
// const productNames = [
//   'Premium Water Filter System',
//   'Replacement Filter Cartridge',
//   'Under Sink Water Purifier',
//   'Countertop Water Filter',
//   'Shower Water Filter',
//   'Whole House Water Filtration',
//   'Alkaline Water Ionizer',
//   'UV Water Sterilizer',
//   'Sediment Filter',
//   'Activated Carbon Filter',
//   'Reverse Osmosis System',
//   'Water Softener Unit',
//   'Iron Removal Filter',
//   'Chlorine Removal Filter',
//   'Bacteria Removal System',
//   'Heavy Metal Filter',
//   'Fluoride Removal System',
//   'Well Water Treatment',
//   'City Water Filter',
//   'Industrial Water Purifier',
// ];

// const productDescriptions = [
//   'High-quality water filtration system that removes impurities and improves taste',
//   'Essential replacement cartridge for maintaining optimal filtration performance',
//   'Compact under-sink installation for continuous clean water supply',
//   'Space-saving countertop model with advanced filtration technology',
//   'Specialized filter to remove chlorine and chemicals from shower water',
//   'Comprehensive solution for whole-house water purification needs',
//   'System that increases water pH for health benefits',
//   'UV sterilization technology to eliminate bacteria and viruses',
//   'Primary filter that removes large particles and sediment',
//   'Premium carbon filter for removing chlorine and organic compounds',
//   'Advanced system that removes up to 99% of contaminants',
//   'Solution for hard water that reduces mineral buildup',
//   'Specialized filter for removing iron and rust stains',
//   'Effective chlorine removal for better tasting water',
//   'Powerful system that eliminates harmful bacteria',
//   'Advanced filtration for removing lead and other heavy metals',
//   'Specialized system for fluoride reduction',
//   'Complete treatment solution for well water sources',
//   'Ideal filter for municipal water supplies',
//   'Heavy-duty system for commercial applications',
// ];

// const categoryNames = [
//   'Under Sink Filters',
//   'Countertop Filters',
//   'Whole House Systems',
//   'Replacement Parts',
//   'Shower Filters',
//   'Well Water Treatment',
//   'Commercial Filters',
//   'Alkaline Systems',
//   'UV Sterilizers',
//   'Sediment Filters',
//   'Carbon Filters',
//   'Reverse Osmosis',
//   'Water Softeners',
//   'Iron Removal',
//   'Chlorine Removal',
//   'Bacteria Treatment',
//   'Heavy Metal Filters',
//   'Fluoride Removal',
//   'City Water Filters',
//   'Industrial Systems',
// ];

// async function bootstrap() {
//   const logger = new Logger('Seed');
//   logger.log('Seeding...');

//   await dataSource.initialize();

//   const userRepository = dataSource.getRepository(User);
//   const categoryRepository = dataSource.getRepository(Category);
//   const productRepository = dataSource.getRepository(Product);

//   try {
//     // 1. Ensure Admin User Exists
//     logger.log('Checking for admin user...');
//     let adminUser = await userRepository.findOneBy({
//       email: 'admin@example.com',
//     });

//     if (!adminUser) {
//       logger.log('Admin user not found, creating one...');
//       adminUser = userRepository.create({
//         name: 'Admin User',
//         email: 'admin@example.com',
//         password: process.env.ADMIN_PASS_SEED,
//         role: UserRole.ADMIN,
//         phone: '+1234567890',
//       });
//       await userRepository.save(adminUser);
//       logger.log('Admin user created.');
//     } else {
//       logger.log('Admin user already exists.');
//     }

//     // 2. Clear Old Products and Categories
//     logger.log('Clearing old product and category data...');
//     // Use TRUNCATE for efficiency and to reset auto-incrementing IDs.
//     // Products must be cleared before categories due to foreign key constraints.
//     await productRepository.query(
//       'TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;',
//     );
//     await categoryRepository.query(
//       'TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE;',
//     );
//     logger.log('Data cleared.');

//     // 3. Create Categories
//     logger.log('Creating categories...');
//     const categories: Category[] = [];
//     for (let i = 0; i < categoryNames.length; i++) {
//       const category = categoryRepository.create({
//         name: categoryNames[i],
//         slug: slugify(categoryNames[i]),
//       });
//       categories.push(category);
//     }
//     await categoryRepository.save(categories);
//     logger.log(`${categories.length} categories created.`);

//     // 4. Create Products
//     logger.log('Creating products...');
//     const batchSize = 100;

//     for (let i = 0; i < 1000; i++) {
//       const productName = productNames[i % productNames.length];
//       const productDescription =
//         productDescriptions[i % productDescriptions.length];

//       const product = productRepository.create({
//         user: adminUser,
//         name: `${productName} ${Math.floor(i / productNames.length) + 1}`,
//         description: `${productDescription} - Variant ${i + 1}`,
//         price: Math.round(Math.random() * (500 - 20) + 20),
//         image_path: `https://picsum.photos/640/480?random=${i}`,
//         status:
//           Math.random() < 0.9
//             ? ProductStatus.AVAILABLE
//             : ProductStatus.OUT_OF_STOCK,
//       });

//       await productRepository.save(product);

//       if ((i + 1) % batchSize === 0 || i === 999) {
//         logger.log(`Created ${Math.min(i + 1, 1000)} products...`);
//       }
//     }

//     logger.log('Seeding completed successfully.');
//   } catch (error) {
//     logger.error('Seeding error:', error);
//   } finally {
//     await dataSource.destroy();
//   }
// }

// bootstrap().catch((error) => {
//   console.error('Unhandled error in bootstrap:', error);
//   process.exit(1);
// });
