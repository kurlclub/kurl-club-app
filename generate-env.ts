import fs from 'fs';
import path from 'path';

interface EnvVariables {
  common: Record<string, string>;
  sensitive: Record<string, string>;
}

const envVariables: EnvVariables = {
  common: {
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  },
  sensitive: {
    AUTH_SECRET: '',
  },
};

// Function to generate the .env file
function generateEnvFile(
  fileName: string,
  variables: Record<string, string>
): void {
  const filePath = path.join(process.cwd(), fileName);

  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${fileName} already exists. Skipping.`);
    return;
  }

  const content = Object.entries(variables)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(filePath, content);
  console.log(`${fileName} has been created.`);
}

// Main function to generate .env and .env.local files
function main(): void {
  generateEnvFile('.env', envVariables.common);
  generateEnvFile('.env.local', envVariables.sensitive);
}

main();
