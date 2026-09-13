import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Link as LinkIcon,
  ShoppingCart,
  MessageCircle,
  MessageSquare,
  Code,
  Star,
  Heart,
  Camera,
  Music,
  BookOpen,
  Send,
  Mail,
  MapPin,
  Globe,
  Phone,
  PhoneCall,
  Ticket,
  Video,
  Flame,
  Award,
  Zap,
  Coffee,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarCheck2,
  CalendarClock,
  CalendarHeart,
  CalendarPlus,
  CalendarRange,
  CalendarX,
  CalendarSync,
  Layers,
  CheckCircle2,
  ExternalLink,
  Search,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Twitter,
  Twitch,
  Headphones,
  ShoppingBag,
  Gift,
  Compass,
  FileText,
  HelpCircle,
  Utensils,
  Share2,
  DollarSign,
  BadgeDollarSign,
  CreditCard,
  QrCode,
  Wifi,
  Clock,
  AlarmClock,
  AlarmClockCheck,
  Timer,
  Hourglass,
  History,
  ListTodo,
  ClipboardList,
  ClipboardCheck,
  User,
  Users,
  Briefcase,
  Folder,
  File,
  Download,
  Bookmark,
  Bell,
  Check,
  Play,
  Tv,
  Radio,
  Podcast,
  Smartphone,
  Laptop,
  Palette,
  Eye,
  Smile,
  ThumbsUp,
  Tag,
  Shield,
  Lock,
  Crown,
  Sparkle,
  GraduationCap,
  Stethoscope,
  PartyPopper,
  Navigation,
  Wallet,
  X,
} from 'lucide-react';
import {
  WhatsAppBrandIcon,
  FacebookBrandIcon,
  TikTokBrandIcon,
  TelegramBrandIcon,
  PinterestBrandIcon,
  SnapchatBrandIcon,
  ThreadsBrandIcon,
  SpotifyBrandIcon,
  KwaiBrandIcon,
} from './BrandIcons';

export type IconCategory = 'all' | 'agenda' | 'social' | 'business' | 'media' | 'general';

export interface IconItemDef {
  name: string;
  labelPt: string;
  category: IconCategory;
  component: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  keywords: string[];
}

export const ICON_DEFINITIONS: IconItemDef[] = [
  // === AGENDA, HORÁRIOS & COMPROMISSOS ===
  {
    name: 'Calendar',
    labelPt: 'Calendário Padrão',
    category: 'agenda',
    component: Calendar,
    keywords: ['agenda', 'calendario', 'data', 'agendamento', 'marcar', 'horario', 'evento', 'mes', 'dia'],
  },
  {
    name: 'CalendarDays',
    labelPt: 'Dias da Agenda',
    category: 'agenda',
    component: CalendarDays,
    keywords: ['agenda', 'dias', 'semana', 'calendario', 'planejamento', 'cronograma', 'datas', 'grade'],
  },
  {
    name: 'CalendarCheck',
    labelPt: 'Horário Confirmado',
    category: 'agenda',
    component: CalendarCheck,
    keywords: ['agenda', 'confirmado', 'check', 'agendado', 'consulta', 'horario', 'marcado', 'sucesso'],
  },
  {
    name: 'CalendarCheck2',
    labelPt: 'Agendamento Marcado',
    category: 'agenda',
    component: CalendarCheck2,
    keywords: ['agenda', 'marcado', 'aprovado', 'consulta', 'sessao', 'calendario', 'concluido'],
  },
  {
    name: 'CalendarClock',
    labelPt: 'Horário & Hora Marcada',
    category: 'agenda',
    component: CalendarClock,
    keywords: ['agenda', 'horario', 'hora', 'tempo', 'relogio', 'agendamento', 'sessao', 'consulta', 'marcar', 'duracao'],
  },
  {
    name: 'CalendarPlus',
    labelPt: 'Novo Agendamento (+)',
    category: 'agenda',
    component: CalendarPlus,
    keywords: ['agenda', 'novo', 'adicionar', 'marcar', 'reservar', 'vagas', 'abrir', 'inscricao'],
  },
  {
    name: 'CalendarHeart',
    labelPt: 'Data Especial / Favorita',
    category: 'agenda',
    component: CalendarHeart,
    keywords: ['agenda', 'especial', 'favorito', 'casamento', 'aniversario', 'evento', 'amor', 'saude'],
  },
  {
    name: 'CalendarRange',
    labelPt: 'Período / Temporada',
    category: 'agenda',
    component: CalendarRange,
    keywords: ['agenda', 'periodo', 'intervalo', 'semanal', 'mensal', 'temporada', 'ciclo'],
  },
  {
    name: 'CalendarSync',
    labelPt: 'Sincronizar Agenda',
    category: 'agenda',
    component: CalendarSync,
    keywords: ['agenda', 'sincronizar', 'google calendar', 'atualizar', 'recorrente', 'rotina'],
  },
  {
    name: 'CalendarX',
    labelPt: 'Data Indisponível / Fechado',
    category: 'agenda',
    component: CalendarX,
    keywords: ['agenda', 'fechado', 'esgotado', 'cancelado', 'indisponivel', 'feriado'],
  },
  {
    name: 'Clock',
    labelPt: 'Relógio / Horário',
    category: 'agenda',
    component: Clock,
    keywords: ['relogio', 'hora', 'horario', 'tempo', 'atendimento', 'minutos', 'duracao', 'funcionamento'],
  },
  {
    name: 'AlarmClock',
    labelPt: 'Alarme / Despertador',
    category: 'agenda',
    component: AlarmClock,
    keywords: ['alarme', 'lembrete', 'aviso', 'hora', 'despertador', 'acordar', 'prazo'],
  },
  {
    name: 'AlarmClockCheck',
    labelPt: 'Lembrete Concluído',
    category: 'agenda',
    component: AlarmClockCheck,
    keywords: ['alarme', 'confirmado', 'concluido', 'lembrete', 'pronto', 'horario'],
  },
  {
    name: 'Timer',
    labelPt: 'Cronômetro / Temporizador',
    category: 'agenda',
    component: Timer,
    keywords: ['cronometro', 'temporizador', 'contagem', 'regressiva', 'tempo', 'urgencia', 'minutos'],
  },
  {
    name: 'Hourglass',
    labelPt: 'Ampulheta / Faltam Poucos',
    category: 'agenda',
    component: Hourglass,
    keywords: ['ampulheta', 'tempo', 'espera', 'urgencia', 'prazo', 'contagem', 'faltam'],
  },
  {
    name: 'History',
    labelPt: 'Histórico / Histórico de Sessões',
    category: 'agenda',
    component: History,
    keywords: ['historico', 'passado', 'tempo', 'relogio', 'registro', 'sessoes'],
  },
  {
    name: 'ClipboardList',
    labelPt: 'Prancheta de Horários / Lista',
    category: 'agenda',
    component: ClipboardList,
    keywords: ['prancheta', 'lista', 'tarefas', 'agenda', 'consultas', 'horarios', 'procedimentos'],
  },
  {
    name: 'ClipboardCheck',
    labelPt: 'Prancheta / Check de Consulta',
    category: 'agenda',
    component: ClipboardCheck,
    keywords: ['prancheta', 'confirmado', 'check', 'pronto', 'atendimento', 'concluido'],
  },
  {
    name: 'ListTodo',
    labelPt: 'Lista de Afazeres / Tarefas',
    category: 'agenda',
    component: ListTodo,
    keywords: ['tarefas', 'todo', 'lista', 'afazeres', 'rotina', 'agenda', 'etapas'],
  },

  // === REDES SOCIAIS & CONTATO ===
  {
    name: 'WhatsApp',
    labelPt: 'WhatsApp Oficial',
    category: 'social',
    component: WhatsAppBrandIcon,
    keywords: ['whatsapp', 'whats', 'zap', 'zapzap', 'conversa', 'mensagem', 'atendimento', 'contato'],
  },
  {
    name: 'Instagram',
    labelPt: 'Instagram',
    category: 'social',
    component: Instagram,
    keywords: ['instagram', 'insta', 'ig', 'fotos', 'reels', 'stories', 'perfil'],
  },
  {
    name: 'Facebook',
    labelPt: 'Facebook',
    category: 'social',
    component: FacebookBrandIcon,
    keywords: ['facebook', 'face', 'fb', 'pagina', 'meta'],
  },
  {
    name: 'YouTube',
    labelPt: 'YouTube',
    category: 'social',
    component: Youtube,
    keywords: ['youtube', 'yt', 'video', 'canal', 'inscricao'],
  },
  {
    name: 'TikTok',
    labelPt: 'TikTok',
    category: 'social',
    component: TikTokBrandIcon,
    keywords: ['tiktok', 'tok', 'videos', 'trends', 'danca'],
  },
  {
    name: 'Telegram',
    labelPt: 'Telegram',
    category: 'social',
    component: TelegramBrandIcon,
    keywords: ['telegram', 'tlg', 'grupo', 'canal', 'conversa', 'chat'],
  },
  {
    name: 'LinkedIn',
    labelPt: 'LinkedIn',
    category: 'social',
    component: Linkedin,
    keywords: ['linkedin', 'curriculo', 'trabalho', 'vagas', 'profissional', 'carreira'],
  },
  {
    name: 'Twitter',
    labelPt: 'Twitter / X',
    category: 'social',
    component: Twitter,
    keywords: ['twitter', 'x', 'tweet', 'noticias'],
  },
  {
    name: 'Spotify',
    labelPt: 'Spotify',
    category: 'social',
    component: SpotifyBrandIcon,
    keywords: ['spotify', 'musica', 'playlist', 'podcast', 'ouvir'],
  },
  {
    name: 'Pinterest',
    labelPt: 'Pinterest',
    category: 'social',
    component: PinterestBrandIcon,
    keywords: ['pinterest', 'pins', 'fotos', 'inspiracao', 'ideias'],
  },
  {
    name: 'Snapchat',
    labelPt: 'Snapchat',
    category: 'social',
    component: SnapchatBrandIcon,
    keywords: ['snapchat', 'snap'],
  },
  {
    name: 'Threads',
    labelPt: 'Threads',
    category: 'social',
    component: ThreadsBrandIcon,
    keywords: ['threads', 'meta', 'texto'],
  },
  {
    name: 'Twitch',
    labelPt: 'Twitch',
    category: 'social',
    component: Twitch,
    keywords: ['twitch', 'stream', 'live', 'jogos'],
  },
  {
    name: 'GitHub',
    labelPt: 'GitHub',
    category: 'social',
    component: Github,
    keywords: ['github', 'git', 'codigo', 'programador', 'dev'],
  },
  {
    name: 'Kwai',
    labelPt: 'Kwai',
    category: 'social',
    component: KwaiBrandIcon,
    keywords: ['kwai', 'videos'],
  },
  {
    name: 'Phone',
    labelPt: 'Telefone',
    category: 'social',
    component: Phone,
    keywords: ['telefone', 'ligar', 'celular', 'chamada', 'fone', 'contato'],
  },
  {
    name: 'PhoneCall',
    labelPt: 'Ligar Agora',
    category: 'social',
    component: PhoneCall,
    keywords: ['ligar', 'chamada', 'telefone', 'plantao', 'emergencia', 'contato'],
  },
  {
    name: 'Mail',
    labelPt: 'E-mail',
    category: 'social',
    component: Mail,
    keywords: ['email', 'mail', 'mensagem', 'correio', 'contato'],
  },
  {
    name: 'MessageCircle',
    labelPt: 'Chat / Conversa',
    category: 'social',
    component: MessageCircle,
    keywords: ['chat', 'mensagem', 'conversa', 'balao', 'fale conosco'],
  },
  {
    name: 'MessageSquare',
    labelPt: 'Mensagens / Suporte',
    category: 'social',
    component: MessageSquare,
    keywords: ['suporte', 'atendimento', 'chamado', 'chat', 'feedback'],
  },
  {
    name: 'Send',
    labelPt: 'Enviar / Mensagem',
    category: 'social',
    component: Send,
    keywords: ['enviar', 'mensagem', 'aviao', 'direct', 'contato'],
  },

  // === VENDAS, PAGAMENTOS & NEGÓCIOS ===
  {
    name: 'ShoppingCart',
    labelPt: 'Carrinho de Compras',
    category: 'business',
    component: ShoppingCart,
    keywords: ['loja', 'carrinho', 'compras', 'ecommerce', 'checkout', 'vendas'],
  },
  {
    name: 'ShoppingBag',
    labelPt: 'Sacola de Compras',
    category: 'business',
    component: ShoppingBag,
    keywords: ['sacola', 'loja', 'produtos', 'catalogo', 'compras', 'moda'],
  },
  {
    name: 'DollarSign',
    labelPt: 'Cifrão / Dinheiro',
    category: 'business',
    component: DollarSign,
    keywords: ['dinheiro', 'preco', 'valor', 'pagamento', 'reais', 'dolar', 'investimento'],
  },
  {
    name: 'BadgeDollarSign',
    labelPt: 'Selo de Preço / Oferta',
    category: 'business',
    component: BadgeDollarSign,
    keywords: ['promocao', 'desconto', 'oferta', 'preco', 'valor', 'selo'],
  },
  {
    name: 'Wallet',
    labelPt: 'Carteira Digital',
    category: 'business',
    component: Wallet,
    keywords: ['carteira', 'pagamento', 'saldo', 'financeiro', 'pix', 'dinheiro'],
  },
  {
    name: 'CreditCard',
    labelPt: 'Cartão de Crédito',
    category: 'business',
    component: CreditCard,
    keywords: ['cartao', 'credito', 'debito', 'parcelamento', 'pagamento', 'checkout'],
  },
  {
    name: 'QrCode',
    labelPt: 'QR Code / Chave PIX',
    category: 'business',
    component: QrCode,
    keywords: ['pix', 'qrcode', 'pagamento', 'escanear', 'chave', 'transferencia'],
  },
  {
    name: 'Tag',
    labelPt: 'Etiqueta / Cupom',
    category: 'business',
    component: Tag,
    keywords: ['cupom', 'desconto', 'tag', 'etiqueta', 'promocao', 'oferta'],
  },
  {
    name: 'Gift',
    labelPt: 'Presente / Brinde',
    category: 'business',
    component: Gift,
    keywords: ['presente', 'brinde', 'bonus', 'sorteio', 'recompensa'],
  },
  {
    name: 'Ticket',
    labelPt: 'Ingresso / Voucher',
    category: 'business',
    component: Ticket,
    keywords: ['ingresso', 'voucher', 'cupom', 'ticket', 'evento', 'entrada'],
  },
  {
    name: 'Briefcase',
    labelPt: 'Maleta / Negócios',
    category: 'business',
    component: Briefcase,
    keywords: ['negocios', 'trabalho', 'empresa', 'servicos', 'corporativo', 'b2b'],
  },

  // === MÍDIA, ÁUDIO & ENTRETENIMENTO ===
  {
    name: 'Music',
    labelPt: 'Música / Faixa',
    category: 'media',
    component: Music,
    keywords: ['musica', 'audio', 'som', 'faixa', 'album', 'canto', 'instrumento'],
  },
  {
    name: 'Headphones',
    labelPt: 'Fones / Ouça',
    category: 'media',
    component: Headphones,
    keywords: ['fones', 'ouvir', 'podcast', 'audiobook', 'som', 'headset'],
  },
  {
    name: 'Podcast',
    labelPt: 'Podcast / Microfone',
    category: 'media',
    component: Podcast,
    keywords: ['podcast', 'episodio', 'audio', 'entrevista', 'voz'],
  },
  {
    name: 'Radio',
    labelPt: 'Rádio / Estação',
    category: 'media',
    component: Radio,
    keywords: ['radio', 'transmissao', 'frequencia', 'ao vivo'],
  },
  {
    name: 'Video',
    labelPt: 'Vídeo / Câmera de Vídeo',
    category: 'media',
    component: Video,
    keywords: ['video', 'gravar', 'assistir', 'camera', 'cinema', 'aula'],
  },
  {
    name: 'Play',
    labelPt: 'Play / Assistir',
    category: 'media',
    component: Play,
    keywords: ['play', 'assistir', 'reproduzir', 'iniciar', 'video', 'trailer'],
  },
  {
    name: 'Camera',
    labelPt: 'Câmera Fotográfica',
    category: 'media',
    component: Camera,
    keywords: ['camera', 'foto', 'ensaio', 'fotografia', 'portfolio'],
  },
  {
    name: 'Tv',
    labelPt: 'Televisão / Apresentação',
    category: 'media',
    component: Tv,
    keywords: ['tv', 'tela', 'apresentacao', 'transmissao', 'smart tv'],
  },
  {
    name: 'PartyPopper',
    labelPt: 'Festa / Comemoração',
    category: 'media',
    component: PartyPopper,
    keywords: ['festa', 'comemoracao', 'show', 'evento', 'alegria', 'balada'],
  },

  // === GERAIS, DESTAQUES & SERVIÇOS ===
  {
    name: 'Sparkles',
    labelPt: 'Brilho / Destaque',
    category: 'general',
    component: Sparkles,
    keywords: ['brilho', 'destaque', 'novo', 'especial', 'magica', 'premium', 'ia', 'inteligencia'],
  },
  {
    name: 'Sparkle',
    labelPt: 'Estrela Cintilante',
    category: 'general',
    component: Sparkle,
    keywords: ['brilho', 'estrela', 'novo', 'destaque'],
  },
  {
    name: 'Star',
    labelPt: 'Estrela / Avaliação',
    category: 'general',
    component: Star,
    keywords: ['estrela', 'avaliacao', 'nota', 'review', 'google', 'favorito', 'depoimento'],
  },
  {
    name: 'Heart',
    labelPt: 'Coração / Favorito',
    category: 'general',
    component: Heart,
    keywords: ['coracao', 'amor', 'favorito', 'saude', 'doacao', 'apoio'],
  },
  {
    name: 'Award',
    labelPt: 'Troféu / Certificado',
    category: 'general',
    component: Award,
    keywords: ['premio', 'trofeu', 'certificado', 'conquista', 'qualidade', 'garantia'],
  },
  {
    name: 'Crown',
    labelPt: 'Coroa / VIP / VIP Club',
    category: 'general',
    component: Crown,
    keywords: ['coroa', 'vip', 'exclusivo', 'membros', 'clube', 'rei', 'premium'],
  },
  {
    name: 'Flame',
    labelPt: 'Fogo / Em Alta',
    category: 'general',
    component: Flame,
    keywords: ['fogo', 'alta', 'quente', 'tendencia', 'urgente', 'hype'],
  },
  {
    name: 'Zap',
    labelPt: 'Raio / Rápido',
    category: 'general',
    component: Zap,
    keywords: ['raio', 'rapido', 'energia', 'velocidade', 'eletrico', 'potencia'],
  },
  {
    name: 'MapPin',
    labelPt: 'Localização / Endereço',
    category: 'general',
    component: MapPin,
    keywords: ['localizacao', 'endereco', 'mapa', 'onde estamos', 'gps', 'cidade', 'unidade'],
  },
  {
    name: 'Navigation',
    labelPt: 'Como Chegar / Rota',
    category: 'general',
    component: Navigation,
    keywords: ['rota', 'como chegar', 'direcoes', 'waze', 'maps', 'navegacao'],
  },
  {
    name: 'Globe',
    labelPt: 'Website / Global',
    category: 'general',
    component: Globe,
    keywords: ['site', 'web', 'site oficial', 'portal', 'globo', 'mundo', 'internacional'],
  },
  {
    name: 'Link',
    labelPt: 'Link / Hiperlink',
    category: 'general',
    component: LinkIcon,
    keywords: ['link', 'acessar', 'clique', 'url', 'pagina'],
  },
  {
    name: 'GraduationCap',
    labelPt: 'Formatura / Cursos / Aulas',
    category: 'general',
    component: GraduationCap,
    keywords: ['curso', 'aula', 'faculdade', 'estudos', 'educacao', 'mentoria', 'workshop', 'treinamento'],
  },
  {
    name: 'BookOpen',
    labelPt: 'Livro / E-book / Leitura',
    category: 'general',
    component: BookOpen,
    keywords: ['livro', 'ebook', 'guia', 'manual', 'leitura', 'artigo', 'blog'],
  },
  {
    name: 'Stethoscope',
    labelPt: 'Estetoscópio / Saúde / Médico',
    category: 'general',
    component: Stethoscope,
    keywords: ['saude', 'medico', 'clinica', 'medicina', 'dentista', 'consulta', 'tratamento', 'hospital'],
  },
  {
    name: 'Coffee',
    labelPt: 'Café / Coffee Break',
    category: 'general',
    component: Coffee,
    keywords: ['cafe', 'coffee', 'conversa', 'reuniao', 'pausa', 'apoio'],
  },
  {
    name: 'Utensils',
    labelPt: 'Cardápio / Restaurante',
    category: 'general',
    component: Utensils,
    keywords: ['cardapio', 'menu', 'restaurante', 'comida', 'gastronomia', 'almoco', 'jantar'],
  },
  {
    name: 'Wifi',
    labelPt: 'Wi-Fi / Conexão',
    category: 'general',
    component: Wifi,
    keywords: ['wifi', 'internet', 'senha', 'conexao', 'rede', 'gratis'],
  },
  {
    name: 'Shield',
    labelPt: 'Escudo / Seguro / Garantia',
    category: 'general',
    component: Shield,
    keywords: ['seguro', 'garantia', 'protecao', 'confiavel', 'seguranca'],
  },
  {
    name: 'Lock',
    labelPt: 'Cadeado / Acesso Restrito',
    category: 'general',
    component: Lock,
    keywords: ['cadeado', 'senha', 'privado', 'membros', 'fechado', 'seguranca'],
  },
  {
    name: 'Check',
    labelPt: 'Check / Verificado',
    category: 'general',
    component: Check,
    keywords: ['check', 'certo', 'ok', 'concluido', 'verificado'],
  },
  {
    name: 'CheckCircle2',
    labelPt: 'Círculo de Sucesso',
    category: 'general',
    component: CheckCircle2,
    keywords: ['sucesso', 'aprovado', 'verificado', 'oficial', 'concluido'],
  },
  {
    name: 'ThumbsUp',
    labelPt: 'Curtir / Recomendar',
    category: 'general',
    component: ThumbsUp,
    keywords: ['curtir', 'like', 'positivo', 'recomendo', 'aprovado'],
  },
  {
    name: 'Smile',
    labelPt: 'Sorriso / Satisfação',
    category: 'general',
    component: Smile,
    keywords: ['sorriso', 'feliz', 'satisfacao', 'bem estar', 'positivo'],
  },
  {
    name: 'Eye',
    labelPt: 'Olho / Visualizar',
    category: 'general',
    component: Eye,
    keywords: ['olho', 'ver', 'espiar', 'visualizar', 'demonstracao'],
  },
  {
    name: 'Palette',
    labelPt: 'Paleta / Artes / Design',
    category: 'general',
    component: Palette,
    keywords: ['arte', 'design', 'cores', 'criativo', 'estilo'],
  },
  {
    name: 'Code',
    labelPt: 'Código / Programação',
    category: 'general',
    component: Code,
    keywords: ['codigo', 'programacao', 'desenvolvimento', 'tecnologia', 'software'],
  },
  {
    name: 'Laptop',
    labelPt: 'Notebook / Online',
    category: 'general',
    component: Laptop,
    keywords: ['notebook', 'computador', 'online', 'home office', 'trabalho'],
  },
  {
    name: 'Smartphone',
    labelPt: 'Celular / App',
    category: 'general',
    component: Smartphone,
    keywords: ['celular', 'app', 'mobile', 'baixar', 'aplicativo'],
  },
  {
    name: 'Download',
    labelPt: 'Download / Baixar Arquivo',
    category: 'general',
    component: Download,
    keywords: ['download', 'baixar', 'pdf', 'arquivo', 'material', 'gratis'],
  },
  {
    name: 'FileText',
    labelPt: 'Documento / Texto / PDF',
    category: 'general',
    component: FileText,
    keywords: ['documento', 'texto', 'pdf', 'termo', 'contrato', 'artigo'],
  },
  {
    name: 'User',
    labelPt: 'Perfil Pessoal',
    category: 'general',
    component: User,
    keywords: ['usuario', 'perfil', 'pessoa', 'sobre mim', 'bio', 'autor'],
  },
  {
    name: 'Users',
    labelPt: 'Comunidade / Grupo',
    category: 'general',
    component: Users,
    keywords: ['comunidade', 'grupo', 'equipe', 'time', 'alunos', 'membros'],
  },
  {
    name: 'HelpCircle',
    labelPt: 'Dúvidas / FAQ',
    category: 'general',
    component: HelpCircle,
    keywords: ['duvidas', 'faq', 'ajuda', 'perguntas', 'como funciona', 'suporte'],
  },
  {
    name: 'Bell',
    labelPt: 'Sino / Notificações',
    category: 'general',
    component: Bell,
    keywords: ['sino', 'aviso', 'notificacao', 'alerta', 'novidade'],
  },
];

// Create the fast lookup map
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> =
  ICON_DEFINITIONS.reduce((acc, curr) => {
    acc[curr.name] = curr.component;
    return acc;
  }, {} as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>);

// Fast map for label lookup
export const ICON_LABEL_MAP: Record<string, string> =
  ICON_DEFINITIONS.reduce((acc, curr) => {
    acc[curr.name] = curr.labelPt;
    return acc;
  }, {} as Record<string, string>);

interface IconSelectorProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  onClose?: () => void;
}

const CATEGORY_TABS: { id: IconCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '✨' },
  { id: 'agenda', label: 'Agenda & Horários', icon: '📅' },
  { id: 'social', label: 'Redes & Contato', icon: '💬' },
  { id: 'business', label: 'Vendas & Negócios', icon: '🛍️' },
  { id: 'media', label: 'Mídia & Áudio', icon: '🎵' },
  { id: 'general', label: 'Destaques & Geral', icon: '⭐' },
];

export function IconSelector({ selectedIcon, onSelect, onClose }: IconSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('all');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const query = search.toLowerCase().trim();

  const filteredIcons = ICON_DEFINITIONS.filter((item) => {
    // Check category first (if searching, category filtering can be relaxed or respected)
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    if (!query) return true;

    // Direct name match
    if (item.name.toLowerCase().includes(query)) return true;
    // Label PT match
    if (item.labelPt.toLowerCase().includes(query)) return true;
    // Keywords match
    return item.keywords.some((k) => k.toLowerCase().includes(query));
  });

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-3 w-[330px] sm:w-[380px] max-w-[92vw] animate-in fade-in zoom-in-95 duration-150 text-left select-none ring-1 ring-white/10"
    >
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Selecionar Ícone</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {filteredIcons.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input with Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar (ex: agenda, consulta, whatsapp...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700/70 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
          autoFocus
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        {CATEGORY_TABS.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Icons Grid with Spacious Tiles */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {filteredIcons.map((item) => {
          const IconComponent = item.component;
          const isSelected = selectedIcon === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                onSelect(item.name);
                if (onClose) onClose();
              }}
              title={`${item.labelPt} (${item.name})`}
              className={`group relative p-2.5 rounded-xl flex flex-col items-center justify-center transition-all aspect-square ${
                isSelected
                  ? 'bg-sky-500/25 text-sky-300 border-2 border-sky-400 shadow-md shadow-sky-500/20 scale-105 ring-2 ring-sky-400/40'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 hover:scale-105'
              }`}
            >
              <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-[8px] text-slate-400 truncate max-w-full mt-1 group-hover:text-slate-200">
                {item.name}
              </span>
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-5 sm:col-span-6 py-8 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Nenhum ícone encontrado</p>
            <p className="text-[11px] text-slate-500">
              Tente buscar por termos como "agenda", "calendario", "horario", "whatsapp", "estrela".
            </p>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="mt-2 text-xs text-sky-400 hover:underline inline-block"
              >
                Ver todos os ícones
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Info / Selected Icon display */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span>
          Ícone Atual:{' '}
          <strong className="text-slate-200">{selectedIcon || 'Nenhum'}</strong>
        </span>
        <span className="text-slate-500">Toque para selecionar</span>
      </div>
    </div>
  );
}

export function renderDynamicIcon(iconName?: string, className: string = 'w-4 h-4', style?: React.CSSProperties) {
  if (!iconName) return null;

  // Direct match in ICON_MAP
  const directMatch = ICON_MAP[iconName];
  if (directMatch) {
    const IconComp = directMatch;
    return <IconComp className={className} style={style} />;
  }

  // Search in definitions by keyword or lowercase name
  const lower = iconName.toLowerCase().trim();
  const foundDef = ICON_DEFINITIONS.find(
    (d) =>
      d.name.toLowerCase() === lower ||
      d.keywords.some((k) => k.toLowerCase() === lower) ||
      d.labelPt.toLowerCase().includes(lower)
  );

  if (foundDef) {
    const IconComp = foundDef.component;
    return <IconComp className={className} style={style} />;
  }

  // Fallback
  return <ExternalLink className={className} style={style} />;
}

