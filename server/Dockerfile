# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN yarn install

RUN yarn global add nodemon ts-node typescript

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 5001

# Command to run the app
CMD ["yarn", "start"]