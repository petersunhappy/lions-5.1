import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/queryClient';
import { GalleryItem } from '@shared/schema';
import { Upload, Image as ImageIcon, Video, Calendar, Filter, Plus, X, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gallery Component
 * Features:
 * - Upload and manage images/videos
 * - Album organization with filtering
 * - Responsive grid layout
 * - Image/video preview with overlay information
 * - Admin controls for media management
 */
export default function Gallery() {
  const { currentUser, isAdmin } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    album: 'general',
    mediaType: 'image' as 'image' | 'video',
    url: '',
  });

  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['/api/gallery'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadData) => {
      const response = await apiRequest('POST', '/api/gallery', {
        ...data,
        uploadedBy: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setIsUploadOpen(false);
      setUploadData({
        title: '',
        description: '',
        album: 'general',
        mediaType: 'image',
        url: '',
      });
      toast({
        title: 'Upload realizado com sucesso!',
        description: 'Mídia adicionada à galeria.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message || 'Erro ao fazer upload da mídia',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({
        title: 'Mídia removida',
        description: 'Item removido da galeria.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover',
        description: error.message || 'Erro ao remover mídia',
        variant: 'destructive',
      });
    },
  });

  // Get unique albums
  const albumSet = new Set(galleryItems.map(item => item.album || 'general'));
  const albums = ['all', ...Array.from(albumSet)];
  const albumLabels: Record<string, string> = {
    all: 'Todos',
    general: 'Geral',
    training: 'Treinos',
    games: 'Jogos',
    events: 'Eventos',
  };

  // Filter items by album
  const filteredItems = selectedAlbum === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => (item.album || 'general') === selectedAlbum);

  const handleUpload = () => {
    if (!uploadData.title || !uploadData.url) {
      toast({
        title: 'Dados incompletos',
        description: 'Título e URL são obrigatórios',
        variant: 'destructive',
      });
      return;
    }
    uploadMutation.mutate(uploadData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta mídia?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="gallery-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Galeria</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fotos e vídeos do time Lions
          </p>
        </div>
        
        {(isAdmin || currentUser) && (
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="lions-btn-primary" data-testid="button-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Mídia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Título</Label>
                  <Input
                    id="upload-title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Digite o título da mídia"
                    data-testid="input-upload-title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upload-description">Descrição</Label>
                  <Input
                    id="upload-description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Digite uma descrição (opcional)"
                    data-testid="input-upload-description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upload-url">URL da Mídia</Label>
                  <Input
                    id="upload-url"
                    value={uploadData.url}
                    onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-upload-url"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Mídia</Label>
                    <Select 
                      value={uploadData.mediaType} 
                      onValueChange={(value: 'image' | 'video') => setUploadData({ ...uploadData, mediaType: value })}
                    >
                      <SelectTrigger data-testid="select-upload-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Imagem</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Álbum</Label>
                    <Select 
                      value={uploadData.album} 
                      onValueChange={(value) => setUploadData({ ...uploadData, album: value })}
                    >
                      <SelectTrigger data-testid="select-upload-album">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="training">Treinos</SelectItem>
                        <SelectItem value="games">Jogos</SelectItem>
                        <SelectItem value="events">Eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full lions-btn-primary"
                  data-testid="button-confirm-upload"
                >
                  {uploadMutation.isPending ? 'Enviando...' : 'Adicionar Mídia'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Album filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {albums.map((album) => (
          <Button
            key={album}
            variant={selectedAlbum === album ? "default" : "secondary"}
            onClick={() => setSelectedAlbum(album)}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              selectedAlbum === album
                ? 'lions-btn-primary'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            data-testid={`filter-${album}`}
          >
            {albumLabels[album] || album}
          </Button>
        ))}
      </div>

      {/* Media grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma mídia encontrada</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {selectedAlbum === 'all' 
              ? 'Ainda não há mídias na galeria.'
              : `Não há mídias no álbum ${albumLabels[selectedAlbum] || selectedAlbum}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="gallery-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative overflow-hidden rounded-xl aspect-square"
              data-testid={`gallery-item-${item.id}`}
            >
              {item.mediaType === 'video' ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  <Play className="w-12 h-12 text-white" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                </div>
              ) : (
                <>
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwSDMwMFYyNTBIMjAwVjE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+SW1hZ2VtIG7Do28gZGlzcG9uw612ZWw8L3A+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </>
              )}
              
              {/* Overlay info */}
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium text-sm" data-testid="text-item-title">{item.title}</p>
                {item.uploadedAt && (
                  <p className="text-xs text-gray-300">
                    {format(new Date(item.uploadedAt), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                )}
              </div>
              
              {/* Delete button for admin */}
              {isAdmin && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 h-8 w-8"
                  onClick={() => handleDelete(item.id)}
                  data-testid={`button-delete-${item.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
