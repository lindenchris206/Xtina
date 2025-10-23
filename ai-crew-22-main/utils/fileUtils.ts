import type { ProjectFile } from '../types';
import JSZip from 'jszip';
import saveAs from 'file-saver';

/**
 * Creates or updates a file within a nested file tree structure.
 * This function will recursively create parent directories if they don't exist.
 * @param files The current array of root ProjectFile nodes.
 * @param path The full path of the file to create/update (e.g., 'src/components/Button.tsx').
 * @param content The new content of the file.
 * @returns A new array of root ProjectFile nodes with the file updated/created.
 */
export const updateFileInTree = (files: ProjectFile[], path: string, content: string): ProjectFile[] => {
    const newFiles = JSON.parse(JSON.stringify(files)); // Deep copy to avoid mutation
    const parts = path.split('/');
    let currentLevel: ProjectFile[] = newFiles;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        let node = currentLevel.find(f => f.name === part);

        if (isLastPart) {
            if (node) {
                // Update existing file
                node.content = content;
                node.isFolder = false;
                node.children = undefined;
            } else {
                // Create new file
                currentLevel.push({
                    name: part,
                    path: currentPath,
                    isFolder: false,
                    content: content
                });
            }
        } else {
            if (!node) {
                // Create new folder
                node = {
                    name: part,
                    path: currentPath,
                    isFolder: true,
                    content: '',
                    children: []
                };
                currentLevel.push(node);
            } else if (!node.isFolder) {
                 // A file exists where a folder should be. Overwrite it.
                 node.isFolder = true;
                 node.children = [];
            }
            // Move to the next level
            currentLevel = node.children!;
        }
    }
    return newFiles;
};

/**
 * Builds a nested file tree structure from a flat list of file paths.
 */
export const buildFileTree = (files: { path: string, content: string }[]): ProjectFile[] => {
    let result: ProjectFile[] = [];
    files.forEach(file => {
        result = updateFileInTree(result, file.path, file.content);
    });
    return result;
};


/**
 * Downloads the project files as a zip archive.
 */
export const downloadProjectAsZip = async (projectFiles: ProjectFile[], projectName: string) => {
    const zip = new JSZip();
    const addFilesToZip = (files: ProjectFile[], currentFolder: JSZip) => {
        files.forEach(file => {
            if (file.isFolder) {
                const folder = currentFolder.folder(file.name);
                if (folder && file.children) {
                    addFilesToZip(file.children, folder);
                }
            } else {
                currentFolder.file(file.name, file.content);
            }
        });
    };

    addFilesToZip(projectFiles, zip);

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(content, `${safeProjectName}.zip`);
    } catch (error) {
        console.error("Failed to generate zip file:", error);
    }
};
