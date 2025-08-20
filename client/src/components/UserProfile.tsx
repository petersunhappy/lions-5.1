import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/queryClient';
import { User, Settings, Camera, Palette } from 'lucide-react';

// Form schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  position: z.string().optional(),
  profilePicture: z.string().optional(),
});

const athleteFormSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  sleepHours: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type AthleteFormData = z.infer<typeof athleteFormSchema>;

const colorThemes = [
  { id: 'lions', name: 'Lions Basketball (Amarelo)', primary: 'hsl(51, 100%, 50%)', secondary: 'hsl(0, 0%, 0%)' },
  { id: 'ocean', name: 'Oceano (Azul)', primary: 'hsl(210, 70%, 70%)', secondary: 'hsl(215, 25%, 27%)' },
  { id: 'sunset', name: 'Por do Sol (Vermelho)', primary: 'hsl(5, 85%, 75%)', secondary: 'hsl(15, 20%, 25%)' },
  { id: 'cherry', name: 'Cereja (Rosa)', primary: 'hsl(340, 75%, 80%)', secondary: 'hsl(330, 15%, 30%)' },
  { id: 'forest', name: 'Floresta (Verde)', primary: 'hsl(120, 60%, 70%)', secondary: 'hsl(140, 25%, 25%)' },
  { id: 'lavender', name: 'Lavanda (Roxo)', primary: 'hsl(270, 60%, 80%)', secondary: 'hsl(260, 20%, 25%)' },
];

/**
 * UserProfile Component
 * Features:
 * - Edit user profile information
 * - Athlete-specific settings (height, weight, sleep)
 * - Color theme selection
 * - Profile picture management
 */
export default function UserProfile() {
  const { currentUser, setCurrentUser } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'athlete' | 'theme'>('profile');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      position: currentUser?.position || '',
      profilePicture: currentUser?.profilePicture || '',
    },
  });

  const athleteForm = useForm<AthleteFormData>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      height: '',
      weight: '',
      sleepHours: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest('PATCH', `/api/users/${currentUser?.id}`, data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser);
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const updateAthleteMutation = useMutation({
    mutationFn: async (data: AthleteFormData) => {
      const response = await apiRequest('PATCH', `/api/athletes/user/${currentUser?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      toast({
        title: 'Dados do atleta atualizados!',
        description: 'Suas informações físicas foram salvas.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar dados',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive',
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onAthleteSubmit = (data: AthleteFormData) => {
    updateAthleteMutation.mutate(data);
  };

  const applyTheme = (theme: typeof colorThemes[0]) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    
    localStorage.setItem('selected-theme', theme.id);
    toast({
      title: 'Tema aplicado!',
      description: `Tema ${theme.name} foi aplicado com sucesso.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="user-profile">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Meu Perfil</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {/* Profile Avatar */}
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="w-20 h-20">
          <AvatarImage src={currentUser?.profilePicture || ''} alt={currentUser?.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {currentUser?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold" data-testid="text-user-name">
            {currentUser?.fullName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400" data-testid="text-user-role">
            {currentUser?.role === 'admin' ? 'Administrador' : 'Atleta'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className="flex-1"
          data-testid="tab-profile"
        >
          <User className="w-4 h-4 mr-2" />
          Perfil
        </Button>
        {currentUser?.role === 'athlete' && (
          <Button
            variant={activeTab === 'athlete' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('athlete')}
            className="flex-1"
            data-testid="tab-athlete"
          >
            <Settings className="w-4 h-4 mr-2" />
            Dados Físicos
          </Button>
        )}
        <Button
          variant={activeTab === 'theme' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('theme')}
          className="flex-1"
          data-testid="tab-theme"
        >
          <Palette className="w-4 h-4 mr-2" />
          Tema
        </Button>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-full-name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {currentUser?.role === 'athlete' && (
                  <FormField
                    control={profileForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição no Basquete</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-position">
                              <SelectValue placeholder="Selecione sua posição" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="armador">Armador (Point Guard)</SelectItem>
                            <SelectItem value="ala-armador">Ala-Armador (Shooting Guard)</SelectItem>
                            <SelectItem value="ala">Ala (Small Forward)</SelectItem>
                            <SelectItem value="ala-pivo">Ala-Pivô (Power Forward)</SelectItem>
                            <SelectItem value="pivo">Pivô (Center)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={profileForm.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto de Perfil</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-profile-picture" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="lions-btn-primary"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Athlete Settings */}
      {activeTab === 'athlete' && currentUser?.role === 'athlete' && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Físicos</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...athleteForm}>
              <form onSubmit={athleteForm.handleSubmit(onAthleteSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={athleteForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1.85m" data-testid="input-height" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={athleteForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="78kg" data-testid="input-weight" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={athleteForm.control}
                    name="sleepHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas de Sono</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="8h" data-testid="input-sleep" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="lions-btn-primary"
                  disabled={updateAthleteMutation.isPending}
                  data-testid="button-save-athlete"
                >
                  {updateAthleteMutation.isPending ? 'Salvando...' : 'Salvar Dados'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Theme Settings */}
      {activeTab === 'theme' && (
        <Card>
          <CardHeader>
            <CardTitle>Paletas de Cores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyTheme(theme)}
                  data-testid={`theme-${theme.id}`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: theme.secondary }}
                      ></div>
                    </div>
                    <span className="font-medium">{theme.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTheme(theme);
                    }}
                  >
                    Aplicar Tema
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}