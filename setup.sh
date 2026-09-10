#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Daydream Portal Setup Script${NC}"
echo "================================="

# Check if Node.js is installed
echo -e "\n${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Recommended version: 18.x or higher"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"

# Check if npm is installed
echo -e "\n${YELLOW}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"

# Generate secure JWT secret
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    elif command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_hex(32))"
    elif command -v python &> /dev/null; then
        python -c "import os; print(os.urandom(32).hex())"
    else
        echo "fallback_jwt_secret_$(date +%s)_$(shuf -i 1000-9999 -n 1)"
    fi
}

# Create .env file from template if it doesn't exist
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        cp .env.template .env
        
        # Generate a secure JWT secret
        JWT_SECRET=$(generate_jwt_secret)
        
        # Replace the placeholder with actual secure secret
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/change_me_to_a_random_secret_at_least_32_chars/$JWT_SECRET/" .env
        else
            # Linux
            sed -i "s/change_me_to_a_random_secret_at_least_32_chars/$JWT_SECRET/" .env
        fi
        
        echo -e "${GREEN}✅ Created .env file from template${NC}"
    else
        echo -e "${RED}❌ .env.template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Create frontend .env.local if it doesn't exist
echo -e "\n${YELLOW}Setting up frontend environment...${NC}"
if [ ! -f "frontend/.env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${GREEN}✅ Frontend .env.local already exists${NC}"
fi

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo -e "\n${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Start PostgreSQL: ./scripts/start-postgres.sh"
echo "2. Run migrations: npm run migrate"
echo "3. Seed data: psql -U daydream_user -d daydream_portal -f database/seed-data.sql"
echo "4. Run './run-local.sh' to start the servers"
echo -e "\n${YELLOW}Login: any email in the seed data works. Magic links are printed to the terminal.${NC}"
