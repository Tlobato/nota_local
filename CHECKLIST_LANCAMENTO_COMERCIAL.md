# 🚀 Checklist de Lançamento Comercial — NotaLocal

Este documento é o nosso **Guia Passo a Passo** para irmos marcando cada etapa concluída até o início oficial das abordagens comerciais na sexta-feira.

---

## 📸 Etapa 1: Identidade Visual & Perfil Comercial (WhatsApp Business)
- [ ] **1.1. Foto de Perfil Profissional (`Thyago | NotaLocal`):**
  - Gerar foto de perfil estilo retrato corporativo vestindo camisa/polo escura com a logo **NotaLocal** e fundo moderno/limpo.
- [ ] **1.2. Artes para o Catálogo do WhatsApp Business:**
  - **Arte 1 (Como Funciona):** Comparativo visual do Filtro Inteligente (4-5⭐ vão para o Google / 1-3⭐ vão para o Canal Oficial de Atendimento).
  - **Arte 2 (Kit de Balcão + Painel):** Demonstração do Display com QR Code + Painel do Gestor no celular/computador.
  - **Arte 3 (Planos e Preços):** Plano Mensal (R$ 49,90/mês sem fidelidade) vs Plano Anual (12x de R$ 29,90 ou R$ 297 no Pix).
- [ ] **1.3. Textos de Configuração do WhatsApp Business:**
  - Deixar prontos a **Descrição da Empresa**, **Mensagem de Saudação** e **Atalhos de Resposta Rápida** (`/simulador`, `/video`, `/planos`).

---

## 🌐 Etapa 2: Domínio Oficial & E-mails Automáticos (Quarta / Quinta)
- [ ] **2.1. Compra do Domínio no Registro.br (~R$ 40/ano):**
  - Registrar o domínio oficial (ex: `notalocal.com.br`).
- [ ] **2.2. Conexão na Vercel:**
  - Adicionar domínio em `Settings > Domains` na Vercel e configurar os apontamentos DNS (`A` e `CNAME`).
  - Atualizar variável `NEXT_PUBLIC_APP_URL` na Vercel para `https://notalocal.com.br`.
- [ ] **2.3. Atualização do Clerk e Asaas:**
  - Adicionar o domínio de produção no painel do Clerk.
  - Atualizar a URL do Webhook no painel do Asaas para `https://notalocal.com.br/api/webhooks/asaas`.
- [ ] **2.4. Configuração do Resend + 4 E-mails Transacionais (Detalhes em `ROADMAP_DOMINIO_EMAILS.md`):**
  - Verificar domínio no Resend e adicionar chave `RESEND_API_KEY` na Vercel.
  - Implementar **E-mail #1:** Alerta imediato de nova crítica retida (1 a 3 estrelas) com botão de WhatsApp.
  - Implementar **E-mail #2:** Boas-vindas na criação da conta + link do kit de QR Code.
  - Implementar **E-mail #3:** Confirmação de assinatura ativa (Webhook Asaas).
  - Implementar **E-mail #4:** Resumo Semanal de Segunda-Feira (com trava anti-tiro-no-pé para só enviar se houver atividade).

---

## 🎥 Etapa 3: Vídeo de Demonstração (1 Minuto) & Prospecção no CRM (Quinta-feira)
- [ ] **3.1. Roteiro Cronometrado do Vídeo (60 segundos):**
  - Criar roteiro direto ao ponto mostrando:
    1. O problema de mandar link direto do Google (e a estatística de que 80%+ dos clientes preferem resolver no privado quando têm canal rápido);
    2. O teste ao vivo no Simulador (`notalocal.com.br/#simulador`) clicando em 2 estrelas vs 5 estrelas;
    3. O Painel do Gestor por dentro (alertas, botão de chamar o cliente no WhatsApp e gerador de plaquinha QR Code).
- [ ] **3.2. Gravação do Vídeo Curto:**
  - Gravar a tela já exibindo o domínio oficial `notalocal.com.br`.
- [ ] **3.3. Mapeamento Inicial no CRM (`/super-admin`):**
  - Cadastrar de **15 a 20 comércios/clínicas de Sorocaba** na aba **🎯 CRM & Prospecção** (já temos a *Florido Odontologia* como #1).

---

## 📱 Etapa 4: Chip Comercial & Primeiros Contatos (Sexta-feira)
- [ ] **4.1. Compra e Ativação do Chip Pré-Pago DDD (15):**
  - Comprar chip pré-pago (Vivo/Claro/TIM) com DDD 15.
- [ ] **4.2. Instalação e Configuração do WhatsApp Business:**
  - Subir foto de perfil `Thyago | NotaLocal`, preencher descrição, link do site e subir as 3 artes no Catálogo.
- [ ] **4.3. Aquecimento Inicial do Número:**
  - Trocar primeiras mensagens com números conhecidos (seu número pessoal, esposa) antes de abordar desconhecidos.
- [ ] **4.4. Disparo do 1º Lote Consultivo (5 a 8 empresas/dia):**
  - Usar o botão **"Chamar no Zap"** do nosso CRM (`/super-admin`), atualizar o status para **"💬 1º Contato Feito"** e agendar data de retorno!
