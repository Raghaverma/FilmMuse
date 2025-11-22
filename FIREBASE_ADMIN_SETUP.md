# Firebase Admin SDK Setup Guide

The friends system requires Firebase Admin SDK credentials for server-side API routes. Follow these steps to set it up:

## Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview" → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download - **keep this file secure!**

## Step 2: Extract Values from JSON

The downloaded JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  ...
}
```

You need these three values:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

## Step 3: Create/Update .env.local File

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the Firebase Admin credentials:

```bash
# Firebase Admin SDK (for server-side API routes)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes (`"..."`)
- Keep the `\n` characters in the private key - they represent newlines
- Make sure `.env.local` is in your `.gitignore` (it should be by default)

## Step 4: Restart Your Development Server

After adding the credentials:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`

## Troubleshooting

### Error: "Firebase Admin environment variables are not set"
- Make sure `.env.local` exists in the project root
- Verify all three variables are set (no typos)
- Check that `FIREBASE_PRIVATE_KEY` is wrapped in quotes
- Restart your dev server after making changes

### Error: "Invalid credentials"
- Double-check you copied the values correctly from the JSON file
- Make sure the private key includes the full key with BEGIN/END markers
- Verify the project ID matches your Firebase project

### Still having issues?
- Check the server console for detailed error messages
- Verify your Firebase project has Firestore enabled
- Make sure the service account has proper permissions

