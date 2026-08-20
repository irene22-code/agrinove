import fs from 'fs';
const file = 'src/pages/admin/AdminPlantHealth.tsx';
let content = fs.readFileSync(file, 'utf8');

const newDelete = `
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this problem?')) return;
        try {
            console.log("Deleting ID:", id);
            const res = await deletePlantHealth(id);
            console.log("Delete response:", res);
            await loadProblems();
            console.log("Loaded problems after delete.");
        } catch (error) {
            console.error('Failed to delete', error);
            alert("Failed to delete: " + (error as any).message);
        }
    };
`;

content = content.replace(/const handleDelete = async \(id: string\) => \{[\s\S]*?catch \(error\) \{[\s\S]*?\}[\s\S]*?\};/, newDelete.trim());
fs.writeFileSync(file, content);
