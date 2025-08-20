import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/queryClient';
import { Play, Users, Calendar, Clock, Tv, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LiveStreamData {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  isActive: boolean;
  scheduledFor?: string;
  category: string;
}

/**
 * LiveStream Component
 * Features:
 * - Display active and scheduled live streams
 * - YouTube integration for NBB/NBA games
 * - Stream status indicators (live, scheduled)
 * - Admin controls for stream management
 * - Real-time viewer count (simulated)
 * - Category filtering (NBB vs NBA)
 */
export default function LiveStream() {
  const { isAdmin } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: liveStreams = [], isLoading } = useQuery<LiveStreamData[]>({
    queryKey: ['/api/live-streams'],
  });

  const toggleStreamMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/live-streams/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-streams'] });
      toast({
        title: 'Stream atualizada',
        description: 'Status da transmissão foi alterado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar stream',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const handleToggleStream = (id: string, currentStatus: boolean) => {
    toggleStreamMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleWatchStream = (youtubeUrl: string) => {
    window.open(youtubeUrl, '_blank');
  };

  const getStreamStatusBadge = (stream: LiveStreamData) => {
    if (stream.isActive) {
      return (
        <Badge className="bg-red-600 text-white flex items-center animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
          AO VIVO
        </Badge>
      );
    }
    
    if (stream.scheduledFor) {
      const scheduledDate = new Date(stream.scheduledFor);
      const now = new Date();
      
      if (scheduledDate > now) {
        return (
          <Badge className="bg-blue-600 text-white">
            EM BREVE
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="secondary">
        FINALIZADA
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'nbb': return 'NBB';
      case 'nba': return 'NBA';
      default: return 'Geral';
    }
  };

  const filteredStreams = selectedCategory === 'all' 
    ? liveStreams 
    : liveStreams.filter(stream => stream.category === selectedCategory);

  // Separate active and scheduled streams
  const activeStreams = filteredStreams.filter(stream => stream.isActive);
  const scheduledStreams = filteredStreams.filter(stream => !stream.isActive && stream.scheduledFor);
  const pastStreams = filteredStreams.filter(stream => !stream.isActive && !stream.scheduledFor);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lions-card animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="live-streams-page">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Transmissões Ao Vivo</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Assista aos jogos da NBB e NBA
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {['all', 'nbb', 'nba'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category
                ? 'lions-btn-primary'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            data-testid={`filter-${category}`}
          >
            {category === 'all' ? 'Todos' : getCategoryLabel(category)}
          </Button>
        ))}
      </div>

      {/* No streams message */}
      {filteredStreams.length === 0 && (
        <div className="text-center py-16">
          <Tv className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma transmissão encontrada</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há transmissões disponíveis no momento.
          </p>
        </div>
      )}

      {/* Active Streams */}
      {activeStreams.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Radio className="w-6 h-6 mr-2 text-red-600" />
            Ao Vivo Agora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeStreams.map((stream) => (
              <Card key={stream.id} className="lions-card overflow-hidden" data-testid={`active-stream-${stream.id}`}>
                <div className="aspect-video bg-gray-900 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    {getStreamStatusBadge(stream)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={() => handleWatchStream(stream.youtubeUrl)}
                      className="bg-black/50 rounded-full p-6 hover:bg-black/70 transition-colors"
                      data-testid={`button-watch-${stream.id}`}
                    >
                      <Play className="w-8 h-8 text-white" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2" data-testid="text-stream-title">
                    {stream.title}
                  </h4>
                  {stream.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {stream.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      <span data-testid="text-viewer-count">
                        {Math.floor(Math.random() * 5000) + 500} assistindo
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getCategoryLabel(stream.category)}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStream(stream.id, stream.isActive)}
                          disabled={toggleStreamMutation.isPending}
                          data-testid={`button-toggle-${stream.id}`}
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Streams */}
      {scheduledStreams.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Próximas Transmissões
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scheduledStreams.map((stream) => (
              <Card key={stream.id} className="lions-card overflow-hidden" data-testid={`scheduled-stream-${stream.id}`}>
                <div className="aspect-video bg-gray-100 dark:bg-dark-bg relative">
                  <div className="absolute top-4 left-4">
                    {getStreamStatusBadge(stream)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-4" />
                      {stream.scheduledFor && (
                        <p className="text-lg font-medium">
                          Inicia às {format(new Date(stream.scheduledFor), 'HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-2">
                    {stream.title}
                  </h4>
                  {stream.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {stream.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {stream.scheduledFor && (
                        <span>
                          {format(new Date(stream.scheduledFor), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getCategoryLabel(stream.category)}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStream(stream.id, stream.isActive)}
                          disabled={toggleStreamMutation.isPending}
                        >
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Streams */}
      {pastStreams.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Tv className="w-6 h-6 mr-2 text-gray-600" />
            Transmissões Anteriores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastStreams.map((stream) => (
              <Card key={stream.id} className="lions-card overflow-hidden" data-testid={`past-stream-${stream.id}`}>
                <div className="aspect-video bg-gray-100 dark:bg-dark-bg relative">
                  <div className="absolute top-4 left-4">
                    {getStreamStatusBadge(stream)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={() => handleWatchStream(stream.youtubeUrl)}
                      className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
                    >
                      <Play className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-2">
                    {stream.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(stream.category)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
