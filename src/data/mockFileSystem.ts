import { FileSystemNode } from '../types';

export const mockFileSystem: FileSystemNode = {
  name: 'Project Root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.jsx', type: 'file', fileType: 'code' },
        { name: 'main.jsx', type: 'file', fileType: 'code' },
      ],
    },
    {
      name: 'documents',
      type: 'folder',
      children: [
        { name: 'project-brief.docx', type: 'file', fileType: 'document' },
        { name: 'meeting-notes.pdf', type: 'file', fileType: 'pdf' },
      ],
    },
    {
        name: 'assets',
        type: 'folder',
        children: [
            { name: 'logo.png', type: 'file', fileType: 'image' },
            { name: 'demo.mp4', type: 'file', fileType: 'video' },
        ]
    },
    { name: 'README.md', type: 'file', fileType: 'document' },
    { name: 'run.sh', type: 'file', fileType: 'terminal'},
  ],
};
