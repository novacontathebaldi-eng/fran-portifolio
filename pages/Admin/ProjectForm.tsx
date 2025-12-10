import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { Project, ContentBlock } from '../../types';
import { ArrowLeft, Save, Upload, Type, Image as ImageIcon, LayoutGrid, Quote, Trash2, ArrowUp, ArrowDown, GripVertical, Plus, Heading } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { ImageCropModal, useImageCropModal } from '../../components/ImageCropModal';
import { optimizeImage } from '../../utils/imageOptimizer';

// Real Supabase Upload
const uploadToSupabase = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('storage-Fran')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('storage-Fran')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const ProjectForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, addProject, updateProject, showToast } = useProjects();

  const isEditing = Boolean(id);
  const existingProject = projects.find(p => p.id === id);
  const [uploading, setUploading] = useState(false);

  // Crop Modal States
  const coverCropModal = useImageCropModal();
  const [blockCropModalOpen, setBlockCropModalOpen] = useState(false);
  const [blockCropImage, setBlockCropImage] = useState('');
  const [blockCropFile, setBlockCropFile] = useState<File | null>(null);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [pendingGridIndex, setPendingGridIndex] = useState<number | null>(null);

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

  // MIGRATION & INIT LOGIC
  useEffect(() => {
    if (isEditing && existingProject) {
      let initialBlocks = existingProject.blocks ? [...existingProject.blocks] : [];

      // MIGRATION: If legacy project has no blocks but has description/images, 
      // populate the editor so the user sees something.
      if (initialBlocks.length === 0) {
        if (existingProject.description) {
          initialBlocks.push({ id: 'legacy-desc', type: 'text', content: existingProject.description });
        }
        if (existingProject.images && existingProject.images.length > 0) {
          existingProject.images.forEach((img, idx) => {
            initialBlocks.push({ id: `legacy-img-${idx}`, type: 'image-full', content: img, caption: `Imagem ${idx + 1}` });
          });
        }
      }

      setFormData({
        ...existingProject,
        blocks: initialBlocks
      });
    }
  }, [isEditing, existingProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload for Main Cover - Opens crop modal
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    coverCropModal.openCropModal(e.target.files[0]);
    e.target.value = '';
  };

  // Handle cropped cover image upload
  const handleCroppedCoverUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToSupabase(file);
      setFormData(prev => ({ ...prev, image: url }));
      showToast('Capa atualizada e otimizada!', 'success');
    } catch (err) {
      showToast('Erro ao fazer upload da capa.', 'error');
      console.error(err);
    } finally {
      setUploading(false);
    }
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

  // Block Image Upload - Opens crop modal
  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    setBlockCropImage(dataUrl);
    setBlockCropFile(file);
    setPendingBlockId(blockId);
    setPendingGridIndex(null);
    setBlockCropModalOpen(true);
    e.target.value = '';
  };

  // Handle cropped block image
  const handleCroppedBlockImage = async (file: File) => {
    try {
      const url = await uploadToSupabase(file);
      if (pendingBlockId && pendingGridIndex === null) {
        updateBlock(pendingBlockId, 'content', url);
      } else if (pendingBlockId && pendingGridIndex !== null) {
        updateGridItem(pendingBlockId, pendingGridIndex, url);
      }
      showToast('Imagem otimizada e enviada!', 'success');
    } catch (err) {
      showToast('Erro ao enviar imagem', 'error');
    }
    setBlockCropModalOpen(false);
    setPendingBlockId(null);
    setPendingGridIndex(null);
  };

  const handleGridImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    setBlockCropImage(dataUrl);
    setBlockCropFile(file);
    setPendingBlockId(blockId);
    setPendingGridIndex(index);
    setBlockCropModalOpen(true);
    e.target.value = '';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert("Por favor preencha título e imagem de capa.");
      return;
    }

    // Build the gallery array from blocks automatically (Syncing blocks -> images array for portfolio grid)
    const autoGallery: string[] = [];
    formData.blocks?.forEach(b => {
      if (b.type === 'image-full' && b.content) autoGallery.push(b.content);
      if (b.type === 'image-grid' && b.items) b.items.forEach(i => { if (i) autoGallery.push(i) });
    });

    const projectData = {
      ...formData,
      // Ensure we save the blocks. If user deleted all blocks, save empty array.
      blocks: formData.blocks || [],
      // Sync legacy properties
      images: autoGallery,
      description: formData.blocks?.find(b => b.type === 'text')?.content || formData.description || ''
    };

    if (isEditing && id) {
      updateProject({ ...projectData, id } as Project);
      showToast('Projeto atualizado com sucesso!', 'success');
    } else {
      // ID will be generated by Supabase or we pass one. Supabase handles UUIDs usually.
      // But keeping local logic consistency, we can generate or let DB handle it.
      // Context logic handles insertion.
      addProject({ ...projectData } as Project);
      showToast('Novo projeto criado!', 'success');
    }
    navigate('/admin?tab=projects');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </button>
          <h1 className="text-3xl font-serif font-bold text-black">{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold mb-4 text-black border-b border-gray-100 pb-2">Informações Básicas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Título do Projeto</label>
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded text-sm bg-white text-black focus:outline-none focus:border-black transition" placeholder="Ex: Casa do Lago" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Categoria</label>
                  <input
                    list="categories-list"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded text-sm bg-white text-black focus:outline-none focus:border-black transition"
                    placeholder="Selecione ou digite..."
                  />
                  <datalist id="categories-list">
                    {Array.from(new Set(projects.map(p => p.category).filter(Boolean))).sort().map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ano</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded text-sm bg-white text-black focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Área (m²)</label>
                    <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded text-sm bg-white text-black focus:outline-none focus:border-black transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Localização</label>
                  <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded text-sm bg-white text-black focus:outline-none focus:border-black transition" placeholder="Cidade, UF" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold mb-4 text-black border-b border-gray-100 pb-2">Capa do Projeto</h3>

              <div className="mb-4">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition relative overflow-hidden group">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white font-bold text-sm">Trocar Imagem</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      {uploading ? <span className="animate-pulse">Enviando...</span> : <ImageIcon className="w-8 h-8 mx-auto mb-2" />}
                      <span className="text-sm">{uploading ? '' : 'Clique para upload'}</span>
                    </div>
                  )}
                  <input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" disabled={uploading} />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ou cole uma URL</label>
                <input name="image" value={formData.image} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-black" placeholder="https://..." />
              </div>
            </div>

            <div className="sticky top-6">
              <button type="submit" className="w-full bg-black text-white px-8 py-4 rounded-xl hover:bg-accent hover:text-black transition flex items-center justify-center space-x-2 shadow-xl transform active:scale-95 duration-200">
                <Save className="w-5 h-5" />
                <span className="font-bold">Salvar e Publicar</span>
              </button>
            </div>
          </div>

          {/* Right: Block Builder */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-black">Narrativa do Projeto</h2>
                  <p className="text-sm text-gray-500">Construa a apresentação visual adicionando blocos.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => addBlock('heading')} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-sm font-medium text-gray-700" title="Título"><Heading className="w-4 h-4" /> Título</button>
                  <button type="button" onClick={() => addBlock('text')} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-sm font-medium text-gray-700" title="Texto"><Type className="w-4 h-4" /> Texto</button>
                  <button type="button" onClick={() => addBlock('image-full')} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-sm font-medium text-gray-700" title="Imagem Cheia"><ImageIcon className="w-4 h-4" /> Imagem</button>
                  <button type="button" onClick={() => addBlock('image-grid')} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-sm font-medium text-gray-700" title="Grid"><LayoutGrid className="w-4 h-4" /> Grid</button>
                  <button type="button" onClick={() => addBlock('quote')} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition text-sm font-medium text-gray-700" title="Citação"><Quote className="w-4 h-4" /> Destaque</button>
                </div>
              </div>

              <div className="space-y-6">
                {(!formData.blocks || formData.blocks.length === 0) && (
                  <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center">
                    <Plus className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">O projeto está vazio.</p>
                    <p className="text-sm">Adicione blocos acima para começar.</p>
                  </div>
                )}

                {formData.blocks?.map((block, idx) => (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={block.id} className="relative group border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-shadow duration-300">

                    {/* Header of Block */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical className="w-4 h-4 cursor-move" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {block.type === 'heading' && 'Título de Seção'}
                          {block.type === 'text' && 'Parágrafo'}
                          {block.type === 'image-full' && 'Imagem Expandida'}
                          {block.type === 'image-grid' && 'Grid Duplo'}
                          {block.type === 'quote' && 'Citação'}
                        </span>
                      </div>
                      <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                        <button type="button" onClick={() => moveBlock(idx, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveBlock(idx, 'down')} disabled={idx === (formData.blocks?.length || 0) - 1} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded ml-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Render based on Type */}
                    {block.type === 'heading' && (
                      <div>
                        <input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                          className="w-full bg-white border-b-2 border-gray-100 py-3 text-2xl font-serif font-bold text-gray-900 focus:outline-none focus:border-black transition placeholder-gray-300"
                          placeholder="Digite o título da seção..."
                        />
                      </div>
                    )}

                    {block.type === 'text' && (
                      <div>
                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 leading-relaxed min-h-[120px] focus:outline-none focus:border-black transition focus:bg-white"
                          placeholder="Escreva o conteúdo do parágrafo aqui..."
                        />
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="pl-6 border-l-4 border-accent">
                        <input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl font-serif italic text-gray-900 placeholder-gray-300"
                          placeholder="Digite a frase de destaque..."
                        />
                      </div>
                    )}

                    {block.type === 'image-full' && (
                      <div className="space-y-3">
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group/img">
                          {block.content ? (
                            <>
                              <img src={block.content} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs hover:scale-105 transition">
                                  Trocar Imagem
                                  <input type="file" className="hidden" onChange={(e) => handleBlockImageUpload(e, block.id)} accept="image/*" />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-200 transition">
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500 font-medium">Clique para enviar imagem</span>
                              <input type="file" className="hidden" onChange={(e) => handleBlockImageUpload(e, block.id)} accept="image/*" />
                            </label>
                          )}
                        </div>
                        <input
                          value={block.caption || ''}
                          onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                          className="w-full border-b border-gray-200 py-2 text-sm text-gray-600 bg-transparent focus:outline-none focus:border-black text-center"
                          placeholder="Legenda da imagem (opcional)"
                        />
                      </div>
                    )}

                    {block.type === 'image-grid' && (
                      <div className="grid grid-cols-2 gap-4">
                        {block.items?.map((item, i) => (
                          <div key={i} className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group/img">
                            {item ? (
                              <>
                                <img src={item} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                  <label className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-full font-bold text-[10px] hover:scale-105 transition">
                                    Alterar
                                    <input type="file" className="hidden" onChange={(e) => handleGridImageUpload(e, block.id, i)} accept="image/*" />
                                  </label>
                                </div>
                              </>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-200 transition">
                                <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Adicionar</span>
                                <input type="file" className="hidden" onChange={(e) => handleGridImageUpload(e, block.id, i)} accept="image/*" />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Cover Crop Modal */}
        <ImageCropModal
          image={coverCropModal.imageSource}
          originalFile={coverCropModal.selectedFile || undefined}
          isOpen={coverCropModal.isOpen}
          onClose={coverCropModal.closeCropModal}
          onCropComplete={handleCroppedCoverUpload}
          aspect={16 / 9}
          preset="projectHero"
          requireCrop={false}
          showAspectSelector={true}
          title="Ajustar Capa do Projeto"
        />

        {/* Block/Grid Crop Modal */}
        <ImageCropModal
          image={blockCropImage}
          originalFile={blockCropFile || undefined}
          isOpen={blockCropModalOpen}
          onClose={() => {
            setBlockCropModalOpen(false);
            setPendingBlockId(null);
            setPendingGridIndex(null);
          }}
          onCropComplete={handleCroppedBlockImage}
          aspect={null}
          preset="projectGallery"
          requireCrop={false}
          showAspectSelector={true}
          title="Ajustar Imagem"
        />
      </div>
    </div>
  );
};