import { config } from 'dotenv';
config();

import '@/ai/flows/upc-to-isbn.ts';
import '@/ai/flows/extract-isbn-from-image.ts';
