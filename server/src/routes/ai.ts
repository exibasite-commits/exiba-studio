import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { ApiError } from '../utils';

const router = Router();

// GET /api/ai/status
router.get('/status', (_req, res) => {
  res.json({
    hasServerKey: Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 0),
    model: 'gemini-2.5-flash',
  });
});

// Helper para selecionar apiKey
function getApiKey(customKey?: string): string {
  const key = (customKey && customKey.trim().length > 0) ? customKey.trim() : config.geminiApiKey;
  if (!key) {
    throw new ApiError(
      400,
      'Chave de API do Google Gemini não configurada. Forneça uma chave de API própria ou configure GEMINI_API_KEY no arquivo .env.'
    );
  }
  return key;
}

// POST /api/ai/generate — Geração completa de estrutura de site para Exiba Studio
router.post('/generate', async (req, res, next) => {
  try {
    const {
      businessName,
      niche,
      city,
      phone,
      vibe = 'modern',
      servicesOrProducts,
      customApiKey,
    } = req.body;

    if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
      throw new ApiError(400, 'O nome do negócio é obrigatório.');
    }

    const apiKey = getApiKey(customApiKey);
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é o especialista mestre em CRO (Conversion Rate Optimization), branding e web design do Exiba Studio (plataforma brasileira de biolinks e mini-sites de alta conversão).
Gere uma configuração completa de site profissional em JSON para o seguinte negócio:

- Nome do Negócio: "${businessName}"
- Nicho / Segmento: "${niche || 'Geral / Serviços'}"
- Cidade / Região: "${city || 'Brasil'}"
- WhatsApp / Contato: "${phone || ''}"
- Estilo / Vibe visual: "${vibe}"
- Serviços ou Produtos principais: "${servicesOrProducts || 'Serviços e atendimento de alta qualidade'}"

REQUISITOS ESTRITOS DO JSON:
Responda EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown de código, apenas o JSON puro) seguindo exatamente este formato:
{
  "profile": {
    "name": "${businessName}",
    "handle": "@...",
    "bio": "Bio curta, persuasiva e vendedora com emojis (max 150 caracteres)",
    "location": "${city || 'Brasil'}",
    "badgeText": "Ex: Atendimento VIP ou Selo de Qualidade",
    "verified": true,
    "avatarStyle": "squircle",
    "avatarSize": "md",
    "avatarBorder": true,
    "avatarBorderColor": "#ffffff",
    "avatarBorderWidth": 3,
    "showAvatar": true,
    "showName": true,
    "showHandle": true,
    "showBio": true,
    "showLocation": true,
    "showBadge": true,
    "showVerified": true,
    "showSocials": true,
    "businessInfo": {
      "tagline": "Slogan de alto impacto",
      "highlights": ["Diferencial 1", "Diferencial 2", "Diferencial 3"],
      "operatingHours": "Seg a Sex: 09h às 18h | Sáb: 09h às 14h",
      "isOpenNow": true
    },
    "seoTitle": "${businessName} | Atendimento e Serviços",
    "seoDescription": "Conheça os serviços, faça seu agendamento ou fale diretamente conosco pelo WhatsApp.",
    "seoKeywords": "serviços, agendamento, qualidade"
  },
  "palette": {
    "primary": "#HEX (cor de destaque que combina com o nicho)",
    "background": "#HEX (cor do fundo ou #0f172a / #ffffff)",
    "cardBg": "#HEX (cor dos cards)",
    "cardBorder": "#HEX (borda dos cards)",
    "textColor": "#HEX (cor do texto principal)",
    "textSecondary": "#HEX (cor do texto secundário)"
  },
  "blocks": [
    {
      "id": "b_whatsapp",
      "type": "whatsapp",
      "enabled": true,
      "title": "Falar no WhatsApp",
      "subtitle": "Atendimento rápido e orçamentos",
      "phoneNumber": "${phone ? phone.replace(/\\D/g, '') : '5511999999999'}",
      "defaultMessage": "Olá! Vim pelo site da ${businessName} e gostaria de mais informações.",
      "buttonText": "Iniciar Conversa"
    },
    {
      "id": "b_schedule",
      "type": "schedule",
      "enabled": true,
      "title": "Agendar Horário",
      "subtitle": "Escolha o melhor dia e horário para seu atendimento",
      "bookingUrl": "https://calendly.com/",
      "platform": "whatsapp",
      "badge": "Vagas Abertas",
      "buttonText": "Ver Horários Disponíveis"
    },
    {
      "id": "b_prod_1",
      "type": "product",
      "enabled": true,
      "title": "Nome do Procedimento / Produto 1",
      "description": "Descrição detalhada dos benefícios e valor entregue ao cliente.",
      "price": "R$ 150,00",
      "originalPrice": "R$ 180,00",
      "buttonText": "Solicitar / Comprar",
      "url": "https://wa.me/${phone ? phone.replace(/\\D/g, '') : '5511999999999'}",
      "badge": "Mais Procurado"
    },
    {
      "id": "b_prod_2",
      "type": "product",
      "enabled": true,
      "title": "Nome do Procedimento / Produto 2",
      "description": "Descrição atrativa com foco em transformação e resultado.",
      "price": "R$ 90,00",
      "buttonText": "Solicitar / Comprar",
      "url": "https://wa.me/${phone ? phone.replace(/\\D/g, '') : '5511999999999'}"
    },
    {
      "id": "b_faq",
      "type": "faq",
      "enabled": true,
      "title": "Perguntas Frequentes",
      "items": [
        { "id": "faq_1", "question": "Pergunta comum sobre formas de pagamento?", "answer": "Aceitamos Pix, cartão de crédito em até 12x e boleto." },
        { "id": "faq_2", "question": "Como funciona o agendamento?", "answer": "Você escolhe o horário desejado e confirmamos imediatamente no WhatsApp." },
        { "id": "faq_3", "question": "Qual a localização?", "answer": "Estamos convenientemente localizados em ${city || 'sua região'} com fácil acesso." }
      ]
    },
    {
      "id": "b_pix",
      "type": "pix",
      "enabled": true,
      "title": "Pagamento Fácil via Pix",
      "description": "Chave Pix para sinal ou pagamentos rápidos",
      "pixKey": "${phone || 'contato@exiba.com.br'}",
      "pixKeyType": "email",
      "recipientName": "${businessName}",
      "suggestedAmounts": ["50", "100", "150"]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Se tiver envolto em markdown ```json
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    if (err instanceof ApiError) return next(err);
    console.error('[AI Generate Error]:', err);
    return next(new ApiError(500, err?.message || 'Erro ao gerar site com IA Google Gemini.'));
  }
});

// POST /api/ai/copy — Sugestões e melhorias de copywriting
router.post('/copy', async (req, res, next) => {
  try {
    const { type, currentText, businessName, niche, customApiKey } = req.body;

    if (!type) {
      throw new ApiError(400, 'O tipo de copy é obrigatório (bio, tagline, product).');
    }

    const apiKey = getApiKey(customApiKey);
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um copywriter de classe mundial especializado em biolinks, Instagram e páginas de conversão brasileiras.
Gere 3 opções altamente persuasivas e irresistíveis para o tipo: "${type}".
Contexto do negócio: "${businessName || 'Negócio'}" no nicho "${niche || 'Geral'}".
${currentText ? `Texto atual do usuário: "${currentText}"` : ''}

Responda exclusivamente em formato JSON com o array de 3 strings:
{
  "suggestions": [
    "Opção 1 com emojis e gatilhos mentais",
    "Opção 2 mais elegante e direta",
    "Opção 3 focada em ação rápida"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      suggestions: parsed.suggestions || [],
    });
  } catch (err: any) {
    if (err instanceof ApiError) return next(err);
    console.error('[AI Copy Error]:', err);
    return next(new ApiError(500, err?.message || 'Erro ao sugerir copy com IA.'));
  }
});

export default router;
