# 🗄️ Setup Steps After PostgreSQL Installation

## After PostgreSQL 18 Installation is Complete

Follow these steps in order:

### Step 1: Verify PostgreSQL is Running ✅

Open Command Prompt and run:
```bash
psql --version
```

You should see: `psql (PostgreSQL) 18.x`

### Step 2: Create Database 🗄️

Open **pgAdmin** or use command line:

**Using Command Line:**
```bash
# Login to PostgreSQL (default user is 'postgres')
psql -U postgres

# Create database
CREATE DATABASE pabblyform;

# Exit
\q
```

**Using pgAdmin:**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name: `pabblyform`
5. Click "Save"

### Step 3: Update Database Connection String 🔗

Check the file: `server/.env`

It should have:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pabblyform"
```

**Replace `your_password` with your actual PostgreSQL password!**

### Step 4: Run Database Migrations 🚀

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

This will create all the tables (Users, Forms, Submissions, etc.)

### Step 5: Start Both Servers 🎯

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Wait for:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Wait for:
```
➜  Local:   http://localhost:5173/
```

### Step 6: Create Your Account 👤

1. Visit: **http://localhost:5173**
2. Click "Sign Up"
3. Create your account:
   - Email: your@email.com
   - Password: (min 8 characters)
   - Name: Your Name
   - Company: Your Company (optional)

### Step 7: Enjoy Your App! 🎉

Once logged in:
1. Toggle **Dark Mode** (moon icon in navbar)
2. Click **"Create Form"** to start
3. Explore all the modern UI features
4. Test animations by hovering over cards

---

## 🆘 Troubleshooting

### Database Connection Error
**Problem:** `Can't reach database server at localhost:5432`

**Solution:**
1. Make sure PostgreSQL is running (check pgAdmin)
2. Verify `.env` has correct password
3. Check if port 5432 is open

### Prisma Migration Error
**Problem:** `Migration failed`

**Solution:**
```bash
cd server
npx prisma db push
npx prisma generate
```

### Port Already in Use
**Problem:** `Port 5000 already in use`

**Solution:**
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

---

## 📞 Ready to Continue?

Once PostgreSQL is installed and running, just let me know and I'll:
1. Help you set up the database
2. Run migrations
3. Create a test account
4. Get everything working perfectly!

Take your time with the installation. I'm here to help! 🚀
