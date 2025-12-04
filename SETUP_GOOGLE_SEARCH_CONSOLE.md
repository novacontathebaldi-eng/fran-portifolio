# Configuração do Google Search Console

Guia passo-a-passo para configurar o Google Search Console e começar a monitorar o desempenho do seu site nos resultados de busca.

## 📋 O Que É

Google Search Console é uma ferramenta GRATUITA do Google que permite:
- ✅ Ver quantas pessoas encontram seu site no Google
- ✅ Quais palavras-chave as pessoas usam para te encontrar
- ✅ Quantos cliques você recebe
- ✅ Problemas técnicos que impedem indexação
- ✅ Submeter sitemap para indexação mais rápida

## 🚀 Passo 1: Criar Conta

1. Acesse: [Google Search Console](https://search.google.com/search-console)
2. Faça login com sua conta Google
3. Clique em "Adicionar propriedade"

## 🔐 Passo 2: Verificar Propriedade

Existem várias formas de verificar. A mais fácil para você:

### Opção A: Meta Tag HTML (RECOMENDADO)

1. No Search Console, escolha "Prefixo do URL"
2. Digite: `https://fransiller.othebaldi.me`
3. Escolha método: "Tag HTML"
4. Copie a meta tag fornecida (algo como):
   ```html
   <meta name="google-site-verification" content="CODIGO_AQUI" />
   ```
5. **Me envie esse código** - vou adicionar no `index.html` para você
6. Volte ao Search Console e clique em "Verificar"

### Opção B: Upload de Arquivo HTML

1. Google vai dar um arquivo HTML para baixar
2. Faça upload desse arquivo na pasta `public/` do projeto
3. Faça deploy
4. Volte ao Search Console e clique em "Verificar"

## 📬 Passo 3: Submeter Sitemap

Após verificar a propriedade:

1. No menu lateral, clique em "Sitemaps"
2. Cole: `sitemap.xml`
3. Clique em "Enviar"

✅ **Pronto!** O Google vai começar a indexar suas páginas.

## 📊 Passo 4: Monitoramento

### Dashboards Importantes

**Desempenho** (menu lateral):
- Total de cliques
- Total de impressões
- CTR (taxa de clique)
- Posição média
- Filtrar por: páginas, países, dispositivos, queries

**Cobertura** (Páginas):
- Páginas indexadas
- Páginas com erros
- Páginas excluídas

**Melhorias**:
- Core Web Vitals (velocidade)
- Usabilidade em dispositivos móveis
- Experiência da página

## ⏱️ Quanto Tempo Demora?

- **Verificação**: Instantânea
- **Primeiras páginas aparecendo**: 1-3 dias
- **Índice completo**: 1-2 semanas
- **Dados de desempenho**: Começam a aparecer assim que houver cliques

## 🔍 Comandos Úteis para Testar

Após alguns dias, teste no Google:

```
site:fransiller.othebaldi.me
```

Isso mostra quantas páginas do seu site o Google indexou.

## ⚠️ Problemas Comuns

### "Detectado, mas não indexado"
- **Solução**: Aguardar. Google está processando.

### "Rastreado, sem índice"
- **Solução**: Verificar conteúdo. Google achou a página pouco relevante.

### "Erro 404"
- **Solução**: Verificar URLs no sitemap.

## 📱 App Mobile

Google Search Console tem app para iOS e Android:
- Acompanhe desempenho no celular
- Receba notificações de problemas críticos

## 🎯 Dicas de Ouro

1. **Verifique semanalmente**: Primeiras 4 semanas
2. **Corrija erros ASAP**: Prioridade alta para erros de indexação
3. **Use "Inspeção de URL"**: Teste páginas específicas
4. **Solicite indexação**: Para páginas novas importantes

## 📈 Métricas de Sucesso

Após 1 mês, você deve ver:
- ✅ Todas páginas principais indexadas
- ✅ Primeiras impressões (apareceu nos resultados)
- ✅ Primeiros cliques
- ✅ Core Web Vitals verdes (bom desempenho)

Após 3-6 meses:
- ✅ Crescimento constante de impressões
- ✅ CTR melhorando (acima de 2-3%)
- ✅ Posições melhorando para keywords importantes

---

## 🔗 Links Úteis

- [Google Search Console](https://search.google.com/search-console)
- [Central de Ajuda](https://support.google.com/webmasters)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

**Próximo passo**: Quando tiver a meta tag de verificação, me envie para eu adicionar no site!
