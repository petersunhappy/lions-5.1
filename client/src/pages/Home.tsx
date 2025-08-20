import React from 'react';
import { Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BestOfWeek from '@/components/BestOfWeek';
import { TrendingUp, Users, Calendar, Trophy, Target, Activity } from 'lucide-react';

/**
 * Home Page Component
 * Features:
 * - Welcome hero section with team branding
 * - Quick navigation to main features
 * - Role-based content display
 * - Team statistics overview
 * - Call-to-action buttons
 */
export default function Home() {
  const { currentUser, isAdmin } = useApp();

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Acompanhe seu progresso e estatísticas',
      href: '/dashboard',
      icon: TrendingUp,
      color: 'bg-blue-500',
      admin: false,
    },
    {
      title: 'Treinos',
      description: 'Acesse exercícios e registre seu desempenho',
      href: '/training',
      icon: Activity,
      color: 'bg-green-500',
      admin: false,
    },
    {
      title: 'Galeria',
      description: 'Veja fotos e vídeos do time',
      href: '/gallery',
      icon: Target,
      color: 'bg-purple-500',
      admin: false,
    },
    {
      title: 'Administração',
      description: 'Gerencie atletas e eventos',
      href: '/admin',
      icon: Users,
      color: 'bg-red-500',
      admin: true,
    },
  ];

  const filteredActions = quickActions.filter(action => !action.admin || isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg" data-testid="home-page">
      {/* Hero Section */}
      <div className="lions-gradient text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-secondary rounded-full p-6">
                <Target className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Lions Basquete
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Sistema completo de gerenciamento para atletas e administradores do time Lions
            </p>
            
            {currentUser && (
              <div className="mb-8">
                <p className="text-lg opacity-80 mb-4">
                  Bem-vindo de volta, <span className="font-semibold" data-testid="text-welcome-user">{currentUser.fullName}</span>!
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/dashboard">
                    <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 text-lg" data-testid="button-go-dashboard">
                      Ir para Dashboard
                    </Button>
                  </Link>
                  <Link href="/training">
                    <Button variant="outline" className="border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground px-8 py-3 text-lg" data-testid="button-go-training">
                      Ver Treinos
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Acesso Rápido</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Navegue pelas principais funcionalidades do sistema de gerenciamento do Lions Basquete
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="lions-card hover:shadow-lg transition-all duration-300 cursor-pointer group" data-testid={`action-card-${action.title.toLowerCase()}`}>
                <CardContent className="p-8 text-center">
                  <div className={`${action.color} rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" data-testid="text-action-title">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Best of the Week Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Destaque da Semana</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Conheça o atleta que se destacou esta semana
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <BestOfWeek />
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="lions-card text-center" data-testid="card-team-spirit">
            <CardContent className="p-8">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Excelência</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Compromisso com a melhoria contínua e performance de alto nível
              </p>
            </CardContent>
          </Card>

          <Card className="lions-card text-center" data-testid="card-team-unity">
            <CardContent className="p-8">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">União</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trabalho em equipe e apoio mútuo para alcançar objetivos comuns
              </p>
            </CardContent>
          </Card>

          <Card className="lions-card text-center" data-testid="card-team-dedication">
            <CardContent className="p-8">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Dedicação</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Foco nos treinos e determinação para superar desafios
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-primary rounded-full p-3 mr-3">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold">Lions Basquete</h3>
          </div>
          <p className="text-lg opacity-80 mb-4">
            Sistema de gerenciamento de treinos e performance
          </p>
          <p className="opacity-60">
            © 2024 Lions Basquete Team. Desenvolvido com dedicação para nossa equipe.
          </p>
        </div>
      </footer>
    </div>
  );
}
