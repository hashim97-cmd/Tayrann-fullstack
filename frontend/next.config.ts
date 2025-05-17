import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    images: {
        domains: ['assets.wego.com'],
      },
    
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
 

