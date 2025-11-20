# Firebase Setup Guide for FilmMuse

This guide will help you set up Firebase Authentication and Firestore for FilmMuse.

## Prerequisites

- A Firebase account (free tier is sufficient)
- Node.js 18+ installed
- Your FilmMuse project cloned and dependencies installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "filmmuse")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set up Firestore Database

1. In your Firebase project, go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
3. Select a location for your database (choose the closest to your users)
4. Click "Enable"

### Firestore Security Rules

For development, you can use these basic rules. **Important**: Update these for production!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - readable by all, writable by owner
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User data - readable/writable by owner only
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Follows - readable by all, writable by authenticated users
    match /follows/{followId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.followerId == request.auth.uid || 
         request.auth.uid == resource.data.followerId);
    }
    
    // User stats - readable by all, writable by system
    match /userStats/{userId} {
      allow read: if true;
      allow write: if false; // Only via Cloud Functions or Admin SDK
    }
  }
}
```

To update rules:
1. Go to **Firestore Database** > **Rules**
2. Paste the rules above
3. Click "Publish"

## Step 4: Get Firebase Configuration

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "FilmMuse Web")
5. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in your project root (or update `.env` if it exists)
2. Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration values.

## Step 6: (Optional) Set up Firebase Admin SDK

If you want to use server-side API routes (for follows and list sharing), you'll need Firebase Admin SDK:

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Add to your `.env.local`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important**: Keep your private key secure and never commit it to version control!

## Step 7: Install Firebase Admin SDK (Optional)

If you're using server-side API routes:

```bash
npm install firebase-admin
```

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Create a test account
4. Verify that:
   - You can sign up successfully
   - You can log in
   - Your profile page loads
   - You can add movies to watchlist

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart your development server after adding environment variables
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

### "Firebase: Error (auth/invalid-api-key)"
- Verify your API key in Firebase Console matches your `.env.local`
- Make sure there are no extra spaces or quotes in your environment variables

### "Permission denied" errors in Firestore
- Check your Firestore security rules
- Make sure you're authenticated (check Firebase Auth)
- Verify the rules match your use case

### Data not persisting
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Check network tab for failed requests
- Ensure you're logged in (check Firebase Auth state)

## Migration from localStorage

If you have existing data in localStorage, you can:

1. Export your data from localStorage (check browser DevTools > Application > Local Storage)
2. Manually import it into Firestore using the Firebase Console
3. Or create a migration script to transfer data

## Production Considerations

Before deploying to production:

1. **Update Firestore Security Rules**: The test mode rules are too permissive for production
2. **Set up proper authentication**: Consider adding email verification
3. **Configure CORS**: If using custom domains
4. **Set up Firebase Hosting**: For optimal performance
5. **Enable Firebase Analytics**: To track usage
6. **Set up backup**: Configure Firestore backups
7. **Monitor usage**: Check Firebase usage limits

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure Firestore and Authentication are enabled

