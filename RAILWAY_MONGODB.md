# Railway MongoDB Deployment Guide

This document provides information about connecting to MongoDB in a Railway deployment.

## Authentication Issues

If you encounter a MongoDB authentication error like this:

```
MongoServerError: Authentication failed.
errorLabelSet: Set(2) { 'HandshakeError', 'ResetPool' },
errorResponse: {
  ok: 0,
  errmsg: 'Authentication failed.',
  code: 18,
  codeName: 'AuthenticationFailed'
}
```

The issue is typically with the connection string format or authentication configuration.

## Solutions

We've implemented multiple solutions to address this issue:

### 1. MongoDB Connection String Format

Railway provides MongoDB connection strings that may require specific formatting:

- **Standard Format**: `mongodb://username:password@hostname:port/database?authSource=admin`
- **URL-Encoded**: `mongodb://%6D%6F%6E%67%6F:password@hostname:port/database?authSource=admin`
- **With Direct Connection**: `mongodb://username:password@hostname:port/database?authSource=admin&directConnection=true`

For detailed testing, run:
```
npm run test-db
npm run test-db-minimal
```

### 2. Railway MongoDB Workaround

A simplified connection approach that works with Railway's MongoDB configuration:

- The `railway-db-workaround.js` provides a streamlined connection implementation
- It uses minimal connection options and proper error handling
- The workaround is automatically applied on Railway (via `use-railway-workaround.js`)

To manually apply the workaround:
```
npm run start:with-workaround
```

To run without the workaround (for local development):
```
npm run start:no-workaround
```

### 3. Configuration Options

The following options help with Railway MongoDB connections:

- `authSource=admin`: Ensures authentication against the admin database
- `directConnection=true`: Forces a direct connection to the MongoDB server
- Proper URL encoding of usernames and passwords

## Environment Variables

The following environment variables should be set in Railway:

- `MONGODB_URI`: The MongoDB connection string provided by Railway
- `RAILWAY`: Set to "true" to indicate a Railway deployment
- `NODE_ENV`: Set to "production" for production deployments

## Troubleshooting

1. **Test Different Connection Strings**:
   - Run `npm run test-db` to test multiple connection string formats
   - Look for the format that successfully connects

2. **Check Railway Environment**:
   - Verify Railway MongoDB service is properly provisioned
   - Check if the MongoDB username and password are correct

3. **Connection Options**:
   - Try different connection options in `db.js` or `railway-db-workaround.js`
   - Consider adjusting timeouts for slower connections

4. **Database Initialization**:
   - After successful connection, run `npm run seed` to initialize the database
   - Ensure proper MongoDB permissions for seeding data

## References

- [MongoDB Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Railway MongoDB Documentation](https://docs.railway.app/databases/mongodb)
- [MongoDB Node.js Driver Documentation](https://mongodb.github.io/node-mongodb-native/)