import { useState, useEffect } from 'react';

export function useBibliotecaData({ showToast }) {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState(['Todas', 'Geral', 'Pessoas', 'Cenários', 'Estilo', 'Produtos']);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSource, setSelectedSource] = useState('Todos');
  const [selectedModel, setSelectedModel] = useState('Todos');
  const [availableModels, setAvailableModels] = useState(['Todos']);
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Paginação inteligente
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Referências de Entrada para IA (Limite Máximo: 5 imagens)
  const [selectedReferences, setSelectedReferences] = useState([]);
  const [selectedForBatch, setSelectedForBatch] = useState([]);

  const loadLibrary = async (
    category = selectedCategory,
    search = searchQuery,
    sort = sortOrder,
    source = selectedSource,
    model = selectedModel
  ) => {
    try {
      const token = localStorage.getItem('fo_token');
      const params = new URLSearchParams();
      if (category && category !== 'Todas') params.append('category', category);
      if (source && source !== 'Todos') params.append('source', source);
      if (model && model !== 'Todos') params.append('model', model);
      if (search && search.trim()) params.append('search', search.trim());
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/library?${params.toString()}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok) {
        setImages(data.images || []);
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      }
    } catch {
      if (showToast) showToast('Erro ao carregar biblioteca.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleToggleSelect = (image, openAssistant) => {
    setSelectedReferences(prev => {
      const exists = prev.some(r => r.id === image.id);
      if (exists) {
        return prev.filter(r => r.id !== image.id);
      }
      if (prev.length >= 5) {
        if (showToast) showToast('Você pode selecionar no máximo 5 imagens como referência de entrada.');
        return prev;
      }
      return [...prev, image];
    });
    if (openAssistant) openAssistant();
  };

  const handleAddReference = (image, openAssistant) => {
    setSelectedReferences(prev => {
      if (prev.some(r => r.id === image.id)) return prev;
      if (prev.length >= 5) {
        if (showToast) showToast('Você pode selecionar no máximo 5 imagens como referência de entrada.');
        return prev;
      }
      return [...prev, image];
    });
    if (openAssistant) openAssistant();
  };

  const handleRemoveReference = (id) => {
    setSelectedReferences(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleBatchSelect = (id) => {
    setSelectedForBatch(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAllBatch = () => {
    if (selectedForBatch.length === images.length) {
      setSelectedForBatch([]);
    } else {
      setSelectedForBatch(images.map(img => img.id));
    }
  };

  return {
    images,
    setImages,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedSource,
    setSelectedSource,
    selectedModel,
    setSelectedModel,
    availableModels,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    loading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    selectedReferences,
    setSelectedReferences,
    selectedForBatch,
    setSelectedForBatch,
    loadLibrary,
    handleToggleSelect,
    handleAddReference,
    handleRemoveReference,
    handleToggleBatchSelect,
    handleSelectAllBatch
  };
}
