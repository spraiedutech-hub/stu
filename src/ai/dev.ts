'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-3d-mesh-from-image.ts';
import '@/ai/flows/generate-animation-from-mesh.ts';
