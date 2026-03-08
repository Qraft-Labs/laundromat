import fs from 'fs';
import path from 'path';

/**
 * Ensure required directories exist for file uploads
 */
export const ensureDirectories = (): void => {
  const directories = [
    'uploads',
    'uploads/profiles',
    'uploads/receipts',
  ];

  directories.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};
