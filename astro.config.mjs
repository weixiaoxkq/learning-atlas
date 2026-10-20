import { defineConfig } from 'astro/config';
const repo = process.env.GITHUB_REPOSITORY?.split('/');
export default defineConfig({
  site:
    process.env.SITE_URL || (repo ? `https://${repo[0]}.github.io` : 'https://example.github.io'),
  base:
    process.env.BASE_PATH ||
    (repo && repo[1].toLowerCase() !== `${repo[0]}.github.io`.toLowerCase() ? `/${repo[1]}` : '/'),
  output: 'static',
});
