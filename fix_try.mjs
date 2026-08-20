import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /try \{\s*try \{\s*if \(imagePaths\.length > 0\) \{/g;
if (regex.test(content)) {
    content = content.replace(regex, `try {
                if (imagePaths.length > 0) {`);
}

const regex2 = /\} catch \(storageErr\) \{\s*console\.error\("\[AI DELETE\] Error deleting storage files \(ignoring\):", storageErr\);\s*\}\s*\} catch \(storageErr\) \{\s*console\.error\("\[AI DELETE\] Error deleting storage files \(ignoring\):", storageErr\);\s*\}/g;
if (regex2.test(content)) {
    content = content.replace(regex2, `} catch (storageErr) {
                console.error("[AI DELETE] Error deleting storage files (ignoring):", storageErr);
            }`);
}

fs.writeFileSync(file, content);
console.log("Fixed try-catch block");
