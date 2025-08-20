import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/queryClient';
import ExerciseCard from './ExerciseCard';
import { Exercise, insertExerciseSchema } from '@shared/schema';
import { Filter, Plus } from 'lucide-react';

// Form schema for new exercise
const exerciseFormSchema = insertExerciseSchema.extend({
  metrics: z.object({
    repetitions: z.number().optional(),
    duration: z.number().optional(), 
    distance: z.number().optional(),
    accuracy: z.number().optional(),
    difficulty: z.string().optional(),
  }).optional(),
});

type ExerciseFormData = z.infer<typeof exerciseFormSchema>;

/**
 * Training Component
 * Features:
 * - Lists training exercises with filtering by category
 * - Add new exercise functionality with form dialog
 * - Customizable exercises with different metrics
 * - Exercise cards with video support
 * - Performance tracking integration
 * - Responsive grid layout
 */
export default function Training() {
  const { currentUser, isAdmin } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'basketball',
      videoUrl: '',
      createdBy: currentUser?.id || '',
      metrics: {
        repetitions: undefined,
        duration: undefined,
        distance: undefined,
        accuracy: undefined,
        difficulty: '',
      },
    },
  });

  const addExerciseMutation = useMutation({
    mutationFn: async (data: ExerciseFormData) => {
      const response = await apiRequest('POST', '/api/exercises', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'Exercício adicionado!',
        description: 'Novo exercício criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar exercício',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ExerciseFormData) => {
    addExerciseMutation.mutate(data);
  };

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'basketball', label: 'Basquete' },
    { key: 'aerobic', label: 'Aeróbico' },
    { key: 'strength', label: 'Físico' },
  ];

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(exercise => exercise.category === selectedCategory);

  const handleStartTraining = (exerciseId: string) => {
    // TODO: Implement training session start logic
    console.log('Starting training for exercise:', exerciseId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="lions-card p-6 animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="training-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Treinos e Exercícios</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seus treinos e acompanhe seu progresso
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="lions-btn-primary" data-testid="button-add-exercise">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Exercício</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Exercício</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Arremesso de 3 pontos" {...field} data-testid="input-exercise-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-exercise-category">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basketball">Basquete</SelectItem>
                              <SelectItem value="aerobic">Aeróbico</SelectItem>
                              <SelectItem value="strength">Físico</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do exercício..."
                            {...field}
                            data-testid="textarea-exercise-description"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                            data-testid="input-exercise-video"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-base font-semibold">Métricas do Exercício</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name="metrics.repetitions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repetições</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ex: 20"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-exercise-repetitions"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metrics.duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ex: 15"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-exercise-duration"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metrics.distance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distância (m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ex: 100"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-exercise-distance"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metrics.difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dificuldade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-exercise-difficulty">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="iniciante">Iniciante</SelectItem>
                                <SelectItem value="intermediario">Intermediário</SelectItem>
                                <SelectItem value="avancado">Avançado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-exercise"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="lions-btn-primary"
                      disabled={addExerciseMutation.isPending}
                      data-testid="button-save-exercise"
                    >
                      {addExerciseMutation.isPending ? 'Salvando...' : 'Salvar Exercício'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "secondary"}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category.key
                ? 'lions-btn-primary'
                : 'bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            data-testid={`filter-${category.key}`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Exercises grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Nenhum exercício encontrado</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {selectedCategory === 'all' 
              ? 'Ainda não há exercícios cadastrados no sistema.'
              : `Não há exercícios na categoria ${categories.find(c => c.key === selectedCategory)?.label}.`
            }
          </p>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="lions-btn-primary" data-testid="button-add-first-exercise">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Exercício
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="exercises-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStartTraining={handleStartTraining}
            />
          ))}
        </div>
      )}
    </div>
  );
}
