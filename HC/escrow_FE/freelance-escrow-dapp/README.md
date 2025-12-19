# React + Vite

STEPS to Follow: 

# 1. Create the project
npm create vite@latest freelance-escrow-dapp -- --template react

# 2. Navigate into the project
cd freelance-escrow-dapp

# 3. Install base dependencies
npm install

# 4. Install project dependencies
npm install ethers lucide-react

# 5. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# 6. Initialize Tailwind
npx tailwindcss init -p

# 7. Create folder structure
mkdir -p src/components/common src/components/jobs src/components/disputes src/config src/hooks src/utils

# 8. Start development server
npm run dev