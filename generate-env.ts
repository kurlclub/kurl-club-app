import fs from 'fs';
import path from 'path';

interface EnvVariables {
  common: Record<string, string>;
  sensitive: Record<string, string>;
}

const envVariables: EnvVariables = {
  common: {
    NEXT_PUBLIC_API_BASE_URL: 'https://devapi.kurlclub.com/api',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      '163293700424-iri3mrus6a48fb27ln14adfqoe6aiclq.apps.googleusercontent.com',
    NEXT_PUBLIC_ENABLE_LOCALHOST_FEDCM: 'false',
  },
  sensitive: {
    GEMINI_API_KEY: '',
    NPM_FLAGS: '--legacy-peer-deps',
    NPM_TOKEN: '',
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
    return;
  }

  const content = Object.entries(variables)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(filePath, content);
}

// Main function to generate .env and .env.local files
function main(): void {
  generateEnvFile('.env', envVariables.common);
  generateEnvFile('.env.local', envVariables.sensitive);
}

main();
