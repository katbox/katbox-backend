// config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Storage for menu images
const menuItemsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'katbox_restaurants/menu-cards',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  } as any,
});

// Storage for category images
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'katbox_restaurants/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  } as any,
});

// Storage for item images
const itemStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'katbox_restaurants/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  } as any,
});

// Storage for decoration images
const decorationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'katbox_restaurants/decorations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  } as any,
});

export { cloudinary, menuItemsStorage, categoryStorage, itemStorage, decorationStorage };