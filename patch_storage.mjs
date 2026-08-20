import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const oldStorage = `            if (imagePaths.length > 0) {
                await supabase.storage.from('agromart-ai-images').remove(imagePaths);
            }
            if (docPaths.length > 0) {
                await supabase.storage.from('agromart-ai-documents').remove(docPaths);
            }`;

const newStorage = `            try {
                if (imagePaths.length > 0) {
                    await supabase.storage.from('agromart-ai-images').remove(imagePaths);
                }
                if (docPaths.length > 0) {
                    await supabase.storage.from('agromart-ai-documents').remove(docPaths);
                }
            } catch (storageErr) {
                console.error("[AI DELETE] Error deleting storage files (ignoring):", storageErr);
            }`;

content = content.replace(oldStorage, newStorage);

const oldStorageAll = `                if (imagePaths.length > 0) {
                    await supabase.storage.from('agromart-ai-images').remove(imagePaths);
                }
                if (docPaths.length > 0) {
                    await supabase.storage.from('agromart-ai-documents').remove(docPaths);
                }`;

content = content.replace(oldStorageAll, newStorage);

fs.writeFileSync(file, content);
console.log('Patched storage error handling');
