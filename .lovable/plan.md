# Profissionalização do Controle de Abastecimento

## Situação atual verificada
- O sistema já utiliza Lovable Cloud com PostgreSQL permanente e armazenamento privado de fotos. Não é necessário trocar o banco.
- As tabelas atuais são `fuel_logs` (abastecimentos), `tank_levels` (medições) e `fuel_requests` (pedidos). Não existem tabelas próprias de veículos, motoristas ou perfis de usuários.
- O acesso atual cria sessões anônimas de teste. Os registros de teste são isolados dos reais por políticas do banco.
- Há atualização em tempo real na Gestão e exportação operacional Excel sem fotos. Ainda não há perfis ADM/colaborador, gerenciamento de usuários ou auditoria.
- Ipiranga e Itaquera já são aceitos pelo banco; os ajustes anteriores de importação e indicadores ainda estão pendentes.
- O documento recebido termina com uma frase incompleta na seção 10. Este plano cobre os requisitos completos recebidos e preserva o estilo atual.

## 1. Acesso permanente e perfis
- Substituir a entrada automática de teste por entrada segura com contas individuais e proteção das páginas operacionais: auxiliares entram com usuário curto e senha; administradores, com e-mail real e senha. Auxiliares recuperam o acesso por redefinição feita por ADM; administradores também podem usar recuperação por e-mail.
- Criar perfis de usuário e papéis ADM/colaborador separados. Aplicar autorização no servidor e no banco, além da navegação.
- Provisionar o administrador inicial `gestão@alpitelbrasil.com.br` mediante verificação do endereço e fluxo seguro de criação/ativação. Não criar senha compartilhada nem conceder ADM apenas porque alguém informou esse e-mail.
- Preferir definição de senha pelo próprio titular por convite ou recuperação segura. Se for usada senha temporária, verificar o suporte à troca obrigatória e informar qualquer limitação.
- Criar **Gerenciar Usuários** exclusivo ADM. A primeira escolha será **Auxiliar (colaborador)** ou **Administrador**, alterando os campos do formulário:
  - Auxiliar: nome, usuário curto único, sem exigir e-mail, e senha inicial.
  - Administrador: nome, e-mail real e senha inicial ou convite por e-mail para a pessoa definir a senha.
- Exigir confirmação extra antes de criar um administrador e registrar quem autorizou sua criação.
- Permitir mudar o tipo de outros usuários, ativar, desativar e redefinir senha. Impedir que qualquer usuário altere o próprio tipo; impedir desativação ou rebaixamento do último administrador ativo, inclusive em ações simultâneas.
- Exibir lista com nome, tipo, estado ativo/inativo, data de criação e último acesso confirmado. Quando não houver acesso registrado, mostrar “Nunca acessou”, sem inventar datas.
- Auditar toda criação, mudança de tipo, ativação, desativação e redefinição de senha, com autor, usuário afetado e horário; nunca registrar senhas na auditoria.
- Preservar os registros e contas existentes; registros de teste não serão convertidos automaticamente em dados operacionais.

## 2. Pedidos e integridade dos abastecimentos
- Retirar da tela **Pedir Combustível** o campo de última entrega, mantendo o aviso crítico e os demais campos.
- Preservar a coluna e os valores antigos. Adaptar a gravação sem inventar datas de entrega para novos pedidos.
- Manter abastecimentos enviados bloqueados para edição/exclusão por colaboradores, inclusive por chamadas diretas.
- Exibir a mensagem solicitada após o envio e em tentativas de alteração não autorizadas.
- Permitir correções por ADM com motivo e histórico anterior/posterior protegido. Não acrescentar exclusão administrativa de abastecimentos.

## 3. Medições e página inicial
- Ampliar o histórico existente com turno manhã/noite, observação opcional e identificador de reenvio para evitar duplicações.
- Exigir quantidade maior que zero e registrar responsável e criação no servidor. Preservar medições antigas sem inventar turnos que não foram registrados.
- Definir a medição mais recente pela data/hora efetiva, com desempate por criação e identificador. Nunca somar medições ou calcular saldo por entradas/saídas sem regra aprovada.
- Criar a página inicial operacional com **Controle do Tanque de Combustível**, por tanque: última medição, data/hora, turno, responsável, histórico recente e horário da atualização.
- Mostrar carregamento, ausência de medições, falhas e reconexão sem apresentar zero como saldo fictício.
- Refletir registros confirmados entre usuários autorizados em tempo real; usar atualização de contingência documentada quando a conexão cair.

## 4. Exportação administrativa
- Criar **Exportar dados** exclusivo ADM, com um CSV por tabela da aplicação, todos os campos e todas as linhas, sem o limite de consulta da interface.
- Criar **Exportar tudo**, reunindo os CSVs em um único ZIP. Incluir perfis, papéis e auditoria após sua criação, além das três tabelas atuais.
- Não inventar cadastros de veículos ou motoristas: incluir essas tabelas apenas se existirem no sistema.
- Exportar dados de usuários necessários para conferência, nunca senhas, hashes, tokens, sessões ou chaves privadas. As tabelas internas do serviço de autenticação não serão exportadas integralmente.
- Manter o Excel operacional limpo separado da exportação administrativa completa. A exportação administrativa pode conter campos de anexos existentes; não será um backup dos arquivos das fotos.

## 5. Pendências já solicitadas
- Concluir o mapeamento de colunas e normalização dos nomes legados de tanques na importação XLSX/CSV.
- Ampliar seletores e indicadores para Ipiranga/Itaquera, preservando Leste/Norte como locais independentes.
- Mostrar consumo em litros, média em litros por veículo e filtro por base, sem confundir consumo com medição do tanque.

## 6. Conferência, documentação e recuperação
- Documentar tabelas, relacionamentos, acesso autorizado pelo painel do Lovable Cloud, exportação e conferência de persistência.
- Verificar quais backups, retenção e restauração são efetivamente oferecidos/configurados. Informar dependências de plano ou configuração manual; não afirmar que exportações substituem backup restaurável.
- Testar permissões com ADM e colaborador, bloqueio de chamadas diretas, desativação, correções auditadas, reenvios, persistência após nova entrada e sincronização entre duas sessões. Validar também entrada por usuário curto, unicidade do usuário, os dois formulários de criação, confirmação extra de ADM, proibição de mudança do próprio tipo, proteção concorrente do último ADM ativo, último acesso e auditoria de todas as ações de conta.
- Validar importação, exportações completas e ausência de credenciais nos arquivos. Não publicar ou declarar operação em produção antes da validação.

## Detalhes técnicos
- Migrações aditivas, com políticas RLS e permissões explícitas. Nenhuma remoção de tabelas, registros ou colunas históricas.
- `public.profiles` para dados de conta e `public.user_roles` para papéis protegidos; autorização baseada em identidade validada, nunca em armazenamento do navegador ou metadados editáveis do usuário.
- Adaptar o usuário curto dos auxiliares ao serviço de autenticação existente por uma associação protegida no servidor. Não exigir e-mail do auxiliar, criar autenticação paralela ou validar senha manualmente; credenciais continuam sob responsabilidade do serviço de autenticação. Respostas de entrada não devem revelar se uma conta existe.
- Validar tipo e estado ativo no banco em cada operação protegida. Bloquear usuários desativados mesmo com sessão anterior válida; efetuar mudanças de tipo e proteção do último ADM ativo com controle transacional, não apenas checagem da interface.
- Registrar último acesso após autenticação confirmada pelo serviço, usando horário confiável do servidor. Provisionamento e redefinições devem auditar resultados confirmados, sem armazenar ou devolver senhas, hashes ou tokens em perfis, registros de auditoria ou exportações.
- Funções autenticadas do servidor para provisionamento e ações administrativas. Verificar ADM antes de qualquer acesso privilegiado.
- Auditoria gerada no banco para operações importantes, sem permissões de alteração/exclusão pela aplicação, inclusive para ADM.
- Para dispensar a última entrega obrigatória sem apagar a estrutura antiga, adicionar um campo opcional sucessor, preservar/backfill do histórico e deixar a coluna antiga documentada como legada; novos pedidos não devem receber datas falsas.
- Consultas paginadas com ordenação estável e campos autorizados para exportação; proteção contra fórmulas maliciosas em CSV e serialização de arrays/objetos.

## Dependências para concluir a implantação
- Ativação/verificação da conta administrativa pelo titular e confirmação de entrega dos e-mails de acesso.
- Validação dos recursos reais de backup e restauração disponíveis no Lovable Cloud.
- Liberação de fotos públicas permanece pendente de administrador do workspace; manter fotos privadas enquanto isso.