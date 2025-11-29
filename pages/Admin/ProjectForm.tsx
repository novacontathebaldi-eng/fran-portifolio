
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { Project, ContentBlock } from '../../types';
import { ArrowLeft, Save, Upload, Type, Image as ImageIcon, LayoutGrid, Quote, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

export const ProjectForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, addProject, updateProject } = useProjects();
  
  const isEditing = Boolean(id);
  const existingProject = projects.find(p => p.id === id);

  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    category: 'Residencial',
    year: new Date().getFullYear(),
    area: 0,
    location: '',
    description: '',
    blocks: [],
    image: '',
    images: []
  });

  useEffect(() => {
    if (isEditing && existingProject) {
      setFormData(existingProject);
    }
  }, [isEditing, existingProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Block Builder Logic ---

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      items: type === 'image-grid' ? ['', ''] : undefined,
    };
    setFormData(prev => ({ ...prev, blocks: [...(prev.blocks || []), newBlock] }));
  };

  const updateBlock = (id: string, field: keyof ContentBlock, value: any) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks?.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };

  const updateGridItem = (blockId: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks?.map(b => {
         if (b.id !== blockId) return b;
         const newItems = [...(b.items || [])];
         newItems[index] = value;
         return { ...b, items: newItems };
      })
    }));
  };

  const removeBlock = (id: string) => {
    setFormData(prev => ({ ...prev, blocks: prev.blocks?.filter(b => b.id !== id) }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(formData.blocks || [])];
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    setFormData(prev => ({ ...prev, blocks }));
  };

  // --- End Block Builder ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert("Por favor preencha título e imagem de capa.");
      return;
    }

    const projectData = {
      ...formData,
      // If no blocks, use description as a text block for migration
      blocks: (formData.blocks && formData.blocks.length > 0) 
        ? formData.blocks 
        : [{ id: 'legacy', type: 'text', content: formData.description || '' }] as ContentBlock[]
    };

    if (isEditing && id) {
      updateProject({ ...projectData, id } as Project);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      addProject({ ...projectData, id: newId } as Project);
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <Link to="/admin" className="flex items-center text-gray-500 hover:text-black">
             <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
           </Link>
           <h1 className="text-2xl font-serif font-bold">{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Metadata */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Informações Básicas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título</label>
                    <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Categoria</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded text-sm">
                      <option>Residencial</option>
                      <option>Comercial</option>
                      <option>Interiores</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ano</label>
                      <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Área (m²)</label>
                      <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                    </div>
                  </div>
                   <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Localização</label>
                    <input name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Capa do Projeto</h3>
                <input name="image" value={formData.image} onChange={handleChange} className="w-full border p-2 rounded text-sm mb-4" placeholder="URL da Imagem" />
                {formData.image && <img src={formData.image} className="w-full h-40 object-cover rounded" />}
              </div>

              <div className="sticky top-6">
                 <button type="submit" className="w-full bg-black text-white px-8 py-4 rounded-lg hover:bg-accent hover:text-black transition flex items-center justify-center space-x-2 shadow-lg">
                  <Save className="w-5 h-5" />
                  <span className="font-bold">Salvar e Publicar</span>
                </button>
              </div>
           </div>

           {/* Right: Block Builder */}
           <div className="lg:col-span-2">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
                 <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                   <div>
                     <h2 className="text-xl font-bold font-serif">Conteúdo do Projeto</h2>
                     <p className="text-sm text-gray-400">Construa a narrativa do projeto usando blocos.</p>
                   </div>
                   <div className="flex space-x-2">
                      <button type="button" onClick={() => addBlock('text')} className="p-2 hover:bg-gray-100 rounded" title="Texto"><Type className="w-5 h-5" /></button>
                      <button type="button" onClick={() => addBlock('image-full')} className="p-2 hover:bg-gray-100 rounded" title="Imagem Cheia"><ImageIcon className="w-5 h-5" /></button>
                      <button type="button" onClick={() => addBlock('image-grid')} className="p-2 hover:bg-gray-100 rounded" title="Grid"><LayoutGrid className="w-5 h-5" /></button>
                      <button type="button" onClick={() => addBlock('quote')} className="p-2 hover:bg-gray-100 rounded" title="Citação"><Quote className="w-5 h-5" /></button>
                   </div>
                 </div>

                 <div className="space-y-6">
                    {(!formData.blocks || formData.blocks.length === 0) && (
                      <div className="text-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
                        Adicione blocos para começar a contar a história do projeto.
                      </div>
                    )}
                    
                    {formData.blocks?.map((block, idx) => (
                      <motion.div layout key={block.id} className="relative group border border-gray-100 rounded-lg p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition">
                         {/* Controls */}
                         <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                            <button type="button" onClick={() => moveBlock(idx, 'up')} className="p-1 hover:bg-gray-200 rounded"><ArrowUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveBlock(idx, 'down')} className="p-1 hover:bg-gray-200 rounded"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                         </div>

                         {/* Render based on Type */}
                         {block.type === 'text' && (
                           <div>
                             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2"><Type className="w-3 h-3" /> Texto Rico</label>
                             <textarea 
                                value={block.content} 
                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 leading-relaxed min-h-[100px]"
                                placeholder="Escreva o parágrafo aqui..."
                             />
                           </div>
                         )}

                         {block.type === 'quote' && (
                           <div className="pl-4 border-l-4 border-accent">
                             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2"><Quote className="w-3 h-3" /> Destaque / Citação</label>
                             <input 
                                value={block.content} 
                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-serif italic text-gray-800"
                                placeholder="Frase de destaque..."
                             />
                           </div>
                         )}

                         {block.type === 'image-full' && (
                           <div>
                             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Imagem Full-Width</label>
                             <input 
                                value={block.content} 
                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                className="w-full border p-2 rounded mb-2 text-sm"
                                placeholder="URL da imagem"
                             />
                             {block.content && <img src={block.content} className="w-full h-48 object-cover rounded" />}
                           </div>
                         )}

                         {block.type === 'image-grid' && (
                           <div>
                             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> Grid (2 Colunas)</label>
                             <div className="grid grid-cols-2 gap-4">
                               {block.items?.map((item, i) => (
                                 <div key={i}>
                                   <input 
                                      value={item}
                                      onChange={(e) => updateGridItem(block.id, i, e.target.value)}
                                      className="w-full border p-2 rounded mb-2 text-sm"
                                      placeholder={`URL Imagem ${i+1}`}
                                   />
                                   {item && <img src={item} className="w-full h-32 object-cover rounded" />}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                      </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
};
