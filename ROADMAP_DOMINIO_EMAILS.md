# 🚀 Checklist Pós-Compra de Domínio & E-mails (Resend) — NotaLocal

Este documento reúne todas as configurações e automações que vamos ativar assim que o domínio oficial (ex: `notalocal.com.br`) for adquirido.

---

## 1. Configuração do Domínio na Vercel
- [ ] Comprar o domínio oficial no Registro.br (ou Cloudflare / GoDaddy).
- [ ] Adicionar o domínio na **Vercel** (`Settings` -> `Domains`).
- [ ] Apontar os registros DNS (`A` e `CNAME`) indicados pela Vercel.
- [ ] Atualizar a variável de ambiente `NEXT_PUBLIC_APP_URL` na Vercel com o novo domínio oficial.
- [ ] Atualizar o texto visual de exemplo em `/onboarding` (caso o domínio seja diferente de `notalocal.com.br`).

---

## 2. Configuração do Resend (Envio de E-mails Transacionais)
- [ ] Criar conta gratuita no [Resend](https://resend.com) (plano gratuito inclui até **3.000 e-mails/mês** e 100/dia).
- [ ] Cadastrar o domínio no Resend e adicionar os registros DNS de autenticação (**DKIM, SPF e DMARC**) para garantir que os e-mails caiam na Caixa de Entrada principal (e nunca no Spam).
- [ ] Definir o remetente oficial (ex: `NotaLocal <contato@notalocal.com.br>` ou `alertas@notalocal.com.br`).
- [ ] Criar a chave `RESEND_API_KEY` e salvar nas variáveis de ambiente da Vercel e no `.env.local`.

---

## 3. Os 4 Disparos Inteligentes de E-mail

### ✉️ E-mail 1: Boas-Vindas & Acesso Imediato (Onboarding)
* **Quando dispara:** Assim que a empresa é criada (seja via Checkout Asaas/Onboarding ou cadastrada manualmente pelo Super Admin).
* **O que contém:**
  * Boas-vindas em nome do NotaLocal.
  * Link direto da **Página Pública de Avaliação** (`https://seudominio.com.br/slug-da-loja`).
  * Botão direto para o **Painel do Gestor** (`/admin`) explicando que basta entrar com aquele mesmo e-mail.
  * Passo a passo rápido de 2 minutos:
    1. *Baixar/Imprimir a Arte Digital de Balcão com QR Code;*
    2. *Testar o Disparador Rápido de WhatsApp com os clientes atendidos hoje.*

### 🚨 E-mail 2: Alerta Imediato de Crítica Retida (Notas 1, 2 ou 3 estrelas)
* **Quando dispara:** No exato segundo em que um cliente envia uma avaliação de 1 a 3 estrelas na página da loja (`POST /api/feedback`).
* **Assunto:** `🚨 Nova crítica retida na Ouvidoria da [Nome da Empresa] (${rating}⭐)`
* **O que contém:**
  * Aviso tranquilizador: *"Fique tranquilo: esta queixa foi bloqueada e NÃO foi publicada no Google."*
  * Dados enviados pelo cliente: Nome (ou aviso de anônimo), Telefone/WhatsApp e o Comentário completo.
  * Botão de ação rápida: **"Abrir Ouvidoria e Responder Cliente"** (levando direto para `/admin` onde estão os 3 roteiros prontos de reversão).

### 🎉 E-mail 3: Marco da 1ª Avaliação 5 Estrelas (Efeito "Uau")
* **Quando dispara:** Apenas **uma única vez**, quando a empresa recebe a sua **primeira** avaliação de 4 ou 5 estrelas direcionada ao Google.
* **Por que apenas na 1ª?**
  * Evita lotar a caixa de entrada do comerciante caso ele receba dezenas de avaliações positivas por semana.
  * Gera um pico de satisfação logo no início do uso (*"O sistema já está funcionando e mandando clientes pro meu Google!"*).

### 📊 E-mail 4: Resumo Semanal Inteligente (Com Trava Anti-Tiro-no-Pé)
* **Quando dispara:** Toda segunda-feira às 08h30 da manhã (via Cron Job da Vercel).
* **⚠️ REGRA DE OURO (Trava Anti-Tiro-no-Pé):**
  * **Cenário A — A empresa TEVE avaliações na semana (`totalSemana > 0`):**
    * Dispara o **Relatório de Resultados da Semana**:
      * *"Na última semana, o NotaLocal direcionou **X clientes satisfeitos (4-5⭐)** para o seu Google e reteve **Y críticas** na sua Ouvidoria Privada."*
      * Se houver alguma crítica ainda com status `Pendente`, exibe um lembrete amigável para responder o cliente.
  * **Cenário B — A empresa NÃO teve nenhuma avaliação na semana (`totalSemana === 0`):**
    * **NUNCA enviar um relatório dizendo "0 avaliações"** (pois isso gera a falsa sensação no lojista de que o sistema está parado e aumenta o risco de cancelamento!).
    * Se a loja foi criada há menos de 14 dias e ainda está com `0 avaliações` no total, envia apenas **1 e-mail educativo de engajamento**:
      * *"💡 Dica rápida para estrear seu NotaLocal esta semana: Veja como conseguir suas primeiras 10 avaliações 5 estrelas em 2 dias (imprimindo a Arte de Balcão ou enviando o convite rápido no WhatsApp pós-venda)."*
    * Se já enviou essa dica antes e a semana teve `0 avaliações`, **não envia nada naquela semana** (silêncio estratégico).
