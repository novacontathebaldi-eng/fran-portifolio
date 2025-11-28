
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { Project } from '../../types';
import { ArrowLeft, Save, Upload } from 'lucide-react';

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

  const handleGalleryAdd = () => {
     // Mock logic for adding gallery image placeholder
     const newImage = `https://picsum.photos/seed/${Math.random()}/800/600`;
     setFormData(prev => ({ ...prev, images: [...(prev.images || []), newImage] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation mock
    if (!formData.title || !formData.image) {
      alert("Por favor preencha título e imagem de capa.");
      return;
    }

    if (isEditing && id) {
      updateProject({ ...formData, id } as Project);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      addProject({ ...formData, id: newId, images: formData.images || [] } as Project);
    }
    
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <Link to="/admin" className="flex items-center text-gray-500 hover:text-black">
             <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
           </Link>
           <h1 className="text-2xl font-serif font-bold">{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="col-span-2">
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título do Projeto</label>
               <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  className="w-full border p-3 rounded focus:border-black focus:outline-none text-lg" 
                  placeholder="Ex: Casa do Lago" 
               />
             </div>
             
             <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Categoria</label>
               <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none">
                 <option>Residencial</option>
                 <option>Comercial</option>
                 <option>Interiores</option>
                 <option>Corporativo</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Localização</label>
               <input name="location" value={formData.location} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none" placeholder="Cidade, UF" />
             </div>

             <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ano</label>
               <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none" />
             </div>

             <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Área (m²)</label>
               <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none" />
             </div>

             <div className="col-span-2">
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Descrição</label>
               <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none h-32" placeholder="Descreva o conceito do projeto..."></textarea>
             </div>

             <div className="col-span-2">
               <label className="block text-xs font-bold uppercase text-gray-500 mb-2">URL da Imagem de Capa</label>
               <div className="flex gap-2">
                 <input name="image" value={formData.image} onChange={handleChange} className="w-full border p-3 rounded focus:border-black focus:outline-none text-sm text-gray-600" placeholder="https://..." />
                 <button type="button" className="p-3 bg-gray-100 rounded hover:bg-gray-200"><Upload className="w-4 h-4" /></button>
               </div>
               {formData.image && <img src={formData.image} className="mt-4 h-48 object-cover rounded-lg border border-gray-200" />}
             </div>
             
             <div className="col-span-2 border-t pt-6 mt-2">
               <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs font-bold uppercase text-gray-500">Galeria de Imagens</label>
                 <button type="button" onClick={handleGalleryAdd} className="text-xs font-bold text-accent hover:text-black">+ Adicionar Imagem (Mock)</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="relative group">
                       <img src={img} className="w-full h-24 object-cover rounded" />
                       <button type="button" onClick={() => setFormData(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                         <span className="sr-only">Remover</span>
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                  ))}
                  {formData.images?.length === 0 && <span className="text-sm text-gray-400">Nenhuma imagem extra.</span>}
               </div>
             </div>

           </div>

           <div className="flex justify-end gap-4">
             <Link to="/admin" className="px-6 py-3 text-gray-500 hover:text-black">Cancelar</Link>
             <button type="submit" className="bg-black text-white px-8 py-3 rounded-full hover:bg-accent transition flex items-center space-x-2">
               <Save className="w-4 h-4" />
               <span>Salvar Projeto</span>
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};
