import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Bot, Send, X, MessageCircle, User, Zap } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

/**
 * AISupport Component
 * Features:
 * - Floating chat widget for AI assistance
 * - Context-aware responses based on user role
 * - Training tips and exercise explanations for athletes
 * - Performance analysis insights for admins
 * - Basketball-specific AI knowledge base
 * - Real-time chat interface
 */
export default function AISupport() {
  const { currentUser, isAdmin } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: isAdmin 
        ? 'Olá! Sou sua assistente de IA para análise de performance. Posso ajudar com insights sobre os atletas, estatísticas e recomendações de treino.'
        : 'Olá! Sou sua assistente de IA para treinos. Posso explicar exercícios, dar dicas de técnica e ajudar com seu desenvolvimento no basquete!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Predefined responses based on user role and common questions
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Admin-specific responses
    if (isAdmin) {
      if (message.includes('performance') || message.includes('desempenho')) {
        return 'Para analisar a performance dos atletas, recomendo observar: 1) Consistência nos treinos, 2) Evolução nas métricas específicas (arremessos, rebotes), 3) Participação em jogos. Posso gerar relatórios detalhados se você especificar um atleta.';
      }
      if (message.includes('treino') || message.includes('exercício')) {
        return 'Para otimizar os treinos: 1) Varie entre exercícios técnicos e físicos, 2) Personalize baseado na posição de cada atleta, 3) Monitore a progressão semanal. Que tipo de treino você gostaria de planejar?';
      }
      if (message.includes('atleta') || message.includes('jogador')) {
        return 'Posso ajudar com análises individuais dos atletas. Forneça o nome do atleta e posso dar insights sobre: performance recente, áreas de melhoria, comparações com médias do time.';
      }
    } else {
      // Athlete-specific responses
      if (message.includes('arremesso') || message.includes('lance livre')) {
        return 'Para melhorar seus arremessos: 1) Mantenha os pés alinhados com a cesta, 2) Flexione os joelhos e use as pernas, 3) Siga através com o punho. Pratique 50 lances livres por dia para ver melhoria em 2 semanas!';
      }
      if (message.includes('drible') || message.includes('controle de bola')) {
        return 'Dicas para drible: 1) Mantenha a cabeça erguida, 2) Use a ponta dos dedos, não a palma, 3) Pratique com as duas mãos. Exercício recomendado: drible estacionário por 2 minutos alternando as mãos.';
      }
      if (message.includes('rebote')) {
        return 'Técnica de rebote: 1) Antecipe onde a bola vai quicar, 2) Use o corpo para criar espaço, 3) Salte com as duas pernas. Lembre-se: posicionamento é mais importante que altura!';
      }
      if (message.includes('condicionamento') || message.includes('físico')) {
        return 'Para condicionamento no basquete: 1) Corridas intervaladas (30s intenso, 30s moderado), 2) Exercícios pliométricos para explosão, 3) Fortalecimento do core. Comece com 3x por semana.';
      }
      if (message.includes('defesa') || message.includes('marcação')) {
        return 'Fundamentos da defesa: 1) Posição baixa e equilibrada, 2) Pés ativos, sem cruzar as pernas, 3) Mãos ativas para deflexões. Pratique o shuffle defensivo diariamente!';
      }
    }
    
    // General responses
    if (message.includes('oi') || message.includes('olá') || message.includes('ajuda')) {
      return isAdmin
        ? 'Olá! Estou aqui para ajudar com análises de performance, planejamento de treinos e gestão dos atletas. O que você gostaria de saber?'
        : 'Oi! Posso te ajudar com técnicas de basquete, exercícios específicos, dicas de treino e desenvolvimento de habilidades. Qual é sua dúvida?';
    }
    
    if (message.includes('obrigado') || message.includes('valeu')) {
      return 'De nada! Estou sempre aqui para ajudar. Continue treinando duro! 🏀';
    }
    
    // Default response
    return isAdmin
      ? 'Posso ajudar com análises de performance, estatísticas dos atletas, planejamento de treinos e insights sobre o desenvolvimento do time. Seja mais específico sobre o que você precisa!'
      : 'Estou aqui para te ajudar a melhorar no basquete! Posso explicar técnicas, sugerir exercícios e dar dicas personalizadas. Que habilidade você quer desenvolver?';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="lions-btn-primary rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
            data-testid="button-open-ai-chat"
          >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]" data-testid="ai-chat-window">
          <Card className="lions-card shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center">
                  <div className="bg-primary rounded-full p-2 mr-3">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <span>Assistente IA</span>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs mr-2">
                        <Zap className="w-3 h-3 mr-1" />
                        {isAdmin ? 'Admin' : 'Atleta'}
                      </Badge>
                      <div className="flex items-center text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                  data-testid="button-close-ai-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-80 px-4">
                <div className="space-y-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.type}-${message.id}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          )}
                          {message.type === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-dark-bg rounded-lg px-3 py-2 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-primary" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input */}
              <div className="border-t border-gray-200 dark:border-dark-border p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isAdmin ? "Pergunte sobre análises ou treinos..." : "Pergunte sobre técnicas ou exercícios..."}
                    className="flex-1"
                    data-testid="input-ai-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="lions-btn-primary p-2"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {isAdmin ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue("Como analisar performance dos atletas?")}
                        className="text-xs"
                        data-testid="quick-suggestion-performance"
                      >
                        Análise de Performance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue("Sugestões de treinos para esta semana")}
                        className="text-xs"
                        data-testid="quick-suggestion-training"
                      >
                        Planejar Treinos
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue("Como melhorar meus arremessos?")}
                        className="text-xs"
                        data-testid="quick-suggestion-shooting"
                      >
                        Arremessos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue("Exercícios para condicionamento físico")}
                        className="text-xs"
                        data-testid="quick-suggestion-conditioning"
                      >
                        Condicionamento
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
