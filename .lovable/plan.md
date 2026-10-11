# Profissionalização do Controle de Abastecimento

## Situação atual verificada
- O sistema já utiliza Lovable Cloud com PostgreSQL permanente e armazenamento privado de fotos. Não é necessário trocar o banco.
- As tabelas atuais são `fuel_logs` (abastecimentos), `tank_levels` (medições) e `fuel_requests` (pedidos). Não existem tabelas próprias de veículos, motoristas ou perfis de usuários.
- O acesso atual cria sessões anônimas de teste. Os registros de teste são isolados dos reais por políticas do banco.
- Há atualização em tempo real na Gestão e exportação operacional Excel sem fotos. Ainda não há perfis ADM/colaborador, gerenciamento de usuários ou auditoria.
- Ipiranga e Itaquera já são aceitos pelo banco; os ajustes anteriores de importação e indicadores ainda estão pendentes.
- O documento recebido termina com uma frase incompleta na seção 10. Este plano cobre os requisitos completos recebidos e preserva o estilo atual.
- Contagem antes da implementação, consultada em 11/10/2026 UTC: **667 abastecimentos, 3 pedidos e 7 medições (677 registros, todos marcados como teste); 38 contas, sendo 37 anônimas e 1 não anônima**. Nenhuma dessas contas será presumida administradora. Recontar no início e no relatório final, pois o sistema pode receber registros nesse intervalo.

## 1. Acesso permanente e perfis
- Substituir a entrada automática de teste por entrada segura com contas individuais e proteção das páginas operacionais: auxiliares entram com usuário curto e senha; administradores, com e-mail real e senha. Auxiliares recuperam o acesso por redefinição feita por ADM; administradores também podem usar recuperação por e-mail.
- Criar perfis de usuário e papéis ADM/colaborador separados. Aplicar autorização no servidor e no banco, além da navegação.
- Provisionar o administrador inicial `gestao@alpitelbrasil.com.br` (sem acento) mediante verificação do endereço e fluxo seguro de criação/ativação. Não criar senha compartilhada nem conceder ADM apenas porque alguém informou esse e-mail.
- Preferir definição de senha pelo próprio titular por convite ou recuperação segura. Se for usada senha temporária, verificar o suporte à troca obrigatória e informar qualquer limitação.
- Criar **Gerenciar Usuários** exclusivo ADM. A primeira escolha será **Auxiliar (colaborador)** ou **Administrador**, alterando os campos do formulário:
  - Auxiliar: nome, usuário curto único, sem exigir e-mail, e senha inicial.
  - Administrador: nome, e-mail real e senha inicial ou convite por e-mail para a pessoa definir a senha.
- Exigir confirmação extra antes de criar um administrador e registrar quem autorizou sua criação.
- Permitir mudar o tipo de outros usuários, ativar, desativar e redefinir senha. Impedir que qualquer usuário altere o próprio tipo; impedir desativação ou rebaixamento do último administrador ativo, inclusive em ações simultâneas.
- Exibir lista com nome, tipo, estado ativo/inativo, data de criação e último acesso confirmado. Quando não houver acesso registrado, mostrar “Nunca acessou”, sem inventar datas.
- Auditar toda criação, mudança de tipo, ativação, desativação e redefinição de senha, com autor, usuário afetado e horário; nunca registrar senhas na auditoria.
- Preservar os registros e contas existentes; registros de teste não serão convertidos automaticamente em dados operacionais.
- Criar uma tela de entrada simples para celular, com campos e botões grandes e controle “Mostrar senha”. Manter “Sair” sempre visível nas telas da sessão autenticada.
- Solicitar persistência da sessão no aparelho por 30 dias, com renovação automática, sem expiração por inatividade e continuidade mínima de duas horas. Validar as opções efetivamente suportadas antes de afirmar que esse prazo está garantido. Explicar a diferença entre o prazo de 30 dias e “só sair ao clicar em Sair”: desativação, revogação de segurança, limpeza do navegador ou expiração obrigatória também podem encerrar o acesso.
- Ao desativar uma conta, bloquear imediatamente novas operações no servidor e no banco, mesmo com um token anterior. Revogar as sessões e sinalizar a desativação à tela conectada; verificar o tempo observado de saída, sem prometer entrega instantânea quando o aparelho estiver sem conexão.
- Aplicar bloqueio temporário de **5 minutos após 5 tentativas erradas**, controlado pelo servidor, conforme autorizado. O Lovable Cloud não possui esse bloqueio como mecanismo padrão; a solução própria terá contagem persistente e controle concorrente, sem armazenar senhas. Documentar que tentativas maliciosas podem bloquear temporariamente o titular e que isso não substitui proteção contra ataques em grande escala.
- Colaboradores ativos consultam somente os próprios registros; administradores ativos consultam todos. Visitantes e sessões anônimas de teste não terão acesso operacional. Aplicar essa regra às consultas, anexos, importação, exportação e atualização em tempo real, preservando os dados antigos sem torná-los públicos.
- Desativar **login anônimo e cadastro público** nas configurações do serviço de autenticação, não apenas na tela. Somente o fluxo administrativo autorizado poderá criar contas. Confirmar por leitura das configurações e por tentativas reais de cadastro público e login anônimo; mostrar o estado final no relatório. Preservar as contas anônimas e seus registros existentes, mas impedir sua utilização operacional.
- Definir senha com **mínimo de 6 caracteres** e verificar as proteções nativas disponíveis. Rejeitar `123456`, `000000`, `senha` e o próprio usuário nas operações de senha controladas pelo servidor; verificar se o serviço oferece essa lista personalizada e se permite impedir desvios por chamadas diretas. Informar claramente qualquer proteção que não possa ser garantida em todos os caminhos. Verificar também proteção contra senhas vazadas, sem apresentá-la como equivalente a uma lista personalizada.
- Disponibilizar **Alterar minha senha** para qualquer usuário autenticado, solicitando senha atual no fluxo normal e usando o fluxo seguro de recuperação quando aplicável. Se ADM definir a senha inicial ou redefinir uma senha temporária, exigir troca no primeiro acesso quando suportado. Verificar suporte nativo; se for necessário um estado protegido no banco para restringir operações até a troca confirmada, documentar a adaptação e suas limitações. Nunca limpar a exigência apenas por uma resposta do navegador.

## 2. Pedidos e integridade dos abastecimentos
- Retirar da tela **Pedir Combustível** o campo de última entrega, mantendo o aviso crítico e os demais campos.
- Preservar a coluna e os valores antigos. Adaptar a gravação sem inventar datas de entrega para novos pedidos.
- Manter abastecimentos enviados bloqueados para edição/exclusão por colaboradores, inclusive por chamadas diretas.
- Exibir a mensagem solicitada após o envio e em tentativas de alteração não autorizadas.
- Permitir que ADM edite e exclua abastecimentos e demais registros operacionais, sempre com motivo obrigatório. Toda ação deve preservar na auditoria uma cópia completa anterior e posterior; em exclusões, registrar a cópia anterior completa e estado posterior ausente. Remoções administrativas devem preservar a rastreabilidade e não provocar exclusões em cascata de históricos ou contas.
- Auditoria é exceção: nem ADM pode alterá-la ou apagá-la pela aplicação. A operação e sua auditoria devem ocorrer na mesma transação; falha na auditoria impede a edição/exclusão.

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
- Incluir as tabelas de veículos e motoristas quando forem criadas na etapa posterior de cadastros; não inventar veículos, motoristas ou informações reais para preencher os arquivos.
- Exportar dados de usuários necessários para conferência, nunca senhas, hashes, tokens, sessões ou chaves privadas. As tabelas internas do serviço de autenticação não serão exportadas integralmente.
- Manter o Excel operacional limpo separado da exportação administrativa completa. A exportação administrativa pode conter campos de anexos existentes; não será um backup dos arquivos das fotos.

## 5. Pendências já solicitadas
- Concluir o mapeamento de colunas e normalização dos nomes legados de tanques na importação XLSX/CSV.
- Ampliar seletores e indicadores para Ipiranga/Itaquera, preservando Leste/Norte como locais independentes.
- Mostrar consumo em litros, média em litros por veículo e filtro por base, sem confundir consumo com medição do tanque.
- Criar cadastros permanentes de **veículos** (placa única em maiúsculas, tipo e capacidade) e **motoristas**, com seleção em lista nos formulários, sem fabricar cadastros a partir de informações incompletas.
- Aplicar no banco as validações dos lançamentos: litros maiores que zero, hodômetro não inferior ao último do mesmo veículo, data não futura, identificador de reenvio único e valores numeric/decimal. Usar America/Sao_Paulo para entrada e exibição das datas, mantendo instantes armazenados com fuso.
- Preservar históricos que não atendam às novas regras; analisar e adaptar os dados antes de validar novas restrições. Comparações de hodômetro e duplicidade devem ser protegidas contra lançamentos simultâneos; definir o tratamento de importações históricas sem invalidá-las indevidamente.

## 6. Conferência, documentação e recuperação
- Documentar tabelas, relacionamentos, acesso autorizado pelo painel do Lovable Cloud, exportação e conferência de persistência.
- Verificar quais backups, retenção e restauração são efetivamente oferecidos/configurados. Informar dependências de plano ou configuração manual; não afirmar que exportações substituem backup restaurável.
- Testar permissões com ADM e colaborador, bloqueio de chamadas diretas, desativação, correções auditadas, reenvios, persistência após nova entrada e sincronização entre duas sessões. Validar também entrada por usuário curto, unicidade do usuário, os dois formulários de criação, confirmação extra de ADM, proibição de mudança do próprio tipo, proteção concorrente do último ADM ativo, último acesso e auditoria de todas as ações de conta.
- Validar importação, exportações completas e ausência de credenciais nos arquivos. Não publicar ou declarar operação em produção antes da validação.

## Execução por etapas — implementar somente a Etapa 1
- **Etapa 1:** login, persistência/renovação de sessão, bloqueio de tentativas, perfis, autorização no banco, Gerenciar Usuários e auditoria. Incluir edição/exclusão administrativa auditada dos registros existentes para comprovar o teste solicitado, mantendo colaboradores sem edição/exclusão.
- Ao concluir, apresentar as políticas RLS de **todas as tabelas da aplicação**, as políticas de acesso aos anexos e o inventário das **funções do banco com privilégio elevado**, incluindo finalidade, permissões de execução e verificações de autorização. Mostrar o resultado **passou, falhou ou não verificado** de cada teste abaixo, com evidência. Se faltar uma conta, configuração ou condição de teste, explicar o impedimento e nunca declarar que passou:
  1. Visitante sem login não lê dados da aplicação.
  2. Colaborador não edita nem exclui, inclusive por chamada direta.
  3. Colaborador não acessa Gerenciar Usuários nem suas operações diretas.
  4. Usuário desativado perde imediatamente autorização; medir também o encerramento da tela conectada.
  5. Último ADM ativo não pode ser desativado ou rebaixado, inclusive com ações simultâneas.
  6. Sessão continua aberta após fechar e reabrir o navegador com o mesmo perfil de armazenamento; verificar renovação e não confundir esse teste com comprovação de 30 dias decorridos.
  7. Exclusão por ADM exige motivo e grava cópia completa na auditoria imutável.
  8. Cadastro público e login anônimo estão desativados no serviço e rejeitam chamadas diretas.
  9. Política de senha, Alterar minha senha e troca inicial obrigatória funcionam nos caminhos suportados; listar limitações observadas.
  10. Bloqueio de cinco minutos ocorre após cinco erros e não pode ser contornado pelo caminho direto de autenticação sem que a limitação seja informada.
- Usar **somente registros novos identificados como teste** nos testes de edição/exclusão; não editar ou excluir os 677 registros existentes nem presumir que registros antigos marcados como teste podem ser descartados.
- O identificador solicitado “TESTE” não atende à validação atual de placa. Usar “TESTE” como identificação do cenário, com `is_test=true` e placa válida reservada para o ensaio, como `TST1A23`, sem enfraquecer a regra de placas de produção. Documentar no relatório a identificação e os registros criados para o teste. Contas de teste serão criadas pelo fluxo administrativo e identificadas no relatório, sem revelar senhas.
- **Ponto de parada obrigatório:** aguardar sua validação da Etapa 1 antes de iniciar as próximas.
- **Etapas posteriores, ainda não autorizadas:** remoção do campo de última entrega, cadastros de veículos/motoristas e validações de lançamentos, medições/homepage, indicadores/importação pendentes, exportação administrativa e documentação/recuperação completa. Preservar essas solicitações no plano, sem implementá-las junto com a Etapa 1.

## Detalhes técnicos
- Migrações aditivas, com políticas RLS e permissões explícitas. Nenhuma remoção de tabelas, registros ou colunas históricas durante a implantação; exclusões posteriores solicitadas por ADM somente pelo fluxo autorizado com motivo e auditoria completa.
- `public.profiles` para dados de conta e `public.user_roles` para papéis protegidos; autorização baseada em identidade validada, nunca em armazenamento do navegador ou metadados editáveis do usuário.
- Adaptar o usuário curto dos auxiliares ao serviço de autenticação existente com identificador interno derivado do usuário normalizado, único e sem exigir e-mail real do auxiliar. Provisionar essas contas somente pelo fluxo administrativo; não habilitar confirmação automática global para endereços reais. Não criar autenticação paralela nem validar senha manualmente; credenciais continuam sob responsabilidade do serviço de autenticação. Recuperação do auxiliar será feita por ADM, pois o identificador interno não recebe e-mails. Respostas de entrada não devem revelar se uma conta existe.
- Validar tipo e estado ativo no banco em cada operação protegida. Bloquear usuários desativados mesmo com sessão anterior válida; efetuar mudanças de tipo e proteção do último ADM ativo com controle transacional, não apenas checagem da interface.
- Registrar último acesso após autenticação confirmada pelo serviço, usando horário confiável do servidor. Provisionamento e redefinições devem auditar resultados confirmados, sem armazenar ou devolver senhas, hashes ou tokens em perfis, registros de auditoria ou exportações.
- Funções autenticadas do servidor para provisionamento e ações administrativas. Verificar ADM antes de qualquer acesso privilegiado.
- Auditoria gerada no banco para operações importantes, sem permissões de alteração/exclusão pela aplicação, inclusive para ADM.
- Revisar também as funções existentes que executam com privilégios elevados: cada uma deve validar conta ativa e autorização, para que a importação legada não contorne as novas políticas. Bloquear edição/exclusão direta sem motivo, inclusive por ADM; usar operações transacionais auditadas para essas ações.
- Para dispensar a última entrega obrigatória sem apagar a estrutura antiga, adicionar um campo opcional sucessor, preservar/backfill do histórico e deixar a coluna antiga documentada como legada; novos pedidos não devem receber datas falsas.
- Consultas paginadas com ordenação estável e campos autorizados para exportação; proteção contra fórmulas maliciosas em CSV e serialização de arrays/objetos.

## Dependências para concluir a implantação
- Ativação/verificação da conta administrativa pelo titular e confirmação de entrega dos e-mails de acesso.
- Validação dos recursos reais de backup e restauração disponíveis no Lovable Cloud.
- Liberação de fotos públicas permanece pendente de administrador do workspace; manter fotos privadas enquanto isso.