# Profile Picture Upload Architecture

    ## Overview
    This system handles profile picture uploads with proper file handling, database integration, and production-ready architecture.

    ## Development Setup

    ### File Storage
    - **Location**: `backend/uploads/profiles/`
    - **Filename Format**: `{userId}_{timestamp}.{extension}`
    - Example: `123_1704123456789.jpg`
    - **Database Storage**: Path stored in `users.profile_picture` column as `/uploads/profiles/filename.jpg`

    ### Configuration
    - **File Upload Library**: Multer
    - **Allowed Types**: Images only (jpeg, jpg, png, gif, webp)
    - **Size Limit**: 5MB maximum
    - **Storage**: Local disk (diskStorage)

    ### File Serving
    - **Static Route**: `/uploads` mapped to `backend/uploads` directory
    - **Access URL**: `http://localhost:3000/uploads/profiles/filename.jpg`
    - **Frontend Display**: Uses full URL from database

    ## Production Deployment

    ### Cloud Storage Migration

    #### Option 1: AWS S3 (Recommended for AWS deployments)

    **Setup**:
    ```bash
    npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer-s3
    ```

    **Configuration** (`backend/src/config/multer.ts`):
    ```typescript
    import { S3Client } from '@aws-sdk/client-s3';
    import multerS3 from 'multer-s3';

    const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
    });

    export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME!,
        acl: 'public-read',
        metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
        },
        key: function (req: AuthRequest, file, cb) {
        const userId = req.user!.id;
        const ext = path.extname(file.originalname);
        cb(null, `profiles/${userId}_${Date.now()}${ext}`);
        }
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
    });
    ```

    **Environment Variables**:
    ```env
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    S3_BUCKET_NAME=lush-laundry-uploads
    ```

    **URL Pattern**: `https://{bucket}.s3.{region}.amazonaws.com/profiles/{filename}`

    ---

    #### Option 2: Cloudinary (Recommended for ease of use)

    **Setup**:
    ```bash
    npm install cloudinary multer-storage-cloudinary
    ```

    **Configuration**:
    ```typescript
    import { v2 as cloudinary } from 'cloudinary';
    import { CloudinaryStorage } from 'multer-storage-cloudinary';

    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lush-laundry/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
        ],
        public_id: (req: AuthRequest, file) => {
        return `${req.user!.id}_${Date.now()}`;
        }
    } as any
    });

    export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
    });
    ```

    **Environment Variables**:
    ```env
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

    **URL Pattern**: `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/lush-laundry/profiles/{filename}`

    ---

    #### Option 3: Azure Blob Storage (For Azure deployments)

    **Setup**:
    ```bash
    npm install @azure/storage-blob multer-azure-storage
    ```

    **Configuration**:
    ```typescript
    import { BlobServiceClient } from '@azure/storage-blob';
    import MulterAzureStorage from 'multer-azure-storage';

    export const upload = multer({
    storage: new MulterAzureStorage({
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
        containerName: 'profile-pictures',
        blobName: (req: AuthRequest, file) => {
        const userId = req.user!.id;
        const ext = path.extname(file.originalname);
        return `${userId}_${Date.now()}${ext}`;
        }
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
    });
    ```

    **Environment Variables**:
    ```env
    AZURE_STORAGE_CONNECTION_STRING=your_connection_string
    ```

    **URL Pattern**: `https://{account}.blob.core.windows.net/profile-pictures/{filename}`

    ---

    ### Database Schema

    **Current Schema**:
    ```sql
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    profile_picture VARCHAR(500),  -- Stores URL or path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
    );
    ```

    **Profile Picture Column**:
    - **Development**: `/uploads/profiles/filename.jpg`
    - **Production (S3)**: `https://bucket.s3.region.amazonaws.com/profiles/filename.jpg`
    - **Production (Cloudinary)**: `https://res.cloudinary.com/cloud/image/upload/v123/profiles/filename.jpg`
    - **Production (Azure)**: `https://account.blob.core.windows.net/container/filename.jpg`

    ---

    ## Security Considerations

    ### File Validation
    1. **MIME Type Check**: Only allow image/* types
    2. **File Extension Check**: Whitelist extensions (.jpg, .jpeg, .png, .gif, .webp)
    3. **File Size Limit**: 5MB maximum
    4. **Magic Number Validation**: Verify actual file type (not just extension)

    ### Storage Security
    1. **Access Control**: 
    - Development: Files served via Express static middleware
    - Production: Use signed URLs for private files or public-read for public access
    2. **File Naming**: User ID + timestamp prevents overwrites and collisions
    3. **Input Sanitization**: Multer handles file upload attacks

    ### Production Checklist
    - [ ] Configure cloud storage credentials (AWS/Cloudinary/Azure)
    - [ ] Update multer configuration to use cloud storage
    - [ ] Update controller to return cloud URLs instead of local paths
    - [ ] Set up CDN for faster delivery (CloudFront for S3, built-in for Cloudinary)
    - [ ] Configure CORS for cloud storage buckets
    - [ ] Set up backup/retention policies
    - [ ] Monitor storage costs and usage
    - [ ] Implement image optimization (Cloudinary auto, or manual with Sharp)

    ---

    ## Testing with Current Data

    ### Test Users
    Use existing users from database:
    ```sql
    SELECT id, email, full_name, profile_picture FROM users;
    ```

    ### Upload Test Flow
    1. **Login**: Use existing user credentials
    2. **Navigate**: Go to Profile page
    3. **Upload**: Click profile picture, select image
    4. **Verify**: 
    - File saved to `backend/uploads/profiles/`
    - Database updated with path
    - Image displays in sidebar
    - Image displays in UserManagement

    ### Manual Database Update (for testing)
    ```sql
    -- Add test profile picture for user
    UPDATE users 
    SET profile_picture = '/uploads/profiles/1_1704123456789.jpg'
    WHERE id = 1;
    ```

    ---

    ## Migration Strategy

    ### Step 1: Development (Current)
    - Files stored locally in `backend/uploads/`
    - Served via Express static middleware
    - Database stores relative path `/uploads/profiles/filename`

    ### Step 2: Staging
    - Configure cloud storage (S3/Cloudinary/Azure)
    - Update multer configuration
    - Test upload flow
    - Migrate existing files to cloud

    ### Step 3: Production
    - Switch to cloud storage
    - Update database paths to cloud URLs
    - Remove local file serving
    - Set up CDN for global delivery

    ### Migration Script Example
    ```typescript
    // migrate-to-cloud.ts
    import { query } from './db';
    import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    import fs from 'fs';
    import path from 'path';

    async function migrateProfilePictures() {
    const s3 = new S3Client({ region: 'us-east-1' });
    
    // Get all users with local profile pictures
    const result = await query(
        `SELECT id, profile_picture FROM users 
        WHERE profile_picture LIKE '/uploads/%'`
    );
    
    for (const user of result.rows) {
        const localPath = path.join(__dirname, '..', user.profile_picture);
        
        if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = path.basename(user.profile_picture);
        
        // Upload to S3
        await s3.send(new PutObjectCommand({
            Bucket: 'lush-laundry-uploads',
            Key: `profiles/${fileName}`,
            Body: fileBuffer,
            ACL: 'public-read'
        }));
        
        // Update database
        const cloudUrl = `https://lush-laundry-uploads.s3.us-east-1.amazonaws.com/profiles/${fileName}`;
        await query(
            `UPDATE users SET profile_picture = $1 WHERE id = $2`,
            [cloudUrl, user.id]
        );
        
        console.log(`✅ Migrated profile picture for user ${user.id}`);
        }
    }
    }
    ```

    ---

    ## API Endpoints

    ### Upload Profile Picture
    ```
    POST /api/auth/profile-picture
    Authorization: Bearer {token}
    Content-Type: multipart/form-data

    Body: FormData with 'profilePicture' field
    ```

    **Response**:
    ```json
    {
    "message": "Profile picture uploaded successfully",
    "profile_picture": "/uploads/profiles/123_1704123456789.jpg"
    }
    ```

    ### Update Profile
    ```
    PUT /api/auth/profile
    Authorization: Bearer {token}
    Content-Type: application/json

    Body: {
    "full_name": "John Doe",
    "phone": "+1234567890"
    }
    ```

    ---

    ## Monitoring

    ### Development
    - Check `backend/uploads/profiles/` for uploaded files
    - Monitor console logs for upload confirmations
    - Verify database updates

    ### Production
    - Monitor cloud storage bucket size and costs
    - Set up alerts for upload failures
    - Track CDN bandwidth usage
    - Monitor image optimization performance

    ---

    ## Cost Estimation

    ### AWS S3
    - Storage: ~$0.023/GB/month
    - Requests: ~$0.0004/1000 PUT requests
    - Transfer: ~$0.09/GB (first 10TB)
    - Example: 1000 users × 500KB = 500MB = ~$0.01/month storage

    ### Cloudinary (Free Tier)
    - 25GB storage
    - 25GB bandwidth/month
    - Sufficient for small to medium deployments

    ### Azure Blob Storage
    - Storage: ~$0.018/GB/month
    - Similar pricing to S3

    ---

    ## Troubleshooting

    ### File Not Uploading
    1. Check multer middleware is applied to route
    2. Verify file size under 5MB
    3. Check file type is image/*
    4. Verify uploads directory exists and is writable

    ### File Not Displaying
    1. Check Express static middleware is configured
    2. Verify file path in database matches actual file location
    3. Check frontend is using correct URL format
    4. Verify CORS settings if using cloud storage

    ### Database Not Updating
    1. Check auth middleware provides user ID
    2. Verify SQL query syntax
    3. Check database connection
    4. Monitor console logs for errors

    ---

    ## Summary

    ✅ **Development Setup Complete**:
    - Local file storage in `backend/uploads/profiles/`
    - Multer configured with validation and size limits
    - Database integration working
    - Static file serving configured
    - Frontend upload UI functional

    🚀 **Production Ready**:
    - Multiple cloud storage options documented
    - Migration strategy defined
    - Security best practices implemented
    - Cost-effective deployment paths available
    - Testing procedures established
